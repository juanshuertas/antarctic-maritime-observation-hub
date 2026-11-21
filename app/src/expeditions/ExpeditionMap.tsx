import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  MapPin,
  Radio,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import {
  SEED_FIELD_OBSERVATIONS,
  type FieldObservation,
} from './expeditions-data';
import PB124RouteMap from './PB124RouteMap';
import PB124VoyageTimeline from './PB124VoyageTimeline';

export default function ExpeditionMap(): ReactNode {
  const { expeditionId = '' } = useParams();
  const isPeaceBoat = expeditionId === 'PB124-OLEA-2026';
  const [activeLayers, setActiveLayers] = useState({
    corridor: true,
    sessions: true,
    ais: true,
    satellite: true,
    observations: true,
  });

  const [selectedObs, setSelectedObs] = useState<FieldObservation | null>(
    SEED_FIELD_OBSERVATIONS[0] ?? null
  );

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  if (isPeaceBoat) {
    return (
      <div className="space-y-5 font-mono">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 border-b border-[#1b3543] pb-4">
          <div>
            <div className="text-[9px] uppercase tracking-[0.18em] text-[#6f919d]">PB124-OLEA-2026</div>
            <h2 className="mt-1 text-xl font-bold text-white">Global Voyage · Route Intelligence Map</h2>
            <p className="mt-1 text-xs text-[#8faab5]">
              Peace Boat published itinerary + OLEA methodological guidance zones.
            </p>
          </div>
          <div className="rounded-xl border border-[#6b5226] bg-[#2a1d0b] px-3 py-2 text-[10px] text-[#f0b35a]">
            OFFICIAL_ITINERARY_REFERENCE · NOT LIVE TRACK
          </div>
        </div>
        <PB124VoyageTimeline variant="map" />
        <PB124RouteMap variant="full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 rounded-2xl border border-[#183140] bg-[#071722] p-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#6f919d]">
              Route intelligence rule
            </div>
            <div className="mt-1 text-xs font-bold text-white">No zone-completion score</div>
            <p className="mt-1 text-[10px] leading-relaxed text-[#819da8]">
              The timeline shows the published voyage schedule only. OLEA does not require observations in
              every zone and does not infer actual vessel position from the itinerary.
            </p>
          </div>
          <div className="rounded-2xl border border-[#584a28] bg-[#20190c] p-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#f0b35a]">
              Meri field burden
            </div>
            <div className="mt-1 text-xs font-bold text-white">Keep it lightweight</div>
            <p className="mt-1 text-[10px] leading-relaxed text-[#c5b998]">
              Phone-first · no ship systems · no background tracking · 3–5 good observations total.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Top Controls & Restraint Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1b3543] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#00e5ff]" />
            <span>Mapa del Corredor Náutico Antártico</span>
          </h2>
          <p className="text-xs text-[#8faab5] mt-0.5">
            Península Antártica Occidental · Proyección Estereográfica Polar WGS84
          </p>
        </div>

        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { key: 'corridor', label: 'Corredor', color: '#00e5ff' },
            { key: 'sessions', label: 'Sesiones', color: '#72e0b5' },
            { key: 'ais', label: 'Tráfico AIS', color: '#38bdf8' },
            { key: 'satellite', label: 'Huellas SAR', color: '#f59e0b' },
            { key: 'observations', label: 'Observaciones', color: '#ec4899' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => toggleLayer(item.key as any)}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                activeLayers[item.key as keyof typeof activeLayers]
                  ? 'bg-[#0e2536] border-[#00e5ff] text-white shadow-sm'
                  : 'bg-[#07141e] border-[#162a38] text-[#6b8594] hover:text-white'
              }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5"
                style={{
                  backgroundColor: activeLayers[item.key as keyof typeof activeLayers]
                    ? item.color
                    : '#475569',
                }}
              />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Canvas and Detail Drawer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Interactive Polar Map Canvas (8 Cols) */}
        <div className="lg:col-span-8 bg-[#040d14] rounded-3xl border border-[#1b3543] p-6 relative overflow-hidden flex flex-col justify-between min-h-[520px]">
          {/* Subtle Grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-map-exp" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#00e5ff" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-map-exp)" />
            </svg>
          </div>

          {/* Polar Vector Graphic */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 600 500"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Latitude rings */}
            <circle cx="300" cy="250" r="230" fill="none" stroke="#142836" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="300" cy="250" r="150" fill="none" stroke="#142836" strokeWidth="1" strokeDasharray="3 3" />

            {/* Peninsula Coastline Schematic */}
            <path
              d="M 520 40 Q 450 140 370 210 T 270 310 T 180 400 L 140 460"
              fill="none"
              stroke="#35c3c8"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Corridor Buffer Zone */}
            {activeLayers.corridor && (
              <path
                d="M 535 30 Q 465 130 385 200 T 285 300 T 195 390 L 155 450"
                fill="none"
                stroke="#00e5ff"
                strokeWidth="28"
                opacity="0.1"
                strokeLinecap="round"
              />
            )}

            {/* Satellite Sentinel-1 SAR Footprint Polygons */}
            {activeLayers.satellite && (
              <g opacity="0.4">
                <polygon
                  points="340,160 430,130 400,240 310,270"
                  fill="#f59e0b"
                  fillOpacity="0.15"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <text x="350" y="150" fill="#f59e0b" fontSize="10" fontFamily="monospace">
                  Sentinel-1A SAR IW (Latency: 2.8h)
                </text>
              </g>
            )}

            {/* AIS Trajectories */}
            {activeLayers.ais && (
              <g stroke="#38bdf8" strokeWidth="1.5" opacity="0.6">
                <path d="M 510 50 L 460 120 L 410 180 L 340 230" strokeDasharray="5 3" fill="none" />
                <path d="M 330 240 L 260 320 L 190 390" strokeDasharray="5 3" fill="none" />
              </g>
            )}
          </svg>

          {/* Interactive Observation Pins on Canvas */}
          <div className="relative z-10 flex-1 flex flex-col justify-between pointer-events-auto">
            <div className="flex items-center justify-between text-xs text-[#8faab5]">
              <span className="px-3 py-1 rounded-xl bg-[#071722]/90 border border-[#1b3543] text-[#72e0b5] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>62°S – 68°S · Sector 48.1 (CCAMLR)</span>
              </span>

              <span className="px-3 py-1 rounded-xl bg-[#071722]/90 border border-[#1b3543] text-white">
                Escala 1:1,500,000
              </span>
            </div>

            {/* Clickable Observation Markers */}
            <div className="my-auto space-y-3 py-12 max-w-sm">
              <span className="text-[10px] uppercase font-bold text-[#8faab5] block">
                Puntos de Campo en la Campaña (Haz clic para inspeccionar):
              </span>
              <div className="flex flex-col gap-2">
                {SEED_FIELD_OBSERVATIONS.length === 0 && (
                  <p className="text-[11px] text-[#8faab5] font-sans">
                    Sin observaciones de campo: la propuesta aún no tiene viaje ejecutado.
                  </p>
                )}
                {SEED_FIELD_OBSERVATIONS.map((obs) => (
                  <button
                    key={obs.observationId}
                    onClick={() => setSelectedObs(obs)}
                    className={`p-3 rounded-2xl text-left transition-all border text-xs flex items-center justify-between ${
                      selectedObs?.observationId === obs.observationId
                        ? 'bg-[#0d273a] border-[#00e5ff] text-white shadow-lg'
                        : 'bg-[#071824]/90 border-[#152e3e] text-[#8faab5] hover:text-white'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-bold truncate text-white">{obs.title}</div>
                      <div className="text-[10px] text-[#72e0b5] flex items-center gap-2 mt-0.5">
                        <span>{obs.observedAtUtc.slice(11, 16)} UTC</span>
                        <span>·</span>
                        <span className="text-[#00e5ff]">{obs.realityLabel}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00e5ff]/20 text-[#00e5ff]">
                      ±{obs.accuracyMeters}m
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Restraint Notice at Bottom */}
            <div className="p-3 rounded-2xl bg-[#091824]/90 border border-[#1b3543] text-[11px] text-[#f59e0b] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Aviso de Integridad:</strong> La ausencia de traza AIS no confirma ausencia de buques. Las escenas Sentinel-1 presentan latencias de 2 a 4 horas.
              </span>
            </div>
          </div>
        </div>

        {/* Detail Inspection Drawer (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedObs ? (
            <div className="p-6 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#142836] pb-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30">
                  {selectedObs.realityLabel}
                </span>
                <span className="text-xs text-[#72e0b5] font-bold">
                  {selectedObs.reviewStatus}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white font-sans leading-snug">
                  {selectedObs.title}
                </h3>
                <p className="text-xs text-[#8faab5] mt-1">
                  Observador: <strong className="text-white">{selectedObs.observerName}</strong> ({selectedObs.observerRole})
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#050f16] border border-[#142836] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#8faab5]">Coordenadas:</span>
                  <span className="text-white font-bold">{selectedObs.lat}, {selectedObs.lon}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8faab5]">Precisión GPS:</span>
                  <span className="text-[#72e0b5] font-bold">&plusmn;{selectedObs.accuracyMeters} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8faab5]">Fecha y Hora:</span>
                  <span className="text-white">{selectedObs.observedAtUtc}</span>
                </div>
                {selectedObs.speedKnots && (
                  <div className="flex justify-between">
                    <span className="text-[#8faab5]">Velocidad Estimada:</span>
                    <span className="text-[#38bdf8] font-bold">{selectedObs.speedKnots} nudos</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-[#b0c4cf] font-sans leading-relaxed border-l-2 border-[#1e3c50] pl-3 py-1">
                {selectedObs.notes}
              </div>

              <div className="pt-2 border-t border-[#142836] space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#8faab5] block">
                  Procedencia Criptográfica
                </span>
                <div className="p-2.5 rounded-xl bg-[#050e14] border border-[#132835] text-[10px] text-[#6b8896] break-all font-mono">
                  SHA256: {selectedObs.provenance.signedSha256}
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to={`/map?lat=${selectedObs.lat}&lon=${selectedObs.lon}&zoom=8`}
                  className="w-full py-2.5 rounded-xl bg-[#00e5ff] text-[#050e14] font-bold text-xs hover:bg-[#38bdf8] transition-all text-center flex items-center justify-center gap-2 shadow-md shadow-[#00e5ff]/20"
                >
                  <Eye className="w-4 h-4" />
                  <span>ABRIR EN LIVE LENS</span>
                </Link>

                <Link
                  to={`/expeditions/${selectedObs.expeditionId}/review`}
                  className="w-full py-2 rounded-xl bg-[#0c1f2d] border border-[#213f4f] text-[#8faab5] hover:text-white text-xs transition-colors text-center"
                >
                  Ver en Cola de Revisión
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl border border-[#1b3543] bg-[#081724] text-center text-xs text-[#8faab5]">
              Selecciona una observación para ver su detalle de campo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
