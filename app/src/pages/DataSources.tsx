import PageHeader from '../ds/PageHeader';
import DataProvenanceTag from '../ds/DataProvenanceTag';
import EmptyState from '../ds/EmptyState';

interface SourceEntry {
  name: string;
  kind: 'observed' | 'processed' | 'mirofish-simulation';
  format: string;
  license: string;
}

const SOURCES: SourceEntry[] = [
  { name: 'Field observations (SQLite)', kind: 'observed', format: 'SQLite table', license: 'Expedition-owned' },
  { name: 'AIS track archive', kind: 'processed', format: 'Parquet', license: 'Per-provider terms' },
  { name: 'Sentinel-1/2 scene catalog', kind: 'processed', format: 'GeoPackage', license: 'Copernicus (free & open)' },
  { name: 'Mirofish trajectory projections', kind: 'mirofish-simulation', format: 'GeoJSON', license: 'AGPL-3.0 (Mirofish)' },
];

export default function DataSources() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Data sources" description="Local inventory of Parquet/AIS files, the Sentinel catalog, Mirofish simulation models, and their licenses." />
      <div className="px-6 pb-8 flex flex-col gap-3">
        {SOURCES.map((s) => (
          <div key={s.name} className="rounded-[var(--radius-md)] border px-4 py-3 flex items-center justify-between gap-3" style={{ borderColor: 'var(--border-default)', background: 'var(--surface-panel)' }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.format} · {s.license}</p>
            </div>
            <DataProvenanceTag kind={s.kind} />
          </div>
        ))}
        <EmptyState title="No local files indexed yet" message="Connect the backend's /api/data-sources endpoint to list what's actually on disk." />
      </div>
    </div>
  );
}
