import { BRAND, StarPattern, GoldText, Eyebrow } from "../Shared";
import GoldButton from '../ui/goldButton';
import { Link } from "react-router-dom";

export default function OpeningSectionV2 () {
  const heroPhotoUrl =
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1600&q=80";

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
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
              background: `linear-gradient(135deg,
                rgba(180,60,20,0.72) 0%,
                rgba(140,30,100,0.75) 30%,
                rgba(75,46,99,0.82) 60%,
                rgba(12,31,63,0.92) 100%)`,
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

        <div className="absolute inset-0 opacity-30">
          <StarPattern opacity={0.04} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24 w-full">
          <div className="max-w-2xl flex flex-col gap-6">
            <Eyebrow className='animate-fade-in-up'>Québec's Largest Muslim Charity Hackathon</Eyebrow>

            <h1
              className="font-display font-black leading-none animate-fade-in-up"
              style={{ fontSize: "clamp(4rem, 10vw, 8rem)", letterSpacing: "-0.02em" }}
            >
              <span style={{ color: BRAND.cream }}>Muslim</span>
              <br />
              <GoldText>Hacks</GoldText>
            </h1>

            <p
              className="font-intimate text-2xl leading-snug animate-fade-in-up"
              style={{ fontStyle: "italic", color: BRAND.creamMuted }}
            >
              24 hours to build technology with purpose.
            </p>

            <p className="font-intimate text-lg animate-fade-in-up" style={{ fontStyle: "italic" }}>
              <GoldText>September 2026</GoldText>
              <span style={{ color: BRAND.creamMuted }}>
                {" "}· Concordia University, Downtown Campus, Montréal, Québec
              </span>
            </p>

            <div className="flex flex-col gap-4 mt-2 animate-fade-in-up">
              <GoldButton as={Link} to="/apply" className="w-full sm:w-auto sm:self-start">
                Apply now
              </GoldButton>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, transparent, ${BRAND.navy})` }}
        />
      </section>
  );
};
