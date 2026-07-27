import { Bounce, ToastOptions } from "react-toastify";

// Shared brand tokens, primitives, and layout components used across all pages.
export const BRAND = {
  gold: "#DDA853",
  goldSoft: "#E7C078",
  goldDeep: "#B9863A",
  purple: "#4B2E63",
  purpleLight: "#9B7CB0",
  purpleDeep: "#341F47",
  navy: "#0C1F3F",
  navyDeep: "#060F20",
  cream: "#F5EEE3",
  creamMuted: "#D9CFC0",
  sand: "#C9BBA8",
};

export function StarPattern({ opacity = 0.06 }: { opacity?: number }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={`islamic-star-${Math.round(opacity * 1000)}`}
          x="0"
          y="0"
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          <polygon
            points="40,8 47,30 70,30 52,44 58,67 40,53 22,67 28,44 10,30 33,30"
            fill="none"
            stroke={BRAND.gold}
            strokeWidth="0.8"
            opacity={opacity}
          />
          <polygon
            points="40,14 45,32 63,32 49,42 54,60 40,50 26,60 31,42 17,32 35,32"
            fill={BRAND.gold}
            opacity={opacity * 0.4}
          />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill={`url(#islamic-star-${Math.round(opacity * 1000)})`}
      />
    </svg>
  );
}

export function GoldText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        background: `linear-gradient(135deg, ${BRAND.goldSoft} 0%, ${BRAND.gold} 55%, ${BRAND.goldDeep} 100%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
  );
}

export function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`font-sans text-xs uppercase tracking-[0.3em] font-medium ${className}`}
      style={{ color: BRAND.gold }}
    >
      {children}
    </p>
  );
}

export const GLOBAL_CSS = `
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    :focus-visible { outline: 2px solid #DDA853; outline-offset: 2px; }
    .scrollbar-none::-webkit-scrollbar { display: none; }
    .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .animate-marquee { animation: marquee 90s linear infinite; }
    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }
  `;

