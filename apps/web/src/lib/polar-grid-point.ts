interface PolarGrid {
  upper_left_corner_m: [number, number];
  cell_m: number;
  width: number;
  height: number;
  columns: Record<string, (number | null)[]>;
}

let pending: Promise<PolarGrid> | undefined;
export async function polarBed(lat: number, lon: number) {
  if (lat > -50 || lat < -90) return null;
  pending ??= fetch(`${import.meta.env.BASE_URL}data/science/ku_geophysics_3d.json`)
    .then(async response => {
      if (!response.ok) throw new Error('grid');
      const grid: PolarGrid = await response.json();
      if (!grid.columns?.bed_m || grid.columns.bed_m.length !== grid.width * grid.height) throw new Error('grid');
      return grid;
    }).catch(error => { pending = undefined; throw error; });
  const grid = await pending;
  // WGS84 Antarctic Polar Stereographic, standard parallel 71°S (EPSG:3031).
  const e = Math.sqrt(0.0066943799901413165);
  const rad = Math.PI / 180;
  const t = (angle: number) => Math.tan(Math.PI / 4 - angle / 2)
    / (((1 - e * Math.sin(angle)) / (1 + e * Math.sin(angle))) ** (e / 2));
  const standard = 71 * rad;
  const radius = 6378137 * Math.cos(standard) / Math.sqrt(1 - (e * Math.sin(standard)) ** 2)
    * t(-lat * rad) / t(standard);
  const col = Math.floor((radius * Math.sin(lon * rad) - grid.upper_left_corner_m[0]) / grid.cell_m);
  const row = Math.floor((grid.upper_left_corner_m[1] - radius * Math.cos(lon * rad)) / grid.cell_m);
  if (col < 0 || row < 0 || col >= grid.width || row >= grid.height) return null;
  const bed = grid.columns.bed_m[row * grid.width + col];
  return bed != null && Number.isFinite(bed) ? { bed, km: grid.cell_m / 1000 } : null;
}
