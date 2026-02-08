import { useEffect, useState } from 'react';
import FloatingParticles from '@/components/FloatingParticles';

const OpeningSection = () => {
  const [showArabic, setShowArabic] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [showSource, setShowSource] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowArabic(true), 500),
      setTimeout(() => setShowEnglish(true), 2000),
      setTimeout(() => setShowSource(true), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, hsl(35 85% 55% / 0.9) 0%, hsl(350 45% 55% / 0.85) 40%, hsl(280 40% 30% / 0.95) 100%)',
        }}
      />
      
      {/* Floating particles */}
      <FloatingParticles 
        count={40} 
        color="hsl(40 90% 85% / 0.6)" 
        minSize={2} 
        maxSize={5}
      />
      
      {/* Subtle radial glow */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse at 30% 40%, hsl(40 90% 70% / 0.4) 0%, transparent 60%)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Arabic Hadith */}
        <div 
          className={`transition-all duration-1000 ease-out ${
            showArabic 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <p 
            className="font-arabic text-4xl md:text-5xl lg:text-6xl text-cream leading-relaxed mb-8"
            dir="rtl"
            lang="ar"
          >
            والصَّدَقَةُ تُطْفِئُ الْخَطِيئَةَ كَمَا يُطْفِئُ الْمَاءُ النَّارَ
          </p>
        </div>
        
        {/* English Translation */}
        <div 
          className={`transition-all duration-1000 ease-out delay-300 ${
            showEnglish 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="font-display text-xl md:text-2xl lg:text-3xl text-cream/90 leading-relaxed mb-12 max-w-3xl mx-auto">
            "And charity extinguishes sins just as water extinguishes fire."
          </p>
        </div>
        
        {/* Source Attribution */}
        <div 
          className={`transition-all duration-700 ease-out ${
            showSource 
              ? 'opacity-100' 
              : 'opacity-0'
          }`}
        >
          <p className="font-intimate text-base md:text-lg text-cream/60">
            — Jami` at-Tirmidhi 614
          </p>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-cream/30 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-cream/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default OpeningSection;
