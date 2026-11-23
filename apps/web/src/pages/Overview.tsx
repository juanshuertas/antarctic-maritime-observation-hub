import { useEffect, useState } from 'react';
import PageHeader from '../ds/PageHeader';
import MetadataRow from '../ds/MetadataRow';
import DataProvenanceTag from '../ds/DataProvenanceTag';
import WodMapPanel from '../components/WodMapPanel';
import QrJoinPanel from '../components/QrJoinPanel';
import { api, ApiError } from '../lib/api';

interface OverviewStats {
  expedition_id: string;
  observations_count: number;
  ais_tracks_count: number;
  satellite_scenes_count: number;
  mirofish_inferences_count: number;
  storage_used_mb: number;
}

export default function Overview() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<OverviewStats>('/api/overview')
      .then(setStats)
      .catch((e) => setError(e instanceof ApiError ? `Backend returned an error (${e.status}).` : 'Backend not reachable yet — see docs/HANDOFF.md.'));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        eyebrow="NGRS-ANTA-2027"
        title="Expedition overview"
        description="Active expedition status, field observations, processed source coverage, Mirofish projections, and local storage."
      />
      <div className="px-6 pb-8 flex flex-col gap-4">
        <WodMapPanel height="620px" />
        <QrJoinPanel />
        {error && (
          <div className="rounded-[var(--radius-md)] border px-3 py-2 text-sm" style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)', background: 'var(--surface-panel)' }}>
            {error}
          </div>
        )}
        {stats && (
          <div className="rounded-[var(--radius-md)] border" style={{ borderColor: 'var(--border-default)', background: 'var(--surface-panel)' }}>
            <div className="px-4">
              <MetadataRow label="Expedition" value={stats.expedition_id} />
              <MetadataRow label="Field observations" value={stats.observations_count} />
              <MetadataRow label="AIS track points" value={stats.ais_tracks_count} />
              <MetadataRow label="Satellite scenes" value={stats.satellite_scenes_count} />
              <MetadataRow label={<span className="inline-flex items-center gap-1.5">Mirofish projections <DataProvenanceTag kind="mirofish-simulation" /></span>} value={stats.mirofish_inferences_count} />
              <MetadataRow label="Local storage used" value={`${stats.storage_used_mb.toFixed(1)} MB`} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
