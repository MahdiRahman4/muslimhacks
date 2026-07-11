/** Internal DB / admin review statuses */
export type ApplicationStatus = "draft" | "pending" | "approved" | "rejected";

/** Student dashboard statuses (mapped from ApplicationStatus + no-row default) */
export type DashboardApplicationStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "accepted"
  | "declined";

export const DASHBOARD_STATUSES: DashboardApplicationStatus[] = [
  "not_started",
  "in_progress",
  "submitted",
  "under_review",
  "accepted",
  "declined",
];

/**
 * Map DB application status → dashboard status.
 * No application row defaults to not_started.
 */
export function toDashboardStatus(
  status: ApplicationStatus | string | null | undefined,
): DashboardApplicationStatus {
  if (!status) {
    return "not_started";
  }

  switch (status) {
    case "draft":
      return "in_progress";
    case "pending":
      return "submitted";
    case "approved":
      return "accepted";
    case "rejected":
      return "declined";
    case "not_started":
    case "in_progress":
    case "submitted":
    case "under_review":
    case "accepted":
    case "declined":
      return status;
    default:
      return "not_started";
  }
}
