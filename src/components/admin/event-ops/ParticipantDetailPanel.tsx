import { useCallback, useEffect, useState } from "react";
import { BRAND } from "@/components/Shared";
import {
  claimParticipantMeal,
  unclaimParticipantMeal,
  deleteParticipant,
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
  /** Off by default so the meal-line view cannot delete anyone by mistake. */
  allowDelete?: boolean;
  onDeleted?: () => void;
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

const dangerButtonStyle = {
  background: "rgba(196,112,112,0.85)",
  border: "1px solid rgba(196,112,112,0.5)",
  color: BRAND.cream,
};

const cancelButtonStyle = {
  background: "rgba(245,238,227,0.06)",
  border: "1px solid rgba(221,168,83,0.2)",
  color: BRAND.cream,
};

/**
 * Deleting is unrecoverable, so it takes three deliberate steps: open the
 * danger zone, confirm the person, then type their check-in code.
 */
function DeleteParticipantSection({
  detail,
  onDeleted,
}: {
  detail: ParticipantDetail;
  onDeleted?: () => void;
}) {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [typedCode, setTypedCode] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStep(0);
    setTypedCode("");
    setError(null);
  }, [detail.id]);

  const reset = () => {
    setStep(0);
    setTypedCode("");
    setError(null);
  };

  const mealCount = detail.meals.length;
  const codeMatches =
    typedCode.trim().toUpperCase() === detail.public_checkin_code.toUpperCase();

  const handleDelete = async () => {
    if (deleting || !codeMatches) return;

    setDeleting(true);
    setError(null);
    try {
      await deleteParticipant(detail.id, typedCode);
      onDeleted?.();
    } catch (err) {
      setError(getEventOpsErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  if (step === 0) {
    return (
      <div className="pt-2 border-t" style={{ borderColor: "rgba(221,168,83,0.1)" }}>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="mt-2 px-3 py-2 rounded-lg font-sans text-xs font-medium transition-all duration-200 hover:opacity-80"
          style={{
            background: "transparent",
            border: "1px solid rgba(196,112,112,0.3)",
            color: "#C47070",
          }}
        >
          Delete participant
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg p-3.5 flex flex-col gap-3"
      style={{
        background: "rgba(196,112,112,0.1)",
        border: "1px solid rgba(196,112,112,0.35)",
      }}
    >
      <p className="font-sans text-xs uppercase tracking-[0.2em]" style={{ color: "#C47070" }}>
        Step {step} of 3
      </p>

      {step === 1 && (
        <>
          <p className="font-sans text-sm" style={{ color: BRAND.cream }}>
            This permanently removes <strong>{detail.full_name}</strong> from event ops,
            along with {mealCount === 1 ? "1 meal claim" : `${mealCount} meal claims`}. It
            cannot be undone. Their application record stays.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 px-3 py-2 rounded-lg font-sans text-xs font-semibold transition-all duration-200 hover:opacity-80"
              style={dangerButtonStyle}
            >
              Continue
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 px-3 py-2 rounded-lg font-sans text-xs font-medium transition-all duration-200 hover:opacity-80"
              style={cancelButtonStyle}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <p className="font-sans text-sm" style={{ color: BRAND.cream }}>
            Is this the right person?
          </p>
          <div className="flex flex-col gap-0.5">
            <span className="font-display text-base font-bold" style={{ color: BRAND.cream }}>
              {detail.full_name}
            </span>
            <span className="font-sans text-sm break-all" style={{ color: BRAND.creamMuted }}>
              {detail.email}
            </span>
            <span className="font-mono text-sm" style={{ color: BRAND.sand }}>
              {detail.public_checkin_code}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 px-3 py-2 rounded-lg font-sans text-xs font-semibold transition-all duration-200 hover:opacity-80"
              style={dangerButtonStyle}
            >
              Yes, that's them
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 px-3 py-2 rounded-lg font-sans text-xs font-medium transition-all duration-200 hover:opacity-80"
              style={cancelButtonStyle}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <label
            className="font-sans text-sm"
            style={{ color: BRAND.cream }}
            htmlFor="delete-confirm-code"
          >
            Last check. Type{" "}
            <span className="font-mono font-bold" style={{ color: BRAND.sand }}>
              {detail.public_checkin_code}
            </span>{" "}
            to delete.
          </label>
          <input
            id="delete-confirm-code"
            value={typedCode}
            onChange={(event) => setTypedCode(event.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="Check-in code"
            className="w-full rounded-lg px-3 py-2.5 font-mono text-sm uppercase outline-none focus-visible:ring-2"
            style={{
              background: "rgba(6,15,32,0.5)",
              border: "1px solid rgba(196,112,112,0.35)",
              color: BRAND.cream,
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!codeMatches || deleting}
              onClick={() => void handleDelete()}
              className="flex-1 px-3 py-2 rounded-lg font-sans text-xs font-semibold transition-all duration-200 hover:opacity-80 disabled:cursor-not-allowed"
              style={{ ...dangerButtonStyle, opacity: !codeMatches || deleting ? 0.5 : 1 }}
            >
              {deleting ? "Deleting…" : "Delete permanently"}
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={reset}
              className="flex-1 px-3 py-2 rounded-lg font-sans text-xs font-medium transition-all duration-200 hover:opacity-80 disabled:cursor-not-allowed"
              style={cancelButtonStyle}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {error && (
        <p className="font-sans text-sm" style={{ color: "#C47070" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function ParticipantDetailPanel({
  participantId,
  initialParticipant,
  onUpdated,
  prominent = false,
  allowDelete = false,
  onDeleted,
}: ParticipantDetailPanelProps) {
  const [detail, setDetail] = useState<ParticipantDetail | null>(
    initialParticipant ? summaryToDetail(initialParticipant) : null,
  );
  const [loading, setLoading] = useState(!initialParticipant);
  const [error, setError] = useState<string | null>(null);
  const [mealError, setMealError] = useState<string | null>(null);
  const [claimingMeal, setClaimingMeal] = useState<MealKey | null>(null);
  const [confirmUndo, setConfirmUndo] = useState<MealKey | null>(null);
  const [undoingMeal, setUndoingMeal] = useState<MealKey | null>(null);

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
    setConfirmUndo(null);
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

  const handleUndo = async (mealKey: MealKey) => {
    if (!participantId || undoingMeal) return;

    setUndoingMeal(mealKey);
    setMealError(null);

    try {
      await unclaimParticipantMeal(participantId, mealKey);
      setConfirmUndo(null);
      await loadDetail(participantId);
      onUpdated();
    } catch (err) {
      setMealError(getEventOpsErrorMessage(err));
      if (err instanceof EventOpsApiError && err.code === "meal_not_claimed") {
        setConfirmUndo(null);
        await loadDetail(participantId);
      }
    } finally {
      setUndoingMeal(null);
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
                const sizing = prominent ? "px-4 py-4 text-sm" : "px-3 py-2 text-xs";

                if (claimed && confirmUndo === key) {
                  return (
                    <div
                      key={key}
                      className={`rounded-lg flex flex-col gap-2 ${sizing}`}
                      style={{
                        background: "rgba(196,112,112,0.1)",
                        border: "1px solid rgba(196,112,112,0.35)",
                      }}
                    >
                      <span className="font-sans font-medium" style={{ color: BRAND.cream }}>
                        Undo {formatMealLabel(key)}?
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={undoingMeal !== null}
                          onClick={() => void handleUndo(key)}
                          className="flex-1 px-3 py-2 rounded-lg font-sans text-xs font-semibold transition-all duration-200 hover:opacity-80 disabled:cursor-not-allowed focus-visible:ring-2"
                          style={{
                            background: "rgba(196,112,112,0.85)",
                            border: "1px solid rgba(196,112,112,0.5)",
                            color: BRAND.cream,
                            opacity: undoingMeal !== null ? 0.6 : 1,
                          }}
                        >
                          {undoingMeal === key ? "Undoing…" : "Yes, undo"}
                        </button>
                        <button
                          type="button"
                          disabled={undoingMeal !== null}
                          onClick={() => setConfirmUndo(null)}
                          className="flex-1 px-3 py-2 rounded-lg font-sans text-xs font-medium transition-all duration-200 hover:opacity-80 disabled:cursor-not-allowed focus-visible:ring-2"
                          style={{
                            background: "rgba(245,238,227,0.06)",
                            border: "1px solid rgba(221,168,83,0.2)",
                            color: BRAND.cream,
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={
                      claimed
                        ? undoingMeal !== null
                        : !checkedIn || claimingMeal !== null
                    }
                    onClick={() =>
                      claimed ? setConfirmUndo(key) : void handleClaim(key)
                    }
                    className={`rounded-lg font-sans font-medium transition-all duration-200 hover:opacity-80 disabled:cursor-not-allowed focus-visible:ring-2 ${sizing}`}
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
                        ? `${formatMealLabel(key)} · got it · undo`
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

          {allowDelete && (
            <DeleteParticipantSection detail={detail} onDeleted={onDeleted} />
          )}
        </>
      )}
    </div>
  );
}
