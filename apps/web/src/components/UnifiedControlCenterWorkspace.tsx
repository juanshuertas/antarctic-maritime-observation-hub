// AMOH_RECOVERED_SCIENTIFIC_DOMAINS_V38



import { useMemo, useState } from 'react';







import HierarchicalLayerLibrary from './HierarchicalLayerLibrary';
import { SpatialCameraStore } from '../lib/spatial-camera-store';







import SdgLensDrawer from './SdgLensDrawer';







import CrossAnalysisPanel from './CrossAnalysisPanel';







import SpatialMetricPanel from './SpatialMetricPanel';







import { UNIFIED_LOCAL_DATASETS } from '../lib/unified-local-catalog.generated';

// AMOH_FAUNA_OFFSHORE_V33







// AMOH_BIODIVERSITY_ECOSYSTEMS_V34







export type UnifiedControlMode = 'CAPAS' | 'ODS' | 'XDG' | 'CRUCE';














interface Props {







  mode: UnifiedControlMode;







  activeLayers: Record<string, boolean>;







  onToggleLayer: (layerId: string, enabled: boolean) => void;







  layerOpacities?: Record<string, number>;







  onSetLayerOpacity?: (layerId: string, opacity: number) => void;







  activeSdgGoal?: number | null;







  onSelectSdgGoal?: (goal: number | null) => void;







  onOpenFauna?: () => void;







  onOpenGfw?: () => void;







  onOpenCoverage?: () => void;







  onOpenSelfHealing?: () => void;







  onOpenPythia?: () => void;







  onOpenObservation?: () => void;







}















const DERIVED = [







  ['grey_zones_defense_heatmap','Grey Zones · densidad','DERIVADO'],







  ['polar_friction_sectors','Índice de Fricción Oceanopolítica','DERIVADO'],







  ['grey_zones_buffers','Grey Zones · buffers','DERIVADO'],







  ['fauna_density_heatmap','Krill / fauna · densidad','DERIVADO'],







  ['penguin_heatmap','Pingüinos · densidad','DERIVADO'],







  ['whales_heatmap','Ballenas · densidad','DERIVADO'],







  ['gfw_fishing_effort_heatmap','GFW · esfuerzo pesquero','DERIVADO'],







  ['nuclear_contamination_heatmap','Nuclear · contaminación','DERIVADO'],







  ['seismic_heatmap','Sísmica · densidad','DERIVADO'],







  ['mirofish_heatmap','MiroFish Heatmap','LEGACY / EXPERIMENTAL'],







] as const;















const FAUNA_LOGICAL = [







  ['fauna_krill_swarms','Krill antártico','Euphausia superba · enjambres / ocurrencias','fauna_krill · krill · krill_occurrences'],







  ['fauna_whale_pods','Ballenas','Pods y observaciones de ballenas','fauna_cetaceans · whales'],







  ['fauna_penguins','Pingüinos','Colonias y observaciones de pingüinos','penguin_colonies · quantarctica_penguins'],







  ['emperor_penguin_colonies','Pingüino emperador','Colonias satelitales BAS / NPI','emperor_penguin_colonies'],







  ['fauna_pinnipeds','Focas & pinnípedos','Focas y otros pinnípedos antárticos','fauna_pinnipeds'],







  ['fauna_seabirds','Aves marinas','Albatros, petreles, skúas y aves asociadas','fauna_seabirds'],







  ['fauna_schools_fish','Peces / cardúmenes','Cardúmenes y registros de peces','fauna_fish'],







  ['fauna_benthos','Bentos','Bentos e invertebrados marinos registrados','fauna_benthos'],







] as const;















const OFFSHORE_LOGICAL = [







  ['offshore_energy','Operaciones offshore / energía','Contexto operativo de energía offshore'],







  ['offshore_wells','Pozos offshore','Pozos y localizaciones offshore auditadas'],







  ['deepsea_mining','Minería submarina','Contexto de minería en fondos marinos'],







  ['critical_minerals','Minerales críticos','Registros de minerales críticos / contexto de recursos'],







] as const;















function countLabel(v:number|null){







  if(v==null) return '—';







  if(v>=1000) return `${(v/1000).toFixed(v>=10000?0:1)}k`;







  return String(v);







}















export default function UnifiedControlCenterWorkspace({







  mode, activeLayers, onToggleLayer, layerOpacities = {}, onSetLayerOpacity,







  activeSdgGoal = null, onSelectSdgGoal,







  onOpenFauna, onOpenGfw, onOpenCoverage, onOpenSelfHealing, onOpenPythia, onOpenObservation,
}:Props){







  const [capasView,setCapasView]=useState<'OPERAR'|'OFFSHORE'|'LOCALES'|'DERIVADOS'|'FAUNA'>('OPERAR');







  const [odsView,setOdsView]=useState<'SDG_2030'|'COOPERATION'>('SDG_2030');







  const [cruceView,setCruceView]=useState<'3031'|'CROSS'>('3031');







  const [query,setQuery]=useState('');















  const activeIds=useMemo(







    ()=>Object.keys(activeLayers).filter(id=>!!activeLayers[id]),







    [activeLayers]







  );















  const locals=useMemo(()=>{







    const q=query.trim().toLowerCase();







    if(!q) return UNIFIED_LOCAL_DATASETS;







    return UNIFIED_LOCAL_DATASETS.filter(d=>[







      d.displayName,d.canonicalId,d.domain,d.familyName,d.provenance,d.quality,d.priority







    ].join(' ').toLowerCase().includes(q));







  },[query]);















  const resourceLocals=useMemo(()=>UNIFIED_LOCAL_DATASETS.filter(d=>{







    const hay=[d.canonicalId,d.displayName,d.familyName,d.domain].join(' ').toLowerCase();







    const related=['offshore','deepsea','mining','mineral','pozo','well','vent','ridge','seabed'].some(k=>hay.includes(k));







    return related && !['offshore_energy','offshore_wells','deepsea_mining','critical_minerals'].includes(d.canonicalId);







  }),[]);















  const grouped=useMemo(()=>{







    const m=new Map<string, typeof locals>();







    for(const d of locals){







      const arr=m.get(d.domain)||[];







      arr.push(d);







      m.set(d.domain,arr);







    }







    return Array.from(m.entries());







  },[locals]);















  const toggle=(id:string)=>onToggleLayer(id,!activeLayers[id]);







  const solo=(id:string)=>{







    for(const active of activeIds){







      if(active!==id) onToggleLayer(active,false);







    }







    if(!activeLayers[id]) onToggleLayer(id,true);







  };















  const tools:Array<[string, (()=>void)|undefined]> = [







    ['FAUNA',onOpenFauna],['GFW',onOpenGfw],['COBERTURA',onOpenCoverage],







    ['SALUD',onOpenSelfHealing],['PYTHIA',onOpenPythia],['OBSERVAR',onOpenObservation],







  ];















  if(mode==='CAPAS'){
    return <div className="space-y-2.5" data-amoh-unified-mode="CAPAS">
      <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.035] p-2.5">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <div className="text-[8px] font-mono font-bold tracking-[0.14em] text-cyan-100">CENTRO DE CONTROL · CONEXIONES</div>
            <div className="mt-0.5 text-[7px] text-[#718b97]">Cada interruptor controla su fuente y mantiene el estado del mapa.</div>
          </div>
          <span className="rounded-full border border-cyan-400/20 px-2 py-1 text-[7px] font-mono text-cyan-200">{activeIds.length} ACTIVAS</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {([
            ['AIS / barcos', 'API AIS + AISStream', 'live'],
            ['Aviación', 'Aviationstack · RECENT', 'delayed'],
            ['Satélites', 'CelesTrak / SGP4', 'delayed'],
            ['GFW', '4Wings + SAR', 'delayed'],
            ['Quantarctica', 'EPSG:3031 / local', 'local'],
            ['AIStream / MiroFish', 'API / proxy local', 'local'],
          ] as Array<[string, string, 'live' | 'delayed' | 'local']>).map(([label, detail, tone]) => (
            <div key={label} className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-black/10 px-1.5 py-1">
              <span className={`h-1.5 w-1.5 rounded-full ${
                tone === 'live' ? 'bg-emerald-300' : tone === 'delayed' ? 'bg-amber-300' : 'bg-cyan-300'
              }`} />
              <div className="min-w-0">
                <div className="truncate text-[7px] font-mono font-bold text-[#b7cbd1]">{label}</div>
                <div className="truncate text-[6px] text-[#718b97]">{detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>







      <div className="grid grid-cols-4 gap-1">







        {(['OPERAR','OFFSHORE','LOCALES','DERIVADOS'] as const).map(v=><button







          key={v}







          type="button"







          onClick={()=>setCapasView(v)}







          className={`rounded-lg border px-1 py-1.5 text-[7px] font-mono font-bold ${







            capasView===v







              ? 'border-cyan-400/35 bg-cyan-400/[0.08] text-cyan-100'







              : 'border-white/[0.07] text-[#718b97]'







          }`}







        >{v}</button>)}







      </div>















      <div className="flex flex-wrap gap-1">







        {tools.map(([label,fn])=>fn ? <button







          key={label}







          type="button"







          onClick={fn}







          className="px-2 py-1 rounded-md border border-white/[0.08] bg-white/[0.02] text-[7px] font-mono text-[#89a2ad] hover:text-white"







        >{label}</button> : null)}







      </div>















      {capasView==='OPERAR' && <div







        data-amoh-biodiversity-bridge="v34"







        onClickCapture={(event)=>{







          const target=event.target as HTMLElement;







          const clickable=target.closest('button,[role="button"]') as HTMLElement | null;







          const label=(clickable?.innerText || clickable?.textContent || '').toUpperCase();







          if(label.includes('BIODIVERSIDAD') && label.includes('ECOSISTEMAS')){







            event.preventDefault();







            event.stopPropagation();







            setCapasView('FAUNA');







          }







        }}







      >


        {/* AMOH_SATELLITE_PINNED_CONTROL_V4 */}
        <div
          data-amoh-satellite-pinned-control="v3"
          className="mb-2.5 rounded-xl border border-violet-400/35 bg-violet-500/[0.08] p-2.5 shadow-[0_0_28px_rgba(139,92,246,0.08)]"
        >
          <button
            type="button"
            onClick={() => {
              const next = !activeLayers['polar_satellites'];
              onToggleLayer('polar_satellites', next);
              if (next) {
                SpatialCameraStore.setMode('GLOBE');
              }
            }}
            className="w-full flex items-center justify-between gap-3 text-left"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-violet-300 shadow-[0_0_12px_rgba(196,181,253,0.95)]" />
                <span className="text-[10px] font-mono font-extrabold tracking-[0.12em] text-violet-200">
                  SATÉLITES SGP4 · EARTH SCALE
                </span>
              </div>
              <div className="mt-1 text-[9px] text-[#8faab5]">
                CelesTrak / NORAD · órbitas, trayectoria y telemetría propagada
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-mono font-bold ${
                activeLayers['polar_satellites']
                  ? 'border-violet-300/60 bg-violet-300/20 text-violet-100'
                  : 'border-[#294153] bg-[#081520] text-[#8099a4]'
              }`}
            >
              {activeLayers['polar_satellites'] ? 'ON · 1:1' : 'OFF'}
            </span>
          </button>
        </div>

<HierarchicalLayerLibrary







          embedded







          isOpen







          onClose={()=>undefined}







          activeLayerIds={activeIds}







          onToggleLayer={toggle}







          onSoloLayer={solo}







          onSetOpacity={onSetLayerOpacity}







          layerOpacities={layerOpacities}







        />







      </div>}















      {capasView==='FAUNA' && <div className="space-y-2" data-amoh-capas-subview="FAUNA">







        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-2.5">







          <div className="flex items-center justify-between gap-2">







            <div>







              <div className="text-[8px] font-mono font-bold text-emerald-200">BIODIVERSIDAD & ECOSISTEMAS</div>







              <div className="text-[7px] text-[#7d9198] mt-0.5">







                Capas lógicas existentes, sin duplicar aliases ni heatmaps derivados.







              </div>







            </div>







            <span className="text-[7px] font-mono text-emerald-200/80">{FAUNA_LOGICAL.length} GRUPOS</span>







          </div>







        </div>















        {/* AMOH_BIODIVERSITY_ECOSYSTEMS_V34 — six proven atomic ControlCenter leaves */}







        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.025] p-2">







          <div className="flex items-center justify-between gap-2">







            <div>







              <div className="text-[7px] font-mono font-bold text-emerald-200">ECOSISTEMA POLAR · 6 CAPAS ATÓMICAS</div>







              <div className="text-[6px] text-[#718891] mt-0.5">Krill · Pingüinos · Ballenas · Pinnípedos · Aves · Peces</div>







            </div>







            <div className="flex gap-1">







              <button type="button"







                data-amoh-biodiversity-action="activate-all"







                onClick={()=>{







                  ['fauna_krill_swarms','fauna_penguins','fauna_whale_pods','fauna_pinnipeds','fauna_seabirds','fauna_schools_fish']







                    .forEach(id=>{ if(!activeLayers[id]) onToggleLayer(id,true); });







                }}







                className="px-1.5 py-1 rounded border border-emerald-400/25 text-[6px] font-mono text-emerald-200 hover:bg-emerald-400/10">







                ACTIVAR 6







              </button>







              <button type="button"







                data-amoh-biodiversity-action="clear-all"







                onClick={()=>{







                  ['fauna_krill_swarms','fauna_penguins','fauna_whale_pods','fauna_pinnipeds','fauna_seabirds','fauna_schools_fish']







                    .forEach(id=>{ if(activeLayers[id]) onToggleLayer(id,false); });







                }}







                className="px-1.5 py-1 rounded border border-white/10 text-[6px] font-mono text-[#718891] hover:text-white">







                LIMPIAR 6







              </button>







            </div>







          </div>







        </div>















        {FAUNA_LOGICAL.map(([id,label,description,aliases])=><button







          key={id}







          type="button"







          data-amoh-biodiversity-layer={id}







          onClick={()=>toggle(id)}







          className={`w-full rounded-xl border px-2.5 py-2 text-left transition-all ${







            activeLayers[id]







              ? 'border-emerald-400/40 bg-emerald-400/[0.08]'







              : 'border-white/[0.07] bg-white/[0.015] hover:border-emerald-400/20'







          }`}







        >







          <div className="flex items-center justify-between gap-2">







            <div className="min-w-0">







              <div className="text-[9px] font-semibold text-[#d5e3e6]">{label}</div>







              <div className="text-[7px] text-[#7c949e] mt-0.5">{description}</div>







              <div className="text-[6px] font-mono text-[#566e79] mt-1 truncate">{aliases}</div>







            </div>







            <span className={`shrink-0 text-[7px] font-mono px-1.5 py-0.5 rounded border ${







              activeLayers[id]







                ? 'border-emerald-300/40 text-emerald-200 bg-emerald-400/10'







                : 'border-white/10 text-[#607984]'







            }`}>{activeLayers[id]?'ON':'OFF'}</span>







          </div>







        </button>)}















        <div className="rounded-lg border border-violet-400/15 bg-violet-400/[0.03] px-2.5 py-2">







          <div className="text-[7px] font-mono text-violet-200">DERIVADOS DE FAUNA</div>







          <div className="text-[7px] text-[#748b95] mt-0.5">







            Densidad fauna, pingüinos y ballenas siguen en DERIVADOS para mantener observación ≠ producto analítico.







          </div>







        </div>







      </div>}















      {capasView==='OFFSHORE' && <div className="space-y-2" data-amoh-capas-subview="OFFSHORE">







        <div className="rounded-xl border border-orange-400/20 bg-orange-400/[0.04] p-2.5">







          <div className="text-[8px] font-mono font-bold text-orange-200">OPERACIONES OFFSHORE & RECURSOS</div>







          <div className="text-[7px] text-[#7d9198] mt-0.5">







            Pozos, energía, minería submarina y minerales críticos. Contexto espacial; no implica actividad ilegal ni autorización.







          </div>







        </div>















        {OFFSHORE_LOGICAL.map(([id,label,description])=><button







          key={id}







          type="button"







          onClick={()=>toggle(id)}







          className={`w-full rounded-xl border px-2.5 py-2 text-left transition-all ${







            activeLayers[id]







              ? 'border-orange-400/40 bg-orange-400/[0.08]'







              : 'border-white/[0.07] bg-white/[0.015] hover:border-orange-400/20'







          }`}







        >







          <div className="flex items-center justify-between gap-2">







            <div className="min-w-0">







              <div className="text-[9px] font-semibold text-[#d5e3e6]">{label}</div>







              <div className="text-[7px] text-[#7c949e] mt-0.5">{description}</div>







              <div className="text-[6px] font-mono text-[#566e79] mt-1">{id}</div>







            </div>







            <span className={`shrink-0 text-[7px] font-mono px-1.5 py-0.5 rounded border ${







              activeLayers[id]







                ? 'border-orange-300/40 text-orange-200 bg-orange-400/10'







                : 'border-white/10 text-[#607984]'







            }`}>{activeLayers[id]?'ON':'OFF'}</span>







          </div>







        </button>)}















        {resourceLocals.length>0 && <div className="rounded-xl border border-white/[0.07] overflow-hidden">







          <div className="px-2.5 py-1.5 bg-white/[0.025] flex items-center justify-between">







            <span className="text-[8px] font-semibold text-[#a8bdc6]">CONTEXTO LOCAL RELACIONADO</span>







            <span className="text-[7px] font-mono text-[#607984]">{resourceLocals.length}</span>







          </div>







          <div className="p-1.5 space-y-1">







            {resourceLocals.map(d=><div key={d.canonicalId} className="rounded-lg border border-white/[0.06] bg-[#07141c] px-2 py-1.5">







              <div className="flex items-center justify-between gap-2">







                <div className="min-w-0">







                  <div className="text-[8px] text-[#c2d1d6] truncate">{d.displayName}</div>







                  <div className="text-[6px] font-mono text-[#647d88] mt-0.5 truncate">{d.canonicalId} · {countLabel(d.records)} reg.</div>







                </div>







                <span className="text-[6px] font-mono px-1 py-0.5 rounded border border-amber-400/20 text-amber-200">{d.status}</span>







              </div>







            </div>)}







          </div>







        </div>}







      </div>}















      {capasView==='LOCALES' && <div className="space-y-2">







        <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.035] p-2">







          <div className="text-[8px] font-mono font-bold text-amber-200">DATOS LOCALES AUDITADOS</div>







          <div className="text-[7px] text-[#7d9198] mt-0.5">







            Sin toggle hasta demostrar source + runtime + render. No se elimina ningún dataset.







          </div>







        </div>















        <input







          value={query}







          onChange={e=>setQuery(e.target.value)}







          placeholder="Buscar dataset, familia, dominio..."







          className="w-full rounded-lg bg-[#07131c] border border-[#1c3444] px-2.5 py-2 text-[8px] text-white outline-none"







        />















        {grouped.map(([domain,items])=><div







          key={domain}







          className="rounded-xl border border-white/[0.07] overflow-hidden"







        >







          <div className="px-2.5 py-1.5 bg-white/[0.025] flex items-center justify-between text-[8px] font-semibold text-[#a8bdc6]">







            <span>{domain.replaceAll('_',' ')}</span>







            <span className="font-mono text-[#607984]">{items.length}</span>







          </div>







          <div className="p-1.5 space-y-1">







            {items.map(d=><div







              key={d.canonicalId}







              className="rounded-lg border border-white/[0.06] bg-[#07141c] px-2 py-1.5"







            >







              <div className="flex items-center justify-between gap-2">







                <div className="min-w-0">







                  <div className="text-[8px] text-[#c2d1d6] truncate">{d.displayName}</div>







                  <div className="text-[6px] font-mono text-[#647d88] mt-0.5 truncate">







                    {d.familyName} · {countLabel(d.records)} reg. · {d.provenance}







                  </div>







                </div>







                <div className="flex items-center gap-1 shrink-0">







                  <span className="text-[6px] font-mono px-1 py-0.5 rounded border border-cyan-400/15 text-cyan-200">







                    {d.priority}







                  </span>







                  <span className={`text-[6px] font-mono px-1 py-0.5 rounded border ${







                    d.status==='REVISAR'







                      ? 'border-orange-400/20 text-orange-200'







                      : d.status==='CONTEXTO'







                        ? 'border-white/10 text-[#849aa4]'







                        : 'border-amber-400/20 text-amber-200'







                  }`}>{d.status}</span>







                </div>







              </div>







            </div>)}







          </div>







        </div>)}







      </div>}















      {capasView==='DERIVADOS' && <div className="space-y-1.5">







        <div className="rounded-xl border border-violet-400/15 bg-violet-400/[0.035] p-2">







          <div className="text-[8px] font-mono font-bold text-violet-200">PRODUCTOS DERIVADOS</div>







          <div className="text-[7px] text-[#7d9198]">







            9 heatmaps canónicos + MiroFish legacy. Derivado ≠ observación directa.







          </div>







        </div>







        {DERIVED.map(([id,label,kind])=><button







          key={id}







          type="button"







          onClick={()=>toggle(id)}







          className={`w-full rounded-lg border px-2.5 py-2 flex items-center justify-between text-left ${







            activeLayers[id]







              ? 'border-violet-400/35 bg-violet-400/[0.07]'







              : 'border-white/[0.07] bg-white/[0.015]'







          }`}







        >







          <span>







            <span className="text-[8px] text-[#c7d4d9]">{label}</span>







            <span className="block text-[6px] font-mono text-[#687e89] mt-0.5">{kind}</span>







          </span>







          <span className={`text-[7px] font-mono ${activeLayers[id]?'text-violet-300':'text-[#607984]'}`}>







            {activeLayers[id]?'ON':'OFF'}







          </span>







        </button>)}







      </div>}







    </div>;







  }















  if(mode==='ODS'){







    return <div className="space-y-2" data-amoh-unified-mode="ODS">







      <div className="grid grid-cols-2 gap-1">







        <button







          type="button"







          onClick={()=>setOdsView('SDG_2030')}







          className={`rounded-lg border px-2 py-1.5 text-[8px] font-mono ${







            odsView==='SDG_2030'







              ? 'border-cyan-400/35 text-cyan-100'







              : 'border-white/10 text-[#718b97]'







          }`}







        >ODS 2030</button>







        <button







          type="button"







          onClick={()=>setOdsView('COOPERATION')}







          className={`rounded-lg border px-2 py-1.5 text-[8px] font-mono ${







            odsView==='COOPERATION'







              ? 'border-cyan-400/35 text-cyan-100'







              : 'border-white/10 text-[#718b97]'







          }`}







        >COOPERACIÓN</button>







      </div>







      <SdgLensDrawer







        key={odsView}







        embedded







        hideFrameworkTabs







        isOpen







        initialFramework={odsView}







        onClose={()=>undefined}







        activeGoalNumber={activeSdgGoal}







        onSelectGoal={g=>onSelectSdgGoal?.(g)}







      />







    </div>;







  }















  if(mode==='XDG'){







    return <div data-amoh-unified-mode="XDG">







      <SdgLensDrawer







        key="XDG_2045"







        embedded







        hideFrameworkTabs







        isOpen







        initialFramework="XDG_2045"







        onClose={()=>undefined}







        activeGoalNumber={activeSdgGoal}







        onSelectGoal={g=>onSelectSdgGoal?.(g)}







      />







    </div>;







  }















  return <div className="space-y-2.5" data-amoh-unified-mode="CRUCE">







    <div className="grid grid-cols-2 gap-1">







      <button







        type="button"







        onClick={()=>setCruceView('3031')}







        className={`rounded-lg border px-2 py-1.5 text-[8px] font-mono ${







          cruceView==='3031'







            ? 'border-fuchsia-400/35 text-fuchsia-100'







            : 'border-white/10 text-[#718b97]'







        }`}







      >MÉTRICA 3031</button>







      <button







        type="button"







        onClick={()=>setCruceView('CROSS')}







        className={`rounded-lg border px-2 py-1.5 text-[8px] font-mono ${







          cruceView==='CROSS'







            ? 'border-cyan-400/35 text-cyan-100'







            : 'border-white/10 text-[#718b97]'







        }`}







      >ANÁLISIS CRUZADO</button>







    </div>







    {cruceView==='3031'







      ? <SpatialMetricPanel embedded />







      : <CrossAnalysisPanel embedded />}







  </div>;







}




