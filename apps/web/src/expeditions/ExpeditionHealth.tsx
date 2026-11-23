import { useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Lock,
  ShieldCheck,
  Building,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Activity,
  Smile,
  Brain,
  Droplet,
  EyeOff,
} from 'lucide-react';
import {
  SEED_PAC_HEALTH,
  type HealthReadiness,
  getExpedition,
} from './expeditions-data';

export default function ExpeditionHealth(): ReactNode {
  const { expeditionId = 'exp-pac-13' } = useParams();
  const expedition = getExpedition(expeditionId);
  const [healthRecord] = useState<HealthReadiness>(SEED_PAC_HEALTH);

  return (
    <div className="space-y-6">
      {/* Top Banner with Strict Privacy Level */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#091b29] border border-[#1b3543]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>SENSITIVE_HUMAN_DATA · RESERVA MÉDICA</span>
            </span>
            <span className="text-[#8faab5] text-xs">
              Expedición: {expedition.title}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Aptitud Psicofísica y Certificación de Salud Polar
          </h2>
          <p className="text-xs text-[#8faab5] max-w-3xl mt-1">
            Validación de aptitud fisiológica para operaciones en aislamiento y frío extremo austral.
            Por estrictas normas éticas y de privacidad, <strong>ningún diagnóstico clínico privado ni historia médica es almacenada ni sincronizada a nubes públicas</strong>.
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

      {/* Operational Fitness Status Badge */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c2336] via-[#091c2b] to-[#061520] border border-[#10b981]/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#183446]">
          <div className="space-y-1">
            <div className="text-xs text-[#8faab5] uppercase tracking-wider">
              Estado de Aptitud Operacional
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white font-sans">
                {healthRecord.userName}
              </span>
              <span className="px-3 py-1 rounded-xl bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>APTO (FIT FOR DUTY)</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#7195a6]">
            <Droplet className="w-4 h-4 text-[#ef4444]" />
            <span>Grupo Sanguíneo: <strong className="text-white font-mono">{healthRecord.bloodType}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Dental */}
          <div className="p-4 rounded-xl bg-[#081824] border border-[#183344] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8faab5] flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-[#00e5ff]" />
                <span>Aptitud Odontológica</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#10b981]/20 text-[#10b981] font-bold">
                APROBADO
              </span>
            </div>
            <p className="text-[11px] text-[#7195a6] leading-relaxed">
              Examen y ortopantomografía sin focos infecciosos ni riesgo de urgencia en navegación aislada.
            </p>
          </div>

          {/* Psychological */}
          <div className="p-4 rounded-xl bg-[#081824] border border-[#183344] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8faab5] flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-[#a855f7]" />
                <span>Aptitud Psicológica</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#10b981]/20 text-[#10b981] font-bold">
                APROBADO
              </span>
            </div>
            <p className="text-[11px] text-[#7195a6] leading-relaxed">
              Evaluación psicométrica para trabajo en equipo en confinamiento y entornos polares de alto estrés.
            </p>
          </div>

          {/* Cardiovascular */}
          <div className="p-4 rounded-xl bg-[#081824] border border-[#183344] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8faab5] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#ef4444]" />
                <span>Resistencia Cardiovascular</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#10b981]/20 text-[#10b981] font-bold">
                APROBADO
              </span>
            </div>
            <p className="text-[11px] text-[#7195a6] leading-relaxed">
              Electrocardiograma de esfuerzo y tolerancia ergométrica bajo condiciones aeróbicas.
            </p>
          </div>
        </div>

        {/* Operational Scope & Non-Diagnostic Restrictions */}
        <div className="p-4 rounded-xl bg-[#071622] border border-[#1c394c] space-y-2 text-xs">
          <div className="font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00e5ff]" />
            <span>Alcance Operacional Autorizado</span>
          </div>
          <p className="text-[#8faab5] leading-relaxed">
            {healthRecord.specialFieldRestrictions}
          </p>
          <div className="text-[11px] text-[#72e0b5] pt-1">
            Observación de Emergencia: {healthRecord.emergencyAllergyWarning}
          </div>
        </div>

        {/* Institutional Verification Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-[11px] text-[#6b8b9c] border-t border-[#152e3d]">
          <span className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>Evaluado por: <strong className="text-white">{healthRecord.evaluatedByInstitution}</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Válido hasta: <strong className="text-white">{healthRecord.validUntil}</strong></span>
          </span>
          <span className="flex items-center gap-1.5 text-[#8faab5]">
            <EyeOff className="w-3.5 h-3.5" />
            <span>Datos protegidos por secreto médico normado</span>
          </span>
        </div>
      </div>
    </div>
  );
}
