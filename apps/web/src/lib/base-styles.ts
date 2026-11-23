/**
 * AMOH V10 — Base Styles (Base cartográfica, NO capas temáticas)
 * 
 * Fuentes:
 *  - Swisstopo (QGIS Hub d46eec54) — style.json completo
 *  - OpenStreetMap Shortbread (QGIS Hub f0ee0620) — MVT raw
 *  - NASA GIBS Blue Marble — satélite global
 *  - Quantarctica — base antártica
 * 
 * NOTA: Estos son ESTILOS BASE, no capas temáticas.
 * Se seleccionan con el switch MAP/GLOBE/SAT, no con toggles.
 */

import type * as maplibregl from 'maplibre-gl';

export interface BaseStyle {
  id: string;
  name: string;
  name_es: string;
  description: string;
  description_es: string;
  type: 'style_url' | 'tiles_mvt' | 'tiles_raster';
  url: string;
  attribution: string;
  sdg?: number;
  minZoom?: number;
  maxZoom?: number;
  default_for?: 'MAP' | 'GLOBE' | 'SAT';
}

export const BASE_STYLES: Record<string, BaseStyle> = {
  // ═══════════════════════════════════════════════════
  // 1. SWISSTOPO LIGHT — Style completo MapLibre
  //    Fuente: QGIS Hub d46eec54
  //    Estilo: minimalist, worldwide, Apple-like
  // ═══════════════════════════════════════════════════
  swisstopo_light: {
    id: 'swisstopo_light',
    name: 'Swisstopo Light',
    name_es: 'Swisstopo Claro',
    description: 'Worldwide minimalist base map from Swiss Federal Office of Topography',
    description_es: 'Base cartográfica mundial minimalista del Instituto Federal Suizo',
    type: 'style_url',
    url: 'https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte.vt/style.json',
    attribution: '© Swisstopo / Bundesamt für Landestopografie',
    sdg: 9,
    minZoom: 0,
    maxZoom: 18,
    default_for: 'MAP',
  },

  // ═══════════════════════════════════════════════════
  // 2. OSM SHORTBREAD — Vector tiles minimalistas
  //    Fuente: QGIS Hub f0ee0620
  //    Shortbread v1 = estilo limpio de OpenStreetMap
  // ═══════════════════════════════════════════════════
  osm_shortbread: {
    id: 'osm_shortbread',
    name: 'OpenStreetMap Shortbread',
    name_es: 'OpenStreetMap Shortbread',
    description: 'Clean vector tiles from OpenStreetMap Shortbread schema',
    description_es: 'Vector tiles limpios del esquema Shortbread de OpenStreetMap',
    type: 'tiles_mvt',
    url: 'https://vector.openstreetmap.org/shortbread_v1/{z}/{x}/{y}.mvt',
    attribution: '© OpenStreetMap contributors',
    sdg: 11,
    minZoom: 0,
    maxZoom: 14,
  },

  // ═══════════════════════════════════════════════════
  // 3. NASA BLUE MARBLE — Satélite global (ya existente)
  // ═══════════════════════════════════════════════════
  nasa_blue_marble: {
    id: 'nasa_blue_marble',
    name: 'NASA Blue Marble',
    name_es: 'NASA Blue Marble',
    description: 'NASA Blue Marble Shaded Relief with Bathymetry',
    description_es: 'NASA Blue Marble con Relieve Sombreado y Batimetría',
    type: 'tiles_raster',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/BlueMarble_ShadedRelief_Bathymetry/default/500m/{z}/{y}/{x}.jpeg',
    attribution: '© NASA GIBS',
    sdg: 13,
    minZoom: 0,
    maxZoom: 8,
    default_for: 'GLOBE',
  },

  // ═══════════════════════════════════════════════════
  // 4. QUANTARCTICA — Base antártica alta resolución
  //    Fuente: data\quantarctica\
  // ═══════════════════════════════════════════════════
  quantarctica: {
    id: 'quantarctica',
    name: 'Quantarctica',
    name_es: 'Quantarctica',
    description: 'Antarctic base map from Norwegian Polar Institute',
    description_es: 'Base cartográfica antártica del Instituto Polar Noruego',
    type: 'tiles_raster',
    url: '/data/tiles/quantarctica/{z}/{x}/{y}.png',
    attribution: '© Quantarctica / Norwegian Polar Institute',
    sdg: 13,
    minZoom: 0,
    maxZoom: 14,
  },

  // ═══════════════════════════════════════════════════
  // 5. NASA VIIRS TrueColor — Satélite diario (EPSG:4326)
  // ═══════════════════════════════════════════════════
  nasa_viirs_truecolor: {
    id: 'nasa_viirs_truecolor',
    name: 'NASA VIIRS TrueColor',
    name_es: 'NASA VIIRS Color Real',
    description: 'Daily satellite imagery with polar coverage',
    description_es: 'Imágenes satelitales diarias con cobertura polar',
    type: 'tiles_raster',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/{date}/250m/{z}/{y}/{x}.jpg',
    attribution: '© NASA GIBS / VIIRS SNPP',
    sdg: 13,
    minZoom: 0,
    maxZoom: 8,
    default_for: 'SAT',
  },

  // ═══════════════════════════════════════════════════
  // 6. NATGEO MAPMAKER — World Ocean Base
  //    Basemap del webmap "Ocean Currents" de National Geographic
  //    (education.nationalgeographic.org/resource/mapmaker-ocean-currents)
  //    Procedencia completa: src/lib/natgeo-mapmaker-layers.ts
  // ═══════════════════════════════════════════════════
  natgeo_world_ocean_base: {
    id: 'natgeo_world_ocean_base',
    name: 'World Ocean Base (NatGeo MapMaker)',
    name_es: 'Base Oceánica Mundial (NatGeo MapMaker)',
    description: 'Bathymetric ocean base map used by the National Geographic MapMaker "Ocean Currents" web map',
    description_es: 'Base batimétrica oceánica que usa el webmap "Ocean Currents" de National Geographic MapMaker',
    type: 'tiles_raster',
    url: 'https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri, Garmin, GEBCO, NOAA NGDC, and other contributors — vía NatGeo MapMaker',
    sdg: 14,
    minZoom: 0,
    maxZoom: 16,
  },

  // ═══════════════════════════════════════════════════
  // 7. NATGEO MAPMAKER — World Imagery
  //    Basemap del webmap "Ocean Currents in Motion"
  // ═══════════════════════════════════════════════════
  natgeo_world_imagery: {
    id: 'natgeo_world_imagery',
    name: 'World Imagery (NatGeo MapMaker)',
    name_es: 'Imágenes Mundiales (NatGeo MapMaker)',
    description: 'Satellite imagery base map used by the National Geographic MapMaker "Ocean Currents in Motion" web map',
    description_es: 'Base de imágenes satelitales que usa el webmap "Ocean Currents in Motion" de National Geographic MapMaker',
    type: 'tiles_raster',
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community — vía NatGeo MapMaker',
    sdg: 13,
    minZoom: 0,
    maxZoom: 19,
  },
};

// ═══════════════════════════════════════════════════
// Helper: Aplicar un base style a MapLibre
// ═══════════════════════════════════════════════════
export function applyBaseStyle(map: maplibregl.Map, styleId: string) {
  const style = BASE_STYLES[styleId];
  if (!style) {
    console.warn(`[BaseStyles] Style not found: ${styleId}`);
    return;
  }

  if (style.type === 'style_url') {
    // Swisstopo: style.json completo, MapLibre lo maneja nativamente
    map.setStyle(style.url);
  } else {
    // Tiles raster/MVT: aplicar como source + layer
    const sourceId = `base_${style.id}`;
    
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }

    if (style.type === 'tiles_mvt') {
      map.addSource(sourceId, {
        type: 'vector',
        tiles: [style.url.replace('{date}', '')],
        minzoom: style.minZoom,
        maxzoom: style.maxZoom,
        attribution: style.attribution,
      });
      // MVT requiere layers específicos (roads, water, landuse, etc.)
      // -- se añaden en un helper separado según el esquema Shortbread
    } else {
      // Raster
      const tiles = style.url.includes('{date}')
        ? style.url.replace('{date}', new Date(Date.now() - 86400000).toISOString().split('T')[0])
        : style.url;

      map.addSource(sourceId, {
        type: 'raster',
        tiles: [tiles],
        tileSize: 256,
        minzoom: style.minZoom,
        maxzoom: style.maxZoom,
        attribution: style.attribution,
      });
      
      map.addLayer({
        id: `${sourceId}_layer`,
        type: 'raster',
        source: sourceId,
        paint: { 'raster-opacity': 1 },
      }, findFirstSymbolLayer(map));
    }
  }
}

// Helper: insertar base raster debajo de todas las capas temáticas
function findFirstSymbolLayer(map: maplibregl.Map): string | undefined {
  const layers = map.getStyle()?.layers || [];
  for (const layer of layers) {
    if (layer.type === 'symbol') return layer.id;
  }
  return undefined;
}

// ═══════════════════════════════════════════════════
// Orden de preferencia para el switch MAP/GLOBE/SAT
// ═══════════════════════════════════════════════════
export const BASE_STYLE_ORDER = [
  'swisstopo_light',          // MAP — Apple-like mundial
  'osm_shortbread',           // MAP alt — OSM
  'quantarctica',             // MAP — Antártica específica
  'natgeo_world_ocean_base',  // MAP — batimetría oceánica (NatGeo MapMaker)
  'nasa_blue_marble',         // GLOBE — Global
  'nasa_viirs_truecolor',     // SAT — Diario
  'natgeo_world_imagery',     // SAT alt — Esri World Imagery (NatGeo MapMaker)
];
