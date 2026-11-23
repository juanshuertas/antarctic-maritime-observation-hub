import { useState } from 'react';
import {
  DollarSign,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Building2,
  Search,
} from 'lucide-react';

interface FundingOpportunity {
  id: string;
  title: string;
  organization: string;
  grantType: 'Beca' | 'Proyecto' | 'Logística' | 'Movilidad';
  amount: string;
  deadline: string;
  status: 'Abierta' | 'Próxima' | 'Permanente';
  targetAudience: string;
  description: string;
  eligibility: string[];
  url: string;
  sdgs: number[];
}

const OPPORTUNITIES: FundingOpportunity[] = [
  {
    id: 'opp-scar-fellowship-2026',
    title: 'SCAR Fellowship Programme 2026',
    organization: 'Scientific Committee on Antarctic Research (SCAR)',
    grantType: 'Beca',
    amount: 'Hasta $15,000 USD',
    deadline: '30 de Junio de 2026',
    status: 'Abierta',
    targetAudience: 'Investigadores en Carrera Temprana (PhD y Postdoc)',
    description:
      'Financiación para estancias de investigación internacionales cortas (1-3 meses) en centros o estaciones antárticas de países miembros de SCAR, priorizando países emergentes.',
    eligibility: [
      'Estudiantes de doctorado o doctores con menos de 5 años de graduación.',
      'Nacional de cualquier país miembro de SCAR (pleno o asociado).',
      'Propuesta avalada por institución receptora internacional.',
    ],
    url: 'https://scar.org/awards/fellowships',
    sdgs: [4, 9, 13, 14, 17],
  },
  {
    id: 'opp-comnap-fellowship',
    title: 'COMNAP Antarctic Research Fellowship Scheme',
    organization: 'Council of Managers of National Antarctic Programs (COMNAP)',
    grantType: 'Movilidad',
    amount: 'Hasta $15,000 USD',
    deadline: '15 de Mayo de 2026',
    status: 'Abierta',
    targetAudience: 'Ingenieros, tecnólogos y científicos de operaciones polares',
    description:
      'Apoyo para pasantías de cooperación bilateral en gestión ambiental, ingeniería polar, telecomunicaciones, logística y operaciones en bases antárticas.',
    eligibility: [
      'Profesionales vinculados a un Programa Antártico Nacional miembro de COMNAP.',
      'Enfoque en soluciones operativas, energéticas o de reducción de huella ambiental.',
    ],
    url: 'https://www.comnap.aq',
    sdgs: [7, 9, 12, 13, 17],
  },
  {
    id: 'opp-ccamlr-scholarship',
    title: 'CCAMLR Scientific Scholarship Scheme',
    organization: 'Commission for the Conservation of Antarctic Marine Living Resources',
    grantType: 'Proyecto',
    amount: 'Hasta $30,000 AUD',
    deadline: '1 de Octubre de 2026',
    status: 'Próxima',
    targetAudience: 'Biólogos marinos y modeladores pesqueros',
    description:
      'Fortalecimiento de capacidades científicas para monitoreo de krill, merluza negra, reducción de captura incidental de aves y diseño de Áreas Marinas Protegidas.',
    eligibility: [
      'Investigadores de estados miembros de CCAMLR en desarrollo.',
      'Compromiso de presentar informe en el Comité Científico de CCAMLR.',
    ],
    url: 'https://www.ccamlr.org/en/organisation/scientific-scholarship-scheme',
    sdgs: [14, 15, 17],
  },
  {
    id: 'opp-iaato-fellowship',
    title: 'IAATO Antarctic Fellowship',
    organization: 'International Association of Antarctica Tour Operators (IAATO)',
    grantType: 'Beca',
    amount: 'Hasta $15,000 USD',
    deadline: '30 de Junio de 2026',
    status: 'Abierta',
    targetAudience: 'Científicos polares emergentes',
    description:
      'Beca anual para avanzar el entendimiento del impacto humano en la Antártida, gestión de visitantes, bioseguridad y monitoreo ambiental a largo plazo.',
    eligibility: [
      'Investigadores en etapa temprana de cualquier nacionalidad.',
      'Proyectos enfocados en conservación, turismo sostenible o ciencia ciudadana.',
    ],
    url: 'https://iaato.org/supporting-science/iaato-fellowship/',
    sdgs: [12, 13, 14, 15],
  },
  {
    id: 'opp-pac-colombia',
    title: 'Convocatoria Agenda Científica Antártica PAC X / XI',
    organization: 'Comisión Colombiana del Océano (CCO) / Minciencias',
    grantType: 'Logística',
    amount: 'Cupo a Bordo + Soporte Logístico ARC',
    deadline: '31 de Agosto de 2026',
    status: 'Próxima',
    targetAudience: 'Grupos de investigación colombianos e internacionales cooperantes',
    description:
      'Asignación de espacio de laboratorio, literas y tiempo de crucero oceanográfico a bordo del buque ARC Simón Bolívar para la siguiente Expedición Antártica.',
    eligibility: [
      'Proyectos registrados en la Agenda Científica Antártica de Colombia.',
      'Alianzas con coinvestigadores de Chile, Ecuador, Turquía o España valoradas positivamente.',
    ],
    url: 'https://cco.gov.co/programa-antartico-colombiano.html',
    sdgs: [9, 13, 14, 17],
  },
  {
    id: 'opp-apecs-seed',
    title: 'APECS / PolarTREC International Polar Seed Grant',
    organization: 'Association of Polar Early Career Scientists (APECS)',
    grantType: 'Proyecto',
    amount: '$3,000 – $5,000 USD',
    deadline: 'Convocatoria Permanente',
    status: 'Permanente',
    targetAudience: 'Divulgadores, educadores e investigadores jóvenes',
    description:
      'Micro-subvenciones para proyectos piloto de ciencia abierta, educación polar, alfabetización oceánica y talleres interdisciplinarios.',
    eligibility: [
      'Miembros activos de APECS.',
      'Productos con licenciamiento abierto y acceso público garantizado.',
    ],
    url: 'https://www.apecs.is',
    sdgs: [4, 10, 17],
  },
];

export default function ExploreOpportunities() {
  const [filterType, setFilterType] = useState<string>('TODAS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = OPPORTUNITIES.filter((opp) => {
    if (filterType !== 'TODAS' && opp.grantType !== filterType) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        opp.title.toLowerCase().includes(q) ||
        opp.organization.toLowerCase().includes(q) ||
        opp.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#101626] via-[#0b172a] to-[#080e19] border border-[#24344d] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#35c3c8]" />
              <span className="text-[10px] font-mono tracking-wider text-[#35c3c8] uppercase font-bold">
                Radar de Oportunidades & Financiación Polar · AMOH AI
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Convocatorias Científicas, Becas y Cupos de Expedición
            </h2>
            <p className="text-xs text-[#8fa3bd] max-w-3xl">
              Monitoreo continuo de fondos multilaterales, fellowships para investigadores emergentes y cupos de navegación polar ofrecidos por SCAR, COMNAP, CCAMLR, IAATO y programas antárticos nacionales.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-3 rounded-xl bg-[#080e19]/80 border border-[#1c2940] text-center">
              <span className="text-[10px] font-mono text-[#8fa3bd] block">CONVOCATORIAS ACTIVAS</span>
              <span className="text-lg font-mono font-bold text-[#72e0b5]">
                {OPPORTUNITIES.length}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-[#1c2940]/80">
          <div className="flex flex-wrap items-center gap-1.5">
            {(['TODAS', 'Beca', 'Proyecto', 'Logística', 'Movilidad'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  filterType === t
                    ? 'bg-[#24344d] text-white shadow-sm'
                    : 'text-[#8fa3bd] hover:text-white hover:bg-white/5'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#8fa3bd] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar por palabra clave..."
              className="w-full bg-[#080e19] border border-[#24344d] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#8fa3bd] focus:outline-none focus:border-[#35c3c8]"
            />
          </div>
        </div>
      </div>

      {/* Grid of Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((opp) => (
          <div
            key={opp.id}
            className="p-4 rounded-xl bg-[#080e19] border border-[#24344d] hover:border-[#35c3c8]/50 transition-all flex flex-col justify-between group space-y-3"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-[#1c2940] text-[#35c3c8] font-bold">
                  {opp.grantType}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#101626] text-[#72e0b5] border border-[#1c2940]">
                  {opp.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-[#35c3c8] transition-colors leading-snug">
                {opp.title}
              </h3>

              <div className="text-xs text-[#8fa3bd] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#a995ff] shrink-0" />
                <span className="truncate">{opp.organization}</span>
              </div>

              <p className="text-[11px] text-[#cad5e2] line-clamp-3 leading-relaxed">
                {opp.description}
              </p>

              {/* Amount & Deadline */}
              <div className="p-2.5 rounded-lg bg-[#101626] border border-[#1c2940] space-y-1 text-[11px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[#8fa3bd] flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-[#72e0b5]" />
                    Financiación:
                  </span>
                  <span className="text-[#72e0b5] font-bold">{opp.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8fa3bd] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#ff8a4c]" />
                    Cierre:
                  </span>
                  <span className="text-[#edf5f5]">{opp.deadline}</span>
                </div>
              </div>

              {/* Eligibility checklist */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-mono text-[#8fa3bd] uppercase">Requisitos Clave:</span>
                <ul className="space-y-1">
                  {opp.eligibility.slice(0, 2).map((item, idx) => (
                    <li key={idx} className="text-[10px] text-[#8fa3bd] flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#35c3c8] shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action footer */}
            <div className="pt-2 border-t border-[#1c2940] flex items-center justify-between">
              <div className="flex items-center gap-1">
                {opp.sdgs.map((sdg) => (
                  <span
                    key={sdg}
                    className="text-[9px] font-mono px-1 rounded bg-[#1c2940] text-[#8fa3bd]"
                  >
                    ODS {sdg}
                  </span>
                ))}
              </div>

              <a
                href={opp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-mono text-[#35c3c8] hover:text-white transition-colors"
              >
                <span>Postular</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
