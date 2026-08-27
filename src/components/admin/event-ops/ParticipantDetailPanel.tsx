import { useCallback, useEffect, useState } from "react";
import { BRAND } from "@/components/Shared";
import {
  claimParticipantMeal,
  fetchParticipantDetail,
  getEventOpsErrorMessage,
  EventOpsApiError,
} from "@/lib/event-ops-api";
import type { MealKey, ParticipantDetail, ParticipantSummary } from "@/types/event-ops";
import { MEAL_KEYS } from "@/types/event-ops";
import { formatMealLabel } from "@/lib/meals";
import { FoodWaveBadge } from "@/components/FoodWaveBadge";

interface ParticipantDetailPanelProps {
  participantId: string | null;
  initialParticipant?: ParticipantSummary;
  onUpdated: () => void;
  prominent?: boolean;
}

function summaryToDetail(summary: ParticipantSummary): ParticipantDetail {
  return {
    ...summary,
    checked_in_by: null,
    meals: summary.claimed_meals.map((meal_key) => ({
      id: meal_key,
      meal_key,
      claimed_by: "",
      claimed_at: 0,
    })),
  };
}

function formatTime(ms: number | null) {
  if (!ms) return "—";
  return new Date(ms).toLocaleString();
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
  initialParticipant,
  onUpdated,
  prominent = false,
}: ParticipantDetailPanelProps) {
  const [detail, setDetail] = useState<ParticipantDetail | null>(
    initialParticipant ? summaryToDetail(initialParticipant) : null,
  );
  const [loading, setLoading] = useState(!initialParticipant);
  const [error, setError] = useState<string | null>(null);
  const [mealError, setMealError] = useState<string | null>(null);
  const [claimingMeal, setClaimingMeal] = useState<MealKey | null>(null);

  const loadDetail = useCallback(async (id: string, silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    setMealError(null);
    try {
      const data = await fetchParticipantDetail(id);
      setDetail(data.participant);
    } catch (err) {
      if (!silent) {
        setDetail(null);
      }
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
    if (initialParticipant?.id === participantId) {
      setDetail(summaryToDetail(initialParticipant));
      void loadDetail(participantId, true);
      return;
    }
    void loadDetail(participantId);
  }, [participantId, initialParticipant, loadDetail]);

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
  const checkedIn = detail?.checkin_status === "checked_in";

  const handleClaim = async (mealKey: MealKey) => {
    if (!participantId || claimingMeal || !checkedIn) return;

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
        {prominent ? "Food counter" : "Participant detail"}
      </h2>

      {loading && !detail && (
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

      {detail && (
        <>
          <div className="flex flex-col gap-1.5">
            <p className="font-display text-lg font-bold" style={{ color: BRAND.cream }}>{detail.full_name}</p>
            <p className="font-sans text-sm" style={{ color: BRAND.creamMuted }}>{detail.email}</p>
            <p className="font-sans text-sm" style={{ color: BRAND.creamMuted }}>Gender: {detail.gender || "—"}</p>
            {detail.food_wave && (
              <div className="pt-2">
                <FoodWaveBadge wave={detail.food_wave} size={prominent ? "lg" : "sm"} />
              </div>
            )}
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
              Meals
            </p>
            {!checkedIn && (
              <p className="mb-3 font-sans text-sm" style={{ color: BRAND.goldSoft }}>
                Check this person in before marking meals.
              </p>
            )}
            <div className={prominent ? "flex flex-col gap-2" : "grid grid-cols-2 gap-2"}>
              {MEAL_KEYS.map((key) => {
                const claimed = claimedKeys.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={!checkedIn || claimed || claimingMeal !== null}
                    onClick={() => void handleClaim(key)}
                    className={`rounded-lg font-sans font-medium transition-all duration-200 hover:opacity-80 disabled:cursor-not-allowed focus-visible:ring-2 ${
                      prominent ? "px-4 py-4 text-sm" : "px-3 py-2 text-xs"
                    }`}
                    style={
                      claimed
                        ? { background: "rgba(95,168,119,0.12)", border: "1px solid rgba(95,168,119,0.35)", color: "#5FA877" }
                        : {
                            background: "rgba(245,238,227,0.06)",
                            border: "1px solid rgba(221,168,83,0.2)",
                            color: BRAND.cream,
                            opacity: !checkedIn || claimingMeal !== null ? 0.6 : 1,
                          }
                    }
                  >
                    {claimingMeal === key
                      ? "Marking…"
                      : claimed
                        ? `${formatMealLabel(key)} · got it`
                        : `${formatMealLabel(key)} · not yet`}
                  </button>
                );
              })}
            </div>
          </div>

          {detail.meals.some((meal) => meal.claimed_at > 0) && (
            <div>
              <p className="mb-2 font-sans text-xs uppercase tracking-[0.2em]" style={{ color: BRAND.gold, opacity: 0.7 }}>
                Claimed at
              </p>
              <ul className="flex flex-col gap-1.5">
                {detail.meals
                  .filter((meal) => meal.claimed_at > 0)
                  .map((meal) => (
                  <li key={meal.id} className="flex justify-between gap-2 font-sans text-sm">
                    <span style={{ color: BRAND.cream }}>{formatMealLabel(meal.meal_key)}</span>
                    <span style={{ color: BRAND.sand }}>{formatTime(meal.claimed_at)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
