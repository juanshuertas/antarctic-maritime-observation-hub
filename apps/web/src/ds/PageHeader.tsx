import type { ReactNode } from 'react';

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between" style={{ padding: 'var(--space-4)' }}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="uppercase text-xs tracking-[0.12em] mb-1" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-data)' }}>
            {eyebrow}
          </p>
        )}
        <h1 className="text-[28px] md:text-[32px] font-semibold leading-tight" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-editorial)' }}>
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm max-w-2xl" style={{ color: 'var(--text-secondary)' }}>{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}
