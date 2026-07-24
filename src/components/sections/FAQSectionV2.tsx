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


interface Faqs {
  question: string;
  answer: string;
}

const FAQ_ITEMS : Faqs[] = [
  {
    question: "Do I need to be Muslim to participate?",
    answer: "MuslimHacks welcomes everyone who wants to build technology for social good. While our event is rooted in Islamic values of charity and service, participants of all backgrounds who share our mission are welcome."
  },
  {
    question: "Do I need a team?",
    answer: "You can register solo or with a team of up to 4 people. If you come alone, we'll help you find teammates during our team formation session on the first evening."
  },
  {
    question: "Will you offer travel reimbursements?",
    answer: "Unfortunately we won't be able to offer travel reimbursements this year. We know that travel costs can be a barrier, and it's something we really hope to support in future editions as MuslimHacks grows. We appreciate your understanding and your interest in being part of the event."
  },
  {
    question: "Is the event in-person or virtual?",
    answer: "MuslimHacks 2026 will be an in-person event in Québec. We believe the best collaborations happen face-to-face, and we're creating a space for meaningful connection as much as coding."
  },
  {
    question: "What's the cost?",
    answer: "There will be a cost to participate, but we keep it as low as possible. All proceeds go to charity through Islamic Relief Canada."
  },
  {
    question: "Will there be prayer spaces and halal food?",
    answer: "Absolutely! Not only will spaces be provided for prayer, but there will be a masjid nearby. All food provided will be halal, and we accommodate dietary restrictions."
  },
  {
    question: "What if I'm a beginner?",
    answer: "Perfect! Hackathons are for learning. We'll have mentors, workshops, and team balancing to ensure beginners can contribute meaningfully. Your perspective matters more than your years of experience."
  },
  {
    question: "How are projects judged?",
    answer: "Projects are evaluated on impact potential, technical execution, creativity, and presentation. But honestly? The real measure is whether your work could genuinely help someone. That's what we're here for."
  },
];

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
        <span className="font-intimate text-lg leading-snug" style={{ fontStyle: "italic" }}>
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
  const [headerRef, headerVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const [faqRef, faqVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section
        id="faq"
        className="relative py-24 px-6 overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${BRAND.purpleDeep} 0%, ${BRAND.navyDeep} 100%)` }}
      >
        <StarPattern opacity={0.045} />
        <div className="relative max-w-3xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <Eyebrow>Questions Answered</Eyebrow>
            <h2
              className="font-display font-bold"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.25rem)", color: BRAND.cream }}
            >
              Everything you need{" "}
              <GoldText>to know</GoldText>
            </h2>
            <p className="font-sans text-sm" style={{ color: BRAND.creamMuted }}>
              Still have questions?{" "}
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
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} q={item.question} a={item.answer} />
            ))}
          </div>
        </div>
      </section>
  );
};

