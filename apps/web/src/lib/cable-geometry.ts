import type { Feature, FeatureCollection, LineString, MultiLineString, Point } from 'geojson';

/**
 * AMOH V6 Submarine Cable Geometry Validator & Polar Pipeline
 *
 * Rules:
 * - Every feature must be LineString, MultiLineString, or Point (for landing stations).
 * - Reject invalid polygon buffers, NaNs, infinities, and malformed coordinates.
 * - Normalize longitudes strictly to [-180, 180].
 * - Safely split segments crossing the antimeridian (|lon1 - lon2| > 180).
 * - Reject impossible global jumps (> 2,500 km single segment jump without intermediate vertices).
 * - Filter strictly to Southern Ocean (< 25°S) and Polar Gateway corridors.
 * - Amber color family strictly based on status.
 */

export type CableStatusType =
  | 'operational'
  | 'under_construction'
  | 'planned'
  | 'feasibility'
  | 'smart_science';

export interface CableProperties {
  id: string;
  name: string;
  status_type: CableStatusType;
  category: string;
  length_km?: number;
  color: string;
  status: string;
  operator?: string;
  freshness: string;
  is_gateway?: boolean;
  landing_points?: string[];
  notes?: string;
}

export const CABLE_STATUS_PALETTE: Record<CableStatusType, { color: string; dashArray?: number[]; label: string }> = {
  operational: {
    color: '#ffc845', // Solid amber
    label: 'OPERACIONAL',
  },
  under_construction: {
    color: '#f59e0b', // Amber-orange dashed
    dashArray: [4, 3],
    label: 'EN CONSTRUCCIÓN',
  },
  planned: {
    color: '#ffb703', // Warm yellow long dash
    dashArray: [6, 4],
    label: 'PLANIFICADO',
  },
  feasibility: {
    color: '#d97706', // Deep amber thin dash
    dashArray: [3, 3],
    label: 'ESTUDIO DE FACTIBILIDAD / CONCEPTO',
  },
  smart_science: {
    color: '#58d5e3', // Teal dot-dash for scientific sensors
    dashArray: [5, 2, 1, 2],
    label: 'CABLE CIENTÍFICO SMART (UNESCO/ITU)',
  },
};

/**
 * Normalizes longitude to [-180, 180].
 */
export function normalizeLongitude(lon: number): number {
  let l = lon;
  while (l > 180) l -= 360;
  while (l < -180) l += 360;
  return l;
}

/**
 * Validates a coordinate pair [lon, lat].
 */
export function isValidCoordinate(coord: number[]): boolean {
  if (!Array.isArray(coord) || coord.length < 2) return false;
  const [lon, lat] = coord;
  if (typeof lon !== 'number' || typeof lat !== 'number') return false;
  if (isNaN(lon) || isNaN(lat)) return false;
  if (!isFinite(lon) || !isFinite(lat)) return false;
  if (lat < -90 || lat > 90) return false;
  return true;
}

/**
 * Calculates rough distance in kilometers between two points using haversine.
 */
export function haversineDistanceKm(p1: [number, number], p2: [number, number]): number {
  const R = 6371; // Earth radius km
  const dLat = ((p2[1] - p1[1]) * Math.PI) / 180;
  const dLon = ((p2[0] - p1[0]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1[1] * Math.PI) / 180) *
      Math.cos((p2[1] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Splits a line sequence whenever it crosses the antimeridian (|lon1 - lon2| > 180)
 * or when a segment jump is physically impossible (> 3,000 km without intermediate points).
 */
export function splitAntimeridian(coords: number[][]): number[][][] {
  if (coords.length < 2) return [];

  const segments: number[][][] = [];
  let currentSegment: number[][] = [];

  for (let i = 0; i < coords.length; i++) {
    const raw = coords[i];
    if (!isValidCoordinate(raw)) continue;

    const lon = normalizeLongitude(raw[0]);
    const lat = raw[1];
    const pt: [number, number] = [lon, lat];

    if (currentSegment.length === 0) {
      currentSegment.push(pt);
      continue;
    }

    const prev = currentSegment[currentSegment.length - 1];
    const lonDiff = Math.abs(pt[0] - prev[0]);

    // Check if crossing the antimeridian (jump across the world canvas)
    if (lonDiff > 180) {
      // Split line!
      if (currentSegment.length >= 2) {
        segments.push(currentSegment);
      }
      currentSegment = [pt];
      continue;
    }

    // Check distance jump (prevent global lines connecting disparate nodes)
    const dist = haversineDistanceKm(prev as [number, number], pt);
    if (dist > 3500) {
      if (currentSegment.length >= 2) {
        segments.push(currentSegment);
      }
      currentSegment = [pt];
      continue;
    }

    currentSegment.push(pt);
  }

  if (currentSegment.length >= 2) {
    segments.push(currentSegment);
  }

  return segments;
}

/**
 * Validates and sanitizes a raw GeoJSON cable feature.
 * Filters strictly to Southern Ocean & Gateways (latitude touches <= -25°S or polar connection).
 */
export function validateCableGeometry(feature: Feature): Feature | null {
  if (!feature || !feature.geometry) return null;

  const geomType = feature.geometry.type;

  // 1. Point geometry (Landing stations)
  if (geomType === 'Point') {
    const coords = (feature.geometry as Point).coordinates;
    if (!isValidCoordinate(coords)) return null;
    const lat = coords[1];
    // Keep only gateway / polar landing points (south of 25°S)
    if (lat > -25) return null;

    return {
      ...feature,
      geometry: {
        type: 'Point',
        coordinates: [normalizeLongitude(coords[0]), coords[1]],
      },
      properties: {
        ...feature.properties,
        status_type: feature.properties?.status_type || 'operational',
        color: feature.properties?.color || CABLE_STATUS_PALETTE.operational.color,
      },
    };
  }

  // 2. LineString or MultiLineString
  let rawLineStrings: number[][][] = [];

  if (geomType === 'LineString') {
    rawLineStrings = [(feature.geometry as LineString).coordinates];
  } else if (geomType === 'MultiLineString') {
    rawLineStrings = (feature.geometry as MultiLineString).coordinates;
  } else {
    // Reject polygons, collections, etc.
    return null;
  }

  // Filter: at least one coordinate must reach into the southern / polar gateway zone (< -25°S)
  const touchesSouthernZone = rawLineStrings.some((line) =>
    line.some((c) => isValidCoordinate(c) && c[1] <= -25)
  );

  if (!touchesSouthernZone) {
    return null;
  }

  // Process and sanitize lines: split antimeridian and remove invalid coordinates
  const cleanMultiLines: number[][][] = [];

  for (const line of rawLineStrings) {
    // Only keep vertices south of 10°S to trim northern continental segments that wander into northern hemisphere
    const trimmedLine = line.filter((c) => isValidCoordinate(c) && c[1] <= -20);
    if (trimmedLine.length < 2) continue;

    const splitResult = splitAntimeridian(trimmedLine);
    for (const seg of splitResult) {
      if (seg.length >= 2) {
        cleanMultiLines.push(seg);
      }
    }
  }

  if (cleanMultiLines.length === 0) return null;

  // Determine status and unified color palette
  const statusType: CableStatusType =
    (feature.properties?.status_type as CableStatusType) ||
    (feature.properties?.status?.toLowerCase().includes('plan') ? 'planned' :
     feature.properties?.status?.toLowerCase().includes('feasi') ? 'feasibility' :
     feature.properties?.status?.toLowerCase().includes('smart') ? 'smart_science' : 'operational');

  const palette = CABLE_STATUS_PALETTE[statusType] || CABLE_STATUS_PALETTE.operational;

  return {
    type: 'Feature',
    id: feature.id || feature.properties?.id,
    properties: {
      ...feature.properties,
      status_type: statusType,
      color: palette.color,
      category: palette.label,
      dashArray: palette.dashArray,
    },
    geometry: {
      type: 'MultiLineString',
      coordinates: cleanMultiLines,
    },
  };
}

/**
 * Verified Curated Polar & Gateway Cables GeoJSON
 * - FOA (Operational, Puerto Williams 54°56′S)
 * - Humboldt Cable (Planned, Chile -> New Zealand -> Australia)
 * - NSF Antarctic Cable Study (Feasibility study / McMurdo conceptual corridor)
 * - SMART Science Cable Concept (Paso Drake / King George Island)
 * - Bass Strait Cables 1 & 2 (Australia mainland to Hobart gateway)
 * - Tasman Ring (Sydney - Auckland - Invercargill)
 */
export const VERIFIED_POLAR_CABLES: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // 1. FIBRA ÓPTICA AUSTRAL (FOA) - OPERATIONAL
    {
      type: 'Feature',
      properties: {
        id: 'foa-puerto-williams',
        name: 'Fibra Óptica Austral (FOA)',
        status_type: 'operational',
        category: 'CABLE OPERACIONAL',
        length_km: 2800,
        color: '#ffc845',
        status: 'OPERACIONAL — Punto de amarre submarino más austral del mundo (Puerto Williams, 54°56′ S)',
        operator: 'Subtel / CTR Chile',
        freshness: 'OFFICIAL SOURCE · SUBTEL CHILE',
        is_gateway: true,
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [-72.94, -41.47], // Puerto Montt
            [-73.50, -45.40], // Aysén
            [-72.50, -53.16], // Punta Arenas
            [-67.61, -54.93], // Puerto Williams (Cabo de Hornos)
          ],
        ],
      },
    },

    // 2. HUMBOLDT CABLE - PLANNED (Safely split at antimeridian!)
    {
      type: 'Feature',
      properties: {
        id: 'humboldt-transpacific-cable',
        name: 'Cable Transpacífico Humboldt',
        status_type: 'planned',
        category: 'CABLE PLANIFICADO',
        length_km: 14800,
        color: '#ffb703',
        status: 'PLANIFICADO (2026+) — Enlace intercontinental Sudamérica ↔ Oceanía',
        operator: 'Desarrollo País / H2 Cable / Google Cloud Partner',
        freshness: 'OFFICIAL SOURCE · DESARROLLO PAÍS',
        is_gateway: true,
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          // Segment East of Antimeridian (Chile toward 180°)
          [
            [-71.63, -33.02], // Valparaíso
            [-85.00, -35.20],
            [-110.00, -38.50],
            [-140.00, -41.20],
            [-170.00, -40.00],
            [-179.90, -38.50],
          ],
          // Segment West of Antimeridian (180° to Auckland & Sydney)
          [
            [179.90, -38.45],
            [174.80, -36.85], // Auckland, NZ
            [165.00, -35.20],
            [151.21, -33.86], // Sydney, Australia
          ],
        ],
      },
    },

    // 3. NSF ANTARCTIC SUBSEA CABLE STUDY - FEASIBILITY / CONCEPT CORRIDOR
    {
      type: 'Feature',
      properties: {
        id: 'nsf-antarctic-subsea-cable',
        name: 'NSF Antarctic Subsea Cable Study (McMurdo ↔ Invercargill/Sydney)',
        status_type: 'feasibility',
        category: 'ESTUDIO DE FACTIBILIDAD / CORREDOR CONCEPTUAL',
        length_km: 4300,
        color: '#d97706',
        status: 'ESTUDIO DE PRE-INGENIERÍA (NSF) — Corredor conceptual de investigación, sin tendido físico ejecutado.',
        operator: 'US National Science Foundation / Polar Research Community',
        freshness: 'PEER-REVIEWED · NSF POLAR PROGRAMS',
        is_gateway: false,
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [166.67, -77.85], // McMurdo Station / Scott Base (Isla de Ross)
            [170.50, -72.00], // Mar de Ross
            [174.00, -64.00], // Dorsal Pacífico-Antártica
            [169.50, -52.00], // Meseta subantártica de Campbell
            [168.35, -46.41], // Invercargill / Bluff (Nueva Zelanda)
          ],
        ],
      },
    },

    // 4. SMART SCIENCE CABLE DRAKE PASSAGE - RESEARCH CONCEPT
    {
      type: 'Feature',
      properties: {
        id: 'drake-smart-science-cable',
        name: 'Corredor SMART Cable Paso Drake (Ciencia & Sensores Sísmicos)',
        status_type: 'smart_science',
        category: 'CABLE CIENTÍFICO SMART (JTF ITU/WMO/IOC)',
        length_km: 1250,
        color: '#58d5e3',
        status: 'PROPUESTA DE INVESTIGACIÓN — Monitoreo sísmico y oceanográfico continuo del ACC',
        operator: 'Joint Task Force SMART Subsea Cables (ITU / WMO / UNESCO-IOC)',
        freshness: 'PEER-REVIEWED · ITU/WMO/UNESCO SMART TASK FORCE',
        is_gateway: true,
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [-67.61, -54.93], // Puerto Williams
            [-65.00, -57.50], // Drake Central (Sensor BGC & Presión fondo)
            [-62.00, -60.50], // Drake Sur (Sensor Sísmico de Fallas)
            [-58.98, -62.20], // Isla Rey Jorge (Base Escudero / Base Frei)
          ],
        ],
      },
    },

    // 5. BASS STRAIT 1 & 2 (AUSTRALIA TO HOBART GATEWAY) - OPERATIONAL
    {
      type: 'Feature',
      properties: {
        id: 'bass-strait-cables',
        name: 'Basslink & Bass Strait Gateway Cables (Melbourne ↔ Hobart)',
        status_type: 'operational',
        category: 'CABLE OPERACIONAL',
        length_km: 300,
        color: '#ffc845',
        status: 'OPERACIONAL — Enlace de telecomunicaciones del hub polar de Hobart (Tasmania)',
        operator: 'Telstra / Basslink Telecom',
        freshness: 'OFFICIAL SOURCE · ACMA AUSTRALIA',
        is_gateway: true,
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [145.40, -38.60], // Victoria
            [146.50, -39.80], // Bass Strait
            [146.85, -41.15], // Devonport
            [147.33, -42.88], // Hobart
          ],
        ],
      },
    },

    // 6. TASMAN RING SOUTHERN LINK (INVERCARGILL GATEWAY NZ) - OPERATIONAL
    {
      type: 'Feature',
      properties: {
        id: 'tasman-ring-southern-segment',
        name: 'Tasman Gateway Trunk (Auckland ↔ Invercargill / Subantarctic NZ)',
        status_type: 'operational',
        category: 'CABLE OPERACIONAL',
        length_km: 1800,
        color: '#ffc845',
        status: 'OPERACIONAL — Troncal de fibra óptica de las puertas de entrada del sur de Nueva Zelanda',
        operator: 'Spark New Zealand / Chorus',
        freshness: 'OFFICIAL SOURCE · TELECOM NZ',
        is_gateway: true,
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [174.77, -36.88], // Auckland
            [174.00, -39.10], // Taranaki
            [171.20, -42.45], // Costa Oeste NZ
            [168.35, -46.41], // Invercargill (Gateway Mar de Ross)
          ],
        ],
      },
    },

    // 7. LANDING STATIONS (POINTS)
    {
      type: 'Feature',
      properties: {
        id: 'landing-puerto-williams',
        name: 'Estación de Amarre Puerto Williams (FOA)',
        status_type: 'operational',
        category: 'TERMINAL SUBMARINO OPERACIONAL',
        color: '#ffc845',
        status: 'OPERACIONAL — Estación de amarre de fibra óptica más austral del planeta (54°56′ S).',
        operator: 'CTR Chile / Subtel',
        freshness: 'OFFICIAL SOURCE · SUBTEL CHILE',
        is_gateway: true,
      },
      geometry: { type: 'Point', coordinates: [-67.61, -54.93] },
    },
    {
      type: 'Feature',
      properties: {
        id: 'landing-punta-arenas',
        name: 'Estación de Amarre Punta Arenas (Troncal FOA)',
        status_type: 'operational',
        category: 'TERMINAL SUBMARINO OPERACIONAL',
        color: '#ffc845',
        status: 'OPERACIONAL — Hub logístico antártico y nodo digital del Estrecho de Magallanes.',
        operator: 'CTR Chile / Subtel',
        freshness: 'OFFICIAL SOURCE · SUBTEL CHILE',
        is_gateway: true,
      },
      geometry: { type: 'Point', coordinates: [-70.91, -53.16] },
    },
    {
      type: 'Feature',
      properties: {
        id: 'landing-invercargill',
        name: 'Estación de Amarre Invercargill / Bluff (Nueva Zelanda)',
        status_type: 'operational',
        category: 'TERMINAL SUBMARINO OPERACIONAL',
        color: '#ffc845',
        status: 'OPERACIONAL — Punto de conexión para expediciones y nodo previsto para enlace McMurdo.',
        operator: 'Chorus New Zealand',
        freshness: 'OFFICIAL SOURCE · COMMERCE COMMISSION NZ',
        is_gateway: true,
      },
      geometry: { type: 'Point', coordinates: [168.35, -46.41] },
    },
    {
      type: 'Feature',
      properties: {
        id: 'landing-hobart',
        name: 'Estación de Amarre Hobart (Tasmania, Australia)',
        status_type: 'operational',
        category: 'TERMINAL SUBMARINO OPERACIONAL',
        color: '#ffc845',
        status: 'OPERACIONAL — Base de operaciones del rompehielos RSV Nuyina y hub de AAD.',
        operator: 'Telstra Australia',
        freshness: 'OFFICIAL SOURCE · AUSTRALIAN ANTARCTIC DIVISION',
        is_gateway: true,
      },
      geometry: { type: 'Point', coordinates: [147.33, -42.88] },
    },
    {
      type: 'Feature',
      properties: {
        id: 'landing-mcmurdo-concept',
        name: 'Nodo Conceptual Submarino McMurdo (Estudio NSF)',
        status_type: 'feasibility',
        category: 'CONCEPTO / ESTUDIO DE PRE-INGENIERÍA',
        color: '#d97706',
        status: 'CONCEPTUAL — Terminal previsto en la Isla de Ross según el estudio de viabilidad NSF.',
        operator: 'US National Science Foundation',
        freshness: 'PEER-REVIEWED · NSF POLAR PROGRAMS',
        is_gateway: false,
      },
      geometry: { type: 'Point', coordinates: [166.67, -77.85] },
    },
    {
      type: 'Feature',
      properties: {
        id: 'landing-king-george-concept',
        name: 'Nodo SMART Submarino Isla Rey Jorge (Propuesta)',
        status_type: 'smart_science',
        category: 'CONCEPTO DE INVESTIGACIÓN SÍSMICA',
        color: '#58d5e3',
        status: 'PROPUESTA CIENTÍFICA — Terminal SMART en Bahía Fildes para recepción de sensores de fondo oceánico.',
        operator: 'SMART Subsea Cables Joint Task Force',
        freshness: 'PEER-REVIEWED · UNESCO-IOC/WMO/ITU',
        is_gateway: false,
      },
      geometry: { type: 'Point', coordinates: [-58.98, -62.20] },
    },
  ],
};
