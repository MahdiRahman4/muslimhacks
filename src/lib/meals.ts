import type { MealKey } from "@/types/event-ops";
import { MEAL_KEYS } from "@/types/event-ops";

export const MEAL_LABELS: Record<MealKey, string> = {
  breakfast_day1: "Breakfast · Day 1",
  lunch_day1: "Lunch · Day 1",
  dinner_day1: "Dinner · Day 1",
  breakfast_day2: "Breakfast · Day 2",
  lunch_day2: "Lunch · Day 2",
};

export const MEAL_SHORT_LABELS: Record<MealKey, string> = {
  breakfast_day1: "B1",
  lunch_day1: "L1",
  dinner_day1: "D1",
  breakfast_day2: "B2",
  lunch_day2: "L2",
};

export function formatMealLabel(key: MealKey): string {
  return MEAL_LABELS[key] ?? key.replace(/_/g, " ");
}

export function formatMealShort(key: MealKey): string {
  return MEAL_SHORT_LABELS[key] ?? key;
}

export { MEAL_KEYS };
