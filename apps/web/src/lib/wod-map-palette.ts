/**
 * AMOH — map layer palette.
 * Adapted from OSIRIS (src/lib/map-palette.ts): same CSS-custom-property
 * resolution technique (parses colours the CSS build may have rewritten to
 * a keyword), retargeted from satellites/CCTV to AMOH's maritime domain
 * (AIS tiers, mirofish anomalies, Quantarctica cartographic layers).
 */
export interface MapPalette {
  aisTier1: string;
  aisAnomaly: string;
  fieldTier2: string;
  fieldTier3: string;
  fieldTier4: string;
  cartography: string;
  bathymetry: string;
  aspa: string;
}

export type MapPaletteKey = keyof MapPalette;

/** Custom property backing each entry. Must match the tokens in index.css. */
export const MAP_VARS: Record<MapPaletteKey, string> = {
  aisTier1: '--wod-accent-cyan',
  aisAnomaly: '--wod-status-alert',
  fieldTier2: '--wod-accent-cyan',
  fieldTier3: '--wod-status-warn',
  fieldTier4: '--wod-border-grid',
  cartography: '--wod-border-grid',
  bathymetry: '--wod-bg-surface',
  aspa: '--wod-status-warn',
};

/** WOD 2025 defaults, used until the stylesheet resolves or as a fallback. */
export const MAP_DEFAULTS: MapPalette = {
  aisTier1: '#00D2FF',
  aisAnomaly: '#EF4444',
  fieldTier2: '#00D2FF',
  fieldTier3: '#F59E0B',
  fieldTier4: '#64748B',
  cartography: '#64748B',
  bathymetry: '#0F172A',
  aspa: '#F59E0B',
};

export const MAP_PALETTE_KEYS = Object.keys(MAP_DEFAULTS) as MapPaletteKey[];

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Expand shorthand and lowercase, so two spellings of a colour compare equal. */
function canonical(hex: string): string {
  const h = hex.slice(1).toLowerCase();
  return '#' + (h.length === 3 ? h.split('').map(c => c + c).join('') : h);
}

/**
 * Resolve a colour the CSS build may have rewritten (e.g. minified hex to a
 * keyword). A 2d canvas context is the browser's own colour parser; assigning
 * a colour and reading it back yields `#rrggbb`. Two seeds and an agreement
 * check reject values the parser doesn't understand rather than reporting a
 * stale seed as if it were valid.
 */
let probe: CanvasRenderingContext2D | null | undefined;
function parseColorValue(value: string): string | null {
  if (probe === undefined) {
    probe = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');
  }
  if (!probe) return null;
  probe.fillStyle = '#000000';
  probe.fillStyle = value;
  const a = probe.fillStyle;
  probe.fillStyle = '#ffffff';
  probe.fillStyle = value;
  const b = probe.fillStyle;
  return a === b && typeof a === 'string' && HEX.test(a) ? canonical(a) : null;
}

/** Read the palette out of a resolved-style lookup, e.g. `getComputedStyle`. */
export function readMapPalette(lookup: (varName: string) => string): MapPalette {
  const out = {} as MapPalette;
  for (const key of MAP_PALETTE_KEYS) {
    const raw = (lookup(MAP_VARS[key]) || '').trim();
    out[key] = (HEX.test(raw) ? canonical(raw) : parseColorValue(raw)) ?? MAP_DEFAULTS[key];
  }
  return out;
}
