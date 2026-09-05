import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import { BRAND, GoldText, Eyebrow, GLOBAL_CSS } from "@/components/Shared";
import muslimHacksLogo from "@/assets/muslimhacks-logo-white.svg";
import Profile from "@/components/ui/profile";
import { ApiError } from "@/lib/api";
import { downloadChallengePicksCsv, fetchAdminChallenges } from "@/lib/challenges-api";
import type {
  AdminChallengePick,
  AdminChallengeSummary,
} from "@/types/challenges";

function formatWhen(ms: number) {
  return new Date(ms).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const AdminChallengesPage = () => {
  const [challenges, setChallenges] = useState<AdminChallengeSummary[]>([]);
  const [picks, setPicks] = useState<AdminChallengePick[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAdminChallenges();
        if (cancelled) return;
        setChallenges(data.challenges);
        setPicks(data.picks);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Could not load challenge picks.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPicks = useMemo(
    () => (filter === "all" ? picks : picks.filter((pick) => pick.challenge_id === filter)),
    [filter, picks],
  );

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      await downloadChallengePicksCsv();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

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
            <button
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-sans text-xs font-medium transition-all duration-200 hover:opacity-80 focus-visible:ring-2 disabled:opacity-50"
              style={{ background: "rgba(245,238,227,0.06)", border: "1px solid rgba(221,168,83,0.18)", color: BRAND.cream }}
              onClick={() => void handleExport()}
              disabled={exporting || picks.length === 0}
            >
              <Download size={13} style={{ color: BRAND.gold }} />
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
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
            Challenge <GoldText>picks</GoldText>
          </h1>
          <p className="font-intimate text-base" style={{ fontStyle: "italic", color: BRAND.creamMuted }}>
            One person per team should select a challenge. These counts are how many projects we expect in each track.
          </p>
        </div>

        {error && (
          <div
            className="rounded-xl px-4 py-3 font-sans text-sm"
            style={{ color: "#C47070", background: "rgba(196,112,112,0.1)", border: "1px solid rgba(196,112,112,0.3)" }}
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {challenges.map((challenge) => (
            <button
              key={challenge.id}
              type="button"
              onClick={() => setFilter((current) => (current === challenge.id ? "all" : challenge.id))}
              className="flex flex-col gap-0.5 px-5 py-4 rounded-xl text-left transition-all duration-200"
              style={{
                background:
                  filter === challenge.id ? "rgba(221,168,83,0.12)" : "rgba(245,238,227,0.04)",
                border:
                  filter === challenge.id
                    ? "1px solid rgba(221,168,83,0.4)"
                    : "1px solid rgba(221,168,83,0.1)",
              }}
            >
              <span className="font-sans text-xs uppercase tracking-[0.18em]" style={{ color: BRAND.sand }}>
                {challenge.number} · {challenge.group === "sponsor" ? "Sponsor" : "PPLUS"}
              </span>
              <span className="font-display text-lg font-bold" style={{ color: BRAND.cream }}>
                {challenge.title}
              </span>
              <span className="font-display text-3xl font-bold tabular-nums" style={{ color: BRAND.gold }}>
                {challenge.team_count}
              </span>
              <span className="font-sans text-xs" style={{ color: BRAND.sand }}>
                {challenge.team_count === 1 ? "team" : "teams"}
              </span>
            </button>
          ))}
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(245,238,227,0.03)", border: "1px solid rgba(221,168,83,0.1)" }}
        >
          {loading ? (
            <p className="px-5 py-8 font-sans text-sm" style={{ color: BRAND.sand }}>
              Loading picks…
            </p>
          ) : filteredPicks.length === 0 ? (
            <p className="px-5 py-8 font-sans text-sm" style={{ color: BRAND.sand }}>
              No one has selected {filter === "all" ? "a challenge" : "this challenge"} yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(221,168,83,0.12)" }}>
                    {["Name", "Email", "Challenge", "IP grant", "Selected"].map((label) => (
                      <th
                        key={label}
                        className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.2em] font-medium"
                        style={{ color: BRAND.sand }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPicks.map((pick) => (
                    <tr
                      key={pick.user_id}
                      style={{ borderBottom: "1px solid rgba(221,168,83,0.08)" }}
                    >
                      <td className="px-4 py-3 font-sans text-sm" style={{ color: BRAND.cream }}>
                        {pick.full_name || "—"}
                      </td>
                      <td className="px-4 py-3 font-sans text-sm" style={{ color: BRAND.creamMuted }}>
                        {pick.email}
                      </td>
                      <td className="px-4 py-3 font-sans text-sm" style={{ color: BRAND.goldSoft }}>
                        {pick.challenge_title}
                      </td>
                      <td className="px-4 py-3 font-sans text-sm" style={{ color: pick.ip_acknowledged ? "#5FA877" : BRAND.sand }}>
                        {pick.ip_acknowledged ? `Yes · ${pick.ip_owner ?? "sponsor"}` : "—"}
                      </td>
                      <td className="px-4 py-3 font-sans text-sm" style={{ color: BRAND.sand }}>
                        {formatWhen(pick.signed_up_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChallengesPage;
