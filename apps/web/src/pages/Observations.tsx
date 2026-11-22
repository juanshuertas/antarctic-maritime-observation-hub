import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Search, Filter, Download, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Observation {
  observation_id: string;
  utc: string;
  latitude: number;
  longitude: number;
  observation_type: string;
  notes: string | null;
  qa_qc_status: string;
  quality_level: number;
}

export default function Observations() {
  const [data, setData] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<Observation[]>('/api/observations')
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col gap-6" style={{ color: 'var(--amoh-text)', fontFamily: 'var(--amoh-font-ui)' }}>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--amoh-text)' }}>Field Observations</h1>
          <p className="text-sm opacity-60" style={{ color: 'var(--amoh-text-secondary)' }}>
            Ground-truth recordings from expedition teams and community contributors.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--amoh-border)', color: 'var(--amoh-text)' }}>
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--amoh-border)', color: 'var(--amoh-text)' }}>
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col rounded-2xl border shadow-2xl" style={{ borderColor: 'var(--amoh-border)', backgroundColor: 'var(--amoh-surface)' }}>
        <div className="p-4 border-b flex items-center gap-4" style={{ borderColor: 'var(--amoh-border)' }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" style={{ color: 'var(--amoh-text)' }} />
            <input
              type="text"
              placeholder="Search observations..."
              className="w-full bg-black/20 border rounded-full py-1.5 pl-10 pr-4 text-sm outline-none transition-all focus:bg-black/40"
              style={{ borderColor: 'var(--amoh-border)', color: 'var(--amoh-text)' }}
            />
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-black/40 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--amoh-text-muted)' }}>
              <tr>
                <th className="p-4 border-b" style={{ borderColor: 'var(--amoh-border)' }}>ID</th>
                <th className="p-4 border-b" style={{ borderColor: 'var(--amoh-border)' }}>UTC</th>
                <th className="p-4 border-b" style={{ borderColor: 'var(--amoh-border)' }}>Location</th>
                <th className="p-4 border-b" style={{ borderColor: 'var(--amoh-border)' }}>Type</th>
                <th className="p-4 border-b" style={{ borderColor: 'var(--amoh-border)' }}>Status</th>
                <th className="p-4 border-b" style={{ borderColor: 'var(--amoh-border)' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y" style={{ borderColor: 'var(--amoh-border)' }}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center opacity-50 italic">Loading observations...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center opacity-50 italic">No observations found.</td>
                </tr>
              ) : (
                data.map((obs) => (
                  <tr key={obs.observation_id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => navigate(`/map?obs=${obs.observation_id}`)}>
                    <td className="p-4 font-mono text-[12px]" style={{ color: 'var(--amoh-text-secondary)' }}>
                      {obs.observation_id.slice(0, 8)}...
                    </td>
                    <td className="p-4 font-mono text-[12px]" style={{ color: 'var(--amoh-text)' }}>
                      {obs.utc.replace('T', ' ').slice(0, 19)}
                    </td>
                    <td className="p-4" style={{ color: 'var(--amoh-text)' }}>
                      {obs.latitude.toFixed(4)}°, {obs.longitude.toFixed(4)}°
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                        style={{ backgroundColor: 'var(--amoh-science)', color: 'var(--amoh-bg-ocean)' }}>
                        {obs.observation_type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {obs.qa_qc_status === 'raw' ? (
                          <><AlertCircle className="w-3 h-3 text-yellow-500" /> <span className="text-[12px] opacity-70">Raw</span></>
                        ) : (
                          <><CheckCircle className="w-3 h-3 text-green-500" /> <span className="text-[12px] opacity-70">Validated</span></>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/review?obs=${obs.observation_id}`)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-cyan-400"
                          title="Review and Match"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
