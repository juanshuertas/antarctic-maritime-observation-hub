import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Beaker, MapPin, FileText, ArrowRight } from 'lucide-react';

/**
 * AMOH — Field Atlas.
 * A high-fidelity scientific ledger of field observations.
 * Designed as a "Digital Archive" with a scientific blueprint aesthetic.
 */

const SYSTEM_COMPONENTS = [
  { id: 'atmosphere', label: 'Atmosphere', icon: '☁️' },
  { id: 'hydrosphere', label: 'Hydrosphere', icon: '💧' },
  { id: 'cryosphere', label: 'Cryosphere', icon: '❄️' },
  { id: 'biosphere', label: 'Biosphere', icon: '🌿' },
  { id: 'geosphere', label: 'Geosphere', icon: '⛰️' },
  { id: 'human', label: 'Human Activity', icon: '🚢' },
];

interface AtlasObservation {
  observation_id: string;
  utc: string;
  latitude: number;
  longitude: number;
  accuracy_m: number;
  observation_type: string;
  qa_qc_status: string;
  system_component: string | null;
  variable_name: string | null;
  sensor_value: number | null;
  unit: string | null;
  measurement_method: string | null;
  observation_context: string | null;
  notes: string | null;
  observer_name: string | null;
}

export default function FieldAtlas() {
  const navigate = useNavigate();
  const [observations, setObservations] = useState<AtlasObservation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAtlas = async () => {
      setLoading(true);
      try {
        const res = await api.get<AtlasObservation[]>(`/api/atlas/observations${filter ? `?component=${filter}` : ''}`);
        setObservations(res);
        if (res.length > 0 && !selectedId) {
          setSelectedId(res[0].observation_id);
        }
      } catch (e) {
        console.error('Atlas fetch error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAtlas();
  }, [filter]);

  const selectedObs = observations.find((o) => o.observation_id === selectedId);

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: 'var(--amoh-bg-abyss)', color: 'var(--amoh-text)', fontFamily: 'var(--amoh-font-ui)' }}>

      {/* Left Pane: Archive Index */}
      <aside className="w-[380px] border-r flex flex-col" style={{ borderColor: 'var(--amoh-border)', background: 'var(--amoh-bg-ocean)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--amoh-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold tracking-tight">Field Atlas</h1>
          </div>
          <p className="text-xs opacity-50 mb-6 font-mono">Southern Ocean Observation Ledger v1.0</p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter(null)}
              className={`text-[10px] px-2 py-1 rounded border transition-all ${!filter ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'border-white/10 opacity-60 hover:opacity-100'}`}
              style={{ fontFamily: 'var(--amoh-font-mono)' }}
            >
              ALL
            </button>
            {SYSTEM_COMPONENTS.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                className={`text-[10px] px-2 py-1 rounded border transition-all ${filter === c.id ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'border-white/10 opacity-60 hover:opacity-100'}`}
                style={{ fontFamily: 'var(--amoh-font-mono)' }}
              >
                {c.icon} {c.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {loading ? (
            <div className="text-center py-10 opacity-30 animate-pulse font-mono text-xs">Indexing records...</div>
          ) : observations.length === 0 ? (
            <div className="text-center py-10 opacity-30 text-xs font-mono">No records found in this component.</div>
          ) : (
            observations.map((obs) => (
              <div
                key={obs.observation_id}
                onClick={() => setSelectedId(obs.observation_id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all group ${selectedId === obs.observation_id ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'}`}
                style={{ borderColor: selectedId === obs.observation_id ? 'var(--amoh-science)' : 'var(--amoh-border)' }}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[11px] font-mono opacity-60">{obs.observation_id.slice(0, 8)}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 font-mono uppercase" style={{ color: 'var(--amoh-science)' }}>
                    {obs.system_component || 'unknown'}
                  </span>
                </div>
                <div className="text-sm font-semibold group-hover:text-cyan-400 transition-colors">
                  {obs.observation_type.replace('_', ' ')}
                </div>
                <div className="text-[10px] opacity-40 font-mono mt-1">
                  {new Date(obs.utc).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Right Pane: Scientific Sheet */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {selectedObs ? (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Blueprint Header */}
            <div className="relative rounded-2xl border p-8 mb-8" style={{ borderColor: 'var(--amoh-border)', background: 'var(--amoh-bg-ocean)', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)' }}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Beaker className="w-24 h-24" />
              </div>

              <div className="flex justify-between items-start mb-12">
                <div>
                  <div className="text-[12px] font-mono uppercase tracking-widest opacity-40 mb-1">Observation Record / ID:</div>
                  <h2 className="text-3xl font-bold font-mono text-cyan-400">{selectedObs.observation_id}</h2>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-mono uppercase tracking-widest opacity-40 mb-1">Temporal Stamp:</div>
                  <div className="text-lg font-mono">{new Date(selectedObs.utc).toUTCString()}</div>
                </div>
              </div>

              {/* Spatial-temporal Grid */}
              <div className="grid grid-cols-3 gap-8 mb-12 border-y py-8" style={{ borderColor: 'var(--amoh-border)' }}>
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] uppercase opacity-40 font-mono flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Latitude
                  </div>
                  <div className="text-xl font-mono">{selectedObs.latitude.toFixed(6)}°</div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] uppercase opacity-40 font-mono flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Longitude
                  </div>
                  <div className="text-xl font-mono">{selectedObs.longitude.toFixed(6)}°</div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] uppercase opacity-40 font-mono flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3" /> Precision
                  </div>
                  <div className="text-xl font-mono">±{selectedObs.accuracy_m?.toFixed(1)}m</div>
                </div>
              </div>

              {/* Scientific Core */}
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-60">Scientific Variables</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-white/5 bg-black/20">
                      <div className="text-[10px] uppercase opacity-40 font-mono mb-1">Variable Name</div>
                      <div className="text-lg font-semibold">{selectedObs.variable_name || 'N/A'}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border border-white/5 bg-black/20">
                        <div className="text-[10px] uppercase opacity-40 font-mono mb-1">Recorded Value</div>
                        <div className="text-xl font-mono text-cyan-400">{selectedObs.sensor_value ?? '—'} <span className="text-sm opacity-60">{selectedObs.unit || ''}</span></div>
                      </div>
                      <div className="p-4 rounded-lg border border-white/5 bg-black/20">
                        <div className="text-[10px] uppercase opacity-40 font-mono mb-1">Method</div>
                        <div className="text-sm font-medium">{selectedObs.measurement_method || 'Standard'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-60">Archival Context</h3>
                  </div>
                  <div className="p-4 rounded-lg border border-white/5 bg-black/20 min-h-[120px]">
                    <div className="text-[10px] uppercase opacity-40 font-mono mb-2">Observer Notes</div>
                    <p className="text-sm leading-relaxed opacity-80 italic font-serif">
                      "{selectedObs.notes || 'No additional notes recorded for this entry.'}"
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border border-white/5 bg-black/20">
                    <div className="text-[10px] uppercase opacity-40 font-mono mb-2">System Component</div>
                    <div className="text-sm font-semibold uppercase tracking-wide text-cyan-400">
                      {selectedObs.system_component || 'unclassified'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer / Attribution */}
              <div className="mt-12 pt-6 border-t flex justify-between items-center" style={{ borderColor: 'var(--amoh-border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                    {selectedObs.observer_name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase opacity-40 font-mono">Observer Attribution</div>
                    <div className="text-sm font-medium">{selectedObs.observer_name || 'Anonymous Participant'}</div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/map?obs=${selectedObs.observation_id}`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-500/50 text-cyan-400 text-xs font-bold hover:bg-cyan-500/10 transition-all group"
                  style={{ fontFamily: 'var(--amoh-font-mono)' }}
                >
                  <MapPin className="w-3 h-3" />
                  LOCATE IN OBSERVATORY
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
            <FileText className="w-16 h-16 mb-4" />
            <p className="font-mono text-sm">Select a record from the index to load the scientific sheet.</p>
          </div>
        )}
      </main>
    </div>
  );
}

// Added a helper icon component since ShieldCheck was missing from import but used in plan
function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
