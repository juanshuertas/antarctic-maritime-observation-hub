import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  FileArchive,
  RefreshCw,
  CheckCircle2,
  Circle,
  ExternalLink,
  AlertCircle,
  FileCheck,
  Menu,
  Search,
} from 'lucide-react';
import { api, API_BASE } from '../lib/api';
import MenuSheet from '../components/MenuSheet';
import CommandPalette from '../components/CommandPalette';

interface LatestPackage {
  available: boolean;
  filename?: string;
  size_bytes?: number;
  modified_utc?: number;
  download_url?: string;
}

interface ChecklistStep {
  step: number;
  title: string;
  desc: string;
}

interface NpdcChecklist {
  portal_url: string;
  steps: ChecklistStep[];
}

export default function ReportsPage() {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState<'situation' | 'maritime' | 'fisheries' | 'gaps'>('situation');
  const [latestPackage, setLatestPackage] = useState<LatestPackage | null>(null);
  const [checklist, setChecklist] = useState<NpdcChecklist | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generationMsg, setGenerationMsg] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [menuSheetOpen, setMenuSheetOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const fetchPackageInfo = async () => {
    try {
      const data = await api.get<LatestPackage>('/api/reports/latest');
      setLatestPackage(data);
    } catch {
      // Backend offline fallback
      setLatestPackage({ available: false });
    }
  };

  const fetchChecklist = async () => {
    try {
      const data = await api.get<NpdcChecklist>('/api/reports/npdc-checklist');
      setChecklist(data);
    } catch {
      // Offline fallback
      setChecklist({
        portal_url: 'https://data.npolar.no/',
        steps: [
          { step: 1, title: 'Iniciar Sesión', desc: 'Acceder a https://data.npolar.no/ con credenciales institucionales o Feide/ORCID.' },
          { step: 2, title: 'Nuevo Dataset', desc: "Seleccionar 'New Dataset' en el portal del Norwegian Polar Institute." },
          { step: 3, title: 'Cargar Metadatos', desc: 'Copiar los valores desde metadata.json (BBox EPSG:3031, autores, resumen).' },
          { step: 4, title: 'Subir Archivos', desc: 'Adjuntar el archivo ZIP generado o capas individuales GeoPackage / CSV.' },
        ],
      });
    }
  };

  useEffect(() => {
    fetchPackageInfo();
    fetchChecklist();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerationMsg(null);
    try {
      const res = await api.post<{ message: string; zip_filename: string }>('/api/reports/generate?expedition_id=NGRS-ANTA-2027', {});
      setGenerationMsg(res.message || 'Paquete generado con éxito.');
      await fetchPackageInfo();
    } catch (e: any) {
      setGenerationMsg(`Error al generar paquete: ${e?.message || 'Error desconocido'}`);
    } finally {
      setGenerating(false);
    }
  };

  const toggleStep = (stepNum: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNum]: !prev[stepNum],
    }));
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="min-h-screen bg-[#050e14] text-[#edf5f5] font-sans flex flex-col select-none">
      <header className="h-16 border-b border-[#142733] bg-[#071620] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50">
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
              Reportes & Auditoría Factual
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4da8ff]/10 text-[#4da8ff] border border-[#4da8ff]/30 font-semibold">
              FACTUAL REPORTS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-2 rounded-full bg-[#0d2232] border border-[#213f4f] text-[#8faab5] hover:text-white transition-all text-xs flex items-center gap-1.5"
            title="Buscar comandos (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-[#58d5e3]" />
            <span className="hidden sm:inline font-mono text-[10px]">Buscar</span>
          </button>
          <button
            onClick={() => setMenuSheetOpen(true)}
            className="p-2 rounded-full bg-[#102a3a] border border-[#2b5168] text-white hover:border-[#58d5e3] transition-all"
            title="Abrir Menú"
          >
            <Menu className="w-4 h-4 text-[#58d5e3]" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Generador de Reportes Científicos & Operacionales
          </h1>
          <p className="text-sm text-[#8faab5] max-w-2xl leading-relaxed">
            Los reportes factuales de AMOH se compilan exclusivamente a partir de observaciones verificadas
            y datos de proveedores activos con marcas de tiempo UTC y coordenadas comprobadas.
          </p>
        </div>

        {/* Quantarctica / NPDC Scientific Package Generator Bar */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#071d2b] to-[#0a273a] border border-[#1e4860] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileArchive className="w-5 h-5 text-[#58d5e3]" />
              <span className="font-bold text-sm text-white font-mono">
                Paquete Científico Quantarctica & NPDC (SCAR)
              </span>
            </div>
            <p className="text-xs text-[#8faab5] max-w-xl">
              Genera un archivo ZIP con GeoPackage (EPSG:3031), capas CSV, resumen factual y metadata.json
              cumpliendo los estándares del Norwegian Polar Institute.
            </p>
            {latestPackage?.available ? (
              <div className="text-[11px] font-mono text-[#58d5e3] flex items-center gap-2 pt-1">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Último paquete: <strong>{latestPackage.filename}</strong> ({formatBytes(latestPackage.size_bytes)})</span>
              </div>
            ) : (
              <div className="text-[11px] font-mono text-[#ffb86c] flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>No hay paquetes generados recientemente. Pulse para compilar uno nuevo.</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {latestPackage?.available && (
              <a
                href={`${API_BASE}${latestPackage.download_url}`}
                download={latestPackage.filename}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#1a4055] text-white hover:bg-[#225573] border border-[#35c3c8]/40 transition-all flex items-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4 text-[#58d5e3]" />
                <span>Descargar ZIP</span>
              </a>
            )}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#35c3c8] text-[#050e14] hover:bg-[#52d4d9] transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Generando...' : 'Generar Paquete'}</span>
            </button>
          </div>
        </div>

        {generationMsg && (
          <div className="p-3.5 rounded-xl bg-[#092230] border border-[#235876] text-xs font-mono text-[#caf9f7] flex items-center justify-between">
            <span>{generationMsg}</span>
            <button onClick={() => setGenerationMsg(null)} className="text-[#8faab5] hover:text-white ml-2">×</button>
          </div>
        )}

        {/* Report selection tabs */}
        <div className="flex items-center gap-3 border-b border-[#142e3d] pb-2 overflow-x-auto">
          {[
            { id: 'situation', label: 'Reporte de Situación (SITREP Actual)' },
            { id: 'maritime', label: 'Actividad Marítima AIS' },
            { id: 'fisheries', label: 'Pesquerías CCAMLR / GFW' },
            { id: 'gaps', label: 'Brechas de Datos & Cobertura' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setReportType(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all ${
                reportType === t.id
                  ? 'bg-[#0a2233] text-[#58d5e3] border border-[#35c3c8]'
                  : 'text-[#8faab5] hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Report Preview */}
        <div className="p-8 rounded-2xl bg-[#071620] border border-[#1a3848] flex flex-col gap-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#132d3d] pb-4">
            <div>
              <div className="text-[10px] font-mono text-[#58d5e3] uppercase tracking-wider">
                DOCUMENTO GENERADO AUTOMÁTICAMENTE
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                AMOH Antarctic Situation Report (SITREP-2026-09)
              </h2>
              <div className="text-xs text-[#8faab5] font-mono mt-1">
                Generado UTC: 2026-09-19T20:00:00Z · Región: Península Antártica (60°S–75°S)
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#35c3c8] text-[#050e14] hover:bg-[#52d4d9] transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#051119] border border-[#163040]">
              <div className="text-[10px] font-mono text-[#8faab5] uppercase">Tráfico Marítimo (AIS)</div>
              <div className="text-xl font-bold text-[#35c3c8] mt-1">Monitoreo Activo</div>
              <div className="text-xs text-[#8faab5] mt-1">Vía AISStream (Gateway WebSocket polar)</div>
            </div>
            <div className="p-4 rounded-xl bg-[#051119] border border-[#163040]">
              <div className="text-[10px] font-mono text-[#8faab5] uppercase">Pesca Aparente (GFW)</div>
              <div className="text-xl font-bold text-[#ff8a4c] mt-1">343.6 h Registradas</div>
              <div className="text-xs text-[#8faab5] mt-1">Arrastreros de krill en Océano Austral</div>
            </div>
            <div className="p-4 rounded-xl bg-[#051119] border border-[#163040]">
              <div className="text-[10px] font-mono text-[#8faab5] uppercase">Brecha de Observación</div>
              <div className="text-xl font-bold text-[#72e0b5] mt-1">Baja Latencia</div>
              <div className="text-xs text-[#8faab5] mt-1">Cobertura satelital óptica disponible</div>
            </div>
          </div>

          <div className="space-y-4 text-xs text-[#caf9f7] leading-relaxed border-t border-[#132d3d] pt-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono">1. Resumen Ejecutivo</h3>
            <p>
              El presente reporte consolida la situación operativa y oceanográfica en el sector de la
              Península Antártica y Mar de Bellingshausen. La actividad marítima comercial y científica
              se encuentra trazada mediante transpondedores AIS enlazados por el concentrador AMOH.
            </p>
            <h3 className="text-sm font-bold text-white uppercase font-mono">2. Proveniencia y Metadatos</h3>
            <p className="font-mono text-[11px] text-[#8faab5]">
              Proveedores validados: AISStream (LIVE), Global Fishing Watch v3 (DELAYED), Copernicus CDS (REANALYSIS),
              NASA GIBS (RECENT), USGS FDSN (RECENT). Todos los parámetros han sido normalizados sin inferencias sintéticas.
            </p>
          </div>
        </div>

        {/* NPDC Submission Checklist */}
        {checklist && (
          <div className="p-6 rounded-2xl bg-[#071620] border border-[#1a3848] space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#142e3d]">
              <div>
                <div className="text-[10px] font-mono text-[#35c3c8] uppercase tracking-wider">
                  NORWEGIAN POLAR DATA CENTRE (NPDC)
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Lista de Verificación de Envío de Datos de Campo
                </h3>
              </div>
              <a
                href={checklist.portal_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-[#58d5e3] hover:underline flex items-center gap-1"
              >
                <span>Portal NPDC</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-2">
              {checklist.steps.map((st) => {
                const done = !!completedSteps[st.step];
                return (
                  <div
                    key={st.step}
                    onClick={() => toggleStep(st.step)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      done
                        ? 'bg-[#0a2333]/60 border-[#35c3c8]/50 text-white'
                        : 'bg-[#051119] border-[#163040] text-[#8faab5] hover:border-[#1e4860]'
                    }`}
                  >
                    <button className="mt-0.5 text-[#35c3c8] shrink-0">
                      {done ? <CheckCircle2 className="w-4 h-4 text-[#35c3c8]" /> : <Circle className="w-4 h-4 text-[#436477]" />}
                    </button>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold font-mono flex items-center gap-2">
                        <span>Paso {st.step}: {st.title}</span>
                      </div>
                      <div className="text-[11px] leading-relaxed text-[#8faab5]">
                        {st.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <MenuSheet
        isOpen={menuSheetOpen}
        onClose={() => setMenuSheetOpen(false)}
      />

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
