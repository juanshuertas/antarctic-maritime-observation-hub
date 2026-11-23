import { useState } from 'react';
import { Layers, ChevronDown, ChevronRight } from 'lucide-react';
import { getLayerSDGBadge } from '../lib/sdg-registry';

export interface LayerToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  category?: string;
  color?: string;
  isSimulation?: boolean;
}

interface LayerPanelProps {
  layers: LayerToggle[];
  onToggle: (id: string, enabled: boolean) => void;
  onOpenFisheries?: () => void;
  isFisheriesActive?: boolean;
  onToggleFaunaStrip?: () => void;
  onRegionClick?: () => void;
}

// Fixed 5 primary observatory layers to match amoh.png exactly
interface CoreDisplayLayer {
  id: string;
  label: string;
  description: string;
  isGfw?: boolean;
}

const CORE_DISPLAY_LAYERS: CoreDisplayLayer[] = [
  {
    id: 'aspa',
    label: 'Áreas Protegidas (ASPA)',
    description: 'Zonas protegidas, ecosistemas y manejo',
  },
  {
    id: 'maritime_vessels',
    label: 'Buques AIS',
    description: 'Embarcaciones en tiempo real',
  },
  {
    id: 'maritime_corridors',
    label: 'Corredores de Navegación',
    description: 'Rutas agregadas y áreas de tránsito',
  },
  {
    id: 'fisheries_effort',
    label: 'Pesquerías (GFW)',
    description: 'Actividad pesquera y monitoreo satelital',
    isGfw: true,
  },
  {
    id: 'submarine_cables',
    label: 'Cables Submarinos',
    description: 'Infraestructura de comunicaciones',
  },

  {
    id: 'polar_satellites',
    label: 'Satélites polares (SGP4)',
    description: 'Órbitas propagadas NORAD / CelesTrak',
  },
];

export default function LayerPanel({
  layers,
  onToggle,
  onOpenFisheries,
  isFisheriesActive = false,
  onRegionClick,
}: LayerPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [gfwExpanded, setGfwExpanded] = useState(true);

  // Sub-toggles for GFW in amoh.png
  const [gfwSubFilters, setGfwSubFilters] = useState({
    effort: true,
    aisVms: true,
    gear: true,
    vessels: true,
    sar: true,
  });

  const toggleGfwSubFilter = (key: keyof typeof gfwSubFilters) => {
    setGfwSubFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isLayerEnabled = (id: string): boolean => {
    if (id === 'fisheries_effort') return isFisheriesActive;
    const found = layers.find((l) => l.id === id);
    return found ? found.enabled : false;
  };

  const handleToggle = (id: string, checked: boolean) => {
    if (id === 'fisheries_effort') {
      onOpenFisheries?.();
    } else {
      onToggle(id, checked);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 z-[200] select-none" style={{ width: '295px' }}>
      {/* 1. TOP HERO BADGE CARD (amoh.png) */}
      <div
        className="rounded-xl border border-[#1f3947]/80 bg-[#07131bee] p-3 shadow-2xl backdrop-blur-md"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="text-[9px] uppercase tracking-[1.5px] font-mono text-[#58d5e3] font-semibold">
          OBSERVATORIO DEL OCÉANO AUSTRAL
        </div>
        <div
          className="text-base font-bold text-white tracking-tight mt-0.5"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Una perspectiva desde el sur.
        </div>
        <div className="text-[11px] text-[#8faab5] mt-0.5">
          Conecta el océano con lo que observas.
        </div>

        <button
          type="button"
          onClick={onRegionClick}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-2.5 rounded-full bg-[#0d202b] border border-[#213f4f] hover:border-[#58d5e3]/60 text-[10px] font-mono text-[#72e0b5] hover:text-white transition-all group"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#72e0b5] group-hover:scale-125 transition-transform" />
          <span>Península Antártica · 60°–75° S</span>
          <span className="text-[#58d5e3] group-hover:translate-x-0.5 transition-transform">&gt;</span>
        </button>
      </div>

      {/* 2. OBSERVATORY LAYERS CARD (amoh.png) */}
      <aside
        aria-label="Capas del observatorio"
        className="rounded-xl border border-[#1f3947] bg-[#0c1922f2] shadow-2xl backdrop-blur-md overflow-hidden"
        style={{ fontFamily: "'DM Sans', sans-serif", color: '#edf5f5' }}
      >
        {/* Card Header */}
        <div
          className="px-3.5 py-2.5 border-b border-[#1f3947] flex items-center justify-between cursor-pointer select-none bg-[#07131b]"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#58d5e3]" />
            <span className="text-xs font-semibold tracking-wide text-white">
              Capas del observatorio
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#58d5e3]/20 text-[#58d5e3] font-bold">
              6
            </span>
          </div>
          <button
            className="text-[#8faab5] hover:text-white transition-colors"
            aria-label={isCollapsed ? 'Expandir capas' : 'Colapsar capas'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {!isCollapsed && (
          <div className="p-2 space-y-1.5 max-h-[58vh] overflow-y-auto scrollbar-thin">
            {/* 5 Core Layers */}
            <div className="space-y-1 pt-0.5">
              {CORE_DISPLAY_LAYERS.map((layer) => {
                const enabled = isLayerEnabled(layer.id);

                return (
                  <div key={layer.id} className="rounded-lg hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-start gap-2.5 px-2.5 py-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => handleToggle(layer.id, e.target.checked)}
                        className="mt-0.5 w-3.5 h-3.5 rounded accent-[#58d5e3] cursor-pointer shrink-0"
                      />
                      <div
                        className="flex-1 min-w-0"
                        onClick={() => {
                          if (layer.isGfw) {
                            setGfwExpanded(!gfwExpanded);
                          } else {
                            handleToggle(layer.id, !enabled);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`text-xs font-medium truncate ${enabled ? 'text-white' : 'text-[#8faab5]'}`}>
                              {layer.label}
                            </span>
                            {(() => {
                              const sdg = getLayerSDGBadge(layer.id);
                              return (
                                <span
                                  className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold shrink-0 shadow-sm"
                                  style={{ backgroundColor: sdg.color, color: sdg.textColor }}
                                  title={`ODS ${sdg.number}: ${sdg.name}`}
                                >
                                  ODS {sdg.number}
                                </span>
                              );
                            })()}
                          </div>
                          {layer.isGfw && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setGfwExpanded(!gfwExpanded);
                              }}
                              className="text-[#8faab5] hover:text-white"
                            >
                              {gfwExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                        <div className="text-[10px] text-[#718d99] truncate">
                          {layer.description}
                        </div>
                      </div>
                    </div>

                    {/* Nested GFW Sub-toggles (amoh.png) */}
                    {layer.isGfw && gfwExpanded && enabled && (
                      <div className="ml-7 mr-2 mb-2 pt-1 border-l border-[#1f3947]/70 pl-2.5 space-y-1 text-[11px] animate-in fade-in duration-150">
                        <label className="flex items-center gap-2 text-[#91a8af] hover:text-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={gfwSubFilters.effort}
                            onChange={() => toggleGfwSubFilter('effort')}
                            className="w-3 h-3 accent-[#ff754b] cursor-pointer"
                          />
                          <span>Esfuerzo pesquero aparente</span>
                        </label>
                        <label className="flex items-center gap-2 text-[#91a8af] hover:text-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={gfwSubFilters.aisVms}
                            onChange={() => toggleGfwSubFilter('aisVms')}
                            className="w-3 h-3 accent-[#58d5e3] cursor-pointer"
                          />
                          <span>AIS / VMS</span>
                        </label>
                        <label className="flex items-center gap-2 text-[#91a8af] hover:text-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={gfwSubFilters.gear}
                            onChange={() => toggleGfwSubFilter('gear')}
                            className="w-3 h-3 accent-[#8de8cd] cursor-pointer"
                          />
                          <span>Arte de pesca</span>
                        </label>
                        <label className="flex items-center gap-2 text-[#91a8af] hover:text-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={gfwSubFilters.vessels}
                            onChange={() => toggleGfwSubFilter('vessels')}
                            className="w-3 h-3 accent-[#fde047] cursor-pointer"
                          />
                          <span>Embarcaciones seleccionadas</span>
                        </label>
                        <label className="flex items-center gap-2 text-[#91a8af] hover:text-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={gfwSubFilters.sar}
                            onChange={() => toggleGfwSubFilter('sar')}
                            className="w-3 h-3 accent-[#ff754b] cursor-pointer"
                          />
                          <span>Detecciones ópticas / SAR</span>
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom status */}
            <div className="pt-2 mt-1 border-t border-[#1f3947] px-2 text-[10px] text-[#8faab5] flex items-center justify-between font-mono">
              <span>AMOH Living Core</span>
              <span className="text-[#72e0b5]">● En línea</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
