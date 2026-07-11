import type { ApplicationInput } from "./types";

const MAX_TEXT = 5000;
const MAX_SHORT = 500;
const MIN_GRAD_YEAR = 1950;
const MAX_GRAD_YEAR = 2040;
const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const ALLOWED_RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function trimString(value: unknown, maxLen: number): string | null {
  if (value === null || value === undefined || value === "") {
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

function requireString(value: unknown, maxLen: number): string | null {
  const trimmed = trimString(value, maxLen);
  return trimmed || null;
}

function normalizeProfileUrl(value: unknown): string | null {
  const trimmed = trimString(value, 2048);
  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function parseUrl(value: unknown): string | null {
  return normalizeProfileUrl(value);
}

function parseGraduationYear(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const year = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(year) || year < MIN_GRAD_YEAR || year > MAX_GRAD_YEAR) {
    return null;
  }
  return year;
}

function parseBoolean(value: unknown): boolean {
  if (value === true || value === 1 || value === "1" || value === "true") {
    return true;
  }
  return false;
}

function parseNullableBoolean(value: unknown): boolean | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (value === false || value === 0 || value === "0" || value === "false") {
    return false;
  }
  if (value === true || value === 1 || value === "1" || value === "true") {
    return true;
  }
  return null;
}

function getField(input: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in input) {
      return input[key];
    }
  }
  return undefined;
}

export function validateApplicationBody(
  body: unknown,
): { ok: true; data: ApplicationInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body" };
  }

  const input = body as Record<string, unknown>;

  const full_name = requireString(getField(input, "full_name", "fullName"), 200);
  if (!full_name) {
    return { ok: false, error: "fullName is required (max 200 characters)" };
  }

  const phone = trimString(getField(input, "phone"), 50);
  const school = trimString(getField(input, "school", "institution"), 200);
  const program = trimString(getField(input, "program"), 200);
  const graduation_year = parseGraduationYear(getField(input, "graduation_year", "graduationYear"));

  const github_url = normalizeProfileUrl(getField(input, "github_url", "github"));
  const linkedin_url = normalizeProfileUrl(getField(input, "linkedin_url", "linkedin"));
  const portfolio_url = parseUrl(getField(input, "portfolio_url", "portfolioUrl"));
  const resume_url = parseUrl(getField(input, "resume_url", "resumeUrl"));

  const dietary_restrictions = trimString(
    getField(input, "dietary_restrictions", "dietary"),
    MAX_SHORT,
  );
  const gender = trimString(getField(input, "gender"), 50);
  const accessibility = trimString(getField(input, "accessibility"), MAX_TEXT);
  const motivation = trimString(getField(input, "motivation", "why_join", "whyJoin"), MAX_TEXT);
  const past_project = trimString(
    getField(input, "past_project", "pastProject", "project_idea", "projectIdea"),
    MAX_TEXT,
  );
  const interests = trimString(getField(input, "interests"), MAX_TEXT);
  const community = trimString(getField(input, "community"), MAX_TEXT);

  const why_join = trimString(getField(input, "why_join", "whyJoin"), MAX_TEXT) ?? motivation;
  const project_idea =
    trimString(getField(input, "project_idea", "projectIdea"), MAX_TEXT) ?? past_project;

  const first_hackathon = parseNullableBoolean(getField(input, "first_hackathon", "firstHackathon"));
  const cs_career = parseNullableBoolean(getField(input, "cs_career", "csCareer"));

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
      resume_key: null,
      why_join,
      project_idea,
      dietary_restrictions,
      needs_travel_support: parseBoolean(getField(input, "needs_travel_support", "needsTravelSupport")),
      gender,
      accessibility,
      first_hackathon,
      cs_career,
      motivation,
      past_project,
      interests,
      community,
    },
  };
}

export function validateApplicationFormFields(
  fields: Record<string, string>,
): { ok: true; data: ApplicationInput } | { ok: false; error: string } {
  const validated = validateApplicationBody(fields);
  if (!validated.ok) {
    return validated;
  }

  const data = validated.data;

  if (!data.github_url) {
    return { ok: false, error: "github must be a valid profile URL" };
  }
  if (!data.linkedin_url) {
    return { ok: false, error: "linkedin must be a valid profile URL" };
  }
  if (!data.dietary_restrictions) {
    return { ok: false, error: "dietary is required" };
  }
  if (data.first_hackathon === null) {
    return { ok: false, error: "firstHackathon is required" };
  }
  if (data.cs_career === null) {
    return { ok: false, error: "csCareer is required" };
  }
  if (!data.motivation) {
    return { ok: false, error: "motivation is required" };
  }
  if (!data.past_project) {
    return { ok: false, error: "pastProject is required" };
  }
  if (!data.interests) {
    return { ok: false, error: "interests is required" };
  }

  return { ok: true, data };
}

export function validateResumeFile(file: File | null): { ok: true; file: File } | { ok: false; error: string } {
  if (!file || !(file instanceof File)) {
    return { ok: false, error: "resumeFile is required" };
  }

  if (file.size <= 0 || file.size > MAX_RESUME_BYTES) {
    return { ok: false, error: "resumeFile must be 5MB or smaller" };
  }

  const type = file.type || "application/octet-stream";
  if (!ALLOWED_RESUME_TYPES.has(type) && !file.name.toLowerCase().endsWith(".pdf")) {
    return { ok: false, error: "resumeFile must be a PDF or Word document" };
  }

  return { ok: true, file };
}

export async function formDataToFieldRecord(formData: FormData): Promise<Record<string, string>> {
  const fields: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      fields[key] = value;
    }
  }
  return fields;
}
