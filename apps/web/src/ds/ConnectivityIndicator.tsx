/** Offline-first status line. Communicates continuity, not failure. */
export default function ConnectivityIndicator({ online }: { online: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium"
      style={{ color: online ? 'var(--state-saved)' : 'var(--text-secondary)', fontFamily: 'var(--font-data)' }}
    >
      <span aria-hidden className="w-1.5 h-1.5 rounded-full" style={{ background: online ? 'var(--state-saved)' : 'var(--text-secondary)' }} />
      {online ? 'Online' : 'Working locally. Uploads will wait.'}
    </span>
  );
}
