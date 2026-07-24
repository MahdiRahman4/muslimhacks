import { useScrollReveal, useParallax } from '@/hooks/useScrollReveal';
import IslamicPattern, { IslamicPatternAlt } from '@/components/IslamicPattern';

const VisionSection = () => {
  const [parallaxRef, parallaxOffset] = useParallax(0.15);
  const [titleRef, titleVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const [detailsRef, detailsVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });
  const [valuesRef, valuesVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section ref={parallaxRef} className="relative min-h-screen py-32 overflow-hidden">
      {/* Background gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, hsl(235 38% 16%) 0%, hsl(280 35% 18%) 50%, hsl(280 40% 22%) 100%)',
        }}
      />
      
      {/* Parallax Islamic patterns */}
      <div 
        className="absolute inset-0 text-amber"
        style={{ transform: `translateY(${parallaxOffset}px)` }}
      >
        <IslamicPattern opacity={0.06} />
      </div>
      <div 
        className="absolute inset-0 text-rose"
        style={{ transform: `translateY(${-parallaxOffset * 0.5}px)` }}
      >
        <IslamicPatternAlt opacity={0.04} />
      </div>
      
      {/* Content - full width explosion */}
      <div className="relative z-10 px-6 md:px-12 lg:px-24">
        
        {/* Main title - large, off-center */}
        <div 
          ref={titleRef}
          className={`max-w-4xl ml-auto mr-8 md:mr-16 mb-24 text-right transition-all duration-1000 ${
            titleVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'
          }`}
        >
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-cream leading-none mb-6">
            Quebec.<br />
            <span className="text-gradient-sunset">September 2026.</span>
          </h2>
          <p className="font-intimate text-xl md:text-2xl lg:text-3xl text-cream/80">
            24 hours to build something that matters.
          </p>
        </div>
        
        {/* Scattered details grid */}
        <div 
          ref={detailsRef}
          className={`grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 max-w-6xl mx-auto mb-32 transition-all duration-1000 delay-200 ${
            detailsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {/* Card 1 - overlapping style */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-full h-full border border-amber/20 rounded-lg" />
            <div className="relative bg-plum-deep/40 backdrop-blur-sm border border-cream/10 rounded-lg p-8">
              <p className="font-sans text-base uppercase tracking-widest text-amber mb-3">
                The Gathering
              </p>
              <p className="font-display text-4xl text-cream mb-2">Sincere People</p>
              <p className="font-intimate text-xl md:text-2xl text-cream/70">
                Muslim developers, designers, and dreamers
              </p>
            </div>
          </div>
          
          {/* Card 2 - offset vertically */}
          <div className="relative md:mt-16">
            <div className="absolute -top-4 -right-4 w-full h-full border border-rose/20 rounded-lg" />
            <div className="relative bg-plum-deep/40 backdrop-blur-sm border border-cream/10 rounded-lg p-8">
              <p className="font-sans text-base uppercase tracking-widest text-rose mb-3">
                The Challenge
              </p>
              <p className="font-display text-4xl text-cream mb-2">Real Impact</p>
              <p className="font-intimate text-xl md:text-2xl text-cream/70">
                Projects that serve communities in need
              </p>
            </div>
          </div>
          
          {/* Card 3 */}
          <div className="relative md:-mt-8">
            <div className="absolute -bottom-4 -left-4 w-full h-full border border-plum-light/30 rounded-lg" />
            <div className="relative bg-plum-deep/40 backdrop-blur-sm border border-cream/10 rounded-lg p-8">
              <p className="font-sans text-base uppercase tracking-widest text-amber-light mb-3">
                The Barakah
              </p>
              <p className="font-display text-4xl text-cream mb-2">Sadaqah Jariyah</p>
              <p className="font-intimate text-xl md:text-2xl text-cream/70">
                Ongoing charity through technology
              </p>
            </div>
          </div>
        </div>
        
        {/* Values - scattered text */}
        <div 
          ref={valuesRef}
          className={`relative max-w-5xl mx-auto transition-all duration-1000 delay-400 ${
            valuesVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-center">
            <span className="font-arabic text-3xl text-amber/80">نية</span>
            <span className="font-display text-2xl md:text-3xl text-cream/50">niyyah</span>
            <span className="font-arabic text-3xl text-rose/70">أمة</span>
            <span className="font-display text-2xl md:text-3xl text-cream/50">ummah</span>
            <span className="font-arabic text-3xl text-amber-light/80">إخلاص</span>
            <span className="font-display text-2xl md:text-3xl text-cream/50">sincerity</span>
            <span className="font-arabic text-3xl text-rose-muted/80">خدمة</span>
            <span className="font-display text-2xl md:text-3xl text-cream/50">service</span>
            <span className="font-arabic text-3xl text-amber/70">بركة</span>
            <span className="font-display text-2xl md:text-3xl text-cream/50">barakah</span>
          </div>
        </div>
        
      </div>
      
      {/* Decorative elements bleeding off edges */}
      <div className="absolute -right-24 top-1/4 w-48 h-48 border border-amber/10 rounded-full animate-pulse-glow" />
      <div className="absolute -left-16 bottom-1/4 w-32 h-32 border border-rose/10 rounded-full animate-pulse-glow" style={{ animationDelay: '2s' }} />
    </section>
  );
};

export default VisionSection;
