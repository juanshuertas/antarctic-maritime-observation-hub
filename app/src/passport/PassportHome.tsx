import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Compass,
  CreditCard,
  QrCode,
  ChevronRight,
  MapPin,
  Stamp as StampIcon
} from 'lucide-react';
import { INITIAL_PASSPORT_PROFILE } from './passport-data';
import PassportCover from './components/PassportCover';
import PolarIdentity from './components/PolarIdentity';
import PassportBook from './PassportBook';
import PassportQRModal from './components/PassportQRModal';

export default function PassportHome() {
  const profile = INITIAL_PASSPORT_PROFILE;
  const navigate = useNavigate();

  // State to switch between closed booklet + overview vs open book view
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 pb-12 animate-fadeIn font-mono">
      {/* If user clicked "Abrir mi Pasaporte", show the full interactive two-page book spread */}
      {isBookOpen ? (
        <PassportBook onClose={() => setIsBookOpen(false)} />
      ) : (
        /* MAIN PASSPORT HOME: PHYSICAL BOOKLET (LEFT) + CLEAN DIGITAL ID OVERVIEW (RIGHT) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* =========================================================================
              LEFT COLUMN: LARGE RENDERED PHYSICAL PASSPORT BOOKLET (Cols 1–5)
             ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3 text-xs text-[#8faab5]">
              <span className="flex items-center gap-1.5 text-[#35c3c8] font-bold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>LIBRETA FÍSICA DIGITALIZADA</span>
              </span>
              <span className="text-[10px] text-[#6c8a99]">{profile.credentialId}</span>
            </div>

            {/* Clickable Passport Booklet Cover */}
            <PassportCover
              onClick={() => setIsBookOpen(true)}
              className="w-full flex justify-center"
            />

            {/* Direct Book Opening CTA */}
            <div className="mt-5 w-full max-w-[340px] sm:max-w-[380px] space-y-2.5">
              <button
                onClick={() => setIsBookOpen(true)}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#35c3c8] to-[#48d2d7] hover:from-[#48d2d7] hover:to-[#5eead4] text-[#050e14] font-mono font-bold text-sm tracking-wider uppercase transition-all shadow-[0_10px_25px_rgba(53,195,200,0.3)] hover:shadow-[0_15px_30px_rgba(53,195,200,0.45)] hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
              >
                <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>ABRIR MI PASAPORTE</span>
              </button>

              <div className="flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => setIsQrOpen(true)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-[#214358] bg-[#0c1e2b] hover:bg-[#132c3f] text-[#8faab5] hover:text-[#35c3c8] transition-colors flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Código QR</span>
                </button>

                <button
                  onClick={() => navigate('/passport/smart-card')}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-[#214358] bg-[#0c1e2b] hover:bg-[#132c3f] text-[#8faab5] hover:text-[#35c3c8] transition-colors flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Smart Card</span>
                </button>
              </div>

              <div className="text-[10px] text-center text-[#557d91] italic pt-1">
                {profile.disclaimerEs}
              </div>
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: CLEAN WORLD-APP-INSPIRED DIGITAL IDENTITY OVERVIEW (Cols 6–12)
             ========================================================================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* Identity Welcome Header Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#091824]/90 border border-[#1d3c4e] shadow-xl backdrop-blur-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#35c3c8]/30 bg-[#35c3c8]/10 text-[#35c3c8] text-xs font-bold tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#35c3c8] animate-pulse" />
                  <span>IDENTIDAD CIENTÍFICA POLAR</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full border border-[#72e0b5]/30 bg-[#72e0b5]/10 text-[#72e0b5] font-semibold">
                    ESTADO: {profile.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs text-[#8faab5] tracking-wider uppercase block">
                  Bienvenido de vuelta,
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide mt-0.5">
                  {profile.displayName}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#35c3c8] mt-1.5">
                  <span className="font-semibold">{profile.role}</span>
                  <span className="text-[#557d91]">·</span>
                  <span className="text-[#8faab5]">{profile.specialization}</span>
                </div>
              </div>

              {/* Central Polar Identity Graphic (Section 25) */}
              <div className="pt-2">
                <PolarIdentity onSelectNode={(nodeId) => console.log('Selected station node:', nodeId)} />
              </div>

              {/* Three Clean Honest Metrics (Section 12: No fake values) */}
              <div className="pt-4 border-t border-[#183446] grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-[#06121c] border border-[#162d3d]">
                  <span className="text-2xl font-bold text-[#35c3c8] block">
                    {profile.stats.observations}
                  </span>
                  <span className="text-[10px] text-[#8faab5] uppercase tracking-wider block mt-0.5">
                    Observaciones
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#06121c] border border-[#162d3d]">
                  <span className="text-2xl font-bold text-[#72e0b5] block">
                    {profile.stats.locations}
                  </span>
                  <span className="text-[10px] text-[#8faab5] uppercase tracking-wider block mt-0.5">
                    Bases & Sitios
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#06121c] border border-[#162d3d]">
                  <span className="text-2xl font-bold text-white block">
                    {profile.stats.stamps}
                  </span>
                  <span className="text-[10px] text-[#8faab5] uppercase tracking-wider block mt-0.5">
                    Sellos Oficiales
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Access Scientific Pathways */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/passport/journey"
                className="p-4 rounded-2xl bg-[#091824] border border-[#1d3c4e] hover:border-[#35c3c8]/50 hover:bg-[#0c2233] transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#35c3c8]/10 text-[#35c3c8] flex items-center justify-center">
                    <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#35c3c8] transition-colors">
                      Bitácora de Navegación
                    </div>
                    <div className="text-[10px] text-[#8faab5]">
                      Línea de tiempo de expediciones y campo
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#557d91] group-hover:translate-x-1 group-hover:text-[#35c3c8] transition-all" />
              </Link>

              <Link
                to="/passport/stamps"
                className="p-4 rounded-2xl bg-[#091824] border border-[#1d3c4e] hover:border-[#72e0b5]/50 hover:bg-[#0c2233] transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#72e0b5]/10 text-[#72e0b5] flex items-center justify-center">
                    <StampIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#72e0b5] transition-colors">
                      Sellos Antárticos
                    </div>
                    <div className="text-[10px] text-[#8faab5]">
                      6 sellos con tinta y firmas oficiales
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#557d91] group-hover:translate-x-1 group-hover:text-[#72e0b5] transition-all" />
              </Link>

              <Link
                to="/passport/map"
                className="p-4 rounded-2xl bg-[#091824] border border-[#1d3c4e] hover:border-[#35c3c8]/50 hover:bg-[#0c2233] transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#35c3c8]/10 text-[#35c3c8] flex items-center justify-center">
                    <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#35c3c8] transition-colors">
                      Mapa Personal Polar
                    </div>
                    <div className="text-[10px] text-[#8faab5]">
                      Ruta personal liviana sin recargar la Home
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#557d91] group-hover:translate-x-1 group-hover:text-[#35c3c8] transition-all" />
              </Link>

              <Link
                to="/passport/smart-card"
                className="p-4 rounded-2xl bg-[#091824] border border-[#1d3c4e] hover:border-[#35c3c8]/50 hover:bg-[#0c2233] transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#35c3c8]/10 text-[#35c3c8] flex items-center justify-center">
                    <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#35c3c8] transition-colors">
                      Smart Card NFC ISO 7816
                    </div>
                    <div className="text-[10px] text-[#8faab5]">
                      Acreditación física & desafío criptográfico
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#557d91] group-hover:translate-x-1 group-hover:text-[#35c3c8] transition-all" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Selective Disclosure QR Modal */}
      <PassportQRModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
    </div>
  );
}
