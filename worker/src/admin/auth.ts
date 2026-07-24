import type { Env } from "../env";
import { authenticate, requireRole } from "../auth/middleware";
import type { AuthUser } from "../auth/types";

export type JsonResponder = (body: unknown, status?: number) => Response;

export async function requireAdmin(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<AuthUser | Response> {
  const user = await authenticate(request, env);
  if (!user) {
    return respond({ error: "Unauthorized" }, 401);
  }
  if (!requireRole(user, "admin")) {
    return respond({ error: "Forbidden" }, 403);
  }
  return user;
}

export async function readJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, (char) => `\\${char}`);
}
