import { useState } from 'react';

export interface SensorPlatform {
  id: string;
  name: string;
  type: string;
  category: 'OCEAN' | 'ATMOSPHERE' | 'CRYOSPHERE' | 'SOLID_EARTH' | 'SPACE_WEATHER' | 'BIOLOGY';
  activeCount: number;
  dataCadence: string;
  primaryVariables: string[];
  openAccessNetwork: string;
  status: 'ONLINE' | 'SEASONAL' | 'ARCHIVED';
}

const SENSOR_PLATFORMS: SensorPlatform[] = [
  {
    id: 'argo-bgc',
    name: 'Flotadores Biogeoquímicos Argo (BGC-Argo / SOCCOM)',
    type: 'Perfiladores Autónomos Derivantes (0-2000m)',
    category: 'OCEAN',
    activeCount: 248,
    dataCadence: 'Cada 10 días por satélite Iridium',
    primaryVariables: ['Temperatura', 'Salinidad', 'Oxígeno Disuelto', 'Nitrato', 'pH', 'Clorofila-a'],
    openAccessNetwork: 'Global Argo Data Repository / SOOS',
    status: 'ONLINE',
  },
  {
    id: 'aws-meteorology',
    name: 'Estaciones Meteorológicas Automáticas (AWS Network)',
    type: 'Torres Superficiales Terrestres y Glaciales',
    category: 'ATMOSPHERE',
    activeCount: 132,
    dataCadence: 'Horario (Telemetría Satelital Argos / GOES)',
    primaryVariables: ['Temperatura de Aire', 'Presión Barométrica', 'Velocidad y Dirección de Viento', 'Radiación Neta'],
    openAccessNetwork: 'AMRC / University of Wisconsin-Madison',
    status: 'ONLINE',
  },
  {
    id: 'sentinel-sar',
    name: 'Constelación Satelital Copernicus Sentinel-1 (C-SAR)',
    type: 'Radar de Apertura Sintética Polar Heliosincrónico',
    category: 'CRYOSPHERE',
    activeCount: 2,
    dataCadence: 'Revisita cada 6 a 12 días',
    primaryVariables: ['Banquisa Marina', 'Velocidad de Hielo Glaciar', 'Zonas de Calving', 'Líneas de Apoyo'],
    openAccessNetwork: 'ESA Copernicus Open Access Hub',
    status: 'ONLINE',
  },
  {
    id: 'meop-biologgers',
    name: 'Bio-registradores Marinos Animales (MEOP CTD Tags)',
    type: 'Sensores Oceanográficos en Focas de Weddell y Elefantes Marinos',
    category: 'BIOLOGY',
    activeCount: 74,
    dataCadence: 'Transmisión cada emersión a superficie',
    primaryVariables: ['Temperatura Sub-hielo', 'Salinidad In-situ', 'Profundidad de Buceo', 'Comportamiento Forrajeo'],
    openAccessNetwork: 'Marine Mammals Exploring the Oceans Pole to Pole (MEOP)',
    status: 'ONLINE',
  },
  {
    id: 'earthscope-seismic',
    name: 'Red Sismológica Polar de Banda Ancha (EarthScope / ANET)',
    type: 'Sismómetros de Tres Componentes en Roca Firme y Manto de Hielo',
    category: 'SOLID_EARTH',
    activeCount: 56,
    dataCadence: 'Tiempo casi-real (40 Hz continua)',
    primaryVariables: ['Velocidad de Onda Sísmica', 'Temblores Glaciares (Cryoseisms)', 'Estructura Corteza Terrestre'],
    openAccessNetwork: 'IRIS / EarthScope Consortium',
    status: 'ONLINE',
  },
  {
    id: 'superdarn-radar',
    name: 'Radares Ionosféricos de Alta Frecuencia (SuperDARN)',
    type: 'Arreglos de Antenas HF Terrestres',
    category: 'SPACE_WEATHER',
    activeCount: 14,
    dataCadence: '1 minuto continuo',
    primaryVariables: ['Convección de Plasma Ionosférico', 'Vientos Termosféricos', 'Corrientes Aurorales'],
    openAccessNetwork: 'SuperDARN International Collaboration',
    status: 'ONLINE',
  },
  {
    id: 'research-vessels',
    name: 'Sensores de Buques Polares (Underway TSG & Sondador Multihaz)',
    type: 'Sistemas Embarcados de Investigación',
    category: 'OCEAN',
    activeCount: 22,
    dataCadence: 'Continua en navegación',
    primaryVariables: ['Batimetría de Alta Resolución', 'Termosalinografía', 'Acústica Pesquera Simrad EK80'],
    openAccessNetwork: 'Rolling Deck to Repository (R2R) / SCAR',
    status: 'ONLINE',
  },
  {
    id: 'smart-subsea-cables',
    name: 'Cables Submarinos SMART (Ciencia & Telecomunicaciones)',
    type: 'Repetidores de Fibra Óptica con Sensores Ambientales',
    category: 'OCEAN',
    activeCount: 3,
    dataCadence: 'Tiempo real en milisegundos',
    primaryVariables: ['Temperatura de Fondo', 'Presión Abisal (Tsunamis)', 'Aceleración Sísmica (OBS)'],
    openAccessNetwork: 'ITU/WMO/UNESCO-IOC SMART Cables Joint Task Force',
    status: 'ONLINE',
  },
];

export default function ExploreSensors() {
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  const filtered = SENSOR_PLATFORMS.filter(
    (s) => selectedCat === 'ALL' || s.category === selectedCat
  );

  return (
    <div className="space-y-6 text-[#edf5f5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* 1. Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#0c2233] to-[#081521] border border-[#213f4f] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#35c3c8] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#58d5e3] font-bold">
              OPEN SENSOR ATLAS · 20+ PLATAFORMAS POLARES
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Red Global de Sensores In-Situ, Autónomos y Satelitales
          </h2>
          <p className="text-xs text-[#b7c5d8] leading-relaxed">
            Atlas unificado de instrumental oceanográfico, atmosférico y geofísico que alimenta el gemelo digital de AMOH. Todos los flujos provienen de redes científicas de acceso abierto.
          </p>
        </div>

        <div className="shrink-0 p-3 rounded-2xl bg-[#06111a] border border-[#1b394b] text-center font-mono space-y-1">
          <div className="text-[9px] uppercase tracking-wider text-[#8faab5]">Nodos Monitoreados</div>
          <div className="text-2xl font-black text-white">550+</div>
          <div className="text-[9px] text-[#35c3c8] font-semibold">SOOS / WMO / SCAR</div>
        </div>
      </div>

      {/* 2. Category Filter */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#080e19] border border-[#1c2940] rounded-xl font-mono text-xs w-fit">
        {[
          { id: 'ALL', label: 'TODAS LAS PLATAFORMAS' },
          { id: 'OCEAN', label: 'OCÉANO PROFUNDO' },
          { id: 'CRYOSPHERE', label: 'HIELO & SATÉLITES' },
          { id: 'ATMOSPHERE', label: 'ATMÓSFERA' },
          { id: 'BIOLOGY', label: 'BIOLOGÍA & ANIMALES' },
          { id: 'SOLID_EARTH', label: 'SISMOLOGÍA' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedCat === cat.id
                ? 'bg-[#24344d] text-white shadow-sm'
                : 'text-[#8fa3bd] hover:text-white hover:bg-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. Sensor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((sensor) => (
          <div
            key={sensor.id}
            className="p-5 rounded-2xl bg-[#080e19] border border-[#1c2940] hover:border-[#35c3c8]/40 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#35c3c8]/10 text-[#35c3c8] border border-[#35c3c8]/30 font-bold">
                {sensor.category}
              </span>
              <span className="text-xs font-mono text-[#72e0b5] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#72e0b5] animate-pulse" />
                {sensor.activeCount} Nodos Activos
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">
                {sensor.name}
              </h3>
              <p className="text-xs text-[#8faab5] mt-0.5">
                {sensor.type}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#101626] border border-[#1c2940] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#8faab5]">Cadencia:</span>
                <span className="text-white font-medium">{sensor.dataCadence}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#8faab5]">Variables:</span>
                <span className="text-[#caf9f7] font-medium truncate max-w-[200px]">
                  {sensor.primaryVariables.join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-[11px] pt-1 border-t border-[#1c2940]">
                <span className="text-[#8faab5]">Red Abierta:</span>
                <span className="text-[#58d5e3] font-medium">{sensor.openAccessNetwork}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
