import { useState } from 'react';
import { Radiation, ShieldAlert, ExternalLink } from 'lucide-react';

export interface NuclearEvent {
  id: string;
  category:
    | 'ACCIDENT'
    | 'CHRONIC'
    | 'DELIBERATE_DUMPING'
    | 'DISPOSAL'
    | 'LEGACY_TEST_WASTE'
    | 'TEST_SITE';
  title: string;
  location: string;
  year: number;
  radionuclides: string[];
  description: string;
  iaeaMarisId?: string;
  polarTreatyContext: string;
}

const NUCLEAR_EVENTS: NuclearEvent[] = [
  {
    id: 'nuc-mcmurdo-pm3a',
    category: 'DISPOSAL',
    title: 'Reactor Nuclear PM-3A "Nukey Poo" (Estación McMurdo)',
    location: 'Estación McMurdo, Isla de Ross (-77.85°S, 166.66°E)',
    year: 1972,
    radionuclides: ['137Cs', '60Co', '90Sr'],
    description: 'Planta de energía nuclear de agua a presión operada por la Marina de EE.UU. entre 1962 y 1972 para calefacción y desalinización. Tras fallas y fugas menores, fue completamente desmantelada, descontaminada y más de 12,000 toneladas de suelo triturado fueron retiradas de la Antártida.',
    iaeaMarisId: 'MARIS-ANT-001',
    polarTreatyContext: 'Cumplimiento estricto del Artículo V del Tratado Antártico (prohibición de vertimiento y almacenamiento de desechos nucleares). El sitio fue remediado y certificado libre de contaminación.',
  },
  {
    id: 'nuc-southern-ocean-baseline',
    category: 'CHRONIC',
    title: 'Línea de Base Radioecológica del Océano Austral (IAEA MARIS)',
    location: 'Circumpolar Antártica (50°S a 70°S)',
    year: 2026,
    radionuclides: ['137Cs', '239,240Pu', '3H'],
    description: 'Monitoreo de concentraciones ultrabajas de radionúclidos antropogénicos derivados de los ensayos atmosféricos globales de los años 50 y 60. Las aguas antárticas presentan los niveles más limpios del planeta (< 0.2 Bq/m³ de 137Cs).',
    iaeaMarisId: 'IAEA-MARIS-SO-2026',
    polarTreatyContext: 'El Océano Austral sirve como estándar global de referencia de aguas oceánicas prístinas para el OIEA (Organismo Internacional de Energía Atómica).',
  },
  {
    id: 'nuc-snap9a',
    category: 'ACCIDENT',
    title: 'Reentrada del Generador RTG SNAP-9A en la Estratósfera Sur',
    location: 'Océano Índico Austral / Hemisferio Sur (-45°S)',
    year: 1964,
    radionuclides: ['238Pu'],
    description: 'Fallo de lanzamiento del satélite Transit 5BN-3 con un generador termoeléctrico de radioisótopos (RTG) de Plutonio-238. Se desintegró a 50 km de altitud, dispersando trazas de 238Pu en la estratósfera del hemisferio sur.',
    iaeaMarisId: 'MARIS-ATM-SNAP',
    polarTreatyContext: 'Provocó el rediseño internacional de los sistemas espaciales para garantizar la reentrada intacta de fuentes nucleares en satélites.',
  },
  {
    id: 'nuc-french-polynesia-tests',
    category: 'TEST_SITE',
    title: 'Ensayos Nucleares Atmosféricos del Pacífico Sur (Mururoa y Fangataufa)',
    location: 'Polinesia Francesa (21.8°S, 138.9°W)',
    year: 1974,
    radionuclides: ['137Cs', '90Sr', '239Pu'],
    description: 'Campaña de 41 ensayos atmosféricos franceses entre 1966 y 1974. Las corrientes troposféricas y la lluvia radiactiva alcanzaron zonas subantárticas antes de que las pruebas se trasladaran a pozos subterráneos.',
    iaeaMarisId: 'IAEA-TECDOC-1215',
    polarTreatyContext: 'Reforzó el consenso regional para el Tratado de Rarotonga (Zona Libre de Armas Nucleares del Pacífico Sur) y la protección antártica.',
  },
];

export default function ExploreNuclear() {
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  const filtered = NUCLEAR_EVENTS.filter(
    (e) => selectedCat === 'ALL' || e.category === selectedCat
  );

  return (
    <div className="space-y-6 text-[#edf5f5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* 1. Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#210a18] via-[#14060f] to-[#080e19] border border-[#ff5e8a]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <Radiation className="w-4 h-4 text-[#ff5e8a] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff5e8a] font-bold">
              NUCLEAR OCEANS MODE · IAEA MARIS INTEGRATION
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Historia Nuclear, Radionúclidos y el Artículo V del Tratado
          </h2>
          <p className="text-xs text-[#b7c5d8] leading-relaxed">
            Atlas histórico y radioecológico del Organismo Internacional de Energía Atómica (OIEA). La Antártida es la primera zona libre de armas y residuos nucleares del planeta en virtud del Artículo V del Tratado Antártico.
          </p>
        </div>

        <div className="shrink-0 p-3 rounded-2xl bg-[#12050e] border border-[#ff5e8a]/30 text-center font-mono space-y-1">
          <div className="text-[9px] uppercase tracking-wider text-[#ff5e8a]">Estado Antártico</div>
          <div className="text-xl font-black text-white">ZONA DESNUCLEARIZADA</div>
          <div className="text-[9px] text-[#72e0b5]">Artículo V Vigente</div>
        </div>
      </div>

      {/* 2. IAEA History Categories Filter */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#080e19] border border-[#1c2940] rounded-xl font-mono text-xs w-fit">
        {[
          { id: 'ALL', label: 'TODOS LOS EVENTOS' },
          { id: 'DISPOSAL', label: 'DESMANTELAMIENTO' },
          { id: 'CHRONIC', label: 'LÍNEAS DE BASE MARIS' },
          { id: 'ACCIDENT', label: 'ACCIDENTES HISTÓRICOS' },
          { id: 'TEST_SITE', label: 'ENSAYOS PACÍFICO SUR' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedCat === cat.id
                ? 'bg-[#ff5e8a]/20 text-[#ff5e8a] border border-[#ff5e8a]/40 shadow-sm'
                : 'text-[#8fa3bd] hover:text-white hover:bg-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. Event Cards */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <article
            key={item.id}
            className="p-5 rounded-2xl bg-[#080e19] border border-[#1c2940] hover:border-[#ff5e8a]/50 transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#ff5e8a]/20 text-[#ff5e8a] border border-[#ff5e8a]/40 font-bold flex items-center gap-1">
                  <Radiation className="w-3 h-3" />
                  {item.category}
                </span>
                <span className="text-xs font-mono text-[#8faab5]">
                  Año {item.year} · {item.location}
                </span>
              </div>

              {/* Radionuclides */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-[#8faab5]">Isótopos:</span>
                {item.radionuclides.map((iso) => (
                  <span
                    key={iso}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101626] border border-[#ff5e8a]/30 text-[#f5f8fc]"
                  >
                    {iso}
                  </span>
                ))}
              </div>
            </div>

            <h3 className="text-base font-bold text-white">
              {item.title}
            </h3>

            <p className="text-xs text-[#b7c5d8] leading-relaxed">
              {item.description}
            </p>

            <div className="p-3 rounded-xl bg-[#0d1622] border border-[#1b394b] text-[11px] text-[#caf9f7] space-y-1">
              <div className="text-[10px] font-mono uppercase text-[#72e0b5] font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Contexto Legal Tratado Antártico:</span>
              </div>
              <p>{item.polarTreatyContext}</p>
            </div>

            {item.iaeaMarisId && (
              <div className="flex justify-between items-center text-[10px] font-mono text-[#8faab5] pt-1 border-t border-[#1c2940]">
                <span>Identificador IAEA: {item.iaeaMarisId}</span>
                <a
                  href="https://maris.iaea.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ff5e8a] hover:underline flex items-center gap-1"
                >
                  <span>Base MARIS OIEA</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
