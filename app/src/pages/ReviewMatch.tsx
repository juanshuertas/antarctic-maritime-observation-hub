import PageHeader from '../ds/PageHeader';
import EmptyState from '../ds/EmptyState';
import MetadataRow from '../ds/MetadataRow';
import DataProvenanceTag from '../ds/DataProvenanceTag';

/** Static shape for the review queue UI — wire to /api/matches once the backend endpoint exists (see docs/HANDOFF.md). */
const EXAMPLE_MATCH = {
  observation: { time: '2027-01-14T03:12:00Z', position: '-63.40, -56.99', source: 'field' as const },
  ais: { time: '2027-01-14T03:09:00Z', position: '-63.41, -56.97', source: 'ais' as const },
  satellite: { time: '2027-01-14T02:55:00Z', position: 'Sentinel-2 scene footprint', source: 'satellite' as const },
  mirofish: { time: '2027-01-14T03:10:00Z', position: '-63.39, -57.02 (projected)', source: 'mirofish' as const },
  score: { time: 0.86, position: 0.74, sourceQuality: 0.6, total: 0.73 },
};

function EvidenceColumn({ title, time, position, tag }: { title: string; time: string; position: string; tag?: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-md)] border" style={{ borderColor: 'var(--border-default)', background: 'var(--surface-panel)' }}>
      <div className="px-3 py-2 border-b text-sm font-semibold flex items-center justify-between" style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
        {title}{tag}
      </div>
      <div className="px-3 py-2">
        <MetadataRow label="Time" value={time} />
        <MetadataRow label="Position" value={position} />
      </div>
    </div>
  );
}

export default function ReviewMatch() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Review & match"
        description="Compare a field observation against AIS candidates, satellite frames, and Mirofish estimates. Evidence first — the score is a secondary aid."
      />
      <div className="px-6 pb-8 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <EvidenceColumn title="Observation" {...EXAMPLE_MATCH.observation} />
          <EvidenceColumn title="AIS candidate" {...EXAMPLE_MATCH.ais} />
          <EvidenceColumn title="Satellite scene" {...EXAMPLE_MATCH.satellite} />
          <EvidenceColumn title="Mirofish estimate" {...EXAMPLE_MATCH.mirofish} tag={<DataProvenanceTag kind="mirofish-simulation" />} />
        </div>

        <div className="rounded-[var(--radius-md)] border px-4 py-3" style={{ borderColor: 'var(--border-default)', background: 'var(--surface-panel)' }}>
          <p className="text-xs uppercase tracking-[0.08em] mb-2" style={{ color: 'var(--text-secondary)' }}>MatchScore breakdown (secondary aid, not a verdict)</p>
          <MetadataRow label="Time alignment" value={EXAMPLE_MATCH.score.time.toFixed(2)} />
          <MetadataRow label="Position alignment" value={EXAMPLE_MATCH.score.position.toFixed(2)} />
          <MetadataRow label="Source quality" value={EXAMPLE_MATCH.score.sourceQuality.toFixed(2)} />
          <MetadataRow label="Total" value={EXAMPLE_MATCH.score.total.toFixed(2)} />
        </div>

        <div className="flex flex-wrap gap-2">
          {['Accept match', 'Mark partial', 'Reject candidate', 'Insufficient evidence'].map((label) => (
            <button
              key={label}
              type="button"
              className="rounded-[var(--radius-md)] border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)', background: 'var(--surface-panel)' }}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-1 text-sm max-w-xl">
          <span style={{ color: 'var(--text-secondary)' }}>Justification (required for Accept / Reject)</span>
          <textarea rows={2} className="rounded-[var(--radius-sm)] border px-3 py-2" style={{ borderColor: 'var(--border-default)' }} />
        </label>

        <EmptyState title="No other pending observations" message="This is a static example. Wire /api/matches to populate the real review queue." />
      </div>
    </div>
  );
}
