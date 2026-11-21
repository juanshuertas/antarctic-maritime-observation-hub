import { Wifi, ShieldCheck } from 'lucide-react';
import { INITIAL_PASSPORT_PROFILE } from '../passport-data';

interface SmartCardVisualProps {
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export const SmartCardVisual: React.FC<SmartCardVisualProps> = ({
  className = '',
  onClick,
  interactive = false,
}) => {
  const profile = INITIAL_PASSPORT_PROFILE;

  return (
    <div
      onClick={onClick}
      className={`relative aspect-[1.586/1] w-full max-w-[380px] rounded-2xl p-5 sm:p-6 flex flex-col justify-between select-none overflow-hidden border border-[#214358] shadow-[0_20px_45px_rgba(0,0,0,0.6),_inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all duration-300 ${
        interactive ? 'cursor-pointer hover:-translate-y-1 hover:border-[#35c3c8]/60 hover:shadow-[0_25px_55px_rgba(0,0,0,0.7)]' : ''
      } ${className}`}
      style={{
        backgroundColor: '#0a1722',
        backgroundImage: `
          radial-gradient(circle at 80% 20%, rgba(53, 195, 200, 0.08) 0%, transparent 50%),
          linear-gradient(135deg, #0e202e 0%, #091520 60%, #050d15 100%)
        `,
      }}
    >
      {/* Subtle Guilloché Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg viewBox="0 0 400 250" className="w-full h-full">
          <circle cx="200" cy="125" r="160" fill="none" stroke="#35c3c8" strokeWidth="0.5" strokeDasharray="3 4" />
          <circle cx="200" cy="125" r="110" fill="none" stroke="#72e0b5" strokeWidth="0.5" />
          <line x1="0" y1="125" x2="400" y2="125" stroke="#35c3c8" strokeWidth="0.4" strokeDasharray="2 4" />
        </svg>
      </div>

      {/* Top Header Row */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#0b2638] border border-[#35c3c8]/40 flex items-center justify-center p-1">
            <img src="/brand/amoh-logo.png" alt="AMOH" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-[0.25em] text-[#35c3c8] font-bold uppercase">
              AMOH ID
            </div>
            <div className="text-[8px] font-mono tracking-wider text-[#8faab5] uppercase">
              Scientific Participation Card
            </div>
          </div>
        </div>

        {/* NFC Wave Symbol */}
        <div className="flex items-center gap-1.5 text-[#8faab5]">
          <span className="text-[9px] font-mono tracking-widest text-[#72e0b5]">ISO 7816</span>
          <Wifi className="w-4 h-4 text-[#35c3c8] rotate-90" />
        </div>
      </div>

      {/* Middle Row: Gold Chip & Antarctica Watermark */}
      <div className="relative z-10 flex items-center justify-between my-2">
        {/* ISO 7816 Gold Microcontroller Contact Chip */}
        <div className="relative w-12 h-10 rounded-md p-[1.5px] bg-gradient-to-br from-[#ffd700] via-[#c69a30] to-[#805e19] shadow-[0_2px_8px_rgba(0,0,0,0.5)] border border-[#e5c158]/60">
          <svg viewBox="0 0 48 38" className="w-full h-full rounded-[4px] overflow-hidden" fill="none">
            <defs>
              <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fae792" />
                <stop offset="35%" stopColor="#d4af37" />
                <stop offset="70%" stopColor="#b38722" />
                <stop offset="100%" stopColor="#6e5012" />
              </linearGradient>
            </defs>
            <rect width="48" height="38" fill="url(#gold-grad)" />
            {/* Standard 8-pad ISO 7816 contact etching */}
            <path
              d="M0,13 L18,13 A4,4 0 0,0 22,17 L22,21 A4,4 0 0,0 18,25 L0,25 M48,13 L30,13 A4,4 0 0,1 26,17 L26,21 A4,4 0 0,1 30,25 L48,25 M24,0 L24,13 M24,25 L24,38"
              stroke="#594212"
              strokeWidth="1.2"
              opacity="0.85"
            />
          </svg>
        </div>

        {/* Small Circular Antarctica Vector Graphic */}
        <div className="w-12 h-12 rounded-full border border-[#35c3c8]/30 bg-[#091d2c]/60 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-8 h-8">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#35c3c8" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
            <path
              d="M 46 34 C 42 28, 38 22, 35 26 C 33 29, 35 34, 32 40 C 29 46, 25 52, 28 60 C 30 65, 36 66, 41 69 C 48 74, 58 77, 67 73 C 76 69, 82 62, 80 52 C 79 46, 72 42, 69 37 C 66 32, 61 35, 55 34 Z"
              fill="none"
              stroke="#e8f0f3"
              strokeWidth="1.5"
            />
            <circle cx="50" cy="54" r="2" fill="#72e0b5" />
          </svg>
        </div>
      </div>

      {/* Bottom Row: Holder Name & Cryptographic Credential */}
      <div className="relative z-10 space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[8px] font-mono tracking-widest text-[#6c8a99] uppercase">
              Titular Acreditado
            </div>
            <div className="text-xs sm:text-sm font-mono font-bold tracking-wider text-white uppercase">
              {profile.displayName}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[8px] font-mono tracking-widest text-[#6c8a99] uppercase">
              Rol
            </div>
            <div className="text-[11px] font-mono text-[#35c3c8] font-semibold">
              {profile.role}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#1a384b] text-[9px] font-mono text-[#8faab5]">
          <span className="flex items-center gap-1 text-[#72e0b5]">
            <ShieldCheck className="w-3 h-3" />
            ED25519 VERIFICABLE
          </span>
          <span className="text-[#6c8a99]">{profile.credentialId}</span>
        </div>
      </div>
    </div>
  );
};

export default SmartCardVisual;
