import { useState } from 'react';
import {
  AlertTriangle,
  Scale,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Landmark,
} from 'lucide-react';

interface DecisionBrief {
  id: string;
  code: string;
  title: string;
  forum: 'ATCM' | 'CCAMLR' | 'CEP' | 'COMNAP';
  session: string;
  legalAnchor: string;
  summary: string;
  facts: string[];
  uncertainties: string[];
  dataGaps: string[];
  options: {
    title: string;
    description: string;
    tradeoffs: string;
  }[];
  humanAuthorityNote: string;
}

const DECISION_BRIEFS: DecisionBrief[] = [
  {
    id: 'brief-air-tourism',
    code: 'DB-ATCM-47-01',
    title: 'Marco Regulatorio para Turismo Aéreo de Desembarco Inmediato (Fly-in / Fly-out)',
    forum: 'ATCM',
    session: 'Reunión Consultiva del Tratado Antártico (ATCM XLVII)',
    legalAnchor: 'Protocolo de Madrid (Anexo II: Protección de Fauna y Flora, Anexo V: ASPA)',
    summary:
      'Evaluación técnica de la creciente frecuencia de operaciones aéreas que desembarcan pasajeros por pocas horas en pistas de hielo azul o bases polares sin pernoctación, generando potenciales vectores de bioseguridad y perturbación de fauna.',
    facts: [
      'Aumento del 28% en vuelos intercontinentales charter directos a pistas de hielo azul durante las últimas 3 temporadas.',
      'El tiempo promedio de permanencia en tierra es de 4.5 horas por grupo.',
      'El 85% de las operaciones se concentra en dos ventanas climáticas estivales de 15 días.',
    ],
    uncertainties: [
      'Tasa real de dispersión aerobiológica de propágulos y microorganismos no nativos adheridos al fuselaje y calzado de pasajeros en visitas ultracortas.',
      'Resiliencia acústica de colonias de pingüino barbijo y adelia ante aterrizajes de turbofán a menos de 5 km de distancia.',
    ],
    dataGaps: [
      'Ausencia de monitoreo microbiológico estandarizado antes y después de cada desembarco aéreo.',
      'Falta de un sistema unificado en tiempo real de registro de planes de vuelo entre administradores nacionales y operadores IAATO.',
    ],
    options: [
      {
        title: 'Opción A: Cuotas estacionales obligatorias con auditoría previa',
        description: 'Fijar un tope máximo de rotaciones por pista de aterrizaje y exigir desinfección certificada en el aeropuerto de salida.',
        tradeoffs: 'Reduce el riesgo biológico pero eleva los costos operativos y requiere personal de inspección en aeropuertos de enlace.',
      },
      {
        title: 'Opción B: Establecimiento de buffer acústico de 10 km alrededor de colonias',
        description: 'Restringir las trayectorias de aproximación y aproximaciones visuales durante el periodo de nidificación.',
        tradeoffs: 'Protege las colonias más sensibles pero puede forzar rutas de vuelo con mayor exposición a vientos catabáticos.',
      },
      {
        title: 'Opción C: Moratoria temporal para nuevas autorizaciones mientras se despliega sensorica',
        description: 'Suspender nuevos permisos comerciales hasta que la red de sensores reporte líneas de base acústicas y microbiológicas.',
        tradeoffs: 'Máxima cautela precautoria; genera litigios comerciales con operadores turísticos privados.',
      },
    ],
    humanAuthorityNote:
      'AMOH no prescribe políticas. Las tres opciones se presentan para análisis deliberativo soberano de las Partes Consultivas en la ATCM conforme a sus prerrogativas legales.',
  },
  {
    id: 'brief-krill-fishery',
    code: 'DB-CCAMLR-43-02',
    title: 'Revisión de la Medida de Conservación 51-07: Distribución Espacial del Esfuerzo de Pesca de Krill',
    forum: 'CCAMLR',
    session: 'Comisión para la Conservación de los Recursos Vivos Marinos Antárticos (CCAMLR XLIII)',
    legalAnchor: 'Convención CCAMLR, Artículo II (Enfoque precautorio y ecosistémico)',
    summary:
      'Análisis sobre la concentración desproporcionada del esfuerzo pesquero industrial de krill (Euphausia superba) en el Área 48 (Península Antártica y Mar de Scotia), donde compite directamente con depredadores tope dependientes de hielo.',
    facts: [
      'El límite de activación de captura de 620,000 toneladas en el Área 48 se alcanza cada vez más rápido y en polígonos geográficos más reducidos.',
      'La tecnología de bombeo continuo (eco-harvesting) mantiene a las factorías operando de forma continua durante semanas continuas en aguas abrigadas.',
    ],
    uncertainties: [
      'Magnitud del impacto del calentamiento superficial del mar en el reclutamiento larval de krill comparado con la mortalidad por extracción industrial.',
      'Capacidad de forrajeo alternativo de cetáceos migratorios cuando la biomasa local de krill desciende por debajo de 150 g/m².',
    ],
    dataGaps: [
      'Cobertura satelital SAR y acústica simultánea insuficiente para estimar en tiempo real la dispersión de enjambres de krill frente a las rutas de las factorías.',
      'Retraso de hasta 6 meses en la publicación de bitácoras oficiales de pesquerías no participantes en acuerdos voluntarios de datos abiertos.',
    ],
    options: [
      {
        title: 'Opción 1: Subdivisión de cuotas en micro-cuadrículas dinámicas',
        description: 'Fraccionar la cuota del Área 48 en 12 sub-sectores con cierre automático al alcanzar el 8% de la biomasa estimada.',
        tradeoffs: 'Dispersa el esfuerzo y alivia la presión local; requiere sistemas satelitales en tiempo real para verificar el cumplimiento.',
      },
      {
        title: 'Opción 2: Zonas de amortiguamiento estacional de forrajeo para fauna marina',
        description: 'Cerrar temporalmente a la pesca un radio de 40 km alrededor de las principales colonias reproductoras entre diciembre y marzo.',
        tradeoffs: 'Protección efectiva de crías y reproductores; oposición de flotas comerciales de larga distancia.',
      },
    ],
    humanAuthorityNote:
      'La adopción de medidas de conservación en CCAMLR requiere consenso de todos los miembros. AMOH provee la evidencia biofísica objetiva para fundamentar el diálogo multilateral.',
  },
  {
    id: 'brief-smart-cables',
    code: 'DB-COMNAP-38-03',
    title: 'Despliegue de Cables Submarinos SMART para Telecomunicaciones y Geofísica',
    forum: 'COMNAP',
    session: 'Consejo de Administradores de Programas Antárticos Nacionales (COMNAP)',
    legalAnchor: 'Tratado Antártico Artículo III (Intercambio y cooperación científica abierta)',
    summary:
      'Estudio de viabilidad técnica y diplomática para el tendido del primer cable submarino de fibra óptica antártico equipado con sensores ambientales integrados (SMART: temperatura de fondo, sismicidad y presión absoluta) entre Puerto Williams / Punta Arenas y la Isla Rey Jorge.',
    facts: [
      'La conectividad actual de las 18 estaciones de la Isla Rey Jorge depende 100% de enlaces satelitales GEO/LEO con latencia variable y ancho de banda restringido.',
      'Un cable SMART proveería ancho de banda de terabits y alertas tempranas de tsunami en el Arco de Escocia en milisegundos.',
    ],
    uncertainties: [
      'Riesgo de daño en el fondo marino por icebergs tabulares que derivan con calados superiores a 250 metros en el Estrecho de Bransfield.',
      'Marco de copropiedad y mantenimiento de infraestructura crítica entre consorcios mixtos público-privados y múltiples programas antárticos nacionales.',
    ],
    dataGaps: [
      'Batimetría multihaz de resolución submétrica a lo largo de la falla submarina de Shackleton.',
      'Medición de corrientes de fondo turbulentas en el lecho del Pasaje de Drake.',
    ],
    options: [
      {
        title: 'Opción I: Consorcio multilateral administrado por COMNAP',
        description: 'Financiamiento conjunto prorrateado entre 8 países con bases permanentes en la isla, garantizando acceso libre a los datos geofísicos generados por los repetidores.',
        tradeoffs: 'Máxima legitimidad internacional y apego al Tratado Antártico; gobernanza lenta en la toma de decisiones presupuestales.',
      },
      {
        title: 'Opción II: Modelo concesionado con canal científico abierto prioritario',
        description: 'Permitir financiamiento de consorcio telecom comercial reservando el 30% del ancho de banda y el 100% de la telemetría de sensores para la comunidad SCAR.',
        tradeoffs: 'Despliegue acelerado de capital; requiere salvaguardas legales estrictas sobre soberanía de datos.',
      },
    ],
    humanAuthorityNote:
      'La infraestructura polar bajo el Tratado Antártico se destina exclusivamente a fines pacíficos. Cualquier red de comunicaciones debe garantizar transparencia y acceso equitativo.',
  },
];

export default function ExploreOceanopolitics() {
  const [selectedBrief, setSelectedBrief] = useState<DecisionBrief>(DECISION_BRIEFS[0]);
  const [activeForum, setActiveForum] = useState<string>('TODOS');

  const filteredBriefs = DECISION_BRIEFS.filter((b) => {
    if (activeForum === 'TODOS') return true;
    return b.forum === activeForum;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#101626] via-[#0b172a] to-[#080e19] border border-[#24344d] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f4b400]" />
              <span className="text-[10px] font-mono tracking-wider text-[#f4b400] uppercase font-bold">
                Oceanopolitics Decision Studio · Tratado Antártico & CCAMLR
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Dossiers de Decisión Basados en Evidencia Objetiva
            </h2>
            <p className="text-xs text-[#8fa3bd] max-w-3xl">
              Informes analíticos estructurados que separan hechos comprobados, incertidumbres científicas, vacíos de datos y opciones deliberativas. La autoridad decisional permanece exclusivamente en las delegaciones humanas soberanas.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#080e19]/80 border border-[#1c2940] shrink-0 text-center">
            <span className="text-[10px] font-mono text-[#72e0b5] block font-semibold">PRINCIPIO FUNDAMENTAL</span>
            <span className="text-xs font-bold text-white flex items-center justify-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#72e0b5]" />
              Preservación de Autoridad Humana
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-[#1c2940]/80">
          {(['TODOS', 'ATCM', 'CCAMLR', 'CEP', 'COMNAP'] as const).map((forum) => (
            <button
              key={forum}
              onClick={() => setActiveForum(forum)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeForum === forum
                  ? 'bg-[#24344d] text-white shadow-sm'
                  : 'text-[#8fa3bd] hover:text-white hover:bg-white/5'
              }`}
            >
              {forum}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Selector on Left, Detail Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of Briefs */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8fa3bd]">
            Dossiers Disponibles ({filteredBriefs.length})
          </div>
          {filteredBriefs.map((brief) => {
            const isSelected = selectedBrief.id === brief.id;
            return (
              <div
                key={brief.id}
                onClick={() => setSelectedBrief(brief)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-[#101626] border-[#35c3c8] shadow-md shadow-[#35c3c8]/10'
                    : 'bg-[#080e19] border-[#1c2940] hover:border-[#24344d]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c2940] text-[#35c3c8] font-bold">
                    {brief.code}
                  </span>
                  <span className="text-[10px] font-mono text-[#8fa3bd] flex items-center gap-1">
                    <Landmark className="w-3 h-3 text-[#f4b400]" />
                    {brief.forum}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-white leading-snug">
                  {brief.title}
                </h3>

                <p className="text-[11px] text-[#8fa3bd] line-clamp-2">
                  {brief.summary}
                </p>

                <div className="text-[9px] font-mono text-[#72e0b5] pt-1">
                  {brief.legalAnchor}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Decision Dossier */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-2xl bg-[#080e19] border border-[#24344d] space-y-5">
            {/* Dossier Header */}
            <div className="space-y-2 border-b border-[#1c2940] pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#35c3c8]">
                  {selectedBrief.code} · {selectedBrief.session}
                </span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#24344d] text-white">
                  Dossier Técnico Neutral
                </span>
              </div>
              <h2 className="text-base font-bold text-white">
                {selectedBrief.title}
              </h2>
              <div className="text-xs text-[#8fa3bd] flex items-center gap-2">
                <Scale className="w-3.5 h-3.5 text-[#f4b400] shrink-0" />
                <span>Base Jurídica: <strong className="text-white">{selectedBrief.legalAnchor}</strong></span>
              </div>
            </div>

            {/* Section 1: Facts Verified */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#72e0b5] font-bold uppercase">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>1. Hechos Científicos y Operativos Comprobados</span>
              </div>
              <ul className="space-y-1.5 pl-4 list-disc text-xs text-[#cad5e2]">
                {selectedBrief.facts.map((fact, idx) => (
                  <li key={idx} className="leading-relaxed">{fact}</li>
                ))}
              </ul>
            </div>

            {/* Section 2: Uncertainties & Data Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-[#101626] border border-[#1c2940]">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#ff8a4c] font-bold uppercase">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Incertidumbres Científicas</span>
                </div>
                <ul className="space-y-1 pl-3 list-disc text-[11px] text-[#8fa3bd]">
                  {selectedBrief.uncertainties.map((u, idx) => (
                    <li key={idx}>{u}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#ff827d] font-bold uppercase">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Vacíos de Datos (Data Gaps)</span>
                </div>
                <ul className="space-y-1 pl-3 list-disc text-[11px] text-[#8fa3bd]">
                  {selectedBrief.dataGaps.map((g, idx) => (
                    <li key={idx}>{g}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section 3: Policy Options and Trade-offs */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#4da8ff] font-bold uppercase">
                <Scale className="w-3.5 h-3.5" />
                <span>2. Opciones de Acción y Compensaciones (Trade-offs)</span>
              </div>
              <div className="space-y-3">
                {selectedBrief.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#101626] border border-[#24344d] space-y-1.5"
                  >
                    <div className="text-xs font-bold text-white">{opt.title}</div>
                    <p className="text-[11px] text-[#cad5e2] leading-relaxed">
                      {opt.description}
                    </p>
                    <div className="text-[10px] text-[#ff8a4c] bg-[#ff8a4c]/10 border border-[#ff8a4c]/20 p-2 rounded-lg">
                      <strong>Trade-off:</strong> {opt.tradeoffs}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Human Authority Clause */}
            <div className="p-3.5 rounded-xl bg-[#0b172a] border border-[#35c3c8]/30 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#35c3c8] shrink-0 mt-0.5" />
              <div className="text-[11px] text-[#8fa3bd] leading-relaxed">
                <strong className="text-white">Cláusula de Autoridad Humana: </strong>
                {selectedBrief.humanAuthorityNote}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
