import { getAuthTokenAsync } from "./auth-token";
import type {
  AdminApplicationSummary,
  Application,
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

export async function submitApplicationForm(formData: FormData) {
  return apiFetch<{ application: Application }>("/api/applications", {
    method: "POST",
    body: formData,
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
  // Clerk handles sign-out via useAuth().logout()
}
