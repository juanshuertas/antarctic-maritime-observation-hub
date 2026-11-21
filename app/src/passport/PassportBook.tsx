import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  QrCode,
  Upload,
  PenTool,
  Compass,
  FileCheck2,
  Globe,
  X
} from 'lucide-react';
import { INITIAL_PASSPORT_PROFILE, INITIAL_STAMPS } from './passport-data';
import SecurityGuilloche from './components/SecurityGuilloche';
import PassportQRModal from './components/PassportQRModal';

interface PassportBookProps {
  initialPage?: number;
  onClose?: () => void;
}

export const PassportBook: React.FC<PassportBookProps> = ({
  initialPage = 0,
  onClose,
}) => {
  const profile = INITIAL_PASSPORT_PROFILE;
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [uploadNote, setUploadNote] = useState<string | null>(null);

  // Keyboard navigation: ArrowLeft / ArrowRight, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentPage < 5) {
        setCurrentPage((p) => p + 1);
      } else if (e.key === 'ArrowLeft' && currentPage > 0) {
        setCurrentPage((p) => p - 1);
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, onClose]);

  const totalSpreads = 6;

  const handlePageNext = () => {
    if (currentPage < totalSpreads - 1) setCurrentPage((p) => p + 1);
  };

  const handlePagePrev = () => {
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* Top Booklet Controls Strip */}
      <div className="w-full flex items-center justify-between py-2 px-4 mb-3 text-xs font-mono text-[#8faab5]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#35c3c8]" />
          <span className="text-[#35c3c8] font-bold">LIBRETA OFICIAL AMOH</span>
          <span className="hidden sm:inline text-[#557d91]">· Spread {currentPage + 1} de {totalSpreads}</span>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-lg border border-[#214358] hover:bg-[#122b3b] text-[#8faab5] hover:text-white transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cerrar</span>
            </button>
          )}
        </div>
      </div>

      {/* Physical Two-Page Book Spread Container */}
      <div
        className="relative w-full aspect-auto md:aspect-[1.5/1] min-h-[580px] rounded-2xl md:rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.85)] border-2 border-[#1a384b] overflow-hidden flex flex-col md:flex-row transition-all duration-300"
        style={{
          backgroundColor: '#0c2233',
        }}
      >
        {/* Book Central Spine Shadow & Seam (Physical 3D Look) */}
        <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 z-30 pointer-events-none bg-gradient-to-r from-black/40 via-black/10 to-black/40" />
        <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px z-30 pointer-events-none bg-[#214b63]/40" />

        {/* =========================================================================
            SPREAD 0: LEFT PAGE = EDITORIAL PROLOGUE / RIGHT PAGE = HOLDER IDENTITY
           ========================================================================= */}
        {currentPage === 0 && (
          <>
            {/* LEFT PAGE: EDITORIAL PROLOGUE (Tactile Security Paper) */}
            <div
              className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-between relative border-b md:border-b-0 md:border-r border-[#1a384b]"
              style={{
                backgroundColor: '#edf4f6',
                color: '#214b63',
              }}
            >
              <SecurityGuilloche opacity={0.16} variant="light" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between border-b border-[#315f78]/30 pb-3">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-[#557d91] uppercase">
                    Manifiesto Polar
                  </span>
                  <span className="text-[10px] font-mono text-[#35c3c8] font-bold">
                    AMOH · SCAR #1820
                  </span>
                </div>

                <div className="pt-2">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1a3b4f] tracking-wide leading-tight">
                    SCIENCE HAS NO BORDERS, ONLY HORIZONS.
                  </h2>
                  <p className="mt-3 text-xs sm:text-sm font-serif italic text-[#315f78] leading-relaxed">
                    «Diferentes lugares. Un océano compartido. Este pasaporte es el registro vivo de la mirada científica que observa, mide y preserva los confines del Océano Austral.»
                  </p>
                </div>

                <div className="pt-4 space-y-2 border-t border-[#315f78]/20 text-[11px] font-mono text-[#557d91]">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-[#35c3c8]" />
                    <span>Jurisdicción: Tratado Antártico (Art. VII Observación Científica)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-[#35c3c8]" />
                    <span>Región Operativa: Península Antártica 60°S – 75°S</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-3.5 h-3.5 text-[#72e0b5]" />
                    <span>Emisión: Sistema Abierto Descentralizado AMOH</span>
                  </div>
                </div>
              </div>

              {/* Bottom Security Notice on Left Page */}
              <div className="relative z-10 pt-4 border-t border-[#315f78]/20 flex items-center justify-between text-[9px] font-mono text-[#557d91]">
                <span>PÁGINA 01 / PROTOTIPO</span>
                <span className="italic">{profile.disclaimerEs}</span>
              </div>
            </div>

            {/* RIGHT PAGE: HOLDER OFFICIAL IDENTITY (Tactile Identity Card) */}
            <div
              className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-between relative"
              style={{
                backgroundColor: '#f3f7f8',
                color: '#214b63',
              }}
            >
              <SecurityGuilloche opacity={0.16} variant="light" />

              <div className="relative z-10 space-y-4">
                {/* Header Strip */}
                <div className="flex items-center justify-between border-b border-[#315f78]/30 pb-3">
                  <div>
                    <span className="text-[10px] font-mono tracking-[0.25em] text-[#557d91] uppercase block">
                      REPÚBLICA CIENTÍFICA DEL OCÉANO AUSTRAL
                    </span>
                    <span className="text-xs font-mono font-bold text-[#1a3b4f]">
                      AMOH SCIENTIFIC PASSPORT
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#35c3c8]/20 text-[#1b5b68] border border-[#35c3c8]/40">
                    {profile.status}
                  </span>
                </div>

                {/* Identity Holder Presentation */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2">
                  {/* Portrait Placeholder / Monogram JSHO (Section 60: Do not invent photo) */}
                  <div className="relative w-24 h-28 sm:w-28 sm:h-32 rounded-xl bg-gradient-to-b from-[#e0ebef] to-[#c8d9df] border-2 border-[#557d91]/50 p-1 flex flex-col items-center justify-center text-center shadow-inner shrink-0">
                    <div className="text-2xl font-mono font-black text-[#214b63] tracking-widest">
                      {profile.monogram}
                    </div>
                    <span className="text-[9px] font-mono text-[#557d91] mt-1 font-semibold">
                      TITULAR
                    </span>
                    <button
                      onClick={() => setUploadNote('Carga de foto disponible para observadores con tarjeta activa.')}
                      className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-[#214b63] text-white text-[8px] font-mono flex items-center gap-1 hover:bg-[#315f78] transition-colors shadow"
                    >
                      <Upload className="w-2.5 h-2.5" />
                      <span>Subir foto</span>
                    </button>
                  </div>

                  {/* Holder Information Fields */}
                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-[#557d91] uppercase tracking-wider block">
                        Nombre Completo / Full Name
                      </span>
                      <span className="text-sm font-bold text-[#1a3b4f] tracking-wide">
                        {profile.publicName}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] text-[#557d91] uppercase tracking-wider block">
                          Rol Científico
                        </span>
                        <span className="font-semibold text-[#1a3b4f]">
                          {profile.role}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#557d91] uppercase tracking-wider block">
                          Expedición
                        </span>
                        <span className="font-semibold text-[#1a3b4f]">
                          {profile.expedition}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] text-[#557d91] uppercase tracking-wider block">
                        Institución / Red
                      </span>
                      <span className="text-[11px] text-[#315f78]">
                        {profile.institution}
                      </span>
                    </div>
                  </div>
                </div>

                {uploadNote && (
                  <div className="text-[10px] font-mono text-[#1b5b68] bg-[#35c3c8]/15 p-2 rounded-lg border border-[#35c3c8]/30 animate-fadeIn">
                    {uploadNote}
                  </div>
                )}

                {/* Identity Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-[#315f78]/25 text-[10px] font-mono">
                  <div className="p-2 rounded bg-white/60 border border-[#315f78]/20">
                    <span className="text-[#557d91] block uppercase text-[8px]">ID Credencial</span>
                    <span className="font-bold text-[#1a3b4f]">{profile.credentialId}</span>
                  </div>
                  <div className="p-2 rounded bg-white/60 border border-[#315f78]/20">
                    <span className="text-[#557d91] block uppercase text-[8px]">Fecha Emisión</span>
                    <span className="font-bold text-[#1a3b4f]">{profile.issuedDate}</span>
                  </div>
                  <div className="p-2 rounded bg-white/60 border border-[#315f78]/20 col-span-2 sm:col-span-1">
                    <span className="text-[#557d91] block uppercase text-[8px]">ORCID</span>
                    <span className="font-bold text-[#35c3c8] truncate block">{profile.orcid}</span>
                  </div>
                </div>

                {/* Signature Box (Section 61: Do not invent signature) */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/50 border border-[#315f78]/30">
                  <div className="text-[10px] font-mono text-[#557d91]">
                    <span className="block uppercase text-[8px] font-bold">Firma del Titular:</span>
                    <span className="italic text-[#7b98a7]">{profile.signatureStatus}</span>
                  </div>
                  <button
                    onClick={() => setUploadNote('Firma digital criptográfica vinculable mediante clave Ed25519.')}
                    className="px-2.5 py-1 rounded bg-[#214b63] hover:bg-[#315f78] text-white text-[10px] font-mono flex items-center gap-1 transition-colors"
                  >
                    <PenTool className="w-3 h-3" />
                    <span>Agregar firma</span>
                  </button>
                </div>
              </div>

              {/* Machine Readable Zone (MRZ) - Scientific Security Standard */}
              <div className="relative z-10 pt-3 border-t border-[#315f78]/30 font-mono text-[9px] tracking-widest text-[#315f78] uppercase select-all">
                <div className="truncate">P&lt;AMOH&lt;HUERTAS&lt;OLEA&lt;&lt;JUAN&lt;SEBASTIAN&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
                <div className="truncate">ASP08842&lt;&lt;0POL6201017M3101150&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;06</div>
              </div>
            </div>
          </>
        )}

        {/* =========================================================================
            SPREAD 1: SCIENTIFIC STAMPS SPREAD (Real ink on paper aesthetic)
           ========================================================================= */}
        {currentPage === 1 && (
          <div
            className="w-full p-6 sm:p-10 flex flex-col justify-between relative"
            style={{
              backgroundColor: '#edf4f6',
              color: '#214b63',
            }}
          >
            <SecurityGuilloche opacity={0.14} variant="light" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-[#315f78]/30 pb-3">
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#1a3b4f] uppercase tracking-wider">
                    Sellos Oficiales de Estaciones Antárticas
                  </h3>
                  <span className="text-[10px] font-mono text-[#557d91]">
                    6 Sellos Auditados con Trazabilidad Científica Inmutable
                  </span>
                </div>
                <button
                  onClick={() => navigate('/passport/stamps')}
                  className="px-3 py-1 rounded-lg bg-[#214b63] text-white text-xs font-mono hover:bg-[#315f78] transition-colors"
                >
                  Ver Catálogo Completo →
                </button>
              </div>

              {/* Grid of Ink Stamps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                {INITIAL_STAMPS.map((stamp) => (
                  <div
                    key={stamp.id}
                    className="relative p-3.5 rounded-2xl border-2 border-dashed border-[#315f78]/40 bg-white/60 hover:bg-white/80 transition-all shadow-sm flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-base">{stamp.flag}</span>
                        <div className="text-xs font-serif font-bold text-[#1a3b4f] mt-1">
                          {stamp.stationName}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#315f78]/10 text-[#214b63]">
                        {stamp.code}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#315f78]/20 text-[10px] font-mono text-[#557d91] space-y-0.5">
                      <div>Fecha: {new Date(stamp.stampedAt).toLocaleDateString()}</div>
                      <div className="truncate">Oficial: {stamp.officer}</div>
                      <div className="italic text-[9px] text-[#214b63]">{stamp.notes}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-[#315f78]/20 flex items-center justify-between text-[9px] font-mono text-[#557d91]">
              <span>PÁGINAS 02–03 · REGISTRO DE TRÁNSITO POLAR</span>
              <span className="italic">{profile.disclaimerEs}</span>
            </div>
          </div>
        )}

        {/* =========================================================================
            SPREAD 2: SCIENTIFIC JOURNEY & EXPEDITIONS
           ========================================================================= */}
        {currentPage === 2 && (
          <div
            className="w-full p-6 sm:p-10 flex flex-col justify-between relative"
            style={{
              backgroundColor: '#f3f7f8',
              color: '#214b63',
            }}
          >
            <SecurityGuilloche opacity={0.14} variant="light" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-[#315f78]/30 pb-3">
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#1a3b4f] uppercase tracking-wider">
                    Bitácora Editorial & Expediciones de Campo
                  </h3>
                  <span className="text-[10px] font-mono text-[#557d91]">
                    Trazabilidad de Navegación Polar 2025–2026
                  </span>
                </div>
                <button
                  onClick={() => navigate('/passport/journey')}
                  className="px-3 py-1 rounded-lg bg-[#214b63] text-white text-xs font-mono hover:bg-[#315f78] transition-colors"
                >
                  Abrir Bitácora Completa →
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-xl bg-white/70 border border-[#315f78]/25 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#1a3b4f]">
                      Expedición AMOH-SUR-XXVI (BIO Hespérides)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#72e0b5]/20 text-[#136142] font-semibold">
                      Completada
                    </span>
                  </div>
                  <p className="text-xs font-serif text-[#315f78]">
                    Campaña oceanográfica multidisciplinar en el Estrecho de Bransfield y Paso Drake. Lances CTD a 420m y registro acústico de biomasa de krill antártico.
                  </p>
                  <div className="text-[10px] font-mono text-[#557d91] flex gap-4 pt-1">
                    <span>Muestras: 68 registros</span>
                    <span>·</span>
                    <span>Científico Líder: Dr. Juan Sebastian Huertas Olea</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/70 border border-[#315f78]/25 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#1a3b4f]">
                      Expedición OSIRIS-POLAR-26 (R/V Laurence M. Gould)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#35c3c8]/20 text-[#105559] font-semibold">
                      En Curso
                    </span>
                  </div>
                  <p className="text-xs font-serif text-[#315f78]">
                    Monitoreo oceanográfico latitudinal hasta Bahía Margarita (68°S) y despliegue de planeadores submarinos Webb Slocum.
                  </p>
                  <div className="text-[10px] font-mono text-[#557d91] flex gap-4 pt-1">
                    <span>Muestras: 54 registros</span>
                    <span>·</span>
                    <span>Científica Líder: Dra. Elena Vasquez</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-[#315f78]/20 flex items-center justify-between text-[9px] font-mono text-[#557d91]">
              <span>PÁGINAS 04–05 · EXPEDICIONES POLARES</span>
              <span className="italic">{profile.disclaimerEs}</span>
            </div>
          </div>
        )}

        {/* =========================================================================
            SPREAD 3: FIELD OBSERVATIONS (142 RECORDS)
           ========================================================================= */}
        {currentPage === 3 && (
          <div
            className="w-full p-6 sm:p-10 flex flex-col justify-between relative"
            style={{
              backgroundColor: '#edf4f6',
              color: '#214b63',
            }}
          >
            <SecurityGuilloche opacity={0.14} variant="light" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-[#315f78]/30 pb-3">
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#1a3b4f] uppercase tracking-wider">
                    Observaciones Científicas de Campo ({profile.stats.observations})
                  </h3>
                  <span className="text-[10px] font-mono text-[#557d91]">
                    Datos auditados: Oceanografía, Criósfera, Biodiversidad y AIS
                  </span>
                </div>
                <button
                  onClick={() => navigate('/passport/observations')}
                  className="px-3 py-1 rounded-lg bg-[#214b63] text-white text-xs font-mono hover:bg-[#315f78] transition-colors"
                >
                  Explorar Todas →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white/70 border border-[#315f78]/20 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-[#1a3b4f]">EVD-AMOH-2026-001</span>
                    <span className="text-[#136142] font-semibold">QC Verificado</span>
                  </div>
                  <div className="text-xs font-bold text-[#1a3b4f]">Anomalía Térmica Profunda — Bransfield</div>
                  <p className="text-[11px] text-[#315f78] line-clamp-2">
                    Lance CTD SBE-19plus registró intrusión de Agua Circumpolar Profunda Modificada (+1.82°C a 420m).
                  </p>
                  <div className="text-[9px] font-mono text-[#557d91] pt-1">62.85° S · 58.42° W</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/70 border border-[#315f78]/20 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-[#1a3b4f]">EVD-AMOH-2026-002</span>
                    <span className="text-[#136142] font-semibold">QC Verificado</span>
                  </div>
                  <div className="text-xs font-bold text-[#1a3b4f]">Manto de Krill Euphausia superba</div>
                  <p className="text-[11px] text-[#315f78] line-clamp-2">
                    Ecosonda Simrad EK80 detectó manto denso entre 40m y 90m de profundidad. Cobertura acústica ~12 km².
                  </p>
                  <div className="text-[9px] font-mono text-[#557d91] pt-1">64.12° S · 61.95° W</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/70 border border-[#315f78]/20 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-[#1a3b4f]">EVD-AMOH-2026-003</span>
                    <span className="text-[#136142] font-semibold">QC Verificado</span>
                  </div>
                  <div className="text-xs font-bold text-[#1a3b4f]">Desprendimiento Glaciar — Bahía Paraíso</div>
                  <p className="text-[11px] text-[#315f78] line-clamp-2">
                    Dron DJI Matrice 300 RTK registró retroceso terminal y oleaje resultante de 1.4m.
                  </p>
                  <div className="text-[9px] font-mono text-[#557d91] pt-1">64.83° S · 62.88° W</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/70 border border-[#315f78]/20 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-[#1a3b4f]">EVD-AMOH-2026-004</span>
                    <span className="text-[#136142] font-semibold">QC Verificado</span>
                  </div>
                  <div className="text-xs font-bold text-[#1a3b4f]">Verificación AIS Buque Factoría Krill</div>
                  <p className="text-[11px] text-[#315f78] line-clamp-2">
                    Telemetría concordante con autorización CCAMLR en subárea 48.1.
                  </p>
                  <div className="text-[9px] font-mono text-[#557d91] pt-1">63.50° S · 59.80° W</div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-[#315f78]/20 flex items-center justify-between text-[9px] font-mono text-[#557d91]">
              <span>PÁGINAS 06–07 · OBSERVACIONES CIENTÍFICAS</span>
              <span className="italic">{profile.disclaimerEs}</span>
            </div>
          </div>
        )}

        {/* =========================================================================
            SPREAD 4: DATASETS & W3C VERIFIABLE CREDENTIALS
           ========================================================================= */}
        {currentPage === 4 && (
          <div
            className="w-full p-6 sm:p-10 flex flex-col justify-between relative"
            style={{
              backgroundColor: '#f3f7f8',
              color: '#214b63',
            }}
          >
            <SecurityGuilloche opacity={0.14} variant="light" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-[#315f78]/30 pb-3">
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#1a3b4f] uppercase tracking-wider">
                    Datasets Abiertos & Credenciales W3C
                  </h3>
                  <span className="text-[10px] font-mono text-[#557d91]">
                    Identidad Descentralizada (DID) & Licencias CC-BY-4.0
                  </span>
                </div>
                <button
                  onClick={() => navigate('/passport/datasets')}
                  className="px-3 py-1 rounded-lg bg-[#214b63] text-white text-xs font-mono hover:bg-[#315f78] transition-colors"
                >
                  Ver Repositorio →
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white/70 border border-[#315f78]/25 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#35c3c8] font-bold">10.5281/zenodo.10884210</span>
                    <span className="text-[#557d91]">1.42 GB · NetCDF CF-1.8</span>
                  </div>
                  <div className="text-xs font-bold text-[#1a3b4f]">
                    AMOH Southern Ocean High-Resolution CTD Casts & Hydrography
                  </div>
                  <div className="text-[10px] font-mono text-[#557d91] flex gap-3 pt-1">
                    <span>384 Descargas</span>
                    <span>·</span>
                    <span>Licencia Abierta CC-BY-4.0</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/70 border border-[#315f78]/25 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#35c3c8] font-bold">10.5281/zenodo.10884211</span>
                    <span className="text-[#557d91]">840 MB · Parquet / CSV</span>
                  </div>
                  <div className="text-xs font-bold text-[#1a3b4f]">
                    Antarctic Peninsula Calibrated Multi-frequency Acoustic Backscatter
                  </div>
                  <div className="text-[10px] font-mono text-[#557d91] flex gap-3 pt-1">
                    <span>215 Descargas</span>
                    <span>·</span>
                    <span>Licencia Abierta CC-BY-4.0</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-[#315f78]/20 flex items-center justify-between text-[9px] font-mono text-[#557d91]">
              <span>PÁGINAS 08–09 · DATASETS & PUBLICACIONES</span>
              <span className="italic">{profile.disclaimerEs}</span>
            </div>
          </div>
        )}

        {/* =========================================================================
            SPREAD 5: BACK COVER / ETHICAL OATH
           ========================================================================= */}
        {currentPage === 5 && (
          <div
            className="w-full p-6 sm:p-10 flex flex-col justify-between relative text-center"
            style={{
              backgroundColor: '#0c2233',
              color: '#e8f0f3',
            }}
          >
            <SecurityGuilloche opacity={0.1} variant="dark" />

            <div className="relative z-10 max-w-xl mx-auto space-y-5 my-auto">
              <div className="w-16 h-16 rounded-full border border-[#35c3c8]/40 bg-[#091d2c] p-3 mx-auto flex items-center justify-center">
                <Compass className="w-full h-full text-[#35c3c8]" />
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold uppercase tracking-widest text-[#e8f0f3]">
                Compromiso con el Océano Austral
              </h2>

              <p className="text-xs sm:text-sm font-serif italic text-[#cbd9df] leading-relaxed">
                «Como observador científico, me comprometo a registrar la evidencia con rigor metodológico, compartir los datos de manera abierta y cooperar pacíficamente en la protección de los ecosistemas antárticos.»
              </p>

              <div className="pt-4 text-xs font-mono text-[#72e0b5]">
                {profile.publicName} · {profile.credentialId}
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => setIsQrOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#35c3c8] text-[#050e14] font-mono font-bold text-xs flex items-center gap-2 hover:bg-[#48d2d7] transition-all shadow-md"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Mostrar Credencial QR</span>
                </button>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-[#1a384b] text-[9px] font-mono text-[#6c8a99]">
              {profile.disclaimerEs} · WORLD OCEANS LIVING OBSERVATORY
            </div>
          </div>
        )}
      </div>

      {/* Booklet Navigation Arrows & Page Indicator */}
      <div className="w-full flex items-center justify-between mt-4 px-2">
        <button
          onClick={handlePagePrev}
          disabled={currentPage === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            currentPage === 0
              ? 'text-[#415a6b] opacity-40 cursor-not-allowed'
              : 'text-[#35c3c8] bg-[#0c1e2b] border border-[#214358] hover:bg-[#132c3f]'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Página Anterior</span>
        </button>

        {/* Page Dots Indicator */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSpreads }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              aria-label={`Ir a página ${idx + 1}`}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                currentPage === idx
                  ? 'bg-[#35c3c8] w-6'
                  : 'bg-[#214358] hover:bg-[#315f78]'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handlePageNext}
          disabled={currentPage === totalSpreads - 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            currentPage === totalSpreads - 1
              ? 'text-[#415a6b] opacity-40 cursor-not-allowed'
              : 'text-[#35c3c8] bg-[#0c1e2b] border border-[#214358] hover:bg-[#132c3f]'
          }`}
        >
          <span>Siguiente Página</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Selective Disclosure QR Modal */}
      <PassportQRModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
    </div>
  );
};

export default PassportBook;
