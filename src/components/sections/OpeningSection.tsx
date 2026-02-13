import { useState } from 'react';
import FloatingParticles from '@/components/FloatingParticles';
import GoldenCoin from '@/components/GoldenCoin';
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
    
    try {
      // Call your backend API endpoint
      const response = await fetch('http://localhost:5001/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show error in toast (same place as success message)
        toast.error(data.error || 'Failed to subscribe');
        setIsSubmitting(false);
        return;
      }

      setEmail('');
      toast.success('Jazakallah khair! We\'ll be in touch soon. Check your inbox for an email if you dont see it, check your spam folder.');
      setIsSubmitting(false);
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Gradient background - darker for better contrast */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, hsl(35 75% 45%) 0%, hsl(350 50% 45%) 40%, hsl(280 45% 25%) 100%)',
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
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 30% 40%, hsl(40 90% 70% / 0.3) 0%, transparent 60%)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-24 py-32">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Left side - Text content */}
          <div className="flex-1 max-w-2xl">
            {/* Eyebrow */}
            <div className="mb-6 animate-fade-in-up">
              <p className="font-sans text-base md:text-lg uppercase tracking-[0.3em] text-cream mb-4">
                Québec's Largest Muslim Charity Hackathon
              </p>
            </div>
            
            {/* Main branding - large and bold */}
            <div className="mb-8 animate-fade-in-up">
              <h1 className="font-display text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-cream leading-[0.85] tracking-tight">
                Muslim
                <span className="block text-gradient-sunset">Hacks</span>
              </h1>
            </div>
            
            {/* Tagline */}
            <div className="mb-12 animate-fade-in-up animation-delay-200">
              <p className="font-intimate text-2xl md:text-3xl lg:text-4xl text-cream max-w-xl">
                36 hours to build technology with purpose.
              </p>
              <p className="font-intimate text-xl md:text-2xl text-amber mt-3">
                September 2026, Concordia University, Downtown Campus, Montreal, Quebec
              </p>
            </div>

            {/* Email signup */}
            <div className="max-w-md animate-fade-in-up animation-delay-400">
              <p className="font-sans text-lg md:text-xl text-cream mb-4">
                Be the first to know when registration opens
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-cream/10 border-cream/30 text-cream placeholder:text-cream/50 focus:border-amber/50 focus:ring-amber/30 h-12 text-base"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-amber to-rose hover:from-amber-glow hover:to-rose text-plum-deep font-semibold px-8 h-12 text-base transition-all duration-300"
                >
                  {isSubmitting ? 'Sending...' : 'Notify me'}
                </Button>
              </form>
            </div>
          </div>
          
          {/* Right side - 3D Golden Coin */}
          <div className="flex-1 w-full lg:w-auto animate-fade-in-up animation-delay-400">
            <GoldenCoin className="w-full h-[300px] md:h-[400px] lg:h-[500px]" />
          </div>
        </div>
        
        {/* Arabic decorative text */}
        <div className="hidden md:block absolute right-12 lg:right-32 bottom-32 text-right">
          <p className="font-arabic text-5xl lg:text-6xl text-cream/20" dir="rtl">
            بسم الله
          </p>
        </div>
      </div>
    </section>
  );
};

export default OpeningSection;