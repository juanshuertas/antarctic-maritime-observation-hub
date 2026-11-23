/**
 * AMOH V10 — QGIS Hub Layers Catalog & Integration
 * 
 * Capas descubiertas, descargadas y parseadas desde https://hub.qgis.org/api/v1/resources/
 * Archivo fuente: data/qgis-hub/layers-config.json
 */

import type * as maplibregl from 'maplibre-gl';
import type { AmohLayerDefinition } from './layer-registry';

export interface QgisHubExtent {
  xmin: string;
  ymin: string;
  xmax: string;
  ymax: string;
}

export interface QgisHubLayerItem {
  id: string;
  name: string;
  category: 'BASEMAP' | 'SATELLITE' | 'CRYOSPHERE' | 'OCEAN' | 'MARITIME' | 'BIODIVERSITY' | 'GOVERNANCE' | 'INFRASTRUCTURE' | 'OTHER';
  sdg: number;
  priority: number;
  is_antarctic: boolean;
  provider: string | null;
  datasource: string;
  tile_urls: string[];
  wms_urls: string[];
  feature_urls: string[];
  crs: string;
  extent: QgisHubExtent | null;
  source: string;
  source_url: string;
  qlr_file: string;
  download_count: number;
  upload_date: string;
  description: string;
  thumbnail: string;
  enabled: boolean;
  offline_ready: boolean;
}

export interface QgisHubCatalogConfig {
  source: string;
  api_url: string;
  total_resources: number;
  useful_resources: number;
  parsed_layers: number;
  generated_at: string;
  layers: QgisHubLayerItem[];
}

export const QGIS_HUB_CATALOG: QgisHubCatalogConfig = {
  source: 'QGIS Hub',
  api_url: 'https://hub.qgis.org/api/v1/resources/',
  total_resources: 358,
  useful_resources: 224,
  parsed_layers: 8,
  generated_at: '2026-09-22T21:03:22.230Z',
  layers: [
    {
      id: 'd46eec54-2922-469c-88e7-85262e4ad232',
      name: 'swisstopo Vector Tiles',
      category: 'BASEMAP',
      sdg: 9,
      priority: 1,
      is_antarctic: false,
      provider: 'xyz',
      datasource: 'styleUrl=https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte.vt/style.json&type=xyz&url=https://vectortiles.geo.admin.ch/tiles/ch.swisstopo.leichte-basiskarte.vt/v1.0.0/%7Bz%7D/%7Bx%7D/%7By%7D.pbf&zmax=14&zmin=0',
      tile_urls: ['https://vectortiles.geo.admin.ch/styles/ch.swisstopo.leichte-basiskarte.vt/style.json'],
      wms_urls: [],
      feature_urls: [],
      crs: 'EPSG:3857',
      extent: {
        xmin: '-20037508.34278919920325279',
        ymin: '-20037508.34278919920325279',
        xmax: '20037508.34278919920325279',
        ymax: '20037508.34278919920325279',
      },
      source: 'QGIS Hub',
      source_url: 'https://hub.qgis.org/resources/hub/d46eec54-2922-469c-88e7-85262e4ad232/',
      qlr_file: 'd46eec54-2922-469c-88e7-85262e4ad232_swisstopo.qlr',
      download_count: 3944,
      upload_date: '2022-01-03T09:19:30.991577',
      description: 'The Light Base Map is a background map to provide a foreground theme with optimal spatial orientation. Vector tiles worldwide coverage.',
      thumbnail: 'https://hub.qgis.org/media/cache/15/df/15df1fcd31d114cf26142bc09bf3298e.jpg',
      enabled: false,
      offline_ready: false,
    },
    {
      id: 'f0ee0620-30fc-441b-a9e7-b10501550b6a',
      name: 'OpenStreetMap MVT Shortbread',
      category: 'BASEMAP',
      sdg: 11,
      priority: 1,
      is_antarctic: false,
      provider: 'xyz',
      datasource: 'type=xyz&url=https://vector.openstreetmap.org/shortbread_v1/%7Bz%7D/%7Bx%7D/%7By%7D.mvt&zmax=14&zmin=0&http-header:referer=',
      tile_urls: ['https://vector.openstreetmap.org/shortbread_v1/{z}/{x}/{y}.mvt'],
      wms_urls: [],
      feature_urls: [],
      crs: 'EPSG:3857',
      extent: {
        xmin: '-20037508.34278919920325279',
        ymin: '-20037508.34278919920325279',
        xmax: '20037508.34278919920325279',
        ymax: '20037508.34278919920325279',
      },
      source: 'QGIS Hub',
      source_url: 'https://hub.qgis.org/resources/hub/f0ee0620-30fc-441b-a9e7-b10501550b6a/',
      qlr_file: 'f0ee0620-30fc-441b-a9e7-b10501550b6a_OSM_MVT_test_jckvQNk.qlr',
      download_count: 2438,
      upload_date: '2024-12-28T11:44:11.16974',
      description: 'Clean OpenStreetMap Shortbread v1 vector tiles schema.',
      thumbnail: 'https://hub.qgis.org/media/cache/3a/9c/3a9ccfafff7b10708bae38f328b42a15.jpg',
      enabled: false,
      offline_ready: false,
    },
    {
      id: 'a04ecd67-efe1-4f0a-95ff-f20b92cba6f8',
      name: 'Sentinel 2 & PNOA High-Res Orthophotos',
      category: 'SATELLITE',
      sdg: 13,
      priority: 1,
      is_antarctic: false,
      provider: 'xyz',
      datasource: 'http-header:referer=&type=xyz&url=https://tms-pnoa-ma.idee.es/1.0.0/pnoa-ma/%7Bz%7D/%7Bx%7D/%7B-y%7D.jpeg&zmax=19&zmin=0',
      tile_urls: ['https://tms-pnoa-ma.idee.es/1.0.0/pnoa-ma/{z}/{x}/{-y}.jpeg'],
      wms_urls: [],
      feature_urls: [],
      crs: 'EPSG:3857',
      extent: {
        xmin: '-20037508.34278924390673637',
        ymin: '-20037508.34278924763202667',
        xmax: '20037508.34278924390673637',
        ymax: '20037508.34278924763202667',
      },
      source: 'QGIS Hub',
      source_url: 'https://hub.qgis.org/resources/hub/a04ecd67-efe1-4f0a-95ff-f20b92cba6f8/',
      qlr_file: 'a04ecd67-efe1-4f0a-95ff-f20b92cba6f8_TMS_PNOA.qlr',
      download_count: 716,
      upload_date: '2025-07-16T11:25:01.729246',
      description: 'Tile Map Service (TMS) de ortofotos PNOA y cobertura Sentinel-2 con fondo satelital mundial MODIS.',
      thumbnail: 'https://hub.qgis.org/media/cache/5c/41/5c41be546dbd84e983a26a1de7e4a8b4.jpg',
      enabled: false,
      offline_ready: false,
    },
    {
      id: '320d9117-8c00-44cf-b469-104d1edfb894',
      name: 'IGN Base Todo Cartographic Representation',
      category: 'BASEMAP',
      sdg: 9,
      priority: 1,
      is_antarctic: false,
      provider: 'xyz',
      datasource: 'http-header:referer=&type=xyz&url=https://tms-ign-base.idee.es/1.0.0/IGNBaseTodo/%7Bz%7D/%7Bx%7D/%7B-y%7D.jpeg&zmax=15&zmin=5',
      tile_urls: ['https://tms-ign-base.idee.es/1.0.0/IGNBaseTodo/{z}/{x}/{-y}.jpeg'],
      wms_urls: [],
      feature_urls: [],
      crs: 'EPSG:3857',
      extent: {
        xmin: '-20037508.34278924390673637',
        ymin: '-20037508.34278924763202667',
        xmax: '20037508.34278924390673637',
        ymax: '20037508.34278924763202667',
      },
      source: 'QGIS Hub',
      source_url: 'https://hub.qgis.org/resources/hub/320d9117-8c00-44cf-b469-104d1edfb894/',
      qlr_file: '320d9117-8c00-44cf-b469-104d1edfb894_TMS_IGN_BASE_TODO.qlr',
      download_count: 667,
      upload_date: '2025-07-16T11:58:22.187617',
      description: 'Servicio TMS mundial continuo con hidrografía, relieve sombreado y límites internacionales.',
      thumbnail: 'https://hub.qgis.org/media/cache/7b/69/7b694f92a7ce67edc8a29c257a5f94b4.jpg',
      enabled: false,
      offline_ready: false,
    },
    {
      id: 'b358a8a1-3819-44c8-af2b-267e13149df1',
      name: 'Unidades Administrativas MVT (Cloud Style)',
      category: 'GOVERNANCE',
      sdg: 16,
      priority: 1,
      is_antarctic: false,
      provider: 'xyz',
      datasource: 'styleUrl=https://vt-unidades-administrativas.ign.es/demo/style_s3_cloud.json&type=xyz&url=https://vt-unidades-administrativas.ign.es/1.0.0/uadministrativa/%7Bz%7D/%7Bx%7D/%7By%7D.pbf&zmax=17&zmin=2&http-header:referer=',
      tile_urls: ['https://vt-unidades-administrativas.ign.es/demo/style_s3_cloud.json'],
      wms_urls: [],
      feature_urls: [],
      crs: 'EPSG:3857',
      extent: {
        xmin: '-20037508.34278919920325279',
        ymin: '-20037508.34278919920325279',
        xmax: '20037508.34278919920325279',
        ymax: '20037508.34278919920325279',
      },
      source: 'QGIS Hub',
      source_url: 'https://hub.qgis.org/resources/hub/b358a8a1-3819-44c8-af2b-267e13149df1/',
      qlr_file: 'b358a8a1-3819-44c8-af2b-267e13149df1_MVT_UNIDADES_ADMINISTRATIVAS.qlr',
      download_count: 690,
      upload_date: '2025-07-16T12:14:22.415603',
      description: 'Límites administrativos jurisdiccionales en teselas vectoriales (MVT) del Registro Central de Cartografía.',
      thumbnail: 'https://hub.qgis.org/media/cache/4c/42/4c42224f8e931d32282c24a2fd519a6e.jpg',
      enabled: false,
      offline_ready: false,
    },
    {
      id: '20ec8f66-41c2-4fd3-9f7c-4360ba4e79a9',
      name: 'Unidades Administrativas MVT (Green Style)',
      category: 'GOVERNANCE',
      sdg: 16,
      priority: 1,
      is_antarctic: false,
      provider: 'xyz',
      datasource: 'styleUrl=https://vt-unidades-administrativas.ign.es/demo/style_s3_green.json&type=xyz&url=https://vt-unidades-administrativas.ign.es/1.0.0/uadministrativa/%7Bz%7D/%7Bx%7D/%7By%7D.pbf&zmax=17&zmin=2&http-header:referer=',
      tile_urls: ['https://vt-unidades-administrativas.ign.es/demo/style_s3_green.json'],
      wms_urls: [],
      feature_urls: [],
      crs: 'EPSG:3857',
      extent: {
        xmin: '-20037508.34278919920325279',
        ymin: '-20037508.34278919920325279',
        xmax: '20037508.34278919920325279',
        ymax: '20037508.34278919920325279',
      },
      source: 'QGIS Hub',
      source_url: 'https://hub.qgis.org/resources/hub/20ec8f66-41c2-4fd3-9f7c-4360ba4e79a9/',
      qlr_file: '20ec8f66-41c2-4fd3-9f7c-4360ba4e79a9_MVT_UNIDADES_ADMINISTRATIVAS_GREEN.qlr',
      download_count: 592,
      upload_date: '2025-10-20T06:21:05.504829',
      description: 'Límites administrativos jurisdiccionales con tematización ambiental / verde.',
      thumbnail: 'https://hub.qgis.org/media/cache/19/c7/19c7143ed94e2a0a554582a25a401cf9.jpg',
      enabled: false,
      offline_ready: false,
    },
    {
      id: '4b6670e9-d850-43a9-bb67-e80ce8dca53f',
      name: 'Base Topográfica Nacional MVT (BTN)',
      category: 'INFRASTRUCTURE',
      sdg: 9,
      priority: 1,
      is_antarctic: false,
      provider: 'xyz',
      datasource: 'styleUrl=https://vt-btn.idee.es/files/styles/BTN_Completa.json&type=xyz&url=https://vt-btn.idee.es/1.0.0/btn/tile/%7Bz%7D/%7By%7D/%7Bx%7D.pbf&zmax=14&zmin=0&http-header:referer=',
      tile_urls: ['https://vt-btn.idee.es/files/styles/BTN_Completa.json'],
      wms_urls: [],
      feature_urls: [],
      crs: 'EPSG:3857',
      extent: {
        xmin: '-20037508.34278919920325279',
        ymin: '-20037508.34278919920325279',
        xmax: '20037508.34278919920325279',
        ymax: '20037508.34278919920325279',
      },
      source: 'QGIS Hub',
      source_url: 'https://hub.qgis.org/resources/hub/4b6670e9-d850-43a9-bb67-e80ce8dca53f/',
      qlr_file: '4b6670e9-d850-43a9-bb67-e80ce8dca53f_VT_BTN.qlr',
      download_count: 508,
      upload_date: '2026-01-26T08:04:18.410211',
      description: 'Base de datos topográfica tridimensional multiescala continua en teselas vectoriales.',
      thumbnail: 'https://hub.qgis.org/media/cache/1d/18/1d18c0d7a8ccb21bb3713057cbf4ae89.jpg',
      enabled: false,
      offline_ready: false,
    },
    {
      id: '11a68248-d442-4996-9113-e23828688942',
      name: 'ESRI Sentinel-2 10m Global Land Cover',
      category: 'SATELLITE',
      sdg: 13,
      priority: 1,
      is_antarctic: false,
      provider: 'arcgis',
      datasource: "crs='EPSG:4326' url='https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/LULC_2020_Download_Scenes/FeatureServer/0'",
      tile_urls: [],
      wms_urls: [],
      feature_urls: ['https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/LULC_2020_Download_Scenes/FeatureServer/0'],
      crs: 'EPSG:4326',
      extent: {
        xmin: '-180.00000000079936058',
        ymin: '-80.00000000999244776',
        xmax: '180.0000000009993073',
        ymax: '84.00019257043085474',
      },
      source: 'QGIS Hub',
      source_url: 'https://hub.qgis.org/resources/hub/11a68248-d442-4996-9113-e23828688942/',
      qlr_file: '11a68248-d442-4996-9113-e23828688942_esri_sentinel-2_lc_2017-2025.qlr',
      download_count: 196,
      upload_date: '2026-07-19T09:45:06.54716',
      description: 'Cobertura del suelo Sentinel-2 a 10m de resolución (2017–2025) de Impact Observatory, Microsoft y Esri.',
      thumbnail: 'https://hub.qgis.org/media/cache/84/4b/844b77ebe9c0f5d74eba46e1a8141424.jpg',
      enabled: false,
      offline_ready: false,
    },
  ],
};

/**
 * Adaptadores de las capas temáticas de QGIS Hub para el Layer Registry central de AMOH
 */
export const QGIS_HUB_AMOH_LAYERS: AmohLayerDefinition[] = [
  {
    id: 'qgis_pnoa_sentinel2',
    label: 'Ortomosaico Sentinel-2 / PNOA (IGN / QGIS Hub)',
    shortLabel: 'Sentinel-2 PNOA',
    description: 'Servicio TMS de imágenes satelitales Sentinel-2 y ortofotos de alta resolución.',
    category: 'INFRASTRUCTURE',
    domain: 'context',
    iconId: 'satellite',
    color: '#58D5E3',
    providerId: 'qgis_hub',
    defaultEnabled: false,
    heavy: false,
    sourceType: 'raster',
  },
  {
    id: 'qgis_ign_base',
    label: 'Mapa Topográfico Base Mundial (IGN / QGIS Hub)',
    shortLabel: 'IGN Base',
    description: 'Servicio TMS cartográfico multiescalar continuo mundial con relieve sombreado.',
    category: 'INFRASTRUCTURE',
    domain: 'context',
    iconId: 'map',
    color: '#B7C5D8',
    providerId: 'qgis_hub',
    defaultEnabled: false,
    heavy: false,
    sourceType: 'raster',
  },
  {
    id: 'qgis_admin_units',
    label: 'Límites y Unidades Administrativas MVT (QGIS Hub)',
    shortLabel: 'Límites Admin',
    description: 'Teselas vectoriales MVT de fronteras y demarcaciones jurisdiccionales oficiales.',
    category: 'GOVERNANCE',
    domain: 'governance',
    iconId: 'shield',
    color: '#C084FC',
    providerId: 'qgis_hub',
    defaultEnabled: false,
    heavy: false,
    sourceType: 'mvt',
  },
  {
    id: 'qgis_btn_topographic',
    label: 'Base Topográfica Nacional MVT (BTN / QGIS Hub)',
    shortLabel: 'Topografía BTN',
    description: 'Base de datos tridimensional multiescala continua en teselas vectoriales.',
    category: 'INFRASTRUCTURE',
    domain: 'infrastructure',
    iconId: 'layers',
    color: '#FFC845',
    providerId: 'qgis_hub',
    defaultEnabled: false,
    heavy: false,
    sourceType: 'mvt',
  },
  {
    id: 'qgis_sentinel2_landcover',
    label: 'Cobertura del Suelo Sentinel-2 10m (Esri / Impact Observatory)',
    shortLabel: 'Sentinel LandCover',
    description: 'Serie temporal global de cobertura de suelo y criósfera a 10m de resolución (2017–2025).',
    category: 'ICE',
    domain: 'cryosphere',
    iconId: 'globe',
    color: '#72E0B5',
    providerId: 'qgis_hub',
    defaultEnabled: false,
    heavy: true,
    sourceType: 'raster',
  },
];

/**
 * Funciones de conveniencia para consultar capas de QGIS Hub
 */
export function getQgisHubLayers(): QgisHubLayerItem[] {
  return QGIS_HUB_CATALOG.layers;
}

export function getQgisHubLayerById(id: string): QgisHubLayerItem | undefined {
  return QGIS_HUB_CATALOG.layers.find((l) => l.id === id);
}

/**
 * Aplica una capa del QGIS Hub en un mapa MapLibre
 */
export function applyQgisHubLayer(map: maplibregl.Map, layerId: string) {
  const layer = getQgisHubLayerById(layerId);
  if (!layer) return;

  const sourceId = `qgis_${layer.id}`;
  if (map.getSource(sourceId)) return;

  if (layer.tile_urls.length > 0) {
    const tileUrl = layer.tile_urls[0];
    const isTms = layer.datasource.includes('{-y}');

    if (tileUrl.endsWith('.json')) {
      // Style URL
      console.log(`[QGIS Hub] Vector style URL: ${tileUrl}`);
    } else {
      map.addSource(sourceId, {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256,
        scheme: isTms ? 'tms' : 'xyz',
      });
      map.addLayer({
        id: `${sourceId}_layer`,
        type: 'raster',
        source: sourceId,
        paint: { 'raster-opacity': 0.8 },
      });
    }
  }
}

/**
 * Remueve una capa del QGIS Hub del mapa MapLibre
 */
export function removeQgisHubLayer(map: maplibregl.Map, layerId: string) {
  const sourceId = `qgis_${layerId}`;
  const layerName = `${sourceId}_layer`;
  if (map.getLayer(layerName)) {
    map.removeLayer(layerName);
  }
  if (map.getSource(sourceId)) {
    map.removeSource(sourceId);
  }
}
