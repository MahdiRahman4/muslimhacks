import { useScrollReveal, useParallax } from '@/hooks/useScrollReveal';
import IslamicPattern, { IslamicPatternAlt } from '@/components/IslamicPattern';
import { BRAND, StarPattern, GoldText, Eyebrow } from "../Shared";
import ValueCard from '../ui/valueCard';

// ─── Community photo strip ────────────────────────────────────────────────────
const STRIP_PHOTOS = [
  {
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=75",
    alt: "Group collaborating on laptops at a hackathon",
  },
  {
    url: "https://images.unsplash.com/photo-1573939705721-9fa2cdcda901?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=75",
    alt: "Community gathering",
  },
  {
    url: "https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=75",
    alt: "Developer focused at a hackathon",
  },
  {
    url: "https://images.unsplash.com/photo-1632910121591-29e2484c0259?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=75",
    alt: "Two developers working together",
  },
  {
    url: "https://images.unsplash.com/photo-1637073849667-91120a924221?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=75",
    alt: "Pair programming at a community event",
  },
];

function PhotoStrip() {
  return (
    <div className="relative overflow-hidden" style={{ background: BRAND.navyDeep }}>
      <div className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory px-6 pb-6 pt-2 md:grid md:grid-cols-5 md:overflow-visible md:px-0 md:pb-0 md:pt-0">
        {STRIP_PHOTOS.map((p, i) => (
          <div
            key={i}
            className="relative shrink-0 w-64 h-44 md:w-auto md:h-52 rounded-lg overflow-hidden snap-start group"
            style={{ border: `1px solid rgba(221,168,83,0.22)` }}
          >
            <img
              src={p.url}
              alt={p.alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ filter: "saturate(0.8) brightness(0.85)" }}
              loading="lazy"
            />
            <div
              className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-30 opacity-50"
              style={{
                background: `linear-gradient(135deg, rgba(75,46,99,0.55) 0%, rgba(13,31,63,0.35) 100%)`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Scrolling marquee ───────────────────────────────────────────────────────
const MARQUEE_WORDS = [
  { en: "Niyyah", ar: "نيّة" },
  { en: "Ummah", ar: "أمّة" },
  { en: "Sincerity", ar: "إخلاص" },
  { en: "Service", ar: "خدمة" },
  { en: "Barakah", ar: "بركة" },
  { en: "Sadaqah", ar: "صدقة" },
  { en: "Tawakkul", ar: "توكّل" },
  { en: "Ihsan", ar: "إحسان" },
];

function MarqueeTrack() {
  return (
    <>
      {MARQUEE_WORDS.map((w, i) => (
        <span key={i} className="inline-flex items-center gap-3 shrink-0">
          <span
            className="font-sans text-xs uppercase tracking-[0.28em] font-medium whitespace-nowrap"
            style={{ color: BRAND.creamMuted }}
          >
            {w.en}
          </span>
          <span
            className="font-arabic text-lg leading-none"
            style={{ color: BRAND.gold, direction: "rtl" }}
          >
            {w.ar}
          </span>
          <span className="shrink-0" style={{ color: "rgba(221,168,83,0.3)" }}>·</span>
        </span>
      ))}
    </>
  );
}

function Marquee() {
  return (
    <div
      className="group/marquee relative py-6 border-y overflow-hidden"
      style={{
        borderColor: "rgba(221,168,83,0.2)",
        background: `linear-gradient(135deg, ${BRAND.purpleDeep} 0%, ${BRAND.navy} 100%)`,
      }}
    >
      <div className="flex w-max flex-nowrap animate-marquee">
        <div className="flex flex-nowrap items-center gap-6 pr-6">
          <MarqueeTrack />
        </div>
        <div className="flex flex-nowrap items-center gap-6 pr-6" aria-hidden="true">
          <MarqueeTrack />
        </div>
      </div>
    </div>
  );
}

export default function VisionSectionV2 () {
  const [parallaxRef, parallaxOffset] = useParallax(0.15);
  const [titleRef, titleVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const [detailsRef, detailsVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });
  const [valuesRef, valuesVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section id='vision'>
      <div
          className="relative py-24 px-6 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${BRAND.purpleDeep} 0%, #2A2150 50%, ${BRAND.navy} 100%)`,
          }}
        >
          <StarPattern opacity={0.07} />
          <div className="relative max-w-6xl mx-auto flex flex-col gap-12">
            <div className="text-center flex flex-col gap-3">
              <Eyebrow>What We Stand For</Eyebrow>
              <h2
                className="font-display font-bold"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: BRAND.cream }}
              >
                Building with <GoldText>barakah</GoldText>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <ValueCard
                eyebrow="The Gathering"
                title="Sincere People"
                body="We bring together Muslims and allies who care deeply — developers, designers, community organizers — united by a shared niyyah to build something real."
              />
              <ValueCard
                eyebrow="The Challenge"
                title="Real Impact"
                body="24 hours. One mission. Projects at MuslimHacks tackle real challenges facing Muslim communities — from accessibility to food security to mental health."
              />
              <ValueCard
                eyebrow="The Barakah"
                title="Sadaqah Jariyah"
                body="The best hacks live on. We invest in projects that keep giving — open-source tools, charitable platforms, and technology built for the ummah."
              />
            </div>
          </div>
        </div>

        {/* Photo strip */}
        <div className="py-12" style={{ background: BRAND.navyDeep }}>
          <div className="max-w-6xl mx-auto px-0 md:px-6 flex flex-col gap-6">
            <div className="px-6 md:px-0 flex flex-col gap-2">
              <Eyebrow>The Community</Eyebrow>
              <p className="font-intimate text-xl" style={{ fontStyle: "italic", color: BRAND.creamMuted }}>
                This is what belonging looks like.
              </p>
            </div>
            <PhotoStrip />
          </div>
        </div>

        <Marquee />
    </section>
  );
};

