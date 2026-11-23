import { useState } from 'react';
import { ExternalLink, Search, Sparkles } from 'lucide-react';

export interface SCARAbstract {
  id: string;
  posterNumber?: string;
  title: string;
  authors: string[];
  institutions: string[];
  countries: string[];
  scientificGroup: 'GEOSCIENCES' | 'LIFE_SCIENCES' | 'PHYSICAL_SCIENCES' | 'HUMANITIES';
  sourceAbstract: string;
  aiSummary: string;
  keywords: string[];
  linkedDatasets: string[];
  sdgLinks: number[];
  officialUrl?: string;
}

const SAMPLE_SCAR_ABSTRACTS: SCARAbstract[] = [
  {
    id: 'scar-2026-1820',
    posterNumber: '1820',
    title: 'Antarctic Maritime Observation Hub (AMOH): A Digital Twin for Scientific Synthesis, Field Feedback, and Peace Infrastructure',
    authors: ['Juan S. Huertas', 'AMOH Collaborative Research Group'],
    institutions: ['Antarctic Maritime Observation Hub Initiative', 'Comisión Colombiana del Océano (CCO)'],
    countries: ['Colombia', 'Chile'],
    scientificGroup: 'GEOSCIENCES',
    sourceAbstract:
      'The Antarctic Maritime Observation Hub (AMOH) integrates real-time AIS maritime telemetry, NASA GIBS satellite reflectance, Copernicus Sentinel radar imagery, in-situ CTD oceanographic profiling, and the SCAR research knowledge graph. Built with MapLibre GL and modern distributed edge architecture, it serves as an open peace infrastructure under Article III of the Antarctic Treaty, facilitating cross-border data verification and expedition matchup.',
    aiSummary:
      'AMOH combina gemelos digitales cartográficos, seguimiento de buques en vivo y síntesis de datos satelitales para acelerar la colaboración científica abierta e interoperable en la Península Antártica.',
    keywords: ['Digital Twin', 'MapLibre', 'AIS Tracking', 'Sentinel-1', 'Antarctic Treaty', 'Science Diplomacy'],
    linkedDatasets: ['SCAR ADD Coastline', 'Quantarctica 3', 'SOOS Argo BGC', 'Global Fishing Watch'],
    sdgLinks: [9, 13, 14, 16, 17],
    officialUrl: 'https://virtual.oxfordabstracts.com/event/75327/poster-gallery/grid?sort=titles&current=1820',
  },
  {
    id: 'scar-2026-0412',
    title: 'Warm Circumpolar Deep Water Intrusion and Basal Melt Under Larsen C Ice Shelf',
    authors: ['Autoría de ejemplo (dato demo)'],
    institutions: ['Alfred Wegener Institute (AWI)', 'Norwegian Polar Institute'],
    countries: ['Alemania', 'Noruega'],
    scientificGroup: 'PHYSICAL_SCIENCES',
    sourceAbstract:
      'Moored acoustic Doppler current profilers (ADCP) and thermal microstructure probes moored along the continental shelf break in the northwestern Weddell Sea reveal intermittent pulses of Warm Circumpolar Deep Water (CDW) spilling onto the continental shelf during winter wind-stress anomalies, altering basal melt rates beneath the outer cavity of Larsen C.',
    aiSummary:
      'Pulsos invernales de agua cálida profunda acceden a la cavidad submarina de la plataforma Larsen C, impulsados por anomalías del viento en el borde continental del Mar de Weddell.',
    keywords: ['Larsen C', 'CDW Intrusion', 'Ocean Glaciology', 'Weddell Sea'],
    linkedDatasets: ['AWI Mooring Array W1', 'CryoSat-2 Basal Elevation'],
    sdgLinks: [13, 14],
  },
  {
    id: 'scar-2026-0891',
    title: 'Trophic Ecology and Foraging Plasticity of Humpback Whales (Megaptera novaeangliae) in the Gerlache Strait',
    authors: ['Dra. Carolina Méndez', 'Dr. Thomas Hayes'],
    institutions: ['Instituto Antártico Chileno (INACH)', 'Scripps Institution of Oceanography'],
    countries: ['Chile', 'Estados Unidos'],
    scientificGroup: 'LIFE_SCIENCES',
    sourceAbstract:
      'Suction-cup video and acoustic biologging tags (CATS) deployed on 38 humpback whales across three consecutive austral summers in the Gerlache Strait quantify feeding lunges relative to krill swarm densities measured by scientific echo sounders.',
    aiSummary:
      'Los bio-registradores acústicos demuestran que las ballenas jorobadas optimizan su gasto energético alimentándose exclusivamente en enjambres densos de krill superiores a 150 g/m³.',
    keywords: ['Cetaceans', 'Gerlache Strait', 'Krill Biomass', 'MEOP Biologging'],
    linkedDatasets: ['OBIS SEAMAP Cetacean Sightings', 'Simrad EK80 Acoustics'],
    sdgLinks: [14, 15],
  },
];

export default function ExploreSCAR() {
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = SAMPLE_SCAR_ABSTRACTS.filter((a) => {
    const matchesGroup = selectedGroup === 'ALL' || a.scientificGroup === selectedGroup;
    const matchesSearch =
      searchQuery.trim() === '' ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.authors.some((au) => au.toLowerCase().includes(searchQuery.toLowerCase())) ||
      a.keywords.some((kw) => kw.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="space-y-6 text-[#edf5f5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* 1. Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#0c2233] to-[#081521] border border-[#213f4f] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#35c3c8] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#58d5e3] font-bold">
              SCAR OPEN SCIENCE CONFERENCE 2026 · RESEARCH KNOWLEDGE GRAPH
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Grafo de Investigaciones Científicas Antárticas (SCAR OSC)
          </h2>
          <p className="text-xs text-[#b7c5d8] leading-relaxed">
            Exploración estructurada de resúmenes de investigación pública del Scientific Committee on Antarctic Research (SCAR). Separa rigurosamente el texto original del autor y la síntesis generada por IA.
          </p>
        </div>

        {/* Featured Poster 1820 */}
        <a
          href="https://virtual.oxfordabstracts.com/event/75327/poster-gallery/grid?sort=titles&current=1820"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 p-3 rounded-2xl bg-[#06111a] border border-[#35c3c8]/50 hover:border-[#58d5e3] transition-all text-left font-mono space-y-1 group"
        >
          <div className="flex items-center justify-between text-[10px] text-[#35c3c8] font-bold">
            <span>PÓSTER OFICIAL #1820</span>
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-xs font-bold text-white">AMOH en SCAR 2026</div>
          <div className="text-[9px] text-[#8faab5]">Juan S. Huertas · Galería Virtual ↗</div>
        </a>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#080e19] border border-[#1c2940] rounded-xl font-mono text-xs w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'TODOS' },
            { id: 'GEOSCIENCES', label: 'GEOCIENCIAS' },
            { id: 'PHYSICAL_SCIENCES', label: 'CIENCIAS FÍSICAS' },
            { id: 'LIFE_SCIENCES', label: 'CIENCIAS DE LA VIDA' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedGroup(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                selectedGroup === cat.id
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
            placeholder="Buscar por tema, autor..."
            className="w-full bg-[#080e19] border border-[#1c2940] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#8fa3bd] focus:outline-none focus:border-[#35c3c8] transition-colors"
          />
        </div>
      </div>

      {/* 3. Abstracts List */}
      <div className="space-y-4">
        {filtered.map((abstract) => (
          <article
            key={abstract.id}
            className="p-5 rounded-3xl bg-[#080e19] border border-[#1c2940] hover:border-[#35c3c8]/40 transition-all space-y-3 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {abstract.posterNumber && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#35c3c8] text-[#06141c] font-black">
                    PÓSTER #{abstract.posterNumber}
                  </span>
                )}
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#101626] text-[#72e0b5] border border-[#24344d]">
                  {abstract.scientificGroup}
                </span>
                <span className="text-xs font-mono text-[#8faab5]">
                  {abstract.countries.join(', ')}
                </span>
              </div>

              {/* SDG badges */}
              <div className="flex items-center gap-1">
                {abstract.sdgLinks.map((sdg) => (
                  <span
                    key={sdg}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#101626] text-[#b7c5d8]"
                  >
                    ODS {sdg}
                  </span>
                ))}
              </div>
            </div>

            <h3 className="text-base font-bold text-white tracking-wide">
              {abstract.title}
            </h3>

            <div className="text-xs font-mono text-[#8faab5]">
              {abstract.authors.join(' · ')} — <span className="text-[#b7c5d8]">{abstract.institutions.join('; ')}</span>
            </div>

            {/* AI Summary Card */}
            <div className="p-3 rounded-2xl bg-[#0c1f2e] border border-[#35c3c8]/30 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#35c3c8] font-bold uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Síntesis AMOH AI (Texto Asistido)</span>
              </div>
              <p className="text-xs text-[#caf9f7] leading-relaxed">
                {abstract.aiSummary}
              </p>
            </div>

            {/* Source Abstract */}
            <div className="p-3 rounded-2xl bg-[#061019] border border-[#1b394b] space-y-1 text-xs">
              <div className="text-[10px] font-mono text-[#8faab5] font-bold uppercase">
                Resumen Original del Autor (Fuente Declarada)
              </div>
              <p className="text-[#8faab5] leading-relaxed text-[11px]">
                {abstract.sourceAbstract}
              </p>
            </div>

            {/* Keywords & Datasets */}
            <div className="pt-2 border-t border-[#1c2940] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-[#8faab5]">Palabras clave:</span>
                {abstract.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-[#101626] border border-[#1c2940] text-[#b7c5d8]"
                  >
                    #{kw}
                  </span>
                ))}
              </div>

              {abstract.officialUrl && (
                <a
                  href={abstract.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#35c3c8] hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Ver en Oxford Abstracts</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
