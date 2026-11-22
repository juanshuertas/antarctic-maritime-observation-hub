import { useState, type ReactNode } from 'react';
import {
  Settings,
  HardDrive,
  CheckCircle2,
  Radio,
  Save,
} from 'lucide-react';
import { INITIAL_SYNC_STATE } from './expeditions-data';

export default function ExpeditionSettings(): ReactNode {
  const [quantarcticaLayers, setQuantarcticaLayers] = useState({
    bedmachine: true,
    scarCoast: true,
    ibcsoBathymetry: true,
    modisMosaic: false,
  });

  const [shipIp, setShipIp] = useState(INITIAL_SYNC_STATE.shipEdgeIp);
  const [dbPath, setDbPath] = useState('/amoh/data/edge_node.duckdb');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="border-b border-[#1b3543] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#00e5ff]" />
            <span>Ajustes & Paquetes Offline Quantarctica</span>
          </h2>
          <p className="text-xs text-[#8faab5] mt-0.5">
            Configuración del nodo local de navegación en aguas antárticas sin internet.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-[#72e0b5]/15 border border-[#72e0b5]/40 text-[#72e0b5] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>¡Ajustes del nodo de expedición guardados correctamente!</span>
        </div>
      )}

      {/* Grid: Quantarctica Package (7 Cols) & Edge Server Settings (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quantarctica Offline Cache */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#142836] pb-3">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#00e5ff]" />
                <h3 className="text-sm font-bold text-white uppercase">
                  Paquete Cartográfico Quantarctica WAP
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-[#72e0b5]/15 text-[#72e0b5] border border-[#72e0b5]/30">
                1.8 GB DESCARGADO
              </span>
            </div>

            <p className="text-xs text-[#8faab5] font-sans leading-relaxed">
              Capas geoespaciales polar estereográficas precargadas en el almacenamiento de origen privado (OPFS / IndexedDB) para visualización sin internet.
            </p>

            {/* Layers Checkboxes */}
            <div className="space-y-2 pt-1 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#050f16] border border-[#142836] cursor-pointer hover:border-[#00e5ff]/50">
                <div>
                  <span className="font-bold text-white block">BedMachine Antarctica v3</span>
                  <span className="text-[11px] text-[#8faab5] font-sans">Topografía subglacial e interfaces de línea de apoyo</span>
                </div>
                <input
                  type="checkbox"
                  checked={quantarcticaLayers.bedmachine}
                  onChange={(e) =>
                    setQuantarcticaLayers((prev) => ({ ...prev, bedmachine: e.target.checked }))
                  }
                  className="rounded accent-[#00e5ff] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#050f16] border border-[#142836] cursor-pointer hover:border-[#00e5ff]/50">
                <div>
                  <span className="font-bold text-white block">SCAR Antarctic Digital Database (ADD) Coastlines</span>
                  <span className="text-[11px] text-[#8faab5] font-sans">Línea de costa y bordes de plataformas de hielo actualizadas</span>
                </div>
                <input
                  type="checkbox"
                  checked={quantarcticaLayers.scarCoast}
                  onChange={(e) =>
                    setQuantarcticaLayers((prev) => ({ ...prev, scarCoast: e.target.checked }))
                  }
                  className="rounded accent-[#00e5ff] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#050f16] border border-[#142836] cursor-pointer hover:border-[#00e5ff]/50">
                <div>
                  <span className="font-bold text-white block">Batimetría IBCSO v2 (500m)</span>
                  <span className="text-[11px] text-[#8faab5] font-sans">Carta Batimétrica Internacional del Océano Austral</span>
                </div>
                <input
                  type="checkbox"
                  checked={quantarcticaLayers.ibcsoBathymetry}
                  onChange={(e) =>
                    setQuantarcticaLayers((prev) => ({ ...prev, ibcsoBathymetry: e.target.checked }))
                  }
                  className="rounded accent-[#00e5ff] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#050f16] border border-[#142836] cursor-pointer hover:border-[#00e5ff]/50">
                <div>
                  <span className="font-bold text-white block">Mosaico Óptico MODIS MOA 750m</span>
                  <span className="text-[11px] text-[#8faab5] font-sans">Composición satelital multitemporal sin nubes</span>
                </div>
                <input
                  type="checkbox"
                  checked={quantarcticaLayers.modisMosaic}
                  onChange={(e) =>
                    setQuantarcticaLayers((prev) => ({ ...prev, modisMosaic: e.target.checked }))
                  }
                  className="rounded accent-[#00e5ff] w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Edge Server Settings Form */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleSave} className="p-6 rounded-3xl border border-[#1b3543] bg-[#081724] space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-[#142836] pb-3">
              <Radio className="w-4 h-4 text-[#72e0b5]" />
              <h3 className="text-sm font-bold text-white uppercase">
                Parámetros del Servidor Edge del Buque
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#8faab5] mb-1">
                  Dirección IP de Red Local (Ship LAN)
                </label>
                <input
                  type="text"
                  required
                  value={shipIp}
                  onChange={(e) => setShipIp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050f16] border border-[#142836] text-white text-xs font-bold focus:border-[#00e5ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#8faab5] mb-1">
                  Ruta DuckDB en el Nodo
                </label>
                <input
                  type="text"
                  required
                  value={dbPath}
                  onChange={(e) => setDbPath(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050f16] border border-[#142836] text-white text-xs focus:border-[#00e5ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#8faab5] mb-1">
                  Radio Máximo de Matchup (&Delta;d)
                </label>
                <input
                  type="text"
                  defaultValue="1000 metros"
                  className="w-full px-3 py-2 rounded-xl bg-[#050f16] border border-[#142836] text-white text-xs focus:border-[#00e5ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#8faab5] mb-1">
                  Ventana Temporal de Correlación (&Delta;t)
                </label>
                <input
                  type="text"
                  defaultValue="±30 minutos"
                  className="w-full px-3 py-2 rounded-xl bg-[#050f16] border border-[#142836] text-white text-xs focus:border-[#00e5ff] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#00e5ff] text-[#050e14] font-bold text-xs hover:bg-[#38bdf8] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#00e5ff]/20"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Parámetros de Misión</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
