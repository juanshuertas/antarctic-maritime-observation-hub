import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import {
  Compass,
  User,
  MapPin,
  Stamp as StampIcon,
  FileText,
  Database,
  CreditCard,
  CheckCircle2,
  Shield,
  Layers,
  ArrowLeft,
  Lock,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { INITIAL_PASSPORT_PROFILE } from './passport-data';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { to: '/passport', label: 'Mi Carnet', icon: User, end: true },
  { to: '/passport/stamps', label: 'Sellos & Logros', icon: StampIcon },
  { to: '/passport/journey', label: 'Mi Bitácora', icon: Compass },
  { to: '/passport/expeditions', label: 'Expediciones', icon: MapPin },
];

const MORE_NAV_ITEMS: NavItem[] = [
  { to: '/passport/smart-card', label: 'Tarjeta Smart Card', icon: CreditCard },
  { to: '/passport/observations', label: 'Observaciones de Campo', icon: Layers },
  { to: '/passport/map', label: 'Mapa Polar', icon: MapPin },
  { to: '/passport/datasets', label: 'Datasets Científicos', icon: Database },
  { to: '/passport/publications', label: 'Publicaciones', icon: FileText },
  { to: '/passport/credentials', label: 'Credenciales W3C', icon: Shield },
  { to: '/passport/verify', label: 'Verificar Pasaporte', icon: CheckCircle2 },
  { to: '/passport/privacy', label: 'Privacidad & Seguridad', icon: Lock },
];

export default function PassportLayout() {
  const profile = INITIAL_PASSPORT_PROFILE;
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const isMoreActive = MORE_NAV_ITEMS.some((item) => location.pathname === item.to);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#07131e] text-[#e8f0f3] flex flex-col selection:bg-[#35c3c8] selection:text-[#050e14]">
      {/* Top Banner & Passport Header Bar */}
      <header className="border-b border-[#1b384c] bg-[#091a27]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Treaty Title */}
          <div className="flex items-center gap-3.5">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#214358] bg-[#0c1f2e] hover:bg-[#122e44] text-[#8faab5] hover:text-[#35c3c8] transition-all text-xs font-mono font-medium min-h-[40px] group"
              title="Volver a AMOH Live Lens (Mapa Principal)"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Observatorio</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg border border-[#35c3c8]/40 bg-[#06121c] p-1 shadow-[0_0_15px_rgba(53,195,200,0.15)] flex items-center justify-center shrink-0">
                <img
                  src="/brand/amoh-logo.png"
                  alt="AMOH Emblem"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold tracking-[0.2em] font-mono text-[#35c3c8]">
                    PASAPORTE POLAR
                  </span>
                  <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#35c3c8]/15 text-[#35c3c8] border border-[#35c3c8]/30">
                    EDICIÓN CIENTÍFICA
                  </span>
                </div>
                <div className="text-[11px] text-[#8faab5] font-mono flex items-center gap-2">
                  <span className="text-white font-bold">{profile.publicName}</span>
                  <span>·</span>
                  <span>N° {profile.credentialId}</span>
                  <span>·</span>
                  <span className="text-[#72e0b5]">SCAR #1820</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Prototype Pill */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#214358] bg-[#0c1f2e]">
              <span className="text-[#8faab5]">Sellos:</span>
              <span className="text-[#72e0b5] font-bold">{profile.stats.stamps} Bases</span>
              <span className="text-[#214358]">|</span>
              <span className="text-[#8faab5]">Obs:</span>
              <span className="text-[#35c3c8] font-bold">{profile.stats.observations}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#35c3c8]/40 bg-[#35c3c8]/10 text-[#35c3c8] text-xs">
              <span className="w-2 h-2 rounded-full bg-[#35c3c8] animate-pulse" />
              <span className="font-semibold">{profile.status}</span>
            </div>
          </div>
        </div>

        {/* Clean, Non-Scrolling Primary Tabs Bar */}
        <div className="border-t border-[#162d3d] bg-[#06121c]/95">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-2">
            {/* Primary navigation pills (>=44px touch friendly) */}
            <nav className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {PRIMARY_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono font-medium min-h-[42px] transition-all duration-150 ${
                        isActive
                          ? 'bg-[#35c3c8]/20 text-[#35c3c8] border border-[#35c3c8]/50 shadow-[0_0_12px_rgba(53,195,200,0.2)] font-bold'
                          : 'text-[#8faab5] hover:text-white hover:bg-[#102535] border border-transparent'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Scientific Drawer / More options dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen((prev) => !prev)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono font-medium min-h-[42px] border transition-all ${
                  isMoreActive || moreOpen
                    ? 'bg-[#0f2a3a] border-[#35c3c8] text-[#35c3c8] shadow-sm font-bold'
                    : 'bg-[#0a1824] border-[#1d3c50] text-[#8faab5] hover:text-white hover:bg-[#102535]'
                }`}
                title="Herramientas científicas y datos avanzados"
              >
                <Sparkles className="w-4 h-4 text-[#35c3c8]" />
                <span className="hidden sm:inline">Archivo Científico</span>
                <span className="sm:hidden">Más</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreOpen && (
                <div className="absolute top-[48px] right-0 w-64 rounded-2xl bg-[#071724] border border-[#1e4259] shadow-2xl p-2 z-[600] backdrop-blur-xl flex flex-col gap-1">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#72a1b5] border-b border-[#142e3f] font-bold">
                    Herramientas Avanzadas
                  </div>
                  {MORE_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono transition-colors ${
                          isActive
                            ? 'bg-[#35c3c8]/20 text-[#35c3c8] font-bold'
                            : 'text-[#8faab5] hover:text-white hover:bg-[#0d2232]'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-[#35c3c8]" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        <Outlet />
      </main>

      {/* Footer with mandatory disclaimer */}
      <footer className="border-t border-[#1b384c] bg-[#051018] py-6 px-4 text-center text-xs text-[#6c8a99] font-mono space-y-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            WORLD OCEANS LIVING OBSERVATORY · ANTARCTIC SCIENTIFIC PASSPORT
          </div>
          <div className="text-[#72e0b5] font-semibold">
            {profile.disclaimerEs}
          </div>
        </div>
        <div className="text-[10px] text-[#4f6c7c]">
          Titular: {profile.publicName} · Credencial: {profile.credentialId} · Registro Científico Descentralizado
        </div>
      </footer>
    </div>
  );
}
