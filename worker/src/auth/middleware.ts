import type { Env } from "../env";
import { bearerToken, verifyToken } from "./jwt";
import type { AuthUser, Role } from "./types";

export async function authenticate(request: Request, env: Env): Promise<AuthUser | null> {
  const token = bearerToken(request);
  if (!token || !env.JWT_SECRET) {
    return null;
  }

  const payload = await verifyToken(token, env.JWT_SECRET);
  if (!payload) {
    return null;
  }

  const row = await env.DB.prepare(
    "SELECT id, email, role FROM users WHERE id = ? LIMIT 1",
  )
    .bind(payload.sub)
    .first<{ id: string; email: string; role: Role }>();

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    role: row.role,
  };
}

export function hasRole(user: AuthUser, role: Role): boolean {
  return user.role === role;
}

export function hasAnyRole(user: AuthUser, roles: Role[]): boolean {
  return roles.includes(user.role);
}

export function isAdmin(user: AuthUser): boolean {
  return hasRole(user, "admin");
}

export function isVolunteer(user: AuthUser): boolean {
  return hasRole(user, "volunteer");
}

export function isApplicant(user: AuthUser): boolean {
  return hasRole(user, "applicant");
}

export function requireRole(user: AuthUser, ...roles: Role[]): boolean {
  return hasAnyRole(user, roles);
}
