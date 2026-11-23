import React from 'react';

interface SecurityGuillocheProps {
  className?: string;
  opacity?: number;
  variant?: 'light' | 'dark';
}

/**
 * SecurityGuilloche: Original SVG security-paper curves,
 * bathymetric contours, and polar stereographic latitude rings.
 */
export const SecurityGuilloche: React.FC<SecurityGuillocheProps> = ({
  className = '',
  opacity = 0.12,
  variant = 'light',
}) => {
  const strokeColor = variant === 'light' ? '#315f78' : '#35c3c8';

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="guilloche-grid"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 40 M 0 0 L 40 40"
            fill="none"
            stroke={strokeColor}
            strokeWidth="0.3"
            strokeDasharray="1 3"
          />
        </pattern>
      </defs>

      {/* Background fine grid */}
      <rect width="100%" height="100%" fill="url(#guilloche-grid)" opacity="0.4" />

      {/* Concentric Polar Latitude Rings (60°S, 66°33'S, 70°S, 75°S, 80°S) */}
      <g transform="translate(400, 300)" stroke={strokeColor} fill="none">
        <circle r="420" strokeWidth="0.5" strokeDasharray="3 6" />
        <circle r="360" strokeWidth="0.75" />
        <circle r="300" strokeWidth="0.5" strokeDasharray="6 3" />
        <circle r="240" strokeWidth="0.75" />
        <circle r="180" strokeWidth="1" strokeDasharray="2 4" />
        <circle r="120" strokeWidth="0.5" />
        <circle r="60" strokeWidth="0.5" strokeDasharray="1 3" />
        <circle r="8" strokeWidth="1" />

        {/* Polar stereographic azimuth lines */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <line
            key={deg}
            x1="0"
            y1="0"
            x2="450"
            y2="0"
            transform={`rotate(${deg})`}
            strokeWidth="0.4"
            strokeDasharray="2 6"
          />
        ))}

        {/* Sine wave guilloché rosettes */}
        <path
          d="M 220 0 
             C 240 60, 180 120, 220 180 
             C 260 240, 200 300, 160 360 
             C 120 420, 60 380, 0 420"
          strokeWidth="0.6"
          opacity="0.6"
        />
        <path
          d="M -220 0 
             C -240 -60, -180 -120, -220 -180 
             C -260 -240, -200 -300, -160 -360 
             C -120 -420, -60 -380, 0 -420"
          strokeWidth="0.6"
          opacity="0.6"
        />

        {/* Harmonic wave curves (ocean bathymetry simulation) */}
        {[-80, -40, 0, 40, 80].map((offset) => (
          <path
            key={offset}
            d={`M -380 ${offset} Q -190 ${offset + 25} 0 ${offset} T 380 ${offset}`}
            strokeWidth="0.4"
            opacity="0.5"
          />
        ))}
      </g>
    </svg>
  );
};

export default SecurityGuilloche;
