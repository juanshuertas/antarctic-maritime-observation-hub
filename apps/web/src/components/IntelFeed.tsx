import { useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';

/**
 * AMOH — Intel Feed (right rail).
 * Modeled on OSIRIS's "Interface Guide" (docs#interface — "Intel Feed: a
 * running stream of incoming events across every enabled feed"), fed here by
 * AMOH's own speed-anomaly detector (backend/app/services/mirofish_engine.py —
 * that name is legacy; it is not the real MiroFish AI project, see that
 * file's docstring) instead of OSIRIS's satellite/CCTV/flight feeds.
 *
 * Each card also has a "Simular escenario" action: it POSTs the anomaly as
 * seed text to /api/mirofish/simulate, the real optional bridge to an actual
 * MiroFish instance (see backend/app/services/mirofish_bridge.py). Off an
 * edge node that bridge is unconfigured, so this normally reports that
 * clearly rather than pretending to predict anything.
 */
export interface Anomaly {
  mmsi: string;
  name: string | null;
  from_utc: string;
  to_utc: string;
  implied_speed_knots: number;
  reported_speed_knots: number | null;
  from: [number, number];
  to: [number, number];
}

const POLL_MS = 15_000;

export default function IntelFeed({ onSelect }: { onSelect?: (anomaly: Anomaly) => void }) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [error, setError] = useState(false);
  const [simResult, setSimResult] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const poll = () => {
      api.get<{ anomalies: Anomaly[] }>('/api/mirofish/anomalies')
        .then((res) => { if (!cancelled) { setAnomalies(res.anomalies); setError(false); } })
        .catch(() => { if (!cancelled) setError(true); });
    };
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const simulate = async (key: string, a: Anomaly) => {
    setSimResult((prev) => ({ ...prev, [key]: 'Consultando MiroFish…' }));
    const seed = `Vessel MMSI ${a.mmsi} (${a.name ?? 'unknown'}) reached an implied speed of ${a.implied_speed_knots} kn between ${a.from_utc} and ${a.to_utc}, versus a reported ${a.reported_speed_knots ?? '—'} kn.`;
    try {
      await api.post('/api/mirofish/simulate', { seed_text: seed });
      setSimResult((prev) => ({ ...prev, [key]: 'Simulación iniciada en MiroFish.' }));
    } catch (e) {
      setSimResult((prev) => ({ ...prev, [key]: e instanceof ApiError && e.status === 501 ? 'MiroFish no configurado (edge offline) — normal en campo.' : 'MiroFish inalcanzable.' }));
    }
  };

  return (
    <div
      className="absolute right-3 top-3 z-[200] w-64 max-h-[calc(100%-96px)] rounded-xl border flex flex-col overflow-hidden"
      style={{ borderColor: 'var(--wod-border-grid)', background: 'rgba(16,22,38,0.88)', backdropFilter: 'blur(8px)' }}
    >
      <div className="px-2.5 py-2 text-[10px] uppercase tracking-[0.15em] border-b" style={{ fontFamily: 'var(--wod-font-mono)', color: 'var(--wod-border-grid)', borderColor: 'var(--wod-border-grid)' }}>
        Intel feed &middot; AMOH traffic analytics
      </div>
      <div className="overflow-y-auto flex-1 flex flex-col gap-1.5 p-1.5">
        {error && (
          <div className="px-2 py-2 text-[11px]" style={{ color: 'var(--wod-status-alert)' }}>Feed unavailable — backend offline.</div>
        )}
        {!error && anomalies.length === 0 && (
          <div className="px-2 py-2 text-[11px]" style={{ color: 'var(--wod-text-main)', opacity: 0.6 }}>No anomalies detected.</div>
        )}
        {anomalies.map((a, i) => {
          const key = `${a.mmsi}-${a.to_utc}-${i}`;
          return (
            <div key={key} className="rounded-lg border px-2.5 py-2" style={{ borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.06)' }}>
              <button onClick={() => onSelect?.(a)} className="w-full text-left">
                <div className="flex items-center justify-between text-[11px]" style={{ fontFamily: 'var(--wod-font-mono)', color: 'var(--wod-status-alert)' }}>
                  <span>MMSI {a.mmsi}</span>
                  <span>{a.implied_speed_knots} kn</span>
                </div>
                <div className="text-[10.5px] mt-0.5" style={{ color: 'var(--wod-text-main)', opacity: 0.75 }}>
                  {a.name ?? 'Unknown vessel'} &middot; {new Date(a.to_utc).toISOString().slice(11, 19)}Z
                </div>
              </button>
              <button
                onClick={() => simulate(key, a)}
                className="mt-1.5 text-[10px] rounded px-1.5 py-0.5 w-full"
                style={{ fontFamily: 'var(--wod-font-mono)', color: 'var(--wod-accent-cyan)', border: '1px solid rgba(0,210,255,0.3)' }}
              >
                Simular escenario &rarr;
              </button>
              {simResult[key] && <div className="text-[10px] mt-1" style={{ color: 'var(--wod-text-main)', opacity: 0.7 }}>{simResult[key]}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
