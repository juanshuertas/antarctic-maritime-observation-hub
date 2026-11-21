import { useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Microscope,
  GitBranch,
  Database,
  Building,
  User,
  ArrowLeft,
  ListChecks,
} from 'lucide-react';
import {
  SEED_PAC_PROJECTS,
  SEED_METHOD_VERSIONS,
  type PacScienceProject,
  type MethodVersionRecord,
  getExpedition,
} from './expeditions-data';

export default function ExpeditionScience(): ReactNode {
  const { expeditionId = 'exp-pac-13' } = useParams();
  const expedition = getExpedition(expeditionId);
  const [projects] = useState<PacScienceProject[]>(SEED_PAC_PROJECTS);
  const [versions] = useState<MethodVersionRecord[]>(SEED_METHOD_VERSIONS);
  const [selectedTab, setSelectedTab] = useState<'PROJECTS' | 'METHOD_VERSIONING'>('PROJECTS');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#091b29] border border-[#1b3543]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 flex items-center gap-1">
              <Microscope className="w-3 h-3" />
              <span>CIENCIA PAC & EVOLUCIÓN METODOLÓGICA</span>
            </span>
            <span className="text-[#8faab5] text-xs">
              Expedición: {expedition.title}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Portafolio de Proyectos Científicos y Versionado de Métodos
          </h2>
          <p className="text-xs text-[#8faab5] max-w-3xl mt-1">
            AMOH opera como un proyecto científico autónomo y a la vez como infraestructura digital compartida para los proyectos aliados de la Expedición Colombiana.
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

      {/* Mode Tabs */}
      <div className="flex items-center gap-3 border-b border-[#1b3543] pb-2 text-xs">
        <button
          onClick={() => setSelectedTab('PROJECTS')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            selectedTab === 'PROJECTS'
              ? 'bg-[#00e5ff] text-[#050e14]'
              : 'bg-[#0a1e2b] text-[#8faab5] hover:text-white'
          }`}
        >
          <Microscope className="w-4 h-4" />
          <span>Proyectos de la Expedición ({projects.length})</span>
        </button>

        <button
          onClick={() => setSelectedTab('METHOD_VERSIONING')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            selectedTab === 'METHOD_VERSIONING'
              ? 'bg-[#00e5ff] text-[#050e14]'
              : 'bg-[#0a1e2b] text-[#8faab5] hover:text-white'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Continuidad de Expedición: NatGeo → PAC → Futuro</span>
        </button>
      </div>

      {/* Projects View */}
      {selectedTab === 'PROJECTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-sans">
              Proyectos de Investigación Evaluados para la Campaña
            </h3>
            <span className="text-xs text-[#8faab5]">
              Cumplimiento de estándares SCAR y Plan de Gestión de Datos (DMP)
            </span>
          </div>

          <div className="space-y-4">
            {projects.map((proj) => (
              <div
                key={proj.projectId}
                className="p-5 rounded-2xl bg-[#081824] border border-[#173042] hover:border-[#214157] transition-all space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30">
                        {proj.code}
                      </span>
                      <span className="text-xs text-[#527588]">· {proj.researchLine}</span>
                    </div>
                    <h4 className="text-base font-bold text-white font-sans">{proj.title}</h4>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 shrink-0 self-start">
                    {proj.status}
                  </span>
                </div>

                <p className="text-xs text-[#8faab5] leading-relaxed">{proj.objective}</p>

                {/* Methodology & Field Requirements */}
                <div className="p-3 rounded-xl bg-[#050f16] border border-[#112330] space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#00e5ff]">Metodología: </span>
                    <span className="text-[#9ab3bf]">{proj.methodology}</span>
                  </div>
                  {proj.fieldRequirements && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#72e0b5]">Requerimientos de Terreno: </span>
                      <span className="text-[#9ab3bf]">{proj.fieldRequirements}</span>
                    </div>
                  )}
                </div>

                {/* Metadata & Institution */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#7195a6] pt-1">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#00e5ff]" />
                    <span>IP: <strong className="text-white">{proj.principalInvestigator}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#a855f7]" />
                    <span>Institución: <strong className="text-white">{proj.institution}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>DMP: <strong className="text-[#10b981]">SCAR Compliant</strong></span>
                  </div>
                </div>

                {proj.methodVersion && (
                  <div className="pt-2 border-t border-[#122837] flex items-center gap-2 text-[11px] text-[#658797]">
                    <GitBranch className="w-3.5 h-3.5 text-[#00e5ff]" />
                    <span>Protocolo Operacional Asociado: <strong className="text-[#00e5ff] font-mono">{proj.methodVersion}</strong></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Method Versioning & Continuity View */}
      {selectedTab === 'METHOD_VERSIONING' && (
        <div className="p-5 rounded-2xl bg-[#081824] border border-[#173042] space-y-6">
          <div>
            <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-[#00e5ff]" />
              <span>Línea Evolutiva de Métodos Científicos Antárticos AMOH</span>
            </h3>
            <p className="text-xs text-[#8faab5] mt-1">
              Principio de Continuidad: Cada expedición refina los protocolos, calibraciones de sensores y modelos de Pythia para la siguiente campaña.
            </p>
          </div>

          {/* Timeline Nodes */}
          <div className="space-y-4 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#183a4f]">
            {versions.map((ver) => (
              <div key={ver.version} className="relative pl-10 space-y-2">
                <div className="absolute left-2.5 top-2 w-3.5 h-3.5 rounded-full bg-[#00e5ff] border-2 border-[#081824] -translate-x-1/2" />
                <div className="p-4 rounded-xl bg-[#091b29] border border-[#1b3543] space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#00e5ff] px-2 py-0.5 rounded bg-[#00e5ff]/10 border border-[#00e5ff]/30">
                        {ver.version}
                      </span>
                      <h4 className="text-sm font-bold text-white font-sans">{ver.name}</h4>
                    </div>
                    <span className="text-xs text-[#8faab5]">
                      Fecha de Adopción: {ver.usedAt}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#050f16] border border-[#112330] space-y-1.5 text-xs">
                    <div className="text-[10px] text-[#72e0b5] font-bold uppercase flex items-center gap-1.5">
                      <ListChecks className="w-3.5 h-3.5" />
                      <span>Registro de Innovaciones y Ajustes Metodológicos:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[#8faab5] text-[11px]">
                      {ver.changeLog.map((logItem, i) => (
                        <li key={i}>{logItem}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
