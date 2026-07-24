import type { Env } from "../env";
import { requireAdmin, type JsonResponder } from "./auth";
import { MEAL_KEYS } from "../participants/service";

async function handleEventOpsSummary(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }

  const totals = await env.DB.prepare(
    `SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN checkin_status = 'checked_in' THEN 1 ELSE 0 END) AS checked_in,
      SUM(CASE WHEN checkin_status = 'not_checked_in' THEN 1 ELSE 0 END) AS not_checked_in
     FROM participants`,
  ).first<{ total: number; checked_in: number; not_checked_in: number }>();

  const mealRows = await env.DB.prepare(
    "SELECT meal_key, COUNT(*) AS total FROM participant_meals GROUP BY meal_key",
  ).all<{ meal_key: string; total: number }>();

  const mealsClaimedByKey = Object.fromEntries(
    MEAL_KEYS.map((mealKey) => [mealKey, 0]),
  ) as Record<string, number>;

  for (const row of mealRows.results ?? []) {
    mealsClaimedByKey[row.meal_key] = row.total;
  }

  return respond({
    participants: {
      total: totals?.total ?? 0,
      checked_in: totals?.checked_in ?? 0,
      not_checked_in: totals?.not_checked_in ?? 0,
    },
    meals_claimed_by_key: mealsClaimedByKey,
  });
}

export async function handleAdminEventOpsRoutes(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response | null> {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;

  if (pathname === "/api/admin/event-ops/summary" && method === "GET") {
    return handleEventOpsSummary(request, env, respond);
  }

  return null;
}
