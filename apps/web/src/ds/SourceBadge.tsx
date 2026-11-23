const SOURCE_STYLE: Record<string, { label: string; color: string }> = {
  ais: { label: 'AIS', color: 'var(--map-ais)' },
  field: { label: 'Field', color: 'var(--map-field)' },
  satellite: { label: 'Satellite', color: 'var(--map-satellite)' },
  mirofish: { label: 'Mirofish', color: 'var(--map-mirofish)' },
};

export type SourceKind = 'ais' | 'field' | 'satellite' | 'mirofish';

/** Small pill identifying which source a record came from — shape + label, never color alone. */
export default function SourceBadge({ source }: { source: SourceKind }) {
  const s = SOURCE_STYLE[source] ?? { label: source, color: 'var(--text-secondary)' };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-2 py-0.5 text-xs font-medium"
      style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)', background: 'var(--surface-panel)' }}
    >
      <span aria-hidden className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}
