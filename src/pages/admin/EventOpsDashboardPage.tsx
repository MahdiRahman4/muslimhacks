import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
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
import { ParticipantDetailPanel } from "@/components/admin/event-ops/ParticipantDetailPanel";
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

const EventOpsDashboardPage = () => {
  const { user, logout } = useAuth();
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

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailKey, setDetailKey] = useState(0);

  const queryParams = useMemo(
    () => ({
      ...filtersToQueryParams(filters),
      limit: PAGE_SIZE,
      offset,
    }),
    [filters, offset],
  );

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const data = await fetchEventOpsSummary();
      setSummary(data);
    } catch (err) {
      setSummaryError(getEventOpsErrorMessage(err));
    } finally {
      setSummaryLoading(false);
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
    void loadParticipants();
  }, [loadParticipants]);

  const handleFiltersChange = (next: ParticipantFilterValues) => {
    setFilters(next);
    setOffset(0);
  };

  const refreshAll = () => {
    void loadSummary();
    void loadParticipants();
    setDetailKey((k) => k + 1);
  };

  const handleCheckinSuccess = (participant: ParticipantSummary) => {
    setSelectedId(participant.id);
    refreshAll();
  };

  const handleSelectParticipant = (participant: ParticipantSummary) => {
    setSelectedId(participant.id);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <EventOpsHeader
        email={user.email}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={logout}
      />

      <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        {activeSection === "event-ops" ? (
          <>
            <SummaryStrip summary={summary} loading={summaryLoading} error={summaryError} />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <ParticipantFilters values={filters} onChange={handleFiltersChange} />
                <ParticipantsTable
                  participants={participants}
                  total={total}
                  offset={offset}
                  limit={PAGE_SIZE}
                  loading={tableLoading}
                  error={tableError}
                  selectedId={selectedId}
                  onSelect={handleSelectParticipant}
                  onPageChange={setOffset}
                />
              </div>

              <div className="space-y-4">
                <CheckinCard onSuccess={handleCheckinSuccess} />
                <ParticipantDetailPanel
                  key={`${selectedId ?? "none"}-${detailKey}`}
                  participantId={selectedId}
                  onUpdated={refreshAll}
                />
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
