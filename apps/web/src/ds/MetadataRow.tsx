import type { ReactNode } from 'react';

export default function MetadataRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 border-b last:border-b-0" style={{ borderColor: 'var(--border-default)' }}>
      <span className="text-xs uppercase tracking-[0.08em]" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="text-sm text-right tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-data)' }}>{value}</span>
    </div>
  );
}
