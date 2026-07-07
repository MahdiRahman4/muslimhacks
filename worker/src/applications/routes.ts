import type { Env } from "../env";
import { authenticate } from "../auth/middleware";
import type { ApplicationInput, ApplicationResponse, ApplicationRow } from "./types";
import { validateApplicationBody } from "./validation";

type JsonResponder = (body: unknown, status?: number) => Response;

function toResponse(row: ApplicationRow): ApplicationResponse {
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
    updated_at: row.updated_at,
  };
}

async function readJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function getApplicationByUserId(
  env: Env,
  userId: string,
): Promise<ApplicationRow | null> {
  return env.DB.prepare("SELECT * FROM applications WHERE user_id = ? LIMIT 1")
    .bind(userId)
    .first<ApplicationRow>();
}

async function handleUpsert(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
  const user = await authenticate(request, env);
  if (!user) {
    return respond({ error: "Unauthorized" }, 401);
  }

  const body = await readJson(request);
  if (body === null) {
    return respond({ error: "Invalid JSON body" }, 400);
  }

  const validated = validateApplicationBody(body);
  if (!validated.ok) {
    return respond({ error: validated.error }, 400);
  }

  const existing = await getApplicationByUserId(env, user.id);
  const now = Date.now();
  const input = body as Record<string, unknown>;
  const parsed = validated.data;

  const data: ApplicationInput = existing
    ? {
        full_name: parsed.full_name,
        phone: "phone" in input ? parsed.phone : existing.phone,
        school: "school" in input ? parsed.school : existing.school,
        program: "program" in input ? parsed.program : existing.program,
        graduation_year:
          "graduation_year" in input ? parsed.graduation_year : existing.graduation_year,
        github_url: "github_url" in input ? parsed.github_url : existing.github_url,
        linkedin_url: "linkedin_url" in input ? parsed.linkedin_url : existing.linkedin_url,
        portfolio_url: "portfolio_url" in input ? parsed.portfolio_url : existing.portfolio_url,
        resume_url: "resume_url" in input ? parsed.resume_url : existing.resume_url,
        why_join: "why_join" in input ? parsed.why_join : existing.why_join,
        project_idea: "project_idea" in input ? parsed.project_idea : existing.project_idea,
        dietary_restrictions:
          "dietary_restrictions" in input
            ? parsed.dietary_restrictions
            : existing.dietary_restrictions,
        needs_travel_support:
          "needs_travel_support" in input
            ? parsed.needs_travel_support
            : existing.needs_travel_support === 1,
        gender: "gender" in input ? parsed.gender : existing.gender,
      }
    : parsed;

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
      WHERE user_id = ?`,
    )
      .bind(
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
        user.id,
      )
      .run();

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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
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
      now,
    )
    .run();

  const created = await getApplicationByUserId(env, user.id);
  if (!created) {
    return respond({ error: "Failed to load created application" }, 500);
  }

  return respond({ application: toResponse(created) }, 201);
}

async function handleGetMine(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
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

export async function handleApplicationRoutes(
  request: Request,
  env: Env,
  respond: JsonResponder,
): Promise<Response> {
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
