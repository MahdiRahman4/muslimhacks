/** Internal DB / admin review statuses */
export type ApplicationStatus = "draft" | "pending" | "approved" | "rejected";

/**
 * Statuses shown on the student dashboard: the raw application status,
 * plus not_started when the user has no application row yet.
 */
export type DashboardApplicationStatus = "not_started" | ApplicationStatus;

export const DASHBOARD_STATUSES: DashboardApplicationStatus[] = [
  "not_started",
  "draft",
  "pending",
  "approved",
  "rejected",
];

/** No application row defaults to not_started; otherwise pass through. */
export function toDashboardStatus(
  status: ApplicationStatus | string | null | undefined,
): DashboardApplicationStatus {
  if (
    status === "draft" ||
    status === "pending" ||
    status === "approved" ||
    status === "rejected"
  ) {
    return status;
  }
  return "not_started";
}
