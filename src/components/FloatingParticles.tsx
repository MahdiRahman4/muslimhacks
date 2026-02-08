import { useEffect, useState, useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

interface FloatingParticlesProps {
  count?: number;
  color?: string;
  minSize?: number;
  maxSize?: number;
  className?: string;
}

const FloatingParticles = ({
  count = 30,
  color = 'hsl(var(--amber-light))',
  minSize = 2,
  maxSize = 6,
  className = '',
}: FloatingParticlesProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (maxSize - minSize) + minSize,
      opacity: Math.random() * 0.5 + 0.2,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 10,
    }));
  }, [count, minSize, maxSize]);

  if (!mounted) return null;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-drift"
          style={{
            left: `${particle.x}%`,
            top: `-${particle.size}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: color,
            opacity: particle.opacity,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
