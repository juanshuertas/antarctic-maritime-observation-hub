type FC={type:'FeatureCollection';features:any[]};
type Pt={c:[number,number];w:number};

const SRC={
 base:['/data/web/geojson/grey_zones_defense.geojson'],
 pfi:['/data/web/geojson/polar_friction_sectors.geojson'],
 gfw:['/api/gfw/fishing-effort-heatmap'],
 tourism:[
  '/data/web/geojson/iaato_tourism_routes.geojson',
  '/data/web/geojson/iaato_routes.geojson',
  '/data/web/geojson/tourism_routes.geojson'
 ],
 krill:[
  '/data/web/geojson/fauna_krill_swarms.geojson',
  '/data/web/geojson/fauna_krill.geojson'
 ],
 penguins:['/data/web/geojson/penguin_colonies.geojson'],
 whales:['/data/web/geojson/whales.geojson'],
 aspa:['/data/web/geojson/aspa.geojson','/data/web/geojson/aspa_asma.geojson'],
 mpa:['/data/web/geojson/ccamlr_mpas.geojson','/data/web/geojson/ccamlr_mpa.geojson']
} as const;

function fc(payload:any):FC|null{
 if(!payload)return null;
 if(payload.type==='FeatureCollection'&&Array.isArray(payload.features))return payload;
 for(const k of ['heatmap_points','grid_cells','data','geojson','result']){
  const v=payload?.[k];
  if(v?.type==='FeatureCollection'&&Array.isArray(v.features))return v;
 }
 if(Array.isArray(payload.features))return {type:'FeatureCollection',features:payload.features};
 return null;
}

async function first(urls:readonly string[]){
 for(const url of urls){
  try{
   const r=await fetch(url,{cache:'no-store'});
   if(!r.ok)continue;
   const j=await r.json();
   const g=fc(j);
   if(g?.features?.length)return {g,url};
  }catch{}
 }
 return null;
}

function num(v:any){const n=Number(v);return Number.isFinite(n)?n:null}
function coord(v:any):v is [number,number]{
 return Array.isArray(v)&&v.length>=2&&Number.isFinite(+v[0])&&Number.isFinite(+v[1])&&+v[0]>=-180&&+v[0]<=180&&+v[1]>=-90&&+v[1]<=90;
}
function flat(g:any){
 if(!g)return [] as [number,number][];
 if(g.type==='Point')return coord(g.coordinates)?[g.coordinates]:[];
 if(g.type==='MultiPoint')return (g.coordinates||[]).filter(coord);
 const out:[number,number][]=[];
 const walk=(v:any)=>{if(coord(v)){out.push([+v[0],+v[1]]);return}if(Array.isArray(v))v.forEach(walk)};
 walk(g.coordinates);return out;
}
function center(g:any):[number,number]|null{
 const a=flat(g);if(!a.length)return null;
 let x=0,y=0;for(const p of a){x+=p[0];y+=p[1]}
 return [x/a.length,y/a.length];
}
function dist(a:[number,number],b:[number,number]){
 const R=6371.0088,rad=(x:number)=>x*Math.PI/180;
 const la1=rad(a[1]),la2=rad(b[1]),dLa=la2-la1,dLo=rad(b[0]-a[0]);
 const h=Math.sin(dLa/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLo/2)**2;
 return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));
}
function raw(props:any,keys:string[]){
 for(const k of keys){const v=num(props?.[k]);if(v!=null&&v>=0)return v}
 return 1;
}
function pts(g:FC,keys:string[]):Pt[]{
 return g.features.slice(0,40000).flatMap((f:any)=>{
  const c=center(f.geometry);if(!c)return [];
  return [{c,w:Math.max(.05,Math.log1p(Math.max(0,raw(f.properties,keys))))}]
 });
}
function kernel(c:[number,number]|null,a:Pt[],r:number){
 if(!c||!a.length)return 0;
 const s=r/2.4;let z=0;
 for(const p of a){const d=dist(c,p.c);if(d<=r)z+=Math.exp(-.5*(d/s)*(d/s))*p.w}
 return z;
}
function norm(a:number[]){
 const b=[...a].filter(Number.isFinite).sort((x,y)=>x-y);
 const q=b.length?b[Math.floor((b.length-1)*.95)]||1:1;
 return a.map(v=>Math.max(0,Math.min(1,v/Math.max(1e-9,q))));
}
function prop(p:any,keys:string[],fallback:number){
 for(const k of keys){const v=num(p?.[k]);if(v!=null)return Math.max(0,Math.min(1,v>1?v/100:v))}
 return fallback;
}
function completeness(p:any){
 return (
  Number(Boolean(p?.source||p?.provider||p?.provenance||p?.agency))+
  Number(Boolean(p?.timestamp||p?.date||p?.datetime||p?.observed_at||p?.year))+
  Number(num(p?.confidence)!=null||num(p?.quality)!=null)
 )/3;
}
function cls(s:number){
 if(s<.25)return ['OBSERVACION','Observación'];
 if(s<.50)return ['INTERACCION','Interacción'];
 if(s<.70)return ['ATENCION','Atención'];
 if(s<.85)return ['ALTA_INTERACCION','Alta interacción'];
 return ['VERIFICACION_PRIORITARIA','Verificación prioritaria'];
}
function avg(a:number[]){return a.length?a.reduce((x,y)=>x+y,0)/a.length:0}

async function bundle(urls:readonly string[],keys:string[]){
 const f=await first(urls);
 return {ok:!!f,url:f?.url??null,p:f?pts(f.g,keys):[]};
}

export async function buildOceanopoliticalFrictionLayer(){
 const base=await first(SRC.base);
 if(!base)throw new Error('grey_zones_defense.geojson unavailable');

 const [pfi,gfw,tourism,krill,penguins,whales,aspa,mpa]=await Promise.all([
  bundle(SRC.pfi,['polar_friction_index','tension_weight','weight']),
  bundle(SRC.gfw,['apparent_fishing_hours','fishing_hours','hours','effort','value']),
  bundle(SRC.tourism,['passengers','visits','landings','density','weight']),
  bundle(SRC.krill,['biomass_density_g_m2','school_biomass_tons','biomass','density','weight']),
  bundle(SRC.penguins,['population','population_estimate','individuals','count','density']),
  bundle(SRC.whales,['individuals','pod_size','count','density','weight']),
  bundle(SRC.aspa,['weight']),
  bundle(SRC.mpa,['weight'])
 ]);

 const centers=base.g.features.map((f:any)=>center(f.geometry));
 const sr:number[]=[],mr:number[]=[],gr:number[]=[],er:number[]=[],dr:number[]=[],ur:number[]=[];

 base.g.features.forEach((f:any,i:number)=>{
  const c=centers[i];
  const b=prop(f.properties,['polar_friction_index','friction_index','tension_weight','weight'],.35);
  sr.push(b+.35*kernel(c,pfi.p,250));
  mr.push(kernel(c,gfw.p,220)+.75*kernel(c,tourism.p,180));
  gr.push(kernel(c,aspa.p,180)+kernel(c,mpa.p,220));
  er.push(kernel(c,krill.p,180)+.8*kernel(c,penguins.p,150)+.9*kernel(c,whales.p,180));

  const cats:[[Pt[],number],[Pt[],number],[Pt[],number],[Pt[],number],[Pt[],number],[Pt[],number]]=[
   [gfw.p,220],[tourism.p,180],[krill.p,180],[penguins.p,150],[whales.p,180],[[...aspa.p,...mpa.p],200]
  ];
  let hit=0,avail=0;
  for(const [a,r] of cats){if(!a.length)continue;avail++;if(kernel(c,a,r)>0)hit++}
  dr.push(avail?hit/avail:0);

  const cp=completeness(f.properties);
  const cf=prop(f.properties,['confidence','data_confidence','quality'],cp);
  ur.push(Math.max(0,Math.min(1,1-(.65*cf+.35*cp))));
 });

 const s=norm(sr),m=norm(mr),g=norm(gr),e=norm(er);
 const avail={
  strategic:true,
  maritime:gfw.p.length>0||tourism.p.length>0,
  governance:aspa.p.length>0||mpa.p.length>0,
  ecosystem:krill.p.length>0||penguins.p.length>0||whales.p.length>0,
  use_diversity:[gfw.p,tourism.p,krill.p,penguins.p,whales.p,aspa.p,mpa.p].some(x=>x.length>0),
  uncertainty:true
 };
 const W:any={strategic:.25,maritime:.22,governance:.18,ecosystem:.15,use_diversity:.10,uncertainty:.10};

 const features=base.g.features.map((f:any,i:number)=>{
  const v:any={strategic:s[i]||0,maritime:m[i]||0,governance:g[i]||0,ecosystem:e[i]||0,use_diversity:dr[i]||0,uncertainty:ur[i]||0};
  let n=0,d=0;
  for(const k of Object.keys(W)){
   if(k!=='strategic'&&k!=='uncertainty'&&!avail[k as keyof typeof avail])continue;
   n+=W[k]*v[k];d+=W[k];
  }
  const score=d?n/d:0;
  const [classId,classLabel]=cls(score);

  return {
   ...f,
   properties:{
    ...(f.properties||{}),
    oceanopolitical_friction_index:Math.round(score*1000)/10,
    oceanopolitical_friction_score:score,
    friction_class:classId,
    friction_class_label:classLabel,
    strategic_interaction:v.strategic,
    maritime_pressure:v.maritime,
    governance_sensitivity:v.governance,
    ecosystem_sensitivity:v.ecosystem,
    use_diversity:v.use_diversity,
    information_uncertainty:v.uncertainty,
    tension_weight:score*100,
    _amoh_weight:score*100,
    analytical_framework:'AMOH-CODENAL-CIDENAL-OCEANOPOLITICS-V5',
    interpretation:'Exploratory spatial interaction index; not actor attribution, legal finding, threat designation or evidence of intent.'
   }
  };
 });

 const counts:Record<string,number>={};
 features.forEach((f:any)=>{const k=f.properties?.friction_class_label||'Sin clase';counts[k]=(counts[k]||0)+1});

 const meta={
  version:'5.0',
  officialIndex:false,
  title:'Índice de Fricción Oceanopolítica AMOH',
  zones:features.length,
  availability:avail,
  classCounts:counts,
  axisAverages:{
   strategic:avg(s),
   maritime:avg(m),
   governance:avg(g),
   ecosystem:avg(e),
   use_diversity:avg(dr),
   uncertainty:avg(ur)
  },
  sources:{
   base:base.url,
   pfi:pfi.url,
   gfw:gfw.url,
   tourism:tourism.url,
   krill:krill.url,
   penguins:penguins.url,
   whales:whales.url,
   aspa:aspa.url,
   mpa:mpa.url
  },
  guardrails:[
   'No atribuye intención, hostilidad ni incumplimiento.',
   'No convierte reclamaciones territoriales antárticas en conflicto.',
   'ASPA/MPA elevan sensibilidad de gobernanza, no implican infracción.',
   'Asociación espacial no implica causalidad.',
   'Dimensiones sin datos se excluyen y los pesos se renormalizan.'
  ],
  generatedAt:new Date().toISOString()
 };

 (window as any).__amohOceanopoliticalFrictionMeta=meta;

 return {type:'FeatureCollection',features} as FC;
}
