import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BRAND, GoldText, Eyebrow, GLOBAL_CSS } from "@/components/Shared";
import {
  fetchEventOpsSummary,
  fetchParticipants,
  getEventOpsErrorMessage,
} from "@/lib/event-ops-api";
import type { EventOpsSummary, ParticipantSummary } from "@/types/event-ops";
import { EventOpsHeader } from "@/components/admin/event-ops/EventOpsHeader";
import { SummaryStrip } from "@/components/admin/event-ops/SummaryStrip";
import {
  ParticipantFilters,
  filtersToQueryParams,
  type ParticipantFilterValues,
} from "@/components/admin/event-ops/ParticipantFilters";
import { ParticipantsTable } from "@/components/admin/event-ops/ParticipantsTable";
import { CheckinCard } from "@/components/admin/event-ops/CheckinCard";
import { ExportsSection } from "@/components/admin/event-ops/ExportsSection";

/**
 * How to test:
 * 1. Start worker: cd worker && npm run dev
 * 2. Start frontend: npm run dev
 * 3. Promote admin: npx wrangler d1 execute DB --local --command "UPDATE users SET role='admin' WHERE email='...'"
 * 4. Login at /login, open /admin/event-ops
 * 5. Approve an application first so participants exist
 */

const PAGE_SIZE = 50;

const DEFAULT_FILTERS: ParticipantFilterValues = {
  search: "",
  checkedIn: "all",
  gender: "all",
  sortBy: "created_at",
  sortOrder: "desc",
};

const SECTION_TABS: { key: "event-ops" | "exports"; label: string }[] = [
  { key: "event-ops", label: "Event Ops" },
  { key: "exports", label: "Exports" },
];

const EventOpsDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<"event-ops" | "exports">("event-ops");

  const [summary, setSummary] = useState<EventOpsSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ParticipantFilterValues>(DEFAULT_FILTERS);
  const [participants, setParticipants] = useState<ParticipantSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState(DEFAULT_FILTERS.search);

  const queryParams = useMemo(
    () => ({
      ...filtersToQueryParams({ ...filters, search: debouncedSearch }),
      limit: PAGE_SIZE,
      offset,
    }),
    [filters.checkedIn, filters.gender, filters.sortBy, filters.sortOrder, debouncedSearch, offset],
  );

  const loadSummary = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setSummaryLoading(true);
    }
    setSummaryError(null);
    try {
      const data = await fetchEventOpsSummary();
      setSummary(data);
    } catch (err) {
      setSummaryError(getEventOpsErrorMessage(err));
    } finally {
      if (!options?.silent) {
        setSummaryLoading(false);
      }
    }
  }, []);

  const loadParticipants = useCallback(async () => {
    setTableLoading(true);
    setTableError(null);
    try {
      const data = await fetchParticipants(queryParams);
      setParticipants(data.participants);
      setTotal(data.pagination.total);
    } catch (err) {
      setTableError(getEventOpsErrorMessage(err));
    } finally {
      setTableLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [filters.search]);

  useEffect(() => {
    void loadParticipants();
  }, [loadParticipants]);

  const handleFiltersChange = (next: ParticipantFilterValues) => {
    setFilters(next);
    setOffset(0);
  };

  const openParticipantPage = (participant: ParticipantSummary) => {
    void loadSummary({ silent: true });
    navigate(`/admin/event-ops/participants/${participant.id}`, {
      state: { participant },
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen font-sans" style={{ background: BRAND.navyDeep, color: BRAND.cream }}>
      <style>{GLOBAL_CSS}</style>

      <EventOpsHeader />

      <main className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <Eyebrow>Admin</Eyebrow>
          <h1
            className="font-display font-black leading-tight"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", letterSpacing: "-0.02em" }}
          >
            Event <GoldText>Operations</GoldText>
          </h1>
          <p className="font-intimate text-base" style={{ fontStyle: "italic", color: BRAND.creamMuted }}>
            Check participants in, track meal claims, and export data.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {SECTION_TABS.map((t) => {
            const active = activeSection === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveSection(t.key)}
                className="px-4 py-1.5 rounded-full font-sans text-xs font-medium transition-all duration-200 focus-visible:ring-2 whitespace-nowrap"
                style={
                  active
                    ? {
                        background: "rgba(221,168,83,0.12)",
                        border: "1px solid rgba(221,168,83,0.4)",
                        color: BRAND.gold,
                      }
                    : {
                        background: "rgba(245,238,227,0.04)",
                        border: "1px solid rgba(245,238,227,0.08)",
                        color: BRAND.sand,
                      }
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {activeSection === "event-ops" ? (
          <>
            <SummaryStrip summary={summary} loading={summaryLoading} error={summaryError} />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="flex flex-col gap-4 lg:col-span-2">
                <ParticipantFilters values={filters} onChange={handleFiltersChange} />
                <ParticipantsTable
                  participants={participants}
                  total={total}
                  offset={offset}
                  limit={PAGE_SIZE}
                  loading={tableLoading}
                  error={tableError}
                  onSelect={openParticipantPage}
                  onPageChange={setOffset}
                />
              </div>

              <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
                <CheckinCard onSuccess={openParticipantPage} />
              </div>
            </div>
          </>
        ) : (
          <ExportsSection currentFilters={filtersToQueryParams(filters)} />
        )}
      </main>
    </div>
  );
};

export default EventOpsDashboardPage;
