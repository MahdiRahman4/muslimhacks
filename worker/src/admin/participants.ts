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
  type MealKey,
  type ParticipantMealRow,
  type ParticipantRow,
} from "../participants/service";
import { assignFoodWaveAtCheckin, foodWaveFromKey, type FoodWave } from "../participants/food-wave";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function toParticipantSummary(
  row: ParticipantRow,
  claimedMeals: MealKey[] = [],
  foodWave: FoodWave | null = null,
) {
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
    claimed_meals: claimedMeals,
    food_wave: foodWave,
  };
}

function toParticipantDetail(
  row: ParticipantRow,
  meals: ParticipantMealRow[],
  foodWave: FoodWave | null = null,
) {
  return {
    ...toParticipantSummary(
      row,
      meals.map((meal) => meal.meal_key),
      foodWave,
    ),
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

async function getClaimedMealsByParticipantIds(
  env: Env,
  participantIds: string[],
): Promise<Map<string, MealKey[]>> {
  const claimed = new Map<string, MealKey[]>();
  if (participantIds.length === 0) {
    return claimed;
  }

  const placeholders = participantIds.map(() => "?").join(",");
  const result = await env.DB.prepare(
    `SELECT participant_id, meal_key FROM participant_meals WHERE participant_id IN (${placeholders})`,
  )
    .bind(...participantIds)
    .all<{ participant_id: string; meal_key: MealKey }>();

  for (const row of result.results ?? []) {
    const list = claimed.get(row.participant_id) ?? [];
    list.push(row.meal_key);
    claimed.set(row.participant_id, list);
  }

  return claimed;
}

async function getParticipantMealKeys(env: Env, participantId: string): Promise<MealKey[]> {
  const result = await env.DB.prepare(
    "SELECT meal_key FROM participant_meals WHERE participant_id = ?",
  )
    .bind(participantId)
    .all<{ meal_key: MealKey }>();
  return (result.results ?? []).map((row) => row.meal_key);
}

async function participantSummaryPayload(env: Env, row: ParticipantRow) {
  const claimedMeals = await getParticipantMealKeys(env, row.id);
  return toParticipantSummary(row, claimedMeals, foodWaveFromKey(row.food_wave_key));
}

async function markParticipantCheckedIn(
  env: Env,
  participant: ParticipantRow,
  admin: AuthUser,
): Promise<{ participant: ParticipantRow; alreadyCheckedIn: boolean } | null> {
  let current = participant;
  let alreadyCheckedIn = participant.checkin_status === "checked_in";

  if (!alreadyCheckedIn) {
    const now = Date.now();
    const result = await env.DB.prepare(
      `UPDATE participants
       SET checkin_status = 'checked_in', checked_in_at = ?, checked_in_by = ?, updated_at = ?
       WHERE id = ? AND checkin_status = 'not_checked_in'`,
    )
      .bind(now, admin.id, now, participant.id)
      .run();

    const updated = await getParticipantById(env, participant.id);
    if (!updated) {
      return null;
    }

    current = updated;
    alreadyCheckedIn = (result.meta.changes ?? 0) === 0;
  }

  const foodWave = await assignFoodWaveAtCheckin(env, current.id, current.food_wave_key);
  current = {
    ...current,
    food_wave_key: foodWave?.key ?? current.food_wave_key ?? null,
  };

  return { participant: current, alreadyCheckedIn };
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

  const participants = rows.results ?? [];
  const claimedById = await getClaimedMealsByParticipantIds(
    env,
    participants.map((row) => row.id),
  );

  return respond({
    participants: participants.map((row) =>
      toParticipantSummary(
        row,
        claimedById.get(row.id) ?? [],
        foodWaveFromKey(row.food_wave_key),
      ),
    ),
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
  return respond({
    participant: toParticipantDetail(
      participant,
      meals,
      foodWaveFromKey(participant.food_wave_key),
    ),
  });
}

async function respondCheckedIn(
  env: Env,
  respond: JsonResponder,
  admin: AuthUser,
  participant: ParticipantRow,
): Promise<Response> {
  const checkedIn = await markParticipantCheckedIn(env, participant, admin);
  if (!checkedIn) {
    return respond({ error: "Failed to check in participant" }, 500);
  }

  return respond({
    participant: await participantSummaryPayload(env, checkedIn.participant),
    ...(checkedIn.alreadyCheckedIn
      ? { already_checked_in: true, message: "Already checked in" }
      : {}),
  });
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

  return respondCheckedIn(env, respond, admin, participant);
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

  return respondCheckedIn(env, respond, admin, participant);
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
      participant: await participantSummaryPayload(env, participant),
    });
  }

  const now = Date.now();
  const mealId = crypto.randomUUID();
  const insert = await env.DB.prepare(
    `INSERT OR IGNORE INTO participant_meals (id, participant_id, meal_key, claimed_by, claimed_at)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(mealId, participantId, mealKey, admin.id, now)
    .run();

  if ((insert.meta.changes ?? 0) === 0) {
    return respondEventOpsError(respond, "meal_already_claimed", { meal_key: mealKey });
  }

  return respond(
    {
      meal: {
        id: mealId,
        participant_id: participantId,
        meal_key: mealKey,
        claimed_by: admin.id,
        claimed_at: now,
      },
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
