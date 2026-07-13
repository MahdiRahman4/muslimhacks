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

export async function ensureUserForClerk(
  env: Env,
  identity: ClerkIdentity,
): Promise<AuthUser> {
  const byClerk = await env.DB.prepare(
    "SELECT id, email, role FROM users WHERE clerk_id = ? LIMIT 1",
  )
    .bind(identity.clerkId)
    .first<{ id: string; email: string; role: Role }>();

  if (byClerk) {
    return { ...byClerk, full_name: identity.fullName };
  }

  const byEmail = await env.DB.prepare(
    "SELECT id, email, role FROM users WHERE email = ? LIMIT 1",
  )
    .bind(identity.email)
    .first<{ id: string; email: string; role: Role }>();

  if (byEmail) {
    await env.DB.prepare("UPDATE users SET clerk_id = ? WHERE id = ?")
      .bind(identity.clerkId, byEmail.id)
      .run();
    return { ...byEmail, full_name: identity.fullName };
  }

  const id = crypto.randomUUID();
  const createdAt = Date.now();

  await env.DB.prepare(
    "INSERT INTO users (id, clerk_id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(id, identity.clerkId, identity.email, "", "applicant", createdAt)
    .run();

  return {
    id,
    email: identity.email,
    role: "applicant",
    full_name: identity.fullName,
  };
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

  logTokenArrival(token, request);

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

    const identity = await resolveClerkIdentity(env, clerkUserId);
    if (!identity) {
      console.error("[clerk auth] could not resolve Clerk user email", clerkUserId);
      return null;
    }

    return ensureUserForClerk(env, identity);
  } catch (error) {
    console.error("[clerk auth] token verification threw", error);
    logTokenDiagnostics(token);
    return null;
  }
}

/** Compact one-liner on every auth attempt: token age at arrival. */
function logTokenArrival(token: string, request: Request): void {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64)) as { iat?: number; exp?: number };
    const now = Date.now();
    const ageSeconds = Math.round((now - (payload.iat ?? 0) * 1000) / 1000);
    const remainingSeconds = Math.round(((payload.exp ?? 0) * 1000 - now) / 1000);
    console.log(
      `[clerk auth] token arrived for ${new URL(request.url).pathname}: ` +
        `age=${ageSeconds}s remaining=${remainingSeconds}s`,
    );
  } catch {
    console.log("[clerk auth] token arrived but could not be decoded");
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
