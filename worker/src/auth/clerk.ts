import { createClerkClient, verifyToken } from "@clerk/backend";
import type { Env } from "../env";
import type { AuthUser, Role } from "./types";
import { bearerToken } from "./jwt";

interface ClerkIdentity {
  clerkId: string;
  email: string;
  fullName: string | null;
}

function clerkFullName(clerkUser: {
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
}): string | null {
  const fromParts = [clerkUser.firstName, clerkUser.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const name = fromParts || clerkUser.fullName?.trim() || "";
  return name || null;
}

async function resolveClerkIdentity(
  env: Env,
  clerkUserId: string,
): Promise<ClerkIdentity | null> {
  const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
  const clerkUser = await clerk.users.getUser(clerkUserId);
  const primaryId = clerkUser.primaryEmailAddressId;
  const primary = clerkUser.emailAddresses.find((entry) => entry.id === primaryId);
  const email = (
    primary?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress
  )?.toLowerCase();

  if (!email) {
    return null;
  }

  return {
    clerkId: clerkUserId,
    email,
    fullName: clerkFullName(clerkUser),
  };
}

type UserRow = { id: string; email: string; role: Role };

function selectUser(env: Env, column: "clerk_id" | "email", value: string) {
  return env.DB.prepare(`SELECT id, email, role FROM users WHERE ${column} = ? LIMIT 1`)
    .bind(value)
    .first<UserRow>();
}

/**
 * A single page load fires several authenticated requests at once, so someone
 * signing in for the first time races against themselves here. Every write is
 * written to tolerate a concurrent winner: a UNIQUE violation would escape as
 * an unhandled exception, and Cloudflare's default 500 carries no CORS
 * headers, which the browser reports to the user as a network failure rather
 * than a server error.
 */
export async function ensureUserForClerk(
  env: Env,
  identity: ClerkIdentity,
): Promise<AuthUser> {
  const byClerk = await selectUser(env, "clerk_id", identity.clerkId);
  if (byClerk) {
    return { ...byClerk, full_name: identity.fullName };
  }

  const byEmail = await selectUser(env, "email", identity.email);
  if (byEmail) {
    // Relink if this email was first created against a different Clerk
    // instance (test vs live) or if clerk_id was never set.
    await env.DB.prepare("UPDATE users SET clerk_id = ? WHERE id = ?")
      .bind(identity.clerkId, byEmail.id)
      .run();
    return { ...byEmail, full_name: identity.fullName };
  }

  await env.DB.prepare(
    `INSERT INTO users (id, clerk_id, email, password_hash, role, created_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT DO NOTHING`,
  )
    .bind(
      crypto.randomUUID(),
      identity.clerkId,
      identity.email,
      "",
      "applicant",
      Date.now(),
    )
    .run();

  // Re-read rather than trusting the insert: it is skipped when a concurrent
  // request created the row first.
  const settled =
    (await selectUser(env, "clerk_id", identity.clerkId)) ??
    (await selectUser(env, "email", identity.email));

  if (!settled) {
    throw new Error(`could not resolve user row for clerk id ${identity.clerkId}`);
  }

  return { ...settled, full_name: identity.fullName };
}

export async function authenticateClerk(
  request: Request,
  env: Env,
): Promise<AuthUser | null> {
  if (!env.CLERK_SECRET_KEY) {
    console.error("[clerk auth] CLERK_SECRET_KEY is missing");
    return null;
  }

  const token = bearerToken(request);
  if (!token) {
    console.log("[clerk auth] no bearer token on request", new URL(request.url).pathname);
    return null;
  }

  try {
    // @clerk/backend v3 verifyToken returns the JwtPayload directly and
    // throws when the token is invalid/expired.
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    const clerkUserId = payload.sub;
    if (!clerkUserId) {
      console.error("[clerk auth] verified token missing sub");
      return null;
    }

    // Event-day hot path: known staff already have a D1 row. Skip Clerk's
    // users.getUser HTTP call on every scan.
    const existing = await selectUser(env, "clerk_id", clerkUserId);
    if (existing) {
      return { ...existing, full_name: null };
    }

    const identity = await resolveClerkIdentity(env, clerkUserId);
    if (!identity) {
      console.error("[clerk auth] could not resolve Clerk user email", clerkUserId);
      return null;
    }

    // Awaited so a rejection lands in the catch below instead of escaping as
    // an unhandled 500.
    return await ensureUserForClerk(env, identity);
  } catch (error) {
    console.error("[clerk auth] token verification threw", error);
    logTokenDiagnostics(token);
    return null;
  }
}

/**
 * On verification failure, decode (NOT verify) the JWT and log its
 * timestamps vs this machine's clock, to distinguish a stale token
 * (token was old when sent) from clock drift (machine time is wrong).
 */
function logTokenDiagnostics(token: string): void {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64)) as {
      iat?: number;
      exp?: number;
      iss?: string;
      azp?: string;
      sub?: string;
    };
    const nowMs = Date.now();
    const iatMs = (payload.iat ?? 0) * 1000;
    const expMs = (payload.exp ?? 0) * 1000;

    console.error(
      "[clerk auth diagnostics]",
      JSON.stringify(
        {
          // Which Clerk instance minted this token. Must match the instance
          // of the CLERK_SECRET_KEY in worker/.dev.vars, otherwise the
          // frontend pk_ and backend sk_ are from different Clerk apps.
          token_issuer: payload.iss ?? "(missing)",
          // The frontend origin Clerk authorized this token for.
          token_authorized_party: payload.azp ?? "(missing)",
          token_subject: payload.sub ?? "(missing)",
          token_issued_at: new Date(iatMs).toISOString(),
          token_expires_at: new Date(expMs).toISOString(),
          machine_now: new Date(nowMs).toISOString(),
          token_lifetime_seconds: Math.round((expMs - iatMs) / 1000),
          token_age_seconds: Math.round((nowMs - iatMs) / 1000),
          expired_by_seconds: Math.round((nowMs - expMs) / 1000),
          verdict:
            nowMs - iatMs < 0
              ? "machine clock is BEHIND token issue time -> clock drift"
              : nowMs - iatMs > (expMs - iatMs)
                ? nowMs - iatMs > (expMs - iatMs) * 3
                  ? "token was already very old when sent -> stale/cached token on frontend"
                  : "token slightly too old -> clock drift or slow refresh"
                : "token is within lifetime -> not an expiry problem (check issuer/signature)",
        },
        null,
        2,
      ),
    );
  } catch {
    console.error("[clerk auth diagnostics] could not decode token for diagnostics");
  }
}
