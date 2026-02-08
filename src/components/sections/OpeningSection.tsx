import { useState } from 'react';
import FloatingParticles from '@/components/FloatingParticles';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const OpeningSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setEmail('');
    toast.success('Jazakallah khair! We\'ll be in touch soon.');
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
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
      
      {/* Content - asymmetric layout */}
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-24 py-32">
        <div className="max-w-6xl">
          {/* Main branding - large, stylistic, asymmetric */}
          <div className="mb-8 animate-fade-in-left">
            <p className="font-sans text-sm md:text-base uppercase tracking-[0.4em] text-cream/70 mb-4">
              Québec's Largest Muslim Charity Hackathon
            </p>
          </div>
          
          <div className="mb-6 animate-fade-in-up">
            <h1 className="font-display text-7xl md:text-8xl lg:text-[10rem] xl:text-[12rem] text-cream leading-[0.85] tracking-tight">
              Muslim
              <span className="block text-gradient-sunset">Hacks</span>
            </h1>
          </div>
          
          {/* Tagline - offset to the right */}
          <div className="ml-4 md:ml-16 lg:ml-32 mb-16 animate-fade-in-up animation-delay-200">
            <p className="font-intimate text-xl md:text-2xl lg:text-3xl text-cream/80 max-w-lg">
              36 hours to build technology with purpose.
              <span className="block mt-2 text-amber-light">September 2026.</span>
            </p>
          </div>
          
          {/* Email signup - left aligned but offset */}
          <div className="ml-0 md:ml-8 max-w-md animate-fade-in-up animation-delay-400">
            <p className="font-sans text-sm text-cream/60 mb-4">
              Be the first to know when registration opens
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-cream/10 border-cream/20 text-cream placeholder:text-cream/40 focus:border-amber/50 focus:ring-amber/30"
                required
              />
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-amber to-rose hover:from-amber-glow hover:to-rose text-plum-deep font-medium px-6 transition-all duration-300"
              >
                {isSubmitting ? 'Sending...' : 'Notify me'}
              </Button>
            </form>
          </div>
        </div>
        
        {/* Decorative elements - floating to the right */}
        <div className="hidden lg:block absolute right-24 top-1/4">
          <div className="w-64 h-64 border border-cream/10 rounded-full animate-pulse-slow" />
          <div className="absolute top-12 left-12 w-40 h-40 border border-amber/20 rounded-full animate-pulse-slow animation-delay-400" />
        </div>
        
        {/* Arabic decorative text - subtle, positioned */}
        <div className="hidden md:block absolute right-12 lg:right-32 bottom-32 text-right">
          <p className="font-arabic text-5xl lg:text-6xl text-cream/15" dir="rtl">
            بسم الله
          </p>
        </div>
      </div>
    </section>
  );
};

export default OpeningSection;
