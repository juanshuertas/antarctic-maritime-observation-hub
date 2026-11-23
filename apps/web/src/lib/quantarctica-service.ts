/**
 * AMOH Quantarctica 3 Catalog & Field Package Service
 * Rule 31-40: 10 themes, EPSG:3031 handling, offline science package generator.
 */

export interface QuantarcticaTheme {
  id: string;
  name: string;
  description: string;
  layerCount: number;
  sizeMb: number;
  icon: string;
  crs: string;
}

export const QUANTARCTICA_THEMES: QuantarcticaTheme[] = [
  { id: 'basemap', name: 'Basemap & Boundaries', description: 'SCAR Coastlines, grounding lines, ice shelf fronts, territorial claim reference lines', layerCount: 14, sizeMb: 240, icon: '🗺️', crs: 'EPSG:3031' },
  { id: 'terrain', name: 'Terrain & Bathymetry', description: 'Bedmap2, REMA 8m/100m, IBCSO v2 ocean bathymetry', layerCount: 18, sizeMb: 1800, icon: '🏔️', crs: 'EPSG:3031' },
  { id: 'satellite', name: 'Satellite Mosaics', description: 'Landsat 8 LIMA, MODIS MOA 2009/2014, Sentinel-1 SAR backscatter', layerCount: 12, sizeMb: 2400, icon: '🛰️', crs: 'EPSG:3031' },
  { id: 'glaciology', name: 'Glaciology & Ice Velocity', description: 'MEaSUREs ice velocity vectors, flow lines, blue ice areas', layerCount: 22, sizeMb: 950, icon: '🧊', crs: 'EPSG:3031' },
  { id: 'atmosphere', name: 'Atmosphere & Climate', description: 'RACMO2 surface mass balance, wind regimes, mean annual temperature', layerCount: 16, sizeMb: 380, icon: '💨', crs: 'EPSG:3031' },
  { id: 'biology', name: 'Biology & Ecology', description: 'Penguin colonies (MAPPPD), seal haul-outs, vegetation index (NDVI)', layerCount: 15, sizeMb: 120, icon: '🐧', crs: 'EPSG:3031' },
  { id: 'environmental', name: 'Environmental Management', description: 'ASPA / ASMA protected areas, Historic Sites and Monuments (HSM)', layerCount: 8, sizeMb: 45, icon: '🛡️', crs: 'EPSG:3031' },
  { id: 'geology', name: 'Geology & Geomorphology', description: 'SCAR GeoMAP outcrops, exposed rock, moraines, volcanic centers', layerCount: 11, sizeMb: 520, icon: '🪨', crs: 'EPSG:3031' },
  { id: 'geophysics', name: 'Geophysics & Magnetics', description: 'ADMAP-2 aeromagnetic anomalies, Bouguer gravity, geothermal heat flux', layerCount: 9, sizeMb: 610, icon: '🧲', crs: 'EPSG:3031' },
  { id: 'ice_cores', name: 'Ice Cores & Deep Drilling', description: 'EPICA Dome C, Vostok, WAIS Divide paleoclimate borehole locations', layerCount: 6, sizeMb: 35, icon: '🧪', crs: 'EPSG:3031' },
];

/**
 * Coordinate Reprojection Formula: Polar Stereographic (EPSG:3031) -> WGS84 (EPSG:4326)
 * Standard parallel: 71°S, True scale at 71°S
 */
export function epsg3031To4326(x: number, y: number): [number, number] {
  const a = 6378137.0; // WGS84 semi-major axis
  const e = 0.081819190842622; // eccentricity
  const phi_c = (-71.0 * Math.PI) / 180.0; // standard parallel (-71 deg)
  
  const rho = Math.sqrt(x * x + y * y);
  if (rho === 0) return [0, -90]; // South Pole

  const t_c = Math.tan(Math.PI / 4.0 + phi_c / 2.0) / Math.pow((1.0 - e * Math.sin(phi_c)) / (1.0 + e * Math.sin(phi_c)), e / 2.0);
  const m_c = Math.cos(phi_c) / Math.sqrt(1.0 - e * e * Math.sin(phi_c) * Math.sin(phi_c));
  const t = (rho * t_c) / (a * m_c);

  // Iterative latitude solver
  let phi = Math.PI / 2.0 - 2.0 * Math.atan(t);
  for (let i = 0; i < 5; i++) {
    const sinPhi = Math.sin(phi);
    const con = e * sinPhi;
    const dPhi = Math.PI / 2.0 - 2.0 * Math.atan(t * Math.pow((1.0 - con) / (1.0 + con), e / 2.0)) - phi;
    phi += dPhi;
    if (Math.abs(dPhi) < 1e-9) break;
  }

  const lon = (Math.atan2(x, -y) * 180.0) / Math.PI;
  const lat = (phi * 180.0) / Math.PI;

  return [lon, lat];
}

export interface FieldPackageManifest {
  expeditionName: string;
  targetRegion: string;
  selectedThemes: string[];
  totalEstimatedMb: number;
  generatedAt: string;
  duckdbCompatible: boolean;
}

export function buildFieldPackageManifest(
  expeditionName: string,
  targetRegion: string,
  themeIds: string[]
): FieldPackageManifest {
  const totalMb = QUANTARCTICA_THEMES
    .filter((t) => themeIds.includes(t.id))
    .reduce((sum, t) => sum + t.sizeMb, 0);

  return {
    expeditionName,
    targetRegion,
    selectedThemes: themeIds,
    totalEstimatedMb: totalMb,
    generatedAt: new Date().toISOString(),
    duckdbCompatible: true,
  };
}
