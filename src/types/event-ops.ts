export type CheckinStatus = "not_checked_in" | "checked_in";

export type MealKey =
  | "breakfast_day1"
  | "lunch_day1"
  | "dinner_day1"
  | "breakfast_day2"
  | "lunch_day2";

export const MEAL_KEYS: MealKey[] = [
  "breakfast_day1",
  "lunch_day1",
  "dinner_day1",
  "breakfast_day2",
  "lunch_day2",
];

export interface ParticipantSummary {
  id: string;
  user_id: string;
  application_id: string;
  full_name: string;
  email: string;
  gender: string | null;
  public_checkin_code: string;
  checkin_status: CheckinStatus;
  checked_in_at: number | null;
  created_at: number;
  updated_at: number;
}

export interface ParticipantMeal {
  id: string;
  meal_key: MealKey;
  claimed_by: string;
  claimed_at: number;
}

export interface ParticipantDetail extends ParticipantSummary {
  checked_in_by: string | null;
  meals: ParticipantMeal[];
}

export interface EventOpsSummary {
  participants: {
    total: number;
    checked_in: number;
    not_checked_in: number;
  };
  meals_claimed_by_key: Record<MealKey, number>;
}

export interface ParticipantListParams {
  checked_in?: "true" | "false";
  gender?: string;
  search?: string;
  sort_by?: "created_at" | "checked_in_at";
  sort_order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface ParticipantListResponse {
  participants: ParticipantSummary[];
  pagination: { limit: number; offset: number; total: number };
  sort: { sort_by: string; sort_order: string };
}

export interface CheckinResponse {
  participant: ParticipantSummary;
  message?: string;
}

export interface ApiErrorBody {
  error: string;
  code?: string;
}
