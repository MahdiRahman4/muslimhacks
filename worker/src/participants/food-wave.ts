import type { Env } from "../env";

export const FOOD_WAVES = [
  { key: "red", label: "Red", hex: "#C45C5C", text_hex: "#F5EED3" },
  { key: "blue", label: "Blue", hex: "#4F7EC8", text_hex: "#F5EED3" },
  { key: "gold", label: "Gold", hex: "#DDA853", text_hex: "#060F20" },
  { key: "green", label: "Green", hex: "#3E8F62", text_hex: "#F5EED3" },
] as const;

export type FoodWave = (typeof FOOD_WAVES)[number];
export type FoodWaveKey = FoodWave["key"];

const FOOD_WAVE_KEY_SET = new Set<string>(FOOD_WAVES.map((wave) => wave.key));

export function isFoodWaveKey(value: string | null | undefined): value is FoodWaveKey {
  return typeof value === "string" && FOOD_WAVE_KEY_SET.has(value);
}

export function foodWaveFromKey(key: string | null | undefined): FoodWave | null {
  if (!isFoodWaveKey(key)) {
    return null;
  }
  return FOOD_WAVES.find((wave) => wave.key === key) ?? null;
}

/** Alternate red → blue → gold → green for each new check-in. */
export function foodWaveFromArrivalRank(rank: number): FoodWave {
  const index = ((rank % FOOD_WAVES.length) + FOOD_WAVES.length) % FOOD_WAVES.length;
  return FOOD_WAVES[index];
}

async function takeNextArrivalRank(env: Env): Promise<number> {
  const row = await env.DB.prepare(
    `UPDATE food_wave_counter SET next_rank = next_rank + 1 WHERE id = 1 RETURNING next_rank`,
  ).first<{ next_rank: number }>();

  if (row) {
    return row.next_rank - 1;
  }

  await env.DB.prepare(
    `INSERT INTO food_wave_counter (id, next_rank) VALUES (1, 1)
     ON CONFLICT(id) DO UPDATE SET next_rank = next_rank + 1`,
  ).run();

  const created = await env.DB.prepare(
    "SELECT next_rank FROM food_wave_counter WHERE id = 1",
  ).first<{ next_rank: number }>();

  return Math.max(0, (created?.next_rank ?? 1) - 1);
}

async function undoArrivalRank(env: Env): Promise<void> {
  await env.DB.prepare(
    "UPDATE food_wave_counter SET next_rank = MAX(0, next_rank - 1) WHERE id = 1",
  ).run();
}

/**
 * First successful check-in gets the next colour. Later scans keep the same one.
 */
export async function assignFoodWaveAtCheckin(
  env: Env,
  participantId: string,
  existingKey: string | null | undefined,
): Promise<FoodWave | null> {
  const existing = foodWaveFromKey(existingKey);
  if (existing) {
    return existing;
  }

  const wave = foodWaveFromArrivalRank(await takeNextArrivalRank(env));
  const now = Date.now();
  const result = await env.DB.prepare(
    `UPDATE participants
     SET food_wave_key = ?, updated_at = ?
     WHERE id = ? AND food_wave_key IS NULL`,
  )
    .bind(wave.key, now, participantId)
    .run();

  if ((result.meta.changes ?? 0) === 0) {
    await undoArrivalRank(env);
    const row = await env.DB.prepare(
      "SELECT food_wave_key FROM participants WHERE id = ? LIMIT 1",
    )
      .bind(participantId)
      .first<{ food_wave_key: string | null }>();
    return foodWaveFromKey(row?.food_wave_key);
  }

  return wave;
}
