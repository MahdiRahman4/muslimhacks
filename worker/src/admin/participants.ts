import type { Env } from "../env";
import { readJson, requireAdmin, type JsonResponder } from "./auth";
import { respondEventOpsError } from "./event-ops-errors";
import {
  buildListQuery,
  buildOrderBy,
  parseListFilters,
  parseSort,
} from "./participant-list-query";
import type { AuthUser } from "../auth/types";
import {
  isMealKey,
  MEAL_KEYS,
  type ParticipantMealRow,
  type ParticipantRow,
} from "../participants/service";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function toParticipantSummary(row: ParticipantRow) {
  return {
    id: row.id,
    user_id: row.user_id,
    application_id: row.application_id,
    full_name: row.full_name,
    email: row.email,
    gender: row.gender,
    public_checkin_code: row.public_checkin_code,
    checkin_status: row.checkin_status,
    checked_in_at: row.checked_in_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function toParticipantDetail(row: ParticipantRow, meals: ParticipantMealRow[]) {
  return {
    ...toParticipantSummary(row),
    checked_in_by: row.checked_in_by,
    meals: meals.map((meal) => ({
      id: meal.id,
      meal_key: meal.meal_key,
      claimed_by: meal.claimed_by,
      claimed_at: meal.claimed_at,
    })),
  };
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

async function getParticipantById(
  env: Env,
  participantId: string,
): Promise<ParticipantRow | null> {
  return env.DB.prepare("SELECT * FROM participants WHERE id = ? LIMIT 1")
    .bind(participantId)
    .first<ParticipantRow>();
}

async function getParticipantMeals(
  env: Env,
  participantId: string,
): Promise<ParticipantMealRow[]> {
  const result = await env.DB.prepare(
    "SELECT * FROM participant_meals WHERE participant_id = ? ORDER BY claimed_at ASC",
  )
    .bind(participantId)
    .all<ParticipantMealRow>();

  return result.results ?? [];
}

async function markParticipantCheckedIn(
  env: Env,
  participant: ParticipantRow,
  admin: AuthUser,
): Promise<ParticipantRow | null> {
  if (participant.checkin_status === "checked_in") {
    return participant;
  }

  const now = Date.now();
  await env.DB.prepare(
    `UPDATE participants
     SET checkin_status = 'checked_in', checked_in_at = ?, checked_in_by = ?, updated_at = ?
     WHERE id = ?`,
  )
    .bind(now, admin.id, now, participant.id)
    .run();

  return getParticipantById(env, participant.id);
}

async function handleListParticipants(
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

  const filters = parseListFilters(url);
  if ("error" in filters) {
    return respond({ error: filters.error }, 400);
  }

  const sort = parseSort(url);
  if ("error" in sort) {
    return respond({ error: sort.error }, 400);
  }

  const { where, binds } = buildListQuery(filters);
  const orderBy = buildOrderBy(sort.sortBy, sort.sortOrder);

  const countRow = await env.DB.prepare(
    `SELECT COUNT(*) AS total FROM participants p ${where}`,
  )
    .bind(...binds)
    .first<{ total: number }>();

  const rows = await env.DB.prepare(
    `SELECT p.* FROM participants p ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
  )
    .bind(...binds, pagination.limit, pagination.offset)
    .all<ParticipantRow>();

  return respond({
    participants: (rows.results ?? []).map(toParticipantSummary),
    pagination: {
      limit: pagination.limit,
      offset: pagination.offset,
      total: countRow?.total ?? 0,
    },
    sort: {
      sort_by: sort.sortBy,
      sort_order: sort.sortOrder,
    },
  });
}

async function handleGetParticipant(
  request: Request,
  env: Env,
  respond: JsonResponder,
  participantId: string,
): Promise<Response> {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }

  const participant = await getParticipantById(env, participantId);
  if (!participant) {
    return respond({ error: "Participant not found" }, 404);
  }

  const meals = await getParticipantMeals(env, participantId);
  return respond({ participant: toParticipantDetail(participant, meals) });
}

async function handleCheckinParticipant(
  request: Request,
  env: Env,
  respond: JsonResponder,
  participantId: string,
): Promise<Response> {
  const admin = await requireAdmin(request, env, respond);
  if (admin instanceof Response) {
    return admin;
  }

  const participant = await getParticipantById(env, participantId);
  if (!participant) {
    return respond({ error: "Participant not found" }, 404);
  }

  if (participant.checkin_status === "checked_in") {
    return respondEventOpsError(respond, "already_checked_in", {
      participant: toParticipantSummary(participant),
    });
  }

  const updated = await markParticipantCheckedIn(env, participant, admin);
  if (!updated) {
    return respond({ error: "Failed to check in participant" }, 500);
  }

  return respond({ participant: toParticipantSummary(updated) });
}

async function handleCheckinByCode(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
  const admin = await requireAdmin(request, env, respond);
  if (admin instanceof Response) {
    return admin;
  }

  const body = await readJson(request);
  if (!body || typeof body !== "object") {
    return respond({ error: "Invalid JSON body" }, 400);
  }

  const input = body as Record<string, unknown>;
  const rawCode =
    (typeof input.public_checkin_code === "string" && input.public_checkin_code) ||
    (typeof input.qr_code_value === "string" && input.qr_code_value) ||
    (typeof input.code === "string" && input.code) ||
    "";

  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return respond({ error: "public_checkin_code or code is required" }, 400);
  }

  const participant = await env.DB.prepare(
    "SELECT * FROM participants WHERE public_checkin_code = ? LIMIT 1",
  )
    .bind(code)
    .first<ParticipantRow>();

  if (!participant) {
    return respondEventOpsError(respond, "invalid_checkin_code");
  }

  if (participant.checkin_status === "checked_in") {
    return respondEventOpsError(respond, "already_checked_in", {
      participant: toParticipantSummary(participant),
    });
  }

  const updated = await markParticipantCheckedIn(env, participant, admin);
  if (!updated) {
    return respond({ error: "Failed to check in participant" }, 500);
  }

  return respond({ participant: toParticipantSummary(updated) });
}

async function handleClaimMeal(
  request: Request,
  env: Env,
  respond: JsonResponder,
  participantId: string,
  mealKey: string,
): Promise<Response> {
  const admin = await requireAdmin(request, env, respond);
  if (admin instanceof Response) {
    return admin;
  }

  if (!isMealKey(mealKey)) {
    return respondEventOpsError(respond, "invalid_meal_key", {
      allowed: MEAL_KEYS,
    });
  }

  const participant = await getParticipantById(env, participantId);
  if (!participant) {
    return respond({ error: "Participant not found" }, 404);
  }

  if (participant.checkin_status !== "checked_in") {
    return respondEventOpsError(respond, "not_checked_in", {
      participant: toParticipantSummary(participant),
    });
  }

  const existing = await env.DB.prepare(
    "SELECT id FROM participant_meals WHERE participant_id = ? AND meal_key = ? LIMIT 1",
  )
    .bind(participantId, mealKey)
    .first();

  if (existing) {
    return respondEventOpsError(respond, "meal_already_claimed", {
      meal_key: mealKey,
      participant: toParticipantSummary(participant),
    });
  }

  const mealCount = await env.DB.prepare(
    "SELECT COUNT(*) AS total FROM participant_meals WHERE participant_id = ?",
  )
    .bind(participantId)
    .first<{ total: number }>();

  if ((mealCount?.total ?? 0) >= 5) {
    return respondEventOpsError(respond, "meal_limit_reached", {
      participant: toParticipantSummary(participant),
    });
  }

  const now = Date.now();
  const mealId = crypto.randomUUID();

  await env.DB.prepare(
    `INSERT INTO participant_meals (id, participant_id, meal_key, claimed_by, claimed_at)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(mealId, participantId, mealKey, admin.id, now)
    .run();

  const meal = await env.DB.prepare("SELECT * FROM participant_meals WHERE id = ? LIMIT 1")
    .bind(mealId)
    .first<ParticipantMealRow>();

  return respond(
    {
      meal: meal
        ? {
            id: meal.id,
            participant_id: meal.participant_id,
            meal_key: meal.meal_key,
            claimed_by: meal.claimed_by,
            claimed_at: meal.claimed_at,
          }
        : null,
    },
    201,
  );
}

export async function handleAdminParticipantRoutes(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response | null> {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;

  if (pathname === "/api/admin/participants" && method === "GET") {
    return handleListParticipants(request, env, respond);
  }

  if (pathname === "/api/admin/participants/checkin/by-code" && method === "POST") {
    return handleCheckinByCode(request, env, respond);
  }

  const mealMatch = pathname.match(/^\/api\/admin\/participants\/([^/]+)\/meals\/([^/]+)\/claim$/);
  if (mealMatch && method === "POST") {
    return handleClaimMeal(request, env, respond, mealMatch[1], mealMatch[2]);
  }

  const checkinMatch = pathname.match(/^\/api\/admin\/participants\/([^/]+)\/checkin$/);
  if (checkinMatch && method === "POST") {
    return handleCheckinParticipant(request, env, respond, checkinMatch[1]);
  }

  const detailMatch = pathname.match(/^\/api\/admin\/participants\/([^/]+)$/);
  if (detailMatch && method === "GET") {
    return handleGetParticipant(request, env, respond, detailMatch[1]);
  }

  return null;
}
