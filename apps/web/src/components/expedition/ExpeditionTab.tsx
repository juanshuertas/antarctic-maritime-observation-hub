import { useEffect, useState } from 'react';
import '../../styles/expedition.css';

export interface ExpeditionData {
  expedition_id: string;
  status: string;
  disclaimer: string;
  program?: {
    name: string;
    season: string;
    application_reference?: string;
    deadline_submission?: string;
  };
  researcher?: {
    name: string;
    nationality: string;
    institution: string;
    position: string;
    education: string;
    training: string[];
  };
  project: {
    title: string;
    research_question: string;
    principle: string;
    region?: {
      name: string;
      bbox: number[];
      primary_sector: string;
      secondary_sectors: string[];
    };
    platform: {
      name: string;
      operator?: string;
      type?: string;
      ice_class?: string;
      capacity?: number;
    };
    dates: {
      preferred_window: string;
      specific_request?: string;
      duration_days?: number;
    };
    objectives: {
      minimum: number;
      working_target: number;
      ideal: number;
      unit?: string;
    };
    operational_constraints?: Record<string, boolean>;
  };
  equipment?: {
    edge_node: { model: string; storage: string; role: string };
    sensors: Array<{ name: string; role: string }>;
    software: { amoh_version: string; offline_mode: boolean; pwa: boolean };
  };
  outreach?: {
    guest_lecture: { duration_minutes: number; topics: string[] };
    evening_recaps: { duration_minutes: number; frequency: string; location: string };
    science_hub: { deck: number; role: string };
  };
  drake_passage?: {
    description: string;
    typical_crossing_days: number;
    distance_nautical_miles: number;
    difficulty: string;
    role_in_research: string;
  };
  safety_gate: string;
  phase_2: {
    name: string;
    platform: string;
    program?: string;
    season?: string;
    description?: string;
    dependency?: string;
  };
  institutions?: {
    coordinating: string;
    contact: string;
    partners: string[];
  };
}

export interface Milestone {
  id: string;
  order: number;
  title: string;
  coordinates: [number, number];
  description: string;
  observations_target: number;
  duration_hours?: number;
  layers_to_activate?: string[];
  stamp_id?: string;
}

interface Props {
  onMilestoneClick?: (milestone: Milestone) => void;
  onShowRoute?: () => void;
}

const FALLBACK_EXPEDITION: ExpeditionData = {
  expedition_id: 'NG-LEX-2027-2028',
  status: 'PROPOSAL',
  disclaimer:
    'No se implica respaldo de National Geographic Society ni Lindblad Expeditions. Esta es una aplicación al programa Visiting Scientist.',
  program: {
    name: 'NGS-Lindblad Expeditions Visiting Scientist Program',
    season: 'Southern Ocean 2027-2028',
    application_reference: 'Webinar 2026, RFP Southern Ocean',
    deadline_submission: '2026-10-01T23:59:59-04:00',
  },
  researcher: {
    name: 'Juan Sebastian Huertas Olea',
    nationality: 'Colombia',
    institution: 'Independent Researcher',
    position: 'Early-Career Researcher',
    education: 'Universidad Militar Nueva Granada (UMNG) 2024',
    training: [
      'NASA ARSET - Sustainable Earth Science Applications',
      'ESDEG - Diplomado en Oceanopolítica (120h)',
      'SCAR 2026 Oslo - Poster 1820',
    ],
  },
  project: {
    title: 'AI-enabled satellite and AIS monitoring of Antarctic shipping pressure',
    research_question:
      '¿Dónde y cuándo se concentra la actividad marítima a lo largo de la Península Antártica, y pueden AIS, observaciones satelitales y validación de campo identificar dónde se necesita un monitoreo ambiental más cercano?',
    principle: 'La expedición no se adapta a la investigación; la investigación se adapta a la expedición.',
    platform: {
      name: 'National Geographic Resolution',
      operator: 'Lindblad Expeditions',
      type: 'Expedition Cruise Ship',
      ice_class: 'PC5',
      capacity: 126,
    },
    dates: {
      preferred_window: 'Octubre 2027 - Marzo 2028',
      specific_request: 'Primer viaje de la temporada (16-26 octubre 2027)',
      duration_days: 10,
    },
    objectives: {
      minimum: 4,
      working_target: 6,
      ideal: 8,
      unit: 'observaciones emparejadas de alta calidad',
    },
  },
  equipment: {
    edge_node: {
      model: 'MacBook Pro 16 M5 Max',
      storage: '1 TB',
      role: 'Offline processing + data integration',
    },
    sensors: [
      { name: 'Samsung Galaxy S25+', role: 'Field capture + GNSS' },
      { name: 'iPhone 14 Pro Max', role: 'Backup capture' },
    ],
    software: {
      amoh_version: 'V10',
      offline_mode: true,
      pwa: true,
    },
  },
  safety_gate:
    'SCIENTIFIC CANDIDATE — NOT A NAVIGATION INSTRUCTION. Subject to expedition leader, vessel master, safety protocols, and Antarctic Treaty / national permits.',
  phase_2: {
    name: 'X Expedición Antártica de Colombia',
    platform: 'ARC Simón Bolívar',
    program: 'Programa Antártico Colombiano (PAC)',
    season: '2027-2028',
    description: 'Escalamiento del piloto NatGeo a campaña nacional completa',
    dependency: 'Validación exitosa en NG-LEX + aprobación CCO',
  },
};

const FALLBACK_MILESTONES: Milestone[] = [
  {
    id: 'ushuaia_departure',
    order: 1,
    title: 'Zarpe: Puerto de Ushuaia & Canal Beagle',
    coordinates: [-68.303, -54.807],
    description: 'Zarpe oficial desde el muelle comercial y turístico de Ushuaia, Tierra del Fuego. Tránsito este por el Canal Beagle hacia el Paso Mackinlay y aguas abiertas del Atlántico Sur.',
    layers_to_activate: ['ais_vessels', 'antarctic_stations', 'ocean_currents', 'copernicus_currents_peninsula'],
    duration_hours: 8,
    observations_target: 1,
    stamp_id: 'ushuaia_departure',
  },
  {
    id: 'cape_horn_entry',
    order: 2,
    title: 'Cabo de Hornos & Entrada a Drake',
    coordinates: [-67.27, -55.98],
    description: 'Paso frente a las islas Wollaston y el Cabo de Hornos. Entrada formal al Pasaje de Drake e inicio de calibración de radares de oleaje, AIS y sensores oceánicos.',
    layers_to_activate: ['ocean_currents', 'copernicus_currents_peninsula', 'ais_vessels', 'oceanographic_vessels'],
    duration_hours: 14,
    observations_target: 1,
    stamp_id: 'cape_horn_drake_entry',
  },
  {
    id: 'drake_crossing',
    order: 3,
    title: 'Paso de Drake Central & Convergencia Antártica',
    coordinates: [-64.00, -58.50],
    description: 'Cruce del meridiano del Drake atravesando el frente polar (Convergencia Antártica). Transecto clave de match-up con pases de satélite Sentinel-1 SAR y observación de aves pelágicas.',
    layers_to_activate: ['ais_vessels', 'ocean_currents', 'copernicus_currents_peninsula', 'fauna_polar', 'sentinel_sar'],
    duration_hours: 36,
    observations_target: 2,
    stamp_id: 'drake_crossing',
  },
  {
    id: 'south_shetlands',
    order: 4,
    title: 'Islas Shetland del Sur & Bahía Fildes',
    coordinates: [-58.96, -62.20],
    description: 'Primer contacto continental en Isla Rey Jorge. Zona crítica de monitoreo de tráfico de bases internacionales (Frei, Bellingshausen, Artigas, Escudero) y pesqueros de kril.',
    layers_to_activate: ['antarctic_stations', 'ais_vessels', 'gfw_fishing_effort', 'fauna_polar'],
    duration_hours: 24,
    observations_target: 2,
    stamp_id: 'south_shetlands',
  },
  {
    id: 'bransfield_strait',
    order: 5,
    title: 'Estrecho de Bransfield & Península',
    coordinates: [-60.57, -62.97],
    description: 'Navegación por el Estrecho de Bransfield y avistamiento de Isla Decepción (caldera volcánica). Monitoreo de tráfico turístico y témpanos a la deriva mediante SAR.',
    layers_to_activate: ['ais_vessels', 'gfw_fishing_effort', 'sentinel_sar', 'aspa'],
    duration_hours: 20,
    observations_target: 2,
    stamp_id: 'peninsula_first_observation',
  },
  {
    id: 'gerlache_strait',
    order: 6,
    title: 'Estrecho de Gerlache & Témpanos Azules',
    coordinates: [-62.53, -64.40],
    description: 'Canal protegido de 100 km flanqueado por cordilleras glaciares. Máxima concentración de ballenas jorobadas, orcas, témpanos tabulares y fragmentos de A-23A.',
    layers_to_activate: ['fauna_polar', 'sea_ice', 'ocean_currents', 'copernicus_currents_peninsula'],
    duration_hours: 28,
    observations_target: 3,
    stamp_id: 'gerlache_transit',
  },
  {
    id: 'neko_harbour',
    order: 7,
    title: 'Neko Harbour & Bahía Paraíso',
    coordinates: [-62.55, -64.84],
    description: 'Desembarco en el continente antártico. Conteo de colonias de pingüinos papúa, monitoreo de retroceso glaciar y verificación de directrices IAATO y ASPA.',
    layers_to_activate: ['fauna_polar', 'tourism_sites', 'aspa'],
    duration_hours: 12,
    observations_target: 2,
    stamp_id: 'neko_harbour',
  },
  {
    id: 'drake_return',
    order: 8,
    title: 'Retorno por Drake y Arribo a Ushuaia',
    coordinates: [-68.303, -54.807],
    description: 'Recruce del Pasaje de Drake en derrota norte, ingreso al Canal Beagle y atraque final en el Muelle de Ushuaia. Cierre de campaña y exportación de datos DuckDB/SQLite.',
    layers_to_activate: ['ais_vessels', 'antarctic_stations'],
    duration_hours: 48,
    observations_target: 1,
    stamp_id: 'drake_return',
  },
];

export function ExpeditionTab({ onMilestoneClick, onShowRoute }: Props) {
  const [expedition, setExpedition] = useState<ExpeditionData | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [expRes, msRes] = await Promise.all([
          fetch('/api/expeditions/ng-lex-2027').catch(() => null),
          fetch('/api/expeditions/ng-lex-milestones').catch(() => null),
        ]);

        let expData = expRes && expRes.ok ? await expRes.json() : null;
        let msData = msRes && msRes.ok ? await msRes.json() : null;

        // Also attempt direct static fallback if API is unreachable
        if (!expData) {
          const staticExp = await fetch('/data/expeditions/ng-lex-2027.json').catch(() => null);
          if (staticExp && staticExp.ok) expData = await staticExp.json();
        }
        if (!msData) {
          const staticMs = await fetch('/data/expeditions/ng-lex-milestones.json').catch(() => null);
          if (staticMs && staticMs.ok) msData = await staticMs.json();
        }

        if (isMounted) {
          setExpedition(expData || FALLBACK_EXPEDITION);
          setMilestones(msData?.milestones || FALLBACK_MILESTONES);
        }
      } catch (err) {
        console.warn('[ExpeditionTab] Loading fallback data:', err);
        if (isMounted) {
          setExpedition(FALLBACK_EXPEDITION);
          setMilestones(FALLBACK_MILESTONES);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="expedition-tab flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-xs font-mono text-[#8fa3bd]">
          <span className="w-2 h-2 rounded-full bg-[#FFCC00] animate-ping" />
          <span>Cargando Propuesta NG-LEX...</span>
        </div>
      </div>
    );
  }

  if (!expedition) {
    return (
      <div className="expedition-tab text-center py-8 text-xs text-[#8fa3bd]">
        No hay datos disponibles de la propuesta
      </div>
    );
  }

  return (
    <div className="expedition-tab animate-in fade-in duration-200">
      {/* 1. Header NatGeo */}
      <header className="expedition-header">
        <div className="expedition-logo" title="National Geographic Inspired">
          NG
        </div>
        <div style={{ flex: 1 }}>
          <h2 className="expedition-title">Expedición NG-LEX 2027-2028</h2>
          <div className="expedition-subtitle">
            Península Antártica Occidental · Océano Austral
          </div>
        </div>
        <div className="expedition-status" title="Propuesta en preparación — No confirmada">
          {expedition.status}
        </div>
      </header>

      {/* 2. Disclaimer Obligatorio */}
      <div className="expedition-disclaimer">
        ⚠️ <strong>AVISO OFICIAL:</strong> {expedition.disclaimer}
      </div>

      {/* 3. Safety Gate Rojo Obligatorio */}
      <div className="expedition-safety-gate">
        🔒 <strong>SAFETY GATE:</strong> {expedition.safety_gate}
      </div>

      {/* 4. Pregunta de Investigación */}
      <div className="expedition-card">
        <div className="expedition-card-title">Pregunta de Investigación</div>
        <p className="expedition-question">"{expedition.project.research_question}"</p>
      </div>

      {/* 5. Objetivos Científicos */}
      <div className="expedition-card">
        <div className="expedition-card-title">Objetivos Científicos (Matchups)</div>
        <div className="expedition-objective">
          <span style={{ color: '#FFCC00', fontSize: '10px' }}>●</span>
          <span>
            <strong>Mínimo:</strong> {expedition.project.objectives.minimum} observaciones emparejadas
          </span>
        </div>
        <div className="expedition-objective">
          <span style={{ color: '#FFCC00', fontSize: '10px' }}>●</span>
          <span>
            <strong>Objetivo de trabajo:</strong> {expedition.project.objectives.working_target} observaciones
          </span>
        </div>
        <div className="expedition-objective">
          <span style={{ color: '#FFCC00', fontSize: '10px' }}>●</span>
          <span>
            <strong>Ideal:</strong> {expedition.project.objectives.ideal} observaciones emparejadas
          </span>
        </div>
      </div>

      {/* 6. Plataforma & Principio Operativo */}
      <div className="expedition-card">
        <div className="expedition-card-title">Plataforma & Operación</div>
        <div className="text-xs text-[#F0F4F8] mb-1">
          <strong>Buque:</strong> {expedition.project.platform.name} ({expedition.project.platform.operator || 'Lindblad Expeditions'})
        </div>
        <div className="text-xs text-[#F0F4F8] mb-1">
          <strong>Puerto de Zarpe y Retorno:</strong> 🇦🇷 Puerto de Ushuaia, Argentina (Canal Beagle)
        </div>
        <div className="text-[11px] text-[#8FA3BD] mb-3">
          Ventana: {expedition.project.dates.preferred_window} · Derrota: Ushuaia ➔ Cabo Hornos ➔ Drake ➔ Península
        </div>
        <div className="expedition-card-title" style={{ marginTop: '10px' }}>
          Principio Operativo
        </div>
        <p className="expedition-question" style={{ fontSize: '13px' }}>
          "{expedition.project.principle}"
        </p>
      </div>

      {/* 7. Hitos de la Expedición (Interactivos) */}
      <div className="expedition-card">
        <div className="flex items-center justify-between mb-2">
          <div className="expedition-card-title" style={{ marginBottom: 0 }}>
            Hitos de la Expedición ({milestones.length})
          </div>
          {onShowRoute && (
            <button
              onClick={onShowRoute}
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFCC00]/20 hover:bg-[#FFCC00]/40 text-[#FFCC00] border border-[#FFCC00]/50 transition-colors"
            >
              📍 Ruta Ushuaia - Antártida
            </button>
          )}
        </div>
        <div className="text-[10px] text-[#8FA3BD] mb-2">
          Haz clic en cualquier hito para enfocar el mapa y activar capas científicas:
        </div>
        <div className="expedition-milestones">
          {milestones.map((m) => {
            const isSelected = activeMilestoneId === m.id;
            return (
              <div
                key={m.id}
                className={`expedition-milestone ${isSelected ? 'border-l-4 !bg-[#FFCC00]/20' : ''}`}
                onClick={() => {
                  setActiveMilestoneId(m.id);
                  onMilestoneClick?.(m);
                  window.dispatchEvent(new CustomEvent('amoh:milestone-click', { detail: m }));
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="expedition-milestone-title">
                    {m.order}. {m.title}
                  </div>
                  <span className="text-[10px] font-mono text-[#FFCC00]">
                    [{m.coordinates[0].toFixed(1)}°, {m.coordinates[1].toFixed(1)}°]
                  </span>
                </div>
                <div className="expedition-milestone-desc">{m.description}</div>
                {m.layers_to_activate && m.layers_to_activate.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.layers_to_activate.map((l) => (
                      <span
                        key={l}
                        className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 text-[#FFCC00] border border-[#FFCC00]/20 font-mono"
                      >
                        +{l}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Fase 2 — Conexión PAC 2027-2028 */}
      <div className="expedition-card" style={{ borderColor: '#38bdf8' }}>
        <div className="expedition-card-title" style={{ color: '#38bdf8' }}>
          Fase 2 — Conexión PAC 2027-2028
        </div>
        <p style={{ fontSize: '13px', color: '#F0F4F8', fontWeight: 600 }}>
          🇨🇴 {expedition.phase_2.name}
        </p>
        <p style={{ fontSize: '11px', color: '#8FA3BD', marginTop: '4px' }}>
          <strong>Plataforma:</strong> {expedition.phase_2.platform} · {expedition.phase_2.program}
        </p>
        <p style={{ fontSize: '11px', color: '#8FA3BD', marginTop: '4px' }}>
          <strong>Dependencia:</strong> {expedition.phase_2.dependency}
        </p>
      </div>

      {/* 9. Equipamiento de Campo & Borde */}
      {expedition.equipment && (
        <div className="expedition-card" style={{ borderColor: 'rgba(255, 204, 0, 0.4)' }}>
          <div className="expedition-card-title">Equipamiento Edge & Sensores</div>
          <div className="text-xs space-y-1.5 text-[#F0F4F8]">
            <div>
              💻 <strong>Edge Node:</strong> {expedition.equipment.edge_node.model} ({expedition.equipment.edge_node.storage})
            </div>
            <div>
              📱 <strong>Sensores GNSS:</strong>{' '}
              {expedition.equipment.sensors.map((s) => s.name).join(' · ')}
            </div>
            <div className="text-[11px] text-[#8FA3BD]">
              Modo Offline PWA nativo habilitado · Sincronización oportunista de match-ups.
            </div>
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href="/field-logger"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-[#FFCC00] hover:bg-[#e6b800] text-black font-semibold text-xs tracking-wide uppercase transition-all shadow-md active:scale-95 text-center"
              >
                📓 Bitácora Edge
              </a>
              <a
                href="/science-hub"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-[#00e5ff] hover:bg-[#00c8e0] text-black font-semibold text-xs tracking-wide uppercase transition-all shadow-md active:scale-95 text-center"
              >
                🖥️ Science Hub Wall
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
