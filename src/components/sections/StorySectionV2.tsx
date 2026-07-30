import { useScrollReveal } from '@/hooks/useScrollReveal';
import { BRAND, Eyebrow, GoldText } from "../Shared";

export default function StorySectionV2 () {
  const [headerRef, headerVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const [bodyRef, bodyVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });
  const [closingRef, closingVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section id="origin-story" className="relative overflow-hidden">
       <div
          className="relative py-24 px-6"
          style={{ background: `linear-gradient(180deg, ${BRAND.purpleDeep} 0%, ${BRAND.navy} 100%)` }}
        >
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <Eyebrow>How it started</Eyebrow>
              <h2
                className="font-display font-bold leading-tight"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: BRAND.cream }}
              >
                It started as a{" "}
                <GoldText>niyyah</GoldText>
                <br />
                between friends.
              </h2>
              <p className="font-intimate text-lg leading-relaxed" style={{ fontStyle: "italic", color: BRAND.creamMuted }}>
                A few Muslim students in Montréal kept asking the same thing: why aren't we
                building tools for our own communities? Why do we always use stuff that was
                never made with us in mind?
              </p>
              <p className="font-intimate text-lg leading-relaxed" style={{ color: BRAND.creamMuted }}>
                So they put on a hackathon. One weekend, people coding, designing, and
                figuring things out together. That small idea turned into MuslimHacks,
                now Quebec's largest Muslim charity hackathon.
              </p>
            </div>

            <div
              className="relative rounded-xl overflow-hidden aspect-[4/3] group"
              style={{ border: `1px solid rgba(221,168,83,0.28)` }}
            >
              <img
                src="https://images.unsplash.com/photo-1637073849667-91120a924221?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80"
                alt="Friends collaborating — the niyyah that started MuslimHacks"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ filter: "saturate(0.75) brightness(0.8)" }}
                loading="lazy"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(135deg, rgba(75,46,99,0.5) 0%, transparent 60%)",
                }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 px-5 py-4"
                style={{
                  background: "linear-gradient(to top, rgba(6,15,32,0.85), transparent)",
                }}
              >
                <p className="font-intimate text-sm" style={{ fontStyle: "italic", color: BRAND.creamMuted }}>
                  Friends who decided to just start
                </p>
              </div>
            </div>
          </div>
        </div>
    </section>
  );
};

