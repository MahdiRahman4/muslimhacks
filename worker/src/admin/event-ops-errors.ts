import type { JsonResponder } from "./auth";

export const EVENT_OPS_ERROR_CODES = {
  already_checked_in: {
    status: 409,
    error: "Participant is already checked in",
    code: "already_checked_in",
  },
  meal_already_claimed: {
    status: 409,
    error: "Meal already claimed for this participant",
    code: "meal_already_claimed",
  },
  meal_limit_reached: {
    status: 409,
    error: "Participant has already claimed the maximum of 5 meals",
    code: "meal_limit_reached",
  },
  invalid_checkin_code: {
    status: 404,
    error: "Invalid check-in code",
    code: "invalid_checkin_code",
  },
  not_checked_in: {
    status: 403,
    error: "Participant must be checked in before claiming meals",
    code: "not_checked_in",
  },
  invalid_meal_key: {
    status: 400,
    error: "Invalid mealKey",
    code: "invalid_meal_key",
  },
} as const;

export type EventOpsErrorCode = keyof typeof EVENT_OPS_ERROR_CODES;

export function respondEventOpsError(
  respond: JsonResponder,
  code: EventOpsErrorCode,
  extra?: Record<string, unknown>,
): Response {
  const payload = EVENT_OPS_ERROR_CODES[code];
  return respond({ error: payload.error, code: payload.code, ...extra }, payload.status);
}
