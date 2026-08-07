import type { Env } from "../env";

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

export interface ParticipantRow {
  id: string;
  user_id: string;
  application_id: string;
  full_name: string;
  email: string;
  gender: string | null;
  public_checkin_code: string;
  checkin_status: CheckinStatus;
  checked_in_at: number | null;
  checked_in_by: string | null;
  created_at: number;
  updated_at: number;
}

export interface ParticipantMealRow {
  id: string;
  participant_id: string;
  meal_key: MealKey;
  claimed_by: string;
  claimed_at: number;
}

export function isMealKey(value: string): value is MealKey {
  return (MEAL_KEYS as string[]).includes(value);
}

function generateCheckinCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export async function getParticipantByUserId(
  env: Env,
  userId: string,
): Promise<ParticipantRow | null> {
  return env.DB.prepare("SELECT * FROM participants WHERE user_id = ? LIMIT 1")
    .bind(userId)
    .first<ParticipantRow>();
}

export async function ensureParticipantForApprovedApplication(
  env: Env,
  applicationId: string,
): Promise<ParticipantRow | null> {
  const application = await env.DB.prepare(
    `SELECT a.id, a.user_id, a.full_name, a.gender, u.email
     FROM applications a
     JOIN users u ON u.id = a.user_id
     WHERE a.id = ?
     LIMIT 1`,
  )
    .bind(applicationId)
    .first<{
      id: string;
      user_id: string;
      full_name: string;
      gender: string | null;
      email: string;
    }>();

  if (!application) {
    return null;
  }

  const existing = await env.DB.prepare(
    "SELECT * FROM participants WHERE user_id = ? LIMIT 1",
  )
    .bind(application.user_id)
    .first<ParticipantRow>();

  const now = Date.now();

  if (existing) {
    await env.DB.prepare(
      `UPDATE participants
       SET application_id = ?, full_name = ?, email = ?, gender = ?, updated_at = ?
       WHERE id = ?`,
    )
      .bind(
        application.id,
        application.full_name,
        application.email,
        application.gender,
        now,
        existing.id,
      )
      .run();

    return env.DB.prepare("SELECT * FROM participants WHERE id = ? LIMIT 1")
      .bind(existing.id)
      .first<ParticipantRow>();
  }

  const id = crypto.randomUUID();
  let publicCheckinCode = generateCheckinCode();

  for (let attempt = 0; attempt < 5; attempt++) {
    const collision = await env.DB.prepare(
      "SELECT id FROM participants WHERE public_checkin_code = ? LIMIT 1",
    )
      .bind(publicCheckinCode)
      .first();

    if (!collision) {
      break;
    }
    publicCheckinCode = generateCheckinCode();
  }

  await env.DB.prepare(
    `INSERT INTO participants (
      id, user_id, application_id, full_name, email, gender,
      public_checkin_code, checkin_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'not_checked_in', ?, ?)`,
  )
    .bind(
      id,
      application.user_id,
      application.id,
      application.full_name,
      application.email,
      application.gender,
      publicCheckinCode,
      now,
      now,
    )
    .run();

  return env.DB.prepare("SELECT * FROM participants WHERE id = ? LIMIT 1")
    .bind(id)
    .first<ParticipantRow>();
}
