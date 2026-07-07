import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Participant detail</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a participant from the table to view details and claim meals.
          </p>
        </CardContent>
      </Card>
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Participant detail</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {detail && !loading && (
          <>
            <div className="space-y-1 text-sm">
              <p className="text-lg font-semibold">{detail.full_name}</p>
              <p>{detail.email}</p>
              <p>Gender: {detail.gender || "—"}</p>
              <p className="font-mono">Code: {detail.public_checkin_code}</p>
              <p>
                Status:{" "}
                <Badge variant={detail.checkin_status === "checked_in" ? "default" : "secondary"}>
                  {detail.checkin_status.replace("_", " ")}
                </Badge>
              </p>
              <p>Checked in: {formatTime(detail.checked_in_at)}</p>
              <p className="text-xs text-muted-foreground break-all">
                By: {detail.checked_in_by || "—"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Meals claimed</p>
              {detail.meals.length === 0 ? (
                <p className="text-sm text-muted-foreground">None yet</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {detail.meals.map((meal) => (
                    <li key={meal.id} className="flex justify-between gap-2">
                      <span className="capitalize">{formatMealLabel(meal.meal_key)}</span>
                      <span className="text-muted-foreground">{formatTime(meal.claimed_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Claim meal</p>
              <div className="grid grid-cols-2 gap-2">
                {MEAL_KEYS.map((key) => {
                  const claimed = claimedKeys.has(key);
                  return (
                    <Button
                      key={key}
                      variant={claimed ? "secondary" : "outline"}
                      size="sm"
                      disabled={claimed || claimingMeal !== null}
                      onClick={() => void handleClaim(key)}
                    >
                      {claimingMeal === key
                        ? "Claiming…"
                        : claimed
                          ? `${formatMealLabel(key)} ✓`
                          : formatMealLabel(key)}
                    </Button>
                  );
                })}
              </div>
            </div>

            {mealError && (
              <Alert variant="destructive">
                <AlertDescription>{mealError}</AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
