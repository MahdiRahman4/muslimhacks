import type { Env } from "../env";
import type { AuthUser } from "../auth/types";
import { requireAdmin, type JsonResponder } from "./auth";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export type AdminAction = "participant_deleted";

interface AdminActionLogRow {
  id: string;
  action: string;
  actor_user_id: string | null;
  actor_email: string | null;
  actor_name: string | null;
  target_type: string;
  target_id: string;
  target_label: string | null;
  details: string | null;
  created_at: number;
}

/**
 * Records who did what, and when. Never throws: losing the audit row is bad,
 * but failing the volunteer's action because the log write failed is worse.
 */
export async function logAdminAction(
  env: Env,
  actor: AuthUser,
  entry: {
    action: AdminAction;
    targetType: string;
    targetId: string;
    targetLabel?: string | null;
    details?: unknown;
  },
): Promise<number> {
  const now = Date.now();

  try {
    await env.DB.prepare(
      `INSERT INTO admin_action_log
         (id, action, actor_user_id, actor_email, actor_name, target_type, target_id, target_label, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        crypto.randomUUID(),
        entry.action,
        actor.id,
        actor.email,
        actor.full_name ?? null,
        entry.targetType,
        entry.targetId,
        entry.targetLabel ?? null,
        entry.details === undefined ? null : JSON.stringify(entry.details),
        now,
      )
      .run();
  } catch (error) {
    console.error("Failed to write admin action log", entry.action, error);
  }

  return now;
}

function toActionLogPayload(row: AdminActionLogRow) {
  let details: unknown = null;
  if (row.details) {
    try {
      details = JSON.parse(row.details);
    } catch {
      details = row.details;
    }
  }

  return {
    id: row.id,
    action: row.action,
    actor: {
      user_id: row.actor_user_id,
      email: row.actor_email,
      name: row.actor_name,
    },
    target: {
      type: row.target_type,
      id: row.target_id,
      label: row.target_label,
    },
    details,
    created_at: row.created_at,
  };
}

async function handleListActionLog(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
  const admin = await requireAdmin(request, env, respond);
  if (admin instanceof Response) {
    return admin;
  }

  const url = new URL(request.url);
  const limitRaw = url.searchParams.get("limit");
  const limit = limitRaw === null ? DEFAULT_LIMIT : Number(limitRaw);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    return respond({ error: `limit must be an integer between 1 and ${MAX_LIMIT}` }, 400);
  }

  const action = url.searchParams.get("action");
  const clauses: string[] = [];
  const binds: unknown[] = [];
  if (action) {
    clauses.push("action = ?");
    binds.push(action);
  }
  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

  const rows = await env.DB.prepare(
    `SELECT * FROM admin_action_log ${where} ORDER BY created_at DESC LIMIT ?`,
  )
    .bind(...binds, limit)
    .all<AdminActionLogRow>();

  return respond({ entries: (rows.results ?? []).map(toActionLogPayload) });
}

export async function handleAdminActionLogRoutes(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response | null> {
  const { pathname } = new URL(request.url);

  if (pathname === "/api/admin/action-log" && request.method === "GET") {
    return handleListActionLog(request, env, respond);
  }

  return null;
}
