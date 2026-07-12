import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  PenLine,
} from "lucide-react";
import {
  BRAND,
  StarPattern,
  GoldText,
  Eyebrow,
  GLOBAL_CSS,
} from "../components/Shared";
import muslimHacksLogo from "../assets/muslimhacks-logo-white.svg";
import Footer from "@/components/ui/footer";
import { ApiError, fetchUserSummary } from "@/lib/api";
import { toast } from "sonner";
import { UserSummaryResponse } from "@/types/application";
import { useEffect, useState } from "react";
import { SignedIn, UserButton } from "@clerk/clerk-react";
import Profile from "@/components/ui/profile";

type AppStatus = "not_started" | "draft" | "pending" | "approved" | "rejected";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  AppStatus,
  {
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    border: string;
  }
> = {
  not_started: {
    label: "Not started",
    description:
      "You haven't started your application yet. Applications close soon — begin when you're ready.",
    icon: <FileText size={20} />,
    color: BRAND.sand,
    bg: "rgba(201,187,168,0.08)",
    border: "rgba(201,187,168,0.2)",
  },
  draft: {
    label: "Draft",
    description:
      "Your application is saved as a draft. Complete and submit it before the deadline.",
    icon: <PenLine size={20} />,
    color: BRAND.goldSoft,
    bg: "rgba(231,192,120,0.08)",
    border: "rgba(221,168,83,0.3)",
  },
  pending: {
    label: "Pending",
    description:
      "Your application has been submitted and is awaiting review. Jazakum Allahu khayran for your patience.",
    icon: <Clock size={20} />,
    color: BRAND.purpleLight,
    bg: "rgba(155,124,176,0.1)",
    border: "rgba(155,124,176,0.3)",
  },
  approved: {
    label: "Approved",
    description:
      "Alhamdulillah — you've been accepted to MuslimHacks 2026! Check your email for next steps.",
    icon: <CheckCircle2 size={20} />,
    color: "#5FA877",
    bg: "rgba(95,168,119,0.1)",
    border: "rgba(95,168,119,0.35)",
  },
  rejected: {
    label: "Not selected",
    description:
      "Unfortunately we weren't able to offer you a spot this year. We hope to see you again next time, in shaa Allah.",
    icon: <XCircle size={20} />,
    color: "#C47070",
    bg: "rgba(196,112,112,0.08)",
    border: "rgba(196,112,112,0.25)",
  },
};

// ─── Timeline steps ───────────────────────────────────────────────────────────
const TIMELINE: { key: AppStatus; label: string }[] = [
  { key: "draft", label: "Draft saved" },
  { key: "pending", label: "Submitted" },
  { key: "approved", label: "Decision" },
];

const TIMELINE_ORDER: AppStatus[] = [
  "not_started",
  "draft",
  "pending",
  "approved",
];

function timelineIndex(status: AppStatus) {
  return TIMELINE_ORDER.indexOf(status);
}

function Timeline({ status }: { status: AppStatus }) {
  const current = timelineIndex(status);
  return (
    <div className="flex items-start gap-0 w-full">
      {TIMELINE.map((step, i) => {
        const stepIndex = timelineIndex(step.key);
        const done = current > stepIndex;
        const active = current === stepIndex;
        const isLast = i === TIMELINE.length - 1;
        return (
          <div
            key={step.key}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <div className="flex items-center w-full">
              {/* Left connector */}
              {i > 0 && (
                <div
                  className="flex-1 h-px transition-all duration-500"
                  style={{
                    background:
                      done || active ? BRAND.gold : "rgba(221,168,83,0.15)",
                  }}
                />
              )}
              {/* Dot */}
              <div
                className="w-3 h-3 rounded-full shrink-0 transition-all duration-500"
                style={{
                  background: done
                    ? BRAND.gold
                    : active
                    ? BRAND.goldSoft
                    : "rgba(221,168,83,0.2)",
                  boxShadow: active ? `0 0 10px rgba(221,168,83,0.5)` : "none",
                  border:
                    done || active ? "none" : `1px solid rgba(221,168,83,0.25)`,
                }}
              />
              {/* Right connector */}
              {!isLast && (
                <div
                  className="flex-1 h-px transition-all duration-500"
                  style={{
                    background: done ? BRAND.gold : "rgba(221,168,83,0.15)",
                  }}
                />
              )}
            </div>
            <p
              className="font-sans text-xs text-center leading-tight px-1"
              style={{ color: done || active ? BRAND.cream : BRAND.sand }}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      className="flex flex-col gap-1 px-6 py-5 rounded-xl"
      style={{
        background: "rgba(245,238,227,0.04)",
        border: "1px solid rgba(221,168,83,0.12)",
      }}
    >
      <p
        className="font-sans text-xs uppercase tracking-[0.22em]"
        style={{ color: BRAND.sand }}
      >
        {label}
      </p>
      <p
        className="font-display text-2xl font-bold"
        style={{ color: BRAND.cream }}
      >
        {value}
      </p>
      {sub && (
        <p className="font-sans text-xs" style={{ color: BRAND.sand }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userSummary, setUserSummary] = useState<UserSummaryResponse | null>(
    null
  );
  const [status, setStatus] = useState<AppStatus>("not_started");
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setUserSummary(await fetchUserSummary());
        console.log("User summary:", userSummary);
        setStatus(
          (userSummary?.summary?.application_status as AppStatus) ||
            "not_started"
        );
        if (!userSummary) {
          navigate("/");
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          toast.error("User summary not found.");
          navigate("/");
        } else {
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Failed to load Dashboard"
          );
          // navigate("/"); 
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [userSummary]);

  const cfg = STATUS_CONFIG[status];
  const canEdit = status === "draft";
  const hasStarted = status !== "not_started";
  const firstName = userSummary?.summary?.full_name.split(" ")[0] || "";
  const lastName = userSummary?.summary?.full_name.split(" ")[1] || "";

  return (
    <div
      className="min-h-screen font-sans relative"
      style={{
        background: `linear-gradient(160deg, ${BRAND.purpleDeep} 0%, ${BRAND.navy} 60%, ${BRAND.navyDeep} 100%)`,
        color: BRAND.cream,
      }}
    >
      <style>{GLOBAL_CSS}</style>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <StarPattern opacity={0.04} />
      </div>

      {/* Nav */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(6,15,32,0.88)",
          backdropFilter: "blur(14px)",
          borderColor: "rgba(221,168,83,0.1)",
        }}
      >
        <div className="w-100 px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <img
              src={muslimHacksLogo}
              alt="MuslimHacks"
              className="h-7 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-4">
            <Profile />
          </div>
        </div>
      </header>

      {/* Page */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-14 flex flex-col gap-10">
        {/* Greeting */}
        <div className="flex flex-col gap-2">
          <Eyebrow>Dashboard</Eyebrow>
          <h1
            className="font-display font-black leading-tight"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              letterSpacing: "-0.02em",
            }}
          >
            {`${firstName}, `} <GoldText>{lastName}</GoldText>
          </h1>
          <p
            className="font-intimate text-lg"
            style={{ fontStyle: "italic", color: BRAND.creamMuted }}
          >
            Here's where your MuslimHacks 2026 application stands.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Event" value="Sep 2026" sub="Concordia University" />
          <StatCard
            label="Duration"
            value="24 hrs"
            sub="In-person · Montréal"
          />
          <StatCard label="Deadline" value="TBA" sub="Applications open" />
        </div>

        {/* Status card */}
        <div
          className="rounded-2xl p-7 flex flex-col gap-6"
          style={{
            background: "rgba(245,238,227,0.04)",
            border: "1px solid rgba(221,168,83,0.13)",
            boxShadow: "0 24px 60px rgba(6,15,32,0.4)",
          }}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
              <Eyebrow>Application status</Eyebrow>
              <h2
                className="font-display text-2xl font-bold"
                style={{ color: BRAND.cream }}
              >
                MuslimHacks 2026
              </h2>
            </div>

            {/* Status badge */}
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full shrink-0"
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                color: cfg.color,
              }}
            >
              {cfg.icon}
              <span className="font-sans text-sm font-semibold">
                {cfg.label}
              </span>
            </div>
          </div>

          {/* Description */}
          <p
            className="font-intimate text-lg leading-relaxed"
            style={{ fontStyle: "italic", color: BRAND.creamMuted }}
          >
            {cfg.description}
          </p>

          {/* Timeline — only show when there's progress to show */}
          {hasStarted && (
            <div className="pt-2">
              <Timeline status={status} />
            </div>
          )}

          {/* Action */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {!hasStarted ? (
              <Link
                to="/apply"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-sans text-sm font-semibold uppercase tracking-[0.15em] transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
                  color: BRAND.navyDeep,
                  boxShadow: "0 0 18px rgba(221,168,83,0.3)",
                }}
              >
                Start application
                <ChevronRight size={15} />
              </Link>
            ) : canEdit ? (
              <>
                <Link
                  to="/apply"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-sans text-sm font-semibold uppercase tracking-[0.15em] transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
                    color: BRAND.navyDeep,
                    boxShadow: "0 0 18px rgba(221,168,83,0.3)",
                  }}
                >
                  Edit application
                  <ChevronRight size={15} />
                </Link>
                <p
                  className="self-center font-sans text-xs"
                  style={{ color: BRAND.sand }}
                >
                  You can edit until applications close.
                </p>
              </>
            ) : (
              <Link
                to="/apply"
                className="inline-flex items-center gap-2 font-sans text-sm hover:opacity-70 transition-opacity focus-visible:ring-2 rounded self-start"
                style={{ color: BRAND.purpleLight }}
              >
                View your application
                <ChevronRight size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* Arabic closing */}
        <div className="flex flex-col items-center gap-1 py-4">
          <p
            className="font-arabic text-2xl"
            dir="rtl"
            style={{ color: "rgba(221,168,83,0.4)" }}
          >
            بارك الله فيكم
          </p>
          <p
            className="font-intimate text-sm"
            style={{ fontStyle: "italic", color: "rgba(217,207,192,0.4)" }}
          >
            May Allah bless you.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
