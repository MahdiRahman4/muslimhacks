var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/auth/jwt.ts
var TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
function base64UrlEncode(data) {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(base64UrlEncode, "base64UrlEncode");
function base64UrlDecode(value) {
  const padded = value + "=".repeat((4 - value.length % 4) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}
__name(base64UrlDecode, "base64UrlDecode");
async function hmacSign(data, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64UrlEncode(new Uint8Array(signature));
}
__name(hmacSign, "hmacSign");
async function hmacVerify(data, signature, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  return crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlDecode(signature),
    encoder.encode(data)
  );
}
__name(hmacVerify, "hmacVerify");
function isRole(value) {
  return value === "applicant" || value === "volunteer" || value === "admin";
}
__name(isRole, "isRole");
async function signToken(user, secret) {
  const now = Math.floor(Date.now() / 1e3);
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS
  };
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmacSign(`${header}.${body}`, secret);
  return `${header}.${body}.${signature}`;
}
__name(signToken, "signToken");
async function verifyToken(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }
  const [header, body, signature] = parts;
  const valid = await hmacVerify(`${header}.${body}`, signature, secret);
  if (!valid) {
    return null;
  }
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(body)));
    if (typeof payload.sub !== "string" || typeof payload.email !== "string" || !isRole(payload.role) || typeof payload.exp !== "number") {
      return null;
    }
    if (payload.exp < Math.floor(Date.now() / 1e3)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
__name(verifyToken, "verifyToken");
function bearerToken(request) {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice(7).trim();
  return token || null;
}
__name(bearerToken, "bearerToken");

// src/auth/middleware.ts
async function authenticate(request, env) {
  const token = bearerToken(request);
  if (!token || !env.JWT_SECRET) {
    return null;
  }
  const payload = await verifyToken(token, env.JWT_SECRET);
  if (!payload) {
    return null;
  }
  const row = await env.DB.prepare(
    "SELECT id, email, role FROM users WHERE id = ? LIMIT 1"
  ).bind(payload.sub).first();
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    email: row.email,
    role: row.role
  };
}
__name(authenticate, "authenticate");
function hasAnyRole(user, roles) {
  return roles.includes(user.role);
}
__name(hasAnyRole, "hasAnyRole");
function requireRole(user, ...roles) {
  return hasAnyRole(user, roles);
}
__name(requireRole, "requireRole");

// src/admin/auth.ts
async function requireAdmin(request, env, respond) {
  const user = await authenticate(request, env);
  if (!user) {
    return respond({ error: "Unauthorized" }, 401);
  }
  if (!requireRole(user, "admin")) {
    return respond({ error: "Forbidden" }, 403);
  }
  return user;
}
__name(requireAdmin, "requireAdmin");
async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
__name(readJson, "readJson");
function escapeLike(value) {
  return value.replace(/[%_\\]/g, (char) => `\\${char}`);
}
__name(escapeLike, "escapeLike");

// src/participants/service.ts
var MEAL_KEYS = [
  "breakfast_day1",
  "lunch_day1",
  "dinner_day1",
  "breakfast_day2",
  "lunch_day2"
];
function isMealKey(value) {
  return MEAL_KEYS.includes(value);
}
__name(isMealKey, "isMealKey");
function generateCheckinCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}
__name(generateCheckinCode, "generateCheckinCode");
async function ensureParticipantForApprovedApplication(env, applicationId) {
  const application = await env.DB.prepare(
    `SELECT a.id, a.user_id, a.full_name, a.gender, u.email
     FROM applications a
     JOIN users u ON u.id = a.user_id
     WHERE a.id = ?
     LIMIT 1`
  ).bind(applicationId).first();
  if (!application) {
    return null;
  }
  const existing = await env.DB.prepare(
    "SELECT * FROM participants WHERE user_id = ? LIMIT 1"
  ).bind(application.user_id).first();
  const now = Date.now();
  if (existing) {
    await env.DB.prepare(
      `UPDATE participants
       SET application_id = ?, full_name = ?, email = ?, gender = ?, updated_at = ?
       WHERE id = ?`
    ).bind(
      application.id,
      application.full_name,
      application.email,
      application.gender,
      now,
      existing.id
    ).run();
    return env.DB.prepare("SELECT * FROM participants WHERE id = ? LIMIT 1").bind(existing.id).first();
  }
  const id = crypto.randomUUID();
  let publicCheckinCode = generateCheckinCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const collision = await env.DB.prepare(
      "SELECT id FROM participants WHERE public_checkin_code = ? LIMIT 1"
    ).bind(publicCheckinCode).first();
    if (!collision) {
      break;
    }
    publicCheckinCode = generateCheckinCode();
  }
  await env.DB.prepare(
    `INSERT INTO participants (
      id, user_id, application_id, full_name, email, gender,
      public_checkin_code, checkin_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'not_checked_in', ?, ?)`
  ).bind(
    id,
    application.user_id,
    application.id,
    application.full_name,
    application.email,
    application.gender,
    publicCheckinCode,
    now,
    now
  ).run();
  return env.DB.prepare("SELECT * FROM participants WHERE id = ? LIMIT 1").bind(id).first();
}
__name(ensureParticipantForApprovedApplication, "ensureParticipantForApprovedApplication");

// src/admin/applications.ts
var DEFAULT_LIMIT = 20;
var MAX_LIMIT = 100;
var MAX_NOTES = 5e3;
var REVIEW_STATUSES = ["pending", "approved", "rejected"];
function toApplicationSummary(row) {
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
    reviewed_by: row.reviewed_by,
    reviewed_at: row.reviewed_at,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}
__name(toApplicationSummary, "toApplicationSummary");
function toApplicationDetail(row) {
  return {
    ...toApplicationSummary(row),
    github_url: row.github_url,
    linkedin_url: row.linkedin_url,
    portfolio_url: row.portfolio_url,
    resume_url: row.resume_url,
    why_join: row.why_join,
    project_idea: row.project_idea,
    dietary_restrictions: row.dietary_restrictions
  };
}
__name(toApplicationDetail, "toApplicationDetail");
function toReviewResponse(row, reviewerEmail) {
  return {
    id: row.id,
    application_id: row.application_id,
    reviewed_by: row.reviewed_by,
    reviewer_email: reviewerEmail ?? null,
    score: row.score,
    notes: row.notes,
    status: row.status,
    created_at: row.created_at
  };
}
__name(toReviewResponse, "toReviewResponse");
function parsePagination(url) {
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
__name(parsePagination, "parsePagination");
function parseListFilters(url) {
  const status = url.searchParams.get("status");
  const gender = url.searchParams.get("gender");
  const search = url.searchParams.get("search")?.trim() ?? "";
  if (status && !["draft", "pending", "approved", "rejected"].includes(status)) {
    return { error: "Invalid status filter" };
  }
  if (gender && gender.length > 50) {
    return { error: "Invalid gender filter" };
  }
  if (search.length > 100) {
    return { error: "search must be at most 100 characters" };
  }
  return {
    status,
    gender: gender || null,
    search: search || null
  };
}
__name(parseListFilters, "parseListFilters");
function buildListQuery(filters) {
  const clauses = [];
  const binds = [];
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
__name(buildListQuery, "buildListQuery");
async function handleListApplications(request, env, respond) {
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
     ${where}`
  ).bind(...binds).first();
  const rows = await env.DB.prepare(
    `SELECT a.*, u.email
     FROM applications a
     JOIN users u ON u.id = a.user_id
     ${where}
     ORDER BY a.updated_at DESC
     LIMIT ? OFFSET ?`
  ).bind(...binds, pagination.limit, pagination.offset).all();
  return respond({
    applications: (rows.results ?? []).map(toApplicationSummary),
    pagination: {
      limit: pagination.limit,
      offset: pagination.offset,
      total: countRow?.total ?? 0
    }
  });
}
__name(handleListApplications, "handleListApplications");
async function getApplicationWithEmail(env, applicationId) {
  return env.DB.prepare(
    `SELECT a.*, u.email
     FROM applications a
     JOIN users u ON u.id = a.user_id
     WHERE a.id = ?
     LIMIT 1`
  ).bind(applicationId).first();
}
__name(getApplicationWithEmail, "getApplicationWithEmail");
async function handleGetApplication(request, env, respond, applicationId) {
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
     ORDER BY r.created_at DESC`
  ).bind(applicationId).all();
  return respond({
    application: toApplicationDetail(application),
    reviews: (reviews.results ?? []).map(
      (row) => toReviewResponse(row, row.reviewer_email)
    )
  });
}
__name(handleGetApplication, "handleGetApplication");
function validateReviewBody(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body" };
  }
  const input = body;
  if (typeof input.status !== "string" || !REVIEW_STATUSES.includes(input.status)) {
    return { ok: false, error: "status must be one of: pending, approved, rejected" };
  }
  let score = null;
  if (input.score !== void 0 && input.score !== null && input.score !== "") {
    const parsed = typeof input.score === "number" ? input.score : Number(input.score);
    if (!Number.isFinite(parsed)) {
      return { ok: false, error: "score must be a number" };
    }
    score = Math.round(parsed);
  }
  let notes = null;
  if (input.notes !== void 0 && input.notes !== null && input.notes !== "") {
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
      status: input.status
    }
  };
}
__name(validateReviewBody, "validateReviewBody");
async function handleReviewApplication(request, env, respond, applicationId) {
  const admin = await requireAdmin(request, env, respond);
  if (admin instanceof Response) {
    return admin;
  }
  const application = await env.DB.prepare("SELECT id FROM applications WHERE id = ? LIMIT 1").bind(applicationId).first();
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(reviewId, applicationId, admin.id, score, notes, status, now).run();
  await env.DB.prepare(
    `UPDATE applications
     SET status = ?, reviewed_by = ?, reviewed_at = ?, updated_at = ?
     WHERE id = ?`
  ).bind(status, admin.id, now, now, applicationId).run();
  let participant = null;
  if (status === "approved") {
    participant = await ensureParticipantForApprovedApplication(env, applicationId);
  }
  const review = await env.DB.prepare(
    "SELECT * FROM application_reviews WHERE id = ? LIMIT 1"
  ).bind(reviewId).first();
  const updated = await getApplicationWithEmail(env, applicationId);
  return respond({
    application: updated ? toApplicationDetail(updated) : null,
    review: review ? toReviewResponse(review, admin.email) : null,
    participant: participant ? {
      id: participant.id,
      public_checkin_code: participant.public_checkin_code,
      checkin_status: participant.checkin_status
    } : null
  }, 201);
}
__name(handleReviewApplication, "handleReviewApplication");
async function handleAdminApplicationRoutes(request, env, respond) {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;
  if (pathname === "/api/admin/applications" && method === "GET") {
    return handleListApplications(request, env, respond);
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
__name(handleAdminApplicationRoutes, "handleAdminApplicationRoutes");

// src/admin/event-ops.ts
async function handleEventOpsSummary(request, env, respond) {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }
  const totals = await env.DB.prepare(
    `SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN checkin_status = 'checked_in' THEN 1 ELSE 0 END) AS checked_in,
      SUM(CASE WHEN checkin_status = 'not_checked_in' THEN 1 ELSE 0 END) AS not_checked_in
     FROM participants`
  ).first();
  const mealRows = await env.DB.prepare(
    "SELECT meal_key, COUNT(*) AS total FROM participant_meals GROUP BY meal_key"
  ).all();
  const mealsClaimedByKey = Object.fromEntries(
    MEAL_KEYS.map((mealKey) => [mealKey, 0])
  );
  for (const row of mealRows.results ?? []) {
    mealsClaimedByKey[row.meal_key] = row.total;
  }
  return respond({
    participants: {
      total: totals?.total ?? 0,
      checked_in: totals?.checked_in ?? 0,
      not_checked_in: totals?.not_checked_in ?? 0
    },
    meals_claimed_by_key: mealsClaimedByKey
  });
}
__name(handleEventOpsSummary, "handleEventOpsSummary");
async function handleAdminEventOpsRoutes(request, env, respond) {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;
  if (pathname === "/api/admin/event-ops/summary" && method === "GET") {
    return handleEventOpsSummary(request, env, respond);
  }
  return null;
}
__name(handleAdminEventOpsRoutes, "handleAdminEventOpsRoutes");

// src/admin/csv.ts
function escapeCsvValue(value) {
  if (value === null || value === void 0) {
    return "";
  }
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
__name(escapeCsvValue, "escapeCsvValue");
function formatCsvTimestamp(ms) {
  if (ms == null) {
    return "";
  }
  return new Date(ms).toISOString();
}
__name(formatCsvTimestamp, "formatCsvTimestamp");
function formatCsvBoolean(value) {
  if (value === true || value === 1) {
    return "yes";
  }
  return "no";
}
__name(formatCsvBoolean, "formatCsvBoolean");
function buildCsv(headers, rows) {
  const lines = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(","))
  ];
  return `${lines.join("\n")}
`;
}
__name(buildCsv, "buildCsv");
function csvDownloadResponse(filename, content, corsOrigin, requestOrigin) {
  const allowOrigin = corsOrigin === "*" || requestOrigin && requestOrigin === corsOrigin ? requestOrigin ?? corsOrigin : corsOrigin;
  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Expose-Headers": "Content-Disposition"
    }
  });
}
__name(csvDownloadResponse, "csvDownloadResponse");
function exportFilename(prefix) {
  const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  return `${prefix}-${date}.csv`;
}
__name(exportFilename, "exportFilename");

// src/admin/participant-list-query.ts
function parseListFilters2(url) {
  const gender = url.searchParams.get("gender");
  const search = url.searchParams.get("search")?.trim() ?? "";
  const checkedInRaw = url.searchParams.get("checked_in");
  if (gender && gender.length > 50) {
    return { error: "Invalid gender filter" };
  }
  if (search.length > 100) {
    return { error: "search must be at most 100 characters" };
  }
  let checkedIn = null;
  if (checkedInRaw === "true") {
    checkedIn = true;
  } else if (checkedInRaw === "false") {
    checkedIn = false;
  } else if (checkedInRaw !== null && checkedInRaw !== "") {
    return { error: "checked_in must be true or false" };
  }
  return {
    gender: gender || null,
    search: search || null,
    checkedIn
  };
}
__name(parseListFilters2, "parseListFilters");
function parseSort(url) {
  const sortByRaw = url.searchParams.get("sort_by") ?? "created_at";
  const sortOrderRaw = url.searchParams.get("sort_order") ?? "desc";
  if (sortByRaw !== "created_at" && sortByRaw !== "checked_in_at") {
    return { error: "sort_by must be created_at or checked_in_at" };
  }
  if (sortOrderRaw !== "asc" && sortOrderRaw !== "desc") {
    return { error: "sort_order must be asc or desc" };
  }
  return { sortBy: sortByRaw, sortOrder: sortOrderRaw };
}
__name(parseSort, "parseSort");
function buildOrderBy(sortBy, sortOrder) {
  const direction = sortOrder === "asc" ? "ASC" : "DESC";
  if (sortBy === "checked_in_at") {
    return `p.checked_in_at IS NULL, p.checked_in_at ${direction}, p.created_at DESC`;
  }
  return `p.created_at ${direction}`;
}
__name(buildOrderBy, "buildOrderBy");
function buildListQuery2(filters, tableAlias = "p") {
  const clauses = [];
  const binds = [];
  if (filters.checkedIn === true) {
    clauses.push(`${tableAlias}.checkin_status = 'checked_in'`);
  } else if (filters.checkedIn === false) {
    clauses.push(`${tableAlias}.checkin_status = 'not_checked_in'`);
  }
  if (filters.gender) {
    clauses.push(`${tableAlias}.gender = ?`);
    binds.push(filters.gender);
  }
  if (filters.search) {
    const pattern = `%${escapeLike(filters.search)}%`;
    clauses.push(
      `(${tableAlias}.full_name LIKE ? ESCAPE '\\' OR ${tableAlias}.email LIKE ? ESCAPE '\\')`
    );
    binds.push(pattern, pattern);
  }
  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, binds };
}
__name(buildListQuery2, "buildListQuery");

// src/admin/reports.ts
var PARTICIPANT_EXPORT_HEADERS = [
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
  "lunch_day2_claimed"
];
function participantToCsvRow(row) {
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
    formatCsvBoolean(row.lunch_day2_claimed)
  ];
}
__name(participantToCsvRow, "participantToCsvRow");
async function fetchParticipantsForExport(env, url) {
  const filters = parseListFilters2(url);
  if ("error" in filters) {
    return { error: filters.error, status: 400 };
  }
  const sort = parseSort(url);
  if ("error" in sort) {
    return { error: sort.error, status: 400 };
  }
  const { where, binds } = buildListQuery2(filters);
  const orderBy = buildOrderBy(sort.sortBy, sort.sortOrder);
  const mealSelects = MEAL_KEYS.map(
    (mealKey) => `MAX(CASE WHEN pm.meal_key = '${mealKey}' THEN 1 ELSE 0 END) AS ${mealKey}_claimed`
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
     ORDER BY ${orderBy}`
  ).bind(...binds).all();
  return result.results ?? [];
}
__name(fetchParticipantsForExport, "fetchParticipantsForExport");
async function handleParticipantsExport(request, env, respond) {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }
  const url = new URL(request.url);
  const rows = await fetchParticipantsForExport(env, url);
  if (!Array.isArray(rows)) {
    return respond({ error: rows.error }, rows.status);
  }
  const csv = buildCsv(
    PARTICIPANT_EXPORT_HEADERS,
    rows.map(participantToCsvRow)
  );
  return csvDownloadResponse(
    exportFilename("participants-export"),
    csv,
    env.CORS_ORIGIN || "*",
    request.headers.get("Origin")
  );
}
__name(handleParticipantsExport, "handleParticipantsExport");
async function handleCheckinsExport(request, env, respond) {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }
  const result = await env.DB.prepare(
    `SELECT id, full_name, email, public_checkin_code, checked_in_at, checked_in_by
     FROM participants
     WHERE checkin_status = 'checked_in'
     ORDER BY checked_in_at ASC`
  ).all();
  const headers = [
    "participant_id",
    "full_name",
    "email",
    "public_checkin_code",
    "checked_in_at",
    "checked_in_by"
  ];
  const csv = buildCsv(
    headers,
    (result.results ?? []).map((row) => [
      row.id,
      row.full_name,
      row.email,
      row.public_checkin_code,
      formatCsvTimestamp(row.checked_in_at),
      row.checked_in_by
    ])
  );
  return csvDownloadResponse(
    exportFilename("checkins-export"),
    csv,
    env.CORS_ORIGIN || "*",
    request.headers.get("Origin")
  );
}
__name(handleCheckinsExport, "handleCheckinsExport");
async function handleMealsExport(request, env, respond) {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }
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
     ORDER BY pm.claimed_at ASC`
  ).all();
  const headers = [
    "meal_claim_id",
    "participant_id",
    "full_name",
    "email",
    "meal_key",
    "claimed_at",
    "claimed_by"
  ];
  const csv = buildCsv(
    headers,
    (result.results ?? []).map((row) => [
      row.meal_claim_id,
      row.participant_id,
      row.full_name,
      row.email,
      row.meal_key,
      formatCsvTimestamp(row.claimed_at),
      row.claimed_by
    ])
  );
  return csvDownloadResponse(
    exportFilename("meal-claims-export"),
    csv,
    env.CORS_ORIGIN || "*",
    request.headers.get("Origin")
  );
}
__name(handleMealsExport, "handleMealsExport");
async function handleAdminReportRoutes(request, env, respond) {
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
  return null;
}
__name(handleAdminReportRoutes, "handleAdminReportRoutes");

// src/admin/event-ops-errors.ts
var EVENT_OPS_ERROR_CODES = {
  already_checked_in: {
    status: 409,
    error: "Participant is already checked in",
    code: "already_checked_in"
  },
  meal_already_claimed: {
    status: 409,
    error: "Meal already claimed for this participant",
    code: "meal_already_claimed"
  },
  meal_limit_reached: {
    status: 409,
    error: "Participant has already claimed the maximum of 5 meals",
    code: "meal_limit_reached"
  },
  invalid_checkin_code: {
    status: 404,
    error: "Invalid check-in code",
    code: "invalid_checkin_code"
  },
  not_checked_in: {
    status: 403,
    error: "Participant must be checked in before claiming meals",
    code: "not_checked_in"
  },
  invalid_meal_key: {
    status: 400,
    error: "Invalid mealKey",
    code: "invalid_meal_key"
  }
};
function respondEventOpsError(respond, code, extra) {
  const payload = EVENT_OPS_ERROR_CODES[code];
  return respond({ error: payload.error, code: payload.code, ...extra }, payload.status);
}
__name(respondEventOpsError, "respondEventOpsError");

// src/admin/participants.ts
var DEFAULT_LIMIT2 = 20;
var MAX_LIMIT2 = 100;
function toParticipantSummary(row) {
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
    updated_at: row.updated_at
  };
}
__name(toParticipantSummary, "toParticipantSummary");
function toParticipantDetail(row, meals) {
  return {
    ...toParticipantSummary(row),
    checked_in_by: row.checked_in_by,
    meals: meals.map((meal) => ({
      id: meal.id,
      meal_key: meal.meal_key,
      claimed_by: meal.claimed_by,
      claimed_at: meal.claimed_at
    }))
  };
}
__name(toParticipantDetail, "toParticipantDetail");
function parsePagination2(url) {
  const limitRaw = url.searchParams.get("limit");
  const offsetRaw = url.searchParams.get("offset");
  const limit = limitRaw === null ? DEFAULT_LIMIT2 : Number(limitRaw);
  const offset = offsetRaw === null ? 0 : Number(offsetRaw);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT2) {
    return { error: `limit must be an integer between 1 and ${MAX_LIMIT2}` };
  }
  if (!Number.isInteger(offset) || offset < 0) {
    return { error: "offset must be a non-negative integer" };
  }
  return { limit, offset };
}
__name(parsePagination2, "parsePagination");
async function getParticipantById(env, participantId) {
  return env.DB.prepare("SELECT * FROM participants WHERE id = ? LIMIT 1").bind(participantId).first();
}
__name(getParticipantById, "getParticipantById");
async function getParticipantMeals(env, participantId) {
  const result = await env.DB.prepare(
    "SELECT * FROM participant_meals WHERE participant_id = ? ORDER BY claimed_at ASC"
  ).bind(participantId).all();
  return result.results ?? [];
}
__name(getParticipantMeals, "getParticipantMeals");
async function markParticipantCheckedIn(env, participant, admin) {
  if (participant.checkin_status === "checked_in") {
    return participant;
  }
  const now = Date.now();
  await env.DB.prepare(
    `UPDATE participants
     SET checkin_status = 'checked_in', checked_in_at = ?, checked_in_by = ?, updated_at = ?
     WHERE id = ?`
  ).bind(now, admin.id, now, participant.id).run();
  return getParticipantById(env, participant.id);
}
__name(markParticipantCheckedIn, "markParticipantCheckedIn");
async function handleListParticipants(request, env, respond) {
  const auth = await requireAdmin(request, env, respond);
  if (auth instanceof Response) {
    return auth;
  }
  const url = new URL(request.url);
  const pagination = parsePagination2(url);
  if ("error" in pagination) {
    return respond({ error: pagination.error }, 400);
  }
  const filters = parseListFilters2(url);
  if ("error" in filters) {
    return respond({ error: filters.error }, 400);
  }
  const sort = parseSort(url);
  if ("error" in sort) {
    return respond({ error: sort.error }, 400);
  }
  const { where, binds } = buildListQuery2(filters);
  const orderBy = buildOrderBy(sort.sortBy, sort.sortOrder);
  const countRow = await env.DB.prepare(
    `SELECT COUNT(*) AS total FROM participants p ${where}`
  ).bind(...binds).first();
  const rows = await env.DB.prepare(
    `SELECT p.* FROM participants p ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`
  ).bind(...binds, pagination.limit, pagination.offset).all();
  return respond({
    participants: (rows.results ?? []).map(toParticipantSummary),
    pagination: {
      limit: pagination.limit,
      offset: pagination.offset,
      total: countRow?.total ?? 0
    },
    sort: {
      sort_by: sort.sortBy,
      sort_order: sort.sortOrder
    }
  });
}
__name(handleListParticipants, "handleListParticipants");
async function handleGetParticipant(request, env, respond, participantId) {
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
__name(handleGetParticipant, "handleGetParticipant");
async function handleCheckinParticipant(request, env, respond, participantId) {
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
      participant: toParticipantSummary(participant)
    });
  }
  const updated = await markParticipantCheckedIn(env, participant, admin);
  if (!updated) {
    return respond({ error: "Failed to check in participant" }, 500);
  }
  return respond({ participant: toParticipantSummary(updated) });
}
__name(handleCheckinParticipant, "handleCheckinParticipant");
async function handleCheckinByCode(request, env, respond) {
  const admin = await requireAdmin(request, env, respond);
  if (admin instanceof Response) {
    return admin;
  }
  const body = await readJson(request);
  if (!body || typeof body !== "object") {
    return respond({ error: "Invalid JSON body" }, 400);
  }
  const input = body;
  const rawCode = typeof input.public_checkin_code === "string" && input.public_checkin_code || typeof input.qr_code_value === "string" && input.qr_code_value || typeof input.code === "string" && input.code || "";
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return respond({ error: "public_checkin_code or code is required" }, 400);
  }
  const participant = await env.DB.prepare(
    "SELECT * FROM participants WHERE public_checkin_code = ? LIMIT 1"
  ).bind(code).first();
  if (!participant) {
    return respondEventOpsError(respond, "invalid_checkin_code");
  }
  if (participant.checkin_status === "checked_in") {
    return respondEventOpsError(respond, "already_checked_in", {
      participant: toParticipantSummary(participant)
    });
  }
  const updated = await markParticipantCheckedIn(env, participant, admin);
  if (!updated) {
    return respond({ error: "Failed to check in participant" }, 500);
  }
  return respond({ participant: toParticipantSummary(updated) });
}
__name(handleCheckinByCode, "handleCheckinByCode");
async function handleClaimMeal(request, env, respond, participantId, mealKey) {
  const admin = await requireAdmin(request, env, respond);
  if (admin instanceof Response) {
    return admin;
  }
  if (!isMealKey(mealKey)) {
    return respondEventOpsError(respond, "invalid_meal_key", {
      allowed: MEAL_KEYS
    });
  }
  const participant = await getParticipantById(env, participantId);
  if (!participant) {
    return respond({ error: "Participant not found" }, 404);
  }
  if (participant.checkin_status !== "checked_in") {
    return respondEventOpsError(respond, "not_checked_in", {
      participant: toParticipantSummary(participant)
    });
  }
  const existing = await env.DB.prepare(
    "SELECT id FROM participant_meals WHERE participant_id = ? AND meal_key = ? LIMIT 1"
  ).bind(participantId, mealKey).first();
  if (existing) {
    return respondEventOpsError(respond, "meal_already_claimed", {
      meal_key: mealKey,
      participant: toParticipantSummary(participant)
    });
  }
  const mealCount = await env.DB.prepare(
    "SELECT COUNT(*) AS total FROM participant_meals WHERE participant_id = ?"
  ).bind(participantId).first();
  if ((mealCount?.total ?? 0) >= 5) {
    return respondEventOpsError(respond, "meal_limit_reached", {
      participant: toParticipantSummary(participant)
    });
  }
  const now = Date.now();
  const mealId = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO participant_meals (id, participant_id, meal_key, claimed_by, claimed_at)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(mealId, participantId, mealKey, admin.id, now).run();
  const meal = await env.DB.prepare("SELECT * FROM participant_meals WHERE id = ? LIMIT 1").bind(mealId).first();
  return respond(
    {
      meal: meal ? {
        id: meal.id,
        participant_id: meal.participant_id,
        meal_key: meal.meal_key,
        claimed_by: meal.claimed_by,
        claimed_at: meal.claimed_at
      } : null
    },
    201
  );
}
__name(handleClaimMeal, "handleClaimMeal");
async function handleAdminParticipantRoutes(request, env, respond) {
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
__name(handleAdminParticipantRoutes, "handleAdminParticipantRoutes");

// src/admin/routes.ts
async function handleAdminRoutes(request, env, respond) {
  const eventOpsRoute = await handleAdminEventOpsRoutes(request, env, respond);
  if (eventOpsRoute) {
    return eventOpsRoute;
  }
  const reportRoute = await handleAdminReportRoutes(request, env, respond);
  if (reportRoute) {
    return reportRoute;
  }
  const participantRoute = await handleAdminParticipantRoutes(request, env, respond);
  if (participantRoute) {
    return participantRoute;
  }
  const applicationRoute = await handleAdminApplicationRoutes(request, env, respond);
  if (applicationRoute) {
    return applicationRoute;
  }
  return respond({ error: "Not found" }, 404);
}
__name(handleAdminRoutes, "handleAdminRoutes");

// src/applications/validation.ts
var MAX_TEXT = 5e3;
var MAX_SHORT = 500;
var MIN_GRAD_YEAR = 1950;
var MAX_GRAD_YEAR = 2040;
function trimString(value, maxLen) {
  if (value === null || value === void 0 || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLen) {
    return null;
  }
  return trimmed;
}
__name(trimString, "trimString");
function requireString(value, maxLen) {
  const trimmed = trimString(value, maxLen);
  return trimmed || null;
}
__name(requireString, "requireString");
function parseUrl(value) {
  const trimmed = trimString(value, 2048);
  if (!trimmed) {
    return null;
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}
__name(parseUrl, "parseUrl");
function parseGraduationYear(value) {
  if (value === null || value === void 0 || value === "") {
    return null;
  }
  const year = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(year) || year < MIN_GRAD_YEAR || year > MAX_GRAD_YEAR) {
    return null;
  }
  return year;
}
__name(parseGraduationYear, "parseGraduationYear");
function parseBoolean(value) {
  if (value === true || value === 1 || value === "1" || value === "true") {
    return true;
  }
  return false;
}
__name(parseBoolean, "parseBoolean");
function validateApplicationBody(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body" };
  }
  const input = body;
  const full_name = requireString(input.full_name, 200);
  if (!full_name) {
    return { ok: false, error: "full_name is required (max 200 characters)" };
  }
  const phone = trimString(input.phone, 50);
  if (input.phone !== void 0 && input.phone !== null && input.phone !== "" && !phone) {
    return { ok: false, error: "phone must be a string (max 50 characters)" };
  }
  const school = trimString(input.school, 200);
  if (input.school !== void 0 && input.school !== null && input.school !== "" && !school) {
    return { ok: false, error: "school must be a string (max 200 characters)" };
  }
  const program = trimString(input.program, 200);
  if (input.program !== void 0 && input.program !== null && input.program !== "" && !program) {
    return { ok: false, error: "program must be a string (max 200 characters)" };
  }
  const graduation_year = parseGraduationYear(input.graduation_year);
  if (input.graduation_year !== void 0 && input.graduation_year !== null && input.graduation_year !== "" && graduation_year === null) {
    return { ok: false, error: `graduation_year must be an integer between ${MIN_GRAD_YEAR} and ${MAX_GRAD_YEAR}` };
  }
  const github_url = parseUrl(input.github_url);
  if (input.github_url !== void 0 && input.github_url !== null && input.github_url !== "" && !github_url) {
    return { ok: false, error: "github_url must be a valid http or https URL" };
  }
  const linkedin_url = parseUrl(input.linkedin_url);
  if (input.linkedin_url !== void 0 && input.linkedin_url !== null && input.linkedin_url !== "" && !linkedin_url) {
    return { ok: false, error: "linkedin_url must be a valid http or https URL" };
  }
  const portfolio_url = parseUrl(input.portfolio_url);
  if (input.portfolio_url !== void 0 && input.portfolio_url !== null && input.portfolio_url !== "" && !portfolio_url) {
    return { ok: false, error: "portfolio_url must be a valid http or https URL" };
  }
  const resume_url = parseUrl(input.resume_url);
  if (input.resume_url !== void 0 && input.resume_url !== null && input.resume_url !== "" && !resume_url) {
    return { ok: false, error: "resume_url must be a valid http or https URL" };
  }
  const why_join = trimString(input.why_join, MAX_TEXT);
  if (input.why_join !== void 0 && input.why_join !== null && input.why_join !== "" && !why_join) {
    return { ok: false, error: `why_join must be a string (max ${MAX_TEXT} characters)` };
  }
  const project_idea = trimString(input.project_idea, MAX_TEXT);
  if (input.project_idea !== void 0 && input.project_idea !== null && input.project_idea !== "" && !project_idea) {
    return { ok: false, error: `project_idea must be a string (max ${MAX_TEXT} characters)` };
  }
  const dietary_restrictions = trimString(input.dietary_restrictions, MAX_SHORT);
  if (input.dietary_restrictions !== void 0 && input.dietary_restrictions !== null && input.dietary_restrictions !== "" && !dietary_restrictions) {
    return { ok: false, error: `dietary_restrictions must be a string (max ${MAX_SHORT} characters)` };
  }
  const gender = trimString(input.gender, 50);
  if (input.gender !== void 0 && input.gender !== null && input.gender !== "" && !gender) {
    return { ok: false, error: "gender must be a string (max 50 characters)" };
  }
  return {
    ok: true,
    data: {
      full_name,
      phone,
      school,
      program,
      graduation_year,
      github_url,
      linkedin_url,
      portfolio_url,
      resume_url,
      why_join,
      project_idea,
      dietary_restrictions,
      needs_travel_support: parseBoolean(input.needs_travel_support),
      gender
    }
  };
}
__name(validateApplicationBody, "validateApplicationBody");

// src/applications/routes.ts
function toResponse(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    full_name: row.full_name,
    phone: row.phone,
    school: row.school,
    program: row.program,
    graduation_year: row.graduation_year,
    github_url: row.github_url,
    linkedin_url: row.linkedin_url,
    portfolio_url: row.portfolio_url,
    resume_url: row.resume_url,
    why_join: row.why_join,
    project_idea: row.project_idea,
    dietary_restrictions: row.dietary_restrictions,
    needs_travel_support: row.needs_travel_support === 1,
    gender: row.gender,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}
__name(toResponse, "toResponse");
async function readJson2(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
__name(readJson2, "readJson");
async function getApplicationByUserId(env, userId) {
  return env.DB.prepare("SELECT * FROM applications WHERE user_id = ? LIMIT 1").bind(userId).first();
}
__name(getApplicationByUserId, "getApplicationByUserId");
async function handleUpsert(request, env, respond) {
  const user = await authenticate(request, env);
  if (!user) {
    return respond({ error: "Unauthorized" }, 401);
  }
  const body = await readJson2(request);
  if (body === null) {
    return respond({ error: "Invalid JSON body" }, 400);
  }
  const validated = validateApplicationBody(body);
  if (!validated.ok) {
    return respond({ error: validated.error }, 400);
  }
  const existing = await getApplicationByUserId(env, user.id);
  const now = Date.now();
  const input = body;
  const parsed = validated.data;
  const data = existing ? {
    full_name: parsed.full_name,
    phone: "phone" in input ? parsed.phone : existing.phone,
    school: "school" in input ? parsed.school : existing.school,
    program: "program" in input ? parsed.program : existing.program,
    graduation_year: "graduation_year" in input ? parsed.graduation_year : existing.graduation_year,
    github_url: "github_url" in input ? parsed.github_url : existing.github_url,
    linkedin_url: "linkedin_url" in input ? parsed.linkedin_url : existing.linkedin_url,
    portfolio_url: "portfolio_url" in input ? parsed.portfolio_url : existing.portfolio_url,
    resume_url: "resume_url" in input ? parsed.resume_url : existing.resume_url,
    why_join: "why_join" in input ? parsed.why_join : existing.why_join,
    project_idea: "project_idea" in input ? parsed.project_idea : existing.project_idea,
    dietary_restrictions: "dietary_restrictions" in input ? parsed.dietary_restrictions : existing.dietary_restrictions,
    needs_travel_support: "needs_travel_support" in input ? parsed.needs_travel_support : existing.needs_travel_support === 1,
    gender: "gender" in input ? parsed.gender : existing.gender
  } : parsed;
  if (existing) {
    if (existing.status === "approved" || existing.status === "rejected") {
      return respond({ error: "Application can no longer be edited" }, 403);
    }
    await env.DB.prepare(
      `UPDATE applications SET
        full_name = ?,
        phone = ?,
        school = ?,
        program = ?,
        graduation_year = ?,
        github_url = ?,
        linkedin_url = ?,
        portfolio_url = ?,
        resume_url = ?,
        why_join = ?,
        project_idea = ?,
        dietary_restrictions = ?,
        needs_travel_support = ?,
        gender = ?,
        status = ?,
        updated_at = ?
      WHERE user_id = ?`
    ).bind(
      data.full_name,
      data.phone,
      data.school,
      data.program,
      data.graduation_year,
      data.github_url,
      data.linkedin_url,
      data.portfolio_url,
      data.resume_url,
      data.why_join,
      data.project_idea,
      data.dietary_restrictions,
      data.needs_travel_support ? 1 : 0,
      data.gender,
      "pending",
      now,
      user.id
    ).run();
    const updated = await getApplicationByUserId(env, user.id);
    if (!updated) {
      return respond({ error: "Failed to load updated application" }, 500);
    }
    return respond({ application: toResponse(updated) });
  }
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO applications (
      id, user_id, full_name, phone, school, program, graduation_year,
      github_url, linkedin_url, portfolio_url, resume_url,
      why_join, project_idea, dietary_restrictions, needs_travel_support,
      gender, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    user.id,
    data.full_name,
    data.phone,
    data.school,
    data.program,
    data.graduation_year,
    data.github_url,
    data.linkedin_url,
    data.portfolio_url,
    data.resume_url,
    data.why_join,
    data.project_idea,
    data.dietary_restrictions,
    data.needs_travel_support ? 1 : 0,
    data.gender,
    "pending",
    now,
    now
  ).run();
  const created = await getApplicationByUserId(env, user.id);
  if (!created) {
    return respond({ error: "Failed to load created application" }, 500);
  }
  return respond({ application: toResponse(created) }, 201);
}
__name(handleUpsert, "handleUpsert");
async function handleGetMine(request, env, respond) {
  const user = await authenticate(request, env);
  if (!user) {
    return respond({ error: "Unauthorized" }, 401);
  }
  const application = await getApplicationByUserId(env, user.id);
  if (!application) {
    return respond({ error: "Application not found" }, 404);
  }
  return respond({ application: toResponse(application) });
}
__name(handleGetMine, "handleGetMine");
async function handleApplicationRoutes(request, env, respond) {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;
  if (pathname === "/api/applications" && method === "POST") {
    return handleUpsert(request, env, respond);
  }
  if (pathname === "/api/applications/me" && method === "GET") {
    return handleGetMine(request, env, respond);
  }
  return respond({ error: "Not found" }, 404);
}
__name(handleApplicationRoutes, "handleApplicationRoutes");

// src/auth/password.ts
var ITERATIONS = 1e5;
var SALT_BYTES = 16;
var HASH_BYTES = 32;
function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}
__name(toBase64, "toBase64");
function fromBase64(value) {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}
__name(fromBase64, "fromBase64");
async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  return crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256"
    },
    keyMaterial,
    HASH_BYTES * 8
  );
}
__name(deriveKey, "deriveKey");
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = new Uint8Array(await deriveKey(password, salt));
  return `pbkdf2:${ITERATIONS}:${toBase64(salt)}:${toBase64(hash)}`;
}
__name(hashPassword, "hashPassword");
async function verifyPassword(password, stored) {
  const parts = stored.split(":");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") {
    return false;
  }
  const iterations = Number(parts[1]);
  if (iterations !== ITERATIONS) {
    return false;
  }
  const salt = fromBase64(parts[2]);
  const expected = fromBase64(parts[3]);
  const actual = new Uint8Array(await deriveKey(password, salt));
  if (actual.length !== expected.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < actual.length; i++) {
    diff |= actual[i] ^ expected[i];
  }
  return diff === 0;
}
__name(verifyPassword, "verifyPassword");

// src/auth/routes.ts
function normalizeEmail(value) {
  if (typeof value !== "string") {
    return null;
  }
  const email = value.trim().toLowerCase();
  if (!email.includes("@") || email.length > 254) {
    return null;
  }
  return email;
}
__name(normalizeEmail, "normalizeEmail");
function normalizePassword(value) {
  if (typeof value !== "string" || value.length < 8) {
    return null;
  }
  return value;
}
__name(normalizePassword, "normalizePassword");
function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role
  };
}
__name(publicUser, "publicUser");
async function readJson3(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
__name(readJson3, "readJson");
async function handleRegister(request, env, respond) {
  const body = await readJson3(request);
  if (!body) {
    return respond({ error: "Invalid JSON body" }, 400);
  }
  const email = normalizeEmail(body.email);
  const password = normalizePassword(body.password);
  if (!email || !password) {
    return respond({ error: "Valid email and password (min 8 chars) are required" }, 400);
  }
  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ? LIMIT 1").bind(email).first();
  if (existing) {
    return respond({ error: "Email already registered" }, 409);
  }
  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  const createdAt = Date.now();
  const role = "applicant";
  await env.DB.prepare(
    "INSERT INTO users (id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)"
  ).bind(id, email, passwordHash, role, createdAt).run();
  const user = { id, email, role };
  const token = await signToken(user, env.JWT_SECRET);
  return respond({ token, user: publicUser(user) }, 201);
}
__name(handleRegister, "handleRegister");
async function handleLogin(request, env, respond) {
  const body = await readJson3(request);
  if (!body) {
    return respond({ error: "Invalid JSON body" }, 400);
  }
  const email = normalizeEmail(body.email);
  const password = normalizePassword(body.password);
  if (!email || !password) {
    return respond({ error: "Valid email and password (min 8 chars) are required" }, 400);
  }
  const row = await env.DB.prepare(
    "SELECT id, email, password_hash, role FROM users WHERE email = ? LIMIT 1"
  ).bind(email).first();
  if (!row || !await verifyPassword(password, row.password_hash)) {
    return respond({ error: "Invalid email or password" }, 401);
  }
  const user = {
    id: row.id,
    email: row.email,
    role: row.role
  };
  const token = await signToken(user, env.JWT_SECRET);
  return respond({ token, user: publicUser(user) });
}
__name(handleLogin, "handleLogin");
async function handleMe(request, env, respond) {
  const user = await authenticate(request, env);
  if (!user) {
    return respond({ error: "Unauthorized" }, 401);
  }
  return respond({ user: publicUser(user) });
}
__name(handleMe, "handleMe");
async function handleAuthRoutes(request, env, respond) {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;
  if (pathname === "/api/auth/register" && method === "POST") {
    return handleRegister(request, env, respond);
  }
  if (pathname === "/api/auth/login" && method === "POST") {
    return handleLogin(request, env, respond);
  }
  if (pathname === "/api/auth/me" && method === "GET") {
    return handleMe(request, env, respond);
  }
  return respond({ error: "Not found" }, 404);
}
__name(handleAuthRoutes, "handleAuthRoutes");

// src/index.ts
var JSON_HEADERS = { "Content-Type": "application/json" };
function corsHeaders(origin, requestOrigin) {
  const allowOrigin = origin === "*" || requestOrigin && requestOrigin === origin ? requestOrigin ?? origin : origin;
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  };
}
__name(corsHeaders, "corsHeaders");
function jsonResponse(body, status, origin, requestOrigin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...corsHeaders(origin, requestOrigin)
    }
  });
}
__name(jsonResponse, "jsonResponse");
function notImplemented(area, pathname, method, origin, requestOrigin) {
  return jsonResponse(
    { error: "Not implemented", area, path: pathname, method },
    501,
    origin,
    requestOrigin
  );
}
__name(notImplemented, "notImplemented");
async function checkDb(env) {
  try {
    await env.DB.prepare("SELECT 1").first();
    return true;
  } catch {
    return false;
  }
}
__name(checkDb, "checkDb");
async function dispatch(request, env, origin, requestOrigin) {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;
  const respond = /* @__PURE__ */ __name((body, status = 200) => jsonResponse(body, status, origin, requestOrigin), "respond");
  if (pathname.startsWith("/api/auth/")) {
    return handleAuthRoutes(request, env, respond);
  }
  if (pathname.startsWith("/api/applications/") || pathname === "/api/applications") {
    return handleApplicationRoutes(request, env, respond);
  }
  if (pathname.startsWith("/api/admin/")) {
    return handleAdminRoutes(request, env, respond);
  }
  if (pathname.startsWith("/api/ops/")) {
    return notImplemented("ops", pathname, method, origin, requestOrigin);
  }
  return jsonResponse({ error: "Not found" }, 404, origin, requestOrigin);
}
__name(dispatch, "dispatch");
var src_default = {
  async fetch(request, env) {
    const origin = env.CORS_ORIGIN || "*";
    const requestOrigin = request.headers.get("Origin");
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, requestOrigin)
      });
    }
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") {
      const dbOk = await checkDb(env);
      return jsonResponse({ ok: true, db: dbOk }, 200, origin, requestOrigin);
    }
    return dispatch(request, env, origin, requestOrigin);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-w6PUoP/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch2, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch: dispatch2,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch2, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch2, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch2, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-w6PUoP/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
