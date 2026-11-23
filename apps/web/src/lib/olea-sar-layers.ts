// OLEA · Radar de apertura sintetica (SAR) sobre la Peninsula Antartica y el
// Paso de Drake. Cosecha 2026-11-14 contra el ASF Search API de la NASA
// (api.daac.asf.alaska.edu) y el portal de datos abiertos de la CSA.
//
// QUE AFIRMAN ESTAS CAPAS, Y QUE NO.
// Afirman que existe una observacion: donde miro el radar, cuando, en que
// banda, con que polarizacion y como pedir la escena. NO afirman nada sobre lo
// que la observacion midio. De un catalogo de metadatos no sale velocidad del
// hielo, ni deteccion de barcos, ni vertidos de hidrocarburos: eso exige
// descargar y procesar las escenas. Cualquier etiqueta que sugiriera lo
// contrario seria falsa, asi que aqui no la hay.
//
// COBERTURA DE LA COSECHA. Tres misiones y un tipo de producto por mision:
// NISAR GCOV (L2 geocodificado), Sentinel-1 GRD alta resolucion y ALOS PALSAR
// L1.5. Quedan fuera RADARSAT-1/2, RCM (salvo la escena abierta), TerraSAR-X,
// COSMO-SkyMed, SAOCOM e ICEYE, porque sus catalogos no son consultables sin
// credenciales. Por eso "sin pasadas desde 2021" significa SIN PASADAS DE
// ESTOS TRES PRODUCTOS, no que ningun radar haya mirado.
//
// Caja de cosecha: 70-55 O, 68-54 S. Es la misma que usa el paquete de
// Copernicus Marine del Observatory, para que las capas se puedan superponer
// sin recortes distintos.

import type { LayerDefinition } from './layer-registry';
import type { LeafLayerItem } from './hierarchical-layers';

// ---------------------------------------------------------------------------
// Atribuciones. Una por proveedor, completa: quien produce el dato, quien lo
// distribuye y bajo que condiciones. El distribuidor no es el autor.
// ---------------------------------------------------------------------------
const ATTR_NISAR =
  'NISAR (NASA-ISRO SAR Mission) — NASA/JPL-Caltech e ISRO. Productos L2 GCOV ' +
  'distribuidos por el ASF DAAC (NASA EOSDIS). Metadatos cosechados del ASF ' +
  'Search API el 2026-11-14. Datos NASA: uso libre, se pide citar la mision y el DAAC.';

const ATTR_S1 =
  'Copernicus Sentinel-1 — datos Copernicus modificados 2014-2026, propiedad de ' +
  'la Union Europea / ESA. Productos GRD alta resolucion distribuidos por el ASF ' +
  'DAAC (NASA EOSDIS). Metadatos del ASF Search API, 2026-11-14.';

const ATTR_ALOS =
  'ALOS PALSAR — (c) JAXA / METI. Distribuido por el ASF DAAC bajo acuerdo con ' +
  'JAXA. Metadatos del ASF Search API, 2026-11-14.';

const ATTR_GRID =
  'Rejilla derivada por OLEA de los catalogos de NISAR (NASA/ISRO, via ASF DAAC), ' +
  'Sentinel-1 (Copernicus/ESA, via ASF DAAC) y ALOS PALSAR (JAXA/METI, via ASF ' +
  'DAAC). Cosecha 2026-11-14. Conteo propio, no un producto oficial de ninguna agencia.';

const ATTR_RCM =
  'RADARSAT Constellation Mission — (c) Gobierno de Canada / Agencia Espacial ' +
  'Canadiense (ASC-CSA) 2020. Open Government Licence - Canada. Escena publicada ' +
  'en el portal de datos abiertos de la CSA.';

// ---------------------------------------------------------------------------
// Capas
// ---------------------------------------------------------------------------
export const OLEA_SAR_LAYERS: Record<string, LayerDefinition> = {
  // --- Rejilla de cobertura: tres lecturas del mismo archivo ---------------
  // Las tres capas de rejilla comparten el GeoJSON y se distinguen solo por el
  // color: cuanto, cuando y quien. Separarlas evita una leyenda de tres ejes
  // que nadie lee, y cada pregunta se responde con su propio mapa.

  sar_coverage_grid: {
    id: 'sar_coverage_grid',
    name: 'Radar · cuantas veces ha mirado (NISAR + Sentinel-1 + ALOS)',
    category: 'OBSERVACION REMOTA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      // Celdas de 0,4 deg de longitud por 0,2 deg de latitud: a 61 S eso es
      // ~21,6 x ~22,2 km, practicamente cuadradas ALLI. Mas al norte de la
      // caja la celda se ensancha y mas al sur se estrecha: es una rejilla
      // geografica, no equiareal, y a 54 S la celda es un 25 % mas ancha que
      // a 68 S. Una celda cuenta una pasada cuando SU CENTRO cae dentro de la
      // huella de la escena; es el criterio conservador, no infla por roce de
      // esquina.
      url: '/data/web/geojson/sar_coverage_grid.geojson',
      attribution: ATTR_GRID,
    },
    paint: {
      // Rampa secuencial cian: oscuro = poca atencion del radar, claro = mucha.
      // Los cortes siguen los cuantiles reales de la cosecha (minimo 29, p10 98,
      // mediana 216, p90 399, maximo 1.011) redondeados a numeros que la leyenda
      // pueda leer. Con cortes equiespaciados el 90 % del mapa caia en los dos
      // primeros colores y las bandas de traza orbital no se distinguian.
      'fill-color': [
        'interpolate', ['linear'], ['get', 'n'],
        30, '#083344',
        100, '#155e75',
        200, '#0891b2',
        400, '#22d3ee',
        700, '#a5f3fc',
        1000, '#ecfeff',
      ],
      'fill-outline-color': 'rgba(8, 47, 73, 0.25)',
    },
  },

  sar_coverage_recency: {
    id: 'sar_coverage_recency',
    name: 'Radar · cuando fue la ultima pasada (sombra de observacion)',
    category: 'OBSERVACION REMOTA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/sar_coverage_grid.geojson',
      attribution: ATTR_GRID,
    },
    paint: {
      // El color va al reves de lo habitual a proposito: lo RECIENTE queda
      // apagado y lo ANTIGUO salta en rojo. Lo que esta capa existe para
      // mostrar es el hueco, no la rutina.
      'fill-color': [
        'interpolate', ['linear'], ['get', 'age'],
        0, '#1e3a5f',
        1, '#7dd3fc',
        3, '#fbbf24',
        7, '#f97316',
        16, '#ef4444',
      ],
      'fill-outline-color': 'rgba(15, 23, 42, 0.4)',
    },
  },

  sar_nisar_coverage: {
    id: 'sar_nisar_coverage',
    name: 'NISAR · donde ya llega y donde todavia no (primer ano)',
    category: 'OBSERVACION REMOTA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/sar_coverage_grid.geojson',
      attribution: ATTR_GRID,
    },
    paint: {
      // Gris pizarra = ninguna adquisicion de NISAR en esa celda. No es "cero
      // en la rampa": es una categoria distinta, y mezclarla con el extremo
      // bajo de la rampa borraria justo lo que la capa quiere ensenar.
      'fill-color': [
        'case',
        ['has', 'nisar'],
        [
          'interpolate', ['linear'], ['get', 'nisar'],
          1, '#312e81',
          20, '#6366f1',
          50, '#a78bfa',
          80, '#e9d5ff',
          120, '#faf5ff',
        ],
        '#334155',
      ],
      'fill-outline-color': 'rgba(30, 27, 75, 0.45)',
    },
  },

  // --- Huellas de adquisicion ---------------------------------------------
  // Se dibujan como contornos, no como relleno: 1.423 poligonos rellenos se
  // funden en una mancha y ocultan el mapa. El color lleva su propio alfa para
  // que el solape se lea como trama y no como pared, independientemente del
  // control de opacidad de la capa.

  sar_nisar_passes: {
    id: 'sar_nisar_passes',
    name: 'NISAR · huellas de adquisicion, banda L (2025-2026)',
    category: 'OBSERVACION REMOTA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/sar_nisar_passes.geojson',
      attribution: ATTR_NISAR,
    },
    paint: {
      // Ascendente frente a descendente: es el dato geometrico que mas pesa al
      // interpretar una imagen de radar, porque cambia el lado desde el que se
      // ilumina el terreno y, con el, que laderas se ven comprimidas y cuales
      // en sombra. Dos pasadas de rumbo opuesto sobre el mismo sitio no son
      // repeticiones, son vistas distintas.
      'line-color': [
        'match', ['get', 'dir'],
        'ASC', 'rgba(244, 114, 182, 0.55)',
        'DES', 'rgba(56, 189, 248, 0.55)',
        'rgba(226, 232, 240, 0.5)',
      ],
      'line-width': ['interpolate', ['linear'], ['zoom'], 2, 0.5, 5, 1.1, 8, 2.0],
    },
  },

  sar_sentinel1_passes: {
    id: 'sar_sentinel1_passes',
    name: 'Sentinel-1 · huellas GRD, banda C (2014-2026)',
    category: 'OBSERVACION REMOTA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      url: '/data/web/geojson/sar_sentinel1_passes.geojson',
      attribution: ATTR_S1,
    },
    paint: {
      // Color por polarizacion, que aqui equivale a para que se tomo la escena:
      // HH+HV es el par que Sentinel-1 usa sobre hielo marino en modo EW de
      // barrido ancho, y VV+VH el de las franjas IW sobre tierra y costa.
      'line-color': [
        'match', ['get', 'pol'],
        'HH+HV', 'rgba(251, 191, 36, 0.45)',
        'VV+VH', 'rgba(52, 211, 153, 0.45)',
        'rgba(226, 232, 240, 0.4)',
      ],
      'line-width': ['interpolate', ['linear'], ['zoom'], 2, 0.4, 5, 0.9, 8, 1.6],
    },
  },

  sar_rcm_open_scene: {
    id: 'sar_rcm_open_scene',
    name: 'RCM · escena antartica de libre acceso (CSA, 2020)',
    category: 'OBSERVACION REMOTA',
    sdg: 14,
    sdgColor: '#0A97D9',
    type: 'geojson',
    source: {
      type: 'geojson',
      // Huella y parametros leidos de preview/mapOverlay.kml del propio
      // producto, no estimados. Es la unica adquisicion sobre la Antartida que
      // la CSA publica en abierto; el resto del archivo de RCM pasa por EODMS
      // con cuenta y con restricciones de distribucion.
      url: '/data/web/geojson/sar_rcm_open_scene.geojson',
      attribution: ATTR_RCM,
    },
    paint: {
      'line-color': '#f43f5e',
      'line-width': ['interpolate', ['linear'], ['zoom'], 2, 1.4, 5, 2.6, 8, 4.0],
    },
  },
};

// ---------------------------------------------------------------------------
// Arbol canonico
// ---------------------------------------------------------------------------
export const OLEA_SAR_META: Record<string, { domain: string; group: string; role: string }> = {
  sar_coverage_grid: { domain: 'OBSERVATIONS_EVIDENCE', group: 'radar_sar', role: 'REMOTE_OBSERVATION' },
  sar_coverage_recency: { domain: 'OBSERVATIONS_EVIDENCE', group: 'radar_sar', role: 'REMOTE_OBSERVATION' },
  sar_nisar_coverage: { domain: 'OBSERVATIONS_EVIDENCE', group: 'radar_sar', role: 'REMOTE_OBSERVATION' },
  sar_nisar_passes: { domain: 'OBSERVATIONS_EVIDENCE', group: 'radar_sar', role: 'REMOTE_OBSERVATION' },
  sar_sentinel1_passes: { domain: 'OBSERVATIONS_EVIDENCE', group: 'radar_sar', role: 'REMOTE_OBSERVATION' },
  sar_rcm_open_scene: { domain: 'OBSERVATIONS_EVIDENCE', group: 'radar_sar', role: 'REMOTE_OBSERVATION' },
};

export const OLEA_SAR_TREE_ITEMS: LeafLayerItem[] = [
  {
    id: 'sar_coverage_grid',
    label: 'Radar · cuántas veces ha mirado',
    subdomain: 'radar_sar',
    domain: 'OBSERVATIONS_EVIDENCE',
    description:
      'Pasadas de radar acumuladas por celda de ~22 km sobre la Península y el Drake, sumando NISAR, ' +
      'Sentinel-1 y ALOS PALSAR. Entre 29 y 1.011 pasadas por celda, mediana 216: ninguna parte de esta ' +
      'caja está sin observar. Cuenta adquisiciones, no mediciones: dice que el radar pasó, no qué vio.',
    provider: 'NASA ASF DAAC · ESA/Copernicus · JAXA/METI',
    dataset: 'NISAR GCOV + Sentinel-1 GRD_HD + ALOS PALSAR L1.5 (ASF Search API)',
    variable: 'pasadas',
    enabled: false,
    opacity: 0.45,
    health: 'BLUE',
    healthLabel: 'ASF · COSECHA 2026-11-14',
    recordCount: 2660,
    hasDataInView: false,
    unit: 'pasadas',
    license: 'NASA EOSDIS libre · Copernicus Sentinel · JAXA/METI vía ASF — citar cada fuente',
  },
  {
    id: 'sar_coverage_recency',
    label: 'Radar · cuándo fue la última pasada',
    subdomain: 'radar_sar',
    domain: 'OBSERVATIONS_EVIDENCE',
    description:
      'Antigüedad de la última adquisición de radar en cada celda. 1.973 celdas (74 %) fueron observadas ' +
      'en 2026; 687 llevan más de un año sin pasada y ocho no han vuelto a verse desde enero de 2011. ' +
      'Las celdas en rojo están TODAS en el norte de la caja, sobre el océano abierto del Drake: el radar ' +
      'se concentra en tierra y hielo. Sombra de estos tres productos, no de todo radar existente.',
    provider: 'NASA ASF DAAC · ESA/Copernicus · JAXA/METI',
    dataset: 'NISAR GCOV + Sentinel-1 GRD_HD + ALOS PALSAR L1.5 (ASF Search API)',
    variable: 'años desde la última pasada',
    enabled: false,
    opacity: 0.45,
    health: 'BLUE',
    healthLabel: 'ASF · COSECHA 2026-11-14',
    recordCount: 2660,
    hasDataInView: false,
    unit: 'años',
    license: 'NASA EOSDIS libre · Copernicus Sentinel · JAXA/METI vía ASF — citar cada fuente',
  },
  {
    id: 'sar_nisar_coverage',
    label: 'NISAR · dónde ya llega y dónde todavía no',
    subdomain: 'radar_sar',
    domain: 'OBSERVATIONS_EVIDENCE',
    description:
      'Adquisiciones de NISAR por celda en su primer año de operación. 704 celdas (26 %) siguen en gris: ' +
      'sin una sola adquisición. Las que sí tiene llegan a 118 pasadas en trece meses, un ritmo que ninguna ' +
      'misión anterior sostuvo sobre la Península. El hueco está en el norte, sobre el Paso de Drake.',
    provider: 'NASA/JPL-Caltech e ISRO · ASF DAAC',
    dataset: 'NISAR L2 GCOV (beta, provisional y validado)',
    variable: 'adquisiciones NISAR',
    enabled: false,
    opacity: 0.45,
    health: 'BLUE',
    healthLabel: 'NISAR · COSECHA 2026-11-14',
    recordCount: 2660,
    hasDataInView: false,
    unit: 'adquisiciones',
    license: 'Datos NASA de uso libre — citar NISAR y el ASF DAAC',
  },
  {
    id: 'sar_nisar_passes',
    label: 'NISAR · huellas de adquisición (banda L)',
    subdomain: 'radar_sar',
    domain: 'OBSERVATIONS_EVIDENCE',
    description:
      '1.423 adquisiciones de NISAR entre el 18-oct-2025 y el 5-nov-2026, sobre 24 trazas orbitales. ' +
      'Rosa = órbita ascendente, azul = descendente: cambian el lado desde el que se ilumina el terreno. ' +
      'Clic para ver polarización, ancho de banda, madurez del producto y el enlace de descarga. ' +
      'Solo 89 de las 1.423 son producto validado; 1.084 son provisionales y 250 beta.',
    provider: 'NASA/JPL-Caltech e ISRO · ASF DAAC',
    dataset: 'NISAR L2 GCOV v1 / provisional / beta',
    variable: 'huella de adquisición',
    enabled: false,
    opacity: 0.85,
    health: 'BLUE',
    healthLabel: 'NISAR · 1.423 ADQ.',
    recordCount: 1423,
    hasDataInView: false,
    unit: '',
    license: 'Datos NASA de uso libre — citar NISAR y el ASF DAAC',
  },
  {
    id: 'sar_sentinel1_passes',
    label: 'Sentinel-1 · huellas GRD (banda C)',
    subdomain: 'radar_sar',
    domain: 'OBSERVATIONS_EVIDENCE',
    description:
      '3.212 escenas GRD de alta resolución entre el 1-nov-2014 y el 11-nov-2026, de los cuatro satélites ' +
      'de la constelación (S1A, S1B, S1C y S1D). Ámbar = HH+HV, el par de barrido ancho sobre hielo marino; ' +
      'verde = VV+VH, las franjas IW sobre tierra y costa. Doce años continuos: es el único de los tres ' +
      'archivos que permite seguir un cambio estacional repetido.',
    provider: 'ESA / Copernicus · ASF DAAC',
    dataset: 'Sentinel-1 GRD alta resolución (IW, EW y franja)',
    variable: 'huella de adquisición',
    enabled: false,
    opacity: 0.85,
    health: 'BLUE',
    healthLabel: 'SENTINEL-1 · 3.212 ESC.',
    recordCount: 3212,
    hasDataInView: false,
    unit: '',
    license: 'Datos Copernicus modificados 2014-2026 — UE/ESA, vía ASF DAAC',
  },
  {
    id: 'sar_rcm_open_scene',
    label: 'RCM · escena antártica de libre acceso (CSA)',
    subdomain: 'radar_sar',
    domain: 'OBSERVATIONS_EVIDENCE',
    description:
      'La única adquisición de la RADARSAT Constellation Mission sobre la Antártida que la Agencia Espacial ' +
      'Canadiense publica en abierto: RCM-3, 24-ene-2020, ScanSAR 30 m con polarimetría compacta CH+CV, ' +
      '148 × 132 km sobre la costa oeste de la Península. Descargable en GRD, SLC y MLC sin registro. ' +
      'El resto del archivo de RCM pasa por EODMS, con cuenta y restricciones de distribución.',
    provider: 'Agencia Espacial Canadiense (ASC-CSA)',
    dataset: 'RCM3_OK1050586_PK1050588_3_SC30MCPB_20200124_083635_CH_CV',
    variable: 'huella de adquisición',
    enabled: false,
    opacity: 0.85,
    health: 'BLUE',
    healthLabel: 'CSA · 1 ESCENA ABIERTA',
    recordCount: 1,
    hasDataInView: false,
    unit: '',
    license: 'Open Government Licence - Canada — (c) Gobierno de Canadá 2020',
  },
];

// ---------------------------------------------------------------------------
// Fichas emergentes
// ---------------------------------------------------------------------------
const NISAR_COLLECTION: Record<string, string> = {
  B: 'NISAR_L2_GCOV_BETA_V1',
  P: 'NISAR_L2_GCOV_PROVISIONAL_V1',
  V: 'NISAR_L2_GCOV_V1',
};

// El sufijo de la vista rapida NO es uniforme: BETA publica `<granulo>.png` y
// PROVISIONAL/V1 publican `<granulo>_LATLON.png`. Comprobado sobre las 1.423
// adquisiciones de la cosecha: el reparto es exacto por coleccion. Sin esto, la
// ficha ofreceria un enlace roto en 1.173 de los 1.423 casos.
const NISAR_BROWSE_SUFFIX: Record<string, string> = {
  B: '.png',
  P: '_LATLON.png',
  V: '_LATLON.png',
};

const NISAR_MADUREZ: Record<string, string> = {
  B: 'BETA — producto preliminar, no apto para conclusiones cientificas',
  P: 'PROVISIONAL — calidad en validacion, revisable',
  V: 'VALIDADO — version 1 liberada',
};

/**
 * Las capas sar_* guardan claves cortas y NO guardan las URL de descarga: son
 * deterministas a partir del nombre del granulo, y almacenarlas triplicaba el
 * peso del archivo. Aqui se reconstruyen y se traduce el resto a texto legible.
 *
 * Lo que la ficha dice es que la escena EXISTE y donde pedirla. No describe el
 * contenido de la imagen, porque el catalogo no lo contiene.
 */
export function describeSarFeature(
  layerId: string,
  props: Record<string, any> | null | undefined
): { name: string; description: string } | null {
  if (!props) return null;

  // --- Rejilla -------------------------------------------------------------
  if (layerId.startsWith('sar_coverage') || layerId === 'sar_nisar_coverage') {
    const n = Number(props.n) || 0;
    const partes: string[] = [];
    if (props.nisar) partes.push(`NISAR ${props.nisar} (ultima ${props.nisar_l})`);
    if (props.s1) partes.push(`Sentinel-1 ${props.s1} (ultima ${props.s1_l})`);
    if (props.alos) partes.push(`ALOS PALSAR ${props.alos} (ultima ${props.alos_l})`);
    const sinNisar = !props.nisar
      ? ' NISAR todavia no ha adquirido nada sobre esta celda.'
      : '';
    const edad = Number(props.age);
    const vigencia = Number.isFinite(edad)
      ? edad < 0.25
        ? 'La ultima pasada es de hace menos de tres meses.'
        : `Han pasado ${edad.toFixed(1)} anos desde la ultima pasada.`
      : '';
    return {
      name: `Celda de ~22 km · ${n} pasadas de radar`,
      description:
        `${n} adquisiciones acumuladas de ` +
        `${props.mis === 3 ? 'las 3 misiones cosechadas' : `${props.mis} de las 3 misiones cosechadas`}: ` +
        `${partes.join(' · ')}. Ultima pasada: ${props.last}. ${vigencia}${sinNisar} ` +
        `Una pasada se cuenta cuando el centro de la celda cae dentro de la huella de la escena. ` +
        `Solo entran NISAR GCOV, Sentinel-1 GRD de alta resolucion y ALOS PALSAR L1.5: ` +
        `otros radares (RADARSAT, TerraSAR-X, COSMO-SkyMed, SAOCOM, ICEYE) no son consultables ` +
        `sin credenciales y no estan contados, asi que esto es una cota inferior.`,
    };
  }

  // --- NISAR ---------------------------------------------------------------
  if (layerId === 'sar_nisar_passes') {
    const g = String(props.g || '');
    const col = NISAR_COLLECTION[props.col] || '';
    const base = 'https://nisar.asf.earthdatacloud.nasa.gov';
    const rumbo = props.dir === 'ASC' ? 'ascendente' : 'descendente';
    const bw = props.bw ? `${props.bw} MHz` : 'sin declarar';
    return {
      name: `NISAR · ${props.t} · traza ${props.path} marco ${props.frame}`,
      description:
        `Adquisicion de NISAR en banda L (instrumento L-SAR de NASA/JPL). ` +
        `Orbita ${rumbo}, traza ${props.path}, marco ${props.frame}, orbita absoluta ${props.orb}. ` +
        `Polarizacion ${props.pol || 'sin declarar'}, ancho de banda en rango ${bw}. ` +
        `Cobertura del marco: ${props.cov === 'F' ? 'completa' : 'parcial'}. ` +
        (props.joint
          ? `Observacion conjunta: en esta pasada tambien adquirio el S-SAR de ISRO. `
          : '') +
        `Madurez del producto: ${NISAR_MADUREZ[props.col] || 'sin declarar'}. ` +
        `Granulo ${g}. ` +
        (col
          ? `Descarga directa (.h5, requiere cuenta Earthdata): ${base}/NISAR/${col}/${g}/${g}.h5 · ` +
            `Vista rapida: ${base}/BROWSE/${col}/${g}/${g}` +
            `${NISAR_BROWSE_SUFFIX[props.col] ?? '_LATLON.png'} · `
          : '') +
        `Buscar la pila completa de esta traza en Vertex: ` +
        `https://search.asf.alaska.edu/#/?searchType=List%20Search&searchList=${g}`,
    };
  }

  // --- Sentinel-1 ----------------------------------------------------------
  if (layerId === 'sar_sentinel1_passes') {
    const g = String(props.g || '');
    const seg = g.length > 2 ? `S${g.charAt(2)}` : '';
    const modo =
      props.mode === 'IW'
        ? 'IW, franja interferometrica ancha (250 km, 5x20 m)'
        : props.mode === 'EW'
        ? 'EW, barrido extra ancho (400 km, 20x40 m) — el modo de hielo marino'
        : `${props.mode || 'sin declarar'}, modo de franja`;
    return {
      name: `${props.sat} · ${props.t} · traza ${props.path}`,
      description:
        `Escena GRD de alta resolucion de ${props.sat} (Copernicus Sentinel-1, banda C). ` +
        `Modo ${modo}. Polarizacion ${props.pol}. ` +
        `Orbita ${props.dir === 'ASC' ? 'ascendente' : 'descendente'}, traza ${props.path}, ` +
        `orbita absoluta ${props.orb}. Granulo ${g}. ` +
        (seg
          ? `Descarga (.zip, requiere cuenta Earthdata): https://datapool.asf.alaska.edu/GRD_HD/${seg}/${g}.zip · `
          : '') +
        `Ficha en Vertex: https://search.asf.alaska.edu/#/?searchType=List%20Search&searchList=${g}`,
    };
  }

  // --- RCM -----------------------------------------------------------------
  if (layerId === 'sar_rcm_open_scene') {
    return {
      name: `RCM-3 · ${props.t} · polarimetria compacta`,
      description:
        `Unica escena de la RADARSAT Constellation Mission sobre la Antartida publicada en abierto ` +
        `por la Agencia Espacial Canadiense. Satelite ${props.sat}, modo ${props.mode}, ` +
        `polarizacion ${props.pol}, incidencia ${props.inc}, huella ${props.size}, orbita descendente. ` +
        `Disponible en tres niveles (${props.prod}) sin registro: ${props.url} · ` +
        `Vista rapida: ${props.br} · ` +
        `La polarimetria compacta transmite en circular y recibe en dos lineales: con una sola ` +
        `polarizacion transmitida recoge casi la informacion de un sistema de doble polarizacion, ` +
        `a cambio de la mitad del ancho de banda. El resto del archivo de RCM exige cuenta en EODMS.`,
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Catalogo de fuentes y formacion
// ---------------------------------------------------------------------------
// Distingue tres cosas que se confunden con facilidad: el dato que ESTA en el
// mapa, el portal desde el que se pide mas dato, y el material para aprender a
// usarlo. Solo lo primero es una capa.
export type SarSourceRole = 'DATO_INTEGRADO' | 'PORTAL_DE_ACCESO' | 'FORMACION';

export interface SarSource {
  id: string;
  agency: string;
  title: string;
  url: string;
  role: SarSourceRole;
  /** Que aporta, y que NO: la frase que evita que el enlace se lea como mas de lo que es. */
  note: string;
  /** Ids de capas de este mapa que salen de esta fuente. */
  layers?: string[];
  language?: string;
}

export const SAR_SOURCE_CATALOG: SarSource[] = [
  // --- NASA ---------------------------------------------------------------
  {
    id: 'asf_vertex',
    agency: 'NASA · Alaska Satellite Facility (ASF DAAC)',
    title: 'ASF Data Search (Vertex)',
    url: 'https://search.asf.alaska.edu/',
    role: 'DATO_INTEGRADO',
    note:
      'Archivo NASA de datos SAR y origen de las tres capas de huellas y de la rejilla. ' +
      'Su API publico (api.daac.asf.alaska.edu) devuelve metadatos sin credenciales; ' +
      'descargar las escenas si exige una cuenta Earthdata, gratuita.',
    layers: ['sar_coverage_grid', 'sar_coverage_recency', 'sar_nisar_coverage',
      'sar_nisar_passes', 'sar_sentinel1_passes'],
  },
  {
    id: 'earthdata_search',
    agency: 'NASA EOSDIS',
    title: 'NASA Earthdata Search',
    url: 'https://search.earthdata.nasa.gov/search',
    role: 'PORTAL_DE_ACCESO',
    note:
      'Buscador transversal de todo el acervo de ciencias de la Tierra de la NASA, no solo SAR. ' +
      'Es la via para cruzar estas huellas con productos de hielo, temperatura o nubes.',
  },
  {
    id: 'nisar_user_guide',
    agency: 'NASA · ASF',
    title: 'NISAR Data User Guide',
    url: 'https://nisar-docs.asf.alaska.edu/',
    role: 'FORMACION',
    note:
      'Documentacion de referencia de los productos NISAR: que es un RSLC, un GSLC y un GCOV, ' +
      'y como se leen. Necesaria para pasar de la huella del mapa al dato.',
    layers: ['sar_nisar_passes', 'sar_nisar_coverage'],
  },
  {
    id: 'intro_remote_sensing',
    agency: 'NASA Earthdata',
    title: 'Introduccion a la teledeteccion',
    url: 'https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/remote-sensing',
    role: 'FORMACION',
    note: 'Fundamentos: tipos de resolucion, caracteristicas del instrumento, niveles de procesado.',
    language: 'en',
  },
  {
    id: 'intro_sar',
    agency: 'NASA Earthdata',
    title: 'Introduccion al radar de apertura sintetica (SAR)',
    url: 'https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar',
    role: 'FORMACION',
    note:
      'Por que la banda L de NISAR y ALOS penetra donde la banda C de Sentinel-1 no, y que ' +
      'significan HH, HV y VV. Es lo que hace legibles los colores de estas capas.',
    language: 'en',
  },
  {
    id: 'arset',
    agency: 'NASA Applied Sciences · ARSET',
    title: 'Formaciones ARSET',
    url: 'https://appliedsciences.nasa.gov/get-involved/training',
    role: 'FORMACION',
    note:
      'Cursos en linea, gratuitos, de teledeteccion, SAR y NISAR. Hay material introductorio ' +
      'EN ESPANOL, lo que lo hace la puerta de entrada mas util de esta lista.',
    language: 'es/en',
  },
  {
    id: 'nisar_storymaps',
    agency: 'NASA JPL',
    title: 'NISAR StoryMaps',
    url: 'https://nisar.jpl.nasa.gov/applications/arcgis-storymaps/',
    role: 'FORMACION',
    note:
      'Casos aplicados de SAR a inundaciones, incendios, subsidencia, vertidos y movimiento glaciar. ' +
      'El de movimiento glaciar es el analogo directo de lo que permitiria la banda L sobre esta zona.',
    language: 'en',
  },
  {
    id: 'nisar_whitepapers',
    agency: 'NASA JPL',
    title: 'NISAR Applications White Papers',
    url: 'https://nisar.jpl.nasa.gov/applications/societal-benefit/',
    role: 'FORMACION',
    note: 'Resumenes de dos paginas por aplicacion, utiles para justificar un uso concreto del dato.',
    language: 'en',
  },
  {
    id: 'uavsar_postcards',
    agency: 'NASA JPL',
    title: 'UAVSAR Postcards',
    url: 'https://uavsar.jpl.nasa.gov/education/postcards.html',
    role: 'FORMACION',
    note:
      'Composiciones en falso color de SAR aerotransportado. Ensenan a leer un compuesto ' +
      'polarimetrico antes de intentarlo con una escena propia.',
    language: 'en',
  },

  // --- CSA ----------------------------------------------------------------
  {
    id: 'csa_rcm',
    agency: 'Agencia Espacial Canadiense (ASC-CSA)',
    title: 'RADARSAT Constellation Mission (RCM) — datos',
    url: 'https://donnees-data.asc-csa.gc.ca/en/dataset/rcm',
    role: 'DATO_INTEGRADO',
    note:
      'Constelacion de tres satelites en banda C para vigilancia maritima (hielo, viento de ' +
      'superficie, vertidos, buques), gestion de desastres y seguimiento de ecosistemas. De su ' +
      'carpeta abierta sale la unica escena antartica de este mapa; el archivo completo esta en ' +
      'EODMS y exige cuenta. Open Government Licence - Canada.',
    layers: ['sar_rcm_open_scene'],
  },
  {
    id: 'csa_radarsat1',
    agency: 'Agencia Espacial Canadiense (ASC-CSA)',
    title: 'Archivo RADARSAT-1',
    url: 'https://donnees-data.asc-csa.gc.ca/en/dataset/radarsat1',
    role: 'PORTAL_DE_ACCESO',
    note:
      'Archivo completo 1995-2013 liberado con licencia abierta, alojado en EODMS y en AWS Open ' +
      'Data. Incluye las dos campanas antarticas de RADARSAT-1 (AMM-1 en 1997 y MAMM en 2000), ' +
      'los primeros mosaicos de radar del continente entero. NO esta en el ASF Search API, asi que ' +
      'no entra en la rejilla de cobertura de este mapa: integrarlo exige pasar por EODMS o por S3.',
  },
  {
    id: 'csa_sar_tutorial',
    agency: 'Agencia Espacial Canadiense (ASC-CSA)',
    title: 'Tutorial de SAR en Python',
    url: 'https://github.com/asc-csa/Synthetic_Aperture_Radar_Tutorial',
    role: 'FORMACION',
    note:
      'Pasos practicos para abrir, calibrar y visualizar imagenes SAR con Python y QGIS. ' +
      'Es el camino mas corto desde una huella de este mapa hasta una imagen propia.',
    language: 'en/fr',
  },

  // --- CONAE --------------------------------------------------------------
  {
    id: 'conae_saocom',
    agency: 'CONAE (Argentina)',
    title: 'Catalogo SAOCOM',
    url: 'https://catalogos.conae.gov.ar/catalogo/catalogoSatSaocomInfo.html',
    role: 'PORTAL_DE_ACCESO',
    note:
      'SAOCOM 1A y 1B son los unicos SAR en banda L de la region, operados desde Cordoba, y la ' +
      'referencia latinoamericana mas cercana a lo que hace NISAR. El catalogo exige registro ' +
      '"ONE CLICK" y no expone un API publico, asi que SAOCOM no esta contado en la rejilla de ' +
      'cobertura: las celdas "sin pasadas" pueden tener escenas de SAOCOM que este mapa no ve.',
    language: 'es',
  },
  {
    id: 'conae_registro',
    agency: 'CONAE (Argentina)',
    title: 'Registro de acceso al catalogo SAOCOM',
    url: 'https://www.argentina.gob.ar/noticias/la-informacion-saocom-cada-vez-mas-accesible',
    role: 'PORTAL_DE_ACCESO',
    note: 'Protocolo de alta del perfil ONE CLICK, requisito para descargar escenas SAOCOM.',
    language: 'es',
  },
];

/** Lo que el mapa integra de verdad, para la ficha de procedencia. */
export const SAR_PROVENANCE = {
  harvestedAt: '2026-11-14',
  api: 'https://api.daac.asf.alaska.edu/services/search/param',
  box: { west: -70, south: -68, east: -55, north: -54 },
  missions: [
    { id: 'nisar', label: 'NISAR (NASA/ISRO)', band: 'L', product: 'L2 GCOV',
      scenes: 1423, from: '2025-10-18', to: '2026-11-05', attribution: ATTR_NISAR },
    { id: 's1', label: 'Sentinel-1 (ESA/Copernicus)', band: 'C', product: 'GRD alta resolucion',
      scenes: 3212, from: '2014-11-01', to: '2026-11-11', attribution: ATTR_S1 },
    { id: 'alos', label: 'ALOS PALSAR (JAXA/METI)', band: 'L', product: 'L1.5',
      scenes: 10565, from: '2006-05-17', to: '2011-04-20', attribution: ATTR_ALOS },
    { id: 'rcm', label: 'RCM-3 (CSA)', band: 'C', product: 'GRD/SLC/MLC compacto',
      scenes: 1, from: '2020-01-24', to: '2020-01-24', attribution: ATTR_RCM },
  ],
  notCounted: ['RADARSAT-1', 'RADARSAT-2', 'RCM (archivo EODMS)', 'TerraSAR-X',
    'COSMO-SkyMed', 'SAOCOM', 'ICEYE'],
};
