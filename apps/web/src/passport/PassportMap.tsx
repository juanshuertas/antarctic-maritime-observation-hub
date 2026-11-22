import { useState } from 'react';
import { MapPin, Compass } from 'lucide-react';
import { INITIAL_STAMPS, INITIAL_EXPEDITIONS, type Stamp } from './passport-data';

export default function PassportMap() {
  const [selectedStation, setSelectedStation] = useState<Stamp>(INITIAL_STAMPS[0]);
  const [showExpeditionTracks, setShowExpeditionTracks] = useState(true);
  const [showObservations, setShowObservations] = useState(true);

  return (
    <div className="space-y-8 font-mono animate-fadeIn pb-12">
      {/* Header */}
      <div className="border-b border-[#1b384c] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#35c3c8] font-bold tracking-wider uppercase mb-1">
            <MapPin className="w-4 h-4" />
            <span>Huella Cartográfica Personal</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Mapa Polar de Estaciones & Rutas
          </h1>
          <p className="text-xs text-[#8faab5] mt-1 max-w-2xl">
            Despliegue geoespacial optimizado de las 6 estaciones auditadas, 2 campañas oceanográficas y 142 observaciones de campo en la Península Antártica.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl border border-[#214358] bg-[#0c1f2e] text-[#72e0b5] font-bold">
            EPSG:3031 Proyección Polar
          </span>
        </div>
      </div>

      {/* Control Pills */}
      <div className="flex items-center gap-3 text-xs">
        <label className="flex items-center gap-2 p-2 rounded-xl bg-[#091824] border border-[#1d3c4e] cursor-pointer text-[#cbd9df]">
          <input
            type="checkbox"
            checked={showExpeditionTracks}
            onChange={(e) => setShowExpeditionTracks(e.target.checked)}
            className="rounded accent-[#35c3c8]"
          />
          <span>Rutas de Expedición (2)</span>
        </label>

        <label className="flex items-center gap-2 p-2 rounded-xl bg-[#091824] border border-[#1d3c4e] cursor-pointer text-[#cbd9df]">
          <input
            type="checkbox"
            checked={showObservations}
            onChange={(e) => setShowObservations(e.target.checked)}
            className="rounded accent-[#35c3c8]"
          />
          <span>Observaciones de Campo (142)</span>
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Polar Stereographic Interactive Canvas (Cols 1–8) */}
        <div className="lg:col-span-8 rounded-3xl border border-[#1d3c4e] bg-[#07131e] p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#8faab5] mb-4">
            <span className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#35c3c8]" />
              <span>Estrecho de Bransfield · Paso Drake · Península Antártica</span>
            </span>
            <span className="text-[#72e0b5] font-semibold">6 BASES AUDITADAS</span>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full aspect-[4/3] flex items-center justify-center bg-[#050e17] rounded-2xl border border-[#162e3d] p-4">
            <svg viewBox="0 0 700 500" className="w-full h-full select-none">
              {/* Latitude Rings & Grid */}
              <circle cx="350" cy="500" r="480" fill="none" stroke="#162e3d" strokeWidth="1" strokeDasharray="4 6" />
              <text x="360" y="40" fill="#315f78" fontSize="10">60° S (Límite Tratado Antártico)</text>

              <circle cx="350" cy="500" r="380" fill="none" stroke="#1c3a4d" strokeWidth="1" />
              <text x="360" y="130" fill="#557d91" fontSize="10">63° S (Estrecho Bransfield)</text>

              <circle cx="350" cy="500" r="280" fill="none" stroke="#162e3d" strokeWidth="1" strokeDasharray="4 6" />
              <text x="360" y="230" fill="#315f78" fontSize="10">66°33' S (Círculo Polar)</text>

              <circle cx="350" cy="500" r="180" fill="none" stroke="#162e3d" strokeWidth="1" />
              <text x="360" y="330" fill="#315f78" fontSize="10">70° S (Bahía Margarita)</text>

              {/* Stylized Antarctic Peninsula Landmass Polygon */}
              <path
                d="M 280 120 
                   C 310 160, 330 200, 310 240
                   C 290 270, 270 300, 260 350
                   C 250 400, 280 440, 350 470
                   C 420 480, 480 430, 460 380
                   C 440 330, 400 300, 370 260
                   C 340 220, 360 170, 330 140
                   Z"
                fill="#0b2233"
                stroke="#35c3c8"
                strokeWidth="1.5"
                strokeLinejoin="round"
                opacity="0.7"
              />

              {/* South Shetland Islands */}
              <path
                d="M 330 100 Q 360 85 410 70"
                fill="none"
                stroke="#35c3c8"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.9"
              />

              {/* Expedition Tracks */}
              {showExpeditionTracks && (
                <g>
                  {/* Track 1: BIO Hespérides (Cyan dashed) */}
                  <path
                    d="M 240 40 L 340 90 L 370 120 L 330 160 L 300 210"
                    fill="none"
                    stroke="#35c3c8"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    opacity="0.8"
                  />
                  {/* Track 2: R/V Laurence M. Gould (Mint dashed) */}
                  <path
                    d="M 200 60 L 290 140 L 280 230 L 250 310"
                    fill="none"
                    stroke="#72e0b5"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    opacity="0.8"
                  />
                </g>
              )}

              {/* 142 Field Observation Density Points (Clustered along tracks) */}
              {showObservations && (
                <g fill="#72e0b5" opacity="0.6">
                  {Array.from({ length: 42 }).map((_, i) => (
                    <circle
                      key={i}
                      cx={280 + (i % 7) * 15 + Math.sin(i) * 20}
                      cy={110 + (i * 6) + Math.cos(i) * 15}
                      r="2"
                    />
                  ))}
                </g>
              )}

              {/* Station Markers */}
              {INITIAL_STAMPS.map((st) => {
                // Approximate coordinates on SVG viewport
                const coords: Record<string, [number, number]> = {
                  'st-frei': [355, 88],
                  'st-prat': [340, 95],
                  'st-ohiggins': [375, 115],
                  'st-palmer': [295, 195],
                  'st-vernadsky': [285, 220],
                  'st-rothera': [255, 305],
                };
                const [cx, cy] = coords[st.id] || [300, 200];
                const isSelected = selectedStation?.id === st.id;

                return (
                  <g
                    key={st.id}
                    className="cursor-pointer group"
                    onClick={() => setSelectedStation(st)}
                  >
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="14"
                        fill="none"
                        stroke="#35c3c8"
                        strokeWidth="1.5"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 7 : 5}
                      fill={isSelected ? '#35c3c8' : '#071926'}
                      stroke={isSelected ? '#ffffff' : '#72e0b5'}
                      strokeWidth={isSelected ? 2 : 1.5}
                      className="transition-transform group-hover:scale-125"
                    />
                    <text
                      x={cx + 10}
                      y={cy + 4}
                      fill={isSelected ? '#ffffff' : '#cbd9df'}
                      fontSize={isSelected ? '11' : '9'}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontFamily="monospace"
                    >
                      {st.stationName.replace('Base ', '').replace(' Research Station', '')}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#6c8a99] mt-3">
            <span>Ruta: Drake → Estrecho Gerlache → Bahía Margarita</span>
            <span className="text-[#35c3c8]">12,480 MN Navegadas</span>
          </div>
        </div>

        {/* Selected Station Sidebar (Cols 9–12) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-[#091824] border border-[#1d3c4e] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1a384b] pb-3">
              <span className="text-xs font-bold text-[#35c3c8] uppercase tracking-wider">
                Estación Seleccionada
              </span>
              <span className="text-2xl">{selectedStation.flag}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h3 className="text-base font-bold text-white">{selectedStation.stationName}</h3>
                <span className="text-[11px] text-[#72e0b5]">Código: {selectedStation.code}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#06121c] border border-[#162e3d] space-y-1">
                <span className="text-[#6c8a99] text-[10px] uppercase block">Coordenadas Exactas</span>
                <span className="text-white font-mono">
                  {selectedStation.lat}° S · {selectedStation.lng}° W
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#06121c] border border-[#162e3d] space-y-1">
                <span className="text-[#6c8a99] text-[10px] uppercase block">Oficial / Comandante</span>
                <span className="text-white">{selectedStation.officer}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0e2230] border border-[#1d3c4e] space-y-1">
                <span className="text-[#6c8a99] text-[10px] uppercase block">Bitácora de Campo</span>
                <p className="text-[#cbd9df] text-xs italic">
                  «{selectedStation.notes}»
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#091824] border border-[#1d3c4e] text-xs text-[#8faab5] space-y-2">
            <span className="font-bold text-white block">Campañas Registradas:</span>
            {INITIAL_EXPEDITIONS.map((exp) => (
              <div key={exp.id} className="p-2 rounded-lg bg-[#06121c] border border-[#162d3d] space-y-0.5">
                <div className="text-[#35c3c8] font-bold">{exp.code}</div>
                <div className="text-[10px] text-[#cbd9df]">{exp.vessel}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
