import type { AuthUser } from "../auth/types";
import type { Env } from "../env";
import { sendApplicationConfirmationEmail } from "../email/application-confirmation";
import type { ApplicationInput, ApplicationResponse, ApplicationRow } from "./types";
import {
  formDataToFieldRecord,
  validateApplicationBody,
  validateApplicationFormFields,
  validateResumeFile,
} from "./validation";

type JsonResponder = (body: unknown, status?: number) => Response;

function boolToDb(value: boolean | null): number | null {
  if (value === null) {
    return null;
  }
  return value ? 1 : 0;
}

function dbToBool(value: number | null): boolean | null {
  if (value === null) {
    return null;
  }
  return value === 1;
}

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
    resume_key: row.resume_key,
    why_join: row.why_join,
    project_idea: row.project_idea,
    dietary_restrictions: row.dietary_restrictions,
    needs_travel_support: row.needs_travel_support === 1,
    gender: row.gender,
    accessibility: row.accessibility,
    first_hackathon: dbToBool(row.first_hackathon),
    hackathon_count: row.hackathon_count,
    cs_career: dbToBool(row.cs_career),
    motivation: row.motivation,
    past_project: row.past_project,
    interests: row.interests,
    community: row.community,
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

async function uploadResume(
  env: Env,
  userId: string,
  file: File,
): Promise<{ key: string; url: string } | { error: string }> {
  if (!env.RESUMES) {
    return { error: "Resume storage is not configured" };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
  const key = `resumes/${userId}/${Date.now()}-${safeName}`;

  await env.RESUMES.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type || "application/pdf",
    },
  });

  return { key, url: key };
}

export function resumeFilenameFromKey(key: string): string {
  const base = key.split("/").pop() || "resume.pdf";
  // Strip leading timestamp- prefix: 1719...-filename.pdf
  return base.replace(/^\d+-/, "") || base;
}

export async function streamResumeFromR2(
  env: Env,
  resumeKey: string,
): Promise<Response | null> {
  if (!env.RESUMES) {
    return null;
  }

  const object = await env.RESUMES.get(resumeKey);
  if (!object) {
    return null;
  }

  const filename = resumeFilenameFromKey(resumeKey);
  const headers = new Headers();
  headers.set(
    "Content-Type",
    object.httpMetadata?.contentType || "application/pdf",
  );
  headers.set(
    "Content-Disposition",
    `inline; filename="${filename.replace(/"/g, "")}"`,
  );
  if (object.size != null) {
    headers.set("Content-Length", String(object.size));
  }

  return new Response(object.body, { status: 200, headers });
}

async function persistApplication(
  env: Env,
  userId: string,
  data: ApplicationInput,
  existing: ApplicationRow | null,
): Promise<ApplicationRow | null> {
  const now = Date.now();

  if (existing) {
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
        resume_key = ?,
        why_join = ?,
        project_idea = ?,
        dietary_restrictions = ?,
        needs_travel_support = ?,
        gender = ?,
        accessibility = ?,
        first_hackathon = ?,
        hackathon_count = ?,
        cs_career = ?,
        motivation = ?,
        past_project = ?,
        interests = ?,
        community = ?,
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
        data.resume_url ?? existing.resume_url,
        data.resume_key ?? existing.resume_key,
        data.why_join,
        data.project_idea,
        data.dietary_restrictions,
        data.needs_travel_support ? 1 : 0,
        data.gender,
        data.accessibility,
        boolToDb(data.first_hackathon),
        data.hackathon_count,
        boolToDb(data.cs_career),
        data.motivation,
        data.past_project,
        data.interests,
        data.community,
        "pending",
        now,
        userId,
      )
      .run();

    return getApplicationByUserId(env, userId);
  }

  const id = crypto.randomUUID();

  await env.DB.prepare(
    `INSERT INTO applications (
      id, user_id, full_name, phone, school, program, graduation_year,
      github_url, linkedin_url, portfolio_url, resume_url, resume_key,
      why_join, project_idea, dietary_restrictions, needs_travel_support,
      gender, accessibility, first_hackathon, hackathon_count, cs_career, motivation,
      past_project, interests, community, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      userId,
      data.full_name,
      data.phone,
      data.school,
      data.program,
      data.graduation_year,
      data.github_url,
      data.linkedin_url,
      data.portfolio_url,
      data.resume_url,
      data.resume_key,
      data.why_join,
      data.project_idea,
      data.dietary_restrictions,
      data.needs_travel_support ? 1 : 0,
      data.gender,
      data.accessibility,
      boolToDb(data.first_hackathon),
      data.hackathon_count,
      boolToDb(data.cs_career),
      data.motivation,
      data.past_project,
      data.interests,
      data.community,
      "pending",
      now,
      now,
    )
    .run();

  return getApplicationByUserId(env, userId);
}

async function handleMultipartUpsert(
  request: Request,
  env: Env,
  user: AuthUser,
  respond: JsonResponder,
): Promise<Response> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return respond({ error: "Invalid multipart form data" }, 400);
  }

  const fields = await formDataToFieldRecord(formData);
  const validated = validateApplicationFormFields(fields);
  if (!validated.ok) {
    return respond({ error: validated.error }, 400);
  }

  const resumeEntry = formData.get("resumeFile");
  const resumeFile =
    resumeEntry && typeof resumeEntry !== "string" ? (resumeEntry as File) : null;

  const existing = await getApplicationByUserId(env, user.id);
  if (existing && (existing.status === "approved" || existing.status === "rejected")) {
    return respond({ error: "Application can no longer be edited" }, 403);
  }

  let resumeKey = existing?.resume_key ?? null;
  let resumeUrl = existing?.resume_url ?? null;

  if (resumeFile) {
    const resumeValidated = validateResumeFile(resumeFile);
    if (!resumeValidated.ok) {
      return respond({ error: resumeValidated.error }, 400);
    }
    const upload = await uploadResume(env, user.id, resumeValidated.file);
    if ("error" in upload) {
      return respond({ error: upload.error }, 500);
    }
    resumeKey = upload.key;
    resumeUrl = upload.url;
  } else if (!existing?.resume_key) {
    return respond({ error: "resumeFile is required" }, 400);
  }

  const data: ApplicationInput = {
    ...validated.data,
    resume_key: resumeKey,
    resume_url: resumeUrl,
  };

  const saved = await persistApplication(env, user.id, data, existing);
  if (!saved) {
    return respond({ error: "Failed to save application" }, 500);
  }

  if (!existing) {
    await sendApplicationConfirmationEmail(env, user.email, saved.full_name);
  }

  return respond({ application: toResponse(saved) }, existing ? 200 : 201);
}

async function handleJsonUpsert(
  request: Request,
  env: Env,
  user: AuthUser,
  respond: JsonResponder,
): Promise<Response> {
  const body = await readJson(request);
  if (body === null) {
    return respond({ error: "Invalid JSON body" }, 400);
  }

  const validated = validateApplicationBody(body);
  if (!validated.ok) {
    return respond({ error: validated.error }, 400);
  }

  const existing = await getApplicationByUserId(env, user.id);
  if (existing && (existing.status === "approved" || existing.status === "rejected")) {
    return respond({ error: "Application can no longer be edited" }, 403);
  }

  const input = body as Record<string, unknown>;
  const parsed = validated.data;

  const data: ApplicationInput = existing
    ? {
        ...parsed,
        phone: "phone" in input ? parsed.phone : existing.phone,
        school: "school" in input || "institution" in input ? parsed.school : existing.school,
        program: "program" in input ? parsed.program : existing.program,
        graduation_year:
          "graduation_year" in input || "graduationYear" in input
            ? parsed.graduation_year
            : existing.graduation_year,
        github_url:
          "github_url" in input || "github" in input ? parsed.github_url : existing.github_url,
        linkedin_url:
          "linkedin_url" in input || "linkedin" in input ? parsed.linkedin_url : existing.linkedin_url,
        portfolio_url:
          "portfolio_url" in input || "portfolioUrl" in input
            ? parsed.portfolio_url
            : existing.portfolio_url,
        resume_url: "resume_url" in input ? parsed.resume_url : existing.resume_url,
        resume_key: existing.resume_key,
        why_join: "why_join" in input || "motivation" in input ? parsed.why_join : existing.why_join,
        project_idea:
          "project_idea" in input || "pastProject" in input
            ? parsed.project_idea
            : existing.project_idea,
        dietary_restrictions:
          "dietary_restrictions" in input || "dietary" in input
            ? parsed.dietary_restrictions
            : existing.dietary_restrictions,
        needs_travel_support:
          "needs_travel_support" in input
            ? parsed.needs_travel_support
            : existing.needs_travel_support === 1,
        gender: "gender" in input ? parsed.gender : existing.gender,
        accessibility:
          "accessibility" in input ? parsed.accessibility : existing.accessibility,
        first_hackathon:
          "first_hackathon" in input || "firstHackathon" in input
            ? parsed.first_hackathon
            : dbToBool(existing.first_hackathon),
        hackathon_count:
          "hackathon_count" in input || "hackathonCount" in input
            ? parsed.hackathon_count
            : existing.hackathon_count,
        cs_career:
          "cs_career" in input || "csCareer" in input ? parsed.cs_career : dbToBool(existing.cs_career),
        motivation: "motivation" in input ? parsed.motivation : existing.motivation,
        past_project: "pastProject" in input ? parsed.past_project : existing.past_project,
        interests: "interests" in input ? parsed.interests : existing.interests,
        community: "community" in input ? parsed.community : existing.community,
      }
    : parsed;

  const saved = await persistApplication(env, user.id, data, existing);
  if (!saved) {
    return respond({ error: "Failed to save application" }, 500);
  }

  // Confirmation only on first create (not draft updates)
  if (!existing) {
    await sendApplicationConfirmationEmail(env, user.email, saved.full_name);
  }

  return respond({ application: toResponse(saved) }, existing ? 200 : 201);
}

async function handleUpsert(
  request: Request,
  env: Env,
  respond: JsonResponder,
  user: AuthUser,
): Promise<Response> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    return handleMultipartUpsert(request, env, user, respond);
  }

  return handleJsonUpsert(request, env, user, respond);
}

async function handleGetMine(
  env: Env,
  respond: JsonResponder,
  user: { id: string },
): Promise<Response> {
  const application = await getApplicationByUserId(env, user.id);
  if (!application) {
    return respond({ error: "Application not found" }, 404);
  }

  return respond({ application: toResponse(application) });
}

async function handleGetMyResume(
  env: Env,
  respond: JsonResponder,
  user: { id: string },
): Promise<Response> {
  const application = await getApplicationByUserId(env, user.id);
  if (!application?.resume_key) {
    return respond({ error: "Resume not found" }, 404);
  }

  const fileResponse = await streamResumeFromR2(env, application.resume_key);
  if (!fileResponse) {
    return respond({ error: "Resume not found" }, 404);
  }

  return fileResponse;
}

export async function handleApplicationRoutes(
  request: Request,
  env: Env,
  respond: JsonResponder,
  user: AuthUser | null,
): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;
  const { method } = request;

  if (!user) {
    return respond({ error: "Unauthorized" }, 401);
  }

  if (pathname === "/api/applications" && method === "POST") {
    return handleUpsert(request, env, respond, user);
  }

  if (pathname === "/api/applications/me" && method === "GET") {
    return handleGetMine(env, respond, user);
  }

  if (pathname === "/api/applications/me/resume" && method === "GET") {
    return handleGetMyResume(env, respond, user);
  }

  return respond({ error: "Not found" }, 404);
}

export { toResponse, getApplicationByUserId };
