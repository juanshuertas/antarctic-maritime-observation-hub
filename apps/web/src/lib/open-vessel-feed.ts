import type { Feature, FeatureCollection } from 'geojson';
import { VectorTile } from '@mapbox/vector-tile';
import { PbfReader } from 'pbf';

const ZOOM = 2;
const OPEN_RECEIVER = /^(udp:|station:ed25519:)/;

async function readTile(x: number, y: number): Promise<Feature[]> {
  const url = `https://ais.openwaters.io/v1/vessels/tiles/${ZOOM}/${x}/${y}?kind=vessel&max_age=15m&max_age_moving=15m`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000), cache: 'no-store' });
  if (!response.ok) throw new Error('Tesela AIS no disponible');
  const tile = new VectorTile(new PbfReader(await response.arrayBuffer())).layers.vessels;
  const features: Feature[] = [];
  for (let index = 0; tile && index < tile.length; index++) {
    const point = tile.feature(index);
    const { source, age_s, mmsi } = point.properties;
    // The aggregate also includes feeds without an open redistribution license.
    if (typeof source !== 'string' || !OPEN_RECEIVER.test(source) || !mmsi ||
        typeof age_s !== 'number' || age_s < 0 || age_s > 900) continue;
    const feature = point.toGeoJSON(x, y, ZOOM);
    if (feature.geometry.type !== 'Point' || feature.geometry.coordinates[1] > -50) continue;
    features.push({
      ...feature,
      properties: { ...point.properties, source: 'Open Waters AIS · ODbL 1.0', freshness: 'LIVE',
        timestamp: new Date(Date.now() - age_s * 1000).toISOString() },
    });
  }
  return features;
}

async function loadOpenVessels(): Promise<{ data: FeatureCollection; partial: boolean }> {
  const tiles = await Promise.allSettled(
    [0, 1, 2, 3].flatMap(x => [readTile(x, 2), readTile(x, 3)]),
  );
  const loaded = tiles.filter(tile => tile.status === 'fulfilled');
  if (!loaded.length) throw new Error('Open Waters AIS no disponible');
  const unique = new Map<number, Feature>();
  for (const tile of loaded) {
    for (const feature of tile.value) {
      const mmsi = Number(feature.properties?.mmsi);
      const previous = unique.get(mmsi);
      if (!previous || feature.properties?.age_s < previous.properties?.age_s) unique.set(mmsi, feature);
    }
  }
  return { data: { type: 'FeatureCollection', features: [...unique.values()] }, partial: loaded.length < tiles.length };
}

let request: { expires: number; data: ReturnType<typeof loadOpenVessels> } | undefined;

export function fetchOpenVessels() {
  if (!request || Date.now() >= request.expires) {
    request = { expires: Date.now() + 60000, data: loadOpenVessels() };
  }
  return request.data;
}
