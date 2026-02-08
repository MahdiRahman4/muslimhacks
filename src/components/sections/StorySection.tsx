import { useScrollReveal } from '@/hooks/useScrollReveal';

const StorySection = () => {
  const [headerRef, headerVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const [bodyRef, bodyVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });
  const [closingRef, closingVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section className="relative min-h-screen py-40 overflow-hidden">
      {/* Background - deeper, quieter */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, hsl(230 35% 20%) 0%, hsl(235 38% 16%) 100%)',
        }}
      />
      
      {/* Subtle texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Content - narrow, letter-like */}
      <div className="relative z-10 max-w-lg mx-auto px-8 md:px-12">
        
        {/* Header - the story begins */}
        <div 
          ref={headerRef}
          className={`mb-20 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="font-sans text-sm uppercase tracking-[0.3em] text-rose mb-6">
            The beginning
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-cream leading-snug">
            It started as a <em className="font-intimate text-amber-light">niyyah</em>—<br />
            an intention between friends.
          </h2>
        </div>
        
        {/* Body - intimate narrative */}
        <div 
          ref={bodyRef}
          className={`space-y-8 text-cream/75 transition-all duration-700 delay-200 ${
            bodyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="font-intimate text-xl md:text-2xl leading-relaxed">
            We are Muslims in Québec. We speak French at the dépanneur 
            and English on GitHub. We fast in summers that stretch past 9pm 
            and pray fajr in winters when the sun barely rises.
          </p>
          
          <p className="font-intimate text-xl md:text-2xl leading-relaxed">
            We noticed something. The tech world celebrated building fast, 
            shipping faster, but rarely asked <em>why</em>. 
            And our ummah? Rich in talent, often building alone.
          </p>
          
          <p className="font-intimate text-xl md:text-2xl leading-relaxed">
            What if we gathered? Not for prizes. Not for clout. 
            But because the Prophet ﷺ taught us that 
            <span className="text-amber-light"> the best of people are those 
            most beneficial to others</span>.
          </p>
          
          {/* Visual break - overlapping elements */}
          <div className="relative py-12">
            <div className="absolute -left-16 top-0 w-32 h-32 border border-rose/20 rounded-full" />
            <div className="absolute -left-8 top-8 w-24 h-24 border border-amber/15 rounded-full" />
            <p className="font-arabic text-3xl text-cream/50 text-right" dir="rtl">
              خير الناس أنفعهم للناس
            </p>
          </div>
          
          <p className="font-intimate text-xl md:text-2xl leading-relaxed">
            MuslimHacks was born from this. A 36-hour hackathon where 
            our skills become service. Where every line of code 
            carries the weight of intention.
          </p>
        </div>
        
        {/* Closing - the partnership */}
        <div 
          ref={closingRef}
          className={`mt-24 pt-12 border-t border-cream/10 transition-all duration-700 delay-300 ${
            closingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="font-sans text-base text-cream/60 mb-4">
            In partnership with
          </p>
          <p className="font-display text-2xl md:text-3xl text-cream">
            Islamic Relief Canada
          </p>
          <p className="font-intimate text-lg text-cream/70 mt-2">
            One of the world's leading humanitarian organizations, 
            serving humanity regardless of race, religion, or gender.
          </p>
        </div>
        
      </div>
      
      {/* Side decorations */}
      <div className="hidden lg:block absolute right-16 top-1/4 w-px h-48 bg-gradient-to-b from-transparent via-rose/20 to-transparent" />
      <div className="hidden lg:block absolute right-24 top-1/3 w-px h-32 bg-gradient-to-b from-transparent via-amber/15 to-transparent" />
    </section>
  );
};

export default StorySection;
