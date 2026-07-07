import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSubscribe } from "@/hooks/useSubscribe";
import SubscribeDialog from "@/components/SubscribeDialog";
import GoldButton from "../ui/goldButton";
import { Link } from "react-router-dom";
import { StarPattern } from "../Shared";

const InvitationSection = ({displayInviteDialog, displayApplyDialog}) => {
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

  const [titleRef, titleVisible] = useScrollReveal<HTMLDivElement>({
    threshold: 0.3,
  });
  const [formRef, formVisible] = useScrollReveal<HTMLDivElement>({
    threshold: 0.3,
  });
  const [applyRef, applyVisible] = useScrollReveal<HTMLDivElement>({
    threshold: 0.3,
  });
  const [closingRef, closingVisible] = useScrollReveal<HTMLDivElement>({
    threshold: 0.3,
  });

  return (
    <section
      id="register"
      className="relative min-h-screen flex flex-col items-center justify-center py-32 overflow-hidden"
    >
      {/* Deep twilight background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, hsl(280 40% 20%) 0%, hsl(235 45% 12%) 60%, hsl(240 50% 8%) 100%)",
        }}
      />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <StarPattern opacity={0.04} />
      </div>

      {/* Subtle glow at center */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, hsl(280 40% 30% / 0.4) 0%, transparent 60%)",
        }}
      />

      {/* Content - centered for the first time */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        {/* The invitation */}
        <div
          ref={titleRef}
          className={`mb-16 transition-all duration-1000 ${
            titleVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <p className="font-sans text-base uppercase tracking-[0.3em] text-amber mb-6">
            Registrations are open!
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-cream leading-tight mb-8">
            Will you build
            <br />
            <span className="text-gradient-sunset">with us?</span>
          </h2>
          <p className="font-intimate text-2xl md:text-3xl text-cream/80 max-w-md mx-auto leading-relaxed">
            Join thousands of builders, dreamers, and believers who are shaping
            technology with intention.
          </p>
        </div>

        {/* Email capture form for notification */}
        {displayInviteDialog && (
          <div
            ref={formRef}
            className={`mb-20 transition-all duration-1000 delay-200 ${
              formVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-cream/10 border-cream/20 text-cream placeholder:text-cream/40 focus:border-amber/50 focus:ring-amber/30"
                required
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-amber to-rose hover:from-amber-glow hover:to-rose text-plum-deep font-medium px-8 transition-all duration-300"
              >
                {isSubmitting ? "Sending..." : "Notify me"}
              </Button>
            </form>
            <p className="text-base md:text-lg text-cream/50 mt-4">
              We respect your inbox. Updates only, no spam.
            </p>

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

        {/* Apply now button */}
        {displayApplyDialog && (
          <div
            ref={applyRef}
            className={`mb-16 transition-all duration-1000 delay-200 ${
              applyVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <GoldButton as={Link} to="/login" className="w-full sm:w-auto">
              Apply now
            </GoldButton>
          </div>
        )}

        {/* Closing blessing */}
        <div
          ref={closingRef}
          className={`transition-all duration-1000 delay-400 ${
            closingVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="mb-8">
            <p className="font-arabic text-3xl text-cream/50 mb-4" dir="rtl">
              بارك الله فيكم
            </p>
            <p className="font-intimate text-xl text-cream/40">
              May Allah bless you
            </p>
          </div>

          {/* Footer */}
          <div className="pt-12 border-t border-cream/10">
            <p className="font-display text-2xl text-gradient-sunset mb-2">
              MuslimHacks
            </p>
            <p className="font-sans text-base md:text-lg text-cream/40">
              Québec's largest Muslim charity hackathon
            </p>
            <p className="font-sans text-sm text-cream/30 mt-4">
              In partnership with Islamic Relief Canada
            </p>
          </div>
        </div>
      </div>

      {/* Fade to near-darkness at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[hsl(240,50%,5%)] to-transparent" />
    </section>
  );
};

export default InvitationSection;
