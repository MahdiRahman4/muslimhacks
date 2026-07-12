import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, Download, ChevronLeft, ChevronRight,
  ChevronUp, ChevronDown, ChevronsUpDown, ExternalLink, SlidersHorizontal, LogOut,
} from "lucide-react";
import { BRAND, GoldText, Eyebrow, GLOBAL_CSS } from "@/components/Shared";
import muslimHacksLogo from "@/assets/muslimhacks-logo-white.svg";
import { downloadApplicationsCsv, fetchAdminApplications } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { AdminApplicationSummary, ApplicationStatus } from "@/types/application";
import Profile from "@/components/ui/profile";

// ─── Types ────────────────────────────────────────────────────────────────────
type SortKey = "name" | "email" | "gender" | "status" | "updated";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 8;
const GENDER_OPTIONS = ["Male", "Female", "Prefer not to say"];

// ─── Status badge ─────────────────────────────────────────────────────────────
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

// ─── Sort icon ────────────────────────────────────────────────────────────────
function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={13} style={{ color: "rgba(201,187,168,0.3)" }} />;
  return sortDir === "asc"
    ? <ChevronUp size={13} style={{ color: BRAND.gold }} />
    : <ChevronDown size={13} style={{ color: BRAND.gold }} />;
}

function compareApplications(a: AdminApplicationSummary, b: AdminApplicationSummary, key: SortKey): number {
  if (key === "updated") return a.updated_at - b.updated_at;
  const field = key === "name" ? "full_name" : key;
  const av = (a[field as keyof AdminApplicationSummary] as string | null) ?? "";
  const bv = (b[field as keyof AdminApplicationSummary] as string | null) ?? "";
  return av.localeCompare(bv);
}

const STATUS_TABS: { key: ApplicationStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "draft", label: "Draft" },
  { key: "rejected", label: "Rejected" },
];

// ─── Admin page ───────────────────────────────────────────────────────────────
const AdminApplicationsPage = () => {
  const { logout } = useAuth();

  const [applications, setApplications] = useState<AdminApplicationSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);

  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [genderFilter, setGenderFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce free-text search before it hits the API.
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

    fetchAdminApplications({
      status: statusFilter === "all" ? undefined : statusFilter,
      gender: genderFilter || undefined,
      search: search || undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    })
      .then((data) => {
        if (cancelled) return;
        setApplications(data.applications);
        setTotal(data.pagination.total);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load applications");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [statusFilter, genderFilter, search, page]);

  // Status tab / stat pill counts reflect totals across all applications, not the active filters.
  useEffect(() => {
    let cancelled = false;
    const statuses: ApplicationStatus[] = ["draft", "pending", "approved", "rejected"];

    Promise.all(
      statuses.map((s) =>
        fetchAdminApplications({ status: s, limit: 1 }).then((data) => [s, data.pagination.total] as const),
      ),
    )
      .then((results) => {
        if (cancelled) return;
        const next: Record<string, number> = {};
        let all = 0;
        for (const [key, value] of results) {
          next[key] = value;
          all += value;
        }
        next.all = all;
        setCounts(next);
      })
      .catch(() => { });

    return () => {
      cancelled = true;
    };
  }, []);

  function toggleSort(col: SortKey) {
    if (sortKey === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(col);
      setSortDir("asc");
    }
  }

  const sortedApplications = useMemo(() => {
    const rows = [...applications];
    rows.sort((a, b) => {
      const cmp = compareApplications(a, b, sortKey);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [applications, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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

      {/* ── Header ─────────────────────────────────────────────────── */}
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
            <button
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-sans text-xs font-medium transition-all duration-200 hover:opacity-80 focus-visible:ring-2 disabled:opacity-50"
              style={{ background: "rgba(245,238,227,0.06)", border: "1px solid rgba(221,168,83,0.18)", color: BRAND.cream }}
              onClick={() => void handleExportCsv()}
              disabled={exporting}
            >
              <Download size={13} style={{ color: BRAND.gold }} />
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
            {/* <Link
              to="/admin/event-ops"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-sans text-xs font-medium transition-all duration-200 hover:opacity-80 focus-visible:ring-2"
              style={{ background: "rgba(245,238,227,0.06)", border: "1px solid rgba(221,168,83,0.18)", color: BRAND.cream }}
            >
              Event Ops
            </Link> */}
            {/* <Link
              to="/apply"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-sans text-xs font-medium transition-all duration-200 hover:opacity-80 focus-visible:ring-2"
              style={{ background: "rgba(245,238,227,0.06)", border: "1px solid rgba(221,168,83,0.18)", color: BRAND.cream }}
            >
              <ExternalLink size={13} style={{ color: BRAND.purpleLight }} />
              Applicant view
            </Link> */}
            <Profile />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8">

        {/* ── Page title ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-1">
          <Eyebrow>Admin</Eyebrow>
          <h1
            className="font-display font-black leading-tight"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", letterSpacing: "-0.02em" }}
          >
            Applications <GoldText>2026</GoldText>
          </h1>
          <p className="font-intimate text-base" style={{ fontStyle: "italic", color: BRAND.creamMuted }}>
            Review and manage hackathon registrations.
          </p>
        </div>

        {/* ── Stat pills ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: counts.all ?? 0 },
            { label: "Pending", value: counts.pending ?? 0 },
            { label: "Approved", value: counts.approved ?? 0 },
            { label: "Rejected", value: counts.rejected ?? 0 },
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

        {/* ── Filters ────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 flex flex-col gap-5"
          style={{ background: "rgba(245,238,227,0.03)", border: "1px solid rgba(221,168,83,0.1)" }}
        >
          {/* Status tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal size={14} style={{ color: BRAND.sand }} className="shrink-0" />
            {STATUS_TABS.map((t) => {
              const active = statusFilter === t.key;
              const st = t.key !== "all" ? STATUS_STYLES[t.key as ApplicationStatus] : null;
              return (
                <button
                  key={t.key}
                  onClick={() => { setStatusFilter(t.key); setPage(1); }}
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
                  <span
                    className="font-sans text-xs tabular-nums"
                    style={{ opacity: 0.7 }}
                  >
                    {counts[t.key] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search + gender */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: BRAND.sand }} />
              <input
                type="search"
                placeholder="Search by name or email…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 font-sans text-sm rounded-lg focus-visible:ring-2 focus-visible:ring-offset-1"
                style={{ background: "rgba(245,238,227,0.06)", border: "1px solid rgba(221,168,83,0.18)", color: BRAND.cream, outline: "none" }}
              />
            </div>

            <select
              value={genderFilter || "all"}
              onChange={(e) => { setGenderFilter(e.target.value === "all" ? "" : e.target.value); setPage(1); }}
              className="px-4 py-2.5 font-sans text-sm rounded-lg focus-visible:ring-2 appearance-none"
              style={{
                background: "rgba(245,238,227,0.06)",
                border: "1px solid rgba(221,168,83,0.18)",
                color: genderFilter ? BRAND.cream : BRAND.sand,
                outline: "none",
                minWidth: "140px",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C9BBA8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
              }}
            >
              <option value="all" style={{ background: BRAND.navy }}>All genders</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g} style={{ background: BRAND.navy }}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div
            className="rounded-xl px-4 py-3 font-sans text-sm"
            style={{ color: "#C47070", background: "rgba(196,112,112,0.1)", border: "1px solid rgba(196,112,112,0.3)" }}
          >
            {error}
          </div>
        )}

        {/* ── Table ──────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(221,168,83,0.1)" }}
        >
          {/* Table — single table so header and body columns are always aligned */}
          <div className="overflow-x-auto">
            <table className="w-full table-fixed min-w-[880px]">
              <colgroup>
                <col style={{ width: "18%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "5%" }} />
              </colgroup>
              <thead style={{ background: "rgba(75,46,99,0.2)", borderBottom: "1px solid rgba(221,168,83,0.1)" }}>
                <tr>
                  <TH col="name">Name</TH>
                  <TH col="email">Email</TH>
                  <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.2em] font-medium" style={{ color: BRAND.sand }}>Program</th>
                  <TH col="gender">Gender</TH>
                  <TH col="status">Status</TH>
                  <TH col="updated">Updated</TH>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <p className="font-intimate text-lg" style={{ fontStyle: "italic", color: BRAND.sand }}>
                        Loading applications…
                      </p>
                    </td>
                  </tr>
                ) : sortedApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <p className="font-intimate text-lg" style={{ fontStyle: "italic", color: BRAND.sand }}>
                        No applications match your filters.
                      </p>
                    </td>
                  </tr>
                ) : sortedApplications.map((row, i) => (
                  <tr
                    key={row.id}
                    className="group transition-colors duration-150"
                    style={{
                      borderBottom: i < sortedApplications.length - 1 ? "1px solid rgba(221,168,83,0.07)" : "none",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,238,227,0.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
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
                        {new Date(row.updated_at).toLocaleString()}
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
          </div>

          {/* Pagination */}
          <div
            className="px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t"
            style={{ borderColor: "rgba(221,168,83,0.08)", background: "rgba(6,15,32,0.3)" }}
          >
            <p className="font-sans text-xs whitespace-nowrap" style={{ color: BRAND.sand }}>
              Showing {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
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
        </div>

      </div>
    </div>
  );
};

export default AdminApplicationsPage;
