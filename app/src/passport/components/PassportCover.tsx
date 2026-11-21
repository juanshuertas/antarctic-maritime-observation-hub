import React from 'react';
import { Compass } from 'lucide-react';
import { INITIAL_PASSPORT_PROFILE } from '../passport-data';

interface PassportCoverProps {
  className?: string;
  onClick?: () => void;
  isOpen?: boolean;
}

export const PassportCover: React.FC<PassportCoverProps> = ({
  className = '',
  onClick,
  isOpen = false,
}) => {
  const profile = INITIAL_PASSPORT_PROFILE;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label="Abrir pasaporte científico de Juan Sebastian Huertas Olea"
      className={`group relative cursor-pointer select-none transition-transform duration-500 ease-out focus:outline-none focus:ring-2 focus:ring-[#35c3c8] ${className}`}
      style={{
        perspective: '1200px',
      }}
    >
      {/* 3D Physical Booklet Cover */}
      <div
        className={`relative w-full max-w-[340px] sm:max-w-[380px] aspect-[1/1.42] rounded-r-2xl rounded-l-md p-6 sm:p-8 flex flex-col justify-between text-center transition-all duration-500 ease-out shadow-[0_20px_50px_rgba(4,14,24,0.7),_inset_0_1px_2px_rgba(255,255,255,0.15)] border-t border-r border-b border-[#1b3d54] ${
          isOpen ? 'rotate-y-[-180deg] opacity-0 pointer-events-none' : 'hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(0,0,0,0.8)]'
        }`}
        style={{
          backgroundColor: '#0c2233',
          backgroundImage: `
            radial-gradient(circle at 50% 20%, rgba(20, 60, 85, 0.5) 0%, transparent 70%),
            linear-gradient(135deg, #0b2638 0%, #081d2c 50%, #051420 100%)
          `,
        }}
      >
        {/* Subtle physical book spine ridge highlight on left edge */}
        <div className="absolute top-0 bottom-0 left-0 w-3.5 bg-gradient-to-r from-black/40 via-white/5 to-transparent rounded-l-md pointer-events-none" />
        <div className="absolute top-0 bottom-0 left-3.5 w-px bg-white/10 pointer-events-none" />

        {/* Embossed gold/silver outer border frame */}
        <div className="absolute inset-3 sm:inset-4 rounded-r-xl rounded-l-sm border border-[#315f78]/50 pointer-events-none">
          <div className="absolute inset-1 rounded-r-lg rounded-l-xs border border-[#315f78]/25" />
        </div>

        {/* Top Header Foil Stamping */}
        <div className="relative z-10 pt-2 space-y-1.5">
          <div className="text-[10px] sm:text-[11px] tracking-[0.35em] text-[#8faab5] font-mono font-medium uppercase">
            World Oceans Living Observatory
          </div>
          <div className="text-xl sm:text-2xl font-serif tracking-[0.25em] text-[#e8f0f3] font-bold uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Antarctic
          </div>
          <div className="text-xs sm:text-sm font-serif tracking-[0.3em] text-[#cbd9df] uppercase">
            Scientific Passport
          </div>
          <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-[#35c3c8]/60 to-transparent my-2" />
        </div>

        {/* Center Fine-Line Engraving Polar Emblem */}
        <div className="relative z-10 my-auto py-2 flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
            {/* Fine-line Polar Stereographic Geometry */}
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer compass rim */}
              <circle cx="100" cy="100" r="92" fill="none" stroke="#557d91" strokeWidth="0.75" strokeDasharray="2 3" />
              <circle cx="100" cy="100" r="84" fill="none" stroke="#8faab5" strokeWidth="1" />
              <circle cx="100" cy="100" r="66" fill="none" stroke="#557d91" strokeWidth="0.5" strokeDasharray="3 3" />
              <circle cx="100" cy="100" r="46" fill="none" stroke="#35c3c8" strokeWidth="0.75" />
              <circle cx="100" cy="100" r="24" fill="none" stroke="#557d91" strokeWidth="0.5" strokeDasharray="1 2" />

              {/* Azimuth lines */}
              <line x1="100" y1="12" x2="100" y2="188" stroke="#557d91" strokeWidth="0.5" strokeDasharray="2 4" />
              <line x1="12" y1="100" x2="188" y2="100" stroke="#557d91" strokeWidth="0.5" strokeDasharray="2 4" />

              {/* Antarctica Engraving Contour */}
              <path
                d="M 92 68 
                   C 84 56, 76 44, 70 52
                   C 66 58, 70 68, 64 80
                   C 58 92, 50 104, 56 120
                   C 60 130, 72 132, 82 138
                   C 96 148, 116 154, 134 146
                   C 152 138, 164 124, 160 104
                   C 158 92, 144 84, 138 74
                   C 132 64, 122 70, 110 68
                   Z"
                fill="none"
                stroke="#d4e4ea"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />

              {/* Fine internal shading lines */}
              <path d="M 80 85 L 120 85" stroke="#8faab5" strokeWidth="0.4" strokeDasharray="1 2" />
              <path d="M 75 95 L 135 95" stroke="#8faab5" strokeWidth="0.4" strokeDasharray="1 2" />
              <path d="M 72 105 L 140 105" stroke="#8faab5" strokeWidth="0.4" strokeDasharray="1 2" />
              <path d="M 80 115 L 130 115" stroke="#8faab5" strokeWidth="0.4" strokeDasharray="1 2" />

              {/* South Pole Axis Ticks */}
              <circle cx="100" cy="108" r="2" fill="#35c3c8" />
            </svg>
          </div>
          <span className="mt-1 text-[9px] font-mono tracking-[0.25em] text-[#8faab5] uppercase">
            SCAR #1820 · CCAMLR
          </span>
        </div>

        {/* Bottom Details & Holder Verification */}
        <div className="relative z-10 space-y-2 pt-2 border-t border-[#1d3c4e]/50">
          <div>
            <div className="text-[9px] font-mono tracking-widest text-[#6c8a99] uppercase">
              Titular del Pasaporte
            </div>
            <div className="text-xs sm:text-sm font-mono font-bold tracking-wider text-[#e8f0f3] uppercase">
              {profile.displayName}
            </div>
            <div className="text-[10px] font-mono text-[#35c3c8]">
              {profile.role}
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-[#6c8a99] pt-1">
            <span>{profile.credentialId}</span>
            <span className="text-[#72e0b5]">{profile.status}</span>
          </div>

          <div className="text-[8px] font-mono text-[#557d91] italic pt-1">
            {profile.disclaimerEs}
          </div>
        </div>

        {/* Hover Cue */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity rounded-r-2xl rounded-l-md pointer-events-none">
          <div className="px-4 py-2 rounded-xl bg-[#091824]/90 border border-[#35c3c8] text-[#35c3c8] text-xs font-mono font-bold tracking-wider shadow-lg flex items-center gap-2">
            <span>ABRIR PASAPORTE</span>
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassportCover;
