import { useState } from "react";
import { Download } from "lucide-react";
import { BRAND } from "@/components/Shared";
import {
  buildParticipantExportQuery,
  downloadCsvExport,
  getEventOpsErrorMessage,
} from "@/lib/event-ops-api";
import type { ParticipantListParams } from "@/types/event-ops";

interface ExportsSectionProps {
  currentFilters: ParticipantListParams;
}

const EXPORTS: { key: string; label: string; path: (filteredQuery: string) => string }[] = [
  { key: "all", label: "All participants", path: () => "/api/admin/participants/export" },
  { key: "filtered", label: "Filtered participants", path: (q) => `/api/admin/participants/export${q}` },
  { key: "checkins", label: "Check-ins", path: () => "/api/admin/reports/checkins/export" },
  { key: "meals", label: "Meal claims", path: () => "/api/admin/reports/meals/export" },
];

export function ExportsSection({ currentFilters }: ExportsSectionProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runExport = async (key: string, path: string) => {
    setLoading(key);
    setError(null);
    try {
      await downloadCsvExport(path);
    } catch (err) {
      setError(getEventOpsErrorMessage(err));
    } finally {
      setLoading(null);
    }
  };

  const filteredQuery = buildParticipantExportQuery(currentFilters);

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{ background: "rgba(245,238,227,0.03)", border: "1px solid rgba(221,168,83,0.1)" }}
    >
      <h2 className="font-display font-bold text-lg" style={{ letterSpacing: "-0.01em" }}>
        CSV exports
      </h2>
      <p className="font-sans text-sm" style={{ color: BRAND.creamMuted }}>
        Downloads open directly from the Worker export endpoints.
      </p>

      {error && (
        <div
          className="rounded-lg px-3.5 py-2.5 font-sans text-sm"
          style={{ background: "rgba(196,112,112,0.1)", border: "1px solid rgba(196,112,112,0.3)", color: "#C47070" }}
        >
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {EXPORTS.map((exp) => (
          <button
            key={exp.key}
            type="button"
            disabled={loading !== null}
            onClick={() => void runExport(exp.key, exp.path(filteredQuery))}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-sans text-xs font-medium transition-all duration-200 hover:opacity-80 focus-visible:ring-2 disabled:opacity-50"
            style={{ background: "rgba(245,238,227,0.06)", border: "1px solid rgba(221,168,83,0.18)", color: BRAND.cream }}
          >
            <Download size={13} style={{ color: BRAND.gold }} />
            {loading === exp.key ? "Exporting…" : exp.label}
          </button>
        ))}
      </div>
    </div>
  );
}
