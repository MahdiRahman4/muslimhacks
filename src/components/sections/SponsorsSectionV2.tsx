import { useScrollReveal } from '@/hooks/useScrollReveal';
import { BRAND, StarPattern, GoldText, Eyebrow } from "../Shared";
import {ExternalLink} from "lucide-react"
import islamicReliefLogo from "../../assets/islamicrelieflogo.png"

export default function SponsorsSectionV2() {
  const [headerRef, headerVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const [contentRef, contentVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const [ctaRef, ctaVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section
    id="sponsors"
    className="relative py-24 px-6 overflow-hidden"
    style={{
      background: `linear-gradient(180deg, ${BRAND.navy} 0%, ${BRAND.purpleDeep} 100%)`,
    }}
  >
    {/* <StarPattern opacity={0.05} /> */}
    <div className="relative max-w-5xl mx-auto flex flex-col gap-16">
      <div className="text-center flex flex-col gap-4">
        <Eyebrow>Our partners</Eyebrow>
        <h2
          className="font-display font-bold"
          style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)", color: BRAND.cream }}
        >
          People who help make this{" "}
          <GoldText>happen</GoldText>
        </h2>
        <p className="font-intimate text-xl max-w-xl mx-auto" style={{ fontStyle: "italic", color: BRAND.creamMuted }}>
          Sponsoring MuslimHacks supports students building for their communities,
          and funds raised go to charity through Islamic Relief Canada.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Eyebrow className="text-center">Lead Partner</Eyebrow>
        <div
          className="rounded-2xl p-10 flex flex-col sm:flex-row items-center justify-center gap-8"
          style={{
            background: "rgba(245,238,227,0.05)",
            border: `1px solid rgba(221,168,83,0.28)`,
            boxShadow: "0 8px 30px rgba(221,168,83,0.1)",
          }}
        >
          <img
              src={islamicReliefLogo}
            alt="Islamic Relief Canada"
            className="h-20 w-auto object-contain"
            />
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <p className="font-display text-2xl font-semibold" style={{ color: BRAND.cream }}>
              Islamic Relief Canada
            </p>
            <p className="font-sans text-sm" style={{ color: BRAND.creamMuted }}>
              Charity partner
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Eyebrow className="text-center">2026 Sponsors</Eyebrow>
        {/* Grid with blurred cards + centered overlay */}
        <div className="relative rounded-xl overflow-hidden">
          {/* Blurred placeholder grid */}
          <div
            className="grid grid-cols-3 md:grid-cols-4 gap-3 p-6"
            style={{ filter: "blur(2px)", opacity: 0.35, pointerEvents: "none", userSelect: "none" }}
          >
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-lg"
                style={{
                  background: "rgba(245,238,227,0.07)",
                  border: `1px solid rgba(221,168,83,0.15)`,
                }}
              />
            ))}
          </div>

          {/* Centered overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <p
              className="font-display font-semibold"
              style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", color: BRAND.cream }}
            >
              Coming soon
            </p>
            <p
              className="font-intimate text-base"
              style={{ fontStyle: "italic", color: BRAND.purpleLight }}
            >
              We're working on it!
            </p>
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl p-10 text-center flex flex-col items-center gap-6"
        style={{
          background: `linear-gradient(135deg, rgba(75,46,99,0.4) 0%, rgba(12,31,63,0.6) 100%)`,
          border: `1px solid rgba(221,168,83,0.22)`,
        }}
      >
        <p className="font-display text-2xl font-semibold" style={{ color: BRAND.cream }}>
          Interested in partnering <GoldText>with us?</GoldText>
        </p>
        <p className="font-sans text-sm max-w-md" style={{ color: BRAND.creamMuted }}>
          You'll reach Muslim students and builders across Quebec, plus people who
          care about the communities we serve.
        </p>
        <a
          href="mailto:sponsors@muslimhacksoutreach.ca"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-sans text-sm font-semibold uppercase tracking-[0.15em] transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2"
          style={{
            background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
            color: BRAND.navyDeep,
            boxShadow: "0 8px 30px rgba(221,168,83,0.22)",
          }}
        >
          Become a Sponsor
          <ExternalLink size={14} />
        </a>
        <p className="font-sans text-xs" style={{ color: BRAND.sand }}>
          sponsors@muslimhacksoutreach.ca
        </p>
      </div>
    </div>
  </section>
  );
};

