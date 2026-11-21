import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, ChevronDown, ChevronUp, X, GripHorizontal } from 'lucide-react';
import { getLayerSemantics } from '../lib/layer-semantics';
import { getIconForLayer, getSvgDataUri } from '../lib/map-icon-atlas';
import AgencyBadge from './AgencyBadge';

interface AutoLegendProps {
  activeLayers: Record<string, boolean>;
  className?: string;
  onClose?: () => void;
}

interface LegendEntry {
  id: string;
  label: string;
  description: string;
  color: string;
  symbolType: 'icon' | 'circle' | 'ring' | 'heat' | 'line';
}

const LEGEND_REGISTRY: Record<string, LegendEntry> = {
  maritime_vessels: {
    id: 'maritime_vessels',
    label: 'Buque AIS en Vivo',
    description: 'Flota polar y expedición en tiempo real',
    color: '#35C3C8',
    symbolType: 'icon',
  },
  polar_aircraft: {
    id: 'polar_aircraft',
    label: 'Vuelo Polar ADS-B',
    description: 'Aeronave activa en corredor Drake/Antártico',
    color: '#4DA8FF',
    symbolType: 'icon',
  },
  polar_satellites: {
    id: 'polar_satellites',
    label: 'Satélite Propagado (SGP4)',
    description: 'Órbita polar y cobertura de sensor',
    color: '#A995FF',
    symbolType: 'icon',
  },
  fisheries_effort: {
    id: 'fisheries_effort',
    label: 'Esfuerzo Pesquero (GFW)',
    description: 'Actividad aparente CCAMLR',
    color: '#FF8A4C',
    symbolType: 'heat',
  },
  antarctic_fauna: {
    id: 'antarctic_fauna',
    label: 'Avistamiento de Fauna (OBIS)',
    description: 'Cetáceos, focas y aves marinas',
    color: '#72E0B5',
    symbolType: 'icon',
  },
  seismic_events: {
    id: 'seismic_events',
    label: 'Evento Sísmico (USGS)',
    description: 'Epicentro tectónico M≥3.0',
    color: '#FF827D',
    symbolType: 'ring',
  },
  submarine_cables: {
    id: 'submarine_cables',
    label: 'Cable Submarino / SMART',
    description: 'Infraestructura y sensores suboceánicos',
    color: '#E085FF',
    symbolType: 'line',
  },
  nuclear_sites: {
    id: 'nuclear_sites',
    label: 'Sitios Nucleares / Residuos',
    description: 'Vertidos oceánicos e historial de reactores (McMurdo PM-3A)',
    color: '#EF4444',
    symbolType: 'icon',
  },
  comnap_facilities: {
    id: 'comnap_facilities',
    label: 'Estaciones Científicas',
    description: 'Bases polares antárticas COMNAP',
    color: '#F59E0B',
    symbolType: 'circle',
  },
  aspa: {
    id: 'aspa',
    label: 'Zona Protegida (ASPA)',
    description: 'Área protegida Tratado Antártico',
    color: '#55D48B',
    symbolType: 'ring',
  },
  ocean_currents: {
    id: 'ocean_currents',
    label: 'Corriente Circumpolar (ACC)',
    description: 'Flujo geostrófico marino y chorro de Drake (CMEMS)',
    color: '#58D5E3',
    symbolType: 'line',
  },
  wind_particles: {
    id: 'wind_particles',
    label: 'Viento Polar Superficial (ECMWF/GFS)',
    description: 'Vientos del Oeste y rachas catabáticas costeras',
    color: '#38BDF8',
    symbolType: 'line',
  },
  ozone_layer: {
    id: 'ozone_layer',
    label: 'Capa de Ozono Antártica (Sentinel-5P / CAMS)',
    description: 'Concentración total en Unidades Dobson (DU) y umbral de 220 DU',
    color: '#00ffff',
    symbolType: 'line',
  },
};

export default function AutoLegend({ activeLayers, className = '', onClose }: AutoLegendProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Collect all active entries, prioritizing LAYER_SEMANTICS
  const activeIds = Object.entries(activeLayers)
    .filter(([_, enabled]) => enabled)
    .map(([id]) => id);

  interface MergedLegendItem {
    id: string;
    label: string;
    description: string;
    color: string;
    sdg?: number;
    agency?: any;
    symbolType: 'icon' | 'circle' | 'ring' | 'heat' | 'line';
  }

  const visibleEntries: MergedLegendItem[] = [];

  for (const id of activeIds) {
    const sem = getLayerSemantics(id);
    if (sem) {
      visibleEntries.push({
        id: sem.id,
        label: sem.name,
        description: sem.purpose.slice(0, 65) + '...',
        color: sem.sdgColor,
        sdg: sem.sdg,
        agency: sem.agency,
        symbolType:
          id.includes('effort') || id.includes('heat')
            ? 'heat'
            : id.includes('aspa') || id.includes('asma')
            ? 'ring'
            : id.includes('current') || id.includes('cable') || id.includes('line')
            ? 'line'
            : 'icon',
      });
    } else if (LEGEND_REGISTRY[id]) {
      const leg = LEGEND_REGISTRY[id];
      visibleEntries.push({
        ...leg,
      });
    }
  }

  if (visibleEntries.length === 0 || isDismissed) return null;

  if (isCollapsed) {
    return (
      <motion.button
        drag
        dragMomentum={false}
        dragElastic={0.08}
        onClick={() => setIsCollapsed(false)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080e19ee] border border-[#24344d] text-xs text-[#8fa3bd] hover:text-white shadow-xl backdrop-blur-md transition-all font-mono select-none cursor-grab active:cursor-grabbing ${className}`}
        title="Coge y arrastra / Haz clic para expandir leyenda"
      >
        <GripHorizontal className="w-3 h-3 text-[#5e7c8e]" />
        <Layers className="w-3.5 h-3.5 text-[#35c3c8]" />
        <span className="font-bold text-[10px] tracking-wider uppercase">Leyenda ({visibleEntries.length})</span>
        <ChevronUp className="w-3.5 h-3.5 text-[#8fa3bd]" />
      </motion.button>
    );
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.08}
      className={`bg-[#080e19ee] border border-[#24344d] rounded-xl p-3 shadow-2xl backdrop-blur-md font-mono select-none max-w-sm ${className}`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-[#1c2940] cursor-grab active:cursor-grabbing select-none" title="Coge y arrastra para mover la leyenda">
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#8fa3bd] tracking-wider">
          <GripHorizontal className="w-3.5 h-3.5 text-[#5e7c8e]" />
          <Layers className="w-3.5 h-3.5 text-[#35c3c8]" />
          <span>Leyenda Dinámica ({visibleEntries.length})</span>
        </div>

        <div className="flex items-center gap-1" onPointerDownCapture={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded text-[#8fa3bd] hover:text-white hover:bg-white/10 transition"
            title="Minimizar leyenda"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setIsDismissed(true);
              onClose?.();
            }}
            className="p-1 rounded text-[#8fa3bd] hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Cerrar leyenda"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-1">
        {visibleEntries.map((item) => (
          <div key={item.id} className="flex items-center gap-2.5 text-xs bg-[#0b1726]/60 p-1.5 rounded-lg border border-[#162a3f]">
            {/* Visual symbol / icon */}
            {item.symbolType === 'icon' ? (
              <img
                src={getSvgDataUri(getIconForLayer(item.id))}
                alt=""
                className="w-6 h-6 shrink-0 object-contain"
                aria-hidden="true"
              />
            ) : item.sdg ? (
              <img
                src={`/sdg-icons/${item.sdg}.png`}
                alt={`ODS ${item.sdg}`}
                className="w-5 h-5 rounded object-cover shrink-0 border border-white/20 shadow-sm"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
                title={`ODS ${item.sdg}`}
              />
            ) : (
              item.symbolType === 'circle' && (
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px] inline-block"
                  style={{
                    backgroundColor: item.color,
                    boxShadow: `0 0 6px ${item.color}88`,
                  }}
                />
              )
            )}

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-[#f5f8fc] truncate">
                  {item.label}
                </span>
                {item.agency && <AgencyBadge agency={item.agency} size="xs" />}
              </div>
              <span className="text-[9.5px] text-[#8fa3bd] line-clamp-1">
                {item.description}
              </span>
              {item.id === 'ozone_layer' && (
                <div className="mt-1 flex flex-col gap-0.5">
                  <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-[#581c87] via-[#06b6d4] to-[#f97316]" />
                  <div className="flex justify-between text-[8px] text-cyan-300 font-mono">
                    <span>&lt; 140 DU</span>
                    <span className="font-bold text-cyan-400">220 DU Umbral</span>
                    <span>&gt; 340 DU</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
