import { getAuthTokenAsync } from "./auth-token";
import type {
  AdminApplicationSummary,
  Application,
  ApplicationForm,
  ApplicationFormValues,
  ApplicationReview,
  AuthUser,
  UserSummaryResponse,
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

export function mapApiErrorToFieldErrors(message: string): Record<string, string> {
  return {};
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
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const token = await getAuthTokenAsync();
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

export async function fetchCurrentUser() {
  return apiFetch<{ user: AuthUser }>("/api/auth/me");
}

export async function fetchUserSummary() {
  return apiFetch<UserSummaryResponse>("/api/users/me/summary");
}

export async function fetchMyApplication() {
  return apiFetch<{ application: Application }>("/api/applications/me");
}

/** Fetch the applicant's stored resume as a File (for update form autofill). */
export async function fetchMyResumeFile(): Promise<File | null> {
  const token = await getAuthTokenAsync();
  const response = await fetch(`${apiBaseUrl}/api/applications/me/resume`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new ApiError(response.status, "Failed to load resume");
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] || "resume.pdf";
  const type = response.headers.get("Content-Type") || blob.type || "application/pdf";
  return new File([blob], filename, { type });
}

/** Open an applicant resume in a new tab (admin). Uses auth header, not a bare href. */
export async function openAdminApplicationResume(applicationId: string) {
  const token = await getAuthTokenAsync();
  const response = await fetch(
    `${apiBaseUrl}/api/admin/applications/${applicationId}/resume`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );

  if (!response.ok) {
    const data = (await parseJson(response)) as { error?: string } | null;
    throw new ApiError(response.status, data?.error || "Failed to open resume");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  // Revoke after the tab has a chance to load
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function toFormValues(application: Application): ApplicationFormValues {
  return {
    full_name: application.full_name,
    phone: application.phone ?? "",
    school: application.school ?? "",
    program: application.program ?? "",
    graduation_year:
      application.graduation_year != null
        ? String(application.graduation_year)
        : "",
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
    accessibility: application.accessibility ?? "",
    firstHackathon: application.first_hackathon,
    hackathonCount: application.hackathon_count ?? null,
    csCareer: application.cs_career,
    motivation: application.motivation ?? application.why_join ?? "",
    pastProject: application.past_project ?? application.project_idea ?? "",
    interests: application.interests ?? "",
    community: application.community ?? "",
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

export function toApplicationFormData(form: ApplicationForm): FormData {
  const formData = new FormData();
  formData.append("fullName", form.fullName);
  formData.append("phone", form.phone);
  formData.append("gender", form.gender);
  formData.append("institution", form.institution);
  formData.append("github", form.github);
  formData.append("linkedin", form.linkedin);
  if (form.resumeFile) formData.append("resumeFile", form.resumeFile);
  formData.append("dietary", form.dietary);
  formData.append("accessibility", form.accessibility);
  formData.append("firstHackathon", String(form.firstHackathon));
  if (form.hackathonCount != null) {
    formData.append("hackathonCount", String(form.hackathonCount));
  }
  formData.append("csCareer", String(form.csCareer));
  formData.append("motivation", form.motivation);
  formData.append("pastProject", form.pastProject);
  formData.append("interests", form.interests);
  formData.append("community", form.community);
  return formData;
}

export async function submitApplicationForm(formData: FormData) {
  return apiFetch<{ application: Application }>("/api/applications", {
    method: "POST",
    body: formData,
  });
}

export async function saveApplication(values: ApplicationFormValues) {
  return apiFetch<{ application: Application }>("/api/applications", {
    method: "POST",
    body: JSON.stringify(toApplicationPayload(values)),
  });
}

export async function saveApplicationV2(payload: ApplicationForm) {
  return submitApplicationForm(toApplicationFormData(payload));
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

/** Download registration answers as CSV (respects current admin filters). */
export async function downloadApplicationsCsv(params: {
  status?: string;
  gender?: string;
  search?: string;
} = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.gender) query.set("gender", params.gender);
  if (params.search) query.set("search", params.search);
  const suffix = query.toString() ? `?${query.toString()}` : "";

  const token = await getAuthTokenAsync();
  const response = await fetch(`${apiBaseUrl}/api/admin/applications/export${suffix}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const data = (await parseJson(response)) as { error?: string } | null;
    throw new ApiError(response.status, data?.error || "Export failed");
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition");
  const filename =
    disposition?.match(/filename="([^"]+)"/)?.[1] || "applications-export.csv";

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function fetchAdminApplication(id: string) {
  return apiFetch<{ application: Application; reviews: ApplicationReview[] }>(
    `/api/admin/applications/${id}`,
  );
}

export async function submitApplicationReview(
  id: string,
  body: {
    score?: number;
    notes?: string;
    status: "pending" | "approved" | "rejected";
  },
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
  // Clerk handles sign-out via useAuth().logout()
}
