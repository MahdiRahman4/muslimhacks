import { ChevronDown } from "lucide-react";
import { BRAND, GoldText, Eyebrow } from "../Shared";
import SubscribeDialog from "@/components/SubscribeDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSubscribe } from "@/hooks/useSubscribe";
import { ApplyFunnelCta } from "@/components/ApplyFunnelCta";

export default function OpeningSectionV2({
  displayInviteDialog,
  displayApplyDialog,
}) {
  const heroPhotoUrl =
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1600&q=80";

  const {
    email,
    setEmail,
    isSubmitting,
    handleSubmit,
    dialogOpen,
    onDialogOpenChange,
    dialogStage,
    resultVariant,
    handleConfirm,
    handleGoBack,
  } = useSubscribe();

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      <div className="absolute inset-0">
        <img
          src={heroPhotoUrl}
          alt="Hackathon participants collaborating"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.35) saturate(0.6)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(105deg,
                rgba(6,15,32,0.92) 0%,
                rgba(6,15,32,0.82) 35%,
                rgba(6,15,32,0.55) 60%,
                rgba(6,15,32,0.25) 100%)`,
          }}
        />
      </div>

      {/* Bismillah watermark */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none hidden lg:block"
        style={{
          fontSize: "clamp(18rem, 28vw, 30rem)",
          lineHeight: 1,
          color: BRAND.gold,
          opacity: 0.07,
          fontFamily: "'Amiri', serif",
          direction: "rtl",
          transform: "translateY(-50%) translateX(18%)",
        }}
        aria-hidden="true"
      >
        بسم الله
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24 w-full flex items-center">
        <div className="relative max-w-2xl">
          <div className="relative flex flex-col gap-6">
            <Eyebrow className="animate-fade-in-up">
              Quebec's Largest Muslim Charity Hackathon
            </Eyebrow>

            <h1
              className="font-display font-black leading-none animate-fade-in-up"
              style={{
                fontSize: "clamp(4rem, 10vw, 8rem)",
                letterSpacing: "-0.02em",
              }}
            >
              <span style={{ color: BRAND.cream }}>Muslim</span>
              <br />
              <GoldText>Hacks</GoldText>
            </h1>

            <p
              className="font-intimate text-2xl leading-snug animate-fade-in-up"
              style={{
                fontStyle: "normal",
                color: BRAND.cream,
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              }}
            >
              24 hours. One weekend. Build something that actually helps people.
            </p>

            <p
              className="font-intimate text-lg leading-relaxed animate-fade-in-up"
              style={{
                fontStyle: "normal",
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              }}
            >
              <GoldText>September 2026</GoldText>
              <span style={{ color: BRAND.creamMuted }}>
                {" "}
                · Concordia University, Downtown Campus, Montréal, Quebec
              </span>
            </p>

            {/* Email signup for notification*/}
            {displayInviteDialog && (
              <div className="max-w-md animate-fade-in-up animation-delay-400">
                <p
                  className="font-intimate text-2xl leading-snug animate-fade-in-up mb-4"
                  style={{
                    fontStyle: "normal",
                    color: BRAND.creamMuted,
                    textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                  }}
                >
                  Be the first to know when registration opens
                </p>
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-cream/10 border-cream/30 text-cream placeholder:text-cream/50 focus:border-amber/50 focus:ring-amber/30 h-12 text-base"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-amber to-rose hover:from-amber-glow hover:to-rose text-plum-deep font-semibold px-8 h-12 text-base transition-all duration-300"
                  >
                    {isSubmitting ? "Sending..." : "Notify me"}
                  </Button>
                </form>

                <SubscribeDialog
                  open={dialogOpen}
                  onOpenChange={onDialogOpenChange}
                  email={email}
                  isSubmitting={isSubmitting}
                  stage={dialogStage}
                  resultVariant={resultVariant}
                  onConfirm={handleConfirm}
                  onGoBack={handleGoBack}
                />
              </div>
            )}

            {/* Apply funnel — visible immediately */}
            {displayApplyDialog && (
              <div className="mt-2 animate-fade-in-up">
                <ApplyFunnelCta variant="hero" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, transparent, ${BRAND.navy})`,
        }}
      />

      {/* Scroll cue — centered so it reads as the next step */}
      <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center px-6 animate-fade-in-up">
        <a
          href="#our-vision"
          className="inline-flex items-center gap-3 px-6 py-3 rounded-full font-sans text-sm sm:text-base uppercase tracking-[0.28em] font-semibold whitespace-nowrap transition-all duration-200 hover:brightness-110"
          style={{
            color: BRAND.cream,
            background: "rgba(6,15,32,0.55)",
            border: "1px solid rgba(221,168,83,0.35)",
            backdropFilter: "blur(8px)",
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          {/* trailing letter-space would push the label off optical center */}
          <span className="-mr-[0.28em]">Read our vision</span>
          <ChevronDown
            size={18}
            className="animate-bounce"
            style={{ color: BRAND.gold }}
          />
        </a>
      </div>
    </section>
  );
}
