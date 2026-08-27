import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, Download, ChevronLeft, ChevronRight,
  ChevronUp, ChevronDown, ChevronsUpDown, SlidersHorizontal,
} from "lucide-react";
import { BRAND, GoldText, Eyebrow, GLOBAL_CSS } from "@/components/Shared";
import muslimHacksLogo from "@/assets/muslimhacks-logo-white.svg";
import {
  downloadApplicationsCsv,
  fetchAdminApplications,
  fetchAdminDietarySummary,
  fetchAdminUsersWithoutApplication,
  submitBulkApplicationReview,
} from "@/lib/api";
import type {
  AdminApplicationSummary,
  AdminUserWithoutApplication,
  ApplicationStatus,
} from "@/types/application";
import Profile from "@/components/ui/profile";

type ListView = "applications" | "not_applied" | "allergies";
type SortKey = "full_name" | "email" | "gender" | "status" | "created_at";
type SortDir = "asc" | "desc";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 25;

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const STATUS_STYLES: Record<ApplicationStatus, { label: string; color: string; bg: string; border: string }> = {
  draft: { label: "Draft", color: BRAND.goldSoft, bg: "rgba(221,168,83,0.1)", border: "rgba(221,168,83,0.3)" },
  pending: { label: "Pending", color: BRAND.purpleLight, bg: "rgba(155,124,176,0.12)", border: "rgba(155,124,176,0.35)" },
  approved: { label: "Approved", color: "#5FA877", bg: "rgba(95,168,119,0.12)", border: "rgba(95,168,119,0.35)" },
  rejected: { label: "Rejected", color: "#C47070", bg: "rgba(196,112,112,0.1)", border: "rgba(196,112,112,0.3)" },
};

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full font-sans text-xs font-semibold whitespace-nowrap"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  );
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={13} style={{ color: "rgba(201,187,168,0.3)" }} />;
  return sortDir === "asc"
    ? <ChevronUp size={13} style={{ color: BRAND.gold }} />
    : <ChevronDown size={13} style={{ color: BRAND.gold }} />;
}

const STATUS_TABS: { key: ApplicationStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "draft", label: "Draft" },
  { key: "rejected", label: "Rejected" },
];

const selectStyle = {
  background: "rgba(245,238,227,0.06)",
  border: "1px solid rgba(221,168,83,0.18)",
  outline: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C9BBA8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
} as const;

const AdminApplicationsPage = () => {
  const [view, setView] = useState<ListView>("applications");
  const [applications, setApplications] = useState<AdminApplicationSummary[]>([]);
  const [signups, setSignups] = useState<AdminUserWithoutApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [notAppliedCount, setNotAppliedCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(DEFAULT_PAGE_SIZE);

  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [genderFilter, setGenderFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [dietaryAnswers, setDietaryAnswers] = useState<{ answer: string; count: number }[]>([]);
  const [dietaryNoneCount, setDietaryNoneCount] = useState(0);
  const [dietaryConsidered, setDietaryConsidered] = useState(0);
  const [dietaryApprovedOnly, setDietaryApprovedOnly] = useState(false);

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [listEpoch, setListEpoch] = useState(0);

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const offset = (page - 1) * pageSize;

    const request =
      view === "allergies"
        ? fetchAdminDietarySummary({ approvedOnly: dietaryApprovedOnly }).then((data) => {
            if (cancelled) return;
            setDietaryAnswers(data.answers);
            setDietaryNoneCount(data.none_count);
            setDietaryConsidered(data.considered);
            setApplications([]);
            setSignups([]);
            setTotal(data.answers.length);
            setSelectedIds([]);
          })
        : view === "not_applied"
        ? fetchAdminUsersWithoutApplication({
            search: search || undefined,
            limit: pageSize,
            offset,
            sortOrder: sortDir,
          }).then((data) => {
            if (cancelled) return;
            setSignups(data.users);
            setApplications([]);
            setTotal(data.pagination.total);
            setSelectedIds([]);
          })
        : fetchAdminApplications({
            status: statusFilter === "all" ? undefined : statusFilter,
            gender: genderFilter || undefined,
            search: search || undefined,
            limit: pageSize,
            offset,
            sortBy: sortKey,
            sortOrder: sortDir,
          }).then((data) => {
            if (cancelled) return;
            setApplications(data.applications);
            setSignups([]);
            setTotal(data.pagination.total);
            setSelectedIds([]);
          });

    request
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load list");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [view, statusFilter, genderFilter, search, page, pageSize, sortKey, sortDir, listEpoch, dietaryApprovedOnly]);

  useEffect(() => {
    let cancelled = false;
    const statuses: ApplicationStatus[] = ["draft", "pending", "approved", "rejected"];

    Promise.all([
      Promise.all(
        statuses.map((s) =>
          fetchAdminApplications({ status: s, limit: 1 }).then((data) => [s, data.pagination.total] as const),
        ),
      ),
      fetchAdminUsersWithoutApplication({ limit: 1 }).then((data) => data.pagination.total),
    ])
      .then(([statusCounts, unsigned]) => {
        if (cancelled) return;
        const next: Record<string, number> = {};
        let all = 0;
        for (const [key, value] of statusCounts) {
          next[key] = value;
          all += value;
        }
        next.all = all;
        setCounts(next);
        setNotAppliedCount(unsigned);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  function toggleSort(col: SortKey) {
    if (sortKey === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col);
      setSortDir(col === "created_at" ? "desc" : "asc");
    }
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageIds = applications.map((row) => row.id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const selectedOnPage = applications.filter((row) => selectedIds.includes(row.id));
  const selectedApproves = selectedOnPage.filter((row) => row.status !== "approved");

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const toggleSelectAllOnPage = () => {
    setSelectedIds((current) => {
      if (allOnPageSelected) {
        return current.filter((id) => !pageIds.includes(id));
      }
      return [...new Set([...current, ...pageIds])];
    });
  };

  const handleBulkApprove = async () => {
    if (selectedApproves.length === 0 || bulkApproving) return;
    const confirmed = window.confirm(
      `Approve ${selectedApproves.length} selected application${selectedApproves.length === 1 ? "" : "s"}? They will get the acceptance email.`,
    );
    if (!confirmed) return;

    setBulkApproving(true);
    setError(null);
    try {
      const result = await submitBulkApplicationReview(
        selectedApproves.map((row) => row.id),
        "approved",
      );
      if (result.failed.length > 0) {
        setError(`Approved ${result.updated}, skipped ${result.skipped}, failed ${result.failed.length}.`);
      }
      setSelectedIds([]);
      setListEpoch((value) => value + 1);
      setCounts((current) => ({
        ...current,
        pending: Math.max(0, (current.pending ?? 0) - result.updated),
        approved: (current.approved ?? 0) + result.updated,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve selected applications");
    } finally {
      setBulkApproving(false);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    setError(null);
    try {
      await downloadApplicationsCsv({
        status: statusFilter === "all" ? undefined : statusFilter,
        gender: genderFilter || undefined,
        search: search || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  const TH = ({ col, children }: { col: SortKey; children: React.ReactNode }) => (
    <th className="px-4 py-3 text-left">
      <button
        onClick={() => toggleSort(col)}
        className="flex items-center gap-1.5 font-sans text-xs uppercase tracking-[0.2em] font-medium hover:opacity-80 transition-opacity focus-visible:ring-2 rounded whitespace-nowrap"
        style={{ color: BRAND.sand }}
      >
        {children}
        <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
      </button>
    </th>
  );

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: BRAND.navyDeep, color: BRAND.cream }}
    >
      <style>{GLOBAL_CSS}</style>

      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(6,15,32,0.95)", backdropFilter: "blur(14px)", borderColor: "rgba(221,168,83,0.1)" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img src={muslimHacksLogo} alt="MuslimHacks" className="h-6 w-auto object-contain" />
            </Link>
            <div className="h-4 w-px" style={{ background: "rgba(221,168,83,0.2)" }} />
            <span className="font-sans text-xs uppercase tracking-[0.22em] font-medium" style={{ color: BRAND.sand }}>
              Admin
            </span>
          </div>

          <div className="flex items-center gap-2">
            {view === "applications" && (
              <button
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-sans text-xs font-medium transition-all duration-200 hover:opacity-80 focus-visible:ring-2 disabled:opacity-50"
                style={{ background: "rgba(245,238,227,0.06)", border: "1px solid rgba(221,168,83,0.18)", color: BRAND.cream }}
                onClick={() => void handleExportCsv()}
                disabled={exporting}
              >
                <Download size={13} style={{ color: BRAND.gold }} />
                {exporting ? "Exporting..." : "Export CSV"}
              </button>
            )}
            <Profile />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <Eyebrow>Admin</Eyebrow>
          <h1
            className="font-display font-black leading-tight"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", letterSpacing: "-0.02em" }}
          >
            Applications <GoldText>2026</GoldText>
          </h1>
          <p className="font-intimate text-base" style={{ fontStyle: "italic", color: BRAND.creamMuted }}>
            Review applications, and see who signed up but never applied.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Applied", value: counts.all ?? 0 },
            { label: "Pending", value: counts.pending ?? 0 },
            { label: "Approved", value: counts.approved ?? 0 },
            { label: "Rejected", value: counts.rejected ?? 0 },
            { label: "Signed up, no app", value: notAppliedCount },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-0.5 px-5 py-4 rounded-xl"
              style={{ background: "rgba(245,238,227,0.04)", border: "1px solid rgba(221,168,83,0.1)" }}
            >
              <span className="font-sans text-xs uppercase tracking-[0.22em]" style={{ color: BRAND.sand }}>{s.label}</span>
              <span className="font-display text-3xl font-bold" style={{ color: BRAND.cream }}>{s.value}</span>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl p-5 flex flex-col gap-5"
          style={{ background: "rgba(245,238,227,0.03)", border: "1px solid rgba(221,168,83,0.1)" }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal size={14} style={{ color: BRAND.sand }} className="shrink-0" />
            {STATUS_TABS.map((t) => {
              const active = view === "applications" && statusFilter === t.key;
              const st = t.key !== "all" ? STATUS_STYLES[t.key as ApplicationStatus] : null;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    setView("applications");
                    setStatusFilter(t.key);
                    setPage(1);
                    setSortKey("created_at");
                    setSortDir("desc");
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-sans text-xs font-medium transition-all duration-200 focus-visible:ring-2 whitespace-nowrap"
                  style={active ? {
                    background: st ? st.bg : "rgba(221,168,83,0.12)",
                    border: `1px solid ${st ? st.border : "rgba(221,168,83,0.4)"}`,
                    color: st ? st.color : BRAND.gold,
                  } : {
                    background: "rgba(245,238,227,0.04)",
                    border: "1px solid rgba(245,238,227,0.08)",
                    color: BRAND.sand,
                  }}
                >
                  {t.label}
                  <span className="font-sans text-xs tabular-nums" style={{ opacity: 0.7 }}>
                    {counts[t.key] ?? 0}
                  </span>
                </button>
              );
            })}
            <button
              onClick={() => {
                setView("allergies");
                setPage(1);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-sans text-xs font-medium transition-all duration-200 focus-visible:ring-2 whitespace-nowrap"
              style={view === "allergies" ? {
                background: "rgba(221,168,83,0.12)",
                border: "1px solid rgba(221,168,83,0.4)",
                color: BRAND.gold,
              } : {
                background: "rgba(245,238,227,0.04)",
                border: "1px solid rgba(245,238,227,0.08)",
                color: BRAND.sand,
              }}
            >
              Allergies
            </button>
            <button
              onClick={() => {
                setView("not_applied");
                setPage(1);
                setSortKey("created_at");
                setSortDir("desc");
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-sans text-xs font-medium transition-all duration-200 focus-visible:ring-2 whitespace-nowrap"
              style={view === "not_applied" ? {
                background: "rgba(221,168,83,0.12)",
                border: "1px solid rgba(221,168,83,0.4)",
                color: BRAND.gold,
              } : {
                background: "rgba(245,238,227,0.04)",
                border: "1px solid rgba(245,238,227,0.08)",
                color: BRAND.sand,
              }}
            >
              Signed up, no app
              <span className="font-sans text-xs tabular-nums" style={{ opacity: 0.7 }}>
                {notAppliedCount}
              </span>
            </button>
          </div>

          {view === "allergies" ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-sans text-sm" style={{ color: BRAND.sand }}>
                Distinct allergy / dietary answers from {dietaryConsidered} {dietaryApprovedOnly ? "approved" : "pending + approved"} applications. No names.
              </p>
              <label className="flex items-center gap-2 font-sans text-xs" style={{ color: BRAND.cream }}>
                <input
                  type="checkbox"
                  checked={dietaryApprovedOnly}
                  onChange={(e) => setDietaryApprovedOnly(e.target.checked)}
                  className="accent-[#DDA853]"
                />
                Approved only
              </label>
            </div>
          ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: BRAND.sand }} />
              <input
                type="search"
                placeholder={view === "not_applied" ? "Search by email…" : "Search by name or email…"}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 font-sans text-sm rounded-lg focus-visible:ring-2 focus-visible:ring-offset-1"
                style={{ background: "rgba(245,238,227,0.06)", border: "1px solid rgba(221,168,83,0.18)", color: BRAND.cream, outline: "none" }}
              />
            </div>

            {view === "applications" && (
              <select
                value={genderFilter || "all"}
                onChange={(e) => { setGenderFilter(e.target.value === "all" ? "" : e.target.value); setPage(1); }}
                className="px-4 py-2.5 font-sans text-sm rounded-lg focus-visible:ring-2 appearance-none"
                style={{
                  ...selectStyle,
                  color: genderFilter ? BRAND.cream : BRAND.sand,
                  minWidth: "140px",
                }}
              >
                <option value="all" style={{ background: BRAND.navy }}>All genders</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value} style={{ background: BRAND.navy }}>
                    {g.label}
                  </option>
                ))}
              </select>
            )}

            <select
              value={`${sortKey}:${sortDir}`}
              onChange={(e) => {
                const [key, dir] = e.target.value.split(":") as [SortKey, SortDir];
                setSortKey(key);
                setSortDir(dir);
                setPage(1);
              }}
              className="px-4 py-2.5 font-sans text-sm rounded-lg focus-visible:ring-2 appearance-none"
              style={{
                ...selectStyle,
                color: BRAND.cream,
                minWidth: "160px",
              }}
            >
              <option value="created_at:desc" style={{ background: BRAND.navy }}>Newest first</option>
              <option value="created_at:asc" style={{ background: BRAND.navy }}>Oldest first</option>
            </select>
          </div>
          )}
        </div>

        {error && (
          <div
            className="rounded-xl px-4 py-3 font-sans text-sm"
            style={{ color: "#C47070", background: "rgba(196,112,112,0.1)", border: "1px solid rgba(196,112,112,0.3)" }}
          >
            {error}
          </div>
        )}

        {view === "applications" && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAllOnPage}
              disabled={loading || applications.length === 0}
              className="px-3.5 py-2 rounded-lg font-sans text-xs font-medium transition-all duration-200 hover:opacity-80 disabled:opacity-40 focus-visible:ring-2"
              style={{ background: "rgba(245,238,227,0.06)", border: "1px solid rgba(221,168,83,0.18)", color: BRAND.cream }}
            >
              {allOnPageSelected ? "Clear page" : "Select all on this page"}
            </button>
            <button
              type="button"
              onClick={() => void handleBulkApprove()}
              disabled={bulkApproving || selectedApproves.length === 0}
              className="px-3.5 py-2 rounded-lg font-sans text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-200 hover:brightness-110 disabled:opacity-40 focus-visible:ring-2"
              style={{
                background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
                color: BRAND.navyDeep,
              }}
            >
              {bulkApproving
                ? "Approving…"
                : `Approve selected${selectedApproves.length ? ` (${selectedApproves.length})` : ""}`}
            </button>
            {selectedIds.length > 0 && (
              <span className="font-sans text-xs" style={{ color: BRAND.sand }}>
                {selectedIds.length} selected
              </span>
            )}
          </div>
        )}

        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(221,168,83,0.1)" }}
        >
          <div className="overflow-x-auto">
            {view === "allergies" ? (
              <table className="w-full table-fixed min-w-[560px]">
                <colgroup>
                  <col style={{ width: "80%" }} />
                  <col style={{ width: "20%" }} />
                </colgroup>
                <thead style={{ background: "rgba(75,46,99,0.2)", borderBottom: "1px solid rgba(221,168,83,0.1)" }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.2em] font-medium" style={{ color: BRAND.sand }}>
                      Answer
                    </th>
                    <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.2em] font-medium" style={{ color: BRAND.sand }}>
                      People
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-16 text-center">
                        <p className="font-intimate text-lg" style={{ fontStyle: "italic", color: BRAND.sand }}>
                          Loading allergies…
                        </p>
                      </td>
                    </tr>
                  ) : (
                    <>
                      <tr style={{ borderBottom: "1px solid rgba(221,168,83,0.07)" }}>
                        <td className="px-4 py-3.5">
                          <span className="font-sans text-sm" style={{ color: BRAND.creamMuted }}>
                            None / blank
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-sans text-sm tabular-nums" style={{ color: BRAND.cream }}>
                            {dietaryNoneCount}
                          </span>
                        </td>
                      </tr>
                      {dietaryAnswers.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="px-6 py-12 text-center">
                            <p className="font-intimate text-lg" style={{ fontStyle: "italic", color: BRAND.sand }}>
                              Nobody listed a dietary restriction.
                            </p>
                          </td>
                        </tr>
                      ) : dietaryAnswers.map((row, i) => (
                        <tr
                          key={row.answer}
                          style={{
                            borderBottom: i < dietaryAnswers.length - 1 ? "1px solid rgba(221,168,83,0.07)" : "none",
                          }}
                        >
                          <td className="px-4 py-3.5">
                            <span className="font-sans text-sm whitespace-pre-wrap" style={{ color: BRAND.cream }}>
                              {row.answer}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-sans text-sm tabular-nums" style={{ color: BRAND.cream }}>
                              {row.count}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            ) : view === "not_applied" ? (
              <table className="w-full table-fixed min-w-[560px]">
                <colgroup>
                  <col style={{ width: "55%" }} />
                  <col style={{ width: "45%" }} />
                </colgroup>
                <thead style={{ background: "rgba(75,46,99,0.2)", borderBottom: "1px solid rgba(221,168,83,0.1)" }}>
                  <tr>
                    <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.2em] font-medium" style={{ color: BRAND.sand }}>
                      Email
                    </th>
                    <TH col="created_at">Signed up</TH>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-16 text-center">
                        <p className="font-intimate text-lg" style={{ fontStyle: "italic", color: BRAND.sand }}>
                          Loading sign-ups…
                        </p>
                      </td>
                    </tr>
                  ) : signups.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-16 text-center">
                        <p className="font-intimate text-lg" style={{ fontStyle: "italic", color: BRAND.sand }}>
                          Everyone who signed up has also applied.
                        </p>
                      </td>
                    </tr>
                  ) : signups.map((row, i) => (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: i < signups.length - 1 ? "1px solid rgba(221,168,83,0.07)" : "none",
                      }}
                    >
                      <td className="px-4 py-3.5 overflow-hidden">
                        <span className="font-sans text-sm block truncate" style={{ color: BRAND.cream }}>{row.email}</span>
                      </td>
                      <td className="px-4 py-3.5 overflow-hidden">
                        <span className="font-sans text-xs tabular-nums block truncate" style={{ color: BRAND.sand }}>
                          {new Date(row.created_at).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full table-fixed min-w-[880px]">
                <colgroup>
                    <col style={{ width: "44px" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "13%" }} />
                    <col style={{ width: "5%" }} />
                  </colgroup>
                <thead style={{ background: "rgba(75,46,99,0.2)", borderBottom: "1px solid rgba(221,168,83,0.1)" }}>
                  <tr>
                    <th className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={allOnPageSelected}
                        onChange={toggleSelectAllOnPage}
                        aria-label="Select all applications on this page"
                        className="h-4 w-4 rounded"
                      />
                    </th>
                    <TH col="full_name">Name</TH>
                    <TH col="email">Email</TH>
                    <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.2em] font-medium" style={{ color: BRAND.sand }}>Program</th>
                    <TH col="gender">Gender</TH>
                    <TH col="status">Status</TH>
                    <TH col="created_at">Submitted</TH>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <p className="font-intimate text-lg" style={{ fontStyle: "italic", color: BRAND.sand }}>
                          Loading applications…
                        </p>
                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <p className="font-intimate text-lg" style={{ fontStyle: "italic", color: BRAND.sand }}>
                          No applications match your filters.
                        </p>
                      </td>
                    </tr>
                  ) : applications.map((row, i) => (
                    <tr
                      key={row.id}
                      className="group transition-colors duration-150"
                      style={{
                        borderBottom: i < applications.length - 1 ? "1px solid rgba(221,168,83,0.07)" : "none",
                        background: selectedIds.includes(row.id) ? "rgba(221,168,83,0.06)" : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!selectedIds.includes(row.id)) {
                          e.currentTarget.style.background = "rgba(245,238,227,0.03)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = selectedIds.includes(row.id)
                          ? "rgba(221,168,83,0.06)"
                          : "transparent";
                      }}
                    >
                      <td className="px-3 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(row.id)}
                          onChange={() => toggleSelected(row.id)}
                          aria-label={`Select ${row.full_name}`}
                          className="h-4 w-4 rounded"
                        />
                      </td>
                      <td className="px-4 py-3.5 overflow-hidden">
                        <Link
                          to={`/admin/applications/${row.id}`}
                          className="font-sans text-sm font-medium block truncate hover:underline"
                          style={{ color: BRAND.cream }}
                        >
                          {row.full_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 overflow-hidden">
                        <span className="font-sans text-sm block truncate" style={{ color: BRAND.creamMuted }}>{row.email}</span>
                      </td>
                      <td className="px-4 py-3.5 overflow-hidden">
                        <span className="font-sans text-sm block truncate" style={{ color: BRAND.sand }}>{row.program || "—"}</span>
                      </td>
                      <td className="px-4 py-3.5 overflow-hidden">
                        <span className="font-sans text-sm block truncate" style={{ color: BRAND.creamMuted }}>
                          {row.gender || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3.5 overflow-hidden">
                        <span className="font-sans text-xs tabular-nums block truncate" style={{ color: BRAND.sand }}>
                          {new Date(row.created_at).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          to={`/admin/applications/${row.id}`}
                          className="font-sans text-xs hover:opacity-80 transition-opacity focus-visible:ring-2 rounded px-2 py-1"
                          style={{ color: BRAND.purpleLight }}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {view !== "allergies" && (
          <div
            className="px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t"
            style={{ borderColor: "rgba(221,168,83,0.08)", background: "rgba(6,15,32,0.3)" }}
          >
            <div className="flex items-center gap-3 flex-wrap">
              <p className="font-sans text-xs whitespace-nowrap" style={{ color: BRAND.sand }}>
                Showing {total === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
              </p>
              <label className="flex items-center gap-2 font-sans text-xs" style={{ color: BRAND.sand }}>
                Per page
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number]);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-lg font-sans text-xs appearance-none focus-visible:ring-2"
                  style={{
                    ...selectStyle,
                    color: BRAND.cream,
                    paddingRight: "1.75rem",
                  }}
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size} style={{ background: BRAND.navy }}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={loading || page === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-sans text-xs font-medium transition-all duration-200 hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2"
                style={{ background: "rgba(245,238,227,0.06)", border: "1px solid rgba(221,168,83,0.15)", color: BRAND.cream }}
              >
                <ChevronLeft size={13} /> Previous
              </button>
              <span className="font-sans text-xs tabular-nums px-2" style={{ color: BRAND.sand }}>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={loading || page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-sans text-xs font-medium transition-all duration-200 hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2"
                style={{ background: "rgba(245,238,227,0.06)", border: "1px solid rgba(221,168,83,0.15)", color: BRAND.cream }}
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminApplicationsPage;
