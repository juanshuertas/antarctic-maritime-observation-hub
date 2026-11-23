/**
 * AMOH V9 — Antarctic Master Bounding Box & 18 Circumpolar Sectors
 * Whole-continent coverage definition:
 * LAT: -90°S to -45°S
 * LON: -180° to +180° (full circumpolar)
 */

export const ANTARCTIC_MASTER_BBOX = {
  lon_min: -180,
  lat_min: -90,
  lon_max: 180,
  lat_max: -45,
} as const;

export const ANTARCTIC_MASTER_BBOX_ARRAY: [number, number, number, number] = [-180, -90, 180, -45];

export const ANTARCTIC_ZONES = {
  A: { id: 'A', name: 'Antarctic Core', lat_min: -90, lat_max: -60, desc: 'Continente completo y plataformas de hielo' },
  B: { id: 'B', name: 'Southern Ocean', lat_min: -60, lat_max: -45, desc: 'Océano Austral y convergencia antártica' },
  C: { id: 'C', name: 'Gateway Context', lat_min: -55, lat_max: -25, desc: 'Puertas de entrada y sub-antártico' },
} as const;

export interface AntarcticSector {
  id: number;
  slug: string;
  name: string;
  lat_min: number;
  lat_max: number;
  lon_min: number;
  lon_max: number;
  zone: 'A' | 'B' | 'C';
  targetSpecies: string[];
  scientificPriority: 'CRITICAL' | 'HIGH' | 'CORE';
}

export const ANTARCTIC_SECTORS: AntarcticSector[] = [
  {
    id: 1,
    slug: 'peninsula-drake',
    name: 'Antarctic Peninsula / Drake Passage',
    lat_min: -68,
    lat_max: -55,
    lon_min: -75,
    lon_max: -50,
    zone: 'A',
    targetSpecies: ['Euphausia superba', 'Megaptera novaeangliae', 'Pygoscelis papua'],
    scientificPriority: 'CRITICAL',
  },
  {
    id: 2,
    slug: 'weddell-sea',
    name: 'Weddell Sea',
    lat_min: -80,
    lat_max: -60,
    lon_min: -60,
    lon_max: -10,
    zone: 'A',
    targetSpecies: ['Leptonychotes weddellii', 'Dissostichus mawsoni'],
    scientificPriority: 'CRITICAL',
  },
  {
    id: 3,
    slug: 'ronne-filchner',
    name: 'Ronne-Filchner Ice Shelf',
    lat_min: -85,
    lat_max: -75,
    lon_min: -85,
    lon_max: -30,
    zone: 'A',
    targetSpecies: ['Sub-ice cavity fauna', 'Microbiota'],
    scientificPriority: 'HIGH',
  },
  {
    id: 4,
    slug: 'ross-sea-mcmurdo',
    name: 'Ross Sea / McMurdo Sound (MPA)',
    lat_min: -85,
    lat_max: -68,
    lon_min: 160,
    lon_max: -150,
    zone: 'A',
    targetSpecies: ['Pygoscelis adeliae', 'Dissostichus mawsoni', 'Balaenoptera bonaerensis'],
    scientificPriority: 'CRITICAL',
  },
  {
    id: 5,
    slug: 'amundsen-thwaites',
    name: 'Amundsen Sea / Thwaites Glacier',
    lat_min: -78,
    lat_max: -68,
    lon_min: -130,
    lon_max: -100,
    zone: 'A',
    targetSpecies: ['Sub-ice bathymetry', 'Phytoplankton blooms'],
    scientificPriority: 'CRITICAL',
  },
  {
    id: 6,
    slug: 'bellingshausen-sea',
    name: 'Bellingshausen Sea',
    lat_min: -75,
    lat_max: -65,
    lon_min: -100,
    lon_max: -70,
    zone: 'A',
    targetSpecies: ['Euphausia superba', 'Lobodon carcinophaga'],
    scientificPriority: 'HIGH',
  },
  {
    id: 7,
    slug: 'scotia-south-georgia',
    name: 'Scotia Sea / South Georgia',
    lat_min: -60,
    lat_max: -50,
    lon_min: -50,
    lon_max: -25,
    zone: 'A',
    targetSpecies: ['Euphausia superba', 'Dissostichus eleginoides', 'Diomedea exulans'],
    scientificPriority: 'CRITICAL',
  },
  {
    id: 8,
    slug: 'east-antarctica',
    name: 'East Antarctica (Prydz / Amery)',
    lat_min: -75,
    lat_max: -60,
    lon_min: 60,
    lon_max: 140,
    zone: 'A',
    targetSpecies: ['Aptenodytes forsteri', 'Euphausia crystallorophias'],
    scientificPriority: 'HIGH',
  },
  {
    id: 9,
    slug: 'queen-maud-land',
    name: 'Queen Maud Land (Dronning Maud Land)',
    lat_min: -78,
    lat_max: -65,
    lon_min: -20,
    lon_max: 45,
    zone: 'A',
    targetSpecies: ['Pagodroma nivea', 'Inland ice cores'],
    scientificPriority: 'HIGH',
  },
  {
    id: 10,
    slug: 'wilkes-land',
    name: 'Wilkes Land / Casey Sector',
    lat_min: -75,
    lat_max: -62,
    lon_min: 100,
    lon_max: 142,
    zone: 'A',
    targetSpecies: ['Totten glacier run-off', 'Oceanographic CTD'],
    scientificPriority: 'HIGH',
  },
  {
    id: 11,
    slug: 'terre-adelie',
    name: 'Terre Adélie / Cape Denison',
    lat_min: -70,
    lat_max: -65,
    lon_min: 136,
    lon_max: 142,
    zone: 'A',
    targetSpecies: ['Pygoscelis adeliae', 'Katabatic wind extremes'],
    scientificPriority: 'CORE',
  },
  {
    id: 12,
    slug: 'polar-plateau',
    name: 'Polar Plateau / Dome C / South Pole',
    lat_min: -90,
    lat_max: -80,
    lon_min: -180,
    lon_max: 180,
    zone: 'A',
    targetSpecies: ['Atmospheric chemistry', 'Astrophysics', 'Deep ice drilling'],
    scientificPriority: 'CORE',
  },
  {
    id: 13,
    slug: 'south-indian-ocean',
    name: 'South Indian Ocean Sector',
    lat_min: -60,
    lat_max: -45,
    lon_min: 45,
    lon_max: 100,
    zone: 'B',
    targetSpecies: ['Argo float arrays', 'ACC Polar Front'],
    scientificPriority: 'HIGH',
  },
  {
    id: 14,
    slug: 'south-atlantic-ocean',
    name: 'South Atlantic Ocean Sector',
    lat_min: -60,
    lat_max: -45,
    lon_min: -30,
    lon_max: 20,
    zone: 'B',
    targetSpecies: ['Sub-Antarctic cetaceans', 'Longline fisheries'],
    scientificPriority: 'HIGH',
  },
  {
    id: 15,
    slug: 'south-pacific-ocean',
    name: 'South Pacific Ocean Sector',
    lat_min: -60,
    lat_max: -45,
    lon_min: -180,
    lon_max: -120,
    zone: 'B',
    targetSpecies: ['Deep pelagic biodiversity', 'Ocean swells'],
    scientificPriority: 'HIGH',
  },
  {
    id: 16,
    slug: 'bouvet-island',
    name: 'Bouvet Island Sector',
    lat_min: -55,
    lat_max: -53,
    lon_min: 2,
    lon_max: 4,
    zone: 'C',
    targetSpecies: ['Arctocephalus gazella', 'Volcanic geology'],
    scientificPriority: 'CORE',
  },
  {
    id: 17,
    slug: 'kerguelen-plateau',
    name: 'Kerguelen Plateau',
    lat_min: -54,
    lat_max: -46,
    lon_min: 65,
    lon_max: 75,
    zone: 'C',
    targetSpecies: ['Natural iron fertilization', 'Dissostichus eleginoides'],
    scientificPriority: 'HIGH',
  },
  {
    id: 18,
    slug: 'macquarie-island',
    name: 'Macquarie Island',
    lat_min: -55,
    lat_max: -53,
    lon_min: 158,
    lon_max: 160,
    zone: 'C',
    targetSpecies: ['Eudyptes schlegeli', 'Mantle exposure geology'],
    scientificPriority: 'CORE',
  },
];

/**
 * Returns true if a point (lat, lon) is within the AMOH master Antarctic domain
 */
export function isWithinAntarcticDomain(lat: number, lon: number): boolean {
  return lat <= -45 && lat >= -90 && lon >= -180 && lon <= 180;
}

/**
 * Matches coordinates to one of the 18 Antarctic sectors
 */
export function getSectorForCoordinates(lat: number, lon: number): AntarcticSector | null {
  for (const sector of ANTARCTIC_SECTORS) {
    if (lat >= sector.lat_min && lat <= sector.lat_max) {
      if (sector.lon_min <= sector.lon_max) {
        if (lon >= sector.lon_min && lon <= sector.lon_max) return sector;
      } else {
        // Wraps around anti-meridian (e.g. Ross Sea 160°E to -150°W)
        if (lon >= sector.lon_min || lon <= sector.lon_max) return sector;
      }
    }
  }
  return null;
}
