import { useScrollReveal } from '@/hooks/useScrollReveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
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
    answer: "MuslimHacks 2026 will be an in-person event in Quebec. We believe the best collaborations happen face-to-face, and we're creating a space for meaningful connection as much as coding."
  },
  {
    question: "What's the cost?",
    answer: "MuslimHacks is free to attend. We still raise funds for charity through Islamic Relief Canada."
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

const FAQSection = () => {
  const [headerRef, headerVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const [faqRef, faqVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section id="faq" className="relative min-h-screen py-32 overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, hsl(235 40% 18%) 0%, hsl(230 35% 15%) 100%)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12">
        
        {/* Header - left aligned */}
        <div 
          ref={headerRef}
          className={`max-w-xl mb-16 transition-all duration-1000 ${
            headerVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
          }`}
        >
          <p className="font-sans text-base uppercase tracking-[0.3em] text-amber mb-4">
            Questions answered
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-cream leading-tight mb-6">
            Everything you need<br />
            <span className="text-gradient-sunset">to know</span>
          </h2>
          <p className="font-intimate text-xl md:text-2xl text-cream/70">
            Can't find your answer? Reach out at{' '}
            <a href="mailto:info@muslimhacks.ca" className="text-amber hover:underline">
              info@muslimhacks.ca
            </a>
          </p>
        </div>
        
        {/* FAQ Accordion */}
        <div 
          ref={faqRef}
          className={`transition-all duration-1000 delay-200 ${
            faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-none bg-cream/5 rounded-lg px-6 data-[state=open]:bg-cream/10 transition-colors"
              >
                <AccordionTrigger className="text-left font-display text-xl md:text-2xl text-cream hover:text-amber hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="font-intimate text-xl md:text-2xl text-cream/80 pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
      </div>
      
      {/* Decorative */}
      <div className="absolute right-0 top-1/4 w-48 h-48 border border-rose/10 rounded-full opacity-50" />
      <div className="absolute left-12 bottom-1/4 w-24 h-24 border border-amber/10 rounded-full opacity-50" />
    </section>
  );
};

export default FAQSection;
