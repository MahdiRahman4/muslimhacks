import { useScrollReveal } from '@/hooks/useScrollReveal';

const SponsorsSection = () => {
  const [headerRef, headerVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const [contentRef, contentVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const [ctaRef, ctaVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section id="sponsors" className="relative min-h-screen py-32 overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, hsl(280 40% 22%) 0%, hsl(235 40% 18%) 100%)',
        }}
      />
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        
        {/* Header - off center */}
        <div 
          ref={headerRef}
          className={`max-w-2xl ml-0 md:ml-auto md:mr-16 mb-24 text-left md:text-right transition-all duration-1000 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <p className="font-sans text-sm uppercase tracking-[0.3em] text-rose mb-4">
            Partners in purpose
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-cream leading-tight mb-6">
            Those who believe in<br />
            <span className="text-gradient-sunset">building with barakah</span>
          </h2>
          <p className="font-intimate text-xl md:text-2xl text-cream/70">
            Our sponsors don't just fund a hackathon—they invest in 
            <em className="text-amber-light"> sadaqah jariyah</em>, ongoing charity 
            through technology that serves communities for years to come.
          </p>
        </div>
        
        {/* Sponsor tiers */}
        <div 
          ref={contentRef}
          className={`space-y-16 mb-24 transition-all duration-1000 delay-200 ${
            contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {/* Lead partner */}
          <div className="text-center">
            <p className="font-sans text-sm uppercase tracking-widest text-amber mb-6">
              Lead Partner
            </p>
            <div className="inline-block bg-cream/5 border border-cream/10 rounded-xl px-16 py-12">
              <p className="font-display text-3xl md:text-4xl text-cream">
                Islamic Relief Canada
              </p>
              <p className="font-intimate text-lg text-cream/60 mt-2">
                Serving humanity since 1984
              </p>
            </div>
          </div>
          
          {/* Coming soon overlay for other tiers */}
          <div className="relative">
            {/* Blurred placeholder content */}
            <div className="blur-sm opacity-40 pointer-events-none">
              <div className="mb-12">
                <p className="font-sans text-xs uppercase tracking-widest text-rose/60 mb-6 text-center">
                  Platinum Sponsors
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className="bg-cream/5 border border-dashed border-cream/20 rounded-lg p-8 text-center"
                    >
                      <p className="font-intimate text-cream/40 text-lg">
                        Sponsor
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="font-sans text-xs uppercase tracking-widest text-twilight-soft mb-6 text-center">
                  Gold Sponsors
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className="bg-cream/5 border border-dashed border-cream/15 rounded-lg p-6 text-center"
                    >
                      <p className="font-intimate text-cream/30 text-sm">
                        Sponsor
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Overlay text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="font-display text-2xl md:text-3xl text-cream mb-2">
                  Coming soon
                </p>
                <p className="font-intimate text-lg text-cream/60">
                  We're working on it!
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div 
          ref={ctaRef}
          className={`max-w-lg mx-auto text-center transition-all duration-1000 delay-400 ${
            ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <p className="font-intimate text-xl text-cream/70 mb-6">
            Interested in partnering with us?
          </p>
          <a 
            href="mailto:sponsors@muslimhacks.ca" 
            className="inline-block font-sans text-sm uppercase tracking-wider text-amber border border-amber/50 rounded-full px-8 py-3 hover:bg-amber/10 transition-all duration-300"
          >
            Become a Sponsor
          </a>
          <p className="font-sans text-xs text-cream/40 mt-4">
            sponsors@muslimhacks.ca
          </p>
        </div>
        
      </div>
      
      {/* Decorative */}
      <div className="absolute left-0 top-1/2 w-24 h-px bg-gradient-to-r from-amber/30 to-transparent" />
      <div className="absolute right-0 bottom-1/3 w-32 h-px bg-gradient-to-l from-rose/30 to-transparent" />
    </section>
  );
};

export default SponsorsSection;
