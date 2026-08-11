import { useScrollReveal } from "@/hooks/useScrollReveal";
import { BRAND, Eyebrow, GoldText } from "../Shared";

export default function VisionFunnelSection() {
  const [headerRef, headerVisible] = useScrollReveal<HTMLDivElement>({
    threshold: 0.2,
  });
  const [bodyRef, bodyVisible] = useScrollReveal<HTMLDivElement>({
    threshold: 0.12,
  });
  const [ctaRef, ctaVisible] = useScrollReveal<HTMLDivElement>({
    threshold: 0.3,
  });

  return (
    <section id="our-vision" className="relative overflow-hidden">
      <div
        className="relative py-24 px-6"
        style={{
          background: `linear-gradient(180deg, ${BRAND.navy} 0%, ${BRAND.purpleDeep} 100%)`,
        }}
      >
        <div className="max-w-3xl mx-auto flex flex-col gap-10">
          <div
            ref={headerRef}
            className={`flex flex-col gap-4 text-center transition-all duration-700 ${
              headerVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Eyebrow>Our vision</Eyebrow>
            <h2
              className="font-display font-bold leading-tight"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                color: BRAND.cream,
              }}
            >
              What is <GoldText>MuslimHacks</GoldText>?
            </h2>
          </div>

          <div
            ref={bodyRef}
            className={`flex flex-col gap-6 transition-all duration-700 delay-100 ${
              bodyVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <p
              className="font-intimate text-xl leading-relaxed"
              style={{ fontStyle: "normal", color: BRAND.creamMuted }}
            >
              Before we started MuslimHacks, we saw a clear problem in Quebec:
              plenty of talented Muslims in tech, but not enough of a connected
              network. Our mission is to build that over the next few years,
              starting by connecting students to Muslim businesses and
              professionals.
            </p>
            <p
              className="font-intimate text-xl leading-relaxed"
              style={{ fontStyle: "normal", color: BRAND.creamMuted }}
            >
              We want people to realize there is a whole Muslim industry out
              there, and that we do not always need to rely on non-Muslim
              networks to grow. That is the idea we want to foster, in shaa
              Allah.
            </p>

            <div
              className="rounded-xl p-7 flex flex-col gap-4"
              style={{
                background: "rgba(245,238,227,0.04)",
                border: "1px solid rgba(221,168,83,0.18)",
              }}
            >
              <Eyebrow>What makes us different</Eyebrow>
              <p
                className="font-intimate text-lg leading-relaxed"
                style={{ fontStyle: "normal", color: BRAND.creamMuted }}
              >
                Other Muslim hackathons often started inside ecosystems that
                were already built for them. Their goal was usually to bring
                more Muslims into networks that were already flourishing, by the
                mercy of Allah.
              </p>
              <p
                className="font-intimate text-lg leading-relaxed"
                style={{ fontStyle: "normal", color: BRAND.creamMuted }}
              >
                Quebec is not the same. We are building from scratch and trying
                to lay the foundations of the network we envision here, in shaa
                Allah. One weekend will not solve everything, but we hope
                MuslimHacks becomes a stepping stone toward that goal.
              </p>
            </div>
          </div>

          <div
            ref={ctaRef}
            className={`flex justify-center pt-2 transition-all duration-700 delay-200 ${
              ctaVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <a
              href="#benefits"
              className="font-sans text-xs uppercase tracking-[0.3em] font-medium hover:opacity-70 transition-opacity"
              style={{ color: BRAND.sand }}
            >
              See what you get ↓
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
