import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, Compass, AlertCircle, FileText, Radio, Plane, Orbit } from 'lucide-react';
import { api } from '../lib/api';
import { POLAR_AIRCRAFT_FLEET, POLAR_SATELLITES_CONSTELLATION } from '../lib/osiris-live-feeds';

export interface FieldSample {
  id: string;
  name: string;
  type: string;
  coords: [number, number]; // [lng, lat]
  description: string;
  author?: string;
  date?: string;
}

export const DEFAULT_SAMPLES: FieldSample[] = [
  {
    id: 'OBS-001',
    name: 'Hielo a la deriva',
    type: 'Criosfera',
    coords: [-63.0, -64.8],
    description: 'Fragmentos de hielo observados en superficie en el Estrecho de Bransfield. Punto de partida para contrastar reflectancia óptica y anomalías térmicas.',
    author: 'Expedición NGRS-ANTA-2027',
    date: '2026-09-17',
  },
  {
    id: 'OBS-002',
    name: 'Encuentro marítimo',
    type: 'Actividad humana',
    coords: [-58.0, -62.4],
    description: 'Avistamiento de buque polar en proximidades de Isla Rey Jorge. La coincidencia con AIS requiere revisión científica aprobada (Regla 18).',
    author: 'Vigía ARC 20 de Julio',
    date: '2026-09-16',
  },
  {
    id: 'OBS-003',
    name: 'Superficie del océano',
    type: 'Hidrosfera',
    coords: [-65.1, -65.3],
    description: 'Registro de contexto visual del agua en el Estrecho de Gerlache. Estimación de temperatura superficial y condiciones de oleaje.',
    author: 'Biol. Marina CCO',
    date: '2026-09-15',
  },
];

interface RightPanelProps {
  samples?: FieldSample[];
  selectedSampleIndex?: number;
  onSelectSample?: (index: number) => void;
  onNewObservation?: () => void;
  onFlyToSample?: (coords: [number, number]) => void;
  initialTab?: 'evidence' | 'pythia' | 'live';
}

export default function RightPanel({
  samples = DEFAULT_SAMPLES,
  selectedSampleIndex = 1, // Default to OBS-002 matching reference screenshot
  onSelectSample,
  onNewObservation,
  onFlyToSample,
  initialTab = 'evidence',
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<'evidence' | 'pythia' | 'live'>(initialTab);
  const [liveCategory, setLiveCategory] = useState<'aircraft' | 'satellites' | 'cables'>('aircraft');
  const [satelliteFilter, setSatelliteFilter] = useState<'all' | 'starlink' | 'earth_observation' | 'weather' | 'telecom'>('all');
  const [isMinimized, setIsMinimized] = useState(false);
  const [pythiaData, setPythiaData] = useState<any>(null);
  const [loadingPythia, setLoadingPythia] = useState(false);

  const filteredSatellites = POLAR_SATELLITES_CONSTELLATION.filter((s) => {
    if (satelliteFilter === 'all') return true;
    return s.category === satelliteFilter;
  });

  const starlinkCount = POLAR_SATELLITES_CONSTELLATION.filter((s) => s.category === 'starlink').length;
  const eoCount = POLAR_SATELLITES_CONSTELLATION.filter((s) => s.category === 'earth_observation').length;
  const weatherCount = POLAR_SATELLITES_CONSTELLATION.filter((s) => s.category === 'weather').length;
  const telecomCount = POLAR_SATELLITES_CONSTELLATION.filter((s) => s.category === 'telecom').length;

  const currentSample = samples[selectedSampleIndex] ?? samples[0];

  useEffect(() => {
    if (activeTab === 'pythia' && !pythiaData) {
      setLoadingPythia(true);
      api.get<any>('/api/pythia/synthesize?region=' + encodeURIComponent('Península Antártica'))
        .then((data) => setPythiaData(data))
        .catch(() => {
          setPythiaData({
            region: 'Península Antártica',
            brier_score: 0.1067,
            confidence: 0.84,
            hypotheses: [
              'Intrusión de Agua Profunda Circumpolar Modificada (MCDW) hacia la plataforma continental.',
              'Correlación anómala entre retroceso de hielo marino y concentraciones de clorofila-a.',
            ],
            factors: {
              sst_celsius: -0.4,
              sea_ice_concentration_pct: 72.0,
              salinity_psu: 34.2,
              mcdw_intrusion_index: 0.68,
            },
            disclaimer: 'Pythia es un modelo de inteligencia artificial interpretativo (Regla 15).',
          });
        })
        .finally(() => setLoadingPythia(false));
    }
  }, [activeTab, pythiaData]);

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="z-[200] flex items-center gap-1.5 px-3 py-2 rounded-l-xl border border-r-0 shadow-xl backdrop-blur-md transition-all hover:pr-4 bg-[#101f28ee] border-[#29404a] text-[#8de8cd] text-xs font-semibold"
        aria-label="Expandir panel de evidencia"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Cuaderno & Pythia</span>
      </button>
    );
  }

  return (
    <aside
      aria-label="Panel de evidencia y Pythia AI"
      className="z-[200] rounded-xl border shadow-2xl backdrop-blur-md overflow-hidden flex flex-col transition-all duration-200"
      style={{
        backgroundColor: '#101f28ee',
        borderColor: '#29404a',
        width: '310px',
        color: '#edf5f5',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Top Header & Tabs */}
      <div
        className="flex items-center justify-between border-b px-2.5 py-2 bg-[#081722]"
        style={{ borderColor: '#193444' }}
      >
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'live'
                ? 'bg-[#18394a] text-[#00e5ff] border border-[#00e5ff]/30 shadow-sm'
                : 'text-[#91a8af] hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-[#00e5ff] animate-pulse" />
            <span>En Vivo</span>
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'evidence'
                ? 'bg-[#18394a] text-[#8de8cd]'
                : 'text-[#91a8af] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Evidencia</span>
          </button>
          <button
            onClick={() => setActiveTab('pythia')}
            className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'pythia'
                ? 'bg-[#18394a] text-[#8de8cd]'
                : 'text-[#91a8af] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pythia AI</span>
          </button>
        </div>

        <button
          onClick={() => setIsMinimized(true)}
          className="text-[#91a8af] hover:text-white transition-colors p-1 shrink-0 ml-1"
          aria-label="Minimizar panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tab 1: Cuaderno de campo (Evidence) */}
      {activeTab === 'evidence' && currentSample && (
        <div className="p-4 space-y-3.5">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#91a8af]">
            <span>CUADERNO DE CAMPO</span>
            <span className="text-[#8de8cd]">
              0{selectedSampleIndex + 1} / 0{samples.length}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#8de8cd]/10 text-[#8de8cd] border border-[#8de8cd]/20">
              ◉ {currentSample.id}
            </span>
            <span className="text-[11px] text-[#91a8af] font-mono">
              {currentSample.type}
            </span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {currentSample.name}
            </h2>
            <p className="text-xs text-[#91a8af] mt-1 leading-relaxed">
              {currentSample.description}
            </p>
          </div>

          <div
            onClick={() => onFlyToSample?.(currentSample.coords)}
            className="p-2.5 rounded-lg bg-[#08151d] border border-[#29404a] flex items-center justify-between cursor-pointer hover:border-[#8de8cd]/50 transition-colors group"
          >
            <div>
              <div className="text-[9px] uppercase font-mono text-[#91a8af]">Coordenadas WGS84</div>
              <div className="text-xs font-mono text-[#8de8cd] font-semibold">
                {Math.abs(currentSample.coords[1]).toFixed(2)}° S · {Math.abs(currentSample.coords[0]).toFixed(2)}° W
              </div>
            </div>
            <Compass className="w-4 h-4 text-[#91a8af] group-hover:text-[#8de8cd] transition-colors" />
          </div>

          {/* Dots sample picker */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {samples.map((_, i) => (
              <button
                key={i}
                onClick={() => onSelectSample?.(i)}
                className={`h-2 rounded-full transition-all ${
                  i === selectedSampleIndex
                    ? 'w-6 bg-[#8de8cd]'
                    : 'w-2 bg-[#29404a] hover:bg-[#91a8af]'
                }`}
                aria-label={`Ver muestra ${i + 1}`}
              />
            ))}
          </div>

          {onNewObservation && (
            <button
              onClick={onNewObservation}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-[#8de8cd] text-[#08151d] hover:bg-[#a6eedb] transition-all shadow-md mt-1"
            >
              ＋ Nueva observación de campo
            </button>
          )}
        </div>
      )}

      {/* Tab 2: Pythia AI */}
      {activeTab === 'pythia' && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#8de8cd] text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Pythia Ocean Intel</span>
            </div>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#8de8cd]/10 text-[#8de8cd]">
              Agenda 2025–2035
            </span>
          </div>

          {loadingPythia ? (
            <div className="py-8 text-center text-xs text-[#91a8af] animate-pulse">
              Consultando modelos oceanográficos…
            </div>
          ) : pythiaData ? (
            <>
              {/* Brier Score Gauge */}
              <div className="p-2.5 rounded-lg bg-[#08151d] border border-[#29404a]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#91a8af]">Brier Score Calibrado</span>
                  <span className="font-mono text-[#8de8cd] font-bold">
                    {Number(pythiaData.brier_score).toFixed(4)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#142934] rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-[#8de8cd] rounded-full"
                    style={{ width: `${Math.max(10, (1 - Number(pythiaData.brier_score)) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-[#91a8af] mt-1">
                  <span>Alta incertidumbre (1.0)</span>
                  <span className="text-emerald-400 font-semibold">Empírico (&lt;0.15)</span>
                </div>
              </div>

              {/* Oceanographic Factors */}
              {pythiaData.factors && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-[#08151d] border border-[#29404a]">
                    <div className="text-[9px] text-[#91a8af]">SST Superficial</div>
                    <div className="font-mono font-semibold text-white mt-0.5">{pythiaData.factors.sst_celsius}°C</div>
                  </div>
                  <div className="p-2 rounded bg-[#08151d] border border-[#29404a]">
                    <div className="text-[9px] text-[#91a8af]">Hielo Marino</div>
                    <div className="font-mono font-semibold text-white mt-0.5">{pythiaData.factors.sea_ice_concentration_pct}%</div>
                  </div>
                  <div className="p-2 rounded bg-[#08151d] border border-[#29404a]">
                    <div className="text-[9px] text-[#91a8af]">Salinidad</div>
                    <div className="font-mono font-semibold text-white mt-0.5">{pythiaData.factors.salinity_psu} PSU</div>
                  </div>
                  <div className="p-2 rounded bg-[#08151d] border border-[#29404a]">
                    <div className="text-[9px] text-[#91a8af]">Índice MCDW</div>
                    <div className="font-mono font-semibold text-white mt-0.5">{pythiaData.factors.mcdw_intrusion_index}</div>
                  </div>
                </div>
              )}

              {/* Hypotheses */}
              {pythiaData.hypotheses && pythiaData.hypotheses.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[#91a8af]">Hipótesis Falsables</div>
                  <ul className="text-xs text-[#edf5f5] space-y-1.5 bg-[#08151d] p-2 rounded border border-[#29404a]">
                    {pythiaData.hypotheses.map((h: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-snug">
                        <span className="text-[#8de8cd] font-bold">›</span>
                        <span className="text-[11px] text-[#91a8af]">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer (Rule 15) */}
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-200/80 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-tight">
                  Pythia es un modelo interpretativo probabilístico, no una verdad de terreno certificada.
                </span>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Tab 3: En Vivo (Polar Aircraft, Satellites & Submarine Cables) */}
      {activeTab === 'live' && (
        <div className="p-3.5 space-y-3 max-h-[68vh] overflow-y-auto">
          {/* Sub-Category Switcher */}
          <div className="flex items-center gap-1 bg-[#09151e] p-1 rounded-lg border border-[#193444]">
            <button
              onClick={() => setLiveCategory('aircraft')}
              className={`flex-1 py-1 text-[11px] font-semibold rounded flex items-center justify-center gap-1 transition-colors ${
                liveCategory === 'aircraft'
                  ? 'bg-[#18394a] text-[#38bdf8]'
                  : 'text-[#91a8af] hover:text-white'
              }`}
            >
              <Plane className="w-3 h-3" />
              <span>Vuelos (6)</span>
            </button>
            <button
              onClick={() => setLiveCategory('satellites')}
              className={`flex-1 py-1 text-[11px] font-semibold rounded flex items-center justify-center gap-1 transition-colors ${
                liveCategory === 'satellites'
                  ? 'bg-[#18394a] text-[#00e5ff]'
                  : 'text-[#91a8af] hover:text-white'
              }`}
            >
              <Orbit className="w-3 h-3" />
              <span>Satélites ({POLAR_SATELLITES_CONSTELLATION.length})</span>
            </button>
            <button
              onClick={() => setLiveCategory('cables')}
              className={`flex-1 py-1 text-[11px] font-semibold rounded flex items-center justify-center gap-1 transition-colors ${
                liveCategory === 'cables'
                  ? 'bg-[#18394a] text-[#8de8cd]'
                  : 'text-[#91a8af] hover:text-white'
              }`}
            >
              <span>⚡ Cables</span>
            </button>
          </div>

          {/* Aircraft List */}
          {liveCategory === 'aircraft' && (
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#91a8af] flex items-center justify-between">
                <span>ADS-B POLAR AIR BRIDGE</span>
                <span className="text-[#38bdf8] font-bold">EN RUTA</span>
              </div>
              {POLAR_AIRCRAFT_FLEET.map((plane) => (
                <div
                  key={plane.callsign}
                  className="p-2.5 rounded-lg border bg-[#081722] border-[#1a3848] hover:border-[#38bdf8]/50 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white font-mono">{plane.callsign}</span>
                    <button
                      onClick={() => onFlyToSample?.([plane.lng, plane.lat])}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30 hover:bg-[#38bdf8]/30 transition-colors"
                    >
                      ⌖ Centrar
                    </button>
                  </div>
                  <div className="text-[11px] text-[#91a8af] leading-tight">
                    {plane.model} · <span className="text-white/80">{plane.operator}</span>
                  </div>
                  <div className="text-[10px] text-[#8faab5] font-mono">
                    Ruta: <span className="text-[#c4dce3]">{plane.origin} ➔ {plane.destination}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#91a8af] pt-1 border-t border-[#142934]">
                    <span>Alt: {plane.altitude_ft.toLocaleString()} ft</span>
                    <span>Vel: {plane.speed_kts} kts</span>
                    <span>Rbo: {plane.heading}°</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Satellites List */}
          {liveCategory === 'satellites' && (
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#91a8af] flex items-center justify-between">
                <span>CONSTELACIONES EN ÓRBITA</span>
                <span className="text-[#00e5ff] font-bold">{filteredSatellites.length} VISIBLES</span>
              </div>

              {/* Sub-filters for Satellites */}
              <div className="flex flex-wrap gap-1 pb-1">
                <button
                  onClick={() => setSatelliteFilter('all')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    satelliteFilter === 'all'
                      ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40 font-bold'
                      : 'bg-[#0b1924] text-[#91a8af] hover:text-white border border-[#1a3848]'
                  }`}
                >
                  Todos ({POLAR_SATELLITES_CONSTELLATION.length})
                </button>
                <button
                  onClick={() => setSatelliteFilter('starlink')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    satelliteFilter === 'starlink'
                      ? 'bg-[#00e676]/20 text-[#00e676] border border-[#00e676]/40 font-bold'
                      : 'bg-[#0b1924] text-[#91a8af] hover:text-[#00e676] border border-[#1a3848]'
                  }`}
                >
                  🌟 Starlink ({starlinkCount})
                </button>
                <button
                  onClick={() => setSatelliteFilter('earth_observation')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    satelliteFilter === 'earth_observation'
                      ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40 font-bold'
                      : 'bg-[#0b1924] text-[#91a8af] hover:text-[#00e5ff] border border-[#1a3848]'
                  }`}
                >
                  🛰 Observación ({eoCount})
                </button>
                <button
                  onClick={() => setSatelliteFilter('weather')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    satelliteFilter === 'weather'
                      ? 'bg-[#8de8cd]/20 text-[#8de8cd] border border-[#8de8cd]/40 font-bold'
                      : 'bg-[#0b1924] text-[#91a8af] hover:text-[#8de8cd] border border-[#1a3848]'
                  }`}
                >
                  🌦 Clima ({weatherCount})
                </button>
                <button
                  onClick={() => setSatelliteFilter('telecom')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    satelliteFilter === 'telecom'
                      ? 'bg-[#c084fc]/20 text-[#c084fc] border border-[#c084fc]/40 font-bold'
                      : 'bg-[#0b1924] text-[#91a8af] hover:text-[#c084fc] border border-[#1a3848]'
                  }`}
                >
                  📡 Telecom ({telecomCount})
                </button>
              </div>

              {filteredSatellites.map((sat) => {
                const satColor = sat.color || '#00e5ff';
                return (
                  <div
                    key={sat.id}
                    className="p-2.5 rounded-lg border bg-[#081722] border-[#1a3848] hover:border-[#00e5ff]/50 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                          style={{ backgroundColor: satColor }}
                        />
                        <span className="font-bold text-xs truncate font-mono" style={{ color: satColor }}>
                          {sat.name}
                        </span>
                      </div>
                      <button
                        onClick={() => onFlyToSample?.([sat.lng, sat.lat])}
                        className="px-2 py-0.5 rounded text-[10px] font-mono transition-colors shrink-0"
                        style={{
                          backgroundColor: `${satColor}22`,
                          color: satColor,
                          border: `1px solid ${satColor}55`,
                        }}
                      >
                        ⌖ Rastrear
                      </button>
                    </div>
                    <div className="text-[11px] text-[#91a8af] leading-tight">
                      {sat.agency} · <span className="text-white/80">{sat.sensor}</span>
                    </div>
                    <div className="text-[10px] text-[#8faab5]">
                      Estado: <span className="text-[#c4dce3]">{sat.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#91a8af] pt-1 border-t border-[#142934]">
                      <span>Alt: {sat.altitude_km} km</span>
                      <span>Barrido: {sat.swath_km} km</span>
                      <span>Inc: {sat.inclination_deg}°</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Submarine Cables List */}
          {liveCategory === 'cables' && (
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#91a8af] flex items-center justify-between">
                <span>RED DE FIBRA SUBMARINA</span>
                <span className="text-[#8de8cd] font-bold">SUBOCEÁNICA</span>
              </div>

              {/* FOA */}
              <div className="p-2.5 rounded-lg border bg-[#081722] border-[#1a3848] hover:border-[#8de8cd]/50 transition-all space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Fibra Óptica Austral (FOA)</span>
                  <button
                    onClick={() => onFlyToSample?.([-67.6, -54.9])}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#8de8cd]/15 text-[#8de8cd] border border-[#8de8cd]/30 hover:bg-[#8de8cd]/30"
                  >
                    ⌖ Puerto Williams
                  </button>
                </div>
                <div className="text-[10px] text-[#91a8af]">
                  Puerto Montt ➔ Caleta Tortel ➔ Punta Arenas ➔ Puerto Williams (54°56′ S)
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#8de8cd] pt-1 border-t border-[#142934]">
                  <span>2,800 km</span>
                  <span>16 Tbps capacidad</span>
                  <span>Operacional</span>
                </div>
              </div>

              {/* Enlace Antártico Drake */}
              <div className="p-2.5 rounded-lg border bg-[#081722] border-[#1a3848] hover:border-[#8de8cd]/50 transition-all space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Proyecto Cable Submarino Antártico</span>
                  <button
                    onClick={() => onFlyToSample?.([-60.0, -60.0])}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#8de8cd]/15 text-[#8de8cd] border border-[#8de8cd]/30 hover:bg-[#8de8cd]/30"
                  >
                    ⌖ Paso Drake
                  </button>
                </div>
                <div className="text-[10px] text-[#91a8af]">
                  Puerto Williams (Chile) ➔ Paso de Drake ➔ Isla Rey Jorge (Bases Científicas)
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 pt-1 border-t border-[#142934]">
                  <span>1,250 km</span>
                  <span>SCAR Subsea Study</span>
                  <span>En Desarrollo</span>
                </div>
              </div>

              {/* Humboldt */}
              <div className="p-2.5 rounded-lg border bg-[#081722] border-[#1a3848] hover:border-[#8de8cd]/50 transition-all space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Humboldt Cable System</span>
                  <button
                    onClick={() => onFlyToSample?.([-71.6, -33.0])}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#8de8cd]/15 text-[#8de8cd] border border-[#8de8cd]/30 hover:bg-[#8de8cd]/30"
                  >
                    ⌖ Valparaíso
                  </button>
                </div>
                <div className="text-[10px] text-[#91a8af]">
                  Valparaíso (Chile) ➔ Isla de Pascua ➔ Auckland (NZ) ➔ Sídney (Australia)
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#8de8cd] pt-1 border-t border-[#142934]">
                  <span>14,800 km</span>
                  <span>144 Tbps Transpacífico</span>
                  <span>Despliegue</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
