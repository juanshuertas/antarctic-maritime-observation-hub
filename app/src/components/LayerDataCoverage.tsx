import {
  LAYER_DATA_INDEX,
  LAYER_CONNECTION_STATUS,
  type LayerDataEvidence,
} from '../lib/layer-data-index.generated';

interface Props {
  layerId: string;
  label: string;
  provider?: string;
  recordCount?: number;
  unit?: string;
}

const fmt = (n?: number | null) => {
  const value = Number(n);
  if (!Number.isFinite(value)) return null;
  return new Intl.NumberFormat('es-CO').format(value);
};

export default function LayerDataCoverage({ layerId, label, provider, recordCount, unit }: Props) {
  const canonical: LayerDataEvidence[] = LAYER_DATA_INDEX[layerId] || [];
  const state = LAYER_CONNECTION_STATUS[layerId] || 'META';

  const rows: LayerDataEvidence[] = canonical.length
    ? canonical
    : [{
        canonicalId: layerId,
        displayName: label,
        provider: provider || 'Fuente de la capa',
        recordCount: Number(recordCount) || 0,
        featureCount: 0,
        datasetRole: 'LAYER_SOURCE',
        integrationStatus: state,
        provenanceStatus: '',
        qualityStatus: '',
        localPaths: [],
      }];

  const total = rows.reduce((sum, row) => sum + (Number(row.recordCount) || Number(row.featureCount) || 0), 0);

  const stateClass =
    state === 'DATA'
      ? 'text-emerald-200 border-emerald-400/25 bg-emerald-400/[0.05]'
      : state === 'RUNTIME'
      ? 'text-cyan-200 border-cyan-400/25 bg-cyan-400/[0.05]'
      : 'text-[#8299a3] border-white/10 bg-white/[0.02]';

  return (
    <details className="mt-1.5 rounded-md border border-white/[0.05] bg-black/10 overflow-hidden">
      <summary className="cursor-pointer select-none px-2 py-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`px-1.5 py-0.5 rounded border text-[6px] font-mono font-bold ${stateClass}`}>
            {state}
          </span>
          <span className="text-[7px] font-mono text-[#7f98a2]">
            {rows.length} {rows.length === 1 ? 'fuente' : 'fuentes'}
          </span>
        </div>
        <span className="text-[7px] font-mono text-[#617984]">
          {total > 0 ? `${fmt(total)} ${unit || 'reg.'}` : 'datos'}
        </span>
      </summary>

      <div className="px-2 pb-2 space-y-1">
        {rows.map((row, index) => (
          <div key={`${row.canonicalId}-${index}`} className="border-t border-white/[0.04] pt-1.5">
            <div className="text-[8px] text-[#cfdbdf]">{row.displayName}</div>
            <div className="text-[6px] font-mono text-[#68818b] mt-0.5">
              {row.provider || provider || 'Proveedor no declarado'}
              {row.recordCount ? ` · ${fmt(row.recordCount)} reg.` : ''}
              {row.featureCount ? ` · ${fmt(row.featureCount)} feat.` : ''}
            </div>
            {(row.integrationStatus || row.datasetRole) && (
              <div className="text-[6px] font-mono text-[#78909a] mt-0.5">
                {row.integrationStatus || row.datasetRole}
                {row.provenanceStatus ? ` · PROV ${row.provenanceStatus}` : ''}
                {row.qualityStatus ? ` · QA ${row.qualityStatus}` : ''}
              </div>
            )}
            {row.localPaths.length > 0 && (
              <details className="mt-1">
                <summary className="cursor-pointer text-[6px] font-mono text-[#5f7b86]">
                  archivos ({row.localPaths.length})
                </summary>
                <div className="mt-1 max-h-28 overflow-y-auto space-y-0.5">
                  {row.localPaths.map((path) => (
                    <div key={path} className="text-[6px] font-mono text-[#60737b] truncate" title={path}>
                      {path}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        ))}
      </div>
    </details>
  );
}
