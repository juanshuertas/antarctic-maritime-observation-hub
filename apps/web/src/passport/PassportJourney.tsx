import { Compass, Ship, Thermometer, Wind, MapPin } from 'lucide-react';

const JOURNEY_LEGS = [
  {
    leg: "Etapa 01",
    title: "Zarpe desde Punta Arenas hacia el Paso Drake",
    date: "2026-01-10 — 2026-01-13",
    vessel: "BIO Hespérides (A-33)",
    coords: "53°10'S, 70°54'W → 58°40'S, 63°20'W",
    temp: "6.4°C → 2.1°C",
    weather: "Viento SW 35 kts, Mar 6 (Ola 4.5m)",
    notes: "Cruce del Frente Polar Antártico. Caída abrupta de temperatura superficial del mar y salinidad."
  },
  {
    leg: "Etapa 02",
    title: "Llegada a Islas Shetland del Sur e Isla Rey Jorge",
    date: "2026-01-14 — 2026-01-20",
    vessel: "BIO Hespérides (A-33)",
    coords: "62°12'S, 58°58'W (Bahía Fildes)",
    temp: "0.8°C",
    weather: "Viento SE 18 kts, Visibilidad 10 mn",
    notes: "Atraco logístico en Base Frei y Base Escudero. Lanzamiento de planeador Slocum G3."
  },
  {
    leg: "Etapa 03",
    title: "Navegación del Estrecho de Gerlache y Canal Neumayer",
    date: "2026-01-21 — 2026-02-02",
    vessel: "BIO Hespérides (A-33)",
    coords: "64°30'S, 62°30'W",
    temp: "-0.4°C",
    weather: "Hielo flotante brash ice 3/10, Calma relativa",
    notes: "Muestreo acústico multifrecuencia EK80 en cardúmenes de krill. Visita a Palmer Station."
  },
  {
    leg: "Etapa 04",
    title: "Cruce del Círculo Polar Antártico hacia Bahía Margarita",
    date: "2026-02-03 — 2026-02-15",
    vessel: "R/V Laurence M. Gould",
    coords: "67°34'S, 68°08'W (Rothera)",
    temp: "-1.2°C",
    weather: "Viento E 42 kts, Nevisca ligera",
    notes: "Recuperación de fondeo oceanográfico de 600m de profundidad. Transferencia de muestras criogénicas."
  }
];

export default function PassportJourney() {
  return (
    <div className="space-y-8 font-mono">
      <div className="border-b border-[#1b3543] pb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Compass className="w-6 h-6 text-[#00e5ff]" />
          <span>Bitácora de Navegación Polar</span>
        </h1>
        <p className="text-xs text-[#8faab5] mt-1">
          Registro cronológico de singladuras, travesías del Paso Drake y estaciones de muestreo oceanográfico.
        </p>
      </div>

      <div className="relative border-l-2 border-[#1b3543] ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-8">
        {JOURNEY_LEGS.map((item) => (
          <div key={item.leg} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full border-4 border-[#070e17] bg-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.4)]" />

            <div className="p-5 sm:p-6 rounded-2xl border border-[#1b3543] bg-[#0a1520] group-hover:border-[#00e5ff]/50 transition-all space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#162734] pb-3">
                <div>
                  <span className="text-[10px] font-bold text-[#00e5ff] uppercase tracking-wider block">
                    {item.leg} · {item.date}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{item.title}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#72e0b5]">
                  <Ship className="w-4 h-4" />
                  <span>{item.vessel}</span>
                </div>
              </div>

              <p className="text-xs text-[#8faab5] leading-relaxed">
                {item.notes}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] text-[#6e8996] border-t border-[#122330]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#00e5ff]" />
                  <span className="truncate">{item.coords}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>SST: {item.temp}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-[#ffd9b8]" />
                  <span className="truncate">{item.weather}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
