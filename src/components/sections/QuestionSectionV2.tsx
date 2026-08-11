import { useScrollReveal } from "@/hooks/useScrollReveal";
import { BRAND, Eyebrow, GoldText } from "../Shared";

export default function QuestionSectionV2 () {
  const [titleRef, titleVisible] = useScrollReveal<HTMLHeadingElement>({
    threshold: 0.2,
  });
  const [hadithRef, hadithVisible] = useScrollReveal<HTMLDivElement>({
    threshold: 0.6,
  });
  const [questionRef, questionVisible] = useScrollReveal<HTMLDivElement>({
    threshold: 0.9,
  });

  return (
    <>
      <section id="about" className="relative overflow-hidden">
        <div
          className="relative py-24 px-6"
          style={{
            background: `linear-gradient(180deg, ${BRAND.navy} 0%, ${BRAND.purpleDeep} 100%)`,
          }}
        >
          <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-8">
            <Eyebrow>Why we do this</Eyebrow>
            <h2
              ref={titleRef}
              className={`font-display font-bold leading-tight ${
                titleVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-12"
              }`}
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                color: BRAND.cream,
              }}
            >
              What if your code could be <GoldText>sadaqah?</GoldText>
            </h2>

            <div
              ref={hadithRef}
              className={`w-full rounded-xl p-8 flex flex-col gap-6 my-4 ${
                hadithVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-12"
              }`}
              style={{
                background: "rgba(245,238,227,0.04)",
                border: `1px solid rgba(221,168,83,0.18)`,
              }}
            >
              <p
                className="font-arabic text-right leading-loose"
                dir="rtl"
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                  color: BRAND.gold,
                }}
              >
                خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ
              </p>
              <div className="flex flex-col gap-2">
                <p
                  className="font-intimate text-xl"
                  style={{ fontStyle: "italic", color: BRAND.cream }}
                >
                  "The best of people are those most beneficial to others."
                </p>
                <p
                  className="font-sans text-xs uppercase tracking-[0.22em]"
                  style={{ color: BRAND.sand }}
                >
                  — Jami' at-Tirmidhi
                </p>
              </div>
            </div>

            <p
              ref={questionRef}
              className={`font-intimate text-xl leading-relaxed ${
                questionVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-12"
              }`}
              style={{ fontStyle: "normal", color: BRAND.creamMuted }}
            >
              Most of us already write code for school or work. MuslimHacks is
              about putting that same energy toward something that helps people,
              with a real intention behind it.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

