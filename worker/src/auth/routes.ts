import type { Env } from "../env";
import { authenticate } from "./middleware";
import { getApplicationByUserId } from "../applications/routes";
import { toDashboardStatus } from "../applications/status";
import type { AuthUser } from "./types";

type JsonResponder = (body: unknown, status?: number) => Response;

function publicUser(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

async function handleMe(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
  const user = await authenticate(request, env);
  if (!user) {
    return respond({ error: "Unauthorized" }, 401);
  }

  return respond({ user: publicUser(user) });
}

async function handleUserSummary(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
  const user = await authenticate(request, env);
  if (!user) {
    return respond({ error: "Unauthorized" }, 401);
  }

  const application = await getApplicationByUserId(env, user.id);
  const dashboardStatus = toDashboardStatus(application?.status);

  return respond({
    user: publicUser(user),
    summary: {
      full_name: application?.full_name ?? null,
      has_application: Boolean(application),
      application_status: dashboardStatus,
      submitted_at: application?.updated_at ?? null,
    },
  });
}

export async function handleAuthRoutes(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;

  if (pathname === "/api/auth/me" && method === "GET") {
    return handleMe(request, env, respond);
  }

  if (pathname === "/api/users/me/summary" && method === "GET") {
    return handleUserSummary(request, env, respond);
  }

  if (
    (pathname === "/api/auth/register" || pathname === "/api/auth/login") &&
    method === "POST"
  ) {
    return respond(
      {
        error: "Email/password auth is disabled. Sign in with Clerk.",
        code: "auth_migrated_to_clerk",
      },
      410,
    );
  }

  return respond({ error: "Not found" }, 404);
}
