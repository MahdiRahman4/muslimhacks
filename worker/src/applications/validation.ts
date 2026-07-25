import type { ApplicationInput } from "./types";

const MAX_TEXT = 5000;
const MAX_SHORT = 500;
const MIN_GRAD_YEAR = 1950;
const MAX_GRAD_YEAR = 2040;
const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const ALLOWED_RESUME_TYPES = new Set(["application/pdf"]);

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

function normalizeHttpUrl(value: unknown): URL | null {
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
    return url;
  } catch {
    return null;
  }
}

function normalizeProfileUrl(value: unknown): string | null {
  const url = normalizeHttpUrl(value);
  return url ? url.toString() : null;
}

function normalizeGithubUrl(value: unknown): string | null {
  const url = normalizeHttpUrl(value);
  if (!url) {
    return null;
  }
  const host = url.hostname.replace(/^www\./i, "").toLowerCase();
  if (host !== "github.com") {
    return null;
  }
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 1 || parts[0].toLowerCase() === "settings") {
    return null;
  }
  return `https://github.com/${parts[0]}`;
}

function normalizeLinkedinUrl(value: unknown): string | null {
  const url = normalizeHttpUrl(value);
  if (!url) {
    return null;
  }
  const host = url.hostname.replace(/^www\./i, "").toLowerCase();
  if (host !== "linkedin.com") {
    return null;
  }
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) {
    return null;
  }
  const kind = parts[0].toLowerCase();
  if (kind !== "in" && kind !== "pub" && kind !== "mwlite") {
    return null;
  }
  if (kind === "mwlite") {
    if (parts[1]?.toLowerCase() !== "in" || !parts[2]) {
      return null;
    }
    return `https://www.linkedin.com/in/${parts[2]}`;
  }
  return `https://www.linkedin.com/${kind}/${parts[1]}`;
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

function parseHackathonCount(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const count = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(count) || count < 1 || count > 100) {
    return null;
  }
  return count;
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

  const rawGithub = getField(input, "github_url", "github");
  const rawLinkedin = getField(input, "linkedin_url", "linkedin");
  const githubProvided = trimString(rawGithub, 2048) !== null;
  const linkedinProvided = trimString(rawLinkedin, 2048) !== null;
  const github_url = githubProvided ? normalizeGithubUrl(rawGithub) : null;
  const linkedin_url = linkedinProvided ? normalizeLinkedinUrl(rawLinkedin) : null;

  if (githubProvided && !github_url) {
    return { ok: false, error: "github must be a valid github.com profile URL" };
  }
  if (linkedinProvided && !linkedin_url) {
    return { ok: false, error: "linkedin must be a valid linkedin.com/in profile URL" };
  }

  const portfolio_url = parseUrl(getField(input, "portfolio_url", "portfolioUrl"));
  const resume_url = parseUrl(getField(input, "resume_url", "resumeUrl"));

  const dietary_restrictions = trimString(
    getField(input, "dietary_restrictions", "dietary"),
    MAX_SHORT,
  );
  const genderRaw = trimString(getField(input, "gender"), 50);
  let gender: string | null = null;
  if (genderRaw === "male" || genderRaw === "female") {
    gender = genderRaw;
  } else if (genderRaw) {
    return { ok: false, error: "gender must be male or female" };
  }
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
  let hackathon_count = parseHackathonCount(
    getField(input, "hackathon_count", "hackathonCount"),
  );

  if (first_hackathon === true) {
    hackathon_count = null;
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
      resume_key: null,
      why_join,
      project_idea,
      dietary_restrictions,
      needs_travel_support: parseBoolean(getField(input, "needs_travel_support", "needsTravelSupport")),
      gender,
      accessibility,
      first_hackathon,
      hackathon_count,
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

  if (!data.school) {
    return { ok: false, error: "institution / school is required" };
  }
  if (!data.gender) {
    return { ok: false, error: "gender is required (male or female)" };
  }
  if (!data.dietary_restrictions) {
    return { ok: false, error: "dietary is required" };
  }
  if (data.first_hackathon === null) {
    return { ok: false, error: "firstHackathon is required" };
  }
  if (data.first_hackathon === false && data.hackathon_count === null) {
    return {
      ok: false,
      error: "hackathonCount is required when this is not your first hackathon (1–100)",
    };
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
  if (!data.community) {
    return { ok: false, error: "community is required" };
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
    return { ok: false, error: "resumeFile must be a PDF" };
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
