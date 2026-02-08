import { useScrollReveal } from '@/hooks/useScrollReveal';
import FloatingParticles from '@/components/FloatingParticles';

const QuestionSection = () => {
  const [titleRef, titleVisible] = useScrollReveal<HTMLHeadingElement>({ threshold: 0.3 });
  const [questionRef, questionVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const [statRef, statVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section className="relative min-h-screen py-32 overflow-hidden">
      {/* Background gradient shift */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, hsl(280 40% 30%) 0%, hsl(280 35% 22%) 50%, hsl(230 35% 20%) 100%)',
        }}
      />
      
      {/* Drifting particles */}
      <FloatingParticles 
        count={25} 
        color="hsl(350 45% 70% / 0.3)" 
        minSize={1} 
        maxSize={4}
      />
      
      {/* Content - intentionally left-aligned, narrow column */}
      <div className="relative z-10 max-w-xl ml-8 md:ml-16 lg:ml-32 px-6">
        
        {/* Opening provocation */}
        <h2 
          ref={titleRef}
          className={`font-display text-3xl md:text-4xl lg:text-5xl text-cream leading-tight mb-16 transition-all duration-700 ${
            titleVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
          }`}
        >
          What if your code<br />
          <span className="text-rose">could be sadaqah?</span>
        </h2>
        
        {/* Intimate questions */}
        <div 
          ref={questionRef}
          className={`space-y-8 mb-24 transition-all duration-700 delay-200 ${
            questionVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
          }`}
        >
          <p className="font-intimate text-xl md:text-2xl text-cream/80 leading-relaxed">
            You've built apps for startups.
          </p>
          <p className="font-intimate text-xl md:text-2xl text-cream/80 leading-relaxed">
            You've shipped features for corporations.
          </p>
          <p className="font-intimate text-xl md:text-2xl text-cream/80 leading-relaxed">
            But when did you last build something<br />
            <span className="text-amber-light">that might outlast you?</span>
          </p>
        </div>
        
        {/* Raw statistic - bleeds off right edge */}
        <div 
          ref={statRef}
          className={`relative transition-all duration-1000 delay-400 ${
            statVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'
          }`}
        >
          <p className="font-display text-[8rem] md:text-[12rem] lg:text-[16rem] font-bold text-cream/10 leading-none absolute -right-32 md:-right-48 lg:-right-64 -top-8">
            1.8B
          </p>
          <div className="relative z-10">
            <p className="font-sans text-sm uppercase tracking-widest text-rose-muted mb-2">
              Muslims worldwide
            </p>
            <p className="font-intimate text-lg text-cream/60">
              How many of us are building technology<br />
              <span className="italic">with intention?</span>
            </p>
          </div>
        </div>
        
      </div>
      
      {/* Decorative element - imperfect line */}
      <div className="absolute left-0 top-1/3 w-32 h-px bg-gradient-to-r from-rose/40 to-transparent" />
      <div className="absolute left-12 top-1/3 mt-8 w-16 h-px bg-gradient-to-r from-amber/30 to-transparent" />
    </section>
  );
};

export default QuestionSection;
