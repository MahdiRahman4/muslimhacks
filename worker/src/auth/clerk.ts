import { createClerkClient, verifyToken } from "@clerk/backend";
import type { Env } from "../env";
import type { AuthUser, Role } from "./types";
import { bearerToken } from "./jwt";

interface ClerkIdentity {
  clerkId: string;
  email: string;
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

  return { clerkId: clerkUserId, email };
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
    return byClerk;
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
    return byEmail;
  }

  const id = crypto.randomUUID();
  const createdAt = Date.now();

  await env.DB.prepare(
    "INSERT INTO users (id, clerk_id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(id, identity.clerkId, identity.email, "", "applicant", createdAt)
    .run();

  return { id, email: identity.email, role: "applicant" };
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

    const identity = await resolveClerkIdentity(env, clerkUserId);
    if (!identity) {
      console.error("[clerk auth] could not resolve Clerk user email", clerkUserId);
      return null;
    }

    return ensureUserForClerk(env, identity);
  } catch (error) {
    console.error("[clerk auth] token verification threw", error);
    return null;
  }
}
