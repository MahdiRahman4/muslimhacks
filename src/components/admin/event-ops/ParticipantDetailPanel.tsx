import { useCallback, useEffect, useState } from "react";
import { BRAND } from "@/components/Shared";
import {
  claimParticipantMeal,
  fetchParticipantDetail,
  getEventOpsErrorMessage,
  EventOpsApiError,
} from "@/lib/event-ops-api";
import type { MealKey, ParticipantDetail } from "@/types/event-ops";
import { MEAL_KEYS } from "@/types/event-ops";

interface ParticipantDetailPanelProps {
  participantId: string | null;
  onUpdated: () => void;
}

function formatTime(ms: number | null) {
  if (!ms) return "—";
  return new Date(ms).toLocaleString();
}

function formatMealLabel(key: MealKey): string {
  return key.replace(/_/g, " ");
}

const cardStyle = {
  background: "rgba(245,238,227,0.03)",
  border: "1px solid rgba(221,168,83,0.1)",
};

function CheckinBadge({ status }: { status: ParticipantDetail["checkin_status"] }) {
  const checkedIn = status === "checked_in";
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full font-sans text-xs font-semibold whitespace-nowrap"
      style={
        checkedIn
          ? { color: "#5FA877", background: "rgba(95,168,119,0.12)", border: "1px solid rgba(95,168,119,0.35)" }
          : { color: BRAND.sand, background: "rgba(245,238,227,0.06)", border: "1px solid rgba(245,238,227,0.12)" }
      }
    >
      {checkedIn ? "Checked in" : "Not checked in"}
    </span>
  );
}

export function ParticipantDetailPanel({
  participantId,
  onUpdated,
}: ParticipantDetailPanelProps) {
  const [detail, setDetail] = useState<ParticipantDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mealError, setMealError] = useState<string | null>(null);
  const [claimingMeal, setClaimingMeal] = useState<MealKey | null>(null);

  const loadDetail = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    setMealError(null);
    try {
      const data = await fetchParticipantDetail(id);
      setDetail(data.participant);
    } catch (err) {
      setDetail(null);
      setError(getEventOpsErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!participantId) {
      setDetail(null);
      setError(null);
      setMealError(null);
      return;
    }
    void loadDetail(participantId);
  }, [participantId, loadDetail]);

  if (!participantId) {
    return (
      <div className="rounded-2xl p-6 flex flex-col gap-2" style={cardStyle}>
        <h2 className="font-display font-bold text-lg" style={{ letterSpacing: "-0.01em" }}>
          Participant detail
        </h2>
        <p className="font-sans text-sm" style={{ color: BRAND.sand }}>
          Select a participant from the table to view details and claim meals.
        </p>
      </div>
    );
  }

  const claimedKeys = new Set(detail?.meals.map((m) => m.meal_key) ?? []);

  const handleClaim = async (mealKey: MealKey) => {
    if (!participantId || claimingMeal) return;

    setClaimingMeal(mealKey);
    setMealError(null);

    try {
      await claimParticipantMeal(participantId, mealKey);
      await loadDetail(participantId);
      onUpdated();
    } catch (err) {
      setMealError(getEventOpsErrorMessage(err));
      if (err instanceof EventOpsApiError && err.code === "meal_already_claimed") {
        await loadDetail(participantId);
      }
    } finally {
      setClaimingMeal(null);
    }
  };

  return (
    <div className="rounded-2xl p-6 flex flex-col gap-4" style={cardStyle}>
      <h2 className="font-display font-bold text-lg" style={{ letterSpacing: "-0.01em" }}>
        Participant detail
      </h2>

      {loading && (
        <p className="font-sans text-sm" style={{ color: BRAND.sand }}>
          Loading…
        </p>
      )}

      {error && (
        <div
          className="rounded-lg px-3.5 py-2.5 font-sans text-sm"
          style={{ background: "rgba(196,112,112,0.1)", border: "1px solid rgba(196,112,112,0.3)", color: "#C47070" }}
        >
          {error}
        </div>
      )}

      {detail && !loading && (
        <>
          <div className="flex flex-col gap-1.5">
            <p className="font-display text-lg font-bold" style={{ color: BRAND.cream }}>{detail.full_name}</p>
            <p className="font-sans text-sm" style={{ color: BRAND.creamMuted }}>{detail.email}</p>
            <p className="font-sans text-sm" style={{ color: BRAND.creamMuted }}>Gender: {detail.gender || "—"}</p>
            <p className="font-mono text-sm" style={{ color: BRAND.sand }}>Code: {detail.public_checkin_code}</p>
            <div className="flex items-center gap-2">
              <span className="font-sans text-sm" style={{ color: BRAND.creamMuted }}>Status:</span>
              <CheckinBadge status={detail.checkin_status} />
            </div>
            <p className="font-sans text-sm" style={{ color: BRAND.creamMuted }}>
              Checked in: {formatTime(detail.checked_in_at)}
            </p>
            <p className="font-sans text-xs break-all" style={{ color: BRAND.sand }}>
              By: {detail.checked_in_by || "—"}
            </p>
          </div>

          <div>
            <p className="mb-2 font-sans text-xs uppercase tracking-[0.2em]" style={{ color: BRAND.gold, opacity: 0.7 }}>
              Meals claimed
            </p>
            {detail.meals.length === 0 ? (
              <p className="font-sans text-sm" style={{ color: BRAND.sand }}>None yet</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {detail.meals.map((meal) => (
                  <li key={meal.id} className="flex justify-between gap-2 font-sans text-sm">
                    <span className="capitalize" style={{ color: BRAND.cream }}>{formatMealLabel(meal.meal_key)}</span>
                    <span style={{ color: BRAND.sand }}>{formatTime(meal.claimed_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="mb-2 font-sans text-xs uppercase tracking-[0.2em]" style={{ color: BRAND.gold, opacity: 0.7 }}>
              Claim meal
            </p>
            <div className="grid grid-cols-2 gap-2">
              {MEAL_KEYS.map((key) => {
                const claimed = claimedKeys.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={claimed || claimingMeal !== null}
                    onClick={() => void handleClaim(key)}
                    className="px-3 py-2 rounded-lg font-sans text-xs font-medium capitalize transition-all duration-200 hover:opacity-80 disabled:cursor-not-allowed focus-visible:ring-2"
                    style={
                      claimed
                        ? { background: "rgba(95,168,119,0.12)", border: "1px solid rgba(95,168,119,0.35)", color: "#5FA877" }
                        : {
                            background: "rgba(245,238,227,0.06)",
                            border: "1px solid rgba(221,168,83,0.2)",
                            color: BRAND.cream,
                            opacity: claimingMeal !== null ? 0.6 : 1,
                          }
                    }
                  >
                    {claimingMeal === key
                      ? "Claiming…"
                      : claimed
                        ? `${formatMealLabel(key)} ✓`
                        : formatMealLabel(key)}
                  </button>
                );
              })}
            </div>
          </div>

          {mealError && (
            <div
              className="rounded-lg px-3.5 py-2.5 font-sans text-sm"
              style={{ background: "rgba(196,112,112,0.1)", border: "1px solid rgba(196,112,112,0.3)", color: "#C47070" }}
            >
              {mealError}
            </div>
          )}
        </>
      )}
    </div>
  );
}
