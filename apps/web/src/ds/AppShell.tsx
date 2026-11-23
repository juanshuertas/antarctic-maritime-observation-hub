import type { ReactNode } from 'react';

/** Root layout: fixed side nav + top bar + main content area. */
export default function AppShell({
  nav,
  topBar,
  children,
}: {
  nav?: ReactNode;
  topBar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'var(--font-interface)' }}>
      {nav && (
        <aside
          className="shrink-0 border-r flex flex-col"
          style={{ width: 232, borderColor: 'var(--border-default)', background: 'var(--surface-panel)' }}
        >
          {nav}
        </aside>
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        {topBar && (
          <div
            className="shrink-0 border-b flex items-center px-4"
            style={{ height: 52, borderColor: 'var(--border-default)', background: 'var(--surface-panel)' }}
          >
            {topBar}
          </div>
        )}
        <main className="flex-1 min-h-0 overflow-auto" style={{ background: 'var(--surface-page)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
