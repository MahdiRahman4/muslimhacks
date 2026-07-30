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
    answer: "Nope. The event is rooted in Islamic values of service and charity, but anyone who wants to build something useful is welcome."
  },
  {
    question: "Do I need a team?",
    answer: "You can come solo or with up to 4 people. If you show up alone, we'll help you find a team on the first evening."
  },
  {
    question: "Will you offer travel reimbursements?",
    answer: "Not this year, unfortunately. We know travel can be tough, and we hope to support it more as the event grows."
  },
  {
    question: "Is the event in-person or virtual?",
    answer: "In person, in Quebec. We want people in the same room, not just on a Zoom call."
  },
  {
    question: "What's the cost?",
    answer: "It's free. We still fundraise for charity through Islamic Relief Canada."
  },
  {
    question: "Will there be prayer spaces and halal food?",
    answer: "Yes. We'll have prayer space, and there's a masjid nearby. All food is halal, and we can work with dietary restrictions."
  },
  {
    question: "What if I'm a beginner?",
    answer: "You're good. Bring what you know. There will be mentors and workshops, and plenty of people still figuring things out too."
  },
  {
    question: "How are projects judged?",
    answer: "We look at impact, how well it's built, creativity, and the pitch. Mostly though: does this actually help someone?"
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
        {/* <StarPattern opacity={0.045} /> */}
        <div className="relative max-w-3xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <Eyebrow>FAQ</Eyebrow>
            <h2
              className="font-display font-bold"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.25rem)", color: BRAND.cream }}
            >
              Common <GoldText>questions</GoldText>
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

