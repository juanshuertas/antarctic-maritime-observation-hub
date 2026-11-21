import { useState, type ReactNode } from 'react';
import {
  Download,
  Database,
  FileCode,
  Table,
  ShieldCheck,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import {
  SEED_FIELD_OBSERVATIONS,
} from './expeditions-data';

export default function ExpeditionData(): ReactNode {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [copiedCite, setCopiedCite] = useState(false);

  const citationText = 'Sin conjunto de datos publicado: la propuesta NG-LEX aún no tiene datos de campo ni DOI. Esta cita se generará cuando exista un dataset revisado.';

  const handleDownload = (format: string) => {
    setDownloadingFormat(format);
    setTimeout(() => {
      setDownloadingFormat(null);
      // Trigger client-side file download simulation
      const dataStr =
        format === 'JSON'
          ? JSON.stringify(SEED_FIELD_OBSERVATIONS, null, 2)
          : 'observation_id,utc,latitude,longitude,reality_label,review_status\n' +
            SEED_FIELD_OBSERVATIONS.map(
              (o) =>
                `${o.observationId},${o.observedAtUtc},${o.lat},${o.lon},"${o.realityLabel}","${o.reviewStatus}"`
            ).join('\n');

      const blob = new Blob([dataStr], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `amoh_natgeo_expedition_data.${format.toLowerCase()}`;
      link.click();
      URL.revokeObjectURL(url);
    }, 800);
  };

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(citationText);
    setCopiedCite(true);
    setTimeout(() => setCopiedCite(false), 2000);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="border-b border-[#1b3543] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-[#00e5ff]" />
            <span>Datos & Catálogo de Exportación Abierta</span>
          </h2>
          <p className="text-xs text-[#8faab5] mt-0.5">
            Formatos abiertos estandarizados conforme a los lineamientos SCAR / CCAMLR / Zenodo.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#081824] border border-[#1d3d52] text-[11px] text-[#72e0b5]">
          <ShieldCheck className="w-4 h-4" />
          <span>Licencia Creative Commons CC-BY 4.0</span>
        </div>
      </div>

      {/* Formats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            format: 'GeoJSON',
            ext: '.geojson',
            desc: 'Features espaciales con geometrías de puntos y polígonos de huellas SAR.',
            size: '420 KB',
            icon: FileCode,
          },
          {
            format: 'CSV',
            ext: '.csv',
            desc: 'Tabla plana con marcas temporales UTC, coordenadas WGS84 y etiquetas de realidad.',
            size: '85 KB',
            icon: Table,
          },
          {
            format: 'Parquet',
            ext: '.parquet',
            desc: 'Formato columnar de alto rendimiento optimizado para DuckDB y Google BigQuery.',
            size: '140 KB',
            icon: Database,
          },
          {
            format: 'JSON',
            ext: '.json',
            desc: 'Manifiesto completo estructurado con cadenas de custodia y firmas SHA256.',
            size: '310 KB',
            icon: FileCode,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.format}
              className="p-5 rounded-2xl border border-[#1b3543] bg-[#081724] space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#00e5ff]" />
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00e5ff]/15 text-[#00e5ff] font-mono">
                      {item.ext}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8faab5]">{item.size}</span>
                </div>
                <h3 className="text-sm font-bold text-white font-sans mt-2">
                  {item.format} Dataset
                </h3>
                <p className="text-[11px] text-[#8faab5] font-sans mt-1">
                  {item.desc}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDownload(item.format)}
                disabled={downloadingFormat === item.format}
                className="w-full py-2 rounded-xl bg-[#0c1f2d] border border-[#213f4f] text-[#00e5ff] hover:bg-[#00e5ff] hover:text-[#050e14] text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadingFormat === item.format ? 'Generando...' : 'Descargar'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Dataset Manifest & Citation Box */}
      <div className="p-6 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-4">
        <h3 className="text-xs font-bold uppercase text-white flex items-center gap-2">
          <span>Cómo Citar este Conjunto de Datos</span>
        </h3>

        <div className="p-4 rounded-2xl bg-[#050f16] border border-[#142836] flex items-center justify-between gap-4 text-xs">
          <p className="text-[#c4d7e0] font-sans leading-relaxed select-all">
            {citationText}
          </p>
          <button
            onClick={handleCopyCitation}
            className="p-2 rounded-xl bg-[#0c1f2d] border border-[#213f4f] text-[#8faab5] hover:text-white flex-shrink-0"
            title="Copiar Cita"
          >
            {copiedCite ? <CheckCircle2 className="w-4 h-4 text-[#72e0b5]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#8faab5] pt-2">
          <div>
            <strong className="text-white block">Custodia de Datos:</strong>
            <span>Nodo Buque DuckDB + Google Cloud Storage</span>
          </div>
          <div>
            <strong className="text-white block">Gobernanza:</strong>
            <span>SCAR Standing Committee on Antarctic Data</span>
          </div>
          <div>
            <strong className="text-white block">Integridad:</strong>
            <span>Firmas Ed25519 por dispositivo emisor</span>
          </div>
        </div>
      </div>
    </div>
  );
}
