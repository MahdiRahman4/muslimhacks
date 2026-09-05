import type { Env } from "./env";
import { handleAdminRoutes } from "./admin/routes";
import { handleApplicationRoutes } from "./applications/routes";
import { handleAuthRoutes } from "./auth/routes";
import { handleChallengeRoutes } from "./challenges/routes";
import { handleParticipantRoutes } from "./participants/routes";
import { authenticate } from "./auth/middleware";
import { corsHeaders } from "./cors";

export type { Env } from "./env";

const JSON_HEADERS = { "Content-Type": "application/json" };

function jsonResponse(
  body: unknown,
  status: number,
  origin: string,
  requestOrigin: string | null,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...corsHeaders(origin, requestOrigin),
    },
  });
}

function notImplemented(
  area: string,
  pathname: string,
  method: string,
  origin: string,
  requestOrigin: string | null,
): Response {
  return jsonResponse(
    { error: "Not implemented", area, path: pathname, method },
    501,
    origin,
    requestOrigin,
  );
}

async function checkDb(env: Env): Promise<boolean> {
  try {
    await env.DB.prepare("SELECT 1").first();
    return true;
  } catch {
    return false;
  }
}

async function dispatch(
  request: Request,
  env: Env,
  origin: string,
  requestOrigin: string | null,
): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;

  const respond = (body: unknown, status = 200) =>
    jsonResponse(body, status, origin, requestOrigin);

  if (pathname.startsWith("/api/auth/") || pathname.startsWith("/api/users/")) {
    return handleAuthRoutes(request, env, respond);
  }

  if (pathname.startsWith("/api/applications/") || pathname === "/api/applications") {
    const user = await authenticate(request, env);
    return handleApplicationRoutes(request, env, respond, user);
  }

  if (pathname.startsWith("/api/participants/")) {
    const user = await authenticate(request, env);
    return handleParticipantRoutes(request, env, respond, user);
  }

  if (pathname.startsWith("/api/challenges")) {
    const user = await authenticate(request, env);
    return handleChallengeRoutes(request, env, respond, user);
  }

  if (pathname.startsWith("/api/admin/")) {
    return handleAdminRoutes(request, env, respond);
  }

  if (pathname.startsWith("/api/ops/")) {
    return notImplemented("ops", pathname, method, origin, requestOrigin);
  }

  return jsonResponse({ error: "Not found" }, 404, origin, requestOrigin);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = env.CORS_ORIGIN || "*";
    const requestOrigin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, requestOrigin),
      });
    }

    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      const dbOk = await checkDb(env);
      return jsonResponse({ ok: true, db: dbOk }, 200, origin, requestOrigin);
    }

    try {
      return await dispatch(request, env, origin, requestOrigin);
    } catch (error) {
      // An escaping error gets Cloudflare's own 500, which carries no CORS
      // headers, so the browser hides it from the page as a network failure
      // and the user is told to check their connection. Answering here keeps
      // the real status readable and puts the cause in the logs.
      console.error(
        "[unhandled]",
        request.method,
        url.pathname,
        error instanceof Error ? error.stack || error.message : error,
      );
      return jsonResponse(
        { error: "Something went wrong on our end. Please try again." },
        500,
        origin,
        requestOrigin,
      );
    }
  },
};
