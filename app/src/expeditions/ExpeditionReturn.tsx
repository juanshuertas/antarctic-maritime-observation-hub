import { useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileCheck,
  CheckCircle2,
  HardDrive,
  Sparkles,
  ArrowLeft,
  FileSpreadsheet,
  Lock,
} from 'lucide-react';
import {
  SEED_PAC_BACKUPS,
  SEED_PAC_RETURN_REPORTS,
  SEED_PAC_SCIENTIFIC_PRODUCTS,
  type DailyDataBackupRecord,
  type ReturnReport,
  type ScientificProduct,
  getExpedition,
} from './expeditions-data';

export default function ExpeditionReturn(): ReactNode {
  const { expeditionId = 'exp-pac-13' } = useParams();
  const expedition = getExpedition(expeditionId);
  const [backups] = useState<DailyDataBackupRecord[]>(SEED_PAC_BACKUPS);
  const [reports] = useState<ReturnReport[]>(SEED_PAC_RETURN_REPORTS);
  const [products] = useState<ScientificProduct[]>(SEED_PAC_SCIENTIFIC_PRODUCTS);
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'BACKUPS' | 'REPORTS' | 'PRODUCTS'>('AUDIT');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#091b29] border border-[#1b3543]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#72e0b5]/15 text-[#72e0b5] border border-[#72e0b5]/30 flex items-center gap-1">
              <FileCheck className="w-3 h-3" />
              <span>CIERRE DE MISIÓN, AUDITORÍA & RETORNO</span>
            </span>
            <span className="text-[#8faab5] text-xs">
              Expedición: {expedition.title}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Auditoría de Datos, Respaldos Diarios y Entrega de Productos
          </h2>
          <p className="text-xs text-[#8faab5] max-w-3xl mt-1">
            Validación de integridad previa al desembarco en Punta Arenas. Cierre de bitácoras, verificación de hashes SHA-256 de base de datos DuckDB y radicación de informes ante la CCO.
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1b3543] pb-2 text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'AUDIT'
              ? 'bg-[#00e5ff] text-[#050e14]'
              : 'bg-[#0a1e2b] text-[#8faab5] hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Auditoría de Desembarco</span>
        </button>

        <button
          onClick={() => setActiveTab('BACKUPS')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'BACKUPS'
              ? 'bg-[#00e5ff] text-[#050e14]'
              : 'bg-[#0a1e2b] text-[#8faab5] hover:text-white'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Respaldos Diarios & Hashes ({backups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'REPORTS'
              ? 'bg-[#00e5ff] text-[#050e14]'
              : 'bg-[#0a1e2b] text-[#8faab5] hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Informes CCO Radicados ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PRODUCTS')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'PRODUCTS'
              ? 'bg-[#00e5ff] text-[#050e14]'
              : 'bg-[#0a1e2b] text-[#8faab5] hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Productos Científicos & FAIR ({products.length})</span>
        </button>
      </div>

      {/* Audit Checklist View */}
      {activeTab === 'AUDIT' && (
        <div className="p-5 rounded-2xl bg-[#081824] border border-[#173042] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              <span>Protocolo de Cierre y Verificación Pre-Desembarco</span>
            </h3>
            <span className="text-[10px] text-[#10b981] font-bold">FASE 12 DEL CICLO PAC</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              {
                title: 'Verificación de Integridad de Base de Datos DuckDB',
                desc: 'Cálculo de hash SHA-256 del archivo sqlite/duckdb y verificación de no-corrupción.',
                status: 'VERIFICADO',
              },
              {
                title: 'Copia en Medio Secundario Físico (SSD Rugged)',
                desc: 'Almacenamiento en dos medios magnéticos/sólidos físicamente independientes a bordo.',
                status: 'VERIFICADO',
              },
              {
                title: 'Conciliación de Bitácora VHF con el Puente de Mando',
                desc: 'Contraste del log de comunicaciones AMOH con el libro de navegación del buque.',
                status: 'COMPLETO',
              },
              {
                title: 'Inspección de Bioseguridad de Retorno',
                desc: 'Aspirado y desinfección de material antes del ingreso al territorio chileno/colombiano.',
                status: 'PENDIENTE DE DESEMBARCO',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#091b29] border border-[#193345] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-white">{item.title}</div>
                  <div className="text-[11px] text-[#7195a6]">{item.desc}</div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 font-mono font-bold text-xs shrink-0 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{item.status}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backups View */}
      {activeTab === 'BACKUPS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#00e5ff]" />
              <span>Bitácora de Copias de Seguridad Diarias</span>
            </h3>
            <span className="text-xs text-[#8faab5]">
              Protocolo de Cadena de Custodia Criptográfica
            </span>
          </div>

          <div className="space-y-3">
            {backups.map((bk) => (
              <div
                key={bk.backupDate}
                className="p-4 rounded-xl bg-[#081824] border border-[#173042] space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{bk.backupDate}</span>
                    <span className="text-[#496a7b]">·</span>
                    <span className="text-[#00e5ff] font-mono">{bk.observationsCount} observaciones</span>
                    <span className="text-[#496a7b]">·</span>
                    <span className="text-[#72e0b5] font-mono">{bk.mediaFilesCount} archivos multimedia</span>
                    <span className="text-[#496a7b]">·</span>
                    <span className="text-[#8faab5] font-mono">{(bk.totalBytes / (1024 * 1024)).toFixed(1)} MB</span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 self-start sm:self-auto font-mono">
                    {bk.state}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#050f16] border border-[#122432] font-mono text-[11px] text-[#7195a6] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="truncate">Manifest SHA-256: <strong className="text-white">{bk.manifestSha256}</strong></span>
                  <span className="text-[#8faab5] shrink-0">Verificado: {bk.verifiedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports View */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#72e0b5]" />
              <span>Informes Oficiales para Radicación ante la CCO ({reports.length})</span>
            </h3>
            <span className="text-xs text-[#8faab5]">
              Cumplimiento de compromisos de la Convocatoria PAC
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 text-xs">
            {reports.map((rep) => (
              <div
                key={rep.reportId}
                className="p-5 rounded-2xl bg-[#081824] border border-[#173042] space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30">
                        {rep.type}
                      </span>
                      <span className="text-[11px] text-[#567a8c] font-mono">v{rep.version}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white font-sans">{rep.title}</h4>
                  </div>

                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 shrink-0 self-start">
                    {rep.status}
                  </span>
                </div>

                <p className="text-[#8faab5] leading-relaxed">{rep.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scientific Products View */}
      {activeTab === 'PRODUCTS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00e5ff]" />
              <span>Productos Científicos Comprometidos en el Proyecto ({products.length})</span>
            </h3>
            <span className="text-xs text-[#8faab5]">
              Publicación abierta bajo principios FAIR y SCAR
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {products.map((p) => (
              <div
                key={p.productId}
                className="p-4 rounded-xl bg-[#081824] border border-[#173042] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30">
                      {p.type}
                    </span>
                    <span className="font-bold text-white font-sans">{p.title}</span>
                  </div>
                  <div className="text-[11px] text-[#8faab5]">
                    Destino: <strong className="text-white">{p.targetVenue}</strong>
                    {p.doiOrUrl && (
                      <span> · Ref: <strong className="text-[#00e5ff] font-mono">{p.doiOrUrl}</strong></span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/40">
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
