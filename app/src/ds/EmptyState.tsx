import type { ReactNode } from 'react';

export default function EmptyState({ title, message, action }: { title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2 py-16 px-4">
      <p className="text-base font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-editorial)' }}>{title}</p>
      {message && <p className="text-sm max-w-sm" style={{ color: 'var(--text-secondary)' }}>{message}</p>}
      {action}
    </div>
  );
}
