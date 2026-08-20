import { BRAND } from "@/components/Shared";
import type { EventOpsSummary, MealKey } from "@/types/event-ops";
import { MEAL_KEYS } from "@/types/event-ops";

interface SummaryStripProps {
  summary: EventOpsSummary | null;
  loading: boolean;
  error: string | null;
}

function formatMealLabel(key: MealKey): string {
  return key.replace(/_/g, " ");
}

function StatTile({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div
      className="flex flex-col gap-0.5 px-5 py-4 rounded-xl"
      style={{ background: "rgba(245,238,227,0.04)", border: "1px solid rgba(221,168,83,0.1)" }}
    >
      <span className="font-sans text-xs uppercase tracking-[0.22em]" style={{ color: BRAND.sand }}>
        {label}
      </span>
      <span className="font-display text-3xl font-bold" style={{ color: color ?? BRAND.cream }}>
        {value}
      </span>
    </div>
  );
}

export function SummaryStrip({ summary, loading, error }: SummaryStripProps) {
  if (error) {
    return (
      <div
        className="rounded-xl px-4 py-3 font-sans text-sm"
        style={{ color: "#C47070", background: "rgba(196,112,112,0.1)", border: "1px solid rgba(196,112,112,0.3)" }}
      >
        {error}
      </div>
    );
  }

  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <StatTile key={i} label="Loading…" value="—" color={BRAND.sand} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatTile label="Total participants" value={summary.participants.total} />
        <StatTile label="Checked in" value={summary.participants.checked_in} color="#5FA877" />
        <StatTile label="Not checked in" value={summary.participants.not_checked_in} color={BRAND.gold} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {MEAL_KEYS.map((key) => (
          <div
            key={key}
            className="flex flex-col gap-0.5 px-4 py-3 rounded-xl"
            style={{ background: "rgba(245,238,227,0.03)", border: "1px solid rgba(221,168,83,0.08)" }}
          >
            <span className="font-sans text-xs uppercase tracking-[0.18em] capitalize" style={{ color: BRAND.sand }}>
              {formatMealLabel(key)}
            </span>
            <span className="font-display text-xl font-bold" style={{ color: BRAND.cream }}>
              {summary.meals_claimed_by_key[key] ?? 0}
            </span>
            <span className="font-sans text-xs" style={{ color: BRAND.sand, opacity: 0.7 }}>
              meals claimed
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
