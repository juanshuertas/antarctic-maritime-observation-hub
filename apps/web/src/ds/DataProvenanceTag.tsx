/** Distinguishes real field/AIS data from Mirofish simulation output — never silently blended. */
export default function DataProvenanceTag({ kind }: { kind: 'observed' | 'processed' | 'mirofish-simulation' | 'demo' }) {
  const style = {
    observed: { label: 'Observed', fg: 'var(--state-saved)', bg: 'var(--state-saved-bg)' },
    processed: { label: 'Processed', fg: 'var(--ocean-700)', bg: 'var(--surface-subtle)' },
    'mirofish-simulation': { label: 'Simulación / Inferencia Mirofish', fg: 'var(--state-insufficient-data)', bg: 'var(--state-insufficient-data-bg)' },
    demo: { label: 'Demo data — not field observations', fg: 'var(--state-error)', bg: 'var(--state-error-bg)' },
  }[kind];
  return (
    <span
      className="inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-xs font-medium"
      style={{ color: style.fg, background: style.bg }}
    >
      {style.label}
    </span>
  );
}
