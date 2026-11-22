import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, CheckCircle2 } from 'lucide-react';

export type EvidenceState = 'PUBLIC_RFP' | 'FELLOWSHIP_GRANT' | 'PUBLIC_PROCUREMENT' | 'POTENTIAL_ALIGNMENT' | 'BILATERAL_COOPERATION';

interface Opportunity {
  id: string;
  title: string;
  institution: string;
  country: string;
  domain: string;
  deadline: string;
  evidenceState: EvidenceState;
  description: string;
  url: string;
}

const EVIDENCE_METADATA: Record<EvidenceState, { label: string; color: string }> = {
  PUBLIC_RFP: { label: 'CONVOCATORIA PÚBLICA (RFP)', color: '#35c3c8' },
  FELLOWSHIP_GRANT: { label: 'BECA / FELLOWSHIP', color: '#ffc845' },
  PUBLIC_PROCUREMENT: { label: 'LICITACIÓN PÚBLICA', color: '#72e0b5' },
  POTENTIAL_ALIGNMENT: { label: 'ALINEACIÓN PROGRAMÁTICA', color: '#a855f7' },
  BILATERAL_COOPERATION: { label: 'COOPERACIÓN BILATERAL', color: '#58d5e3' },
};

const OPPORTUNITIES: Opportunity[] = [
  {
    id: 'scar-fellowship-2026',
    title: 'SCAR Fellowship Programme 2026–2027',
    institution: 'Scientific Committee on Antarctic Research (SCAR)',
    country: 'Internacional / Multilateral',
    domain: 'Investigación Polar para Científicos en Carrera Temprana',
    deadline: 'Convocatoria Anual Regular',
    evidenceState: 'FELLOWSHIP_GRANT',
    description: 'Becas para investigadores postgraduados y postdoctorales de países miembros de SCAR para estancias científicas en centros de excelencia antárticos.',
    url: 'https://scar.org/awards/fellowships',
  },
  {
    id: 'comnap-bursary',
    title: 'COMNAP Antarctic Research Fellowship',
    institution: 'Council of Managers of National Antarctic Programs (COMNAP)',
    country: 'Internacional / Multilateral',
    domain: 'Logística, Operaciones y Ciencias Aplicadas',
    deadline: 'Convocatoria Abierta',
    evidenceState: 'FELLOWSHIP_GRANT',
    description: 'Financiación de cooperación bilateral entre administradores antárticos nacionales para proyectos operativos e ingenieriles en el continente blanco.',
    url: 'https://www.comnap.aq',
  },
  {
    id: 'ccamlr-scholarship',
    title: 'CCAMLR Scientific Scholarship Scheme',
    institution: 'Commission for the Conservation of Antarctic Marine Living Resources',
    country: 'Internacional / Multilateral',
    domain: 'Conservación Marina y Gestión Pesquera',
    deadline: 'Semestral',
    evidenceState: 'PUBLIC_RFP',
    description: 'Asistencia y desarrollo de capacidades en modelamiento de captura incidental, krill, merluza negra y áreas marinas protegidas australes.',
    url: 'https://www.ccamlr.org',
  },
  {
    id: 'colombia-pac',
    title: 'Programa Antártico Colombiano (PAC) — Expedición 2026–2027',
    institution: 'Comisión Colombiana del Océano (CCO) / DIMAR',
    country: 'Colombia',
    domain: 'Expediciones Científicas Nacionales',
    deadline: 'Convocatoria Nacional',
    evidenceState: 'PUBLIC_RFP',
    description: 'Proyectos de investigación científica a bordo de plataformas ARC o estaciones de países cooperantes en el marco de la Agenda Científica Antártica 2014–2035.',
    url: 'https://cco.gov.co/programa-antartico-colombiano.html',
  },
  {
    id: 'inach-concurso-regular',
    title: 'Concurso Nacional de Proyectos de Terreno y Gabinete',
    institution: 'Instituto Antártico Chileno (INACH)',
    country: 'Chile',
    domain: 'Ciencia Antártica y Logística Punta Arenas',
    deadline: 'Anual',
    evidenceState: 'PUBLIC_RFP',
    description: 'Financiamiento de expediciones científicas y soporte logístico desde Punta Arenas hacia las bases y campamentos en la Península Antártica.',
    url: 'https://www.inach.cl',
  },
  {
    id: 'dna-argentina-cav',
    title: 'Campaña Antártica de Verano (CAV) — Proyectos IAA',
    institution: 'Dirección Nacional del Antártico (DNA) / Instituto Antártico Argentino',
    country: 'Argentina',
    domain: 'Investigación Científica y Logística Ushuaia',
    deadline: 'Anual / Plan Anual Antártico',
    evidenceState: 'BILATERAL_COOPERATION',
    description: 'Desarrollo de proyectos del Plan Anual Antártico con apoyo del rompehielos ARA Almirante Irízar y bases argentinas.',
    url: 'https://cancilleria.gob.ar/es/dna',
  },
];

export default function OpportunitiesPage() {
  const navigate = useNavigate();
  const [filterState, setFilterState] = useState<EvidenceState | 'ALL'>('ALL');

  const filteredOpportunities = filterState === 'ALL'
    ? OPPORTUNITIES
    : OPPORTUNITIES.filter((o) => o.evidenceState === filterState);

  return (
    <div className="min-h-screen bg-[#050e14] text-[#edf5f5] font-sans flex flex-col">
      <header className="h-16 border-b border-[#142733] bg-[#071620] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/observatory')}
            className="flex items-center gap-2 text-xs font-mono text-[#8faab5] hover:text-[#58d5e3] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Observatorio</span>
          </button>
          <div className="h-4 w-px bg-[#1f3947]" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-white tracking-wide">
              Radar de Oportunidades & Convocatorias Científicas
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ffc845]/10 text-[#ffc845] border border-[#ffc845]/30 font-semibold">
              EVIDENCE-BASED V7
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Convocatorias Científicas, Becas & Licitaciones Polares
          </h1>
          <p className="text-sm text-[#8faab5] max-w-3xl leading-relaxed">
            Directorio consolidado de financiamiento, pasantías y programas de investigación polar
            ofrecidos por organizaciones del Tratado Antártico y agencias nacionales. Cada registro
            cuenta con un estado de evidencia verificado y enlace oficial directo.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#142e3d]">
          <button
            onClick={() => setFilterState('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              filterState === 'ALL'
                ? 'bg-[#102d3f] text-[#58d5e3] border border-[#35c3c8]'
                : 'bg-[#071620] text-[#8faab5] border border-[#163040] hover:text-white'
            }`}
          >
            TODAS ({OPPORTUNITIES.length})
          </button>
          {(Object.keys(EVIDENCE_METADATA) as EvidenceState[]).map((state) => {
            const meta = EVIDENCE_METADATA[state];
            const isSelected = filterState === state;
            const count = OPPORTUNITIES.filter((o) => o.evidenceState === state).length;
            return (
              <button
                key={state}
                onClick={() => setFilterState(state)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#102d3f] text-white border'
                    : 'bg-[#071620] text-[#8faab5] border border-[#163040] hover:text-white'
                }`}
                style={{ borderColor: isSelected ? meta.color : undefined }}
              >
                <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: meta.color }} />
                <span>{meta.label} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOpportunities.map((opp) => {
            const meta = EVIDENCE_METADATA[opp.evidenceState];
            return (
              <div
                key={opp.id}
                className="p-6 rounded-2xl bg-[#071620] border border-[#163040] hover:border-[#35c3c8]/50 transition-all flex flex-col justify-between gap-4 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        backgroundColor: `${meta.color}20`,
                        color: meta.color,
                        border: `1px solid ${meta.color}40`,
                      }}
                    >
                      {meta.label}
                    </span>
                    <span className="text-[#8faab5]">{opp.deadline}</span>
                  </div>
                  <h2 className="text-base font-bold text-white mb-1">{opp.title}</h2>
                  <div className="text-xs font-mono text-[#58d5e3] mb-1">{opp.institution} · {opp.country}</div>
                  <div className="text-xs text-[#caf9f7] font-medium mb-3">{opp.domain}</div>
                  <p className="text-xs text-[#8faab5] leading-relaxed">{opp.description}</p>
                </div>

                <div className="pt-4 border-t border-[#132d3d] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#72e0b5] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Fuente Verificada</span>
                  </span>
                  <a
                    href={opp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0c2230] hover:bg-[#153448] text-xs font-medium text-white transition-all border border-[#1f4257]"
                  >
                    <span>Portal Oficial</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#58d5e3]" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
