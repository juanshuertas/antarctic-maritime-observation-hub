import { useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  HeartPulse,
  GraduationCap,
  Truck,
  Wrench,
  Microscope,
  ShieldCheck,
  TreePine,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  AlertCircle,
  Filter,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  SEED_PAC_READINESS,
  type ReadinessCategory,
  type ReadinessState,
  type ReadinessItem,
  getExpedition,
} from './expeditions-data';

const CATEGORY_META: Record<
  ReadinessCategory,
  { label: string; icon: typeof FileText; color: string }
> = {
  DOCUMENTS: { label: 'Documentación & Pasaportes', icon: FileText, color: 'text-[#00e5ff]' },
  HEALTH: { label: 'Aptitud Médica & Salud', icon: HeartPulse, color: 'text-[#ef4444]' },
  COURSE: { label: 'Curso Pre-Antártico', icon: GraduationCap, color: 'text-[#a855f7]' },
  LOGISTICS: { label: 'Logística & Vuelos', icon: Truck, color: 'text-[#f59e0b]' },
  EQUIPMENT: { label: 'Equipos & Calibración', icon: Wrench, color: 'text-[#3b82f6]' },
  SCIENCE: { label: 'Plan Científico & DMP', icon: Microscope, color: 'text-[#10b981]' },
  SAFETY: { label: 'Seguridad Operacional', icon: ShieldCheck, color: 'text-[#f97316]' },
  ENVIRONMENT: { label: 'Ambiente & Bioseguridad', icon: TreePine, color: 'text-[#22c55e]' },
  COMMUNICATIONS: { label: 'Comunicaciones & VHF', icon: Radio, color: 'text-[#06b6d4]' },
};

const STATE_META: Record<
  ReadinessState,
  { label: string; icon: typeof CheckCircle2; bg: string; text: string; border: string }
> = {
  COMPLETE: { label: 'Completado', icon: CheckCircle2, bg: 'bg-[#10b981]/15', text: 'text-[#10b981]', border: 'border-[#10b981]/30' },
  PENDING: { label: 'Pendiente', icon: Clock, bg: 'bg-[#f59e0b]/15', text: 'text-[#f59e0b]', border: 'border-[#f59e0b]/30' },
  NOT_REQUIRED: { label: 'No Requerido', icon: AlertCircle, bg: 'bg-[#64748b]/15', text: 'text-[#94a3b8]', border: 'border-[#64748b]/30' },
  EXPIRED: { label: 'Expirado', icon: XCircle, bg: 'bg-[#ef4444]/15', text: 'text-[#ef4444]', border: 'border-[#ef4444]/30' },
  REQUIRES_REVIEW: { label: 'Requiere Revisión', icon: AlertTriangle, bg: 'bg-[#f97316]/15', text: 'text-[#f97316]', border: 'border-[#f97316]/30' },
};

export default function ExpeditionReadiness(): ReactNode {
  const { expeditionId = 'exp-pac-13' } = useParams();
  const expedition = getExpedition(expeditionId);
  const [items, setItems] = useState<ReadinessItem[]>(SEED_PAC_READINESS);
  const [selectedCategory, setSelectedCategory] = useState<ReadinessCategory | 'ALL'>('ALL');
  const [selectedState, setSelectedState] = useState<ReadinessState | 'ALL'>('ALL');

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (selectedState !== 'ALL' && item.state !== selectedState) return false;
    return true;
  });

  const stateCounts = items.reduce(
    (acc, curr) => {
      acc[curr.state] = (acc[curr.state] || 0) + 1;
      return acc;
    },
    {} as Record<ReadinessState, number>
  );

  return (
    <div className="space-y-6">
      {/* Header & Explicit Rule Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#091b29] border border-[#1b3543]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30">
              PAC READINESS MATRIX
            </span>
            <span className="text-[#8faab5] text-xs">
              Expedición: {expedition.title}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Panel de Preparación y Alistamiento Operacional
          </h2>
          <p className="text-xs text-[#8faab5] max-w-3xl mt-1">
            Evaluación cualitativa y trazabilidad de los 9 pilares de alistamiento. Por estándar científico AMOH,
            <strong> no se genera un puntaje porcentual artificial global</strong>; cada requerimiento se audita en su estado real independiente.
          </p>
        </div>

        {/* Quick Navigation to specialized subviews */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            to={`/expeditions/${expeditionId}/documents`}
            className="px-3 py-1.5 rounded-xl bg-[#0d2334] border border-[#1e3b50] hover:border-[#00e5ff]/50 text-xs text-[#d8e7ee] flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>Documentos</span>
            <ArrowRight className="w-3 h-3 text-[#8faab5]" />
          </Link>
          <Link
            to={`/expeditions/${expeditionId}/health`}
            className="px-3 py-1.5 rounded-xl bg-[#0d2334] border border-[#1e3b50] hover:border-[#ef4444]/50 text-xs text-[#d8e7ee] flex items-center gap-1.5 transition-colors"
          >
            <HeartPulse className="w-3.5 h-3.5 text-[#ef4444]" />
            <span>Salud Privada</span>
            <ArrowRight className="w-3 h-3 text-[#8faab5]" />
          </Link>
          <Link
            to={`/expeditions/${expeditionId}/training`}
            className="px-3 py-1.5 rounded-xl bg-[#0d2334] border border-[#1e3b50] hover:border-[#a855f7]/50 text-xs text-[#d8e7ee] flex items-center gap-1.5 transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#a855f7]" />
            <span>Curso Pre-Antártico</span>
            <ArrowRight className="w-3 h-3 text-[#8faab5]" />
          </Link>
        </div>
      </div>

      {/* Real State Distribution Grid (No Fake 87% Score) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(['COMPLETE', 'PENDING', 'REQUIRES_REVIEW', 'EXPIRED', 'NOT_REQUIRED'] as ReadinessState[]).map(
          (st) => {
            const count = stateCounts[st] || 0;
            const meta = STATE_META[st];
            const Icon = meta.icon;
            const isActive = selectedState === st;
            return (
              <button
                key={st}
                onClick={() => setSelectedState(isActive ? 'ALL' : st)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isActive
                    ? `${meta.bg} ${meta.border} ring-1 ring-offset-0 ring-[#00e5ff]`
                    : 'bg-[#091824] border-[#152a38] hover:border-[#213f50]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-bold ${meta.text}`}>{meta.label}</span>
                  <Icon className={`w-4 h-4 ${meta.text}`} />
                </div>
                <div className="text-2xl font-bold text-white font-mono">{count}</div>
                <div className="text-[10px] text-[#8faab5] mt-1">requerimientos auditados</div>
              </button>
            );
          }
        )}
      </div>

      {/* Distinction Reminder: Legal Travel Passport != AMOH Scientific Passport */}
      <div className="p-4 rounded-xl bg-[#00e5ff]/5 border border-[#00e5ff]/20 flex items-start gap-3 text-xs text-[#b8dbe8]">
        <ShieldAlert className="w-5 h-5 text-[#00e5ff] shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Distinción Jurídica y Científica de Pasaportes:</strong> El
          <span className="text-[#00e5ff] font-bold"> Pasaporte Legal de Viaje</span> (República de Colombia) es el documento migratorio soberano. El
          <span className="text-[#72e0b5] font-bold"> Pasaporte Científico Digital AMOH</span> es una credencial de investigación polar interoperable (W3C DID). Ambos son gestionados independientemente con estricta reserva de datos.
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-[#1b3543] no-scrollbar">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            selectedCategory === 'ALL'
              ? 'bg-[#00e5ff] text-[#050e14] font-bold'
              : 'bg-[#0d212d] text-[#8faab5] hover:text-white hover:bg-[#122c3c]'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Todos los Pilares ({items.length})</span>
        </button>

        {(Object.keys(CATEGORY_META) as ReadinessCategory[]).map((cat) => {
          const meta = CATEGORY_META[cat];
          const Icon = meta.icon;
          const count = items.filter((i) => i.category === cat).length;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#00e5ff] text-[#050e14] font-bold'
                  : 'bg-[#0d212d] text-[#8faab5] hover:text-white hover:bg-[#122c3c]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#050e14]' : meta.color}`} />
              <span>{meta.label}</span>
              <span className="text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Readiness Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#091824] border border-[#152a38] text-center text-[#8faab5]">
            No hay requerimientos en esta categoría con el filtro seleccionado.
          </div>
        ) : (
          filteredItems.map((item) => {
            const catMeta = CATEGORY_META[item.category];
            const stateMeta = STATE_META[item.state];
            const CatIcon = catMeta.icon;
            const StateIcon = stateMeta.icon;

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#091b29] border border-[#1b3543] hover:border-[#28495c] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-[#8faab5]">
                      <CatIcon className={`w-3.5 h-3.5 ${catMeta.color}`} />
                      <span>{catMeta.label}</span>
                    </span>
                    <span className="text-[#3b5969]">·</span>
                    <h3 className="text-sm font-bold text-white font-sans">{item.title}</h3>
                  </div>

                  <p className="text-xs text-[#9eb6c1] leading-relaxed">{item.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#6b8b9c] pt-1">
                    {item.lastVerified && (
                      <span>Verificado: <strong className="text-[#8faab5]">{item.lastVerified}</strong></span>
                    )}
                    {item.verifier && (
                      <span>Por: <strong className="text-[#8faab5]">{item.verifier}</strong></span>
                    )}
                    {item.expiresAt && (
                      <span>Vence: <strong className="text-[#f59e0b]">{item.expiresAt}</strong></span>
                    )}
                  </div>

                  {item.actionRequired && (
                    <div className="mt-2 p-2 rounded-lg bg-[#f97316]/10 border border-[#f97316]/30 text-[11px] text-[#f97316] flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Acción Requerida: <strong>{item.actionRequired}</strong></span>
                    </div>
                  )}

                  {item.notes && !item.actionRequired && (
                    <div className="text-[11px] text-[#7da0b0] italic">
                      Nota: {item.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${stateMeta.bg} ${stateMeta.text} ${stateMeta.border}`}
                  >
                    <StateIcon className="w-4 h-4" />
                    <span>{stateMeta.label}</span>
                  </div>

                  <select
                    value={item.state}
                    onChange={(e) => {
                      const newState = e.target.value as ReadinessState;
                      setItems((prev) =>
                        prev.map((i) => (i.id === item.id ? { ...i, state: newState } : i))
                      );
                    }}
                    className="bg-[#0b1f2e] border border-[#1e3b50] rounded-lg px-2.5 py-1.5 text-xs text-[#8faab5] focus:outline-none focus:border-[#00e5ff]"
                  >
                    <option value="COMPLETE">Completado</option>
                    <option value="PENDING">Pendiente</option>
                    <option value="REQUIRES_REVIEW">Requiere Revisión</option>
                    <option value="EXPIRED">Expirado</option>
                    <option value="NOT_REQUIRED">No Requerido</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
