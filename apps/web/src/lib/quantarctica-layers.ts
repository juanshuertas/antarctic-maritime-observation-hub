/**
 * AMOH V10 — Quantarctica High-Resolution Scientific Datasets Integration
 * Connects Norwegian Polar Institute Quantarctica datasets, IBCSO v2 bathymetry,
 * MEaSUREs ice velocities, SCAR ADD coastlines, and COMNAP research stations.
 */

import type { FeatureCollection } from 'geojson';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { getLayerSDGColor } from './sdg-registry';

export interface QuantarcticaLayerDef {
  id: string;
  backendName: string;
  title: string;
  theme: 'Basemap' | 'Bathymetry' | 'Glaciology' | 'Protection' | 'Operations' | 'Governance' | 'Biology' | 'Oceanography' | 'SeaIce' | 'SocialScience';
  sdg: number;
  description: string;
  geometryType: 'LineString' | 'Polygon' | 'Point';
  sourceInstitution: string;
  defaultVisible?: boolean;
}

export const QUANTARCTICA_SCIENTIFIC_LAYERS: QuantarcticaLayerDef[] = [
  {
    id: 'quantarctica_bathymetry',
    backendName: 'bathymetry_contours',
    title: 'Batimetría IBCSO v2 (Isobates SCAR/GEBCO)',
    theme: 'Bathymetry',
    sdg: 14,
    description: 'Contornos de profundidad oceánica (-500m a -4000m) en el Océano Austral y estrechos antárticos.',
    geometryType: 'LineString',
    sourceInstitution: 'IBCSO v2 / SCAR / Alfred Wegener Institute (AWI)',
    defaultVisible: false,
  },
  {
    id: 'quantarctica_glaciers',
    backendName: 'glacier_velocity',
    title: 'Velocidad de Flujo Glaciar (MEaSUREs / REMA)',
    theme: 'Glaciology',
    sdg: 13,
    description: 'Vectores y velocidades de drenaje de las principales corrientes de hielo (Pine Island, Thwaites, Totten, Lambert).',
    geometryType: 'LineString',
    sourceInstitution: 'NASA MEaSUREs InSAR / Polar Geospatial Center (REMA)',
    defaultVisible: false,
  },
  {
    id: 'quantarctica_stations',
    backendName: 'stations',
    title: 'Bases Científicas Antárticas (COMNAP)',
    theme: 'Operations',
    sdg: 9,
    description: 'Estaciones de investigación científica permanentes y de verano operadas por naciones firmantes del Tratado Antártico.',
    geometryType: 'Point',
    sourceInstitution: 'Council of Managers of National Antarctic Programs (COMNAP)',
    defaultVisible: false,
  },
  {
    id: 'quantarctica_shelves',
    backendName: 'ice_shelves',
    title: 'Plataformas de Hielo (SCAR ADD / REMA)',
    theme: 'Glaciology',
    sdg: 13,
    description: 'Líneas de apoyo y plataformas de hielo flotantes (Ross, Ronne-Filchner, Amery, Larsen C).',
    geometryType: 'Polygon',
    sourceInstitution: 'SCAR Antarctic Digital Database / British Antarctic Survey',
    defaultVisible: false,
  },
  {
    id: 'quantarctica_coastline',
    backendName: 'coastline',
    title: 'Línea de Costa Antártica (SCAR ADD)',
    theme: 'Basemap',
    sdg: 14,
    description: 'Línea de costa y plataforma continental de alta precisión circumpolar.',
    geometryType: 'Polygon',
    sourceInstitution: 'SCAR Antarctic Digital Database',
    defaultVisible: false,
  },
  {
    id: 'quantarctica_aspa',
    backendName: 'aspa',
    title: 'Áreas Especialmente Protegidas (ASPA)',
    theme: 'Protection',
    sdg: 15,
    description: 'Zonas antárticas de alto valor científico y ecológico con acceso restringido bajo el Protocolo de Madrid.',
    geometryType: 'Polygon',
    sourceInstitution: 'Secretaría del Tratado Antártico (ATS) / CEP',
    defaultVisible: false,
  },
  {
    id: 'quantarctica_asma',
    backendName: 'asma',
    title: 'Zonas Antárticas Especialmente Administradas (ASMA)',
    theme: 'Protection',
    sdg: 15,
    description: 'Zonas con actividades coordinadas entre programas nacionales (p. ej. Isla Decepción, Estación McMurdo).',
    geometryType: 'Polygon',
    sourceInstitution: 'Secretaría del Tratado Antártico (ATS)',
    defaultVisible: false,
  },
  {
    id: 'quantarctica_ccamlr',
    backendName: 'ccamlr_zones',
    title: 'Zonas de Gestión Marina CCAMLR',
    theme: 'Governance',
    sdg: 14,
    description: 'Subáreas y divisiones estadísticas para la conservación y pesca regulada en el Océano Austral.',
    geometryType: 'Polygon',
    sourceInstitution: 'Comisión para la Conservación de los Recursos Vivos Marinos Antárticos',
    defaultVisible: false,
  },
  {
    id: 'emperor_penguin_colonies',
    backendName: 'emperor_penguin_colonies',
    title: 'Colonias de Pingüinos Emperador (Vía Satélite)',
    theme: 'Biology',
    sdg: 14,
    description: 'Ubicación precisa de colonias reproductivas detectadas mediante firmas espectrales de guano en Sentinel-2 y Landsat.',
    geometryType: 'Point',
    sourceInstitution: 'British Antarctic Survey (BAS) / Quantarctica',
    defaultVisible: false,
  },
  {
    id: 'important_bird_areas',
    backendName: 'important_bird_areas',
    title: 'Áreas Importantes para las Aves (IBA)',
    theme: 'Biology',
    sdg: 15,
    description: 'Zonas críticas para la anidación y alimentación de petreles, albatros y pingüinos en la Antártida.',
    geometryType: 'Polygon',
    sourceInstitution: 'BirdLife International / SCAR',
    defaultVisible: false,
  },
  {
    id: 'rock_outcrops',
    backendName: 'rock_outcrops',
    title: 'Afloramientos Rocosos y Relieve (SCAR ADD)',
    theme: 'Basemap',
    sdg: 15,
    description: 'Zonas libres de hielo continental que delinean los picos rocosos, nunataks y cordilleras antárticas.',
    geometryType: 'Polygon',
    sourceInstitution: 'SCAR Antarctic Digital Database',
    defaultVisible: false,
  },
  {
    id: 'ccamlr_mpas',
    backendName: 'ccamlr_mpas',
    title: 'Áreas Marinas Protegidas CCAMLR (AMP Mar de Ross & Orcadas)',
    theme: 'Governance',
    sdg: 14,
    description: 'Límites oficiales de las AMPs circumpolares de CCAMLR donde la pesca está prohibida o sujeta a estricta investigación.',
    geometryType: 'Polygon',
    sourceInstitution: 'CCAMLR',
    defaultVisible: false,
  },
  {
    id: 'historic_stations',
    backendName: 'historic_stations',
    title: 'Sitios y Monumentos Históricos (SMH / Historic Stations)',
    theme: 'SocialScience',
    sdg: 11,
    description: 'Estaciones de la era heroica de exploración antártica (Scott, Shackleton, Amundsen, Charcot).',
    geometryType: 'Point',
    sourceInstitution: 'Antarctic Heritage Trust / ATS',
    defaultVisible: false,
  },
  {
    id: 'treaty_claims',
    backendName: 'treaty_claims',
    title: 'Fronteras y Reclamaciones del Tratado Antártico (Art. IV)',
    theme: 'Governance',
    sdg: 16,
    description: 'Sectores y reclamaciones territoriales históricas suspendidas bajo el Artículo IV del Tratado Antártico.',
    geometryType: 'Polygon',
    sourceInstitution: 'Secretaría del Tratado Antártico / ATS',
    defaultVisible: false,
  },
  {
    id: 'sar_regions',
    backendName: 'sar_regions',
    title: 'Regiones de Búsqueda y Salvamento (SAR Marítimo Austral)',
    theme: 'Operations',
    sdg: 14,
    description: 'Áreas de responsabilidad SAR bajo el Convenio Internacional de Búsqueda y Salvamento Marítimo.',
    geometryType: 'LineString',
    sourceInstitution: 'IMO / ICAO Global SAR Plan',
    defaultVisible: false,
  },
  {
    id: 'southern_ocean_fronts',
    backendName: 'southern_ocean_fronts',
    title: 'Frentes Oceanográficos del Océano Austral (SCAR / Orsi)',
    theme: 'Oceanography',
    sdg: 14,
    description: 'Límites dinámicos de masas de agua: Frente Subtropical (STF), Subantártico (SAF), Polar (PF), Frente Sur de la ACC y Límite Sur.',
    geometryType: 'LineString',
    sourceInstitution: 'SCAR / Orsi et al. / SOOS',
    defaultVisible: false,
  },
  {
    id: 'acbrs',
    backendName: 'acbrs',
    title: 'Regiones Biogeográficas Antárticas (ACBRs v2)',
    theme: 'Protection',
    sdg: 15,
    description: '16 regiones biogeográficas libres de hielo que representan la diversidad ambiental y evolutiva del continente bajo el CEP.',
    geometryType: 'Polygon',
    sourceInstitution: 'SCAR / Terauds et al. / CEP',
    defaultVisible: false,
  },
  {
    id: 'ccamlr_statistical_areas',
    backendName: 'ccamlr_statistical_areas',
    title: 'Áreas Estadísticas de Pesca CCAMLR (48, 58, 88)',
    theme: 'Governance',
    sdg: 14,
    description: 'Subáreas y divisiones estadísticas de gestión y cuotas de pesca de krill y bacalao antártico.',
    geometryType: 'Polygon',
    sourceInstitution: 'CCAMLR Secretariat',
    defaultVisible: false,
  },
  {
    id: 'median_sea_ice_extents',
    backendName: 'median_sea_ice_extents',
    title: 'Extensión Mediana del Hielo Marino (1981–2010)',
    theme: 'SeaIce',
    sdg: 13,
    description: 'Límites medianos mensuales de la banquisa polar antártica basados en 30 años de sensores de microondas satelitales.',
    geometryType: 'LineString',
    sourceInstitution: 'NSIDC / NPI / Quantarctica',
    defaultVisible: false,
  },
  {
    id: 'historic_routes',
    backendName: 'historic_routes',
    title: 'Rutas Históricas de Exploración Polar',
    theme: 'SocialScience',
    sdg: 11,
    description: 'Trazas digitalizadas de las expediciones de Roald Amundsen, Robert F. Scott, Ernest Shackleton y Douglas Mawson.',
    geometryType: 'LineString',
    sourceInstitution: 'American Geographical Society / Quantarctica',
    defaultVisible: false,
  },
];

/**
 * Fetch layer metadata list from the AMOH backend.
 */
type CatalogLayer = { name: string; available: boolean; source_path: string | null; url?: string | null; license?: string };
let catalogRequest: Promise<CatalogLayer[]> | undefined;

async function loadQuantarcticaLayersCatalog(): Promise<CatalogLayer[]> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/quantarctica/quantarctica_catalog.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.layers || [];
  } catch (err) {
    console.warn('[Quantarctica] Static catalog unavailable:', err);
    try {
      const res = await fetch('/api/quantarctica/layers');
      if (res.ok) return (await res.json()).layers || [];
    } catch { /* Backend is optional on GitHub Pages. */ }
    return [];
  }
}

export function fetchQuantarcticaLayersCatalog(): Promise<CatalogLayer[]> {
  return catalogRequest ??= loadQuantarcticaLayersCatalog();
}

/**
 * Fetch a specific Quantarctica GeoJSON dataset from the AMOH backend.
 */
export async function fetchQuantarcticaGeoJson(backendName: string): Promise<FeatureCollection> {
  const catalog = await fetchQuantarcticaLayersCatalog();
  const entry = catalog.find(layer => layer.name === backendName);
  const published = entry?.available && entry.url ? entry : undefined;
  if (published?.url) {
    const res = await fetch(`${import.meta.env.BASE_URL}${published.url}`);
    if (res.ok) {
      const geojson = await res.json();
      if (geojson.type === 'FeatureCollection' && Array.isArray(geojson.features)) return geojson;
    }
  }
  const res = await fetch(`/api/quantarctica/layers/${encodeURIComponent(backendName)}`);
  if (!res.ok) throw new Error(`Quantarctica layer '${backendName}' unavailable (HTTP ${res.status})`);
  const geojson = await res.json();
  if (geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
    throw new Error(`Quantarctica layer '${backendName}' returned invalid GeoJSON`);
  }
  return geojson;
}

/**
 * Mounts Quantarctica layers onto a MapLibre instance.
 */
export async function applyQuantarcticaLayersToMap(
  map: MapLibreMap,
  activeLayerIds: Set<string>
): Promise<void> {
  // 1. IBCSO v2 Bathymetry Contours
  if (activeLayerIds.has('quantarctica_bathymetry') || activeLayerIds.has('bathymetry_contours')) {
    try {
      if (!map.getSource('quantarctica-bathymetry-src')) {
        const geojson = await fetchQuantarcticaGeoJson('bathymetry_contours');
        if (!map.getSource('quantarctica-bathymetry-src')) {
          map.addSource('quantarctica-bathymetry-src', {
            type: 'geojson',
            data: geojson,
          });

          map.addLayer({
            id: 'quantarctica-bathymetry-lines',
            type: 'line',
            source: 'quantarctica-bathymetry-src',
            paint: {
              'line-color': [
                'interpolate',
                ['linear'],
                ['abs', ['get', 'depth_m']],
                500, '#38bdf8',
                1000, '#0284c7',
                2000, '#0369a1',
                3000, '#1d4ed8',
                4000, '#1e3a8a',
              ],
              'line-width': ['interpolate', ['linear'], ['abs', ['get', 'depth_m']], 500, 2.0, 4000, 1.2],
              'line-dasharray': [3, 2],
              'line-opacity': 0.85,
            },
          });

          map.addLayer({
            id: 'quantarctica-bathymetry-labels',
            type: 'symbol',
            source: 'quantarctica-bathymetry-src',
            layout: {
              'symbol-placement': 'line',
              'text-field': ['concat', ['get', 'feature'], ' (', ['get', 'depth_m'], 'm)'],
              'text-size': 10,
              'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
              'text-offset': [0, 0.8],
            },
            paint: {
              'text-color': '#7dd3fc',
              'text-halo-color': '#030712',
              'text-halo-width': 1.5,
            },
          });
        }
      }
      map.setLayoutProperty('quantarctica-bathymetry-lines', 'visibility', 'visible');
      map.setLayoutProperty('quantarctica-bathymetry-labels', 'visibility', 'visible');
    } catch (e) {
      console.warn('[Quantarctica] Failed to load IBCSO bathymetry:', e);
    }
  } else if (map.getLayer('quantarctica-bathymetry-lines')) {
    map.setLayoutProperty('quantarctica-bathymetry-lines', 'visibility', 'none');
    map.setLayoutProperty('quantarctica-bathymetry-labels', 'visibility', 'none');
  }

  // 2. MEaSUREs Ice Velocity Vectors
  if (activeLayerIds.has('quantarctica_glaciers') || activeLayerIds.has('glacier_velocity')) {
    try {
      if (!map.getSource('quantarctica-glaciers-src')) {
        const geojson = await fetchQuantarcticaGeoJson('glacier_velocity');
        if (!map.getSource('quantarctica-glaciers-src')) {
          map.addSource('quantarctica-glaciers-src', {
            type: 'geojson',
            data: geojson,
          });

          map.addLayer({
            id: 'quantarctica-glaciers-glow',
            type: 'line',
            source: 'quantarctica-glaciers-src',
            paint: {
              'line-color': '#4ade80',
              'line-width': 5,
              'line-blur': 3,
              'line-opacity': 0.5,
            },
          });

          map.addLayer({
            id: 'quantarctica-glaciers-lines',
            type: 'line',
            source: 'quantarctica-glaciers-src',
            paint: {
              'line-color': getLayerSDGColor('quantarctica_glaciers'),
              'line-width': 2.8,
              'line-opacity': 0.95,
            },
          });

          map.addLayer({
            id: 'quantarctica-glaciers-labels',
            type: 'symbol',
            source: 'quantarctica-glaciers-src',
            layout: {
              'symbol-placement': 'line',
              'text-field': ['concat', ['get', 'glacier_name'], ' (', ['get', 'velocity_m_yr'], ' m/a)'],
              'text-size': 11,
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-offset': [0, -1],
            },
            paint: {
              'text-color': '#86efac',
              'text-halo-color': '#052e16',
              'text-halo-width': 2,
            },
          });
        }
      }
      map.setLayoutProperty('quantarctica-glaciers-glow', 'visibility', 'visible');
      map.setLayoutProperty('quantarctica-glaciers-lines', 'visibility', 'visible');
      map.setLayoutProperty('quantarctica-glaciers-labels', 'visibility', 'visible');
    } catch (e) {
      console.warn('[Quantarctica] Failed to load MEaSUREs glacier velocity:', e);
    }
  } else if (map.getLayer('quantarctica-glaciers-lines')) {
    map.setLayoutProperty('quantarctica-glaciers-glow', 'visibility', 'none');
    map.setLayoutProperty('quantarctica-glaciers-lines', 'visibility', 'none');
    map.setLayoutProperty('quantarctica-glaciers-labels', 'visibility', 'none');
  }

  // 3. COMNAP Research Stations
  if (activeLayerIds.has('quantarctica_stations') || activeLayerIds.has('stations')) {
    try {
      if (!map.getSource('quantarctica-stations-src')) {
        const geojson = await fetchQuantarcticaGeoJson('stations');
        if (!map.getSource('quantarctica-stations-src')) {
          map.addSource('quantarctica-stations-src', {
            type: 'geojson',
            data: geojson,
          });

          map.addLayer({
            id: 'quantarctica-stations-points',
            type: 'circle',
            source: 'quantarctica-stations-src',
            paint: {
              'circle-radius': 5,
              'circle-color': getLayerSDGColor('quantarctica_stations'),
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 1.5,
              'circle-opacity': 0.95,
            },
          });

          map.addLayer({
            id: 'quantarctica-stations-symbol',
            type: 'symbol',
            source: 'quantarctica-stations-src',
            layout: {
              'icon-image': 'icon-station',
              'icon-size': 0.8,
              'icon-offset': [0, -15],
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
            },
          });

          map.addLayer({
            id: 'quantarctica-stations-labels',
            type: 'symbol',
            source: 'quantarctica-stations-src',
            layout: {
              'text-field': ['coalesce', ['get', 'name_eng'], ['get', 'name_off'], 'Estación'],
              'text-size': 10,
              'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
              'text-offset': [0, 1.4],
              'text-anchor': 'top',
            },
            paint: {
              'text-color': '#fdba74',
              'text-halo-color': '#431407',
              'text-halo-width': 1.5,
            },
          });
        }
      }
      map.setLayoutProperty('quantarctica-stations-points', 'visibility', 'visible');
      if (map.getLayer('quantarctica-stations-symbol')) {
        map.setLayoutProperty('quantarctica-stations-symbol', 'visibility', 'visible');
      }
      map.setLayoutProperty('quantarctica-stations-labels', 'visibility', 'visible');
    } catch (e) {
      console.warn('[Quantarctica] Failed to load COMNAP stations:', e);
    }
  } else if (map.getLayer('quantarctica-stations-points')) {
    map.setLayoutProperty('quantarctica-stations-points', 'visibility', 'none');
    if (map.getLayer('quantarctica-stations-symbol')) {
      map.setLayoutProperty('quantarctica-stations-symbol', 'visibility', 'none');
    }
    if (map.getLayer('quantarctica-stations-labels')) {
      map.setLayoutProperty('quantarctica-stations-labels', 'visibility', 'none');
    }
  }

  // 4. ASPA Protected Areas
  if (activeLayerIds.has('quantarctica_aspa') || activeLayerIds.has('aspa')) {
    try {
      if (!map.getSource('quantarctica-aspa-src')) {
        const geojson = await fetchQuantarcticaGeoJson('aspa');
        if (!map.getSource('quantarctica-aspa-src')) {
          map.addSource('quantarctica-aspa-src', {
            type: 'geojson',
            data: geojson,
          });

          map.addLayer({
            id: 'quantarctica-aspa-fill',
            type: 'fill',
            source: 'quantarctica-aspa-src',
            paint: {
              'fill-color': getLayerSDGColor('quantarctica_aspa'),
              'fill-opacity': 0.25,
            },
          });

          map.addLayer({
            id: 'quantarctica-aspa-line',
            type: 'line',
            source: 'quantarctica-aspa-src',
            paint: {
              'line-color': getLayerSDGColor('quantarctica_aspa'),
              'line-width': 1.8,
              'line-dasharray': [2, 2],
            },
          });

          map.addLayer({
            id: 'quantarctica-aspa-labels',
            type: 'symbol',
            source: 'quantarctica-aspa-src',
            layout: {
              'text-field': ['coalesce', ['get', 'NAME'], ['get', 'name'], 'ASPA'],
              'text-size': 9,
              'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
            },
            paint: {
              'text-color': '#bbf7d0',
              'text-halo-color': '#14532d',
              'text-halo-width': 1.5,
            },
          });
        }
      }
      map.setLayoutProperty('quantarctica-aspa-fill', 'visibility', 'visible');
      map.setLayoutProperty('quantarctica-aspa-line', 'visibility', 'visible');
      map.setLayoutProperty('quantarctica-aspa-labels', 'visibility', 'visible');
    } catch (e) {
      console.warn('[Quantarctica] Failed to load ASPA protected areas:', e);
    }
  } else if (map.getLayer('quantarctica-aspa-fill')) {
    map.setLayoutProperty('quantarctica-aspa-fill', 'visibility', 'none');
    map.setLayoutProperty('quantarctica-aspa-line', 'visibility', 'none');
    map.setLayoutProperty('quantarctica-aspa-labels', 'visibility', 'none');
  }

  // 5. Emperor Penguin Colonies (BAS / Satellite detection)
  if (activeLayerIds.has('emperor_penguin_colonies')) {
    try {
      if (!map.getSource('quantarctica-emperors-src')) {
        const geojson = await fetchQuantarcticaGeoJson('emperor_penguin_colonies');
        if (!map.getSource('quantarctica-emperors-src')) {
          map.addSource('quantarctica-emperors-src', {
            type: 'geojson',
            data: geojson,
          });

          map.addLayer({
            id: 'quantarctica-emperors-glow',
            type: 'circle',
            source: 'quantarctica-emperors-src',
            paint: {
              'circle-radius': 12,
              'circle-color': '#f59e0b',
              'circle-opacity': 0.35,
              'circle-blur': 0.8,
            },
          });

          map.addLayer({
            id: 'quantarctica-emperors-points',
            type: 'circle',
            source: 'quantarctica-emperors-src',
            paint: {
              'circle-radius': 5,
              'circle-color': '#fbbf24',
              'circle-stroke-width': 1.5,
              'circle-stroke-color': '#ffffff',
            },
          });

          map.addLayer({
            id: 'quantarctica-emperors-labels',
            type: 'symbol',
            source: 'quantarctica-emperors-src',
            layout: {
              'text-field': ['coalesce', ['get', 'name'], ['get', 'Colony'], 'Colonia'],
              'text-size': 10,
              'text-font': ['Open Sans Semibold'],
              'text-offset': [0, 1.2],
              'text-anchor': 'top',
            },
            paint: {
              'text-color': '#fef08a',
              'text-halo-color': '#1e293b',
              'text-halo-width': 2,
            },
          });
        }
      }
      map.setLayoutProperty('quantarctica-emperors-glow', 'visibility', 'visible');
      map.setLayoutProperty('quantarctica-emperors-points', 'visibility', 'visible');
      map.setLayoutProperty('quantarctica-emperors-labels', 'visibility', 'visible');
    } catch (e) {
      console.warn('[Quantarctica] Failed to load Emperor Penguin colonies:', e);
    }
  } else if (map.getLayer('quantarctica-emperors-points')) {
    map.setLayoutProperty('quantarctica-emperors-glow', 'visibility', 'none');
    map.setLayoutProperty('quantarctica-emperors-points', 'visibility', 'none');
    map.setLayoutProperty('quantarctica-emperors-labels', 'visibility', 'none');
  }

  // 6. Important Bird Areas (IBAs)
  if (activeLayerIds.has('important_bird_areas')) {
    try {
      if (!map.getSource('quantarctica-iba-src')) {
        const geojson = await fetchQuantarcticaGeoJson('important_bird_areas');
        if (!map.getSource('quantarctica-iba-src')) {
          map.addSource('quantarctica-iba-src', {
            type: 'geojson',
            data: geojson,
          });

          map.addLayer({
            id: 'quantarctica-iba-fill',
            type: 'fill',
            source: 'quantarctica-iba-src',
            paint: {
              'fill-color': '#10b981',
              'fill-opacity': 0.2,
            },
          });

          map.addLayer({
            id: 'quantarctica-iba-line',
            type: 'line',
            source: 'quantarctica-iba-src',
            paint: {
              'line-color': '#34d399',
              'line-width': 1.5,
            },
          });
        }
      }
      map.setLayoutProperty('quantarctica-iba-fill', 'visibility', 'visible');
      map.setLayoutProperty('quantarctica-iba-line', 'visibility', 'visible');
    } catch (e) {
      console.warn('[Quantarctica] Failed to load IBAs:', e);
    }
  } else if (map.getLayer('quantarctica-iba-fill')) {
    map.setLayoutProperty('quantarctica-iba-fill', 'visibility', 'none');
    map.setLayoutProperty('quantarctica-iba-line', 'visibility', 'none');
  }

  // 7. Rock Outcrops / Exposed Relief (SCAR ADD)
  if (activeLayerIds.has('rock_outcrops')) {
    try {
      if (!map.getSource('quantarctica-rock-src')) {
        const geojson = await fetchQuantarcticaGeoJson('rock_outcrops');
        if (!map.getSource('quantarctica-rock-src')) {
          map.addSource('quantarctica-rock-src', {
            type: 'geojson',
            data: geojson,
          });

          map.addLayer({
            id: 'quantarctica-rock-fill',
            type: 'fill',
            source: 'quantarctica-rock-src',
            paint: {
              'fill-color': '#78716c',
              'fill-opacity': 0.6,
            },
          });

          map.addLayer({
            id: 'quantarctica-rock-line',
            type: 'line',
            source: 'quantarctica-rock-src',
            paint: {
              'line-color': '#d6d3d1',
              'line-width': 0.8,
            },
          });
        }
      }
      map.setLayoutProperty('quantarctica-rock-fill', 'visibility', 'visible');
      map.setLayoutProperty('quantarctica-rock-line', 'visibility', 'visible');
    } catch (e) {
      console.warn('[Quantarctica] Failed to load rock outcrops:', e);
    }
  } else if (map.getLayer('quantarctica-rock-fill')) {
    map.setLayoutProperty('quantarctica-rock-fill', 'visibility', 'none');
    map.setLayoutProperty('quantarctica-rock-line', 'visibility', 'none');
  }

  // 8. CCAMLR Marine Protected Areas
  if (activeLayerIds.has('ccamlr_mpas')) {
    try {
      if (!map.getSource('quantarctica-mpas-src')) {
        const geojson = await fetchQuantarcticaGeoJson('ccamlr_mpas');
        if (!map.getSource('quantarctica-mpas-src')) {
          map.addSource('quantarctica-mpas-src', {
            type: 'geojson',
            data: geojson,
          });

          map.addLayer({
            id: 'quantarctica-mpas-fill',
            type: 'fill',
            source: 'quantarctica-mpas-src',
            paint: {
              'fill-color': '#0284c7',
              'fill-opacity': 0.25,
            },
          });

          map.addLayer({
            id: 'quantarctica-mpas-line',
            type: 'line',
            source: 'quantarctica-mpas-src',
            paint: {
              'line-color': '#38bdf8',
              'line-width': 2.2,
              'line-dasharray': [4, 2],
            },
          });
        }
      }
      map.setLayoutProperty('quantarctica-mpas-fill', 'visibility', 'visible');
      map.setLayoutProperty('quantarctica-mpas-line', 'visibility', 'visible');
    } catch (e) {
      console.warn('[Quantarctica] Failed to load CCAMLR MPAs:', e);
    }
  } else if (map.getLayer('quantarctica-mpas-fill')) {
    map.setLayoutProperty('quantarctica-mpas-fill', 'visibility', 'none');
    map.setLayoutProperty('quantarctica-mpas-line', 'visibility', 'none');
  }

  // 9. Coastline (SCAR ADD)
  if (activeLayerIds.has('quantarctica_coastline') || activeLayerIds.has('coastline')) {
    try {
      if (!map.getSource('quantarctica-coastline-src')) {
        const geojson = await fetchQuantarcticaGeoJson('coastline');
        if (!map.getSource('quantarctica-coastline-src')) {
          map.addSource('quantarctica-coastline-src', { type: 'geojson', data: geojson });
          map.addLayer({
            id: 'quantarctica-coastline-fill',
            type: 'fill',
            source: 'quantarctica-coastline-src',
            paint: { 'fill-color': '#0f172a', 'fill-opacity': 0.4 },
          });
          map.addLayer({
            id: 'quantarctica-coastline-line',
            type: 'line',
            source: 'quantarctica-coastline-src',
            paint: { 'line-color': '#94a3b8', 'line-width': 1.2 },
          });
        }
      }
      map.setLayoutProperty('quantarctica-coastline-fill', 'visibility', 'visible');
      map.setLayoutProperty('quantarctica-coastline-line', 'visibility', 'visible');
    } catch (e) {
      console.warn('[Quantarctica] Failed to load coastline:', e);
    }
  } else if (map.getLayer('quantarctica-coastline-fill')) {
    map.setLayoutProperty('quantarctica-coastline-fill', 'visibility', 'none');
    map.setLayoutProperty('quantarctica-coastline-line', 'visibility', 'none');
  }

  // 10. Ice Shelves
  if (activeLayerIds.has('quantarctica_shelves') || activeLayerIds.has('ice_shelves')) {
    try {
      if (!map.getSource('quantarctica-shelves-src')) {
        const geojson = await fetchQuantarcticaGeoJson('ice_shelves');
        if (!map.getSource('quantarctica-shelves-src')) {
          map.addSource('quantarctica-shelves-src', { type: 'geojson', data: geojson });
          map.addLayer({
            id: 'quantarctica-shelves-fill',
            type: 'fill',
            source: 'quantarctica-shelves-src',
            paint: { 'fill-color': '#0284c7', 'fill-opacity': 0.2 },
          });
          map.addLayer({
            id: 'quantarctica-shelves-line',
            type: 'line',
            source: 'quantarctica-shelves-src',
            paint: { 'line-color': '#38bdf8', 'line-width': 1.0, 'line-dasharray': [3, 2] },
          });
        }
      }
      map.setLayoutProperty('quantarctica-shelves-fill', 'visibility', 'visible');
      map.setLayoutProperty('quantarctica-shelves-line', 'visibility', 'visible');
    } catch (e) {
      console.warn('[Quantarctica] Failed to load ice shelves:', e);
    }
  } else if (map.getLayer('quantarctica-shelves-fill')) {
    map.setLayoutProperty('quantarctica-shelves-fill', 'visibility', 'none');
    map.setLayoutProperty('quantarctica-shelves-line', 'visibility', 'none');
  }

  // 11. ASMA (Antarctic Specially Managed Areas)
  if (activeLayerIds.has('quantarctica_asma') || activeLayerIds.has('asma')) {
    try {
      if (!map.getSource('quantarctica-asma-src')) {
        const geojson = await fetchQuantarcticaGeoJson('asma');
        if (!map.getSource('quantarctica-asma-src')) {
          map.addSource('quantarctica-asma-src', { type: 'geojson', data: geojson });
          map.addLayer({
            id: 'quantarctica-asma-fill',
            type: 'fill',
            source: 'quantarctica-asma-src',
            paint: { 'fill-color': '#f59e0b', 'fill-opacity': 0.2 },
          });
          map.addLayer({
            id: 'quantarctica-asma-line',
            type: 'line',
            source: 'quantarctica-asma-src',
            paint: { 'line-color': '#fbbf24', 'line-width': 1.5, 'line-dasharray': [2, 2] },
          });
        }
      }
      map.setLayoutProperty('quantarctica-asma-fill', 'visibility', 'visible');
      map.setLayoutProperty('quantarctica-asma-line', 'visibility', 'visible');
    } catch (e) {
      console.warn('[Quantarctica] Failed to load ASMA:', e);
    }
  } else if (map.getLayer('quantarctica-asma-fill')) {
    map.setLayoutProperty('quantarctica-asma-fill', 'visibility', 'none');
    map.setLayoutProperty('quantarctica-asma-line', 'visibility', 'none');
  }

  // 12. Antarctic Treaty Sectors / Claims
  if (activeLayerIds.has('treaty_claims')) {
    try {
      if (!map.getSource('quantarctica-treaty-src')) {
        const geojson = await fetchQuantarcticaGeoJson('treaty_claims');
        if (!map.getSource('quantarctica-treaty-src')) {
          map.addSource('quantarctica-treaty-src', { type: 'geojson', data: geojson });
          map.addLayer({
            id: 'quantarctica-treaty-fill',
            type: 'fill',
            source: 'quantarctica-treaty-src',
            paint: { 'fill-color': '#6366f1', 'fill-opacity': 0.12 },
          });
          map.addLayer({
            id: 'quantarctica-treaty-line',
            type: 'line',
            source: 'quantarctica-treaty-src',
            paint: { 'line-color': '#818cf8', 'line-width': 1.5, 'line-dasharray': [5, 3] },
          });
        }
      }
      map.setLayoutProperty('quantarctica-treaty-fill', 'visibility', 'visible');
      map.setLayoutProperty('quantarctica-treaty-line', 'visibility', 'visible');
    } catch (e) {
      console.warn('[Quantarctica] Failed to load treaty claims:', e);
    }
  } else if (map.getLayer('quantarctica-treaty-fill')) {
    map.setLayoutProperty('quantarctica-treaty-fill', 'visibility', 'none');
    map.setLayoutProperty('quantarctica-treaty-line', 'visibility', 'none');
  }

  // 13. Maritime SAR Regions
  if (activeLayerIds.has('sar_regions')) {
    try {
      if (!map.getSource('quantarctica-sar-src')) {
        const geojson = await fetchQuantarcticaGeoJson('sar_regions');
        if (!map.getSource('quantarctica-sar-src')) {
          map.addSource('quantarctica-sar-src', { type: 'geojson', data: geojson });
          map.addLayer({
            id: 'quantarctica-sar-line',
            type: 'line',
            source: 'quantarctica-sar-src',
            paint: { 'line-color': '#f97316', 'line-width': 1.8, 'line-dasharray': [6, 3] },
          });
        }
      }
      map.setLayoutProperty('quantarctica-sar-line', 'visibility', 'visible');
    } catch (e) {
      console.warn('[Quantarctica] Failed to load SAR regions:', e);
    }
  } else if (map.getLayer('quantarctica-sar-line')) {
    map.setLayoutProperty('quantarctica-sar-line', 'visibility', 'none');
  }

  // 14. Historic Stations / Heroic Era Huts
  if (activeLayerIds.has('historic_stations')) {
    try {
      if (!map.getSource('quantarctica-historic-stations-src')) {
        const geojson = await fetchQuantarcticaGeoJson('historic_stations');
        if (!map.getSource('quantarctica-historic-stations-src')) {
          map.addSource('quantarctica-historic-stations-src', { type: 'geojson', data: geojson });
          map.addLayer({
            id: 'quantarctica-historic-stations-pts',
            type: 'circle',
            source: 'quantarctica-historic-stations-src',
            paint: {
              'circle-radius': 5,
              'circle-color': '#d97706',
              'circle-stroke-color': '#fef3c7',
              'circle-stroke-width': 1.5,
            },
          });
        }
      }
      map.setLayoutProperty('quantarctica-historic-stations-pts', 'visibility', 'visible');
    } catch (e) {
      console.warn('[Quantarctica] Failed to load historic stations:', e);
    }
  } else if (map.getLayer('quantarctica-historic-stations-pts')) {
    map.setLayoutProperty('quantarctica-historic-stations-pts', 'visibility', 'none');
  }

  // 15. Southern Ocean Fronts
  if (activeLayerIds.has('southern_ocean_fronts')) {
    try {
      if (!map.getSource('quantarctica-fronts-src')) {
        const geojson = await fetchQuantarcticaGeoJson('southern_ocean_fronts');
        if (!map.getSource('quantarctica-fronts-src')) {
          map.addSource('quantarctica-fronts-src', { type: 'geojson', data: geojson });
          map.addLayer({
            id: 'quantarctica-fronts-line',
            type: 'line',
            source: 'quantarctica-fronts-src',
            paint: {
              'line-color': '#06b6d4',
              'line-width': 2.4,
            },
          });
        }
      }
      map.setLayoutProperty('quantarctica-fronts-line', 'visibility', 'visible');
    } catch (e) {
      console.warn('[Quantarctica] Failed to load Southern Ocean Fronts:', e);
    }
  } else if (map.getLayer('quantarctica-fronts-line')) {
    map.setLayoutProperty('quantarctica-fronts-line', 'visibility', 'none');
  }

  // 16. ACBRs (Antarctic Conservation Biogeographic Regions)
  if (activeLayerIds.has('acbrs')) {
    try {
      if (!map.getSource('quantarctica-acbrs-src')) {
        const geojson = await fetchQuantarcticaGeoJson('acbrs');
        if (!map.getSource('quantarctica-acbrs-src')) {
          map.addSource('quantarctica-acbrs-src', { type: 'geojson', data: geojson });
          map.addLayer({
            id: 'quantarctica-acbrs-fill',
            type: 'fill',
            source: 'quantarctica-acbrs-src',
            paint: {
              'fill-color': '#10b981',
              'fill-opacity': 0.22,
            },
          });
          map.addLayer({
            id: 'quantarctica-acbrs-line',
            type: 'line',
            source: 'quantarctica-acbrs-src',
            paint: {
              'line-color': '#059669',
              'line-width': 1.2,
            },
          });
        }
      }
      map.setLayoutProperty('quantarctica-acbrs-fill', 'visibility', 'visible');
      map.setLayoutProperty('quantarctica-acbrs-line', 'visibility', 'visible');
    } catch (e) {
      console.warn('[Quantarctica] Failed to load ACBRs:', e);
    }
  } else if (map.getLayer('quantarctica-acbrs-fill')) {
    map.setLayoutProperty('quantarctica-acbrs-fill', 'visibility', 'none');
    map.setLayoutProperty('quantarctica-acbrs-line', 'visibility', 'none');
  }

  // 17. CCAMLR Statistical Areas
  if (activeLayerIds.has('ccamlr_statistical_areas')) {
    try {
      if (!map.getSource('quantarctica-ccamlr-stat-src')) {
        const geojson = await fetchQuantarcticaGeoJson('ccamlr_statistical_areas');
        if (!map.getSource('quantarctica-ccamlr-stat-src')) {
          map.addSource('quantarctica-ccamlr-stat-src', { type: 'geojson', data: geojson });
          map.addLayer({
            id: 'quantarctica-ccamlr-stat-fill',
            type: 'fill',
            source: 'quantarctica-ccamlr-stat-src',
            paint: {
              'fill-color': '#a855f7',
              'fill-opacity': 0.08,
            },
          });
          map.addLayer({
            id: 'quantarctica-ccamlr-stat-line',
            type: 'line',
            source: 'quantarctica-ccamlr-stat-src',
            paint: {
              'line-color': '#c084fc',
              'line-width': 1.8,
              'line-dasharray': [4, 2],
            },
          });
        }
      }
      map.setLayoutProperty('quantarctica-ccamlr-stat-fill', 'visibility', 'visible');
      map.setLayoutProperty('quantarctica-ccamlr-stat-line', 'visibility', 'visible');
    } catch (e) {
      console.warn('[Quantarctica] Failed to load CCAMLR Statistical Areas:', e);
    }
  } else if (map.getLayer('quantarctica-ccamlr-stat-fill')) {
    map.setLayoutProperty('quantarctica-ccamlr-stat-fill', 'visibility', 'none');
    map.setLayoutProperty('quantarctica-ccamlr-stat-line', 'visibility', 'none');
  }

  // 18. Median Sea Ice Extents (1981-2010)
  if (activeLayerIds.has('median_sea_ice_extents')) {
    try {
      if (!map.getSource('quantarctica-seaice-src')) {
        const geojson = await fetchQuantarcticaGeoJson('median_sea_ice_extents');
        if (!map.getSource('quantarctica-seaice-src')) {
          map.addSource('quantarctica-seaice-src', { type: 'geojson', data: geojson });
          map.addLayer({
            id: 'quantarctica-seaice-line',
            type: 'line',
            source: 'quantarctica-seaice-src',
            paint: {
              'line-color': '#38bdf8',
              'line-width': 2.0,
              'line-dasharray': [3, 1],
            },
          });
        }
      }
      map.setLayoutProperty('quantarctica-seaice-line', 'visibility', 'visible');
    } catch (e) {
      console.warn('[Quantarctica] Failed to load Median Sea Ice Extents:', e);
    }
  } else if (map.getLayer('quantarctica-seaice-line')) {
    map.setLayoutProperty('quantarctica-seaice-line', 'visibility', 'none');
  }

  // 19. Historic Exploration Routes (Amundsen, Scott, Shackleton, Mawson)
  if (activeLayerIds.has('historic_routes')) {
    try {
      if (!map.getSource('quantarctica-historic-routes-src')) {
        const geojson = await fetchQuantarcticaGeoJson('historic_routes');
        if (!map.getSource('quantarctica-historic-routes-src')) {
          map.addSource('quantarctica-historic-routes-src', { type: 'geojson', data: geojson });
          map.addLayer({
            id: 'quantarctica-historic-routes-line',
            type: 'line',
            source: 'quantarctica-historic-routes-src',
            paint: {
              'line-color': '#eab308',
              'line-width': 2.4,
              'line-dasharray': [5, 2],
            },
          });
        }
      }
      map.setLayoutProperty('quantarctica-historic-routes-line', 'visibility', 'visible');
    } catch (e) {
      console.warn('[Quantarctica] Failed to load historic routes:', e);
    }
  } else if (map.getLayer('quantarctica-historic-routes-line')) {
    map.setLayoutProperty('quantarctica-historic-routes-line', 'visibility', 'none');
  }
}
