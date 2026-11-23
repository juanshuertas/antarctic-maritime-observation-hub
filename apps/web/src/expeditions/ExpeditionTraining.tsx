import { useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  BookOpen,
  Building,
  Calendar,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import {
  SEED_PAC_COURSE,
  type PreAntarcticCourseRecord,
  getExpedition,
} from './expeditions-data';

export default function ExpeditionTraining(): ReactNode {
  const { expeditionId = 'exp-pac-13' } = useParams();
  const expedition = getExpedition(expeditionId);
  const [course] = useState<PreAntarcticCourseRecord>(SEED_PAC_COURSE);

  const completedHours = course.topics
    .filter((t) => t.completed)
    .reduce((acc, curr) => acc + curr.hours, 0);

  const totalHours = course.topics.reduce((acc, curr) => acc + curr.hours, 0);

  const avgScore =
    course.topics.reduce((acc, curr) => acc + (curr.evaluationScore || 0), 0) /
    course.topics.length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#091b29] border border-[#1b3543]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/30 flex items-center gap-1">
              <Award className="w-3 h-3" />
              <span>CAPACITACIÓN CIENTÍFICA POLAR OFICIAL</span>
            </span>
            <span className="text-[#8faab5] text-xs">
              Expedición: {expedition.title}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Curso Pre-Antártico Nacional (12 Módulos Obligatorios)
          </h2>
          <p className="text-xs text-[#8faab5] max-w-3xl mt-1">
            Certificación exigida por el Protocolo al Tratado Antártico y la Comisión Colombiana del Océano.
            Capacitación integral en bioseguridad, supervivencia polar, ética y legislación internacional.
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

      {/* Course Credential Spotlight Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0d263b] via-[#091f30] to-[#061520] border border-[#a855f7]/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#a855f7]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] text-xs font-bold border border-[#10b981]/40 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CERTIFICACIÓN EMITIDA</span>
              </span>
              <span className="text-xs text-[#8faab5]">
                Registro Oficial: <strong className="text-white">{course.certificateNumber}</strong>
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white font-sans">
              {course.edition}
            </h3>

            <p className="text-xs text-[#8faab5] max-w-2xl leading-relaxed">
              Expedicionario: <strong className="text-white">{course.userName}</strong>. Acreditado formalmente por la Comisión Colombiana del Océano y la Escuela Naval Almirante Padilla tras superar los 12 módulos técnicos y operacionales.
            </p>

            <div className="flex flex-wrap items-center gap-5 text-xs text-[#7195a6] pt-1">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#a855f7]" />
                <span>{course.institution}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>Emitido: 28 de Agosto, 2026</span>
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#06141f] border border-[#1b3543] flex flex-col items-center justify-center text-center gap-2 shrink-0 min-w-[220px]">
            <div className="text-3xl font-bold text-[#00e5ff] font-mono">
              {avgScore.toFixed(1)} / 100
            </div>
            <div className="text-[11px] text-[#8faab5]">
              Promedio General de Evaluación
            </div>
            <div className="text-[10px] text-[#10b981] font-bold">
              {completedHours} de {totalHours} horas completadas (100%)
            </div>
            <Link
              to="/passport/credentials"
              className="mt-2 w-full px-3 py-1.5 rounded-lg bg-[#a855f7]/20 hover:bg-[#a855f7]/30 border border-[#a855f7]/50 text-xs font-bold text-[#d8b4fe] transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ver en Pasaporte AMOH</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 12 Official Topics Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#a855f7]" />
            <span>Módulos de Capacitación y Evaluación ({course.topics.length})</span>
          </h3>
          <span className="text-xs text-[#8faab5]">
            Normado por SCAR / Protocolo de Madrid
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {course.topics.map((t, idx) => (
            <div
              key={t.topicId}
              className="p-4 rounded-xl bg-[#091b29] border border-[#1b3543] hover:border-[#2a4d63] transition-colors flex items-start justify-between gap-3"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#a855f7] font-bold">
                    MÓDULO {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-[#4b6d7f]">· {t.hours} horas</span>
                </div>
                <h4 className="text-xs font-bold text-white font-sans leading-snug">
                  {t.title}
                </h4>
                {t.completedAt && (
                  <div className="text-[10px] text-[#7195a6]">
                    Aprobado el {t.completedAt}
                  </div>
                )}
              </div>

              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Aprobado</span>
                </span>
                {t.evaluationScore && (
                  <span className="text-[11px] font-mono text-[#00e5ff] font-bold">
                    {t.evaluationScore} pts
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
