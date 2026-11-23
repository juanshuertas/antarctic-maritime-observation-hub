import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, X, Ship, Plane, Orbit, Fish, Mountain, Activity, Waves, Wind, Radio, Shield, Radiation, Zap, Anchor, Compass, Camera, MapPin, Tent, Flame, Gem, Sparkles, Layers, Bird, Snowflake } from 'lucide-react';
import { getLayerSDGBadge, getLayerSDGColor } from '../lib/sdg-registry';

export interface LayerChipInfo {
  id: string;
  name: string;
  color: string;
  count?: number | null;
  icon?: React.ReactNode;
}

interface ActiveLayerChipsProps {
  activeLayers: Record<string, boolean>;
  counts?: Record<string, number | null>;
  telemetry?: {
    vessels_count?: number | null;
    satellites_count?: number | null;
    aircraft_count?: number | null;
  };
  onRemoveLayer?: (layerId: string) => void;
  onToggleLayer?: (layerId: string, enabled: boolean) => void;
  onOpenLibrary?: () => void;
  className?: string;
}

const LAYER_METADATA: Record<string, { name: string; color: string; icon: React.ReactNode }> = {
  maritime_vessels: {
    name: 'Buques AIS',
    color: getLayerSDGColor('maritime_vessels'),
    icon: <Ship className="w-3.5 h-3.5" />,
  },
  polar_aircraft: {
    name: 'Vuelos Polares',
    color: getLayerSDGColor('polar_aircraft'),
    icon: <Plane className="w-3.5 h-3.5" />,
  },
  polar_satellites: {
    name: 'Satélites',
    color: getLayerSDGColor('polar_satellites'),
    icon: <Orbit className="w-3.5 h-3.5" />,
  },
  fisheries_effort: {
    name: 'Pesquerías (GFW)',
    color: getLayerSDGColor('fisheries_effort'),
    icon: <Fish className="w-3.5 h-3.5" />,
  },
  gfw_fishing_effort: {
    name: 'Pesca GFW',
    color: getLayerSDGColor('gfw_fishing_effort'),
    icon: <Fish className="w-3.5 h-3.5" />,
  },
  antarctic_fauna: {
    name: 'Fauna Polar (OBIS)',
    color: getLayerSDGColor('antarctic_fauna'),
    icon: <Waves className="w-3.5 h-3.5" />,
  },
  biodiversity_atlas: {
    name: 'Atlas Hábitats (MAPPPD)',
    color: getLayerSDGColor('biodiversity_atlas'),
    icon: <Waves className="w-3.5 h-3.5" />,
  },
  seismic_events: {
    name: 'Sismicidad (USGS)',
    color: getLayerSDGColor('seismic_events'),
    icon: <Activity className="w-3.5 h-3.5" />,
  },
  quantarctica_stations: {
    name: 'Bases Científicas',
    color: getLayerSDGColor('quantarctica_stations'),
    icon: <Mountain className="w-3.5 h-3.5" />,
  },
  aspa: {
    name: 'Zonas Protegidas (ASPA)',
    color: getLayerSDGColor('aspa'),
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  ocean_currents: {
    name: 'Corriente Circumpolar (ACC)',
    color: getLayerSDGColor('ocean_currents'),
    icon: <Waves className="w-3.5 h-3.5" />,
  },
  wind_particles: {
    name: 'Viento Polar Superficial',
    color: getLayerSDGColor('wind_particles'),
    icon: <Wind className="w-3.5 h-3.5" />,
  },
  argo_floats: {
    name: 'Boyas Argo',
    color: getLayerSDGColor('argo_floats'),
    icon: <Radio className="w-3.5 h-3.5" />,
  },
  maris_nuclear: {
    name: 'Vigilancia MARIS',
    color: getLayerSDGColor('maris_nuclear'),
    icon: <Radiation className="w-3.5 h-3.5" />,
  },
  iaato_routes: {
    name: 'Turismo IAATO',
    color: getLayerSDGColor('tourism_routes'),
    icon: <Compass className="w-3.5 h-3.5" />,
  },
  tourism_routes: {
    name: 'Turismo IAATO',
    color: getLayerSDGColor('tourism_routes'),
    icon: <Compass className="w-3.5 h-3.5" />,
  },
  iaato_landing_sites: {
    name: 'Desembarcos Zodiac',
    color: '#38bdf8',
    icon: <MapPin className="w-3.5 h-3.5" />,
  },
  iaato_deep_field_camps: {
    name: 'Campamentos Antárticos',
    color: '#a855f7',
    icon: <Tent className="w-3.5 h-3.5" />,
  },
  luxury_camps: {
    name: 'Glamping de Lujo Polar',
    color: '#f59e0b',
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
  tourist_submersibles: {
    name: 'Sumergibles de Inmersión',
    color: '#0284c7',
    icon: <Waves className="w-3.5 h-3.5" />,
  },
  heavy_traverses: {
    name: 'Travesías Oruga (SPoT)',
    color: '#ea580c',
    icon: <Compass className="w-3.5 h-3.5" />,
  },
  autonomous_yachts: {
    name: 'Saildrone & Veleros',
    color: '#06b6d4',
    icon: <Anchor className="w-3.5 h-3.5" />,
  },
  subsurface_nuclear: {
    name: 'Submarinos Nucleares & CTBTO',
    color: '#e11d48',
    icon: <Radiation className="w-3.5 h-3.5" />,
  },
  submarine_cables: {
    name: 'Cables Submarinos',
    color: getLayerSDGColor('submarine_cables'),
    icon: <Anchor className="w-3.5 h-3.5" />,
  },
  offshore_energy: {
    name: 'Energía Gateway',
    color: getLayerSDGColor('offshore_energy'),
    icon: <Zap className="w-3.5 h-3.5" />,
  },
  offshore_wells: {
    name: 'Pozos Offshore',
    color: getLayerSDGColor('offshore_wells'),
    icon: <Flame className="w-3.5 h-3.5" />,
  },
  deepsea_mining: {
    name: 'Minería Submarina',
    color: getLayerSDGColor('deepsea_mining'),
    icon: <Gem className="w-3.5 h-3.5" />,
  },
  field_observations: {
    name: 'Muestras de Campo',
    color: getLayerSDGColor('field_observations'),
    icon: <Camera className="w-3.5 h-3.5" />,
  },
  // Quantarctica NPI & SCAR layers
  quantarctica_coastline: {
    name: 'Costa SCAR ADD',
    color: '#38bdf8',
    icon: <Layers className="w-3.5 h-3.5" />,
  },
  quantarctica_ice_shelf: {
    name: 'Barreras Hielo',
    color: '#a7f3d0',
    icon: <Snowflake className="w-3.5 h-3.5" />,
  },
  rock_outcrops: {
    name: 'Afloramientos Rocosos',
    color: '#94a3b8',
    icon: <Mountain className="w-3.5 h-3.5" />,
  },
  glacier_velocity: {
    name: 'Flujo Glaciar InSAR',
    color: '#34d399',
    icon: <Snowflake className="w-3.5 h-3.5" />,
  },
  median_sea_ice_extents: {
    name: 'Extensión Banquisa NSIDC',
    color: '#67e8f9',
    icon: <Snowflake className="w-3.5 h-3.5" />,
  },
  southern_ocean_fronts: {
    name: 'Frentes Oceánicos (SCAR)',
    color: '#06b6d4',
    icon: <Waves className="w-3.5 h-3.5" />,
  },
  acbrs: {
    name: 'Ecorregiones ACBRs',
    color: '#10b981',
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  emperor_penguin_colonies: {
    name: 'Colonias P. Emperador',
    color: '#fbbf24',
    icon: <Bird className="w-3.5 h-3.5" />,
  },
  important_bird_areas: {
    name: 'Áreas Aves (IBAs)',
    color: '#f59e0b',
    icon: <Bird className="w-3.5 h-3.5" />,
  },
  comnap_facilities: {
    name: 'Bases COMNAP',
    color: '#38bdf8',
    icon: <Mountain className="w-3.5 h-3.5" />,
  },
  historic_routes: {
    name: 'Rutas Históricas',
    color: '#eab308',
    icon: <Compass className="w-3.5 h-3.5" />,
  },
  historic_stations: {
    name: 'Sitios Históricos SMH',
    color: '#eab308',
    icon: <Compass className="w-3.5 h-3.5" />,
  },
  aspa_polygons: {
    name: 'Zonas ASPA CEP',
    color: '#ef4444',
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  asma_polygons: {
    name: 'Zonas ASMA CEP',
    color: '#8b5cf6',
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  ccamlr_statistical_areas: {
    name: 'Áreas CCAMLR',
    color: '#c084fc',
    icon: <Fish className="w-3.5 h-3.5" />,
  },
  ccamlr_mpas: {
    name: 'AMPs CCAMLR',
    color: '#0284c7',
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  // Defense & Geopolitics
  grey_zones_defense: {
    name: 'Zonas Grises Defensa',
    color: '#ef4444',
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  polar_friction_sectors: {
    name: 'Barómetro Fricción (PFI)',
    color: '#f97316',
    icon: <Activity className="w-3.5 h-3.5" />,
  },
  grey_zones_buffers: {
    name: 'Buffers Radares & EW',
    color: '#eab308',
    icon: <Radio className="w-3.5 h-3.5" />,
  },
  // Fauna
  fauna_benthos: {
    name: 'Bentos & Esponjas',
    color: '#10b981',
    icon: <Waves className="w-3.5 h-3.5" />,
  },
  fauna_cetaceans: {
    name: 'Cetáceos & Ballenas',
    color: '#06b6d4',
    icon: <Waves className="w-3.5 h-3.5" />,
  },
  fauna_fish: {
    name: 'Ictiofauna CCAMLR',
    color: '#38bdf8',
    icon: <Fish className="w-3.5 h-3.5" />,
  },
  fauna_krill: {
    name: 'Biomasa Krill',
    color: '#fb923c',
    icon: <Fish className="w-3.5 h-3.5" />,
  },
  fauna_penguins: {
    name: 'Pingüinos (MAPPPD)',
    color: '#fbbf24',
    icon: <Bird className="w-3.5 h-3.5" />,
  },
  fauna_pinnipeds: {
    name: 'Focas & Pinnípedos',
    color: '#2dd4bf',
    icon: <Waves className="w-3.5 h-3.5" />,
  },
  fauna_seabirds: {
    name: 'Aves & Albatros',
    color: '#a78bfa',
    icon: <Bird className="w-3.5 h-3.5" />,
  },
  influencer_tourism_footprint: {
    name: 'Huella Turismo CEP',
    color: '#f43f5e',
    icon: <MapPin className="w-3.5 h-3.5" />,
  },
};

export default function ActiveLayerChips({
  activeLayers,
  counts = {},
  telemetry,
  onRemoveLayer,
  onToggleLayer,
  onOpenLibrary,
  className = '',
}: ActiveLayerChipsProps) {
  const [collapsed, setCollapsed] = useState(false);

  const handleRemove = (id: string) => {
    if (onRemoveLayer) onRemoveLayer(id);
    else if (onToggleLayer) onToggleLayer(id, false);
  };

  const getCount = (id: string): number | null => {
    if (counts[id] !== undefined) return counts[id];
    if (telemetry) {
      if (id === 'maritime_vessels') return telemetry.vessels_count ?? null;
      if (id === 'polar_aircraft') return telemetry.aircraft_count ?? null;
      if (id === 'polar_satellites') return telemetry.satellites_count ?? null;
    }
    return null;
  };

  const activeList = Object.entries(activeLayers)
    .filter(([_, enabled]) => enabled)
    .map(([id]) => {
      const meta = LAYER_METADATA[id] || {
        name: id.replace(/_/g, ' '),
        color: getLayerSDGColor(id),
        icon: <Layers className="w-3.5 h-3.5" />,
      };
      return {
        id,
        ...meta,
        count: getCount(id),
      };
    });

  if (activeList.length === 0) return null;

  const clearAll = () => activeList.forEach((l) => handleRemove(l.id));

  return (
    <div
      className={`pointer-events-auto select-none max-w-[calc(100vw-4.5rem)] sm:max-w-[85vw] bg-[#050b14e6] border border-[#1e293b]/70 rounded-2xl backdrop-blur-md shadow-2xl ${className}`}
      aria-label="Capas activas en el mapa"
    >
      {/* Cabecera fija: contador, Limpiar y minimizar quedan siempre a la vista,
          aunque la lista de chips sea larga y haya que desplazarla. */}
      <div className="flex items-center gap-1.5 px-2 py-1">
        <span className="text-[10px] uppercase font-mono tracking-wider text-[#8fa3bd] shrink-0">
          Activas ({activeList.length})
        </span>
        <button
          onClick={clearAll}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-[10px] font-mono font-semibold transition-all shrink-0"
          title="Apagar todas las capas activas"
        >
          <Trash2 className="w-3 h-3" />
          <span>Limpiar</span>
        </button>
        {onOpenLibrary && (
          <button
            onClick={onOpenLibrary}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00e5ff]/15 hover:bg-[#00e5ff]/30 border border-[#00e5ff]/40 text-[#00e5ff] text-[10px] font-mono font-bold transition-all shrink-0"
            title="Abrir catálogo completo de capas"
          >
            <Layers className="w-3 h-3" />
            <span className="hidden sm:inline">+ Capas</span>
          </button>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="ml-auto p-1 rounded-full text-[#8fa3bd] hover:text-white hover:bg-white/10 transition-colors shrink-0"
          title={collapsed ? 'Mostrar las capas activas' : 'Minimizar la lista de capas'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!collapsed && (
      <div className="flex items-center gap-1.5 px-2 pb-1.5 overflow-x-auto scrollbar-none">

      {activeList.map((layer) => (
        <div
          key={layer.id}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#080e19] border border-[#24344d] text-[11px] font-mono shrink-0 shadow-sm transition-all hover:border-[#38bdf8]/50 group"
        >
          {(() => {
            const sdg = getLayerSDGBadge(layer.id);
            return (
              <span
                className="px-1 py-0.2 rounded text-[9px] font-bold shrink-0"
                style={{ backgroundColor: sdg.color, color: sdg.textColor }}
                title={`ODS ${sdg.number}: ${sdg.name}`}
              >
                ODS {sdg.number}
              </span>
            );
          })()}
          <span className="text-[#b7c5d8] group-hover:text-white transition-colors flex items-center gap-1 text-[11px]">
            {layer.icon}
            <span className="max-w-[130px] truncate">{layer.name}</span>
          </span>
          {typeof layer.count === 'number' && (
            <span
              className="px-1 py-0.2 rounded-full text-[10px] font-bold"
              style={{
                backgroundColor: `${layer.color}22`,
                color: layer.color,
              }}
            >
              {layer.count}
            </span>
          )}
          <button
            onClick={() => handleRemove(layer.id)}
            className="ml-0.5 p-0.5 rounded-full text-[#8fa3bd] hover:text-[#ff827d] hover:bg-white/10 transition-colors"
            title={`Desactivar capa ${layer.name}`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      </div>
      )}
    </div>
  );
}
