/**
 * AMOH — status bar (bottom rail).
 * Modeled on OSIRIS's "Interface Guide" (docs#interface — "Status Bar:
 * community/docs links on the left, then a live ticker on the right"),
 * restyled with WOD 2025 tokens.
 *
 * dataMode is an honest label, never a decorative one: "LIVE" is reserved
 * for a genuinely connected, freshness-checked feed, which this prototype
 * does not have yet. Everything else is OFFLINE, DEMO or HISTORICAL.
 */
export type DataMode = 'offline' | 'demo' | 'historical' | 'live';

const MODE_LABEL: Record<DataMode, string> = {
  offline: 'OFFLINE',
  demo: 'DEMO DATA',
  historical: 'HISTORICAL',
  live: 'LIVE',
};

const MODE_COLOR: Record<DataMode, string> = {
  offline: 'var(--wod-status-alert)',
  demo: 'var(--wod-status-warn)',
  historical: 'var(--wod-accent-cyan)',
  live: 'var(--wod-env-good)',
};

export default function StatusBar({ expeditionId, dataMode, utc }: { expeditionId: string; dataMode: DataMode; utc: string }) {
  return (
    <div
      className="absolute left-0 right-0 bottom-0 z-[200] flex items-center justify-between px-3 py-1.5 text-[10.5px] border-t gap-3"
      style={{ borderColor: 'var(--wod-border-grid)', background: 'rgba(16,22,38,0.88)', backdropFilter: 'blur(8px)', fontFamily: 'var(--wod-font-mono)', color: 'var(--wod-text-main)' }}
    >
      <span className="flex items-center gap-2">
        <span aria-hidden className="w-1.5 h-1.5 rounded-full" style={{ background: MODE_COLOR[dataMode] }} />
        {MODE_LABEL[dataMode]}
        <span style={{ opacity: 0.5 }}>&middot; {utc} UTC</span>
      </span>
      <span className="hidden sm:inline truncate" style={{ opacity: 0.55 }}>
        Independent research prototype. 
      </span>
      <span style={{ opacity: 0.75 }}>{expeditionId}</span>
    </div>
  );
}

