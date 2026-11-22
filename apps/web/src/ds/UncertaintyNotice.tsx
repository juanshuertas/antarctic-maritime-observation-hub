export default function UncertaintyNotice({ message }: { message: string }) {
  return (
    <div
      role="note"
      className="flex items-start gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm"
      style={{ background: 'var(--state-insufficient-data-bg)', color: 'var(--state-insufficient-data)' }}
    >
      <span aria-hidden>&#9888;</span>
      <span>{message}</span>
    </div>
  );
}
