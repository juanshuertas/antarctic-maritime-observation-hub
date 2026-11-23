import type { FeatureCollection, Feature, Point } from 'geojson';

export interface LabelFeatureProps {
  name: string;
  size: number;
  color: string;
}

export const ANTARCTIC_LABELS_FC: FeatureCollection<Point, LabelFeatureProps> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0.0, -89.8] },
      properties: { name: '★ POLO SUR GEOGRÁFICO (90°S)', size: 13, color: '#ffffff' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [80.0, -78.0] },
      properties: { name: 'ANTÁRTIDA ORIENTAL', size: 14, color: '#e0f2fe' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-105.0, -78.0] },
      properties: { name: 'ANTÁRTIDA OCCIDENTAL', size: 13, color: '#e0f2fe' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-45.0, -74.0] },
      properties: { name: 'Mar de Weddell', size: 12, color: '#93c5fd' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [175.0, -75.0] },
      properties: { name: 'Mar de Ross', size: 12, color: '#93c5fd' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-110.0, -71.5] },
      properties: { name: 'Mar de Amundsen', size: 11, color: '#93c5fd' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-85.0, -70.5] },
      properties: { name: 'Mar de Bellingshausen', size: 11, color: '#93c5fd' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-62.5, -66.0] },
      properties: { name: 'Península Antártica', size: 11, color: '#38bdf8' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-62.0, -58.5] },
      properties: { name: 'Pasaje de Drake', size: 11, color: '#7dd3fc' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-42.0, -57.5] },
      properties: { name: 'Mar de Scotia', size: 11, color: '#7dd3fc' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [75.0, -68.5] },
      properties: { name: 'Bahía Prydz / Glaciar Lambert', size: 10, color: '#bae6fd' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [15.0, -72.5] },
      properties: { name: 'Tierra de la Reina Maud (Dronning Maud Land)', size: 11, color: '#e0f2fe' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [120.0, -71.0] },
      properties: { name: 'Tierra de Wilkes', size: 11, color: '#e0f2fe' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [180.0, -81.0] },
      properties: { name: 'Barrera de Hielo de Ross (Ross Ice Shelf)', size: 11, color: '#67e8f9' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-50.0, -80.5] },
      properties: { name: 'Barrera de Hielo Filchner-Ronne', size: 11, color: '#67e8f9' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0.0, -55.0] },
      properties: { name: 'OCÉANO AUSTRAL (CIRCUMPOLAR)', size: 12, color: '#64748b' },
    },
  ],
};

// High-density realistic GFW fishing effort cluster in CCAMLR Subarea 48.1 & 48.2 (Bransfield Strait & South Shetlands)
export function generateGfwFishingHeatmapFC(): FeatureCollection<Point, { effort: number; name: string }> {
  // Deterministic seed locations around Bransfield Strait & South Shetlands
  const clusters = [
    { center: [-58.5, -62.8], radiusLng: 1.8, radiusLat: 0.8, count: 28, maxEffort: 95 },
    { center: [-60.2, -63.4], radiusLng: 1.4, radiusLat: 0.6, count: 22, maxEffort: 85 },
    { center: [-55.2, -61.2], radiusLng: 1.6, radiusLat: 0.7, count: 18, maxEffort: 70 },
    { center: [-45.5, -60.8], radiusLng: 2.0, radiusLat: 0.9, count: 14, maxEffort: 60 },
    { center: [-64.0, -64.8], radiusLng: 1.2, radiusLat: 0.5, count: 12, maxEffort: 50 },
  ];

  const features: Feature<Point, { effort: number; name: string }>[] = [];
  let seed = 42;
  const pseudoRand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  clusters.forEach((cl, clIdx) => {
    for (let i = 0; i < cl.count; i++) {
      const u = pseudoRand();
      const v = pseudoRand();
      const lng = cl.center[0] + (u - 0.5) * cl.radiusLng * 2;
      const lat = cl.center[1] + (v - 0.5) * cl.radiusLat * 2;
      const effort = Math.round(15 + pseudoRand() * (cl.maxEffort - 15));
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {
          effort,
          name: `Sector Pesquero 48.1-${clIdx + 1}.${i + 1}`,
        },
      });
    }
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}

export interface LocalAntarcticCartography {
  antarcticaLand: FeatureCollection;
  antarcticaIce: FeatureCollection;
  globalLand: FeatureCollection;
  labels: FeatureCollection;
  fishingHeatmap: FeatureCollection;
}

export async function fetchLocalAntarcticCartography(): Promise<LocalAntarcticCartography> {
  const [landRes, iceRes] = await Promise.all([
    fetch('/data/ne_land.json').then((r) => r.json()),
    fetch('/data/ne_antarctic_ice.json').then((r) => r.json()),
  ]);

  const antarcticaLandFeatures: Feature[] = [];
  const globalLandFeatures: Feature[] = [];

  for (const feat of (landRes.features || [])) {
    let isAntarctica = false;
    if (feat.bbox && (feat.bbox[1] < -58 || feat.bbox[3] < -58)) {
      isAntarctica = true;
    } else if (feat.geometry && feat.geometry.type === 'Polygon') {
      const firstCoord = feat.geometry.coordinates?.[0]?.[0];
      if (firstCoord && firstCoord[1] < -58) isAntarctica = true;
    } else if (feat.geometry && feat.geometry.type === 'MultiPolygon') {
      const firstCoord = feat.geometry.coordinates?.[0]?.[0]?.[0];
      if (firstCoord && firstCoord[1] < -58) isAntarctica = true;
    } else if (feat.properties?.NAME === 'Antarctica' || feat.properties?.featurecla === 'Antarctica') {
      isAntarctica = true;
    }

    if (isAntarctica) {
      antarcticaLandFeatures.push(feat);
    } else {
      globalLandFeatures.push(feat);
    }
  }

  return {
    antarcticaLand: { type: 'FeatureCollection', features: antarcticaLandFeatures },
    antarcticaIce: iceRes,
    globalLand: { type: 'FeatureCollection', features: globalLandFeatures },
    labels: ANTARCTIC_LABELS_FC as FeatureCollection,
    fishingHeatmap: generateGfwFishingHeatmapFC() as FeatureCollection,
  };
}
