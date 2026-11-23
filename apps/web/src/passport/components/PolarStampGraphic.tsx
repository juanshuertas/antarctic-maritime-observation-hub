import React from 'react';
import type { Stamp } from '../passport-data';

interface PolarStampGraphicProps {
  stamp: Stamp;
  size?: number;
  className?: string;
  showCancellationWaves?: boolean;
}

/**
 * PolarStampGraphic — Authentic Numismatic & Expedition Cachet Engine
 * Renders high-precision Antarctic Treaty station stamps with circular guilloché,
 * arched text, official category icons, coordinates, and postal cancellation waves.
 */
export const PolarStampGraphic: React.FC<PolarStampGraphicProps> = ({
  stamp,
  size = 180,
  className = '',
  showCancellationWaves = true,
}) => {
  const stampColor = stamp.color || '#214b63';
  const stampId = stamp.id || 'polar-stamp';
  const circlePathId = `circle-path-${stampId}`;

  // Dedicated vector category icon
  const renderCategoryIcon = () => {
    switch (stamp.category) {
      case 'ICE':
        return (
          <g stroke={stampColor} fill="none" strokeWidth="1.4" strokeLinejoin="round">
            {/* Tabular Iceberg with underwater keel */}
            <path d="M-18,2 L-10,-8 L2,-5 L10,-10 L18,2 Z" fill={`${stampColor}20`} />
            <line x1="-22" y1="2" x2="22" y2="2" strokeWidth="1.6" strokeDasharray="3 2" />
            <path d="M-14,2 L-8,12 L4,15 L14,2" opacity="0.6" strokeDasharray="2 2" />
          </g>
        );
      case 'OCEAN':
        return (
          <g stroke={stampColor} fill="none" strokeWidth="1.3" strokeLinecap="round">
            {/* Circumpolar waves & drift vector */}
            <path d="M-18,-4 C-12,-9 -6,1 0,-4 C6,-9 12,1 18,-4" />
            <path d="M-18,4 C-12,-1 -6,9 0,4 C6,-1 12,9 18,4" />
            <circle cx="0" cy="0" r="1.5" fill={stampColor} />
          </g>
        );
      case 'WILDLIFE':
        return (
          <g stroke={stampColor} fill={stampColor} opacity="0.9">
            {/* Penguin / Polar fauna crest */}
            <path d="M-4,-10 C-3,-13 3,-13 4,-10 C5,-6 6,2 4,9 C2,12 -2,12 -4,9 C-6,2 -5,-6 -4,-10 Z" fill="none" strokeWidth="1.4" />
            <circle cx="0" cy="-7" r="1.5" />
            <path d="M-3,10 L-6,14 M3,10 L6,14" strokeWidth="1.4" strokeLinecap="round" />
          </g>
        );
      case 'EXPEDITION':
        return (
          <g stroke={stampColor} fill="none" strokeWidth="1.3">
            {/* 8-point exploration compass star */}
            <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill={`${stampColor}25`} />
            <circle cx="0" cy="0" r="2.5" fill={stampColor} />
          </g>
        );
      case 'FIELD':
        return (
          <g stroke={stampColor} fill="none" strokeWidth="1.3">
            {/* Scientific observation theodolite & geodetic prism */}
            <polygon points="0,-12 11,8 -11,8" strokeWidth="1.4" fill={`${stampColor}15`} />
            <circle cx="0" cy="-2" r="3.5" />
            <line x1="0" y1="-12" x2="0" y2="8" strokeDasharray="1.5 2" />
          </g>
        );
      default: // PLACE / BASE
        return (
          <g stroke={stampColor} fill="none" strokeWidth="1.4">
            {/* Polar stereographic boundary circle */}
            <circle cx="0" cy="0" r="10" strokeDasharray="3 2" />
            <circle cx="0" cy="0" r="3" fill={stampColor} />
            <line x1="-14" y1="0" x2="14" y2="0" strokeWidth="1" />
            <line x1="0" y1="-14" x2="0" y2="14" strokeWidth="1" />
          </g>
        );
    }
  };

  const formattedDate = new Date(stamp.stampedAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="-110 -110 220 220"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
        style={{ color: stampColor }}
      >
        <defs>
          {/* Circular Text Path (Radius 82) */}
          <path
            id={circlePathId}
            d="M 0 -82 A 82 82 0 1 1 -0.01 -82"
            fill="none"
          />
          {/* Subtle Ink Bleed Filter */}
          <filter id={`ink-rough-${stampId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        <g filter={`url(#ink-rough-${stampId})`}>
          {/* Outer Heavy Circular Frame */}
          <circle cx="0" cy="0" r="98" fill="none" stroke={stampColor} strokeWidth="3" strokeDasharray="28 2 12 2" />
          <circle cx="0" cy="0" r="92" fill="none" stroke={stampColor} strokeWidth="1.2" />

          {/* Inner Seal Ring */}
          <circle cx="0" cy="0" r="68" fill="none" stroke={stampColor} strokeWidth="1.6" strokeDasharray="4 2" />
          <circle cx="0" cy="0" r="64" fill="none" stroke={stampColor} strokeWidth="0.8" />

          {/* Arched Micro-Typography around circumference */}
          <text fill={stampColor} fontSize="7.5" fontFamily="'JetBrains Mono', monospace" fontWeight="700" letterSpacing="0.22em">
            <textPath href={`#${circlePathId}`} startOffset="50%" textAnchor="middle">
              TRATADO ANTÁRTICO · ART. VII · VERIFICADO
            </textPath>
          </text>

          {/* Center Graphic Crest */}
          <g transform="translate(0, -18)">
            {renderCategoryIcon()}
          </g>

          {/* Station Flag & Short Name */}
          <text
            x="0"
            y="6"
            fill={stampColor}
            fontSize="10"
            fontFamily="'Poppins', sans-serif"
            fontWeight="800"
            textAnchor="middle"
            letterSpacing="0.05em"
          >
            {stamp.code}
          </text>

          <text
            x="0"
            y="22"
            fill={stampColor}
            fontSize="9"
            fontFamily="'DM Serif Display', Georgia, serif"
            fontStyle="italic"
            fontWeight="600"
            textAnchor="middle"
          >
            {stamp.stationName.replace('Base ', '').replace(' Research Station', '').slice(0, 22)}
          </text>

          {/* Date & Coordinates Capsule */}
          <g transform="translate(0, 36)">
            <rect
              x="-48"
              y="-8"
              width="96"
              height="16"
              rx="4"
              fill="none"
              stroke={stampColor}
              strokeWidth="1.2"
              strokeDasharray="2 1.5"
            />
            <text
              x="0"
              y="3.5"
              fill={stampColor}
              fontSize="8"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="700"
              textAnchor="middle"
              letterSpacing="0.1em"
            >
              {formattedDate}
            </text>
          </g>

          <text
            x="0"
            y="54"
            fill={stampColor}
            fontSize="7"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="500"
            textAnchor="middle"
            opacity="0.85"
            letterSpacing="0.08em"
          >
            {Math.abs(stamp.lat).toFixed(2)}°S · {Math.abs(stamp.lng).toFixed(2)}°W
          </text>
        </g>

        {/* Optional Authentic Maritime Postal Wavy Cancellation Marks */}
        {showCancellationWaves && (
          <g transform="translate(105, -30)" stroke={stampColor} fill="none" strokeWidth="1.4" opacity="0.75">
            <path d="M0,0 C10,-6 20,6 30,0 C40,-6 50,6 60,0" />
            <path d="M0,12 C10,6 20,18 30,12 C40,6 50,18 60,12" />
            <path d="M0,24 C10,18 20,30 30,24 C40,18 50,30 60,24" />
            <path d="M0,36 C10,30 20,42 30,36 C40,30 50,42 60,36" />
            <text
              x="30"
              y="52"
              fill={stampColor}
              fontSize="6.5"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="700"
              letterSpacing="0.15em"
              textAnchor="middle"
            >
              AMOH OBS
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default PolarStampGraphic;
