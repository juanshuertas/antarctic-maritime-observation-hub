import { Database, Download } from 'lucide-react';
import { INITIAL_DATASETS } from './passport-data';

export default function PassportDatasets() {
  return (
    <div className="space-y-8 font-mono">
      <div className="border-b border-[#1b3543] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Database className="w-6 h-6 text-[#72e0b5]" />
            <span>Datasets Abiertos & DOIs</span>
          </h1>
          <p className="text-xs text-[#8faab5] mt-1">
            Conjuntos de datos científicos depositados en repositorios internacionales (Pangaea, Zenodo, SeaDataNet).
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg border border-[#213f4f] bg-[#0c1824] text-[#00e5ff] text-xs font-bold">
          {INITIAL_DATASETS.length} Datasets Publicados
        </div>
      </div>

      <div className="space-y-4">
        {INITIAL_DATASETS.map((ds) => (
          <div
            key={ds.id}
            className="p-5 rounded-2xl border border-[#1b3543] bg-[#0a1520] hover:border-[#72e0b5]/50 transition-all space-y-3 shadow-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#162734] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#72e0b5] uppercase tracking-wider block">
                  DOI: {ds.doi}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">{ds.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#061019] border border-[#1b3543] text-[#38bdf8]">
                  {ds.format}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-[#061019] border border-[#162734]">
                <span className="text-[10px] text-[#6e8996] block uppercase">Tamaño</span>
                <span className="text-white font-bold">{ds.size}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#061019] border border-[#162734]">
                <span className="text-[10px] text-[#6e8996] block uppercase">Licencia</span>
                <span className="text-[#72e0b5] font-bold">{ds.license}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#061019] border border-[#162734]">
                <span className="text-[10px] text-[#6e8996] block uppercase">Descargas</span>
                <span className="text-[#00e5ff] font-bold">{ds.downloads}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#061019] border border-[#162734]">
                <span className="text-[10px] text-[#6e8996] block uppercase">Publicación</span>
                <span className="text-white font-bold">{ds.publishedDate}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 text-xs">
              <button
                onClick={() => alert(`Descarga iniciada para: ${ds.title}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/30 font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Dataset</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
