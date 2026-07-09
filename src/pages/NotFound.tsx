import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  BRAND,
  Eyebrow,
  GLOBAL_CSS,
  GoldText,
  StarPattern,
} from "@/components/Shared";
import Footer from "@/components/ui/footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen font-sans flex flex-col relative overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${BRAND.purpleDeep} 0%, ${BRAND.navy} 55%, ${BRAND.navyDeep} 100%)`,
        color: BRAND.cream,
      }}
    >
      <style>{GLOBAL_CSS}</style>

      {/* Star field */}
      <div className="fixed inset-0 pointer-events-none">
        <StarPattern opacity={0.06} />
      </div>

      {/* Large faint 404 watermark */}
      <div
        className="fixed inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden="true"
      >
        <span
          className="font-display font-black"
          style={{
            fontSize: "clamp(18rem, 40vw, 36rem)",
            lineHeight: 1,
            color: BRAND.gold,
            opacity: 0.03,
            letterSpacing: "-0.04em",
          }}
        >
          404
        </span>
      </div>

      {/* Arabic calligraphy watermark */}
      <div
        className="fixed right-0 bottom-0 pointer-events-none select-none hidden lg:block"
        style={{
          fontSize: "clamp(14rem, 20vw, 22rem)",
          lineHeight: 1,
          color: BRAND.gold,
          opacity: 0.04,
          fontFamily: "'Amiri', serif",
          direction: "rtl",
          transform: "translate(20%, 20%)",
        }}
        aria-hidden="true"
      >
        بسم الله
      </div>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-lg w-full flex flex-col items-center text-center gap-10">
          {/* Eyebrow + heading */}
          <div className="flex flex-col gap-4">
            <Eyebrow>404 — Page not found</Eyebrow>
            <h1
              className="font-display font-black leading-tight"
              style={{
                fontSize: "clamp(2.5rem, 7vw, 5rem)",
                letterSpacing: "-0.02em",
                color: BRAND.cream,
              }}
            >
              Lost on the <GoldText>path</GoldText>
            </h1>
            <p
              className="font-intimate text-xl leading-relaxed"
              style={{ fontStyle: "italic", color: BRAND.creamMuted }}
            >
              This page doesn't exist — but every wrong turn is a chance to find
              a better way.
            </p>
          </div>

          {/* Hadith-style quote */}
          <div
            className="w-full rounded-xl px-7 py-6 flex flex-col gap-4"
            style={{
              background: "rgba(245,238,227,0.04)",
              border: "1px solid rgba(221,168,83,0.14)",
            }}
          >
            <p
              className="font-arabic text-2xl leading-loose text-right"
              dir="rtl"
              style={{ color: BRAND.gold }}
            >
              وَوَجَدَكَ ضَآلًّۭا فَهَدَىٰ
            </p>
            <p
              className="font-intimate text-lg"
              style={{ fontStyle: "italic", color: BRAND.creamMuted }}
            >
              "Did He not find you unguided then guided you?"
            </p>
            <p
              className="font-sans text-xs uppercase tracking-[0.22em]"
              style={{ color: BRAND.sand }}
            >
              — Ad-Duhaa 93:7
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              to="/"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-sans text-sm font-semibold uppercase tracking-[0.18em] text-center transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 100%)`,
                color: BRAND.navyDeep,
                boxShadow:
                  "0 0 18px rgba(221,168,83,0.3), 0 4px 16px rgba(221,168,83,0.18)",
              }}
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default NotFound;
