import { useState } from "react";
import { BRAND } from "@/components/Shared";
import { checkinByCode, getEventOpsErrorMessage, EventOpsApiError } from "@/lib/event-ops-api";
import type { ParticipantSummary } from "@/types/event-ops";
import { QrCheckinScanner } from "./QrCheckinScanner";
import { FoodWaveBadge } from "@/components/FoodWaveBadge";

interface CheckinCardProps {
  onSuccess: (participant: ParticipantSummary) => void;
}

type CheckinMode = "type" | "scan";

const cardStyle = {
  background: "rgba(245,238,227,0.03)",
  border: "1px solid rgba(221,168,83,0.1)",
};

export function CheckinCard({ onSuccess }: CheckinCardProps) {
  const [mode, setMode] = useState<CheckinMode>("scan");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<ParticipantSummary | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || !code.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setInfo(null);

    try {
      const data = await checkinByCode(code);
      setSuccess(data.participant);
      if (data.message) {
        setInfo(data.message);
      }
      onSuccess(data.participant);
      setCode("");
    } catch (err) {
      if (err instanceof EventOpsApiError && err.code === "already_checked_in" && err.participant) {
        setSuccess(err.participant);
        setInfo(err.message);
        onSuccess(err.participant);
        setCode("");
      } else if (err instanceof EventOpsApiError && err.code === "already_checked_in") {
        setInfo(err.message);
        setError(null);
      } else {
        setError(getEventOpsErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleScanSuccess = (participant: ParticipantSummary) => {
    setSuccess(participant);
    setError(null);
    onSuccess(participant);
  };

  return (
    <div className="rounded-2xl p-6 flex flex-col gap-4" style={cardStyle}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display font-bold text-lg" style={{ letterSpacing: "-0.01em" }}>
          Check-in
        </h2>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setMode("scan")}
            className="px-3 py-1.5 rounded-full font-sans text-xs font-medium transition-all duration-200 focus-visible:ring-2 whitespace-nowrap"
            style={
              mode === "scan"
                ? { background: "rgba(221,168,83,0.12)", border: "1px solid rgba(221,168,83,0.4)", color: BRAND.gold }
                : { background: "rgba(245,238,227,0.04)", border: "1px solid rgba(245,238,227,0.08)", color: BRAND.sand }
            }
          >
            Scan QR
          </button>
          <button
            type="button"
            onClick={() => setMode("type")}
            className="px-3 py-1.5 rounded-full font-sans text-xs font-medium transition-all duration-200 focus-visible:ring-2 whitespace-nowrap"
            style={
              mode === "type"
                ? { background: "rgba(221,168,83,0.12)", border: "1px solid rgba(221,168,83,0.4)", color: BRAND.gold }
                : { background: "rgba(245,238,227,0.04)", border: "1px solid rgba(245,238,227,0.08)", color: BRAND.sand }
            }
          >
            Type code
          </button>
        </div>
      </div>

      {mode === "scan" ? (
        <QrCheckinScanner onSuccess={handleScanSuccess} disabled={submitting} />
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="checkin-code" className="font-sans text-xs uppercase tracking-[0.18em]" style={{ color: BRAND.sand }}>
              Public check-in code
            </label>
            <input
              id="checkin-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SM53H769"
              disabled={submitting}
              className="w-full px-3.5 py-2.5 rounded-lg font-mono text-sm focus:outline-none placeholder:opacity-40 disabled:opacity-60"
              style={{ background: "rgba(245,238,227,0.06)", border: "1px solid rgba(221,168,83,0.2)", color: BRAND.cream }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !code.trim()}
            className="w-full py-3 rounded-full font-sans text-sm font-semibold uppercase tracking-[0.16em] transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 disabled:opacity-60"
            style={{
              background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
              color: BRAND.navyDeep,
              boxShadow: "0 0 18px rgba(221,168,83,0.25), 0 4px 12px rgba(221,168,83,0.15)",
            }}
          >
            {submitting ? "Checking in…" : "Check in"}
          </button>
        </form>
      )}

      {mode === "type" && success && (
        <div className="flex flex-col gap-2">
          {success.food_wave && <FoodWaveBadge wave={success.food_wave} size="lg" />}
          <div
            className="rounded-lg px-3.5 py-2.5 font-sans text-sm"
            style={{ background: "rgba(95,168,119,0.1)", border: "1px solid rgba(95,168,119,0.3)", color: "#5FA877" }}
          >
            <strong style={{ color: BRAND.cream }}>{success.full_name}</strong> — {success.checkin_status.replace("_", " ")}
          </div>
        </div>
      )}

      {mode === "type" && info && (
        <div
          className="rounded-lg px-3.5 py-2.5 font-sans text-sm"
          style={{ background: "rgba(221,168,83,0.08)", border: "1px solid rgba(221,168,83,0.25)", color: BRAND.goldSoft }}
        >
          {info}
        </div>
      )}

      {mode === "type" && error && (
        <div
          className="rounded-lg px-3.5 py-2.5 font-sans text-sm"
          style={{ background: "rgba(196,112,112,0.1)", border: "1px solid rgba(196,112,112,0.3)", color: "#C47070" }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
