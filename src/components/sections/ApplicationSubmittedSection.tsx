import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import NotFound from "../../pages/NotFound";
import { BRAND, StarPattern, GoldText, Eyebrow, GLOBAL_CSS } from "../Shared";
import Footer from "../ui/footer";

export default function ApplicationSubmittedSection() {
  const { t } = useTranslation();
  const steps = t("applySubmitted.steps", { returnObjects: true }) as {
    title: string;
    body: string;
  }[];
  return (
    <div
      className="min-h-screen font-sans relative"
      style={{
        background: `linear-gradient(160deg, ${BRAND.purpleDeep} 0%, ${BRAND.navy} 55%, ${BRAND.navyDeep} 100%)`,
        color: BRAND.cream,
      }}
    >
      <style>{GLOBAL_CSS}</style>

      {/* Star field */}
      {/* <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <StarPattern opacity={0.05} />
      </div> */}

      {/* Bismillah watermark */}
      <div
        className="fixed right-0 top-1/2 pointer-events-none select-none hidden lg:block"
        style={{
          fontSize: "clamp(16rem, 24vw, 26rem)",
          lineHeight: 1,
          color: BRAND.gold,
          opacity: 0.04,
          fontFamily: "'Amiri', serif",
          direction: "rtl",
          transform: "translateY(-50%) translateX(22%)",
        }}
        aria-hidden="true"
      >
        بسم الله
      </div>

      {/* Main content */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-12">

        {/* Confirmation seal */}
        <div className="relative flex items-center justify-center">
          {/* Outer glow ring */}
          <div
            className="absolute w-28 h-28 rounded-full"
            style={{
              background: "radial-gradient(ellipse, rgba(221,168,83,0.22) 0%, transparent 70%)",
            }}
          />
          {/* Circle badge */}
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${BRAND.purple} 0%, ${BRAND.navy} 100%)`,
              border: `1.5px solid rgba(221,168,83,0.45)`,
              boxShadow: "0 0 40px rgba(221,168,83,0.18), 0 8px 24px rgba(6,15,32,0.5)",
            }}
          >
            <Check
              size={32}
              strokeWidth={2.5}
              style={{ color: BRAND.gold }}
            />
          </div>
        </div>

        {/* Eyebrow + headline */}
        <div className="flex flex-col gap-4">
          <Eyebrow>{t("applySubmitted.eyebrow")}</Eyebrow>
          <h1
            className="font-display font-black leading-tight"
            style={{
              fontSize: "clamp(2.25rem, 6vw, 4rem)",
              letterSpacing: "-0.02em",
              color: BRAND.cream,
            }}
          >
            <GoldText>{t("applySubmitted.titleLine1")}</GoldText>
            <br />
            {t("applySubmitted.titleLine2")}
          </h1>
          <p
            className="font-intimate text-xl leading-relaxed"
            style={{ fontStyle: "italic", color: BRAND.creamMuted }}
          >
            {t("applySubmitted.subtitle")}
          </p>
        </div>

        {/* Email confirmation note */}
        <p
          className="font-sans text-sm leading-relaxed max-w-sm"
          style={{ color: BRAND.sand }}
        >
          {t("applySubmitted.confirmationNote")}
        </p>

        {/* What happens next */}
        <div className="w-full flex flex-col gap-3">
          <p
            className="font-sans text-xs uppercase tracking-[0.28em] font-medium mb-2"
            style={{ color: BRAND.gold }}
          >
            {t("applySubmitted.nextEyebrow")}
          </p>
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="flex items-start gap-5 text-left px-6 py-5 rounded-xl"
              style={{
                background: "rgba(245,238,227,0.04)",
                border: "1px solid rgba(221,168,83,0.13)",
              }}
            >
              {/* Number */}
              <span
                className="font-display font-bold text-2xl shrink-0 leading-none mt-0.5"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {i + 1}
              </span>
              <div className="flex flex-col gap-1">
                <p
                  className="font-display font-semibold text-base leading-snug"
                  style={{ color: BRAND.cream }}
                >
                  {s.title}
                </p>
                <p
                  className="font-intimate text-base"
                  style={{ fontStyle: "italic", color: BRAND.creamMuted }}
                >
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Arabic closing */}
        <div className="flex flex-col gap-2">
          <p
            className="font-arabic text-3xl leading-relaxed"
            dir="rtl"
            style={{ color: BRAND.gold }}
          >
            بارك الله فيكم
          </p>
          <p
            className="font-intimate text-lg"
            style={{ fontStyle: "italic", color: BRAND.creamMuted }}
          >
            {t("applySubmitted.blessing")}
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 w-full">
          <Link
            to="/"
            className="w-full sm:w-auto px-10 py-4 rounded-full font-sans text-sm font-semibold uppercase tracking-[0.18em] text-center transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
              color: BRAND.navyDeep,
              boxShadow: "0 8px 30px rgba(221,168,83,0.25)",
            }}
          >
            {t("applySubmitted.backToMuslimHacks")}
          </Link>
          <a
            href="mailto:info@muslimhacks.ca"
            className="font-sans text-xs hover:opacity-80 transition-opacity focus-visible:ring-2 rounded"
            style={{ color: BRAND.purpleLight }}
          >
            {t("applySubmitted.haveQuestion")}{" "}
            <span className="underline underline-offset-2">info@muslimhacks.ca</span>
          </a>
        </div>

      </main>

      <Footer />
    </div>
  );
}