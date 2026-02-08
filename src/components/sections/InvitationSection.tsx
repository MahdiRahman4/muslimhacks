import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const InvitationSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [titleRef, titleVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const [formRef, formVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const [closingRef, closingVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setEmail("");
    toast.success("Jazakallah khair! We'll be in touch soon.");
  };

  return (
    <section
      id="register"
      className="relative min-h-screen flex flex-col items-center justify-center py-32 overflow-hidden"
    >
      {/* Deep twilight background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, hsl(280 40% 20%) 0%, hsl(235 45% 12%) 60%, hsl(240 50% 8%) 100%)",
        }}
      />

      {/* Subtle glow at center */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, hsl(280 40% 30% / 0.4) 0%, transparent 60%)",
        }}
      />

      {/* Content - centered for the first time */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        {/* The invitation */}
        <div
          ref={titleRef}
          className={`mb-16 transition-all duration-1000 ${
            titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="font-sans text-sm uppercase tracking-[0.3em] text-amber mb-6">Stay in the loop</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-cream leading-tight mb-8">
            Will you build
            <br />
            <span className="text-gradient-sunset">with us?</span>
          </h2>
          <p className="font-intimate text-xl md:text-2xl text-cream/80 max-w-md mx-auto">
            Leave your email and we'll let you know once the registration period has begun!
          </p>
        </div>

        {/* Email capture form */}
        <div
          ref={formRef}
          className={`mb-20 transition-all duration-1000 delay-200 ${
            formVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
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
          <p className="text-sm text-cream/50 mt-4">We respect your inbox. Updates only, no spam.</p>
        </div>

        {/* Closing blessing */}
        <div
          ref={closingRef}
          className={`transition-all duration-1000 delay-400 ${
            closingVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="mb-8">
            <p className="font-arabic text-3xl text-cream/50 mb-4" dir="rtl">
              بارك الله فيكم
            </p>
            <p className="font-intimate text-lg text-cream/40">May Allah bless you</p>
          </div>

          {/* Footer */}
          <div className="pt-12 border-t border-cream/10">
            <p className="font-display text-2xl text-gradient-sunset mb-2">MuslimHacks</p>
            <p className="font-sans text-sm text-cream/40">Québec's largest Muslim charity hackathon</p>
            <p className="font-sans text-xs text-cream/30 mt-4">In partnership with Islamic Relief Canada</p>
          </div>
        </div>
      </div>

      {/* Fade to near-darkness at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[hsl(240,50%,5%)] to-transparent" />
    </section>
  );
};

export default InvitationSection;
