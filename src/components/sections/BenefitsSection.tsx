import {
  UtensilsCrossed,
  GraduationCap,
  Handshake,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { BRAND, Eyebrow, GoldText } from "../Shared";
import { ApplyFunnelCta } from "@/components/ApplyFunnelCta";
import { useI18n } from "@/i18n/LanguageProvider";
import { APPLICATIONS_OPEN } from "@/lib/applications-open";

const BENEFIT_KEYS = [
  {
    icon: UtensilsCrossed,
    title: "foodTitle",
    body: "foodBody",
  },
  {
    icon: GraduationCap,
    title: "mentorTitle",
    body: "mentorBody",
  },
  {
    icon: Handshake,
    title: "networkTitle",
    body: "networkBody",
  },
  {
    icon: Briefcase,
    title: "internTitle",
    body: "internBody",
  },
  {
    icon: TrendingUp,
    title: "investTitle",
    body: "investBody",
  },
] as const;

function BenefitRow({
  icon: Icon,
  title,
  body,
  isLast,
}: {
  icon: typeof UtensilsCrossed;
  title: string;
  body: string;
  isLast: boolean;
}) {
  return (
    <li
      className="group flex items-start gap-5 py-6"
      style={{
        borderBottom: isLast ? "none" : "1px solid rgba(221,168,83,0.14)",
      }}
    >
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105"
        style={{
          background: "rgba(221,168,83,0.12)",
          border: "1px solid rgba(221,168,83,0.28)",
          color: BRAND.gold,
        }}
      >
        <Icon size={22} />
      </div>
      <div className="flex flex-col gap-1.5">
        <h3
          className="font-display text-xl sm:text-2xl font-bold leading-tight"
          style={{ color: BRAND.cream }}
        >
          {title}
        </h3>
        <p
          className="font-sans text-sm leading-relaxed"
          style={{ color: BRAND.creamMuted }}
        >
          {body}
        </p>
      </div>
    </li>
  );
}

export default function BenefitsSection() {
  const { t } = useI18n();
  const [introRef, introVisible] = useScrollReveal<HTMLDivElement>({
    threshold: 0.2,
  });
  const [listRef, listVisible] = useScrollReveal<HTMLDivElement>({
    threshold: 0.1,
  });

  return (
    <section id="benefits" className="relative overflow-hidden">
      <div
        className="relative py-24 px-6"
        style={{
          background: `linear-gradient(180deg, ${BRAND.purpleDeep} 0%, ${BRAND.navy} 100%)`,
        }}
      >
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] gap-12 lg:gap-20 items-start">
          {/* Left: the pitch */}
          <div
            ref={introRef}
            className={`flex flex-col gap-6 lg:sticky lg:top-28 transition-all duration-700 ${
              introVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Eyebrow>{t("benefits.eyebrow")}</Eyebrow>
            <h2
              className="font-display font-bold leading-tight"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: BRAND.cream,
              }}
            >
              {t("benefits.headingBefore")}<GoldText>{t("benefits.headingGold")}</GoldText>
            </h2>
            <p
              className="font-intimate text-xl leading-relaxed"
              style={{ fontStyle: "normal", color: BRAND.creamMuted }}
            >
              {t("benefits.intro")}
            </p>
          </div>

          {/* Right: the list */}
          <div
            ref={listRef}
            className={`transition-all duration-700 delay-100 ${
              listVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <ul className="flex flex-col">
              {BENEFIT_KEYS.map((benefit, index) => (
                <BenefitRow
                  key={benefit.title}
                  icon={benefit.icon}
                  title={t(`benefits.${benefit.title}`)}
                  body={t(`benefits.${benefit.body}`)}
                  isLast={index === BENEFIT_KEYS.length - 1}
                />
              ))}
            </ul>
            {/* CTA sits after the full list so the ask comes once the value is read */}
            {APPLICATIONS_OPEN && (
              <div className="pt-8">
                <ApplyFunnelCta align="start" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
