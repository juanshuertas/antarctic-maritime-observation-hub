import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MenuSheet from '../components/MenuSheet';
import CommandPalette from '../components/CommandPalette';
import { ArrowRight, Calendar, Compass } from 'lucide-react';

export default function BriefingPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OCEAN' | 'CLIMATE' | 'OPPORTUNITIES' | 'POLICY'>('ALL');
  const [menuSheetOpen, setMenuSheetOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const utcMonth = String(now.getUTCMonth() + 1).padStart(2, '0');
  const sitrepPeriod = `SITREP ${utcYear}.${utcMonth}`;
  const formattedMonthYear = new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(now);
  const capitalizedMonthYear = formattedMonthYear.charAt(0).toUpperCase() + formattedMonthYear.slice(1);

  return (
    <div
      className="min-h-screen bg-[#050e14] text-[#edf5f5] flex flex-col select-none"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* 1. Header with updated simple top nav */}
      <Header
        activeView="briefing"
        onToggleMenu={() => setMenuSheetOpen(true)}
        onOpenSearch={() => setCommandPaletteOpen(true)}
        onViewChange={(view) => {
          if (view === 'map') navigate('/observatory');
          else if (view === 'briefing') navigate('/briefing');
          else if (view === 'expeditions') navigate('/expeditions');
          else if (view === 'passport') navigate('/passport');
          else if (view === 'explore') navigate('/explore');
          else if (view === 'stories') navigate('/stories');
        }}
        region="Península Antártica & Océano Austral"
        period={sitrepPeriod}
      />

      {/* 2. Editorial Hero Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title Bar & Filter Pills */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1c2940]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#35c3c8] animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#58d5e3] font-bold">
                SITUATION ROOM · INTELLIGENCE BRIEF
              </span>
            </div>
            <h1
              className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Antarctica Today
            </h1>
            <p className="text-sm text-[#8faab5] mt-1 max-w-2xl">
              Análisis editorial sintético de las dinámicas oceanográficas, criosféricas, científicas y geopolíticas que configuran el Océano Austral en este momento.
            </p>
          </div>

          {/* Quick Filter Segment */}
          <div className="flex items-center gap-1.5 p-1 bg-[#080e19] border border-[#1c2940] rounded-xl font-mono text-xs">
            {(['ALL', 'OCEAN', 'CLIMATE', 'OPPORTUNITIES', 'POLICY'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeFilter === filter
                    ? 'bg-[#24344d] text-white shadow-sm'
                    : 'text-[#8fa3bd] hover:text-white hover:bg-white/5'
                }`}
              >
                {filter === 'ALL' && 'TODOS'}
                {filter === 'OCEAN' && 'OCÉANO'}
                {filter === 'CLIMATE' && 'CLIMA'}
                {filter === 'OPPORTUNITIES' && 'FONDOS'}
                {filter === 'POLICY' && 'DIPLOMACIA'}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Hero Editorial Card: ANTARCTICA TODAY (Card 1) */}
        {(activeFilter === 'ALL' || activeFilter === 'OCEAN' || activeFilter === 'CLIMATE') && (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c2233] via-[#091824] to-[#061019] border border-[#213f4f] p-6 sm:p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#35c3c8]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-4 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-[#35c3c8]/20 text-[#35c3c8] border border-[#35c3c8]/40 font-bold uppercase tracking-wider">
                    ESTADO GENERAL DEL SISTEMA
                  </span>
                  <span className="text-[#8faab5] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {capitalizedMonthYear}
                  </span>
                  <span className="text-[#8faab5]">·</span>
                  <span className="text-[#72e0b5]">10 buques activos en Península</span>
                </div>

                <h2
                  className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Mínimo Estacional de Hielo Marino y Transición a la Circulación Polar de Otoño
                </h2>

                <p className="text-sm text-[#b7c5d8] leading-relaxed">
                  Las observaciones satelitales (Sentinel-1 SAR y AMSR2) confirman que la banquisa antártica ha alcanzado su mínimo estacional en el Mar de Bellingshausen y Mar de Amundsen. La flota de investigación polar y turismo se concentra en el Estrecho de Bransfield y Canal Lemaire aprovechando aguas abiertas antes de los primeros frentes fríos extratropicales.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => navigate('/observatory')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#35c3c8] text-[#06141c] font-bold text-xs hover:bg-[#58d5e3] transition-colors shadow-lg"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Ver flota y banquisa en el Observatorio</span>
                  </button>
                  <span className="text-xs font-mono text-[#8faab5]">
                    Sensor satelital: Sentinel-1 / VIIRS GIBS
                  </span>
                </div>
              </div>

              {/* Key Indicators Panel */}
              <div className="w-full lg:w-72 shrink-0 p-4 rounded-2xl bg-[#06111a]/80 border border-[#1b394b] space-y-3 font-mono">
                <div className="text-[10px] uppercase font-bold text-[#8faab5] tracking-wider pb-1 border-b border-[#1b394b]">
                  Indicadores Clave en Tiempo Real
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8faab5]">Extensión Hielo:</span>
                  <span className="text-white font-bold">2.18 M km²</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8faab5]">Tráfico AIS Drake:</span>
                  <span className="text-[#35c3c8] font-bold">14 barcos / 48h</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8faab5]">Anomalía Térmica:</span>
                  <span className="text-[#ff827d] font-bold">+1.4°C (SST)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8faab5]">Boyas Argo Activas:</span>
                  <span className="text-[#a995ff] font-bold">248 perfiles</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. Editorial Cards Grid (Cards 2 - 7) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CARD 2: WHAT CHANGED IN THE LAST 24-72H */}
          <article className="rounded-2xl bg-[#080e19] border border-[#1c2940] hover:border-[#35c3c8]/50 transition-all p-5 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-[#35c3c8]/10 text-[#35c3c8] border border-[#35c3c8]/30 font-semibold">
                  ÚLTIMAS 72 HORAS
                </span>
                <span className="text-[#8faab5]">Evento Dinámico</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#35c3c8] transition-colors">
                Desprendimiento de Bloque Glaciar en Bahía Margarita
              </h3>
              <p className="text-xs text-[#b7c5d8] leading-relaxed">
                El sensor Sentinel-1A detectó una fractura superficial en el glaciar George VI con un fragmento flotante de 12 km². El aviso a navegantes fue transmitido por NAVAREA VI para evitar colisiones en la ruta sur de Rothera.
              </p>
            </div>
            <div className="pt-4 border-t border-[#1c2940] mt-4 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-[#72e0b5]">Alerta de Peligro a la Navegación</span>
              <button
                onClick={() => navigate('/observatory')}
                className="text-[#35c3c8] hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                <span>Inspeccionar</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </article>

          {/* CARD 3: WHAT IS COMING */}
          <article className="rounded-2xl bg-[#080e19] border border-[#1c2940] hover:border-[#4da8ff]/50 transition-all p-5 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-[#4da8ff]/10 text-[#4da8ff] border border-[#4da8ff]/30 font-semibold">
                  PRÓXIMA VENTANA
                </span>
                <span className="text-[#8faab5]">Pronóstico 7 Días</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#4da8ff] transition-colors">
                Ciclogénesis Profunda en el Pasaje de Drake
              </h3>
              <p className="text-xs text-[#b7c5d8] leading-relaxed">
                El modelo GFS y ERA5 proyectan un sistema de baja presión con vientos del oeste superiores a 55 nudos y olas significativas de 9.5 metros en las próximas 48 a 72 horas. Varios cruceros han ajustado su recalada a Isla Rey Jorge.
              </p>
            </div>
            <div className="pt-4 border-t border-[#1c2940] mt-4 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-[#ff827d]">Estado de Mar 8 (Muy Gruesa)</span>
              <button
                onClick={() => navigate('/observatory')}
                className="text-[#4da8ff] hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                <span>Ver Vientos</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </article>

          {/* CARD 4: PROJECT TO WATCH */}
          <article className="rounded-2xl bg-[#080e19] border border-[#1c2940] hover:border-[#72e0b5]/50 transition-all p-5 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-[#72e0b5]/10 text-[#72e0b5] border border-[#72e0b5]/30 font-semibold">
                  PROYECTO CIENTÍFICO
                </span>
                <span className="text-[#8faab5]">SCAR / COMNAP</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#72e0b5] transition-colors">
                COMNAP RINGS: Cartografía Aerotransportada del Margen Costero
              </h3>
              <p className="text-xs text-[#b7c5d8] leading-relaxed">
                Iniciativa internacional para completar la cobertura aerogeofísica (radar de penetración de hielo y gravimetría) de la línea de apoyo donde se calcula la descarga de hielo hacia el océano.
              </p>
            </div>
            <div className="pt-4 border-t border-[#1c2940] mt-4 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-[#8faab5]">SDG 13 · SDG 17</span>
              <button
                onClick={() => navigate('/explore')}
                className="text-[#72e0b5] hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                <span>Ficha Proyecto</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </article>

          {/* CARD 5: OPPORTUNITY RADAR */}
          <article className="rounded-2xl bg-[#080e19] border border-[#1c2940] hover:border-[#fde047]/50 transition-all p-5 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-[#fde047]/10 text-[#fde047] border border-[#fde047]/30 font-semibold">
                  OPORTUNIDAD ACTIVA
                </span>
                <span className="text-[#8faab5]">Cierra 30 Abril</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#fde047] transition-colors">
                SCAR Fellowship Scheme 2026 para Investigadores Emergentes
              </h3>
              <p className="text-xs text-[#b7c5d8] leading-relaxed">
                Becas de hasta $15,000 USD para estancias cortas de investigación internacional en un país miembro de SCAR. Abierto para doctorandos y postdoctorales de países con programas emergentes.
              </p>
            </div>
            <div className="pt-4 border-t border-[#1c2940] mt-4 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-[#fde047] font-semibold">$15,000 USD · SCAR / COMNAP</span>
              <button
                onClick={() => navigate('/opportunities')}
                className="text-[#fde047] hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                <span>Ver Elegibilidad</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </article>

          {/* CARD 6: DATA GAP ALERT */}
          <article className="rounded-2xl bg-[#080e19] border border-[#1c2940] hover:border-[#ff827d]/50 transition-all p-5 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-[#ff827d]/10 text-[#ff827d] border border-[#ff827d]/30 font-semibold">
                  VACÍO DE INFORMACIÓN
                </span>
                <span className="text-[#8faab5]">Prioridad Alta</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#ff827d] transition-colors">
                Ausencia de Registros CTD en el Talud Continental de Mar de Ross Oriental
              </h3>
              <p className="text-xs text-[#b7c5d8] leading-relaxed">
                Más de 420 días sin perfiles salinos y de temperatura in-situ en el sector 150°W a 160°W a profundidades mayores a 800m. Se solicita a cruceros con sonar multihaz y boyas XBT coordinar lances de oportunidad.
              </p>
            </div>
            <div className="pt-4 border-t border-[#1c2940] mt-4 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-[#8faab5]">SOOS Southern Ocean Portal</span>
              <button
                onClick={() => navigate('/expeditions')}
                className="text-[#ff827d] hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                <span>Misiones de Campo</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </article>

          {/* CARD 7: DECISION BRIEFS (OCEANOPOLITICS) */}
          <article className="rounded-2xl bg-[#080e19] border border-[#1c2940] hover:border-[#a995ff]/50 transition-all p-5 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-[#a995ff]/10 text-[#a995ff] border border-[#a995ff]/30 font-semibold">
                  DECISION BRIEF · TRATADO
                </span>
                <span className="text-[#8faab5]">ATCM XLVII</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#a995ff] transition-colors">
                Marco Regulatorio para Turismo Aéreo de Desembarco Inmediato
              </h3>
              <p className="text-xs text-[#b7c5d8] leading-relaxed">
                Documento de análisis de opciones sobre la propuesta de límites operacionales a vuelos comerciales sin pernocta en pistas de hielo azul, evaluando riesgos de bioseguridad frente a beneficios logísticos.
              </p>
            </div>
            <div className="pt-4 border-t border-[#1c2940] mt-4 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-[#a995ff]">Preserva Autoridad Humana</span>
              <button
                onClick={() => navigate('/context')}
                className="text-[#a995ff] hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                <span>Leer Brief</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </article>
        </div>
      </main>

      <MenuSheet
        isOpen={menuSheetOpen}
        onClose={() => setMenuSheetOpen(false)}
      />

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
