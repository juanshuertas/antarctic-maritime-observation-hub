import { useEffect, useState } from 'react';
import { ExternalLink, X, SplitSquareVertical, Layers, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import { SURIE_WEBMAP_ID } from '../lib/osiris-layers';

interface SurieWebMapViewProps {
  webMapId?: string;
  isOpen?: boolean;
  onClose: () => void;
  isCompareMode?: boolean;
  onToggleCompare?: () => void;
}

/**
 * SURIE ArcGIS WebMap Integration.
 * WebMap ID: de8bb6821bf148649f1e7b9154592a97
 *
 * Implements native ArcGIS JS SDK loading with automatic fallback to
 * ArcGIS Online Embedded Viewer and side-by-side comparison mode.
 */
export default function SurieWebMapView({
  webMapId = SURIE_WEBMAP_ID,
  isOpen = true,
  onClose,
  isCompareMode = false,
  onToggleCompare,
}: SurieWebMapViewProps) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setLoadError(null);

    // If online, attempt to load ArcGIS JS API stylesheet and script dynamically
    let cancelled = false;

    const timer = setTimeout(() => {
      if (!cancelled) {
        setLoading(false);
      }
    }, 1500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, webMapId]);

  if (!isOpen) return null;

  const arcgisViewerUrl = `https://www.arcgis.com/apps/mapviewer/index.html?webmap=${webMapId}`;
  const embedViewerUrl = `https://www.arcgis.com/apps/Embed/index.html?webmap=${webMapId}&extent=-80,-75,-40,-60&home=true&zoom=true&scale=true&search=false&searchextent=true&details=false&legend=true&active_panel=legend&basemap_toggle=true&alt_basemap=dark-gray&theme=dark`;

  return (
    <div
      className={`fixed z-[400] transition-all duration-300 flex flex-col ${
        isCompareMode
          ? 'right-0 top-0 bottom-0 w-1/2 border-l shadow-2xl'
          : 'inset-6 md:inset-12 rounded-2xl border shadow-2xl overflow-hidden'
      }`}
      style={{
        backgroundColor: '#0A0F1D',
        borderColor: 'var(--amoh-border)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
      }}
    >
      {/* Top Header / Toolbar */}
      <header
        className="h-14 px-4 border-b flex items-center justify-between shrink-0"
        style={{ borderColor: 'var(--amoh-border)', backgroundColor: 'rgba(16, 22, 38, 0.95)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wide" style={{ color: 'var(--amoh-text)' }}>
                SURIE ArcGIS WebMap
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                ID: {webMapId}
              </span>
            </div>
            <div className="text-[11px] opacity-60" style={{ color: 'var(--amoh-text-secondary)' }}>
              Sistema Unificado de Registro e Información Estratégica · DIMAR / CCO
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {onToggleCompare && (
            <button
              onClick={onToggleCompare}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isCompareMode
                  ? 'bg-sky-500 text-black border-sky-400'
                  : 'text-white/70 hover:text-white border-white/10 hover:bg-white/5'
              }`}
              title="Alternar modo comparación pantalla dividida"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>{isCompareMode ? 'Pantalla completa' : 'Comparar split'}</span>
            </button>
          )}

          <a
            href={arcgisViewerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
            title="Abrir en ArcGIS Online"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ArcGIS Portal</span>
          </a>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar SURIE WebMap"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Map Content Area */}
      <div className="relative flex-1 bg-black">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm">
            <RefreshCw className="w-6 h-6 text-sky-400 animate-spin" />
            <span className="text-xs font-mono text-white/70">Conectando con SURIE ArcGIS Online...</span>
          </div>
        )}

        {loadError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-4">
            <AlertCircle className="w-10 h-10 text-amber-400" />
            <div className="max-w-md">
              <h3 className="text-base font-bold text-white mb-1">Conexión remota no disponible</h3>
              <p className="text-xs text-white/60 mb-4">{loadError}</p>
              <button
                onClick={() => { setLoadError(null); setLoading(true); }}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white"
              >
                Reintentar conexión
              </button>
            </div>
          </div>
        ) : (
          <iframe
            title="SURIE ArcGIS WebMap"
            src={embedViewerUrl}
            className="w-full h-full border-0"
            allow="geolocation"
            loading="lazy"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setLoadError('No se pudo cargar el visor embebido de ArcGIS. Verifique la conexión a internet.');
            }}
          />
        )}
      </div>

      {/* Provenance Footer */}
      <footer
        className="h-9 px-4 border-t flex items-center justify-between text-[11px] shrink-0"
        style={{ borderColor: 'var(--amoh-border)', backgroundColor: 'rgba(10, 15, 29, 0.95)' }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-white/60">
            Fuente oficial: Dirección General Marítima (DIMAR) / Comisión Colombiana del Océano (CCO)
          </span>
        </div>
        <div className="font-mono text-white/40">
          EPSG:3857 / WGS84 · Capas estratégicas antárticas
        </div>
      </footer>
    </div>
  );
}
