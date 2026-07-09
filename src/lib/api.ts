import { clearAuthToken, getAuthToken } from "./auth";
import type {
  AdminApplicationSummary,
  Application,
  ApplicationFormValues,
  ApplicationReview,
  AuthUser,
  ApplicationForm,
} from "@/types/application";

const rawApiBaseUrl = import.meta.env.VITE_API_URL || "";
const apiBaseUrl = rawApiBaseUrl.endsWith("/")
  ? rawApiBaseUrl.slice(0, -1)
  : rawApiBaseUrl;

export const SUBSCRIBE_ENDPOINT = `${apiBaseUrl}/api/subscribe`;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function parseJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  return response.json();
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  const data = (await parseJson(response)) as { error?: string } | null;

  if (!response.ok) {
    throw new ApiError(response.status, data?.error || "Request failed");
  }

  return data as T;
}

export async function registerUser(email: string, password: string) {
  return apiFetch<{ token: string; user: AuthUser }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function loginUser(email: string, password: string) {
  return apiFetch<{ token: string; user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchCurrentUser() {
  return apiFetch<{ user: AuthUser }>("/api/auth/me");
}

export async function fetchMyApplication() {
  return apiFetch<{ application: Application }>("/api/applications/me");
}

export function toFormValues(application: Application): ApplicationFormValues {
  return {
    full_name: application.full_name,
    phone: application.phone ?? "",
    school: application.school ?? "",
    program: application.program ?? "",
    graduation_year:
      application.graduation_year != null ? String(application.graduation_year) : "",
    github_url: application.github_url ?? "",
    linkedin_url: application.linkedin_url ?? "",
    portfolio_url: application.portfolio_url ?? "",
    resume_url: application.resume_url ?? "",
    why_join: application.why_join ?? "",
    project_idea: application.project_idea ?? "",
    dietary_restrictions: application.dietary_restrictions ?? "",
    needs_travel_support: application.needs_travel_support,
    gender: application.gender ?? "",
  };
}

export function toFormValuesV2(application: Application): ApplicationForm {
  return {
    fullName: application.full_name,
    phone: application.phone ?? "",
    gender: application.gender ?? "",
    institution: application.school ?? "",
    github: application.github_url ?? "",
    linkedin: application.linkedin_url ?? "",
    resumeFile: null,
    dietary: application.dietary_restrictions ?? "",
    accessibility: "",
    firstHackathon: null,
    csCareer: null,
    motivation: application.why_join ?? "",
    pastProject: application.project_idea ?? "",
    interests: "",
    community: "",
  };
}

export function toApplicationPayload(values: ApplicationFormValues) {
  return {
    full_name: values.full_name.trim(),
    phone: values.phone.trim() || undefined,
    school: values.school.trim() || undefined,
    program: values.program.trim() || undefined,
    graduation_year: values.graduation_year.trim()
      ? Number(values.graduation_year)
      : undefined,
    github_url: values.github_url.trim() || undefined,
    linkedin_url: values.linkedin_url.trim() || undefined,
    portfolio_url: values.portfolio_url.trim() || undefined,
    resume_url: values.resume_url.trim() || undefined,
    why_join: values.why_join.trim() || undefined,
    project_idea: values.project_idea.trim() || undefined,
    dietary_restrictions: values.dietary_restrictions.trim() || undefined,
    needs_travel_support: values.needs_travel_support,
    gender: values.gender.trim() || undefined,
  };
}

export async function saveApplication(values: ApplicationFormValues) {
  return apiFetch<{ application: Application }>("/api/applications", {
    method: "POST",
    body: JSON.stringify(toApplicationPayload(values)),
  });
}

export async function saveApplicationV2(payload: ApplicationForm) {
  return apiFetch<{ application: Application }>("/api/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminApplications(params: {
  status?: string;
  gender?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.gender) query.set("gender", params.gender);
  if (params.search) query.set("search", params.search);
  if (params.limit != null) query.set("limit", String(params.limit));
  if (params.offset != null) query.set("offset", String(params.offset));

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch<{
    applications: AdminApplicationSummary[];
    pagination: { limit: number; offset: number; total: number };
  }>(`/api/admin/applications${suffix}`);
}

export async function fetchAdminApplication(id: string) {
  return apiFetch<{ application: Application; reviews: ApplicationReview[] }>(
    `/api/admin/applications/${id}`,
  );
}

export async function submitApplicationReview(
  id: string,
  body: { score?: number; notes?: string; status: "pending" | "approved" | "rejected" },
) {
  return apiFetch<{ application: Application; review: ApplicationReview }>(
    `/api/admin/applications/${id}/review`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export function logoutUser() {
  clearAuthToken();
}

export const APPLICATION_FIELD_NAMES = [
  "full_name",
  "phone",
  "school",
  "program",
  "graduation_year",
  "github_url",
  "linkedin_url",
  "portfolio_url",
  "resume_url",
  "why_join",
  "project_idea",
  "dietary_restrictions",
  "needs_travel_support",
  "gender",
] as const;

export function mapApiErrorToFieldErrors(
  message: string,
): Partial<Record<(typeof APPLICATION_FIELD_NAMES)[number], string>> {
  for (const field of APPLICATION_FIELD_NAMES) {
    if (
      message.startsWith(`${field} `) ||
      message.startsWith(`${field} must`) ||
      message.startsWith(`${field} is`)
    ) {
      return { [field]: message };
    }
  }
  return {};
}
