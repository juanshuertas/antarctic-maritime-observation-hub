import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  X,
  FileCheck,
  ChevronRight,
  Database
} from 'lucide-react';
import { useParams } from 'react-router-dom';

interface NpdcStep {
  step: number;
  title: string;
  desc: string;
}

export default function ExpeditionReports() {
  const { expeditionId = 'exp-pac-13' } = useParams();
  const [generating, setGenerating] = useState(false);
  const [packageInfo, setPackageInfo] = useState<{
    reportId?: string;
    zipName?: string;
    zipSize?: number;
    generatedAt?: string;
  } | null>(null);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checklist, setChecklist] = useState<NpdcStep[]>([]);
  const [proposalOpen, setProposalOpen] = useState(false);

  useEffect(() => {
    // Check if there is an existing package
    fetch('/api/reports/latest')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.available) {
          setPackageInfo({
            zipName: data.filename,
            zipSize: data.size_bytes,
            generatedAt: new Date(data.modified_utc * 1000).toLocaleString(),
          });
        }
      })
      .catch(() => {});

    fetch('/api/reports/npdc-checklist')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.steps) {
          setChecklist(data.steps);
        }
      })
      .catch(() => {});
  }, []);

  const handleGeneratePackage = async (type: 'report' | 'package') => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/reports/generate?expedition_id=${encodeURIComponent(expeditionId)}`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setPackageInfo({
          reportId: data.report_id,
          zipName: data.zip_path.split(/[\\/]/).pop(),
          zipSize: data.zip_size_bytes,
          generatedAt: new Date().toLocaleString(),
        });
        alert(type === 'report' ? 'Informe científico generado con éxito.' : 'Paquete Quantarctica / NPDC preparado y verificado.');
      } else {
        alert('No se pudo conectar al servicio local de generación de informes.');
      }
    } catch {
      alert('Error de conexión con el backend de generación.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadZip = () => {
    if (!packageInfo?.zipName) {
      alert('Primero genere o prepare el paquete científico.');
      return;
    }
    window.location.href = `/api/reports/download/${encodeURIComponent(packageInfo.zipName)}`;
  };

  const handleOpenNpdc = () => {
    window.open('https://data.npolar.no/', '_blank', 'noopener,noreferrer');
    setChecklistOpen(true);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="border-b border-[#1b3543] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#35c3c8]" />
            <span>Informes Científicos & Publicación Quantarctica / NPDC</span>
          </h2>
          <p className="text-[#8faab5] text-xs mt-0.5">
            Generación automatizada de informes de campaña, paquetes de datos abiertos para Quantarctica 3+ y flujo de publicación en Norwegian Polar Data Centre (NPDC).
          </p>
        </div>

        {/* Action Buttons Toolbar per Section K */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleGeneratePackage('report')}
            disabled={generating}
            className="px-3.5 py-2 rounded-xl bg-[#007b89] text-white font-bold hover:bg-[#0094a6] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generar informe científico</span>
          </button>

          <button
            onClick={() => handleGeneratePackage('package')}
            disabled={generating}
            className="px-3.5 py-2 rounded-xl bg-[#1b736c] text-white font-bold hover:bg-[#239087] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Preparar paquete Quantarctica / NPDC</span>
          </button>

          <button
            onClick={handleDownloadZip}
            className="px-3.5 py-2 rounded-xl bg-[#35c3c8] text-[#050e14] font-bold hover:bg-[#58d5e3] transition-all flex items-center gap-2 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar paquete</span>
          </button>

          <button
            onClick={handleOpenNpdc}
            className="px-3.5 py-2 rounded-xl bg-[#1c2940] border border-[#35445b] text-[#72e0b5] font-bold hover:bg-[#24344d] transition-all flex items-center gap-2"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir NPDC</span>
          </button>

          <button
            onClick={() => setProposalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#1c2940] border border-[#35445b] text-[#f5f8fc] font-bold hover:bg-[#24344d] transition-all flex items-center gap-2"
          >
            <Layers className="w-3.5 h-3.5 text-[#58d5e3]" />
            <span>Preparar propuesta Quantarctica</span>
          </button>
        </div>
      </div>

      {/* Package Status Card */}
      {packageInfo?.zipName && (
        <div className="p-4 rounded-2xl bg-[#151f32] border border-[#35445b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#72e0b5]/15 border border-[#72e0b5]/40 flex items-center justify-center text-[#72e0b5]">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">{packageInfo.zipName}</div>
              <div className="text-[#8faab5] text-[11px]">
                Tamaño: {packageInfo.zipSize ? `${Math.round(packageInfo.zipSize / 1024)} KB` : 'Listo'} · Actualizado: {packageInfo.generatedAt}
              </div>
            </div>
          </div>
          <button
            onClick={handleDownloadZip}
            className="px-4 py-2 rounded-xl bg-[#72e0b5] text-[#080e19] font-bold flex items-center gap-2 hover:bg-[#8de8cd] transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Archivo ZIP</span>
          </button>
        </div>
      )}

      {/* Structure & Quantarctica Standards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Package Anatomy */}
        <div className="p-4 rounded-2xl bg-[#101626] border border-[#35445b] space-y-3">
          <div className="flex items-center gap-2 text-white font-bold border-b border-[#35445b] pb-2">
            <Layers className="w-4 h-4 text-[#58d5e3]" />
            <span>Estructura Oficial del Paquete Científico</span>
          </div>
          <ul className="space-y-1.5 text-[#b7c5d8] text-[11px]">
            <li className="flex items-center gap-2">
              <span className="text-[#58d5e3]">README.md</span> & <span className="text-[#58d5e3]">CITATION.cff</span> (Atribución y licenciamiento CC BY 4.0)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#72e0b5]">metadata.json</span> (Conforme al estándar ISO 19115 / NPDC)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#f5f8fc]">report/AMOH_scientific_report.md</span> (Informe completo de campaña)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#ffc845]">data/</span> (Observaciones CSV, GeoJSON, Parquet y telemetría de derrotero)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#35c3c8]">gis/AMOH_dataset.gpkg</span> & <span className="text-[#35c3c8]">styles/*.qml</span> (Capas vectoriales Quantarctica)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#b7c5d8]">methods/</span> (QA/QC, diccionario de datos y pipeline de calibración)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#b7c5d8]">citations/sources.bib</span> (Catálogo bibliográfico y procedencia)
            </li>
          </ul>
        </div>

        {/* NPDC Guidance */}
        <div className="p-4 rounded-2xl bg-[#101626] border border-[#35445b] space-y-3">
          <div className="flex items-center justify-between border-b border-[#35445b] pb-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <Database className="w-4 h-4 text-[#72e0b5]" />
              <span>Flujo de Publicación en NPDC (Npolar)</span>
            </div>
            <button
              onClick={() => setChecklistOpen(true)}
              className="text-[#58d5e3] hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>Ver 8 pasos</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[#b7c5d8] text-[11px] leading-relaxed">
            El Norwegian Polar Data Centre (NPDC) publica los datos del Instituto Polar Noruego y expediciones internacionales asociadas a Quantarctica.
            AMOH valida el paquete automáticamente, genera el checklist y provee el ZIP listo para carga web autenticada.
          </p>
          <div className="p-2.5 rounded-xl bg-[#151f32] border border-[#35445b]/60 flex items-center gap-2 text-[11px] text-[#72e0b5]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>El clic final de publicación es siempre humano mediante la interfaz oficial de NPDC.</span>
          </div>
        </div>
      </div>

      {/* NPDC 8-Step Checklist Modal */}
      {checklistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-[#101626] border border-[#35445b] shadow-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#35445b] bg-[#080e19] flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold">
                <Database className="w-4 h-4 text-[#72e0b5]" />
                <span>Checklist Oficial de Publicación NPDC</span>
              </div>
              <button
                onClick={() => setChecklistOpen(false)}
                className="text-[#8fa3bd] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              {(checklist.length > 0 ? checklist : [
                { step: 1, title: 'Iniciar Sesión', desc: 'Acceder a https://data.npolar.no/ con credenciales institucionales o Feide/ORCID.' },
                { step: 2, title: 'Nuevo Dataset', desc: 'Seleccionar "New Dataset" en el portal del Norwegian Polar Institute.' },
                { step: 3, title: 'Cargar Metadatos', desc: 'Copiar los valores desde metadata.json (BBox EPSG:3031, autores, resumen).' },
                { step: 4, title: 'Subir Archivos', desc: 'Adjuntar el archivo ZIP generado o capas individuales GeoPackage / CSV.' },
                { step: 5, title: 'Guardar Borrador (Draft)', desc: 'Verificar la previsualización espacial de la Península Antártica.' },
                { step: 6, title: 'Reservar DOI', desc: 'Solicitar la asignación del Digital Object Identifier para citación científica.' },
                { step: 7, title: 'Revisión por Curador', desc: 'El equipo del NPI revisa la conformidad con las directrices de Quantarctica.' },
                { step: 8, title: 'Publicación Oficial', desc: 'Publicar abiertamente el dataset con licencia CC BY 4.0.' }
              ]).map((st) => (
                <div key={st.step} className="p-3 rounded-xl bg-[#151f32] border border-[#35445b]/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#007b89]/20 border border-[#007b89]/50 flex items-center justify-center text-[#58d5e3] font-bold text-xs shrink-0">
                    {st.step}
                  </div>
                  <div>
                    <div className="text-white font-bold text-xs">{st.title}</div>
                    <div className="text-[#b7c5d8] text-[11px] mt-0.5">{st.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-[#35445b] bg-[#080e19] flex items-center justify-between">
              <a
                href="https://data.npolar.no/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#58d5e3] hover:underline flex items-center gap-1.5"
              >
                <span>data.npolar.no</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setChecklistOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#35c3c8] text-[#050e14] font-bold"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quantarctica Proposal Modal */}
      {proposalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#101626] border border-[#35445b] shadow-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#35445b] bg-[#080e19] flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold">
                <Layers className="w-4 h-4 text-[#58d5e3]" />
                <span>Propuesta de Capa Científica para Quantarctica</span>
              </div>
              <button
                onClick={() => setProposalOpen(false)}
                className="text-[#8fa3bd] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-[11px] text-[#b7c5d8]">
              <div className="p-3 rounded-xl bg-[#151f32] border border-[#35445b]">
                <div className="text-[#58d5e3] font-bold">Criterios de Admisión Quantarctica:</div>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>Formato GeoPackage (.gpkg) o GeoTIFF con proyección EPSG:3031.</li>
                  <li>Estilo QGIS (.qml) predefinido con rampa de colores aprobada.</li>
                  <li>Metadatos completos en citation manifest y diccionario de campos.</li>
                  <li>Licencia abierta CC BY 4.0 o Dominio Público.</li>
                </ul>
              </div>
              <p>
                Contacto editorial oficial de Quantarctica: <code className="text-[#72e0b5]">quantarctica@npolar.no</code>
              </p>
            </div>
            <div className="px-5 py-3 border-t border-[#35445b] bg-[#080e19] flex justify-end">
              <button
                onClick={() => setProposalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#35c3c8] text-[#050e14] font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
