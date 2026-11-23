import { useEffect, useMemo, useState } from 'react';







type CatalogItem = {



  id: string;



  label: string;



  available: boolean;



  path?: string | null;



  temporal?: { status?: string; start?: string | null; end?: string | null };



};







type Pair = {



  a: string;



  b: string;



  intersection_km2: number;



  union_km2: number;



  nearest_distance_km: number | null;



  jaccard: number | null;



  coverage_a: number | null;



  coverage_b: number | null;



};







type MetricResult = {



  analysis_basis: string;



  metric_crs: string;



  buffer_m: number;



  datasets: Array<{



    id: string;



    label: string;



    path: string;



    feature_count: number;



    analysis_area_km2: number;



    temporal?: { status?: string; start?: string | null; end?: string | null };



  }>;



  pairs: Pair[];



  all_layers: { intersection_km2: number; has_overlap: boolean; intersection_geojson?: any };



  temporal_alignment: { status: string; common_start?: string | null; common_end?: string | null };



  warning: string;



};







const COLORS: Record<string,string> = {



  fauna_krill: '#22c55e',



  penguin_colonies: '#c084fc',



  whales: '#38bdf8',



  antarctic_fauna: '#72e0b5',



  fisheries_effort: '#ff8a4c',



  tourism_routes: '#eab308',



  aspa: '#fb7185',



  ccamlr_mpa: '#34d399',



  quantarctica_ice: '#caf9f7',



  seismic_events: '#ff827d',



  maris_nuclear: '#ff5e8a',



  polar_friction_sectors: '#f59e0b'



};







const PRESETS = [



  ['Krill × Pesca', ['fauna_krill','fisheries_effort']],



  ['Ballenas × Krill', ['whales','fauna_krill']],



  ['Ballenas × Pesca', ['whales','fisheries_effort']],



  ['Pingüinos × Turismo', ['penguin_colonies','tourism_routes']],



  ['Fauna × ASPA', ['antarctic_fauna','aspa']],



  ['Pesca × MPA', ['fisheries_effort','ccamlr_mpa']],



  ['Pesca × Hielo', ['fisheries_effort','quantarctica_ice']],



] as const;







const pct = (v:number|null|undefined) => v == null ? '—' : `${(v*100).toFixed(1)}%`;



const km = (v:number|null|undefined) => v == null ? '—' : `${v.toLocaleString(undefined,{maximumFractionDigits:1})} km`;



const km2 = (v:number|null|undefined) => v == null ? '—' : `${v.toLocaleString(undefined,{maximumFractionDigits:0})} km²`;







function renderIntersection(metric: MetricResult) {



  const map = (window as any).__wodEngine?.map;



  const geometry = metric?.all_layers?.intersection_geojson;



  if (!map || !geometry) return;







  const sourceId = 'amoh-metric3031-source';



  const fillId = 'amoh-metric3031-fill';



  const lineId = 'amoh-metric3031-line';



  const data = { type:'FeatureCollection', features:[{ type:'Feature', properties:{ area_km2:metric.all_layers.intersection_km2 }, geometry }] };



  const source:any = map.getSource(sourceId);



  if (source?.setData) source.setData(data);



  else map.addSource(sourceId,{ type:'geojson', data });







  const firstSymbol = (map.getStyle()?.layers || []).find((x:any)=>x.type==='symbol')?.id;



  if (!map.getLayer(fillId)) map.addLayer({ id:fillId, type:'fill', source:sourceId, paint:{ 'fill-color':'#f0abfc','fill-opacity':0.32 } }, firstSymbol);



  if (!map.getLayer(lineId)) map.addLayer({ id:lineId, type:'line', source:sourceId, paint:{ 'line-color':'#f5d0fe','line-width':2,'line-opacity':0.95 } }, firstSymbol);



}







function clearIntersection() {



  const map = (window as any).__wodEngine?.map;



  if (!map) return;



  for (const id of ['amoh-metric3031-line','amoh-metric3031-fill']) if (map.getLayer(id)) map.removeLayer(id);



  if (map.getSource('amoh-metric3031-source')) map.removeSource('amoh-metric3031-source');



}







export default function SpatialMetricPanel({ embedded = false }: { embedded?: boolean } = {}) {



  const [open,setOpen] = useState(embedded);



  const [catalog,setCatalog] = useState<CatalogItem[]>([]);



  const [selected,setSelected] = useState<string[]>([]);



  const [bufferKm,setBufferKm] = useState(25);



  const [result,setResult] = useState<MetricResult|null>(null);



  const [busy,setBusy] = useState(false);



  const [error,setError] = useState('');







  const available = useMemo(()=>catalog.filter(x=>x.available),[catalog]);







  const loadCatalog = async () => {



    try {



      const r = await fetch('/api/spatial-analysis/catalog');



      const p = await r.json();



      if (!r.ok) throw new Error(JSON.stringify(p?.detail ?? p));



      const items = (p.items || []) as CatalogItem[];



      setCatalog(items);



      setSelected(prev => {



        const valid = prev.filter(id=>items.some(x=>x.id===id && x.available));



        return valid.length>=2 ? valid : items.filter(x=>x.available).slice(0,2).map(x=>x.id);



      });



      setError('');



    } catch (e) {



      setError(e instanceof Error ? e.message : 'No se pudo cargar el catálogo espacial.');



    }



  };







  useEffect(()=>{ if(open || embedded) void loadCatalog(); },[open, embedded]);







  const toggle = (id:string) => setSelected(current => {



    if (current.includes(id)) return current.filter(x=>x!==id);



    if (current.length>=4) { setError('Máximo cuatro capas.'); return current; }



    setError(''); return [...current,id];



  });







  const preset = (ids:readonly string[]) => {



    const valid = ids.filter(id=>available.some(x=>x.id===id));



    if (valid.length<2) { setError('Ese cruce necesita datasets locales que no están disponibles.'); return; }



    setSelected([...valid]); setError('');



  };







  const run = async () => {



    if (selected.length<2) { setError('Selecciona al menos dos capas.'); return; }



    setBusy(true); setError(''); setResult(null); clearIntersection();



    try {



      const r = await fetch('/api/spatial-analysis/cross',{



        method:'POST', headers:{'Content-Type':'application/json'},



        body:JSON.stringify({ layer_ids:selected, buffer_m:bufferKm*1000, simplify_m:1000, geometry:true })



      });



      const p = await r.json();



      if (!r.ok) throw new Error(typeof p?.detail==='string' ? p.detail : JSON.stringify(p?.detail ?? p));



      setResult(p); renderIntersection(p);



    } catch (e) {



      setError(e instanceof Error ? e.message : 'No se pudo ejecutar el análisis.');



    } finally { setBusy(false); }



  };







  const clear = () => { clearIntersection(); setResult(null); setError(''); };







  return <>



    <button type="button" onClick={()=>setOpen(v=>!v)} className={embedded ? "hidden" : "fixed right-[170px] bottom-24 z-[289] px-4 py-2 rounded-full border border-[#e879f9]/50 bg-[#160b20]/95 text-[#f5d0fe] text-[11px] font-mono font-bold shadow-2xl backdrop-blur-xl hover:bg-[#24102f]"}>



      MÉTRICA 3031



    </button>







    {(open || embedded) && <div className={embedded



        ? "relative w-full max-h-none overflow-visible rounded-xl border border-[#e879f9]/20 bg-[#090f19]/40 text-[#e6f7f6]"



        : "fixed right-6 bottom-36 z-[296] w-[440px] max-h-[76vh] overflow-y-auto rounded-2xl border border-[#e879f9]/30 bg-[#090f19]/[0.98] shadow-2xl backdrop-blur-xl text-[#e6f7f6]"}>



      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#090f19]/95">



        <div><div className="text-[11px] font-mono font-bold text-[#f0abfc]">POLAR METRIC LAB</div><div className="text-[9px] font-mono text-[#a78bfa]">DuckDB Spatial · EPSG:3031 · dataset local completo</div></div>



        <button onClick={()=>setOpen(false)} className={embedded ? "hidden" : "text-[10px] font-mono text-[#94a3b8]"}>CERRAR</button>



      </div>







      <div className="p-4 space-y-4">



        <div className="flex flex-wrap gap-1.5">



          {PRESETS.map(([label,ids])=><button key={label} onClick={()=>preset(ids)} className="px-2 py-1 rounded-md border border-white/10 text-[9px] font-mono hover:border-[#e879f9]/50">{label}</button>)}



        </div>







        <div className="space-y-1.5">



          {available.map(item=>{



            const active=selected.includes(item.id);



            return <button key={item.id} onClick={()=>toggle(item.id)} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border ${active?'border-[#e879f9]/60 bg-[#701a75]/20':'border-white/10 bg-white/[0.02]'}`}>



              <span className="flex items-center gap-2 text-[10px] font-mono"><span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:COLORS[item.id] || '#94a3b8'}} />{item.label}</span>



              <span className="text-[8px] font-mono text-[#93c5fd]">LOCAL</span>



            </button>;



          })}



        </div>







        <div className="grid grid-cols-2 gap-2">



          <div className="rounded-lg border border-white/10 p-2"><div className="text-[8px] text-[#64748b] font-mono">CAPAS</div><div className="text-[11px] font-mono">{selected.length}/4</div></div>



          <label className="rounded-lg border border-white/10 p-2"><div className="text-[8px] text-[#64748b] font-mono mb-1">BUFFER PUNTOS/LÍNEAS</div><select value={bufferKm} onChange={e=>setBufferKm(Number(e.target.value))} className="w-full bg-[#0b1620] text-[10px] font-mono"><option value={5}>5 km</option><option value={10}>10 km</option><option value={25}>25 km</option><option value={50}>50 km</option><option value={100}>100 km</option></select></label>



        </div>







        <div className="flex gap-2"><button disabled={busy||selected.length<2} onClick={()=>void run()} className="flex-1 rounded-lg bg-[#e879f9] text-[#19051e] px-3 py-2 text-[10px] font-mono font-bold disabled:opacity-40">{busy?'CALCULANDO...':'EJECUTAR MÉTRICA'}</button><button onClick={clear} className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-mono text-[#fda4af]">LIMPIAR</button></div>







        {error && <div className="rounded-lg border border-[#fb7185]/30 bg-[#881337]/20 p-2 text-[9px] text-[#fecdd3]">{error}</div>}







        {result && <div className="space-y-3">



          <div className="grid grid-cols-2 gap-2"><Metric label="INTERSECCIÓN TOTAL" value={km2(result.all_layers.intersection_km2)} /><Metric label="VENTANA TEMPORAL" value={result.temporal_alignment.status} /></div>







          {result.pairs.map(pair=><div key={`${pair.a}-${pair.b}`} className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">



            <div className="text-[9px] font-mono font-bold mb-2">{catalog.find(x=>x.id===pair.a)?.label ?? pair.a} × {catalog.find(x=>x.id===pair.b)?.label ?? pair.b}</div>



            <div className="grid grid-cols-3 gap-1.5"><Mini label="SOLAPE" value={km2(pair.intersection_km2)} /><Mini label="JACCARD" value={pct(pair.jaccard)} /><Mini label="DIST. MÍN" value={km(pair.nearest_distance_km)} /><Mini label="COB. A" value={pct(pair.coverage_a)} /><Mini label="COB. B" value={pct(pair.coverage_b)} /><Mini label="UNIÓN" value={km2(pair.union_km2)} /></div>



          </div>)}







          <div className="space-y-1">{result.datasets.map(d=><div key={d.id} title={d.path} className="text-[8px] font-mono text-[#94a3b8] truncate">{d.label}: {d.feature_count.toLocaleString()} entidades · {d.temporal?.status ?? 'UNKNOWN'} · {d.path}</div>)}</div>



        </div>}







        <div className="text-[8px] leading-relaxed text-[#64748b] border-t border-white/10 pt-2">Las distancias, buffers y áreas se calculan en WGS 84 / Antarctic Polar Stereographic (EPSG:3031). El buffer solo expande puntos y líneas; los polígonos se preservan. El solape espacial es asociación exploratoria, no causalidad. Si AMOH no puede verificar una ventana temporal común, muestra UNVERIFIED.</div>



      </div>



    </div>}



  </>;



}







function Metric({label,value}:{label:string;value:string}) { return <div className="rounded-lg border border-white/10 bg-white/[0.025] p-2"><div className="text-[8px] font-mono text-[#64748b]">{label}</div><div className="text-[12px] font-mono font-bold text-[#f5d0fe] mt-0.5">{value}</div></div>; }



function Mini({label,value}:{label:string;value:string}) { return <div className="rounded bg-black/10 p-1.5"><div className="text-[7px] text-[#64748b]">{label}</div><div className="text-[9px] text-[#e2e8f0]">{value}</div></div>; }



