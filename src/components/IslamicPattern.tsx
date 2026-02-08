interface IslamicPatternProps {
  className?: string;
  opacity?: number;
  color?: string;
}

const IslamicPattern = ({ 
  className = '', 
  opacity = 0.1,
  color = 'currentColor' 
}: IslamicPatternProps) => {
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity }}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="islamic-geometric"
          x="0"
          y="0"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          {/* Eight-pointed star (Rub el Hizb inspired) */}
          <g fill="none" stroke={color} strokeWidth="0.3">
            {/* Central octagon */}
            <polygon points="10,2 14,6 18,6 18,10 14,14 10,18 6,14 2,10 2,6 6,6" />
            
            {/* Cross elements */}
            <line x1="10" y1="0" x2="10" y2="4" />
            <line x1="10" y1="16" x2="10" y2="20" />
            <line x1="0" y1="10" x2="4" y2="10" />
            <line x1="16" y1="10" x2="20" y2="10" />
            
            {/* Diagonal elements */}
            <line x1="2" y1="2" x2="5" y2="5" />
            <line x1="18" y1="2" x2="15" y2="5" />
            <line x1="2" y1="18" x2="5" y2="15" />
            <line x1="18" y1="18" x2="15" y2="15" />
            
            {/* Inner star */}
            <polygon points="10,5 12,8 15,8 13,10 14,13 10,11 6,13 7,10 5,8 8,8" />
          </g>
        </pattern>
        
        <pattern
          id="islamic-interlace"
          x="0"
          y="0"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke={color} strokeWidth="0.4">
            {/* Interlocking hexagons */}
            <polygon points="20,5 30,10 30,20 20,25 10,20 10,10" />
            <polygon points="0,15 5,10 5,0" />
            <polygon points="40,15 35,10 35,0" />
            <polygon points="0,25 5,30 5,40" />
            <polygon points="40,25 35,30 35,40" />
            
            {/* Connecting elements */}
            <line x1="5" y1="10" x2="10" y2="10" />
            <line x1="30" y1="10" x2="35" y2="10" />
            <line x1="5" y1="30" x2="10" y2="30" />
            <line x1="30" y1="30" x2="35" y2="30" />
            
            {/* Central decorations */}
            <circle cx="20" cy="15" r="3" />
          </g>
        </pattern>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#islamic-geometric)" />
    </svg>
  );
};

export const IslamicPatternAlt = ({ 
  className = '', 
  opacity = 0.08,
  color = 'currentColor' 
}: IslamicPatternProps) => {
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity }}
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="islamic-stars"
          x="0"
          y="0"
          width="50"
          height="50"
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke={color} strokeWidth="0.5">
            {/* Six-pointed star */}
            <polygon points="25,5 30,15 40,15 33,22 36,32 25,27 14,32 17,22 10,15 20,15" />
            
            {/* Surrounding geometric frame */}
            <rect x="5" y="5" width="40" height="40" rx="2" />
            
            {/* Corner ornaments */}
            <circle cx="5" cy="5" r="2" />
            <circle cx="45" cy="5" r="2" />
            <circle cx="5" cy="45" r="2" />
            <circle cx="45" cy="45" r="2" />
            
            {/* Inner decorative ring */}
            <circle cx="25" cy="25" r="8" />
          </g>
        </pattern>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#islamic-stars)" />
    </svg>
  );
};

export default IslamicPattern;
