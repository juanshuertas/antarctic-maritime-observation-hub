import { useState, useEffect } from 'react';
import { Search, Play, Globe, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { api } from '../lib/api';

interface GEEState {
  status: string;
  projectId: string;
  authMethod: string;
}

export default function GEEPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [status, setStatus] = useState<GEEState | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [scenes, setScenes] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.get<any>('/api/earth-engine/status')
        .then((res: any) => setStatus({
          status: res.status,
          projectId: res.project_id,
          authMethod: res.auth_method,
        }))
        .catch(() => {});
    }
  }, [isOpen]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await api.post<any[]>('/api/earth-engine/scenes/search', {
        sensor: 'Sentinel-2',
        geometry: { type: 'Point', coordinates: [-58.5, -63.5] },
        start_date: '2026-01-01',
        end_date: '2026-12-31',
      });
      setScenes(res);
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/earth-engine/analyses', {
        analysis_type: 'mean_reflectance',
        geometry: { type: 'Point', coordinates: [-58.5, -63.5] },
        params: { bands: ['B4', 'B3', 'B2'] },
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      className="absolute top-[80px] left-[80px] w-[360px] h-[calc(100dvh-160px)] z-[300] p-4 flex flex-col gap-4"
    >
      <div
        className="flex-1 rounded-2xl border overflow-hidden flex flex-col shadow-2xl"
        style={{
          backgroundColor: 'var(--amoh-surface)',
          borderColor: 'var(--amoh-border)',
          backdropFilter: 'blur(16px)'
        }}
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--amoh-border)' }}>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" style={{ color: 'var(--amoh-satellite)' }} />
            <h3 className="text-sm font-bold" style={{ color: 'var(--amoh-text)' }}>Satellite Analysis</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 opacity-60" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex flex-col gap-6">
          {/* Status Card */}
          <div className="p-3 rounded-xl border bg-black/20 flex items-center justify-between" style={{ borderColor: 'var(--amoh-border)' }}>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] opacity-50 uppercase" style={{ color: 'var(--amoh-text-muted)' }}>GEE Status</span>
              <div className="flex items-center gap-2">
                {status?.status === 'READY' ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <AlertCircle className="w-3 h-3 text-yellow-500" />}
                <span className="text-xs font-bold" style={{ color: 'var(--amoh-text)' }}>{status?.status || 'Checking...'}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] block opacity-50" style={{ color: 'var(--amoh-text-muted)' }}>Project</span>
              <span className="text-xs font-mono" style={{ color: 'var(--amoh-text)' }}>{status?.projectId || 'N/A'}</span>
            </div>
          </div>

          {/* Search Section */}
          <section className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--amoh-text-secondary)' }}>Scene Discovery</h4>
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex-1 py-2 rounded-lg border text-xs font-semibold transition-all hover:bg-white/5 disabled:opacity-50"
                style={{ borderColor: 'var(--amoh-border)', color: 'var(--amoh-text)' }}
              >
                <Search className="w-3 h-3 inline mr-2" /> Search Area
              </button>
            </div>

            {scenes.length > 0 && (
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
                {scenes.map((s, i) => (
                  <div key={i} className="p-2 rounded-lg border bg-white/5 text-[11px] flex justify-between items-center" style={{ borderColor: 'var(--amoh-border)' }}>
                    <span className="font-mono opacity-80">{s.scene_id}</span>
                    <span className="opacity-60">{s.cloud_cover.toFixed(1)}% cloud</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Analysis Section */}
          <section className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--amoh-text-secondary)' }}>Bounded Analysis</h4>
            <div className="p-3 rounded-xl border bg-black/20 flex flex-col gap-3" style={{ borderColor: 'var(--amoh-border)' }}>
              <div className="flex items-center justify-between text-xs">
                <span className="opacity-60">Mean Reflectance</span>
                <span className="font-bold text-cyan-400">Sentinel-2</span>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-2 rounded-lg font-bold text-xs transition-all hover:brightness-110 flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--amoh-satellite)', color: 'var(--amoh-bg-ocean)' }}
              >
                <Play className="w-3 h-3 fill-current" /> Run Analysis
              </button>
            </div>

            {result && (
              <div className="p-3 rounded-xl border bg-cyan-500/10 animate-in fade-in slide-in-from-top-2" style={{ borderColor: 'var(--amoh-satellite)' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold uppercase opacity-60" style={{ color: 'var(--amoh-text-secondary)' }}>Result</span>
                  <Download className="w-3 h-3 cursor-pointer hover:text-white" style={{ color: 'var(--amoh-satellite)' }} />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold" style={{ color: 'var(--amoh-text)' }}>{result.result.value.toFixed(3)}</span>
                  <span className="text-xs opacity-60" style={{ color: 'var(--amoh-text-secondary)' }}>{result.result.unit}</span>
                </div>
                <div className="mt-2 text-[10px] opacity-40 font-mono">
                  Job: {result.job_id}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </aside>
  );
}

// Helper for X icon since it might be missing from imports
function X({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
}
