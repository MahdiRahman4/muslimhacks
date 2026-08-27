import { useState } from "react";
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { BRAND, GoldText, Eyebrow } from "../Shared";
import {ExternalLink} from "lucide-react"
import PPLUSLogo from "../../assets/pplus-logo.png";
import islamicReliefLogo from "../../assets/islamicReliefCanada-logo.png";
import replitLogo from "../../assets/replit-logo.svg";
import BannyaLogo from "../../assets/bannya-logo.png";
import { useI18n } from "@/i18n/LanguageProvider";

type SponsorTierKey = "leadPartner" | "platinum" | "gold" | "silver" | "bronze";

type Sponsor = {
  name: string;
  logoPath: string;
  subtitleKey?: string;
};

const TIER_LABELS: Record<SponsorTierKey, string> = {
  leadPartner: "Lead Partner",
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};


const TIER_LAYOUT: Record<SponsorTierKey, "featured" | "grid"> = {
  leadPartner: "featured",
  platinum: "grid",
  gold: "grid",
  silver: "grid",
  bronze: "grid",
};

const TIER_LOGO_SIZE: Record<SponsorTierKey, { height: string; width: string }> = {
  leadPartner: { height: "clamp(5.5rem, 10vw, 8.5rem)", width: "clamp(11rem, 20vw, 18rem)" },
  platinum: { height: "clamp(4.5rem, 8vw, 7rem)", width: "clamp(9rem, 16vw, 15rem)" },
  gold: { height: "clamp(3.5rem, 6.5vw, 5.5rem)", width: "clamp(7.5rem, 13vw, 12rem)" },
  silver: { height: "clamp(2.75rem, 5vw, 4.25rem)", width: "clamp(6rem, 10vw, 9.5rem)" },
  bronze: { height: "clamp(2.1rem, 4vw, 3.2rem)", width: "clamp(4.5rem, 8vw, 7rem)" },
};

const TIER_CARD_STYLE: Record<SponsorTierKey, { border: string; shadow: string; padding: string }> = {
  leadPartner: { border: "rgba(221,168,83,0.35)", shadow: "0 10px 40px rgba(221,168,83,0.16)", padding: "p-10" },
  platinum: { border: "rgba(221,168,83,0.28)", shadow: "0 8px 30px rgba(221,168,83,0.10)", padding: "p-7" },
  gold: { border: "rgba(221,168,83,0.22)", shadow: "0 6px 24px rgba(221,168,83,0.08)", padding: "p-6" },
  silver: { border: "rgba(221,168,83,0.16)", shadow: "none", padding: "p-5" },
  bronze: { border: "rgba(221,168,83,0.12)", shadow: "none", padding: "p-4" },
};

const CARD_LAYOUT: Record<"featured" | "grid", { wrapper: string; text: string; name: string; subtitle: string }> = {
  featured: {
    wrapper: "flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8",
    text: "flex flex-col items-center sm:items-start gap-1 text-center sm:text-left",
    name: "font-display text-2xl sm:text-3xl font-semibold",
    subtitle: "font-sans text-sm",
  },
  grid: {
    wrapper: "flex-col items-center justify-center gap-3",
    text: "flex flex-col items-center gap-0.5 text-center",
    name: "font-display text-base font-semibold",
    subtitle: "font-sans text-xs",
  },
};

const TIER_ORDER: SponsorTierKey[] = ["leadPartner", "platinum", "gold", "silver", "bronze"];

const SPONSORS: Record<SponsorTierKey, Sponsor[]> = {
  leadPartner: [
    { name: "PPLUS.io", logoPath: PPLUSLogo },
  ],
  platinum: [
    { name: "Islamic Relief Canada", logoPath: islamicReliefLogo, subtitleKey: "sponsors.charityPartner" },
    { name: "Replit", logoPath: replitLogo },
  ],
  gold: [],
  silver: [],
  bronze: [
    { name: "Bannya Systems Inc.", logoPath: BannyaLogo },
  ],
};

function SponsorCard({ sponsor, tier }: { sponsor: Sponsor; tier: SponsorTierKey }) {
  const { t } = useI18n();
  const [logoFailed, setLogoFailed] = useState(false);
  const card = TIER_CARD_STYLE[tier];
  const size = TIER_LOGO_SIZE[tier];
  const layout = CARD_LAYOUT[TIER_LAYOUT[tier]];

  return (
    <div
      className={`rounded-2xl ${card.padding} flex ${layout.wrapper}`}
      style={{
        background: "rgba(245,238,227,0.05)",
        border: `1px solid ${card.border}`,
        boxShadow: card.shadow,
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{ height: size.height, width: size.width }}
      >
        {logoFailed ? (
          <span
            className="font-display font-semibold text-center"
            style={{ color: BRAND.cream }}
          >
            {sponsor.name}
          </span>
        ) : (
          <img
            src={sponsor.logoPath}
            alt={sponsor.name}
            className="max-h-full max-w-full object-contain"
            onError={() => setLogoFailed(true)}
          />
        )}
      </div>
      <div className={layout.text}>
        <p className={layout.name} style={{ color: BRAND.cream }}>
          {sponsor.name}
        </p>
        {sponsor.subtitleKey && (
          <p className={layout.subtitle} style={{ color: BRAND.creamMuted }}>
            {t(sponsor.subtitleKey)}
          </p>
        )}
      </div>
    </div>
  );
}

function TierSection({ tier }: { tier: SponsorTierKey }) {
  const sponsors = SPONSORS[tier];
  const headingSize = tier === "leadPartner" ? "text-base sm:text-lg" : "text-sm sm:text-base";

  if (sponsors.length === 0) return null;

  return (
    <div className="flex flex-col gap-5">
      <Eyebrow className={`text-center ${headingSize}`}>{TIER_LABELS[tier]}</Eyebrow>
      <div className="flex flex-wrap items-stretch justify-center gap-5 sm:gap-6">
        {sponsors.map((sponsor) => (
          <SponsorCard key={sponsor.name} sponsor={sponsor} tier={tier} />
        ))}
      </div>
    </div>
  );
}

export default function SponsorsSectionV2() {
  const { t } = useI18n();
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
        <Eyebrow>{t("sponsors.eyebrow")}</Eyebrow>
        <h2
          className="font-display font-bold"
          style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)", color: BRAND.cream }}
        >
          {t("sponsors.headingBefore")}
          <GoldText>{t("sponsors.headingGold")}</GoldText>
        </h2>
        <p className="font-intimate text-xl max-w-xl mx-auto" style={{ fontStyle: "normal", color: BRAND.creamMuted }}>
          {t("sponsors.intro")}
        </p>
      </div>

      <div className="flex flex-col gap-12">
        {TIER_ORDER.map((tier) => (
          <TierSection key={tier} tier={tier} />
        ))}
      </div>

      <div
        className="rounded-2xl p-10 text-center flex flex-col items-center gap-6"
        style={{
          background: `linear-gradient(135deg, rgba(75,46,99,0.4) 0%, rgba(12,31,63,0.6) 100%)`,
          border: `1px solid rgba(221,168,83,0.22)`,
        }}
      >
        <p className="font-display text-2xl font-semibold" style={{ color: BRAND.cream }}>
          {t("sponsors.partnerHeadingBefore")}<GoldText>{t("sponsors.partnerHeadingGold")}</GoldText>
        </p>
        <p className="font-sans text-sm max-w-md" style={{ color: BRAND.creamMuted }}>
          {t("sponsors.partnerBody")}
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
          {t("sponsors.becomeSponsor")}
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
