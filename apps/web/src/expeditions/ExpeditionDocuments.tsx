import { useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Lock,
  ShieldCheck,
  Hash,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';
import {
  SEED_PAC_DOCUMENTS,
  type PacDocument,
  getExpedition,
} from './expeditions-data';

export default function ExpeditionDocuments(): ReactNode {
  const { expeditionId = 'exp-pac-13' } = useParams();
  const expedition = getExpedition(expeditionId);
  const [documents] = useState<PacDocument[]>(SEED_PAC_DOCUMENTS);

  const getStatusBadge = (status: PacDocument['verificationStatus']) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verificado</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Pendiente</span>
          </span>
        );
      case 'REQUIRES_RENEWAL':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-[#f97316]/15 text-[#f97316] border border-[#f97316]/30 text-xs font-bold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Requiere Renovación</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30 text-xs font-bold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Vencido</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#091b29] border border-[#1b3543]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>CLASSIFIED AS PRIVATE</span>
            </span>
            <span className="text-[#8faab5] text-xs">
              Expedición: {expedition.title}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Repositorio y Auditoría Documental de Expedición
          </h2>
          <p className="text-xs text-[#8faab5] max-w-3xl mt-1">
            Gestión criptográfica y administrativa de documentos de viaje, permisos institucionales y seguros.
            Los escaneos originales nunca se exponen al público ni en capas del visor Live Lens.
          </p>
        </div>

        <Link
          to={`/expeditions/${expeditionId}/readiness`}
          className="px-3.5 py-2 rounded-xl bg-[#0d2334] border border-[#1e3b50] hover:border-[#00e5ff]/50 text-xs text-[#d8e7ee] flex items-center gap-2 self-start md:self-auto transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span>Volver a Matriz de Preparación</span>
        </Link>
      </div>

      {/* Two Core Passports Comparison Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Legal Travel Passport */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c2436] to-[#071622] border border-[#00e5ff]/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#00e5ff]/20 text-[#00e5ff] flex items-center justify-center font-bold text-xs">
                🇨🇴
              </span>
              <span className="text-xs font-bold text-[#00e5ff] uppercase tracking-wider">
                Documento Migratorio Oficial
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#10b981]/20 text-[#10b981] font-bold border border-[#10b981]/40">
              VIGENTE HASTA 2030
            </span>
          </div>
          <h3 className="text-base font-bold text-white font-sans">
            Pasaporte Legal de Viaje (República de Colombia)
          </h3>
          <p className="text-xs text-[#8faab5] leading-relaxed">
            Documento de viaje nacional requerido para tránsitos aéreos y migratorios internacionales hacia Chile/Argentina y embarque en el buque nodriza polar.
          </p>
          <div className="pt-2 border-t border-[#1a384b] text-[11px] text-[#7195a6] space-y-1">
            <div>Emisor: <strong className="text-white">Cancillería / MinRelaciones Exteriores</strong></div>
            <div>Acreditación: <strong className="text-white">Verificación física cotejada</strong></div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#00e5ff]">
              <EyeOff className="w-3 h-3" />
              <span>Número de libreta y foto custodiados bajo secreto estadístico</span>
            </div>
          </div>
        </div>

        {/* AMOH Scientific Passport */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c2838] to-[#071720] border border-[#72e0b5]/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#72e0b5]/20 text-[#72e0b5] flex items-center justify-center font-bold text-xs">
                🌐
              </span>
              <span className="text-xs font-bold text-[#72e0b5] uppercase tracking-wider">
                Credencial Científica Abierta
              </span>
            </div>
            <Link
              to="/passport"
              className="px-2 py-0.5 rounded text-[10px] bg-[#72e0b5]/20 text-[#72e0b5] font-bold border border-[#72e0b5]/40 hover:bg-[#72e0b5]/30 transition-colors"
            >
              VER EN PASAPORTE AMOH →
            </Link>
          </div>
          <h3 className="text-base font-bold text-white font-sans">
            Pasaporte Científico Digital AMOH (W3C DID)
          </h3>
          <p className="text-xs text-[#8faab5] leading-relaxed">
            Identidad de investigación antártica descentralizada. Almacena sellos de expedición, microcredenciales del Curso Pre-Antártico y firmas de sesiones de campo.
          </p>
          <div className="pt-2 border-t border-[#1a384b] text-[11px] text-[#7195a6] space-y-1">
            <div>Protocolo: <strong className="text-white">W3C Verifiable Credentials (DID:AMOH)</strong></div>
            <div>Identificador: <strong className="text-white">AMOH-ASP-2026-08842</strong></div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#72e0b5]">
              <ShieldCheck className="w-3 h-3" />
              <span>Interoperable con SCAR Data Hub y Zenodo Repository</span>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Document Registry */}
      <div className="p-5 rounded-2xl bg-[#071622] border border-[#183142] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#00e5ff]" />
            <span>Inventario de Documentos Registrados ({documents.length})</span>
          </h3>
          <span className="text-xs text-[#8faab5]">
            Trazabilidad Criptográfica SHA-256
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {documents.map((doc) => (
            <div
              key={doc.docId}
              className="p-4 rounded-xl bg-[#091b29] border border-[#1b3543] hover:border-[#2b4c60] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h4 className="text-sm font-bold text-white font-sans">{doc.title}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#0c2436] text-[#8faab5] border border-[#1d3c50]">
                    {doc.type}
                  </span>
                </div>

                <p className="text-xs text-[#8faab5]">{doc.notes}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#7195a6] pt-1">
                  <span className="flex items-center gap-1">
                    <Building className="w-3 h-3 text-[#00e5ff]" />
                    <span>Emisor: <strong className="text-white">{doc.issuer}</strong></span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#f59e0b]" />
                    <span>Vencimiento: <strong className="text-white">{doc.expiryDate}</strong></span>
                  </span>
                </div>

                {/* Cryptographic Hash Badge */}
                <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-[#5b7a8a] bg-[#050f16] px-2.5 py-1 rounded-lg border border-[#112431] w-fit">
                  <Hash className="w-3 h-3 text-[#00e5ff]" />
                  <span>Hash Seguro: {doc.secureRefHash.slice(0, 36)}...</span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                {getStatusBadge(doc.verificationStatus)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
