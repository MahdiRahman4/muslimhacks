import type { Env } from "../env";
import { requireAdmin, readJson, escapeLike, type JsonResponder } from "./auth";
import type { ApplicationRow, ApplicationStatus } from "../applications/types";
import {
  ensureParticipantForApprovedApplication,
} from "../participants/service";
import {
  resumeFilenameFromKey,
  streamResumeFromR2,
} from "../applications/routes";
import {
  buildCsv,
  csvDownloadResponse,
  exportFilename,
  formatCsvBoolean,
  formatCsvTimestamp,
} from "./csv";

type ReviewStatus = "pending" | "approved" | "rejected";

interface ApplicationReviewRow {
  id: string;
  application_id: string;
  reviewed_by: string;
  score: number | null;
  notes: string | null;
  status: ReviewStatus;
  created_at: number;
}

interface ApplicationWithEmail extends ApplicationRow {
  email: string;
  reviewed_by: string | null;
  reviewed_at: number | null;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const MAX_NOTES = 5000;
const REVIEW_STATUSES: ReviewStatus[] = ["pending", "approved", "rejected"];

function toApplicationSummary(row: ApplicationWithEmail) {
  return {
    id: row.id,
    user_id: row.user_id,
    email: row.email,
    full_name: row.full_name,
    phone: row.phone,
    school: row.school,
    program: row.program,
    graduation_year: row.graduation_year,
    gender: row.gender,
    status: row.status,
    needs_travel_support: row.needs_travel_support === 1,
    first_hackathon: row.first_hackathon === null ? null : row.first_hackathon === 1,
    cs_career: row.cs_career === null ? null : row.cs_career === 1,
    reviewed_by: row.reviewed_by,
    reviewed_at: row.reviewed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function toApplicationDetail(row: ApplicationWithEmail) {
  return {
    ...toApplicationSummary(row),
    github_url: row.github_url,
    linkedin_url: row.linkedin_url,
    portfolio_url: row.portfolio_url,
    resume_url: row.resume_url,
    resume_key: row.resume_key,
    why_join: row.why_join,
    project_idea: row.project_idea,
    dietary_restrictions: row.dietary_restrictions,
    accessibility: row.accessibility,
    motivation: row.motivation,
    past_project: row.past_project,
    interests: row.interests,
    community: row.community,
  };
}

function toReviewResponse(row: ApplicationReviewRow, reviewerEmail?: string) {
  return {
    id: row.id,
    application_id: row.application_id,
    reviewed_by: row.reviewed_by,
    reviewer_email: reviewerEmail ?? null,
    score: row.score,
    notes: row.notes,
    status: row.status,
    created_at: row.created_at,
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

function parseListFilters(url: URL): { error: string } | ListFilters {
  const status = url.searchParams.get("status");
  const gender = url.searchParams.get("gender");
  const search = url.searchParams.get("search")?.trim() ?? "";

  if (status && !(["draft", "pending", "approved", "rejected"] as ApplicationStatus[]).includes(status as ApplicationStatus)) {
    return { error: "Invalid status filter" };
  }

  if (gender && gender.length > 50) {
    return { error: "Invalid gender filter" };
  }

  if (search.length > 100) {
    return { error: "search must be at most 100 characters" };
  }

  return {
    status: status as ApplicationStatus | null,
    gender: gender || null,
    search: search || null,
  };
}

interface ListFilters {
  status: ApplicationStatus | null;
  gender: string | null;
  search: string | null;
}

function buildListQuery(filters: ListFilters): {
  where: string;
  binds: (string | number)[];
} {
  const clauses: string[] = [];
  const binds: (string | number)[] = [];

  if (filters.status) {
    clauses.push("a.status = ?");
    binds.push(filters.status);
  }

  if (filters.gender) {
    clauses.push("a.gender = ?");
    binds.push(filters.gender);
  }

  if (filters.search) {
    const pattern = `%${escapeLike(filters.search)}%`;
    clauses.push("(a.full_name LIKE ? ESCAPE '\\' OR u.email LIKE ? ESCAPE '\\')");
    binds.push(pattern, pattern);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

  return { where, binds };
}

async function handleListApplications(
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

  const { where, binds } = buildListQuery(filters);

  const countRow = await env.DB.prepare(
    `SELECT COUNT(*) AS total
     FROM applications a
     JOIN users u ON u.id = a.user_id
     ${where}`,
  )
    .bind(...binds)
    .first<{ total: number }>();

  const rows = await env.DB.prepare(
    `SELECT a.*, u.email
     FROM applications a
     JOIN users u ON u.id = a.user_id
     ${where}
     ORDER BY a.updated_at DESC
     LIMIT ? OFFSET ?`,
  )
    .bind(...binds, pagination.limit, pagination.offset)
    .all<ApplicationWithEmail>();

  return respond({
    applications: (rows.results ?? []).map(toApplicationSummary),
    pagination: {
      limit: pagination.limit,
      offset: pagination.offset,
      total: countRow?.total ?? 0,
    },
  });
}

async function getApplicationWithEmail(
  env: Env,
  applicationId: string,
): Promise<ApplicationWithEmail | null> {
  return env.DB.prepare(
    `SELECT a.*, u.email
     FROM applications a
     JOIN users u ON u.id = a.user_id
     WHERE a.id = ?
     LIMIT 1`,
  )
    .bind(applicationId)
    .first<ApplicationWithEmail>();
}

async function handleGetApplication(
  request: Request,
  env: Env,
  respond: JsonResponder,
  applicationId: string,
): Promise<Response> {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }

  const application = await getApplicationWithEmail(env, applicationId);
  if (!application) {
    return respond({ error: "Application not found" }, 404);
  }

  const reviews = await env.DB.prepare(
    `SELECT r.*, u.email AS reviewer_email
     FROM application_reviews r
     JOIN users u ON u.id = r.reviewed_by
     WHERE r.application_id = ?
     ORDER BY r.created_at DESC`,
  )
    .bind(applicationId)
    .all<ApplicationReviewRow & { reviewer_email: string }>();

  return respond({
    application: toApplicationDetail(application),
    reviews: (reviews.results ?? []).map((row) =>
      toReviewResponse(row, row.reviewer_email),
    ),
  });
}

function validateReviewBody(
  body: unknown,
): { ok: true; data: { score: number | null; notes: string | null; status: ReviewStatus } } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body" };
  }

  const input = body as Record<string, unknown>;

  if (typeof input.status !== "string" || !REVIEW_STATUSES.includes(input.status as ReviewStatus)) {
    return { ok: false, error: "status must be one of: pending, approved, rejected" };
  }

  let score: number | null = null;
  if (input.score !== undefined && input.score !== null && input.score !== "") {
    const parsed = typeof input.score === "number" ? input.score : Number(input.score);
    if (!Number.isFinite(parsed)) {
      return { ok: false, error: "score must be a number" };
    }
    score = Math.round(parsed);
  }

  let notes: string | null = null;
  if (input.notes !== undefined && input.notes !== null && input.notes !== "") {
    if (typeof input.notes !== "string") {
      return { ok: false, error: "notes must be a string" };
    }
    const trimmed = input.notes.trim();
    if (trimmed.length > MAX_NOTES) {
      return { ok: false, error: `notes must be at most ${MAX_NOTES} characters` };
    }
    notes = trimmed || null;
  }

  return {
    ok: true,
    data: {
      score,
      notes,
      status: input.status as ReviewStatus,
    },
  };
}

async function handleReviewApplication(
  request: Request,
  env: Env,
  respond: JsonResponder,
  applicationId: string,
): Promise<Response> {
  const admin = await requireAdmin(request, env, respond);
  if (admin instanceof Response) {
    return admin;
  }

  const application = await env.DB.prepare("SELECT id FROM applications WHERE id = ? LIMIT 1")
    .bind(applicationId)
    .first();

  if (!application) {
    return respond({ error: "Application not found" }, 404);
  }

  const body = await readJson(request);
  if (body === null) {
    return respond({ error: "Invalid JSON body" }, 400);
  }

  const validated = validateReviewBody(body);
  if (!validated.ok) {
    return respond({ error: validated.error }, 400);
  }

  const now = Date.now();
  const reviewId = crypto.randomUUID();
  const { score, notes, status } = validated.data;

  await env.DB.prepare(
    `INSERT INTO application_reviews (
      id, application_id, reviewed_by, score, notes, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(reviewId, applicationId, admin.id, score, notes, status, now)
    .run();

  await env.DB.prepare(
    `UPDATE applications
     SET status = ?, reviewed_by = ?, reviewed_at = ?, updated_at = ?
     WHERE id = ?`,
  )
    .bind(status, admin.id, now, now, applicationId)
    .run();

  let participant = null;
  if (status === "approved") {
    participant = await ensureParticipantForApprovedApplication(env, applicationId);
  }

  const review = await env.DB.prepare(
    "SELECT * FROM application_reviews WHERE id = ? LIMIT 1",
  )
    .bind(reviewId)
    .first<ApplicationReviewRow>();

  const updated = await getApplicationWithEmail(env, applicationId);

  return respond({
    application: updated ? toApplicationDetail(updated) : null,
    review: review ? toReviewResponse(review, admin.email) : null,
    participant: participant
      ? {
          id: participant.id,
          public_checkin_code: participant.public_checkin_code,
          checkin_status: participant.checkin_status,
        }
      : null,
  }, 201);
}

const APPLICATION_EXPORT_HEADERS = [
  "id",
  "user_id",
  "email",
  "full_name",
  "phone",
  "school",
  "program",
  "graduation_year",
  "gender",
  "github_url",
  "linkedin_url",
  "portfolio_url",
  "resume_filename",
  "resume_download_path",
  "dietary_restrictions",
  "accessibility",
  "needs_travel_support",
  "first_hackathon",
  "cs_career",
  "why_join",
  "project_idea",
  "motivation",
  "past_project",
  "interests",
  "community",
  "status",
  "created_at",
  "updated_at",
];

function formatNullableBool(value: number | null): string {
  if (value === null) {
    return "";
  }
  return formatCsvBoolean(value);
}

function applicationToCsvRow(row: ApplicationWithEmail): unknown[] {
  const resumeKey = row.resume_key;
  return [
    row.id,
    row.user_id,
    row.email,
    row.full_name,
    row.phone,
    row.school,
    row.program,
    row.graduation_year,
    row.gender,
    row.github_url,
    row.linkedin_url,
    row.portfolio_url,
    resumeKey ? resumeFilenameFromKey(resumeKey) : "",
    resumeKey ? `/api/admin/applications/${row.id}/resume` : "",
    row.dietary_restrictions,
    row.accessibility,
    formatCsvBoolean(row.needs_travel_support),
    formatNullableBool(row.first_hackathon),
    formatNullableBool(row.cs_career),
    row.why_join,
    row.project_idea,
    row.motivation,
    row.past_project,
    row.interests,
    row.community,
    row.status,
    formatCsvTimestamp(row.created_at),
    formatCsvTimestamp(row.updated_at),
  ];
}

async function handleExportApplications(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }

  const url = new URL(request.url);
  const filters = parseListFilters(url);
  if ("error" in filters) {
    return respond({ error: filters.error }, 400);
  }

  const { where, binds } = buildListQuery(filters);
  const rows = await env.DB.prepare(
    `SELECT a.*, u.email
     FROM applications a
     JOIN users u ON u.id = a.user_id
     ${where}
     ORDER BY a.updated_at DESC`,
  )
    .bind(...binds)
    .all<ApplicationWithEmail>();

  const csv = buildCsv(
    APPLICATION_EXPORT_HEADERS,
    (rows.results ?? []).map(applicationToCsvRow),
  );

  return csvDownloadResponse(
    exportFilename("applications-export"),
    csv,
    env.CORS_ORIGIN || "*",
    request.headers.get("Origin"),
  );
}

async function handleAdminGetResume(
  request: Request,
  env: Env,
  respond: JsonResponder,
  applicationId: string,
): Promise<Response> {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }

  const application = await getApplicationWithEmail(env, applicationId);
  if (!application?.resume_key) {
    return respond({ error: "Resume not found" }, 404);
  }

  const fileResponse = await streamResumeFromR2(env, application.resume_key);
  if (!fileResponse) {
    return respond({ error: "Resume not found" }, 404);
  }

  // Attach CORS so browser can open the PDF in a new tab from the admin UI
  const origin = env.CORS_ORIGIN || "*";
  const requestOrigin = request.headers.get("Origin");
  const allowOrigin =
    origin === "*" || (requestOrigin && requestOrigin === origin)
      ? requestOrigin ?? origin
      : origin;
  const headers = new Headers(fileResponse.headers);
  headers.set("Access-Control-Allow-Origin", allowOrigin);

  return new Response(fileResponse.body, {
    status: 200,
    headers,
  });
}

export async function handleAdminApplicationRoutes(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response | null> {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;

  if (pathname === "/api/admin/applications" && method === "GET") {
    return handleListApplications(request, env, respond);
  }

  // Must be before the /:id detail route so "export" is not treated as an id
  if (pathname === "/api/admin/applications/export" && method === "GET") {
    return handleExportApplications(request, env, respond);
  }

  const resumeMatch = pathname.match(
    /^\/api\/admin\/applications\/([^/]+)\/resume$/,
  );
  if (resumeMatch && method === "GET") {
    return handleAdminGetResume(request, env, respond, resumeMatch[1]);
  }

  const detailMatch = pathname.match(/^\/api\/admin\/applications\/([^/]+)$/);
  if (detailMatch && method === "GET") {
    return handleGetApplication(request, env, respond, detailMatch[1]);
  }

  const reviewMatch = pathname.match(/^\/api\/admin\/applications\/([^/]+)\/review$/);
  if (reviewMatch && method === "POST") {
    return handleReviewApplication(request, env, respond, reviewMatch[1]);
  }

  return null;
}
