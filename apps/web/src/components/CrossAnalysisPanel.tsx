import { useEffect, useMemo, useState } from 'react';

import {

  ANALYSIS_LAYER_CATALOG,

  clearCrossAnalysis,

  discoverAnalysisLayers,

  renderCrossAnalysis,

  runCrossAnalysis,

  type CrossAnalysisResult,

  type CrossMode

} from '../lib/cross-analysis-engine';



type Candidate = ReturnType<typeof discoverAnalysisLayers>[number];



const PRESETS = [

  { label: 'Krill × Pesca', ids: ['fauna_krill', 'fisheries_effort'] },

  { label: 'Ballenas × Krill', ids: ['whales', 'fauna_krill'] },

  { label: 'Ballenas × Pesca', ids: ['whales', 'fisheries_effort'] },

  { label: 'Pingüinos × Turismo', ids: ['penguin_colonies', 'tourism_routes'] },

  { label: 'Fauna × ASPA', ids: ['antarctic_fauna', 'aspa'] },

  { label: 'Pesca × MPA', ids: ['fisheries_effort', 'ccamlr_mpa'] }

];



function pct(value: number | null) {

  return value == null

    ? '—'

    : `${(value * 100).toFixed(1)}%`;

}



function corr(value: number | null) {

  return value == null

    ? '—'

    : value.toFixed(3);

}



export default function CrossAnalysisPanel({ embedded = false }: { embedded?: boolean } = {}) {

  const [open, setOpen] = useState(embedded);

  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const [selected, setSelected] = useState<string[]>([]);

  const [mode, setMode] = useState<CrossMode>('overlap');

  const [resolution, setResolution] = useState(4);

  const [result, setResult] = useState<CrossAnalysisResult | null>(null);

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState('');



  const map = () => (window as any).__wodEngine?.map;



  const refresh = () => {

    const currentMap = map();

    if (!currentMap) {

      setError('El mapa todavía no está listo.');

      return;

    }



    const found = discoverAnalysisLayers(currentMap);

    setCandidates(found);



    setSelected((previous) => {

      const stillValid = previous.filter((id) =>

        found.some((item) => item.id === id)

      );



      if (stillValid.length >= 2) return stillValid;



      const visible = found

        .filter((item) => item.visible)

        .map((item) => item.id)

        .slice(0, 2);



      if (visible.length >= 2) return visible;



      return found.map((item) => item.id).slice(0, 2);

    });



    setError('');

  };



  useEffect(() => {

    if (open || embedded) refresh();

  }, [open, embedded]);



  const selectedLabels = useMemo(

    () =>

      selected

        .map((id) =>

          ANALYSIS_LAYER_CATALOG.find((d) => d.id === id)?.label

        )

        .filter(Boolean)

        .join(' × '),

    [selected]

  );



  const toggle = (id: string) => {

    setSelected((current) => {

      if (current.includes(id)) {

        return current.filter((item) => item !== id);

      }



      if (current.length >= 4) {

        setError('Máximo cuatro capas por análisis.');

        return current;

      }



      setError('');

      return [...current, id];

    });

  };



  const applyPreset = (ids: string[]) => {

    const available = ids.filter((id) =>

      candidates.some((item) => item.id === id)

    );



    if (available.length < 2) {

      setError('Ese preset requiere capas que todavía no están cargadas en el mapa.');

      return;

    }



    setSelected(available);

    setError('');

  };



  const run = async () => {

    const currentMap = map();



    if (!currentMap) {

      setError('El mapa todavía no está listo.');

      return;

    }



    if (selected.length < 2) {

      setError('Selecciona al menos dos capas.');

      return;

    }



    setBusy(true);

    setError('');



    try {

      await new Promise((resolve) => requestAnimationFrame(resolve));



      const next = runCrossAnalysis(

        currentMap,

        selected,

        resolution,

        mode

      );



      renderCrossAnalysis(currentMap, next);

      setResult(next);

    } catch (err) {

      setError(

        err instanceof Error

          ? err.message

          : 'No se pudo ejecutar el análisis.'

      );

    } finally {

      setBusy(false);

    }

  };



  const clear = () => {

    const currentMap = map();

    if (currentMap) clearCrossAnalysis(currentMap);

    setResult(null);

    setError('');

  };



  const exportGeoJSON = () => {

    if (!result) return;



    const blob = new Blob(

      [JSON.stringify(result, null, 2)],

      { type: 'application/geo+json' }

    );



    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');



    anchor.href = url;

    anchor.download = `amoh_cross_analysis_${Date.now()}.geojson`;

    anchor.click();



    URL.revokeObjectURL(url);

  };



  return (

    <>

      <button

        type="button"

        onClick={() => setOpen((v) => !v)}

        className={embedded ? "hidden" : "fixed right-6 bottom-24 z-[290] px-4 py-2 rounded-full border border-[#35c3c8]/60 bg-[#071620]/95 text-[#caf9f7] text-[11px] font-mono font-bold tracking-wide shadow-2xl backdrop-blur-xl hover:bg-[#0a2230]"}

      >

        ANÁLISIS CRUZADO

      </button>



      {(open || embedded) && (

        <div className={embedded

            ? "relative w-full max-h-none overflow-visible rounded-xl border border-[#35c3c8]/20 bg-[#06131d]/40 text-[#d8f6f4]"

            : "fixed right-6 bottom-36 z-[295] w-[390px] max-h-[72vh] overflow-y-auto rounded-2xl border border-[#35c3c8]/30 bg-[#06131d]/[0.97] shadow-2xl backdrop-blur-xl text-[#d8f6f4]"}>

          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-[#06131d]/95">

            <div>

              <div className="text-[11px] font-mono font-bold tracking-wider text-[#58d5e3]">

                SPATIAL CROSS ANALYSIS

              </div>

              <div className="text-[10px] text-[#8faab5] mt-0.5">

                H3 · 2–4 capas · resultado derivado

              </div>

            </div>



            <button

              type="button"

              onClick={() => setOpen(false)}

              className={embedded ? "hidden" : "px-2 py-1 rounded-md border border-white/10 text-[11px] text-[#8faab5] hover:text-white"}

            >

              CERRAR

            </button>

          </div>



          <div className="p-4 space-y-4">

            <div>

              <div className="text-[10px] font-mono text-[#8faab5] mb-2">

                PRESETS

              </div>



              <div className="flex flex-wrap gap-1.5">

                {PRESETS.map((preset) => (

                  <button

                    key={preset.label}

                    type="button"

                    onClick={() => applyPreset(preset.ids)}

                    className="px-2 py-1 rounded-md border border-white/10 bg-white/[0.03] text-[10px] font-mono hover:border-[#35c3c8]/50 hover:text-white"

                  >

                    {preset.label}

                  </button>

                ))}

              </div>

            </div>



            <div>

              <div className="flex items-center justify-between mb-2">

                <div className="text-[10px] font-mono text-[#8faab5]">

                  CAPAS DISPONIBLES

                </div>



                <button

                  type="button"

                  onClick={refresh}

                  className="text-[10px] font-mono text-[#58d5e3] hover:text-white"

                >

                  ACTUALIZAR

                </button>

              </div>



              <div className="space-y-1.5">

                {candidates.map((item) => {

                  const active = selected.includes(item.id);



                  return (

                    <button

                      key={item.id}

                      type="button"

                      onClick={() => toggle(item.id)}

                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border text-left ${

                        active

                          ? 'border-[#35c3c8]/70 bg-[#0b3340]/60'

                          : 'border-white/10 bg-white/[0.025] hover:border-white/20'

                      }`}

                    >

                      <span className="flex items-center gap-2 min-w-0">

                        <span

                          className="w-2.5 h-2.5 rounded-full shrink-0"

                          style={{ backgroundColor: item.color }}

                        />

                        <span className="text-[11px] font-mono truncate">

                          {item.label}

                        </span>

                      </span>



                      <span className={`text-[9px] font-mono ${

                        item.visible

                          ? 'text-[#72e0b5]'

                          : 'text-[#64748b]'

                      }`}>

                        {item.visible ? 'VISIBLE' : 'CARGADA'}

                      </span>

                    </button>

                  );

                })}



                {!candidates.length && (

                  <div className="text-[11px] text-[#8faab5] border border-dashed border-white/10 rounded-lg p-3">

                    No encontré capas analizables cargadas todavía.

                  </div>

                )}

              </div>

            </div>



            <div className="grid grid-cols-2 gap-2">

              <label className="space-y-1">

                <span className="text-[9px] font-mono text-[#8faab5]">

                  MÉTODO

                </span>

                <select

                  value={mode}

                  onChange={(e) => setMode(e.target.value as CrossMode)}

                  className="w-full rounded-lg bg-[#081923] border border-white/10 px-2 py-2 text-[11px] font-mono outline-none"

                >

                  <option value="overlap">Co-ocurrencia estricta</option>

                  <option value="composite">Índice compuesto</option>

                  <option value="contrast">Contraste A-B</option>

                </select>

              </label>



              <label className="space-y-1">

                <span className="text-[9px] font-mono text-[#8faab5]">

                  RESOLUCIÓN H3

                </span>

                <select

                  value={resolution}

                  onChange={(e) => setResolution(Number(e.target.value))}

                  className="w-full rounded-lg bg-[#081923] border border-white/10 px-2 py-2 text-[11px] font-mono outline-none"

                >

                  <option value={3}>R3 · regional</option>

                  <option value={4}>R4 · mesoescala</option>

                  <option value={5}>R5 · detalle</option>

                </select>

              </label>

            </div>



            <div className="rounded-lg border border-white/10 bg-black/10 p-3">

              <div className="text-[9px] font-mono text-[#8faab5]">

                CRUCE ACTUAL

              </div>

              <div className="mt-1 text-[11px] font-mono text-white">

                {selectedLabels || 'Sin selección'}

              </div>

            </div>



            <div className="flex gap-2">

              <button

                type="button"

                disabled={busy || selected.length < 2}

                onClick={run}

                className="flex-1 rounded-lg bg-[#22d3ee] text-[#041016] px-3 py-2 text-[11px] font-mono font-bold disabled:opacity-40"

              >

                {busy ? 'ANALIZANDO...' : 'EJECUTAR CRUCE'}

              </button>



              <button

                type="button"

                onClick={clear}

                className="rounded-lg border border-white/10 px-3 py-2 text-[11px] font-mono text-[#fda4af] hover:border-[#fb7185]/40"

              >

                LIMPIAR

              </button>

            </div>



            {error && (

              <div className="rounded-lg border border-[#fb7185]/30 bg-[#881337]/20 p-2.5 text-[10px] text-[#fecdd3]">

                {error}

              </div>

            )}



            {result && (

              <div className="space-y-2">

                <div className="grid grid-cols-2 gap-2">

                  <Metric

                    label="Celdas resultado"

                    value={String(result.meta.cells)}

                  />

                  <Metric

                    label="Área analizada"

                    value={`${result.meta.areaKm2.toLocaleString(undefined, {

                      maximumFractionDigits: 0

                    })} km²`}

                  />

                  <Metric

                    label="Jaccard A/B"

                    value={pct(result.meta.jaccard)}

                  />

                  <Metric

                    label="Solape A/B"

                    value={pct(result.meta.overlapPct)}

                  />

                  <Metric

                    label="Pearson"

                    value={corr(result.meta.pearson)}

                  />

                  <Metric

                    label="Spearman"

                    value={corr(result.meta.spearman)}

                  />

                </div>



                <button

                  type="button"

                  onClick={exportGeoJSON}

                  className="w-full rounded-lg border border-[#35c3c8]/30 px-3 py-2 text-[10px] font-mono text-[#58d5e3] hover:bg-[#0b3340]/40"

                >

                  EXPORTAR RESULTADO GEOJSON

                </button>



                <div className="text-[9px] leading-relaxed text-[#78909c] border-t border-white/10 pt-2">

                  Asociación espacial exploratoria. No implica causalidad.

                  La alineación temporal entre datasets no se presume y queda

                  marcada como UNVERIFIED_CLIENT_SIDE. Para distancias, buffers,

                  áreas métricas y pruebas estadísticas finales, usar backend

                  DuckDB/PROJ con EPSG:3031.

                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </>

  );

}



function Metric({

  label,

  value

}: {

  label: string;

  value: string;

}) {

  return (

    <div className="rounded-lg border border-white/10 bg-white/[0.025] p-2">

      <div className="text-[8px] font-mono text-[#64748b]">

        {label}

      </div>

      <div className="mt-0.5 text-[12px] font-mono font-bold text-[#d8f6f4]">

        {value}

      </div>

    </div>

  );

}

