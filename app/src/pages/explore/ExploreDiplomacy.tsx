import { useState } from 'react';
import { VERIFIED_PEACE_LEDGER } from '../../lib/peace-ledger';
import { ExternalLink, Search, Calendar } from 'lucide-react';

export default function ExploreDiplomacy() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEntries = VERIFIED_PEACE_LEDGER.filter((entry) => {
    const matchesCat =
      selectedCategory === 'ALL' || entry.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.participatingNations.some((n) =>
        n.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 text-[#edf5f5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* 1. Scientific Neutrality & Peace Infrastructure Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#0c2233] to-[#081521] border border-[#213f4f] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#72e0b5] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#72e0b5] font-bold">
              TRATADO ANTÁRTICO DE 1959 · ARTÍCULO I & III
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Libro Mayor de Impacto para la Paz y Diplomacia Científica
          </h2>
          <p className="text-xs text-[#b7c5d8] leading-relaxed">
            Registro auditable y verificable de colaboración científica internacional, infraestructura compartida, expediciones conjuntas y asistencia marítima humanitaria (SAR). La paz antártica se sustenta en hechos verificables de cooperación abierta.
          </p>
        </div>

        <div className="shrink-0 p-3 rounded-2xl bg-[#06111a] border border-[#1b394b] text-center font-mono space-y-1">
          <div className="text-[9px] uppercase tracking-wider text-[#8faab5]">Cooperaciones Verificadas</div>
          <div className="text-2xl font-black text-white">{VERIFIED_PEACE_LEDGER.length} Casos</div>
          <div className="text-[9px] text-[#72e0b5] font-semibold">100% Auditables</div>
        </div>
      </div>

      {/* 2. Antarctica InSync Strategic Roadmap (2024–2030) */}
      <div className="p-5 rounded-2xl bg-[#081521] border border-[#1e3a4b] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#35c3c8]" />
            <h3 className="text-sm font-mono font-bold uppercase text-white tracking-wider">
              Hoja de Ruta Antarctica InSync (SCAR / SOOS 2024–2030)
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#35c3c8]/20 text-[#35c3c8] font-bold">
            DÉCADA DE LAS CIENCIAS OCEÁNICAS
          </span>
        </div>
        <p className="text-xs text-[#8faab5]">
          Marco de observación circumpolar sincronizado para cerrar brechas críticas de datos en el acoplamiento atmósfera-criosfera-océano austral:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-[#050e14] border border-[#1b3543] space-y-1">
            <div className="text-[10px] font-mono text-[#35c3c8] font-bold">FASE 1: 2024–2026</div>
            <div className="text-xs font-bold text-white">Preparación & Interoperabilidad</div>
            <p className="text-[11px] text-[#8faab5] leading-relaxed">
              Diseño de la red de observación, calibración cruzada de boyas autónomas y protocolos abiertos de datos entre naciones.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#050e14] border border-[#35c3c8]/40 space-y-1">
            <div className="text-[10px] font-mono text-[#72e0b5] font-bold">FASE 2: 2027–2029 (ACTIVA)</div>
            <div className="text-xs font-bold text-white">Campañas de Campo Circumpolares</div>
            <p className="text-[11px] text-[#8faab5] leading-relaxed">
              Despliegue sincrónico de rompehielos y buques oceanográficos (incluyendo ARC Simón Bolívar, Polarstern, Attenborough, Nuyina).
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#050e14] border border-[#1b3543] space-y-1">
            <div className="text-[10px] font-mono text-[#e085ff] font-bold">FASE 3: 2030+</div>
            <div className="text-xs font-bold text-white">Síntesis & Legado Abierto</div>
            <p className="text-[11px] text-[#8faab5] leading-relaxed">
              Asimilación de datos en modelos climáticos del IPCC y entrega del atlas digital abierto perpetuo del Océano Austral.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#080e19] border border-[#1c2940] rounded-xl font-mono text-xs w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'TODAS' },
            { id: 'JOINT_EXPEDITION', label: 'EXPEDICIONES CONJUNTAS' },
            { id: 'OPEN_SENSOR_ARRAY', label: 'SENSORES ABIERTOS' },
            { id: 'HUMAN_SECURITY_SAR', label: 'SEGURIDAD SAR' },
            { id: 'SHARED_DATASET', label: 'DATOS COMPARTIDOS' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#24344d] text-white shadow-sm'
                  : 'text-[#8fa3bd] hover:text-white hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#8fa3bd] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nación, buque..."
            className="w-full bg-[#080e19] border border-[#1c2940] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#8fa3bd] focus:outline-none focus:border-[#35c3c8] transition-colors"
          />
        </div>
      </div>

      {/* 3. Peace Ledger Entries Grid */}
      <div className="space-y-3">
        {filteredEntries.map((entry) => (
          <article
            key={entry.id}
            className="p-5 rounded-2xl bg-[#080e19] border border-[#1c2940] hover:border-[#35c3c8]/40 transition-all space-y-3 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#72e0b5]/15 text-[#72e0b5] border border-[#72e0b5]/30 font-bold">
                  {entry.category.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-mono text-[#8faab5]">
                  Verificado: {entry.verifiedDate}
                </span>
              </div>

              {/* Participating Nations Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono text-[#8faab5] mr-1">Naciones:</span>
                {entry.participatingNations.map((nat) => (
                  <span
                    key={nat}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#101626] border border-[#24344d] text-white"
                  >
                    {nat}
                  </span>
                ))}
              </div>
            </div>

            <h3 className="text-base font-bold text-white tracking-wide">
              {entry.title}
            </h3>

            <p className="text-xs text-[#b7c5d8] leading-relaxed">
              {entry.description}
            </p>

            <div className="pt-2 border-t border-[#1c2940] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-3 text-[#8faab5] text-[11px]">
                <span>Instituciones: <strong className="text-[#f5f8fc]">{entry.participatingInstitutions.join(', ')}</strong></span>
                {entry.vesselsOrStations && (
                  <span>· Buques/Bases: <strong className="text-[#35c3c8]">{entry.vesselsOrStations.join(', ')}</strong></span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#8faab5]">Fuente: {entry.verificationSource}</span>
                {entry.auditEvidenceUrl && (
                  <a
                    href={entry.auditEvidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#35c3c8] hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Auditar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
