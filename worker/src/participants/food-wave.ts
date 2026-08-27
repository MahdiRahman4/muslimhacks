export const FOOD_WAVE_SIZE = 40;

export const FOOD_WAVES = [
  { key: "red", label: "Red", hex: "#C45C5C", text_hex: "#F5EED3" },
  { key: "blue", label: "Blue", hex: "#4F7EC8", text_hex: "#F5EED3" },
  { key: "gold", label: "Gold", hex: "#DDA853", text_hex: "#060F20" },
  { key: "green", label: "Green", hex: "#3E8F62", text_hex: "#F5EED3" },
] as const;

export type FoodWave = (typeof FOOD_WAVES)[number];
export type FoodWaveKey = FoodWave["key"];

export function foodWaveFromRank(rank: number): FoodWave {
  const index = Math.min(
    Math.max(0, Math.floor(rank / FOOD_WAVE_SIZE)),
    FOOD_WAVES.length - 1,
  );
  return FOOD_WAVES[index];
}
