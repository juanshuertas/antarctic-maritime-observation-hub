import { useEffect, useMemo, useState } from 'react';

import {

  X,

  ExternalLink,

  AlertCircle,

  Globe2,

  Sparkles,

  Handshake,

  Database,

  Layers3,

  Gauge,

  Search,

  ChevronDown,

  ChevronUp,

  Network,

  Info,

} from 'lucide-react';

import { SDG_GOALS, XDG_2045_FRAMEWORK, type SdgGoal } from '../lib/sdg-data';

import { getLayerSDGNumber } from '../lib/sdg-registry';

import InternationalCooperationPanel from './cooperation/InternationalCooperationPanel';



interface SdgLensDrawerProps {

  isOpen: boolean;

  onClose: () => void;

  activeGoalNumber: number | null;

  onSelectGoal: (goalNumber: number | null) => void;

  onOpenScienceModal?: (goal: SdgGoal) => void;

  embedded?: boolean;

  initialFramework?: LensFramework;

  hideFrameworkTabs?: boolean;

}



type LensFramework = 'SDG_2030' | 'XDG_2045' | 'COOPERATION';



type GoalStat = {

  goal: SdgGoal;

  activeLayers: string[];

  score: number;

  evidenceCount: number;

  hasMappedData: boolean;

  level: 'ALTA' | 'MEDIA' | 'BASE' | 'SIN EVIDENCIA';

};



type XdgMission = {

  id: string;

  pillar: string;

  title: string;

  description: string;

  relatedSdgs: number[];

  layerTokens: string[];

};



const XDG_MISSIONS: XdgMission[] = [

  {

    id: 'cryosphere-integrity',

    pillar: 'xdg-planet',

    title: 'Integridad de la Criosfera',

    description: 'Continuidad de observación de hielo marino, plataformas, glaciares y cambios de masa.',

    relatedSdgs: [6, 13, 14],

    layerTokens: ['ice', 'glacier', 'cryosphere', 'sea_ice', 'shelf', 'thwaites'],

  },

  {

    id: 'southern-ocean-biodiversity',

    pillar: 'xdg-planet',

    title: 'Biodiversidad del Océano Austral',

    description: 'Lectura integrada de krill, pingüinos, cetáceos, áreas protegidas y presión pesquera.',

    relatedSdgs: [2, 12, 14, 15],

    layerTokens: ['krill', 'penguin', 'whale', 'fauna', 'biodiversity', 'ccamlr', 'aspa', 'mpa'],

  },

  {

    id: 'climate-observation-continuity',

    pillar: 'xdg-planet',

    title: 'Continuidad de Observación Climática',

    description: 'Mantener series comparables de atmósfera, océano, hielo y carbono para reducir incertidumbre.',

    relatedSdgs: [9, 13, 17],

    layerTokens: ['climate', 'temperature', 'weather', 'argo', 'carbon', 'ocean', 'satellite'],

  },

  {

    id: 'polar-safety-resilience',

    pillar: 'xdg-people',

    title: 'Seguridad y Resiliencia Humana Polar',

    description: 'Salud, comunicaciones, navegación segura y respuesta ante incidentes en ambientes extremos.',

    relatedSdgs: [3, 9, 11],

    layerTokens: ['sar', 'rescue', 'health', 'telemedicine', 'weather', 'vessel', 'flight'],

  },

  {

    id: 'open-polar-education',

    pillar: 'xdg-people',

    title: 'Educación Polar Abierta e Inclusiva',

    description: 'Acceso a ciencia, formación y participación intergeneracional con trazabilidad de conocimiento.',

    relatedSdgs: [4, 5, 10, 17],

    layerTokens: ['science', 'station', 'education', 'observation', 'citizen'],

  },

  {

    id: 'blue-economy-integrity',

    pillar: 'xdg-prosperity',

    title: 'Economía Azul y Pesquerías con Integridad',

    description: 'Cruzar esfuerzo pesquero, ecosistemas y gobernanza sin confundir actividad con incumplimiento.',

    relatedSdgs: [2, 8, 12, 14],

    layerTokens: ['gfw', 'fishing', 'krill', 'ccamlr', 'vessel'],

  },

  {

    id: 'low-impact-infrastructure',

    pillar: 'xdg-prosperity',

    title: 'Infraestructura Polar de Bajo Impacto',

    description: 'Observar logística, energía, conectividad y huella ambiental de infraestructura científica.',

    relatedSdgs: [7, 9, 11, 12, 13],

    layerTokens: ['station', 'energy', 'infrastructure', 'cable', 'logistics', 'renewable'],

  },

  {

    id: 'treaty-stability',

    pillar: 'xdg-peace',

    title: 'Gobernanza Antártica y Estabilidad del Sistema del Tratado',

    description: 'Contextualizar presencia, cooperación, áreas protegidas y transparencia institucional.',

    relatedSdgs: [16, 17],

    layerTokens: ['treaty', 'governance', 'aspa', 'asma', 'ccamlr', 'claim'],

  },

  {

    id: 'grey-zone-verification',

    pillar: 'xdg-peace',

    title: 'Fricción, Zonas Grises y Verificación',

    description: 'Identificar interacción y sensibilidad espacial con evidencia, incertidumbre y salvaguardas.',

    relatedSdgs: [16, 17],

    layerTokens: ['grey', 'friction', 'sigint', 'buffer', 'defense'],

  },

  {

    id: 'shared-data-cooperation',

    pillar: 'xdg-partnership',

    title: 'Datos Compartidos e Interoperabilidad Científica',

    description: 'Favorecer bienes públicos de datos, estándares abiertos y cooperación multinacional.',

    relatedSdgs: [9, 16, 17],

    layerTokens: ['station', 'science', 'satellite', 'observation', 'cable', 'argo'],

  },

  {

    id: 'trusted-ai-polar',

    pillar: 'xdg-partnership',

    title: 'IA Confiable para Observación Polar',

    description: 'Modelos trazables y auditables para análisis, alerta temprana y apoyo a decisiones científicas.',

    relatedSdgs: [9, 13, 16, 17],

    layerTokens: ['pythia', 'ai', 'forecast', 'seismic', 'satellite', 'weather'],

  },

];



function canonicalLayerId(id: string) {

  let next = String(id || '');



  next = next

    .replace(/^amoh-runtime-heat-/, '')

    .replace(/^amoh-runtime-points-/, '')

    .replace(/^amoh-hover-hit-/, '')

    .replace(/^amoh-layer-/, '');



  for (let i = 0; i < 3; i += 1) {

    next = next.replace(

      /-(fill|line|lines|point|points|symbol|heatmap|inner|outer|track|tracks|label|labels)$/i,

      '',

    );

  }



  return next;

}



function safeSdgNumber(id: string) {

  const variants = Array.from(

    new Set([

      id,

      canonicalLayerId(id),

      id.replaceAll('-', '_'),

      canonicalLayerId(id).replaceAll('-', '_'),

    ]),

  );



  for (const variant of variants) {

    try {

      const value = getLayerSDGNumber(variant);

      if (typeof value === 'number' && value >= 1 && value <= 17) {

        return value;

      }

    } catch {

      // Keep searching candidate aliases.

    }

  }



  return null;

}



function collectVisibleLayerIds() {

  if (typeof window === 'undefined') return [];



  const w = window as any;

  const map =

    w.__amohHeatRuntimeMap ||

    w.__wodEngine?.map ||

    w.__map ||

    null;



  const ids = new Set<string>();



  if (map?.getStyle) {

    try {

      const style = map.getStyle?.();

      const layers = Array.isArray(style?.layers) ? style.layers : [];



      for (const layer of layers) {

        const id = String(layer?.id || '');

        if (!id) continue;



        let visible = true;



        try {

          visible = map.getLayoutProperty(id, 'visibility') !== 'none';

        } catch {

          visible = true;

        }



        if (visible) {

          ids.add(canonicalLayerId(id));

        }

      }

    } catch {

      // Map can briefly be between styles. Ignore and retry on next interval.

    }

  }



  const runtime = w.__amohHeatRuntimeStatus || {};



  for (const [id, state] of Object.entries(runtime) as Array<[string, any]>) {

    if (state?.active && state?.loaded) {

      ids.add(canonicalLayerId(id));

    }

  }



  return Array.from(ids)

    .filter(Boolean)

    .sort();

}



function goalName(goal: SdgGoal) {

  const g = goal as any;

  return String(g.name || g.title || `ODS ${g.number}`);

}



function goalDescription(goal: SdgGoal) {

  const g = goal as any;

  return String(

    g.antarcticRelevance ||

      g.description ||

      g.summary ||

      g.context ||

      g.why ||

      'Sin descripción contextual adicional en el registro actual.',

  );

}



function goalColor(goal: SdgGoal) {

  return String((goal as any).color || '#35c3c8');

}



function goalSources(goal: SdgGoal) {

  const raw = (goal as any).sources;

  return Array.isArray(raw) ? raw : [];

}



function goalMapped(goal: SdgGoal) {

  return Boolean((goal as any).hasMappedData);

}



function levelStyle(level: GoalStat['level']) {

  if (level === 'ALTA') {

    return 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200';

  }



  if (level === 'MEDIA') {

    return 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200';

  }



  if (level === 'BASE') {

    return 'border-amber-400/35 bg-amber-400/10 text-amber-200';

  }



  return 'border-slate-600/40 bg-slate-700/20 text-slate-400';

}



function scoreGoal(goal: SdgGoal, activeLayers: string[]) {

  const sourceCount = goalSources(goal).length;

  const mapped = goalMapped(goal);



  const score = Math.min(

    100,

    activeLayers.length * 22 +

      (mapped ? 18 : 0) +

      Math.min(sourceCount * 5, 20),

  );



  const level: GoalStat['level'] =

    activeLayers.length >= 3 || score >= 70

      ? 'ALTA'

      : activeLayers.length >= 1 || score >= 35

        ? 'MEDIA'

        : mapped || sourceCount > 0

          ? 'BASE'

          : 'SIN EVIDENCIA';



  return {

    score,

    level,

    evidenceCount: sourceCount,

    hasMappedData: mapped,

  };

}



function layerMatchesTokens(id: string, tokens: string[]) {

  const text = id.toLowerCase();

  return tokens.some((token) => text.includes(token.toLowerCase()));

}



function compactLayerName(id: string) {

  return id

    .replaceAll('_', ' ')

    .replaceAll('-', ' ')

    .replace(/\s+/g, ' ')

    .trim();

}



export default function SdgLensDrawer({

  isOpen,

  onClose,

  activeGoalNumber,

  onSelectGoal,

  onOpenScienceModal,

  embedded = false,

  initialFramework = 'SDG_2030',

  hideFrameworkTabs = false,

}: SdgLensDrawerProps) {

  const [lensFramework, setLensFramework] = useState<LensFramework>(initialFramework);

  const [selectedXdgPillar, setSelectedXdgPillar] = useState<string | null>(null);

  const [selectedXdgMission, setSelectedXdgMission] = useState<string | null>(null);

  const [expandedGoalNumber, setExpandedGoalNumber] = useState<number | null>(null);

  const [visibleLayerIds, setVisibleLayerIds] = useState<string[]>([]);

  const [query, setQuery] = useState('');



  useEffect(() => {

    setLensFramework(initialFramework);

  }, [initialFramework]);



  useEffect(() => {

    if (!isOpen && !embedded) return;



    const sync = () => {

      setVisibleLayerIds(collectVisibleLayerIds());

    };



    sync();



    const timer = window.setInterval(sync, 900);

    return () => window.clearInterval(timer);

  }, [isOpen, embedded]);



  const goalStats = useMemo<GoalStat[]>(() => {

    return SDG_GOALS.map((goal) => {

      const activeLayers = visibleLayerIds.filter(

        (id) => safeSdgNumber(id) === goal.number,

      );



      const scored = scoreGoal(goal, activeLayers);



      return {

        goal,

        activeLayers,

        ...scored,

      };

    });

  }, [visibleLayerIds]);



  const goalStatsByNumber = useMemo(() => {

    return new Map(goalStats.map((item) => [item.goal.number, item]));

  }, [goalStats]);



  const selectedGoal =

    SDG_GOALS.find((goal) => goal.number === activeGoalNumber) || null;



  const selectedGoalStat =

    activeGoalNumber !== null

      ? goalStatsByNumber.get(activeGoalNumber) || null

      : null;
  void selectedGoal; void selectedGoalStat; // reservado: se conserva sin uso por ahora (corrección TS6133 sin cambiar comportamiento)



  const filteredGoals = useMemo(() => {

    const needle = query.trim().toLowerCase();



    if (!needle) return goalStats;



    return goalStats.filter(({ goal }) => {

      const haystack = [

        goal.number,

        goalName(goal),

        goalDescription(goal),

      ]

        .join(' ')

        .toLowerCase();



      return haystack.includes(needle);

    });

  }, [goalStats, query]);



  const impactedSdgCount = goalStats.filter(

    (item) => item.activeLayers.length > 0,

  ).length;



  const linkedLayerCount = Array.from(

    new Set(goalStats.flatMap((item) => item.activeLayers)),

  ).length;



  const xdgMissionStats = useMemo(() => {

    return XDG_MISSIONS.map((mission) => {

      const directLayers = visibleLayerIds.filter((id) =>

        layerMatchesTokens(id, mission.layerTokens),

      );



      const relatedActiveSdgs = mission.relatedSdgs.filter(

        (sdg) => (goalStatsByNumber.get(sdg)?.activeLayers.length || 0) > 0,

      );



      const score = Math.min(

        100,

        directLayers.length * 24 +

          relatedActiveSdgs.length * 14 +

          (directLayers.length || relatedActiveSdgs.length ? 8 : 0),

      );



      return {

        ...mission,

        directLayers,

        relatedActiveSdgs,

        score,

        active: directLayers.length > 0 || relatedActiveSdgs.length > 0,

      };

    });

  }, [goalStatsByNumber, visibleLayerIds]);



  const activeXdgCount = xdgMissionStats.filter((mission) => mission.active).length;



  const domainLabel = useMemo(() => {

    const domains = [

      {

        label: 'OCÉANO + CLIMA',

        goals: [6, 12, 13, 14, 15],

      },

      {

        label: 'GOBERNANZA + COOPERACIÓN',

        goals: [16, 17],

      },

      {

        label: 'CIENCIA + INFRAESTRUCTURA',

        goals: [7, 8, 9, 11],

      },

      {

        label: 'PERSONAS + EQUIDAD',

        goals: [1, 2, 3, 4, 5, 10],

      },

    ];



    const ranked = domains

      .map((domain) => ({

        ...domain,

        score: domain.goals.reduce(

          (sum, number) =>

            sum + (goalStatsByNumber.get(number)?.activeLayers.length || 0),

          0,

        ),

      }))

      .sort((a, b) => b.score - a.score);



    return ranked[0]?.score ? ranked[0].label : 'SIN DOMINIO DOMINANTE';

  }, [goalStatsByNumber]);



  if (!isOpen && !embedded) return null;



  const detailGoalNumber =

    activeGoalNumber ?? expandedGoalNumber;



  const detailGoal =

    SDG_GOALS.find((goal) => goal.number === detailGoalNumber) || null;



  const detailStat =

    detailGoalNumber !== null

      ? goalStatsByNumber.get(detailGoalNumber) || null

      : null;



  return (

    <>

      {!embedded && (

      <div

        className="fixed inset-0 z-[480] bg-black/35 backdrop-blur-[1px] transition-opacity"

        onClick={onClose}

      />

      )}



      <div

        className={embedded

          ? "relative w-full min-h-[560px] bg-transparent flex flex-col text-[#edf5f5]"

          : "fixed top-0 right-0 bottom-0 z-[490] w-full sm:w-[560px] xl:w-[640px] bg-[#071622fa] border-l border-[#1f3c4e] shadow-2xl backdrop-blur-xl flex flex-col text-[#edf5f5]"}

        style={{ fontFamily: "'DM Sans', sans-serif" }}

      >

        <div className="h-16 px-5 border-b border-[#1a3547] flex items-center justify-between shrink-0 bg-[#091c29]">

          <div className="flex items-center gap-2.5 min-w-0">

            <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] animate-pulse shrink-0" />

            <div className="min-w-0">

              <div className="text-xs font-mono font-bold uppercase tracking-[2px] text-[#caf9f7] truncate">

                LENTE SOSTENIBILIDAD & FUTURO

              </div>

              <div className="text-[9px] font-mono text-[#6f93a2] mt-0.5 truncate">

                CONTEXTO VIVO · CAPAS ACTIVAS · EVIDENCIA · PROSPECTIVA

              </div>

            </div>

          </div>



          <div className="flex items-center gap-2 shrink-0">

            {activeGoalNumber !== null && lensFramework === 'SDG_2030' && (

              <button

                onClick={() => onSelectGoal(null)}

                className="px-2.5 py-1 text-[10px] font-mono text-[#8faab5] hover:text-white rounded-lg bg-[#102533] border border-[#234357]"

              >

                LIMPIAR

              </button>

            )}

            {!embedded && (



            <button

              onClick={onClose}

              className="w-8 h-8 rounded-full bg-[#102533] hover:bg-[#1a384c] border border-[#234357] flex items-center justify-center text-[#8faab5] hover:text-white transition-all"

              aria-label="Cerrar Lente"

            >

              <X className="w-4 h-4" />

            </button>

            )}

          </div>

        </div>



        <div className={embedded && hideFrameworkTabs ? "hidden" : "px-3 py-2.5 bg-[#06141e] border-b border-[#152e3e] flex gap-1.5 overflow-x-auto"}>

          <button

            onClick={() => setLensFramework('SDG_2030')}

            className={`flex-1 py-2 px-2 rounded-xl text-[10px] font-bold font-mono flex items-center justify-center gap-1.5 transition-all shrink-0 ${

              lensFramework === 'SDG_2030'

                ? 'bg-[#102d3f] border border-[#35c3c8] text-[#58d5e3] shadow-md'

                : 'bg-[#091e2b] border border-[#1b384c] text-[#8faab5] hover:text-white'

            }`}

          >

            <Globe2 className="w-3.5 h-3.5" />

            <span>ODS 2030 · ONU</span>

          </button>



          <button

            onClick={() => setLensFramework('XDG_2045')}

            className={`flex-1 py-2 px-2 rounded-xl text-[10px] font-bold font-mono flex items-center justify-center gap-1.5 transition-all shrink-0 ${

              lensFramework === 'XDG_2045'

                ? 'bg-[#102d3f] border border-[#a855f7] text-[#c084fc] shadow-md'

                : 'bg-[#091e2b] border border-[#1b384c] text-[#8faab5] hover:text-white'

            }`}

          >

            <Sparkles className="w-3.5 h-3.5" />

            <span>XDGs 2045 · AMOH</span>

          </button>



          <button

            onClick={() => setLensFramework('COOPERATION')}

            className={`flex-1 py-2 px-2 rounded-xl text-[10px] font-bold font-mono flex items-center justify-center gap-1.5 transition-all shrink-0 ${

              lensFramework === 'COOPERATION'

                ? 'bg-[#102d3f] border border-[#00a6a6] text-[#58d5e3] shadow-md'

                : 'bg-[#091e2b] border border-[#1b384c] text-[#8faab5] hover:text-white'

            }`}

          >

            <Handshake className="w-3.5 h-3.5" />

            <span>COOPERACIÓN</span>

          </button>

        </div>



        {lensFramework !== 'COOPERATION' && (

          <div className="px-4 py-3 border-b border-[#152e3e] bg-[#071925]">

            <div className="grid grid-cols-4 gap-2">

              <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] p-2.5">

                <div className="text-[8px] font-mono uppercase text-[#6e96a4]">ODS impactados</div>

                <div className="text-lg font-black text-cyan-300 leading-none mt-1">

                  {impactedSdgCount}

                  <span className="text-[9px] text-[#688795] font-mono ml-1">/17</span>

                </div>

              </div>



              <div className="rounded-xl border border-violet-400/20 bg-violet-400/[0.05] p-2.5">

                <div className="text-[8px] font-mono uppercase text-[#6e96a4]">XDG activos</div>

                <div className="text-lg font-black text-violet-300 leading-none mt-1">

                  {activeXdgCount}

                  <span className="text-[9px] text-[#688795] font-mono ml-1">/11</span>

                </div>

              </div>



              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-2.5">

                <div className="text-[8px] font-mono uppercase text-[#6e96a4]">Capas vinculadas</div>

                <div className="text-lg font-black text-emerald-300 leading-none mt-1">

                  {linkedLayerCount}

                </div>

              </div>



              <div className="rounded-xl border border-slate-500/20 bg-slate-500/[0.05] p-2.5 min-w-0">

                <div className="text-[8px] font-mono uppercase text-[#6e96a4]">Dominio</div>

                <div className="text-[9px] font-bold text-white mt-1 leading-tight line-clamp-2">

                  {domainLabel}

                </div>

              </div>

            </div>

          </div>

        )}



        {lensFramework === 'SDG_2030' && (

          <div className="flex-1 min-h-0 flex flex-col">

            <div className="p-4 pb-3 border-b border-[#152e3e]">

              <div className="flex items-center justify-between gap-3">

                <div>

                  <div className="text-[9px] font-mono uppercase tracking-wider text-[#75a3b4]">

                    AGENDA 2030 · 17 OBJETIVOS OFICIALES ONU

                  </div>

                  <div className="text-[11px] text-[#8faab5] mt-1">

                    La relevancia AMOH es derivada del contexto visible del mapa; no es una puntuación oficial de la ONU.

                  </div>

                </div>



                <div className="flex items-center gap-1 text-[8px] font-mono text-cyan-300 border border-cyan-400/20 rounded-lg px-2 py-1 shrink-0">

                  <Gauge className="w-3 h-3" />

                  RELEVANCIA AMOH

                </div>

              </div>



              <div className="relative mt-3">

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6f93a2]" />

                <input

                  value={query}

                  onChange={(event) => setQuery(event.target.value)}

                  placeholder="Buscar ODS, tema o contexto..."

                  className="w-full rounded-xl bg-[#06141e] border border-[#1c3a4c] pl-9 pr-3 py-2 text-[11px] text-white placeholder-[#5f7e8c] outline-none focus:border-[#35c3c8]"

                />

              </div>

            </div>



            <div className="flex-1 overflow-y-auto p-4 space-y-2">

              {filteredGoals.map((stat) => {

                const goal = stat.goal;

                const isSelected = activeGoalNumber === goal.number;

                const isExpanded = detailGoalNumber === goal.number;

                const color = goalColor(goal);



                return (

                  <div

                    key={goal.number}

                    className={`rounded-2xl border transition-all overflow-hidden ${

                      isSelected

                        ? 'bg-[#0b2634] border-[#58d5e3] shadow-[0_0_24px_rgba(88,213,227,0.08)]'

                        : 'bg-[#081923] border-[#173445] hover:border-[#24536b]'

                    }`}

                  >

                    <div className="p-3">

                      <div className="flex gap-3 items-start">

                        <div

                          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0 shadow-lg border border-white/10"

                          style={{ backgroundColor: color }}

                        >

                          {String(goal.number).padStart(2, '0')}

                        </div>



                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-2">

                            <div className="min-w-0">

                              <div className="text-[12px] font-bold text-white truncate">

                                {goalName(goal)}

                              </div>

                              <div className="text-[9px] text-[#89a8b4] mt-0.5 line-clamp-2 leading-relaxed">

                                {goalDescription(goal)}

                              </div>

                            </div>



                            <div className="text-right shrink-0">

                              <div className="text-[15px] font-black text-white leading-none">

                                {stat.score}

                              </div>

                              <div className="text-[7px] font-mono text-[#607e8a] mt-1">/100</div>

                            </div>

                          </div>



                          <div className="h-1.5 rounded-full bg-[#031018] mt-2 overflow-hidden">

                            <div

                              className="h-full rounded-full transition-all"

                              style={{

                                width: `${stat.score}%`,

                                backgroundColor: color,

                              }}

                            />

                          </div>



                          <div className="flex flex-wrap gap-1.5 mt-2">

                            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-md border ${levelStyle(stat.level)}`}>

                              {stat.level}

                            </span>



                            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-md border border-cyan-500/20 bg-cyan-500/[0.06] text-[#8edbe2]">

                              {stat.activeLayers.length} CAPA{stat.activeLayers.length === 1 ? '' : 'S'}

                            </span>



                            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-md border border-slate-500/20 bg-slate-500/[0.06] text-[#9db2bb]">

                              {stat.evidenceCount} FUENTE{stat.evidenceCount === 1 ? '' : 'S'}

                            </span>



                            {stat.activeLayers.length >= 2 && (

                              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-md border border-violet-500/25 bg-violet-500/[0.08] text-violet-300">

                                CRUCE LISTO

                              </span>

                            )}

                          </div>

                        </div>

                      </div>



                      <div className="flex gap-2 mt-3">

                        <button

                          onClick={() =>

                            onSelectGoal(isSelected ? null : goal.number)

                          }

                          className={`flex-1 rounded-lg py-1.5 text-[9px] font-mono font-bold border transition-all ${

                            isSelected

                              ? 'bg-[#58d5e3] border-[#58d5e3] text-[#04131b]'

                              : 'bg-[#07151f] border-[#1d4357] text-[#9bc0cc] hover:text-white hover:border-[#35c3c8]'

                          }`}

                        >

                          {isSelected ? 'ACTIVO EN MAPA' : 'FILTRAR MAPA'}

                        </button>



                        <button

                          onClick={() =>

                            setExpandedGoalNumber(

                              isExpanded && !isSelected ? null : goal.number,

                            )

                          }

                          className="px-3 rounded-lg py-1.5 text-[9px] font-mono font-bold bg-[#07151f] border border-[#1d4357] text-[#9bc0cc] hover:text-white hover:border-[#35c3c8]"

                        >

                          {isExpanded ? 'OCULTAR' : 'EVIDENCIA'}

                        </button>

                      </div>

                    </div>



                    {isExpanded && detailGoal && detailStat && (

                      <div className="border-t border-[#173445] bg-[#06141e] p-3 space-y-3">

                        <div className="grid grid-cols-2 gap-2">

                          <div className="rounded-xl border border-[#173445] p-2.5 bg-[#071923]">

                            <div className="text-[8px] font-mono text-[#6f93a2] uppercase flex items-center gap-1">

                              <Layers3 className="w-3 h-3" />

                              Capas activas

                            </div>

                            <div className="text-lg font-black text-cyan-300 mt-1">

                              {detailStat.activeLayers.length}

                            </div>

                          </div>



                          <div className="rounded-xl border border-[#173445] p-2.5 bg-[#071923]">

                            <div className="text-[8px] font-mono text-[#6f93a2] uppercase flex items-center gap-1">

                              <Database className="w-3 h-3" />

                              Fuentes declaradas

                            </div>

                            <div className="text-lg font-black text-emerald-300 mt-1">

                              {detailStat.evidenceCount}

                            </div>

                          </div>

                        </div>



                        {detailStat.activeLayers.length > 0 ? (

                          <div>

                            <div className="text-[8px] font-mono uppercase text-[#6f93a2] mb-1.5">

                              CONTEXTO ACTIVO DEL MAPA

                            </div>

                            <div className="flex flex-wrap gap-1">

                              {detailStat.activeLayers.slice(0, 8).map((id) => (

                                <span

                                  key={id}

                                  className="text-[8px] px-1.5 py-1 rounded bg-[#0c2835] border border-[#1c4a5d] text-[#9fd8df]"

                                >

                                  {compactLayerName(id)}

                                </span>

                              ))}

                            </div>

                          </div>

                        ) : (

                          <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-2.5 text-[9px] text-amber-100/80">

                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />

                            No hay capas visibles vinculadas a este ODS en el contexto actual del mapa.

                          </div>

                        )}



                        {goalSources(detailGoal).length > 0 && (

                          <div>

                            <div className="text-[8px] font-mono uppercase text-[#6f93a2] mb-1.5">

                              FUENTES / PROCEDENCIA DECLARADA

                            </div>

                            <div className="space-y-1.5">

                              {goalSources(detailGoal).slice(0, 4).map((source: any, index: number) => {

                                const label =

                                  source?.provider ||

                                  source?.name ||

                                  source?.label ||

                                  `Fuente ${index + 1}`;



                                return (

                                  <div

                                    key={`${label}-${index}`}

                                    className="flex items-center justify-between gap-2 rounded-lg border border-[#173445] bg-[#071923] px-2.5 py-2"

                                  >

                                    <span className="text-[9px] text-[#a8c0c9] truncate">

                                      {String(label)}

                                    </span>



                                    {source?.url && (

                                      <a

                                        href={String(source.url)}

                                        target="_blank"

                                        rel="noreferrer"

                                        className="text-cyan-300 hover:text-white shrink-0"

                                      >

                                        <ExternalLink className="w-3 h-3" />

                                      </a>

                                    )}

                                  </div>

                                );

                              })}

                            </div>

                          </div>

                        )}



                        <div className="rounded-xl border border-[#173445] bg-[#071923] p-2.5">

                          <div className="text-[8px] font-mono uppercase text-[#6f93a2] flex items-center gap-1">

                            <Info className="w-3 h-3" />

                            Lectura AMOH

                          </div>

                          <div className="text-[9px] text-[#a7bbc3] mt-1.5 leading-relaxed">

                            La puntuación resume presencia de capas relacionadas, disponibilidad cartográfica y fuentes declaradas. No sustituye los indicadores oficiales del ODS.

                          </div>

                        </div>



                        {onOpenScienceModal && (

                          <button

                            onClick={() => onOpenScienceModal(detailGoal)}

                            className="w-full rounded-lg border border-cyan-400/25 bg-cyan-400/[0.07] py-2 text-[9px] font-mono font-bold text-cyan-200 hover:bg-cyan-400/[0.12]"

                          >

                            ABRIR CONTEXTO CIENTÍFICO

                          </button>

                        )}

                      </div>

                    )}

                  </div>

                );

              })}

            </div>

          </div>

        )}



        {lensFramework === 'XDG_2045' && (

          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            <div className="rounded-2xl border border-violet-400/25 bg-violet-400/[0.06] p-3.5">

              <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-2 text-violet-300 font-bold text-[11px]">

                  <Sparkles className="w-4 h-4" />

                  XDGs 2045 · MISIONES PROSPECTIVAS AMOH

                </div>



                <span className="text-[8px] font-mono border border-violet-400/25 rounded-full px-2 py-1 text-violet-200 shrink-0">

                  5 Ps · NO OFICIAL

                </span>

              </div>



              <p className="text-[10px] text-[#9aaeb8] mt-2 leading-relaxed">

                Marco de futuros para explorar Planeta, Personas, Prosperidad, Paz y Alianzas. Los scores son derivados de capas activas y vínculos ODS; no son indicadores oficiales ni predicciones.

              </p>

            </div>



            <div className="space-y-3">

              {XDG_2045_FRAMEWORK.map((pillar) => {

                const isSelected = selectedXdgPillar === pillar.id;



                const missions = xdgMissionStats.filter(

                  (mission) => mission.pillar === pillar.id,

                );



                const activeMissions = missions.filter((mission) => mission.active).length;

                const pillarScore = missions.length

                  ? Math.round(

                      missions.reduce((sum, mission) => sum + mission.score, 0) /

                        missions.length,

                    )

                  : 0;



                return (

                  <div

                    key={pillar.id}

                    className={`rounded-2xl border overflow-hidden transition-all ${

                      isSelected

                        ? 'bg-[#0c2131] border-violet-400/40'

                        : 'bg-[#081824] border-[#183144] hover:border-[#28506a]'

                    }`}

                  >

                    <button

                      onClick={() =>

                        setSelectedXdgPillar(isSelected ? null : pillar.id)

                      }

                      className="w-full text-left p-4"

                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <span

                            className="inline-flex px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase"

                            style={{

                              backgroundColor: `${pillar.color}18`,

                              color: pillar.color,

                              border: `1px solid ${pillar.color}45`,

                            }}

                          >

                            {pillar.name}

                          </span>



                          <div className="text-[11px] font-bold text-white mt-2 leading-snug">

                            {pillar.focus}

                          </div>

                        </div>



                        <div className="flex items-center gap-2 shrink-0">

                          <div className="text-right">

                            <div className="text-[16px] leading-none font-black text-white">

                              {pillarScore}

                            </div>

                            <div className="text-[7px] font-mono text-[#678491] mt-1">AMOH /100</div>

                          </div>



                          {isSelected ? (

                            <ChevronUp className="w-4 h-4 text-violet-300" />

                          ) : (

                            <ChevronDown className="w-4 h-4 text-violet-300" />

                          )}

                        </div>

                      </div>



                      <div className="flex gap-1.5 mt-2">

                        <span className="text-[8px] font-mono rounded-md px-1.5 py-0.5 border border-violet-400/20 text-violet-200 bg-violet-400/[0.06]">

                          {activeMissions}/{missions.length} MISIONES ACTIVAS

                        </span>

                        <span className="text-[8px] font-mono rounded-md px-1.5 py-0.5 border border-[#224255] text-[#8aa9b5] bg-[#07151f]">

                          {missions.reduce((sum, mission) => sum + mission.directLayers.length, 0)} CAPAS

                        </span>

                      </div>

                    </button>



                    {isSelected && (

                      <div className="border-t border-[#183144] p-3 space-y-2 bg-[#06141e]">

                        <div className="text-[9px] text-[#8faab5] leading-relaxed px-1 pb-1">

                          {pillar.antarcticRelevance}

                        </div>



                        {missions.map((mission) => {

                          const open = selectedXdgMission === mission.id;



                          return (

                            <div

                              key={mission.id}

                              className={`rounded-xl border ${

                                mission.active

                                  ? 'border-cyan-400/25 bg-cyan-400/[0.04]'

                                  : 'border-[#173445] bg-[#071923]'

                              }`}

                            >

                              <button

                                onClick={() =>

                                  setSelectedXdgMission(open ? null : mission.id)

                                }

                                className="w-full text-left p-3"

                              >

                                <div className="flex items-start justify-between gap-3">

                                  <div className="min-w-0">

                                    <div className="text-[10px] font-bold text-white">

                                      {mission.title}

                                    </div>

                                    <div className="text-[8px] text-[#7f9aa6] mt-1 line-clamp-2">

                                      {mission.description}

                                    </div>

                                  </div>



                                  <div className="text-right shrink-0">

                                    <div className={`text-[13px] font-black ${mission.active ? 'text-cyan-300' : 'text-[#607b87]'}`}>

                                      {mission.score}

                                    </div>

                                    <div className="text-[7px] font-mono text-[#607b87]">/100</div>

                                  </div>

                                </div>

                              </button>



                              {open && (

                                <div className="px-3 pb-3 space-y-2">

                                  <div className="flex flex-wrap gap-1">

                                    {mission.relatedSdgs.map((number) => (

                                      <span

                                        key={number}

                                        className={`text-[8px] font-mono rounded px-1.5 py-0.5 border ${

                                          mission.relatedActiveSdgs.includes(number)

                                            ? 'border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-200'

                                            : 'border-[#233d4b] bg-[#07151f] text-[#718b96]'

                                        }`}

                                      >

                                        ODS {number}

                                      </span>

                                    ))}

                                  </div>



                                  {mission.directLayers.length > 0 ? (

                                    <div className="flex flex-wrap gap-1">

                                      {mission.directLayers.slice(0, 8).map((id) => (

                                        <span

                                          key={id}

                                          className="text-[8px] rounded px-1.5 py-0.5 bg-[#0b2935] border border-[#1d4a5c] text-[#9dd9df]"

                                        >

                                          {compactLayerName(id)}

                                        </span>

                                      ))}

                                    </div>

                                  ) : (

                                    <div className="text-[8px] text-[#6f8994]">

                                      Sin capas directas activas para esta misión en el mapa actual.

                                    </div>

                                  )}

                                </div>

                              )}

                            </div>

                          );

                        })}



                        {pillar.themes?.length > 0 && (

                          <div className="rounded-xl border border-[#173445] bg-[#071923] p-3">

                            <div className="text-[8px] font-mono uppercase text-[#6f93a2] flex items-center gap-1">

                              <Network className="w-3 h-3" />

                              Base temática existente

                            </div>



                            <div className="space-y-1.5 mt-2">

                              {pillar.themes.map((theme, index) => (

                                <div key={`${theme.title}-${index}`}>

                                  <div className="text-[9px] font-semibold text-[#b5c9d0]">

                                    {theme.title}

                                  </div>

                                  <div className="text-[8px] text-[#718b96] mt-0.5">

                                    {theme.description}

                                  </div>

                                </div>

                              ))}

                            </div>

                          </div>

                        )}

                      </div>

                    )}

                  </div>

                );

              })}

            </div>

          </div>

        )}



        {lensFramework === 'COOPERATION' && (

          <div className="flex-1 overflow-y-auto">

            <InternationalCooperationPanel />

          </div>

        )}



        <div className="px-4 py-3 border-t border-[#1a3547] bg-[#091c29] flex items-center justify-between gap-3 text-[9px] font-mono text-[#71909f] shrink-0">

          <div className="flex items-center gap-2 min-w-0">

            {lensFramework === 'SDG_2030' ? (

              <Globe2 className="w-3.5 h-3.5 text-[#58d5e3] shrink-0" />

            ) : lensFramework === 'XDG_2045' ? (

              <Sparkles className="w-3.5 h-3.5 text-violet-300 shrink-0" />

            ) : (

              <Handshake className="w-3.5 h-3.5 text-emerald-300 shrink-0" />

            )}



            <span className="truncate">

              {lensFramework === 'SDG_2030'

                ? 'Agenda 2030 para el Desarrollo Sostenible'

                : lensFramework === 'XDG_2045'

                  ? 'Marco prospectivo AMOH 2045 · 5 Ps'

                  : 'Cooperación Polar Multilateral & Fondos ODS'}

            </span>

          </div>



          <span className="shrink-0">

            {lensFramework === 'SDG_2030'

              ? 'ONU · OFICIAL'

              : lensFramework === 'XDG_2045'

                ? 'AMOH · PROSPECTIVA'

                : 'COOPERACIÓN'}

          </span>

        </div>

      </div>

    </>

  );

}

