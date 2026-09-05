import { useState } from "react";
import { BRAND } from "@/components/Shared";
import {
  checkinByCode,
  createWalkInParticipant,
  getEventOpsErrorMessage,
  EventOpsApiError,
} from "@/lib/event-ops-api";
import type { ParticipantSummary } from "@/types/event-ops";
import { QrCheckinScanner } from "./QrCheckinScanner";
import { FoodWaveBadge } from "@/components/FoodWaveBadge";

interface CheckinCardProps {
  onSuccess: (participant: ParticipantSummary) => void;
}

type CheckinMode = "type" | "scan" | "walkin";

const cardStyle = {
  background: "rgba(245,238,227,0.03)",
  border: "1px solid rgba(221,168,83,0.1)",
};

export function CheckinCard({ onSuccess }: CheckinCardProps) {
  const [mode, setMode] = useState<CheckinMode>("scan");
  const [code, setCode] = useState("");
  const [walkInName, setWalkInName] = useState("");
  const [walkInEmail, setWalkInEmail] = useState("");
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

  const handleWalkInSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || !walkInName.trim() || !walkInEmail.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setInfo(null);

    try {
      const data = await createWalkInParticipant(walkInName, walkInEmail);
      setSuccess(data.participant);
      setInfo(
        data.created
          ? `Added ${data.participant.full_name} and checked them in.`
          : data.message ?? `${data.participant.full_name} was already registered.`,
      );
      onSuccess(data.participant);
      setWalkInName("");
      setWalkInEmail("");
    } catch (err) {
      setError(getEventOpsErrorMessage(err));
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
    <div className="rounded-2xl p-4 sm:p-6 flex flex-col gap-4" style={cardStyle}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-display font-bold text-lg" style={{ letterSpacing: "-0.01em" }}>
          Check-in
        </h2>
        <div className="flex gap-1.5 shrink-0">
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
          <button
            type="button"
            onClick={() => setMode("walkin")}
            className="px-3 py-1.5 rounded-full font-sans text-xs font-medium transition-all duration-200 focus-visible:ring-2 whitespace-nowrap"
            style={
              mode === "walkin"
                ? { background: "rgba(221,168,83,0.12)", border: "1px solid rgba(221,168,83,0.4)", color: BRAND.gold }
                : { background: "rgba(245,238,227,0.04)", border: "1px solid rgba(245,238,227,0.08)", color: BRAND.sand }
            }
          >
            Walk-in
          </button>
        </div>
      </div>

      {mode === "scan" && (
        <QrCheckinScanner onSuccess={handleScanSuccess} disabled={submitting} />
      )}

      {mode === "walkin" && (
        <form onSubmit={handleWalkInSubmit} className="flex flex-col gap-3">
          <p className="font-sans text-xs" style={{ color: BRAND.sand }}>
            Adds someone who is not registered yet and checks them in.
          </p>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="walkin-name" className="font-sans text-xs uppercase tracking-[0.18em]" style={{ color: BRAND.sand }}>
              Full name
            </label>
            <input
              id="walkin-name"
              value={walkInName}
              onChange={(e) => setWalkInName(e.target.value)}
              placeholder="e.g. Aisha Rahman"
              autoComplete="off"
              disabled={submitting}
              className="w-full px-3.5 py-2.5 rounded-lg font-sans text-sm focus:outline-none placeholder:opacity-40 disabled:opacity-60"
              style={{ background: "rgba(245,238,227,0.06)", border: "1px solid rgba(221,168,83,0.2)", color: BRAND.cream }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="walkin-email" className="font-sans text-xs uppercase tracking-[0.18em]" style={{ color: BRAND.sand }}>
              Email
            </label>
            <input
              id="walkin-email"
              type="email"
              inputMode="email"
              value={walkInEmail}
              onChange={(e) => setWalkInEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="off"
              autoCapitalize="none"
              disabled={submitting}
              className="w-full px-3.5 py-2.5 rounded-lg font-sans text-sm focus:outline-none placeholder:opacity-40 disabled:opacity-60"
              style={{ background: "rgba(245,238,227,0.06)", border: "1px solid rgba(221,168,83,0.2)", color: BRAND.cream }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !walkInName.trim() || !walkInEmail.trim()}
            className="w-full py-3 rounded-full font-sans text-sm font-semibold uppercase tracking-[0.16em] transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 disabled:opacity-60"
            style={{
              background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
              color: BRAND.navyDeep,
              boxShadow: "0 0 18px rgba(221,168,83,0.25), 0 4px 12px rgba(221,168,83,0.15)",
            }}
          >
            {submitting ? "Adding…" : "Add and check in"}
          </button>
        </form>
      )}

      {mode === "type" && (
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

      {mode !== "scan" && success && (
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

      {mode !== "scan" && info && (
        <div
          className="rounded-lg px-3.5 py-2.5 font-sans text-sm"
          style={{ background: "rgba(221,168,83,0.08)", border: "1px solid rgba(221,168,83,0.25)", color: BRAND.goldSoft }}
        >
          {info}
        </div>
      )}

      {mode !== "scan" && error && (
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
