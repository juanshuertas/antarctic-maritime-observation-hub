import { useMemo } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { getLayerSDGNumber } from '../lib/sdg-registry';

interface OdsMissionStripProps {
  activeLayers: Record<string, boolean>;
  activeSdgGoal: number | null;
  onSelectSdgGoal: (goalNumber: number | null) => void;
  onOpenSdgLens: () => void;
  className?: string;
}

interface PolarSdgMeta {
  number: number;
  emoji: string;
  name: string;
  shortName: string;
  color: string;
  highlightAction: string;
}

const POLAR_SDGS: PolarSdgMeta[] = [
  {
    number: 14,
    emoji: '🌊',
    name: 'Vida Submarina',
    shortName: 'Océanos & Krill',
    color: '#0A97D9',
    highlightAction: 'Monitoreo de acidificación, cetáceos y Áreas Marinas Protegidas',
  },
  {
    number: 13,
    emoji: '❄️',
    name: 'Acción por el Clima',
    shortName: 'Criósfera Polar',
    color: '#3F7E44',
    highlightAction: 'Balance de masa glaciar, banquisa marina y calentamiento global',
  },
  {
    number: 9,
    emoji: '🔬',
    name: 'Innovación e Infraestructura',
    shortName: 'Bases & Satélites',
    color: '#FD6925',
    highlightAction: 'Red satelital polar, sensores Argo e investigación de punta',
  },
  {
    number: 7,
    emoji: '⚡',
    name: 'Energía Limpia',
    shortName: 'Renovables Polares',
    color: '#FCC30B',
    highlightAction: 'Transición energética de bases antárticas y eólica austral',
  },
  {
    number: 16,
    emoji: '🕊️',
    name: 'Paz y Gobernanza',
    shortName: 'Tratado Antártico',
    color: '#00689D',
    highlightAction: 'Desmilitarización continental, ciencia abierta y consenso internacional',
  },
  {
    number: 2,
    emoji: '🐟',
    name: 'Pesca Sostenible',
    shortName: 'CCAMLR / Biomasa',
    color: '#DDA63A',
    highlightAction: 'Regulación de pesca de krill y bacalao de profundidad',
  },
  {
    number: 17,
    emoji: '🤝',
    name: 'Alianzas Globales',
    shortName: 'Cooperación Polar',
    color: '#19486A',
    highlightAction: 'Colaboración SCAR, COMNAP y plataformas científicas unificadas',
  },
  {
    number: 4,
    emoji: '🎓',
    name: 'Educación y Ciencia',
    shortName: 'Cultura Antártica',
    color: '#C5192D',
    highlightAction: 'Alfabetización polar y formación de nuevas generaciones científicas',
  },
];

export const OdsMissionStrip: React.FC<OdsMissionStripProps> = ({
  activeLayers,
  activeSdgGoal,
  onSelectSdgGoal,
  onOpenSdgLens,
  className = '',
}) => {
  // Count active layers per SDG number
  const sdgLayerCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    Object.entries(activeLayers).forEach(([layerId, isEnabled]) => {
      if (!isEnabled) return;
      const sdgNum = getLayerSDGNumber(layerId);
      if (sdgNum) {
        counts[sdgNum] = (counts[sdgNum] || 0) + 1;
      }
    });
    return counts;
  }, [activeLayers]);

  // Unique SDGs currently with active layers
  const activeSdgCount = useMemo(() => {
    return Object.keys(sdgLayerCounts).length;
  }, [sdgLayerCounts]);

  return (
    <div
      className={`select-none pointer-events-auto transition-all ${className}`}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="flex items-center gap-2 p-1.5 px-2.5 rounded-full amoh-glass border border-cyan-500/30 shadow-[0_12px_36px_rgba(0,0,0,0.55)] max-w-[94vw] overflow-x-auto no-scrollbar backdrop-blur-2xl">
        {/* Gamified Mission Badge */}
        <button
          onClick={() => {
            // AMOH_SDG_STRIP_BRIDGE_V22
            onOpenSdgLens?.();
            window.dispatchEvent(new CustomEvent('amoh:open-sdg-lens'));
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 border border-cyan-400/40 text-cyan-200 transition-all amoh-pill-interactive group shrink-0"
          title="Ver Panel Completo de Sostenibilidad y Metas de la Agenda 2030"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-cyan-300 relative" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-mono uppercase font-bold tracking-wider text-cyan-300/80 leading-none">
              ODS
            </span>
            <span className="text-xs font-bold text-white leading-none mt-0.5 flex items-center gap-1">
              <span className="text-cyan-400">{activeSdgCount}</span>
              <span className="text-white/60">/</span>
              <span>17 Metas</span>
            </span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 group-hover:rotate-12 transition-transform ml-0.5" />
        </button>

        <span className="w-px h-5 bg-cyan-500/20 shrink-0" />

        {/* Scrollable list of youthful Polar SDG chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {POLAR_SDGS.map((sdg) => {
            const isSelected = activeSdgGoal === sdg.number;
            const layersInThisSdg = sdgLayerCounts[sdg.number] || 0;
            const hasActiveLayers = layersInThisSdg > 0;

            return (
              <button
                key={sdg.number}
                onClick={() => onSelectSdgGoal(isSelected ? null : sdg.number)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all shrink-0 border ${
                  isSelected
                    ? 'shadow-lg text-white font-bold ring-2 ring-white/30'
                    : hasActiveLayers
                    ? 'bg-[#0a2236]/80 border-cyan-500/30 text-slate-200 hover:border-cyan-400/60 hover:text-white'
                    : 'bg-[#061524]/60 border-slate-700/40 text-slate-400 hover:border-slate-600 hover:text-slate-200 opacity-85 hover:opacity-100'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: `${sdg.color}35`,
                        borderColor: sdg.color,
                        boxShadow: `0 0 16px ${sdg.color}60`,
                      }
                    : hasActiveLayers
                    ? {
                        borderLeftColor: sdg.color,
                        borderLeftWidth: '3px',
                      }
                    : {}
                }
                title={`ODS ${sdg.number}: ${sdg.name} — ${sdg.highlightAction}`}
              >
                <span>{sdg.emoji}</span>
                <span className="font-mono font-bold text-xs text-white/90">
                  ODS {sdg.number}
                </span>
                <span className="hidden sm:inline font-medium text-xs text-slate-300">
                  {sdg.shortName}
                </span>

                {layersInThisSdg > 0 && (
                  <span
                    className="ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-mono font-bold text-white shadow-sm"
                    style={{ backgroundColor: sdg.color }}
                  >
                    {layersInThisSdg}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Clear filter button if an SDG is currently focused */}
        {activeSdgGoal !== null && (
          <>
            <span className="w-px h-5 bg-cyan-500/20 shrink-0" />
            <button
              onClick={() => onSelectSdgGoal(null)}
              className="px-2.5 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-xs font-mono font-bold text-rose-300 transition-all shrink-0"
              title="Quitar filtro ODS"
            >
              ✕ Limpiar
            </button>
          </>
        )}

        {/* Direct link to SdgLensDrawer */}
        <button
          onClick={() => {
            // AMOH_SDG_STRIP_BRIDGE_V22
            onOpenSdgLens?.();
            window.dispatchEvent(new CustomEvent('amoh:open-sdg-lens'));
          }}
          className="hidden md:flex items-center gap-1 pl-2 pr-1 text-xs font-mono text-cyan-300 hover:text-white shrink-0 group"
        >
          <span>Agenda 2030</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default OdsMissionStrip;

