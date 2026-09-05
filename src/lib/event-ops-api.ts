import { getAuthTokenAsync } from "./auth-token";
import type {
  CheckinResponse,
  EventOpsSummary,
  MealKey,
  ParticipantDetail,
  ParticipantListParams,
  ParticipantListResponse,
  ParticipantSummary,
  ApiErrorBody,
} from "@/types/event-ops";
import { ApiError } from "./api";

const rawApiBaseUrl = import.meta.env.VITE_API_URL || "";
const apiBaseUrl = rawApiBaseUrl.endsWith("/")
  ? rawApiBaseUrl.slice(0, -1)
  : rawApiBaseUrl;

async function parseJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  return response.json();
}

export class EventOpsApiError extends ApiError {
  code?: string;
  participant?: ParticipantSummary;

  constructor(
    status: number,
    message: string,
    code?: string,
    participant?: ParticipantSummary,
  ) {
    super(status, message);
    this.name = "EventOpsApiError";
    this.code = code;
    this.participant = participant;
  }
}

async function eventOpsFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const token = await getAuthTokenAsync();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers });
  const data = (await parseJson(response)) as ApiErrorBody | null;

  if (!response.ok) {
    throw new EventOpsApiError(
      response.status,
      data?.error || "Request failed",
      data?.code,
      data?.participant,
    );
  }

  return data as T;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchEventOpsSummary() {
  return eventOpsFetch<EventOpsSummary>("/api/admin/event-ops/summary");
}

export async function fetchParticipants(params: ParticipantListParams = {}) {
  return eventOpsFetch<ParticipantListResponse>(
    `/api/admin/participants${buildQuery(params)}`,
  );
}

export async function fetchParticipantDetail(id: string) {
  return eventOpsFetch<{ participant: ParticipantDetail }>(
    `/api/admin/participants/${id}`,
  );
}

export async function checkinByCode(code: string) {
  try {
    return await eventOpsFetch<CheckinResponse>("/api/admin/participants/checkin/by-code", {
      method: "POST",
      body: JSON.stringify({ code: code.trim().toUpperCase() }),
    });
  } catch (error) {
    if (
      error instanceof EventOpsApiError &&
      error.code === "already_checked_in" &&
      error.participant
    ) {
      return {
        participant: error.participant,
        already_checked_in: true,
        message: error.message,
      } satisfies CheckinResponse;
    }
    throw error;
  }
}

export async function claimParticipantMeal(participantId: string, mealKey: MealKey) {
  return eventOpsFetch<{ meal: ParticipantDetail["meals"][0] }>(
    `/api/admin/participants/${participantId}/meals/${mealKey}/claim`,
    { method: "POST" },
  );
}

export async function unclaimParticipantMeal(participantId: string, mealKey: MealKey) {
  return eventOpsFetch<{ meal_key: MealKey; claimed: false }>(
    `/api/admin/participants/${participantId}/meals/${mealKey}/claim`,
    { method: "DELETE" },
  );
}

export async function downloadCsvExport(path: string) {
  const token = await getAuthTokenAsync();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const data = (await parseJson(response)) as ApiErrorBody | null;
    throw new EventOpsApiError(
      response.status,
      data?.error || "Export failed",
      data?.code,
    );
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition");
  const filename =
    disposition?.match(/filename="([^"]+)"/)?.[1] || "export.csv";

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function buildParticipantExportQuery(params: ParticipantListParams): string {
  return buildQuery({
    checked_in: params.checked_in,
    gender: params.gender,
    search: params.search,
    sort_by: params.sort_by,
    sort_order: params.sort_order,
  });
}

export function getEventOpsErrorMessage(error: unknown): string {
  if (error instanceof EventOpsApiError) {
    return error.code ? `${error.message} (${error.code})` : error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong";
}
