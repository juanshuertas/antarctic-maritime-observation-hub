import { useEffect, useState } from 'react';
import { Stamp as StampIcon, MapPin, CheckCircle2, X, Compass, Calendar, UserCheck } from 'lucide-react';
import { INITIAL_STAMPS, type Stamp } from './passport-data';
import { api } from '../lib/api';
import SecurityGuilloche from './components/SecurityGuilloche';
import PolarStampGraphic from './components/PolarStampGraphic';

type PassportEntry = {
  badge_type: string;
  credential_type: string;
  issued_at: string;
  status: string;
  observation_id?: string | null;
  evidence_hash?: string | null;
  expedition_id?: string | null;
  review_id?: string | null;
  source_status?: string | null;
};

type FieldPassportResponse = {
  profile: {
    participant_id: string;
    pseudonym: string;
    expedition_id: string;
    role?: string;
  };
  entries: PassportEntry[];
};

export default function PassportStamps() {
  const [selectedStamp, setSelectedStamp] = useState<Stamp | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [pb124Entries, setPb124Entries] = useState<PassportEntry[]>([]);
  const [pb124Participant, setPb124Participant] = useState<string | null>(null);

  useEffect(() => {
    const participantId = localStorage.getItem('amoh_participant_id:PB124-OLEA-2026');
    if (!participantId) return;
    setPb124Participant(participantId);
    api.get<FieldPassportResponse>(`/api/field/passport/${participantId}`)
      .then((data) => {
        setPb124Entries(
          (data.entries || []).filter((entry) => entry.expedition_id === 'PB124-OLEA-2026'),
        );
      })
      .catch(() => setPb124Entries([]));
  }, []);

  const categories = ['ALL', 'PLACE', 'EXPEDITION', 'OCEAN', 'ICE', 'FIELD', 'WILDLIFE'];

  const filteredStamps = activeCategory === 'ALL'
    ? INITIAL_STAMPS
    : INITIAL_STAMPS.filter((s) => s.category === activeCategory);

  return (
    <div className="space-y-8 font-mono animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1b384c] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#35c3c8] font-bold tracking-wider uppercase mb-1">
            <StampIcon className="w-4 h-4" />
            <span>Colección Oficial de Estaciones</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Sellos Antárticos Inmutables
          </h1>
          <p className="text-xs text-[#8faab5] mt-1 max-w-2xl">
            Improntas de tinta digital con coordenadas verificadas y refrendo de oficiales de estación conforme al Artículo VII del Tratado Antártico.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl border border-[#214358] bg-[#0c1f2e] text-[#72e0b5] font-bold">
            {INITIAL_STAMPS.length} Sellos Validados
          </span>
        </div>
      </div>

      {/* Evidence-backed PB124 method-pilot passport entries */}
      <div className="rounded-3xl border border-[#00b4d8]/35 bg-[#071b24] p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#00e5ff] font-bold">Peace Boat 124 · OLEA</div>
            <div className="text-sm font-semibold text-white">Method-pilot participation credentials</div>
          </div>
          <span className="text-[10px] rounded-full border border-[#72e0b5]/30 bg-[#72e0b5]/10 px-2.5 py-1 text-[#72e0b5]">
            PB124-OLEA-2026
          </span>
        </div>

        {!pb124Participant && (
          <p className="text-xs text-[#8faab5]">
            No PB124 participant is linked to this browser yet. A credential appears here only after real field participation and method review.
          </p>
        )}

        {pb124Participant && pb124Entries.length === 0 && (
          <p className="text-xs text-[#8faab5]">
            PB124 participant linked. No method-pilot passport credential has been issued yet. This is expected until an observation is accepted for method testing.
          </p>
        )}

        {pb124Entries.map((entry) => (
          <div key={entry.review_id || entry.observation_id || entry.issued_at} className="rounded-2xl border border-[#214358] bg-[#06121c] p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-white">Peace Boat 124 · Shipboard Field Method Pilot</div>
              <span className="text-[10px] font-bold text-[#72e0b5]">{entry.status}</span>
            </div>
            <div className="text-[11px] text-[#8faab5]">
              Participation credential backed by a real PB124 observation accepted for method testing. It is not a statement of validated science, environmental impact, pollution detection or Peace Boat endorsement.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono text-[#6e8996]">
              <div>Source status: <span className="text-white">{entry.source_status || 'METHOD_REVIEWED'}</span></div>
              <div>Observation: <span className="text-white">{entry.observation_id || '—'}</span></div>
              <div>Evidence SHA-256: <span className="text-[#35c3c8] break-all">{entry.evidence_hash || '—'}</span></div>
              <div>Issued: <span className="text-white">{entry.issued_at ? new Date(entry.issued_at).toUTCString() : '—'}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all ${
              activeCategory === cat
                ? 'bg-[#35c3c8] text-[#050e14] font-bold shadow-md'
                : 'bg-[#091824] text-[#8faab5] border border-[#1d3c4e] hover:text-white hover:bg-[#0c2233]'
            }`}
          >
            {cat === 'ALL' ? 'Todos los Sellos' : cat}
          </button>
        ))}
      </div>

      {/* Stamps Grid: Tactile Paper Cards with Realistic Ink Stamping */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStamps.map((st, idx) => {
          // Slight physical stamp angles for authentic field stamping feel
          const rotations = ['rotate-[-2deg]', 'rotate-[2.5deg]', 'rotate-[-1.5deg]', 'rotate-[3deg]', 'rotate-[-3deg]', 'rotate-[1.5deg]'];
          const angle = rotations[idx % rotations.length];

          return (
            <div
              key={st.id}
              onClick={() => setSelectedStamp(st)}
              className="group relative rounded-3xl p-6 shadow-xl border border-[#214358] hover:border-[#35c3c8] transition-all cursor-pointer overflow-hidden flex flex-col justify-between min-h-[290px] select-none"
              style={{
                backgroundColor: '#edf4f6',
                color: '#214b63',
              }}
            >
              {/* Subtle Paper Grain & Guilloche */}
              <SecurityGuilloche opacity={0.12} variant="light" />

              {/* Top Meta Bar */}
              <div className="relative z-10 flex items-center justify-between text-[10px] font-mono border-b border-[#315f78]/25 pb-2">
                <span className="text-[#557d91] font-bold">{st.code}</span>
                <span className="px-2 py-0.5 rounded bg-[#315f78]/15 text-[#214b63] font-semibold">
                  {st.category}
                </span>
              </div>

              {/* Center Authentic Polar Ink Stamp Graphic */}
              <div className="relative z-10 flex items-center justify-center py-2">
                <div className={`transition-transform duration-300 group-hover:scale-105 ${angle}`}>
                  <PolarStampGraphic stamp={st} size={165} showCancellationWaves={false} />
                </div>
              </div>

              {/* Bottom Details */}
              <div className="relative z-10 pt-3 border-t border-[#315f78]/25 flex items-center justify-between text-[10px] font-mono">
                <span className="flex items-center gap-1 text-[#315f78]">
                  <MapPin className="w-3 h-3 text-[#35c3c8]" />
                  <span>{Math.abs(st.lat).toFixed(1)}°S, {Math.abs(st.lng).toFixed(1)}°W</span>
                </span>

                <span className="flex items-center gap-1 text-[#136142] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Oficial</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Stamp Deep Detail Modal */}
      {selectedStamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-[#35c3c8]/50 bg-[#0a1824] p-6 sm:p-7 shadow-2xl space-y-5 font-mono text-[#e8f0f3]">
            <button
              onClick={() => setSelectedStamp(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-[#8faab5] hover:text-white hover:bg-[#122e42] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#1a384b] pb-4">
              <span className="text-4xl">{selectedStamp.flag}</span>
              <div>
                <h3 className="text-base font-bold text-white">{selectedStamp.stationName}</h3>
                <div className="text-xs text-[#35c3c8]">País: {selectedStamp.country} · {selectedStamp.code}</div>
              </div>
            </div>

            {/* Stamp Numismatic Inspection */}
            <div className="flex justify-center items-center py-4 bg-[#0a1e2c]/60 rounded-2xl border border-[#1b3d52] my-2">
              <PolarStampGraphic stamp={selectedStamp} size={190} showCancellationWaves={true} />
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#06121c] border border-[#162d3d] flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-[#72e0b5] shrink-0" />
                <div>
                  <span className="text-[#6c8a99] text-[10px] uppercase block">Oficial Certificador</span>
                  <span className="text-white font-medium">{selectedStamp.officer}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#06121c] border border-[#162d3d] flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#35c3c8] shrink-0" />
                <div>
                  <span className="text-[#6c8a99] text-[10px] uppercase block">Fecha y Hora de Estampado UTC</span>
                  <span className="text-[#72e0b5] font-medium">{new Date(selectedStamp.stampedAt).toUTCString()}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#06121c] border border-[#162d3d] flex items-center gap-3">
                <Compass className="w-5 h-5 text-[#35c3c8] shrink-0" />
                <div>
                  <span className="text-[#6c8a99] text-[10px] uppercase block">Coordenadas Geográficas WGS84</span>
                  <span className="text-white font-medium">
                    {selectedStamp.lat}° S · {selectedStamp.lng}° W
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0e2230] border border-[#1d3c4e]">
                <span className="text-[#6c8a99] text-[10px] uppercase block mb-1">Evidencia / Notas de Campo</span>
                <p className="text-white text-xs leading-relaxed italic">
                  «{selectedStamp.notes}»
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedStamp(null)}
                className="py-2.5 px-5 rounded-xl bg-[#35c3c8] hover:bg-[#48d2d7] text-[#050e14] text-xs font-bold transition-all"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
