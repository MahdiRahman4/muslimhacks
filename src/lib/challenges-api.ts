import { apiFetch, ApiError } from "@/lib/api";
import { getAuthTokenAsync } from "@/lib/auth-token";
import type { AdminChallengesResponse, ChallengesResponse } from "@/types/challenges";

const rawApiBaseUrl = import.meta.env.VITE_API_URL || "";
const apiBaseUrl = rawApiBaseUrl.endsWith("/")
  ? rawApiBaseUrl.slice(0, -1)
  : rawApiBaseUrl;

export async function fetchChallenges() {
  return apiFetch<ChallengesResponse>("/api/challenges");
}

export async function selectChallenge(challengeId: string, ipAcknowledged = false) {
  return apiFetch<ChallengesResponse>("/api/challenges", {
    method: "POST",
    body: JSON.stringify({
      challenge_id: challengeId,
      ip_acknowledged: ipAcknowledged,
    }),
  });
}

export async function fetchAdminChallenges() {
  return apiFetch<AdminChallengesResponse>("/api/admin/challenges");
}

export async function downloadChallengePicksCsv() {
  const token = await getAuthTokenAsync();
  const response = await fetch(`${apiBaseUrl}/api/admin/challenges/export`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new ApiError(response.status, "Export failed");
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition");
  const filename =
    disposition?.match(/filename="([^"]+)"/)?.[1] || "challenge-picks.csv";

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
