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

const BENEFITS = [
  {
    icon: UtensilsCrossed,
    title: "Free food",
    body: "Every meal is covered while you're here. Just show up and build.",
  },
  {
    icon: GraduationCap,
    title: "Mentorship from Muslim professionals",
    body: "Industry mentors sit with you during the build and help you get unstuck.",
  },
  {
    icon: Handshake,
    title: "Networking with Muslim businesses",
    body: "Meet founders and companies from the Muslim industry we're building here in Quebec.",
  },
  {
    icon: Briefcase,
    title: "Internship opportunities",
    body: "Recruiters will be at the event in shaa Allah, so your project can turn into a job lead.",
  },
  {
    icon: TrendingUp,
    title: "Investment in your project",
    body: "If investors believe in what you built, the weekend doesn't have to be where it ends.",
  },
];

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
            <Eyebrow>What you get</Eyebrow>
            <h2
              className="font-display font-bold leading-tight"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: BRAND.cream,
              }}
            >
              It&apos;s free, and you leave with <GoldText>more</GoldText>
            </h2>
            <p
              className="font-intimate text-xl leading-relaxed"
              style={{ fontStyle: "normal", color: BRAND.creamMuted }}
            >
              There is no fee to attend. Everything on this list is part of the
              weekend.
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
              {BENEFITS.map((benefit, index) => (
                <BenefitRow
                  key={benefit.title}
                  {...benefit}
                  isLast={index === BENEFITS.length - 1}
                />
              ))}
            </ul>
            {/* CTA sits after the full list so the ask comes once the value is read */}
            <div className="pt-8">
              <ApplyFunnelCta align="start" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
