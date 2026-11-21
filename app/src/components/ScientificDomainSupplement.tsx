import {
  BIODIVERSITY_SUPPLEMENT,
  POLLUTION_SUPPLEMENT,
} from '../lib/scientific-domain-supplement.generated';

interface Props {
  domainId: string;
  searchQuery?: string;
}

const style: Record<string,string> = {
  LOCAL: 'border-emerald-400/20 text-emerald-200',
  CONTEXT: 'border-sky-400/20 text-sky-200',
  DERIVED: 'border-violet-400/20 text-violet-200',
  PENDING_CONNECTION: 'border-amber-400/20 text-amber-200',
};

export default function ScientificDomainSupplement({ domainId, searchQuery = '' }: Props) {
  const source =
    domainId === 'LIFE'
      ? BIODIVERSITY_SUPPLEMENT
      : domainId === 'POLLUTION'
      ? POLLUTION_SUPPLEMENT
      : [];
  if (!source.length) return null;

  const q = searchQuery.trim().toLowerCase();
  const rows = q
    ? source.filter((x) =>
        [x.label,x.group,x.provider,x.path || '',x.status,...(x.aliases || [])]
          .join(' ').toLowerCase().includes(q)
      )
    : source;
  if (!rows.length) return null;

  const groups = Array.from(new Set(rows.map((x) => x.group)));

  return (
    <div className="space-y-2">
      {groups.map((group) => {
        const items = rows.filter((x) => x.group === group);
        return (
          <details key={group} open={q.length > 0} className="rounded-lg border border-white/[0.06] bg-[#071721]/70 overflow-hidden">
            <summary className="cursor-pointer px-2.5 py-2 flex items-center justify-between">
              <span className="text-[9px] font-semibold text-[#b9ccd3]">{group}</span>
              <span className="text-[7px] font-mono text-[#617b86]">{items.length}</span>
            </summary>
            <div className="px-2.5 pb-2 space-y-1">
              {items.map((x) => (
                <div key={x.id} className="rounded-md border border-white/[0.04] px-2 py-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[8px] text-[#d2dee2]">{x.label}</div>
                      <div className="text-[6px] font-mono text-[#66808a] mt-0.5">
                        {x.provider}{x.path ? ` · ${x.path}` : ''}
                      </div>
                    </div>
                    <span className={`shrink-0 px-1.5 py-0.5 rounded border text-[6px] font-mono ${style[x.status] || style.PENDING_CONNECTION}`}>
                      {x.status}
                    </span>
                  </div>
                  {x.note && <div className="text-[6px] text-[#738991] mt-1">{x.note}</div>}
                </div>
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}
