import { ChevronLeft, ChevronRight } from "lucide-react";
import { BRAND } from "@/components/Shared";
import type { ParticipantSummary } from "@/types/event-ops";

interface ParticipantsTableProps {
  participants: ParticipantSummary[];
  total: number;
  offset: number;
  limit: number;
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (participant: ParticipantSummary) => void;
  onPageChange: (offset: number) => void;
}

function formatTime(ms: number | null) {
  if (!ms) return "—";
  return new Date(ms).toLocaleString();
}

function CheckinBadge({ status }: { status: ParticipantSummary["checkin_status"] }) {
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

export function ParticipantsTable({
  participants,
  total,
  offset,
  limit,
  loading,
  error,
  selectedId,
  onSelect,
  onPageChange,
}: ParticipantsTableProps) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(221,168,83,0.1)" }}>
      <div className="px-5 py-3.5 flex items-center justify-between gap-3" style={{ borderBottom: "1px solid rgba(221,168,83,0.1)" }}>
        <h2 className="font-display font-bold text-base" style={{ letterSpacing: "-0.01em" }}>
          Participants ({total})
        </h2>
        {loading && (
          <span className="font-sans text-xs" style={{ color: BRAND.sand }}>
            Loading…
          </span>
        )}
      </div>

      {error && (
        <div
          className="mx-5 mt-4 rounded-xl px-4 py-3 font-sans text-sm"
          style={{ color: "#C47070", background: "rgba(196,112,112,0.1)", border: "1px solid rgba(196,112,112,0.3)" }}
        >
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        {!loading && participants.length === 0 ? (
          <p className="px-6 py-16 text-center font-intimate text-lg" style={{ fontStyle: "italic", color: BRAND.sand }}>
            No participants match these filters.
          </p>
        ) : (
          <table className="w-full min-w-[720px]">
            <thead style={{ background: "rgba(75,46,99,0.2)", borderBottom: "1px solid rgba(221,168,83,0.1)" }}>
              <tr>
                {["Name", "Email", "Gender", "Code", "Status", "Checked in"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.2em] font-medium whitespace-nowrap"
                    style={{ color: BRAND.sand }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {participants.map((p, i) => {
                const selected = selectedId === p.id;
                return (
                  <tr
                    key={p.id}
                    className="cursor-pointer transition-colors duration-150"
                    style={{
                      borderBottom: i < participants.length - 1 ? "1px solid rgba(221,168,83,0.07)" : "none",
                      background: selected ? "rgba(221,168,83,0.08)" : "transparent",
                    }}
                    onClick={() => onSelect(p)}
                    onMouseEnter={(e) => {
                      if (!selected) e.currentTarget.style.background = "rgba(245,238,227,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <td className="px-4 py-3.5 overflow-hidden">
                      <span className="font-sans text-sm font-medium block truncate" style={{ color: BRAND.cream }}>
                        {p.full_name}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 overflow-hidden">
                      <span className="font-sans text-sm block truncate" style={{ color: BRAND.creamMuted }}>
                        {p.email}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 overflow-hidden">
                      <span className="font-sans text-sm block truncate" style={{ color: BRAND.creamMuted }}>
                        {p.gender || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 overflow-hidden">
                      <span className="font-mono text-xs block truncate" style={{ color: BRAND.sand }}>
                        {p.public_checkin_code}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <CheckinBadge status={p.checkin_status} />
                    </td>
                    <td className="px-4 py-3.5 overflow-hidden">
                      <span className="font-sans text-xs tabular-nums block truncate" style={{ color: BRAND.sand }}>
                        {formatTime(p.checked_in_at)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div
        className="px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t"
        style={{ borderColor: "rgba(221,168,83,0.08)", background: "rgba(6,15,32,0.3)" }}
      >
        <p className="font-sans text-xs whitespace-nowrap" style={{ color: BRAND.sand }}>
          {total === 0
            ? "Showing 0"
            : `Showing ${offset + 1}–${Math.min(offset + participants.length, total)} of ${total}`}
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={loading || offset === 0}
            onClick={() => onPageChange(Math.max(0, offset - limit))}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-sans text-xs font-medium transition-all duration-200 hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2"
            style={{ background: "rgba(245,238,227,0.06)", border: "1px solid rgba(221,168,83,0.15)", color: BRAND.cream }}
          >
            <ChevronLeft size={13} /> Previous
          </button>
          <button
            disabled={loading || offset + limit >= total}
            onClick={() => onPageChange(offset + limit)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-sans text-xs font-medium transition-all duration-200 hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2"
            style={{ background: "rgba(245,238,227,0.06)", border: "1px solid rgba(221,168,83,0.15)", color: BRAND.cream }}
          >
            Next <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
