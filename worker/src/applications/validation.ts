import type { ApplicationInput } from "./types";

const MAX_TEXT = 5000;
const MAX_SHORT = 500;
const MIN_GRAD_YEAR = 1950;
const MAX_GRAD_YEAR = 2040;

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

function parseUrl(value: unknown): string | null {
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

export function validateApplicationBody(
  body: unknown,
): { ok: true; data: ApplicationInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body" };
  }

  const input = body as Record<string, unknown>;

  const full_name = requireString(input.full_name, 200);
  if (!full_name) {
    return { ok: false, error: "full_name is required (max 200 characters)" };
  }

  const phone = trimString(input.phone, 50);
  if (input.phone !== undefined && input.phone !== null && input.phone !== "" && !phone) {
    return { ok: false, error: "phone must be a string (max 50 characters)" };
  }

  const school = trimString(input.school, 200);
  if (input.school !== undefined && input.school !== null && input.school !== "" && !school) {
    return { ok: false, error: "school must be a string (max 200 characters)" };
  }

  const program = trimString(input.program, 200);
  if (input.program !== undefined && input.program !== null && input.program !== "" && !program) {
    return { ok: false, error: "program must be a string (max 200 characters)" };
  }

  const graduation_year = parseGraduationYear(input.graduation_year);
  if (
    input.graduation_year !== undefined &&
    input.graduation_year !== null &&
    input.graduation_year !== "" &&
    graduation_year === null
  ) {
    return { ok: false, error: `graduation_year must be an integer between ${MIN_GRAD_YEAR} and ${MAX_GRAD_YEAR}` };
  }

  const github_url = parseUrl(input.github_url);
  if (input.github_url !== undefined && input.github_url !== null && input.github_url !== "" && !github_url) {
    return { ok: false, error: "github_url must be a valid http or https URL" };
  }

  const linkedin_url = parseUrl(input.linkedin_url);
  if (input.linkedin_url !== undefined && input.linkedin_url !== null && input.linkedin_url !== "" && !linkedin_url) {
    return { ok: false, error: "linkedin_url must be a valid http or https URL" };
  }

  const portfolio_url = parseUrl(input.portfolio_url);
  if (input.portfolio_url !== undefined && input.portfolio_url !== null && input.portfolio_url !== "" && !portfolio_url) {
    return { ok: false, error: "portfolio_url must be a valid http or https URL" };
  }

  const resume_url = parseUrl(input.resume_url);
  if (input.resume_url !== undefined && input.resume_url !== null && input.resume_url !== "" && !resume_url) {
    return { ok: false, error: "resume_url must be a valid http or https URL" };
  }

  const why_join = trimString(input.why_join, MAX_TEXT);
  if (input.why_join !== undefined && input.why_join !== null && input.why_join !== "" && !why_join) {
    return { ok: false, error: `why_join must be a string (max ${MAX_TEXT} characters)` };
  }

  const project_idea = trimString(input.project_idea, MAX_TEXT);
  if (input.project_idea !== undefined && input.project_idea !== null && input.project_idea !== "" && !project_idea) {
    return { ok: false, error: `project_idea must be a string (max ${MAX_TEXT} characters)` };
  }

  const dietary_restrictions = trimString(input.dietary_restrictions, MAX_SHORT);
  if (
    input.dietary_restrictions !== undefined &&
    input.dietary_restrictions !== null &&
    input.dietary_restrictions !== "" &&
    !dietary_restrictions
  ) {
    return { ok: false, error: `dietary_restrictions must be a string (max ${MAX_SHORT} characters)` };
  }

  const gender = trimString(input.gender, 50);
  if (input.gender !== undefined && input.gender !== null && input.gender !== "" && !gender) {
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
      gender,
    },
  };
}
