import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, FileText, CheckCircle } from "lucide-react";
import { BRAND, GoldText, Eyebrow, GLOBAL_CSS } from "@/components/Shared";
import muslimHacksLogo from "@/assets/muslimhacks-logo-white.svg";
import Profile from "@/components/ui/profile";
import {
  ApiError,
  fetchAdminApplication,
  openAdminApplicationResume,
  submitApplicationReview,
} from "@/lib/api";
import type { Application, ApplicationReview, ApplicationStatus } from "@/types/application";

type ReviewStatus = "pending" | "approved" | "rejected";

// ─── Status styles ────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<ApplicationStatus, { label: string; color: string; bg: string; border: string }> = {
  draft:       { label: "Draft",       color: BRAND.goldSoft,     bg: "rgba(221,168,83,0.1)",   border: "rgba(221,168,83,0.3)"   },
  pending:     { label: "Pending",     color: BRAND.purpleLight,  bg: "rgba(155,124,176,0.12)", border: "rgba(155,124,176,0.35)" },
  approved:    { label: "Approved",    color: "#5FA877",          bg: "rgba(95,168,119,0.12)",  border: "rgba(95,168,119,0.35)"  },
  rejected:    { label: "Rejected",    color: "#C47070",          bg: "rgba(196,112,112,0.1)",  border: "rgba(196,112,112,0.3)"  },
};

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full font-sans text-xs font-semibold"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  );
}

// ─── Field row ────────────────────────────────────────────────────────────────
function Field({
  label,
  value,
  isLink = false,
}: {
  label: string;
  value: string | null | undefined;
  isLink?: boolean;
}) {
  if (!value) {
    return (
      <div className="flex flex-col gap-0.5 py-3" style={{ borderBottom: "1px solid rgba(221,168,83,0.07)" }}>
        <span className="font-sans text-xs uppercase tracking-[0.18em]" style={{ color: BRAND.sand }}>{label}</span>
        <span className="font-sans text-sm" style={{ color: "rgba(201,187,168,0.35)" }}>—</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-0.5 py-3" style={{ borderBottom: "1px solid rgba(221,168,83,0.07)" }}>
      <span className="font-sans text-xs uppercase tracking-[0.18em]" style={{ color: BRAND.sand }}>{label}</span>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="font-sans text-sm flex items-center gap-1.5 hover:opacity-75 transition-opacity break-all"
          style={{ color: BRAND.purpleLight }}
        >
          {value}
          <ExternalLink size={11} className="shrink-0" />
        </a>
      ) : (
        <p className="font-sans text-sm leading-relaxed" style={{ color: BRAND.cream }}>{value}</p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const AdminApplicationDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const [application, setApplication] = useState<Application | null>(null);
  const [reviews, setReviews] = useState<ApplicationReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>("pending");
  const [score, setScore] = useState("");
  const [notes, setNotes] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAdminApplication(id)
      .then((data) => {
        if (cancelled) return;
        setApplication(data.application);
        setReviews(data.reviews);
        setReviewStatus(
          data.application.status === "approved" || data.application.status === "rejected"
            ? data.application.status
            : "pending",
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load application");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleReviewSubmit() {
    if (!id) return;

    setReviewError(null);
    setSubmitting(true);

    try {
      const payload: { status: ReviewStatus; notes?: string; score?: number } = {
        status: reviewStatus,
        notes: notes.trim() || undefined,
      };

      if (score.trim()) {
        const parsedScore = Number(score);
        if (!Number.isFinite(parsedScore)) {
          setReviewError("Score must be a number");
          setSubmitting(false);
          return;
        }
        payload.score = parsedScore;
      }

      const data = await submitApplicationReview(id, payload);
      setApplication(data.application);
      setReviews((current) => [data.review, ...current]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setNotes("");
      setScore("");
    } catch (err) {
      setReviewError(err instanceof ApiError ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  const cardStyle = {
    background: "rgba(245,238,227,0.03)",
    border: "1px solid rgba(221,168,83,0.1)",
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: BRAND.navyDeep, color: BRAND.cream }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(6,15,32,0.95)", backdropFilter: "blur(14px)", borderColor: "rgba(221,168,83,0.1)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={muslimHacksLogo} alt="MuslimHacks" className="h-6 w-auto object-contain" />
            <div className="h-4 w-px" style={{ background: "rgba(221,168,83,0.2)" }} />
            <span className="font-sans text-xs uppercase tracking-[0.22em] font-medium" style={{ color: BRAND.sand }}>
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/applications"
              className="flex items-center gap-1.5 font-sans text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: BRAND.sand }}
            >
              <ArrowLeft size={13} />
              Back to applications
            </Link>
            <Profile />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <p className="font-intimate text-lg" style={{ fontStyle: "italic", color: BRAND.sand }}>
            Loading application…
          </p>
        </div>
      ) : error || !application ? (
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-4">
          <div
            className="rounded-xl px-4 py-3 font-sans text-sm"
            style={{ color: "#C47070", background: "rgba(196,112,112,0.1)", border: "1px solid rgba(196,112,112,0.3)" }}
          >
            {error || "Application not found"}
          </div>
          <Link
            to="/admin/applications"
            className="flex items-center gap-1.5 font-sans text-xs font-medium w-fit transition-opacity hover:opacity-70"
            style={{ color: BRAND.sand }}
          >
            <ArrowLeft size={13} />
            Back to applications
          </Link>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">

          {/* ── Applicant identity ─────────────────────────────────────── */}
          <div className="flex flex-col gap-1">
            <Eyebrow>Application review</Eyebrow>
            <h1
              className="font-display font-black leading-tight"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", letterSpacing: "-0.02em" }}
            >
              <GoldText>{application.full_name}</GoldText>
            </h1>
            <p className="font-sans text-sm" style={{ color: BRAND.creamMuted }}>{application.email}</p>
          </div>

          {/* ── Two-column layout ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

            {/* ── Left: Application details ─────────────────────────── */}
            <div className="rounded-2xl p-6 flex flex-col gap-0" style={cardStyle}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-lg" style={{ letterSpacing: "-0.01em" }}>
                  Application details
                </h2>
                <StatusBadge status={application.status} />
              </div>

              {/* Contact */}
              <p className="font-sans text-xs uppercase tracking-[0.2em] mb-1 mt-2" style={{ color: BRAND.gold, opacity: 0.6 }}>Contact</p>
              <Field label="Phone" value={application.phone} />
              <Field label="School" value={application.school} />
              <Field label="Program" value={application.program} />
              <Field label="Graduation year" value={application.graduation_year?.toString()} />
              <Field label="Gender" value={application.gender} />

              {/* Links */}
              <p className="font-sans text-xs uppercase tracking-[0.2em] mb-1 mt-5" style={{ color: BRAND.gold, opacity: 0.6 }}>Links</p>
              <Field label="GitHub" value={application.github_url} isLink />
              <Field label="LinkedIn" value={application.linkedin_url} isLink />
              <Field label="Portfolio" value={application.portfolio_url} isLink />

              {/* Resume */}
              {application.resume_key || application.resume_url ? (
                <div className="flex flex-col gap-0.5 py-3" style={{ borderBottom: "1px solid rgba(221,168,83,0.07)" }}>
                  <span className="font-sans text-xs uppercase tracking-[0.18em]" style={{ color: BRAND.sand }}>Resume</span>
                  <button
                    type="button"
                    onClick={() => {
                      void openAdminApplicationResume(application.id).catch((err) => {
                        setError(
                          err instanceof ApiError
                            ? err.message
                            : "Failed to open resume",
                        );
                      });
                    }}
                    className="inline-flex items-center gap-2 font-sans text-sm mt-1 px-3.5 py-2 rounded-lg w-fit transition-all hover:opacity-80"
                    style={{ background: "rgba(221,168,83,0.08)", border: "1px solid rgba(221,168,83,0.2)", color: BRAND.gold }}
                  >
                    <FileText size={13} />
                    View resume
                  </button>
                </div>
              ) : (
                <Field label="Resume" value={null} />
              )}

              {/* Essay answers */}
              <p className="font-sans text-xs uppercase tracking-[0.2em] mb-1 mt-5" style={{ color: BRAND.gold, opacity: 0.6 }}>Essay answers</p>
              <Field label="Motivation" value={application.motivation ?? application.why_join} />
              <Field label="Past project" value={application.past_project ?? application.project_idea} />
              <Field label="Interests" value={application.interests} />
              <Field label="Community" value={application.community} />

              {/* Logistics */}
              <p className="font-sans text-xs uppercase tracking-[0.2em] mb-1 mt-5" style={{ color: BRAND.gold, opacity: 0.6 }}>Logistics</p>
              <Field label="Accessibility needs" value={application.accessibility} />
              <Field label="Dietary restrictions" value={application.dietary_restrictions} />
              <Field
                label="First hackathon"
                value={application.first_hackathon == null ? null : application.first_hackathon ? "Yes" : "No"}
              />
              <Field
                label="CS career"
                value={application.cs_career == null ? null : application.cs_career ? "Yes" : "No"}
              />
              <Field label="Needs travel support" value={application.needs_travel_support ? "Yes" : "No"} />

              {/* Timestamps */}
              <p className="font-sans text-xs uppercase tracking-[0.2em] mb-1 mt-5" style={{ color: BRAND.gold, opacity: 0.6 }}>Timestamps</p>
              <Field label="Submitted" value={new Date(application.created_at).toLocaleString()} />
              <Field label="Last updated" value={new Date(application.updated_at).toLocaleString()} />
            </div>

            {/* ── Right column ──────────────────────────────────────── */}
            <div className="flex flex-col gap-4">

              {/* Submit review */}
              <div className="rounded-2xl p-6 flex flex-col gap-4" style={cardStyle}>
                <h2 className="font-display font-bold text-lg" style={{ letterSpacing: "-0.01em" }}>
                  Submit review
                </h2>

                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs uppercase tracking-[0.18em]" style={{ color: BRAND.sand }}>Status</label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value as ReviewStatus)}
                    className="w-full px-3.5 py-2.5 rounded-lg font-sans text-sm appearance-none focus:outline-none"
                    style={{
                      background: "rgba(245,238,227,0.06)",
                      border: "1px solid rgba(221,168,83,0.2)",
                      color: BRAND.cream,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C9BBA8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 12px center",
                    }}
                  >
                    <option value="pending" style={{ background: BRAND.navy }}>Pending</option>
                    <option value="approved" style={{ background: BRAND.navy }}>Approved</option>
                    <option value="rejected" style={{ background: BRAND.navy }}>Rejected</option>
                  </select>
                </div>

                {/* Score */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs uppercase tracking-[0.18em]" style={{ color: BRAND.sand }}>Score</label>
                  <input
                    type="number"
                    placeholder="Optional numeric score"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg font-sans text-sm focus:outline-none placeholder:opacity-40"
                    style={{
                      background: "rgba(245,238,227,0.06)",
                      border: "1px solid rgba(221,168,83,0.2)",
                      color: BRAND.cream,
                    }}
                  />
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs uppercase tracking-[0.18em]" style={{ color: BRAND.sand }}>Notes</label>
                  <textarea
                    rows={4}
                    placeholder="Review notes…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg font-sans text-sm focus:outline-none resize-none placeholder:opacity-40"
                    style={{
                      background: "rgba(245,238,227,0.06)",
                      border: "1px solid rgba(221,168,83,0.2)",
                      color: BRAND.cream,
                    }}
                  />
                </div>

                {/* Review error */}
                {reviewError && (
                  <div
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg font-sans text-sm"
                    style={{ background: "rgba(196,112,112,0.1)", border: "1px solid rgba(196,112,112,0.3)", color: "#C47070" }}
                  >
                    {reviewError}
                  </div>
                )}

                {/* Saved confirmation */}
                {saved && (
                  <div
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg font-sans text-sm"
                    style={{ background: "rgba(95,168,119,0.1)", border: "1px solid rgba(95,168,119,0.3)", color: "#5FA877" }}
                  >
                    <CheckCircle size={14} />
                    Review saved.
                  </div>
                )}

                {/* Save button */}
                <button
                  onClick={() => void handleReviewSubmit()}
                  disabled={submitting}
                  className="w-full py-3 rounded-full font-sans text-sm font-semibold uppercase tracking-[0.16em] transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 disabled:opacity-60"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
                    color: BRAND.navyDeep,
                    boxShadow: "0 0 18px rgba(221,168,83,0.25), 0 4px 12px rgba(221,168,83,0.15)",
                  }}
                >
                  {submitting ? "Saving..." : "Save review"}
                </button>
              </div>

              {/* Review history */}
              {reviews.length > 0 && (
                <div className="rounded-2xl p-6 flex flex-col gap-4" style={cardStyle}>
                  <h2 className="font-display font-bold text-lg" style={{ letterSpacing: "-0.01em" }}>
                    Review history
                  </h2>
                  <div className="flex flex-col gap-3">
                    {reviews.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-xl p-4 flex flex-col gap-2"
                        style={{ background: "rgba(245,238,227,0.03)", border: "1px solid rgba(221,168,83,0.07)" }}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <StatusBadge status={r.status} />
                          <span className="font-sans text-xs tabular-nums" style={{ color: BRAND.sand }}>
                            {new Date(r.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="font-sans text-xs" style={{ color: BRAND.creamMuted }}>
                          {r.reviewer_email || r.reviewed_by}
                          {r.score !== null && (
                            <> · <span style={{ color: BRAND.gold }}>Score: {r.score}</span></>
                          )}
                        </p>
                        {r.notes && (
                          <p className="font-intimate text-sm leading-relaxed" style={{ fontStyle: "italic", color: BRAND.cream }}>
                            "{r.notes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplicationDetailPage;
