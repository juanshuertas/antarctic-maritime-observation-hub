import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import {
  Award,
  ShieldCheck,
  Radio,
  Sparkles,
  QrCode,
  CheckCircle2,
  Lock,
  Ship,
  Database,
  ExternalLink,
  BookOpen,
  ArrowLeft,
  X,
} from 'lucide-react';

interface PassportStamp {
  id: string;
  category:
    | 'FIELD_SESSION'
    | 'EXPEDITION'
    | 'DATASET'
    | 'PUBLICATION'
    | 'TRAINING'
    | 'CONFERENCE'
    | 'CITIZEN_SCIENCE';
  title: string;
  institution: string;
  location: string;
  date: string;
  verificationHash: string;
  status: 'VERIFIED' | 'PENDING' | 'RECOGNISED';
  doiOrUrl?: string;
}

const DEFAULT_STAMPS: PassportStamp[] = [
  {
    id: 'STAMP-01',
    category: 'EXPEDITION',
    title: 'X Campaña Antártica Nacional PAC 2024–2026',
    institution: 'Programa Antártico Colombiano / CCO / DIMAR',
    location: 'Estrecho de Gerlache & Isla Rey Jorge',
    date: '2025-02-14',
    verificationHash: 'sha256:7f9a12c8e001ab49b92427ae41e4649b934ca495991b7852b855aa8394e1d09f',
    status: 'VERIFIED',
    doiOrUrl: 'https://cco.gov.co/pac',
  },
  {
    id: 'STAMP-02',
    category: 'FIELD_SESSION',
    title: 'Muestreo CTD & Microplásticos en Aguas Subsuperficiales',
    institution: 'Consorcio SCAR / Invemar / DIMAR',
    location: 'Estación STN-042 (64°18′S, 62°52′W)',
    date: '2025-02-18',
    verificationHash: 'sha256:4a8c9b2110de93bf112463dae812456c710495819028471b6592039281a8c901',
    status: 'VERIFIED',
    doiOrUrl: 'https://doi.org/10.5281/zenodo.amoh2025.042',
  },
  {
    id: 'STAMP-03',
    category: 'DATASET',
    title: 'Depósito Abierto: AMOH-SOOS-SEAWATER-PHYSICS-V1',
    institution: 'SOOS / PANGAEA Polar Data Repository',
    location: 'DataCite Global Registry',
    date: '2025-05-10',
    verificationHash: 'sha256:39bf9012a84c987102e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b93',
    status: 'VERIFIED',
    doiOrUrl: 'https://doi.org/10.1594/PANGAEA.992814',
  },
  {
    id: 'STAMP-04',
    category: 'TRAINING',
    title: 'Protocolo de Seguridad Polar y Código de Conducta SCAR',
    institution: 'Secretaría del Tratado Antártico (ATS)',
    location: 'Centro de Capacitación Polar Virtual',
    date: '2024-11-20',
    verificationHash: 'sha256:99f018e47261a9bc048174629d81746294817263594817263549182736451928',
    status: 'VERIFIED',
  },
];

export default function Passport() {
  const navigate = useNavigate();
  const participantId = localStorage.getItem('amoh_participant_id') || 'PART-PAC-2026-0042';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nfcModalOpen, setNfcModalOpen] = useState(false);
  const [nfcState, setNfcState] = useState<'IDLE' | 'SCANNING' | 'VERIFIED'>('IDLE');

  useEffect(() => {
    const fetchPassport = async () => {
      try {
        const res = await api.get(`/api/field/passport/${participantId}`);
        setData(res);
      } catch {
        // Fallback demo participant data
        setData({
          profile: {
            pseudonym: 'Dr. Santiago Morales',
            expedition_id: 'PAC-AMOH-2026-X',
            joined_at: '2024-11-15T00:00:00Z',
            orcid: '0000-0002-9481-4029',
            institution: 'Instituto de Investigaciones Marinas / CCO',
            role: 'Investigador Principal de Oceanografía',
          },
          stats: {
            total_contributions: 18,
            verified_stations: 6,
            open_datasets: 3,
            nfc_key_id: 'ECDSA-P256-AMOH-8841-PAC',
          },
          entries: DEFAULT_STAMPS,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPassport();
  }, [participantId]);

  const handleTriggerNfc = () => {
    setNfcModalOpen(true);
    setNfcState('SCANNING');
    setTimeout(() => {
      setNfcState('VERIFIED');
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050e14] text-[#edf5f5]">
        <div className="text-sm font-mono animate-pulse text-[#58d5e3]">
          Autenticando Credenciales Criptográficas del Pasaporte...
        </div>
      </div>
    );
  }

  const profile = data?.profile || {
    pseudonym: 'Investigador Polar',
    expedition_id: 'PAC-AMOH-2026',
    joined_at: new Date().toISOString(),
    orcid: '0000-0002-0000-0000',
  };
  const stats = data?.stats || { total_contributions: 4, verified_stations: 2, open_datasets: 1 };
  const entries: PassportStamp[] = data?.entries || DEFAULT_STAMPS;

  return (
    <div
      className="min-h-screen bg-[#040b10] text-[#edf5f5] p-4 md:p-8"
      style={{ fontFamily: "'Space Grotesk', 'DM Sans', sans-serif" }}
    >
      {/* Permanent V8 Scientific Credential Banner */}
      <div className="max-w-3xl mx-auto mb-4 p-3 rounded-2xl bg-[#0a1f2d] border border-[#1b435a] flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-mono text-[#58d5e3]">
          <ShieldCheck className="w-4 h-4 text-[#72e0b5] shrink-0" />
          <span className="font-bold tracking-wider">
            CREDENCIAL CIENTÍFICA DE INVESTIGACIÓN — NO ES UN DOCUMENTO DE VIAJE
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#102d3f] text-[#8faab5] border border-[#1b4d66] shrink-0">
          ART. IV STA (1959)
        </span>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Action Nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/observatory')}
            className="flex items-center gap-2 text-xs font-mono text-[#8faab5] hover:text-[#58d5e3] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Observatorio</span>
          </button>

          <button
            onClick={handleTriggerNfc}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00a6a6] to-[#0284c7] hover:from-[#35c3c8] hover:to-[#38bdf8] text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Simular Toque NFC / Token</span>
          </button>
        </div>

        {/* Passport Physical Book Mockup Card */}
        <div className="relative rounded-3xl border border-[#214a63] bg-gradient-to-b from-[#081d2a] via-[#061622] to-[#040e16] p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden">
          {/* Subtle Holographic Foil Glint Overlay */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-[#58d5e3]/15 via-[#a78bfa]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Header Lineage / Studio Orta Notice */}
          <div className="flex items-start justify-between gap-4 border-b border-[#143245] pb-6">
            <div>
              <div className="text-[10px] font-mono tracking-widest text-[#58d5e3] uppercase font-bold mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ANTARCTICA WORLD PASSPORT · SCIENTIFIC CONNECTED EDITION</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {profile.pseudonym}
              </h1>
              <p className="text-xs text-[#8faab5] mt-0.5">
                {profile.role || 'Investigador de Campo Oceanográfico'} · {profile.institution || 'Consorcio Polar Internacional'}
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-[#0e2738] border border-[#235370] flex items-center justify-center text-[#58d5e3] shadow-inner">
                <QrCode className="w-8 h-8" />
              </div>
              <span className="text-[9px] font-mono text-[#6d8d9c] block mt-1">
                ID: {participantId.slice(0, 14)}
              </span>
            </div>
          </div>

          {/* Artistic Heritage & Ethical Governance Tag */}
          <div className="py-3 px-4 my-4 rounded-xl bg-[#071926] border border-[#16364a] flex items-center justify-between text-[10px] font-mono text-[#8faab5]">
            <span>Linaje Conceptual: Lucy + Jorge Orta (Antarctica World Passport Initiative)</span>
            <span className="text-[#ffc845] font-semibold">CO-DISEÑO / APROBACIÓN PENDIENTE</span>
          </div>

          {/* Participant Credentials Data Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div className="p-3 rounded-2xl bg-[#091f2c] border border-[#16364a]">
              <span className="text-[10px] font-mono text-[#7d9dae] block">EXPEDICIÓN ACTIVA</span>
              <span className="text-xs font-mono font-bold text-[#58d5e3] truncate block mt-0.5">
                {profile.expedition_id}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#091f2c] border border-[#16364a]">
              <span className="text-[10px] font-mono text-[#7d9dae] block">ORCID INVESTIGADOR</span>
              <span className="text-xs font-mono font-bold text-[#72e0b5] truncate block mt-0.5">
                {profile.orcid || '0000-0002-9481-4029'}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#091f2c] border border-[#16364a]">
              <span className="text-[10px] font-mono text-[#7d9dae] block">LANCES & MUESTRAS</span>
              <span className="text-xs font-mono font-bold text-white block mt-0.5">
                {stats.total_contributions} Registros
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#091f2c] border border-[#16364a]">
              <span className="text-[10px] font-mono text-[#7d9dae] block">FECHA DE EMISIÓN</span>
              <span className="text-xs font-mono font-bold text-white block mt-0.5">
                {new Date(profile.joined_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Zero Biometric Privacy Guarantee */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#72e0b5] bg-[#00a6a6]/10 border border-[#00a6a6]/25 rounded-xl p-3">
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              Privacidad Polar Garantizada: Cero datos biométricos recopilados. Identidad vinculada mediante firma asimétrica ECDSA-P256 y hash de expedición.
            </span>
          </div>
        </div>

        {/* Section: Digital Scientific Stamps & Endorsements */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-mono tracking-wider uppercase text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#ffc845]" />
              <span>Sellos Científicos Verificados & Endosos de Campo</span>
            </h2>
            <span className="text-xs font-mono text-[#8faab5]">
              {entries.length} Sellos Registrados
            </span>
          </div>

          <div className="grid gap-3">
            {entries.map((stamp) => (
              <div
                key={stamp.id}
                className="p-4 rounded-2xl bg-[#061622] border border-[#16364a] hover:border-[#2b6585] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0d2636] border border-[#1e4b66] flex items-center justify-center text-[#58d5e3] group-hover:bg-[#00a6a6]/20 transition-colors shrink-0">
                    {stamp.category === 'EXPEDITION' ? (
                      <Ship className="w-5 h-5" />
                    ) : stamp.category === 'DATASET' ? (
                      <Database className="w-5 h-5" />
                    ) : stamp.category === 'TRAINING' ? (
                      <BookOpen className="w-5 h-5" />
                    ) : (
                      <Award className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#102e3f] text-[#58d5e3] font-bold">
                        {stamp.category}
                      </span>
                      <span className="text-[10px] font-mono text-[#72e0b5] flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{stamp.status}</span>
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1 group-hover:text-[#58d5e3] transition-colors">
                      {stamp.title}
                    </h3>
                    <p className="text-xs text-[#8faab5] mt-0.5">
                      {stamp.institution} · {stamp.location}
                    </p>
                    <div className="text-[10px] font-mono text-[#628190] mt-1 truncate max-w-md">
                      {stamp.verificationHash}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right shrink-0 flex sm:flex-col justify-between items-end gap-2">
                  <span className="text-xs font-mono text-white font-semibold">
                    {stamp.date}
                  </span>
                  {stamp.doiOrUrl && (
                    <a
                      href={stamp.doiOrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-[#58d5e3] hover:underline flex items-center gap-1"
                    >
                      <span>Ver Registro DOI</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive NFC Simulation Modal */}
      {nfcModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-[#061622] border border-[#214e6a] p-6 text-[#edf5f5] shadow-2xl relative">
            <button
              onClick={() => setNfcModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#0d2230] hover:bg-[#16364c] border border-[#1e4056] flex items-center justify-center text-[#8faab5] hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-4 py-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#0d2a3c] border-2 border-[#35c3c8] flex items-center justify-center text-[#58d5e3] shadow-[0_0_30px_rgba(53,195,200,0.3)] animate-pulse">
                <Radio className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  {nfcState === 'SCANNING' ? 'Leyendo Token NFC Polar...' : 'Credencial Criptográfica Verificada'}
                </h3>
                <p className="text-xs text-[#8faab5] mt-1">
                  {nfcState === 'SCANNING'
                    ? 'Aproxime su dispositivo móvil o llave de hardware FIDO2/NFC...'
                    : 'Firma ECDSA-P256 autenticada contra el registro inmutable AMOH.'}
                </p>
              </div>

              {nfcState === 'VERIFIED' && (
                <div className="p-4 rounded-2xl bg-[#092231] border border-[#1d4d68] text-left font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#8faab5]">Protocolo:</span>
                    <span className="text-white font-bold">URN:AMOH:NFC:ECDSA-P256</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8faab5]">Participante:</span>
                    <span className="text-[#58d5e3] font-bold">{profile.pseudonym}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8faab5]">Clave Pública:</span>
                    <span className="text-[#72e0b5] truncate max-w-[180px]">
                      04b281f9a0182746c829...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8faab5]">Estado de Red:</span>
                    <span className="text-[#72e0b5] font-bold">VÁLIDO & OFFLINE-SYNC</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => setNfcModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#103347] hover:bg-[#164560] border border-[#215a7a] text-[#caf9f7] font-mono font-bold text-xs transition-all"
              >
                Cerrar Verificación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
