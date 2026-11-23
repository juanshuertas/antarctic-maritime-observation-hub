import { useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Lightbulb,
  CheckCircle2,
  Filter,
  ArrowLeft,
  GitBranch,
} from 'lucide-react';
import {
  SEED_PAC_LESSONS,
  type LessonLearned,
  getExpedition,
} from './expeditions-data';

export default function ExpeditionLessons(): ReactNode {
  const { expeditionId = 'exp-pac-13' } = useParams();
  const expedition = getExpedition(expeditionId);
  const [lessons] = useState<LessonLearned[]>(SEED_PAC_LESSONS);
  const [selectedCategory, setSelectedCategory] = useState<LessonLearned['category'] | 'ALL'>('ALL');

  const filteredLessons = lessons.filter(
    (l) => selectedCategory === 'ALL' || l.category === selectedCategory
  );

  const categories: LessonLearned['category'][] = [
    'DEVICES',
    'CONNECTIVITY',
    'LOGISTICS',
    'SAFETY',
    'SCIENCE',
    'DATA',
    'ENVIRONMENT',
    'TEAM',
    'METHOD',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#091b29] border border-[#1b3543]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 flex items-center gap-1">
              <Lightbulb className="w-3 h-3" />
              <span>GESTIÓN DE CONOCIMIENTO Y APRENDIZAJE POLAR</span>
            </span>
            <span className="text-[#8faab5] text-xs">
              Expedición: {expedition.title}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Lecciones Aprendidas y Recomendaciones para Futuras Campañas
          </h2>
          <p className="text-xs text-[#8faab5] max-w-3xl mt-1">
            Capitalización de aciertos y contingencias operacionales. Toda lección se formaliza como regla operativa transferible a las expediciones 14ª, 15ª y subsiguientes del PAC.
          </p>
        </div>

        <Link
          to={`/expeditions/${expeditionId}/readiness`}
          className="px-3.5 py-2 rounded-xl bg-[#0d2334] border border-[#1e3b50] hover:border-[#00e5ff]/50 text-xs text-[#d8e7ee] flex items-center gap-2 self-start md:self-auto transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span>Volver a Matriz</span>
        </Link>
      </div>

      {/* Domain Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-[#1b3543] no-scrollbar">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            selectedCategory === 'ALL'
              ? 'bg-[#00e5ff] text-[#050e14] font-bold'
              : 'bg-[#0d212d] text-[#8faab5] hover:text-white'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Todas las Categorías ({lessons.length})</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedCategory === cat
                ? 'bg-[#00e5ff] text-[#050e14] font-bold'
                : 'bg-[#0d212d] text-[#8faab5] hover:text-white'
            }`}
          >
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Lessons Cards */}
      <div className="space-y-4">
        {filteredLessons.map((l) => (
          <div
            key={l.lessonId}
            className="p-5 rounded-2xl bg-[#081824] border border-[#173042] hover:border-[#22445c] transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30">
                    {l.category}
                  </span>
                  {l.applicableToFutureExpeditions && (
                    <span className="text-xs text-[#72e0b5]">· Aplicable a Futuras Campañas PAC</span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white font-sans">{l.title}</h3>
              </div>

              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 shrink-0">
                REGLA FORMALIZADA
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#050f16] border border-[#122432] space-y-1 text-xs">
              <div className="text-[10px] uppercase font-bold text-[#8faab5]">
                Observación en Terreno:
              </div>
              <p className="text-[#98b2bf] leading-relaxed">{l.observation}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 space-y-1 text-xs text-[#d1fae5]">
              <div className="text-[10px] uppercase font-bold text-[#10b981] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Recomendación Operacional Transferible:</span>
              </div>
              <p className="leading-relaxed font-sans">{l.actionableRecommendation}</p>
            </div>

            <div className="text-[11px] text-[#608394] pt-1 border-t border-[#122837] flex items-center justify-between">
              <span>Módulo: <strong className="text-white">AMOH PAC Governance</strong></span>
              <span className="flex items-center gap-1 text-[#00e5ff]">
                <GitBranch className="w-3 h-3" />
                <span>Incorporado en Método AMOH v1.1-PAC</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
