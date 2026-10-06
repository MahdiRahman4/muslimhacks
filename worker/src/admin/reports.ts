import type { Env } from "../env";
import { requireAdmin, type JsonResponder } from "./auth";
import { buildApplicationsCsv } from "./applications";
import { buildChallengePicksCsv } from "./challenges";
import {
  buildCsv,
  csvDownloadResponse,
  exportFilename,
  formatCsvBoolean,
  formatCsvTimestamp,
  zipDownloadResponse,
} from "./csv";
import { zipTextFiles } from "./zip";
import {
  buildListQuery,
  buildOrderBy,
  parseListFilters,
  parseSort,
} from "./participant-list-query";
import { MEAL_KEYS } from "../participants/service";

interface ParticipantExportRow {
  id: string;
  user_id: string;
  application_id: string;
  full_name: string;
  email: string;
  gender: string | null;
  public_checkin_code: string;
  checkin_status: string;
  checked_in_at: number | null;
  checked_in_by: string | null;
  created_at: number;
  updated_at: number;
  breakfast_day1_claimed: number;
  lunch_day1_claimed: number;
  dinner_day1_claimed: number;
  breakfast_day2_claimed: number;
  lunch_day2_claimed: number;
}

const PARTICIPANT_EXPORT_HEADERS = [
  "participant_id",
  "user_id",
  "application_id",
  "full_name",
  "email",
  "gender",
  "public_checkin_code",
  "checkin_status",
  "checked_in_at",
  "checked_in_by",
  "created_at",
  "updated_at",
  "breakfast_day1_claimed",
  "lunch_day1_claimed",
  "dinner_day1_claimed",
  "breakfast_day2_claimed",
  "lunch_day2_claimed",
];

function participantToCsvRow(row: ParticipantExportRow): unknown[] {
  return [
    row.id,
    row.user_id,
    row.application_id,
    row.full_name,
    row.email,
    row.gender,
    row.public_checkin_code,
    row.checkin_status,
    formatCsvTimestamp(row.checked_in_at),
    row.checked_in_by,
    formatCsvTimestamp(row.created_at),
    formatCsvTimestamp(row.updated_at),
    formatCsvBoolean(row.breakfast_day1_claimed),
    formatCsvBoolean(row.lunch_day1_claimed),
    formatCsvBoolean(row.dinner_day1_claimed),
    formatCsvBoolean(row.breakfast_day2_claimed),
    formatCsvBoolean(row.lunch_day2_claimed),
  ];
}

async function fetchParticipantsForExport(
  env: Env,
  url: URL,
): Promise<{ error: string; status: number } | ParticipantExportRow[]> {
  const filters = parseListFilters(url);
  if ("error" in filters) {
    return { error: filters.error, status: 400 };
  }

  const sort = parseSort(url);
  if ("error" in sort) {
    return { error: sort.error, status: 400 };
  }

  const { where, binds } = buildListQuery(filters);
  const orderBy = buildOrderBy(sort.sortBy, sort.sortOrder);

  const mealSelects = MEAL_KEYS.map(
    (mealKey) =>
      `MAX(CASE WHEN pm.meal_key = '${mealKey}' THEN 1 ELSE 0 END) AS ${mealKey}_claimed`,
  ).join(",\n      ");

  const result = await env.DB.prepare(
    `SELECT
      p.id,
      p.user_id,
      p.application_id,
      p.full_name,
      p.email,
      p.gender,
      p.public_checkin_code,
      p.checkin_status,
      p.checked_in_at,
      p.checked_in_by,
      p.created_at,
      p.updated_at,
      ${mealSelects}
     FROM participants p
     LEFT JOIN participant_meals pm ON pm.participant_id = p.id
     ${where}
     GROUP BY p.id
     ORDER BY ${orderBy}`,
  )
    .bind(...binds)
    .all<ParticipantExportRow>();

  return result.results ?? [];
}

function participantsCsv(rows: ParticipantExportRow[]): string {
  return buildCsv(PARTICIPANT_EXPORT_HEADERS, rows.map(participantToCsvRow));
}

async function handleParticipantsExport(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }

  const url = new URL(request.url);
  const rows = await fetchParticipantsForExport(env, url);
  if (!Array.isArray(rows)) {
    return respond({ error: rows.error }, rows.status);
  }

  return csvDownloadResponse(
    exportFilename("participants-export"),
    participantsCsv(rows),
    env.CORS_ORIGIN || "*",
    request.headers.get("Origin"),
  );
}

async function handleCheckinsExport(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }

  return csvDownloadResponse(
    exportFilename("checkins-export"),
    await buildCheckinsCsv(env),
    env.CORS_ORIGIN || "*",
    request.headers.get("Origin"),
  );
}

async function buildCheckinsCsv(env: Env): Promise<string> {
  const result = await env.DB.prepare(
    `SELECT id, full_name, email, public_checkin_code, checked_in_at, checked_in_by
     FROM participants
     WHERE checkin_status = 'checked_in'
     ORDER BY checked_in_at ASC`,
  ).all<{
    id: string;
    full_name: string;
    email: string;
    public_checkin_code: string;
    checked_in_at: number | null;
    checked_in_by: string | null;
  }>();

  return buildCsv(
    [
      "participant_id",
      "full_name",
      "email",
      "public_checkin_code",
      "checked_in_at",
      "checked_in_by",
    ],
    (result.results ?? []).map((row) => [
      row.id,
      row.full_name,
      row.email,
      row.public_checkin_code,
      formatCsvTimestamp(row.checked_in_at),
      row.checked_in_by,
    ]),
  );
}

async function handleMealsExport(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }

  return csvDownloadResponse(
    exportFilename("meal-claims-export"),
    await buildMealsCsv(env),
    env.CORS_ORIGIN || "*",
    request.headers.get("Origin"),
  );
}

async function buildMealsCsv(env: Env): Promise<string> {
  const result = await env.DB.prepare(
    `SELECT
      pm.id AS meal_claim_id,
      pm.participant_id,
      p.full_name,
      p.email,
      pm.meal_key,
      pm.claimed_at,
      pm.claimed_by
     FROM participant_meals pm
     JOIN participants p ON p.id = pm.participant_id
     ORDER BY pm.claimed_at ASC`,
  ).all<{
    meal_claim_id: string;
    participant_id: string;
    full_name: string;
    email: string;
    meal_key: string;
    claimed_at: number;
    claimed_by: string;
  }>();

  return buildCsv(
    [
      "meal_claim_id",
      "participant_id",
      "full_name",
      "email",
      "meal_key",
      "claimed_at",
      "claimed_by",
    ],
    (result.results ?? []).map((row) => [
      row.meal_claim_id,
      row.participant_id,
      row.full_name,
      row.email,
      row.meal_key,
      formatCsvTimestamp(row.claimed_at),
      row.claimed_by,
    ]),
  );
}

/** One zip with every admin CSV, so you can hand someone the files without an admin login. */
async function handleAllReportsExport(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }

  const participantRows = await fetchParticipantsForExport(
    env,
    new URL("https://muslimhacks.ca/api/admin/participants/export"),
  );
  if (!Array.isArray(participantRows)) {
    return respond({ error: participantRows.error }, participantRows.status);
  }

  const [applications, checkins, meals, challenges] = await Promise.all([
    buildApplicationsCsv(env),
    buildCheckinsCsv(env),
    buildMealsCsv(env),
    buildChallengePicksCsv(env),
  ]);

  const zip = zipTextFiles([
    { name: "applications.csv", content: applications },
    { name: "participants.csv", content: participantsCsv(participantRows) },
    { name: "checkins.csv", content: checkins },
    { name: "meal-claims.csv", content: meals },
    { name: "challenge-picks.csv", content: challenges },
  ]);

  return zipDownloadResponse(
    exportFilename("muslimhacks-reports", "zip"),
    zip,
    env.CORS_ORIGIN || "*",
    request.headers.get("Origin"),
  );
}

export async function handleAdminReportRoutes(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response | null> {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;

  if (pathname === "/api/admin/participants/export" && method === "GET") {
    return handleParticipantsExport(request, env, respond);
  }

  if (pathname === "/api/admin/reports/checkins/export" && method === "GET") {
    return handleCheckinsExport(request, env, respond);
  }

  if (pathname === "/api/admin/reports/meals/export" && method === "GET") {
    return handleMealsExport(request, env, respond);
  }

  if (pathname === "/api/admin/reports/all/export" && method === "GET") {
    return handleAllReportsExport(request, env, respond);
  }

  return null;
}
