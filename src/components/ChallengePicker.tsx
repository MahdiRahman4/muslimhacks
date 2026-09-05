import { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, Trophy } from "lucide-react";
import { BRAND, Eyebrow, GoldText } from "@/components/Shared";
import { ApiError } from "@/lib/api";
import { fetchChallenges, selectChallenge } from "@/lib/challenges-api";
import type { ChallengeGroup, ChallengeOption } from "@/types/challenges";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

function teamCountLabel(count: number) {
  return count === 1 ? "team" : "teams";
}

function ChallengeCard({
  challenge,
  selected,
  busy,
  onSelect,
  onOpenBrief,
}: {
  challenge: ChallengeOption;
  selected: boolean;
  busy: boolean;
  onSelect: (challenge: ChallengeOption) => void;
  onOpenBrief: (challenge: ChallengeOption) => void;
}) {
  const empty = challenge.team_count === 0;

  return (
    <article
      className="rounded-2xl p-4 sm:p-5 flex flex-col min-h-[240px] sm:min-h-[260px] transition-all duration-200"
      style={{
        background: selected ? "rgba(221,168,83,0.12)" : "rgba(245,238,227,0.045)",
        border: selected
          ? `1px solid ${BRAND.gold}`
          : "1px solid rgba(221,168,83,0.16)",
        boxShadow: selected
          ? "0 0 28px rgba(221,168,83,0.16)"
          : "0 10px 28px rgba(6,15,32,0.28)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          className="font-display text-lg sm:text-xl font-bold leading-tight min-w-0"
          style={{ color: BRAND.cream }}
        >
          {challenge.title}
        </h3>
        <button
          type="button"
          onClick={() => onOpenBrief(challenge)}
          className="inline-flex items-center gap-1 shrink-0 px-2 py-1 rounded-full font-sans text-[10px] font-semibold uppercase tracking-[0.12em] transition-all duration-200 hover:brightness-110"
          style={{
            color: BRAND.goldSoft,
            background: "rgba(221,168,83,0.08)",
            border: "1px solid rgba(221,168,83,0.28)",
          }}
        >
          <BookOpen size={11} />
          Brief
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-2 min-h-[7.5rem]">
        <p
          className="font-display font-black tabular-nums leading-none"
          style={{
            fontSize: "clamp(3.25rem, 9vw, 5.25rem)",
            color: empty ? "#5FA877" : BRAND.gold,
          }}
        >
          {challenge.team_count}
        </p>
        <p
          className="font-sans text-[11px] uppercase tracking-[0.18em] mt-1"
          style={{ color: empty ? "#5FA877" : BRAND.sand }}
        >
          {teamCountLabel(challenge.team_count)}
        </p>
      </div>

      <button
        type="button"
        disabled={busy || selected}
        onClick={() => onSelect(challenge)}
        className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-full font-sans text-xs sm:text-sm font-semibold uppercase tracking-[0.12em] transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        style={{
          background: selected
            ? "rgba(95,168,119,0.18)"
            : `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
          color: selected ? "#5FA877" : BRAND.navyDeep,
          border: selected ? "1px solid rgba(95,168,119,0.4)" : "none",
        }}
      >
        {selected ? (
          <>
            <Check size={16} />
            Your team&apos;s pick
          </>
        ) : (
          "Select this challenge"
        )}
      </button>
    </article>
  );
}

function BriefSection({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p
        className="font-sans text-[11px] uppercase tracking-[0.2em]"
        style={{ color: BRAND.gold }}
      >
        {title}
      </p>
      <p className="font-sans text-sm leading-relaxed" style={{ color: BRAND.cream }}>
        {body}
      </p>
    </div>
  );
}

function BriefList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <p
        className="font-sans text-[11px] uppercase tracking-[0.2em]"
        style={{ color: BRAND.gold }}
      >
        {title}
      </p>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="font-sans text-sm leading-relaxed pl-3"
            style={{
              color: BRAND.cream,
              borderLeft: `2px solid rgba(221,168,83,0.35)`,
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Section({
  title,
  group,
  challenges,
  selectedId,
  busy,
  onSelect,
  onOpenBrief,
}: {
  title: string;
  group: ChallengeGroup;
  challenges: ChallengeOption[];
  selectedId: string | null;
  busy: boolean;
  onSelect: (challenge: ChallengeOption) => void;
  onOpenBrief: (challenge: ChallengeOption) => void;
}) {
  const items = challenges.filter((challenge) => challenge.group === group);
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <h3
        className="font-display text-2xl font-bold"
        style={{ color: BRAND.cream }}
      >
        {title.includes("PPLUS") ? (
          <>
            MuslimHacks × <GoldText>PPLUS</GoldText> Challenges
          </>
        ) : (
          title
        )}
      </h3>
      <div className={items.length === 1 ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3"}>
        {items.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            selected={selectedId === challenge.id}
            busy={busy}
            onSelect={onSelect}
            onOpenBrief={onOpenBrief}
          />
        ))}
      </div>
    </div>
  );
}

export function ChallengePicker() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<ChallengeOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, setPending] = useState<ChallengeOption | null>(null);
  const [brief, setBrief] = useState<ChallengeOption | null>(null);
  const [ipChecked, setIpChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchChallenges();
        if (cancelled) return;
        setChallenges(data.challenges);
        setSelectedId(data.selected_challenge_id);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Could not load challenges.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyResponse = (data: { selected_challenge_id: string | null; challenges: ChallengeOption[] }) => {
    setChallenges(data.challenges);
    setSelectedId(data.selected_challenge_id);
  };

  const confirmSelect = async (challenge: ChallengeOption, ipAcknowledged: boolean) => {
    setSaving(true);
    setError(null);
    try {
      const data = await selectChallenge(challenge.id, ipAcknowledged);
      applyResponse(data);
      toast.success(`Selected ${challenge.title}.`);
      setPending(null);
      setBrief(null);
      setIpChecked(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save that pick.");
    } finally {
      setSaving(false);
    }
  };

  const handleSelect = (challenge: ChallengeOption) => {
    if (challenge.id === selectedId || saving) return;
    if (challenge.requiresIpGrant) {
      setBrief(null);
      setIpChecked(false);
      setPending(challenge);
      return;
    }
    void confirmSelect(challenge, false);
  };

  const selectedTitle = useMemo(
    () => challenges.find((challenge) => challenge.id === selectedId)?.title,
    [challenges, selectedId],
  );

  return (
    <div
      className="rounded-2xl p-7 flex flex-col gap-6"
      style={{
        background: "rgba(245,238,227,0.04)",
        border: "1px solid rgba(221,168,83,0.13)",
        boxShadow: "0 24px 60px rgba(6,15,32,0.4)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-lg shrink-0"
          style={{ background: "rgba(221,168,83,0.15)", color: BRAND.gold }}
        >
          <Trophy size={22} />
        </div>
        <div className="flex flex-col gap-1">
          <Eyebrow>Hackathon tracks</Eyebrow>
          <h2 className="font-display text-2xl font-bold" style={{ color: BRAND.cream }}>
            Choose your challenge
          </h2>
        </div>
      </div>

      <div
        className="rounded-2xl px-5 py-4"
        style={{
          background: "rgba(221,168,83,0.16)",
          border: `2px solid ${BRAND.gold}`,
          boxShadow: "0 0 28px rgba(221,168,83,0.28)",
        }}
      >
        <p
          className="font-display text-xl sm:text-2xl font-bold leading-snug text-center"
          style={{ color: BRAND.gold }}
        >
          Only one person from each team should select a challenge.
        </p>
      </div>

      {selectedTitle && (
        <p className="font-sans text-sm" style={{ color: BRAND.goldSoft }}>
          Your team is currently in <strong style={{ color: BRAND.gold }}>{selectedTitle}</strong>.
          You can switch if you need to.
        </p>
      )}

      {loading ? (
        <p className="font-sans text-sm" style={{ color: BRAND.sand }}>
          Loading challenges...
        </p>
      ) : error && challenges.length === 0 ? (
        <p className="font-sans text-sm" style={{ color: "#C47070" }}>
          {error}
        </p>
      ) : (
        <>
          {error && (
            <p className="font-sans text-sm" style={{ color: "#C47070" }}>
              {error}
            </p>
          )}
          <Section
            title="MuslimHacks × PPLUS Challenges"
            group="pplus"
            challenges={challenges}
            selectedId={selectedId}
            busy={saving}
            onSelect={handleSelect}
            onOpenBrief={setBrief}
          />
          <Section
            title="Sponsor Challenges"
            group="sponsor"
            challenges={challenges}
            selectedId={selectedId}
            busy={saving}
            onSelect={handleSelect}
            onOpenBrief={setBrief}
          />
        </>
      )}

      <Dialog open={brief != null} onOpenChange={(open) => !open && setBrief(null)}>
        <DialogContent
          className="max-w-2xl max-h-[85vh] overflow-y-auto border sm:rounded-2xl p-0"
          style={{
            background: `linear-gradient(180deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 100%)`,
            borderColor: "rgba(221,168,83,0.35)",
            color: BRAND.cream,
          }}
        >
          {brief && (
            <>
              <div
                className="px-6 pt-6 pb-4"
                style={{ borderBottom: "1px solid rgba(221,168,83,0.16)" }}
              >
                <DialogHeader>
                  <p
                    className="font-sans text-[11px] uppercase tracking-[0.22em] mb-1"
                    style={{ color: BRAND.gold }}
                  >
                    {brief.group === "sponsor" ? "Sponsor challenge" : "PPLUS challenge"} {brief.number}
                  </p>
                  <DialogTitle className="font-display text-3xl font-bold" style={{ color: BRAND.cream }}>
                    {brief.title}
                  </DialogTitle>
                  <DialogDescription
                    className="font-intimate text-base leading-relaxed pt-2"
                    style={{ fontStyle: "italic", color: BRAND.creamMuted }}
                  >
                    {brief.tagline}
                  </DialogDescription>
                </DialogHeader>
              </div>
              <div className="px-6 py-5 flex flex-col gap-5">
                {brief.extra && (
                  <p
                    className="font-sans text-sm leading-relaxed rounded-xl px-4 py-3"
                    style={{
                      color: BRAND.goldSoft,
                      background: "rgba(221,168,83,0.08)",
                      border: "1px solid rgba(221,168,83,0.22)",
                    }}
                  >
                    {brief.extra}
                  </p>
                )}
                <BriefSection title="The problem" body={brief.problem} />
                <BriefSection title="How it works today" body={brief.howToday} />
                {brief.example && (
                  <div className="flex flex-col gap-2">
                    <p
                      className="font-sans text-[11px] uppercase tracking-[0.2em]"
                      style={{ color: BRAND.gold }}
                    >
                      Scoreboard example
                    </p>
                    <pre
                      className="font-sans text-xs leading-relaxed whitespace-pre-wrap rounded-xl px-4 py-3 overflow-x-auto"
                      style={{
                        color: BRAND.cream,
                        background: "rgba(6,15,32,0.55)",
                        border: "1px solid rgba(221,168,83,0.2)",
                      }}
                    >
                      {brief.example}
                    </pre>
                  </div>
                )}
                <BriefList title="Where to focus" items={brief.focus} />
                <BriefList title="Important constraints" items={brief.constraints} />
                <BriefList title="Before you build" items={brief.beforeYouBuild} />
                <BriefSection title="What to deliver" body={brief.deliverable} />
              </div>
              <div
                className="px-6 py-4 flex flex-col sm:flex-row gap-2 sm:justify-end"
                style={{ borderTop: "1px solid rgba(221,168,83,0.16)" }}
              >
                <button
                  type="button"
                  onClick={() => setBrief(null)}
                  className="px-5 py-2.5 rounded-full font-sans text-sm"
                  style={{ color: BRAND.sand }}
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={saving || brief.id === selectedId}
                  onClick={() => handleSelect(brief)}
                  className="px-6 py-2.5 rounded-full font-sans text-sm font-semibold uppercase tracking-[0.14em] disabled:opacity-50"
                  style={{
                    background:
                      brief.id === selectedId
                        ? "rgba(95,168,119,0.18)"
                        : `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
                    color: brief.id === selectedId ? "#5FA877" : BRAND.navyDeep,
                  }}
                >
                  {brief.id === selectedId ? "Your team's pick" : "Select this challenge"}
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={pending != null}
        onOpenChange={(open) => {
          if (!open && !saving) {
            setPending(null);
            setIpChecked(false);
          }
        }}
      >
        <DialogContent
          className="max-w-lg border sm:rounded-2xl"
          style={{
            background: BRAND.navyDeep,
            borderColor: "rgba(221,168,83,0.35)",
            color: BRAND.cream,
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl" style={{ color: BRAND.cream }}>
              IP grant required
            </DialogTitle>
            <DialogDescription
              className="font-sans text-sm leading-relaxed"
              style={{ color: BRAND.creamMuted }}
            >
              {pending?.ipGrantText}
            </DialogDescription>
          </DialogHeader>
          <label className="flex items-start gap-3 font-sans text-sm" style={{ color: BRAND.cream }}>
            <input
              type="checkbox"
              checked={ipChecked}
              onChange={(event) => setIpChecked(event.target.checked)}
              className="mt-1 accent-[#DDA853]"
            />
            <span>
              I acknowledge these terms and agree that if my team wins,{" "}
              {pending?.ipOwner || "the sponsor"} receives perpetual use of the winning code.
            </span>
          </label>
          <DialogFooter>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setPending(null);
                setIpChecked(false);
              }}
              className="px-4 py-2 rounded-full font-sans text-sm"
              style={{ color: BRAND.sand }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!ipChecked || saving || !pending}
              onClick={() => pending && void confirmSelect(pending, true)}
              className="px-5 py-2.5 rounded-full font-sans text-sm font-semibold uppercase tracking-[0.14em] disabled:opacity-40"
              style={{
                background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
                color: BRAND.navyDeep,
              }}
            >
              {saving ? "Saving..." : "I agree and select"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
