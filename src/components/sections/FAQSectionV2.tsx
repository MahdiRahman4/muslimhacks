import { useScrollReveal } from '@/hooks/useScrollReveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BRAND, StarPattern, GoldText, Eyebrow } from "../Shared";
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from "@/i18n/LanguageProvider";


interface Faqs {
  question: string;
  answer: string;
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b"
      style={{ borderColor: "rgba(221,168,83,0.15)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between py-5 text-left gap-4 focus-visible:outline-none focus-visible:ring-2 rounded"
        aria-expanded={open}
        style={{ color: BRAND.cream }}
      >
        <span className="font-intimate text-lg leading-snug" style={{ fontStyle: "normal" }}>
          {q}
        </span>
        <span
          className="shrink-0 mt-0.5 transition-transform duration-300"
          style={{ color: BRAND.gold, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <ChevronDown size={20} />
        </span>
      </button>
      {open && (
        <p className="pb-5 font-sans text-base leading-relaxed pr-8" style={{ color: BRAND.creamMuted }}>
          {a}
        </p>
      )}
    </div>
  );
}

export default function FAQSection() {
  const { t } = useI18n();
  const faqItems: Faqs[] = [
    { question: t("faq.q1"), answer: t("faq.a1") },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
    { question: t("faq.q4"), answer: t("faq.a4") },
    { question: t("faq.q5"), answer: t("faq.a5") },
    { question: t("faq.q6"), answer: t("faq.a6") },
    { question: t("faq.q7"), answer: t("faq.a7") },
    { question: t("faq.q8"), answer: t("faq.a8") },
  ];
  const [headerRef, headerVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const [faqRef, faqVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section
        id="faq"
        className="relative py-24 px-6 overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${BRAND.purpleDeep} 0%, ${BRAND.navyDeep} 100%)` }}
      >
        {/* <StarPattern opacity={0.045} /> */}
        <div className="relative max-w-3xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <Eyebrow>{t("faq.eyebrow")}</Eyebrow>
            <h2
              className="font-display font-bold"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.25rem)", color: BRAND.cream }}
            >
              {t("faq.headingBefore")}<GoldText>{t("faq.headingGold")}</GoldText>
            </h2>
            <p className="font-sans text-sm" style={{ color: BRAND.creamMuted }}>
              {t("faq.stillHave")}{" "}
              <a
                href="mailto:info@muslimhacks.ca"
                className="underline underline-offset-2 hover:opacity-80 focus-visible:ring-1 rounded"
                style={{ color: BRAND.gold }}
              >
                info@muslimhacks.ca
              </a>
            </p>
          </div>
          <div className="flex flex-col">
            {faqItems.map((item, i) => (
              <FaqItem key={i} q={item.question} a={item.answer} />
            ))}
          </div>
        </div>
      </section>
  );
};

