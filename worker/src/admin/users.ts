import type { Env } from "../env";
import { requireAdmin, escapeLike, type JsonResponder } from "./auth";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export interface AdminUserWithoutApplication {
  id: string;
  email: string;
  role: string;
  created_at: number;
}

function parsePagination(url: URL): { limit: number; offset: number } | { error: string } {
  const limitRaw = url.searchParams.get("limit");
  const offsetRaw = url.searchParams.get("offset");

  const limit = limitRaw === null ? DEFAULT_LIMIT : Number(limitRaw);
  const offset = offsetRaw === null ? 0 : Number(offsetRaw);

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    return { error: `limit must be an integer between 1 and ${MAX_LIMIT}` };
  }
  if (!Number.isInteger(offset) || offset < 0) {
    return { error: "offset must be a non-negative integer" };
  }

  return { limit, offset };
}

function parseSortOrder(url: URL): "ASC" | "DESC" | { error: string } {
  const raw = url.searchParams.get("sort_order") ?? "desc";
  if (raw !== "asc" && raw !== "desc") {
    return { error: "sort_order must be asc or desc" };
  }
  return raw === "asc" ? "ASC" : "DESC";
}

async function handleListUsersWithoutApplication(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }

  const url = new URL(request.url);
  const pagination = parsePagination(url);
  if ("error" in pagination) {
    return respond({ error: pagination.error }, 400);
  }

  const sortOrder = parseSortOrder(url);
  if (typeof sortOrder !== "string") {
    return respond({ error: sortOrder.error }, 400);
  }

  const search = url.searchParams.get("search")?.trim() ?? "";
  if (search.length > 100) {
    return respond({ error: "search must be at most 100 characters" }, 400);
  }

  const clauses = ["a.id IS NULL", "u.role = 'applicant'"];
  const binds: (string | number)[] = [];

  if (search) {
    clauses.push("u.email LIKE ? ESCAPE '\\'");
    binds.push(`%${escapeLike(search)}%`);
  }

  const where = `WHERE ${clauses.join(" AND ")}`;

  const countRow = await env.DB.prepare(
    `SELECT COUNT(*) AS total
     FROM users u
     LEFT JOIN applications a ON a.user_id = u.id
     ${where}`,
  )
    .bind(...binds)
    .first<{ total: number }>();

  const rows = await env.DB.prepare(
    `SELECT u.id, u.email, u.role, u.created_at
     FROM users u
     LEFT JOIN applications a ON a.user_id = u.id
     ${where}
     ORDER BY u.created_at ${sortOrder}, u.id ${sortOrder}
     LIMIT ? OFFSET ?`,
  )
    .bind(...binds, pagination.limit, pagination.offset)
    .all<AdminUserWithoutApplication>();

  return respond({
    users: rows.results ?? [],
    pagination: {
      limit: pagination.limit,
      offset: pagination.offset,
      total: countRow?.total ?? 0,
    },
  });
}

export async function handleAdminUserRoutes(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response | null> {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;

  if (pathname === "/api/admin/users/not-applied" && method === "GET") {
    return handleListUsersWithoutApplication(request, env, respond);
  }

  return null;
}
