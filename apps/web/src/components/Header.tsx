import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, Search, Sparkles, EyeOff } from 'lucide-react';
import { useI18nStore, SUPPORTED_LANGUAGES } from '../lib/i18n';
import AntarcticaNowStrip from './AntarcticaNowStrip';

interface HeaderProps {
  onToggleMenu?: () => void;
  onOpenSearch?: () => void;
  onOpenSdgLens?: () => void;
  onOpenPythia?: () => void;
  onCloseAll?: () => void;
  onFitScreen?: () => void;
  onOpenDirectorMode?: () => void;
  hasOpenOverlays?: boolean;
  activeSdgCount?: number;
  activeView?: string;
  onViewChange?: (view: any) => void;
  region?: string;
  period?: string;
  vesselsCount?: number;
  vesselsStatus?: string;
  satellitesCount?: number;
  aircraftCount?: number;
  onOpenQr?: () => void;
}

export default function Header({
  onToggleMenu,
  onOpenSearch,
  onOpenSdgLens,
  onOpenPythia,
  onCloseAll,
  hasOpenOverlays = false,
  activeSdgCount = 0,
}: HeaderProps) {
  const { language, setLanguage } = useI18nStore();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangInfo = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <header
      className="w-full h-14 sm:h-16 z-[400] select-none transition-colors border-b flex items-center justify-between gap-2 px-3 sm:px-6 shadow-xl relative backdrop-blur-2xl bg-[#061422]/90 border-cyan-500/20"
      style={{
        color: '#edf5f5',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* 1 & 2: LOGO + TÍTULO: OLEA (Oceanic Logistics & Ecosystem Analytics) */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* 1. Logo Polar con Blasón OLEA */}
        <div className="relative group cursor-pointer" onClick={onToggleMenu}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#0a1828] to-[#02060c] border border-cyan-400/50 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(10,151,217,0.25)] shrink-0 transition-transform group-hover:scale-105">
            <img src="/olea-symbol.svg" alt="OLEA Symbol" className="w-6 h-6 object-contain group-hover:scale-110 transition-transform" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#061422] animate-pulse" title="Sistema en vivo" />
        </div>

        {/* 2. Título OLEA con tipografía unificada y limpia */}
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-lg sm:text-xl tracking-wider text-white group cursor-pointer" onClick={onToggleMenu} style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}>
            OLEA
          </span>
          <span className="hidden md:inline-flex items-center gap-2 text-xs text-cyan-200/80 font-medium border-l border-cyan-500/25 pl-3">
            <span>Observatorio Polar 4D</span>
          </span>
        </div>
      </div>

      {/* CENTRO: CÁPSULA SITUACIONAL ANTÁRTIDA AHORA */}
      <div className="hidden xl:flex items-center mx-2">
        <AntarcticaNowStrip onOpenPythia={onOpenPythia} />
      </div>

      {/* CONTROLES DERECHA UNIFICADOS */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* BUSCADOR */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 sm:px-3.5 py-2 rounded-full bg-[#0b2032]/80 border border-cyan-500/25 hover:border-cyan-400/70 text-xs text-slate-200 hover:text-white transition-all shadow-sm min-h-[38px] group"
          title="Buscar capas, buques, bases o especies (⌘K)"
        >
          <Search className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Buscar</span>
        </button>

        {/* ACCESO DIRECTO MISIÓN ODS */}
        {onOpenSdgLens && (
          <button
            onClick={() => {
              // AMOH_SDG_HEADER_BRIDGE_V22
              onOpenSdgLens?.();
              window.dispatchEvent(new CustomEvent('amoh:open-sdg-lens'));
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-full bg-emerald-500/15 border border-emerald-400/40 hover:border-emerald-300 text-xs font-semibold text-emerald-200 hover:text-white transition-all min-h-[38px] group"
            title="Lente de Sostenibilidad ODS 2030"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300 group-hover:rotate-45 transition-transform" />
            <span className="hidden sm:inline">ODS 2030</span>
            {activeSdgCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-emerald-400 text-slate-950">
                {activeSdgCount}
              </span>
            )}
          </button>
        )}

        {/* CERRAR VENTANAS / VISTA LIMPIA */}
        {onCloseAll && hasOpenOverlays && (
          <button
            onClick={onCloseAll}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full bg-rose-500/20 border border-rose-400/40 hover:bg-rose-500/30 text-xs text-rose-200 hover:text-white transition-all min-h-[38px] group"
            title="Cerrar ventanas emergentes (Esc)"
          >
            <EyeOff className="w-4 h-4 text-rose-300" />
            <span className="hidden sm:inline font-semibold">Cerrar</span>
          </button>
        )}

        {/* IDIOMA */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen((prev) => !prev)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 rounded-full bg-[#0a1e2e]/80 border border-cyan-500/25 hover:border-cyan-400/70 text-xs text-white transition-all min-h-[38px]"
            title="Cambiar idioma"
          >
            <span className="uppercase font-semibold" translate="no">{currentLangInfo.short}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
          </button>
          {langOpen && (
            <div className="absolute top-[46px] right-0 w-44 rounded-2xl bg-[#071929]/95 border border-cyan-500/30 shadow-2xl py-2 z-[600] backdrop-blur-2xl flex flex-col">
              <div className="px-3 py-1 text-xs uppercase text-cyan-300/80 border-b border-cyan-500/20 font-bold">
                Idioma
              </div>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setLangOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                    language === lang.code
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                      : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-2" translate="no" lang={lang.code} dir={lang.dir}>
                    <span>{lang.nativeName}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MENÚ */}
        <button
          onClick={onToggleMenu}
          className="flex items-center gap-2 px-2.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-xs font-bold text-slate-950 transition-all shadow-md active:scale-95 min-h-[38px]"
          aria-label="Abrir Menú"
        >
          <Menu className="w-4 h-4 text-slate-950" />
          <span className="hidden sm:inline tracking-wide uppercase">Menú</span>
        </button>
      </div>
    </header>
  );
}

