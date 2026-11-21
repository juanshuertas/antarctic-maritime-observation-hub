/**
 * PB124 official itinerary reference.
 *
 * Sequence/dates follow Peace Boat's published 124th Global Voyage itinerary.
 * Coordinates are approximate city/port centroids for visualization only.
 * They are NEVER an observed vessel track and must not be treated as GNSS truth.
 */

export type PB124Waypoint = {
  id: string;
  index: number;
  name: string;
  country: string;
  dateLabel: string;
  coordinates: [number, number]; // [lng, lat]
};

export type PB124Zone = {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  startWaypointIndex: number;
  endWaypointIndex: number;
  scheduleStart: string;
  scheduleEnd: string;
  marker: [number, number];
  alertTitle: string;
  alertDetail: string;
  accent: 'cyan' | 'amber' | 'green';
};

export const PB124_OFFICIAL_REFERENCE_URL =
  'https://peaceboat.org/english/voyage/124th-global-voyage';

export const PB124_WAYPOINTS: PB124Waypoint[] = [
  { id: 'yokohama-depart', index: 0, name: 'Yokohama', country: 'Japan', dateLabel: 'Aug 20, 2026', coordinates: [139.6380, 35.4437] },
  { id: 'kobe-depart', index: 1, name: 'Kobe', country: 'Japan', dateLabel: 'Aug 21, 2026', coordinates: [135.1955, 34.6901] },
  { id: 'hong-kong', index: 2, name: 'Hong Kong', country: 'China', dateLabel: 'Aug 25, 2026', coordinates: [114.1694, 22.3193] },
  { id: 'singapore', index: 3, name: 'Singapore', country: 'Singapore', dateLabel: 'Aug 29–30, 2026', coordinates: [103.8198, 1.3521] },
  { id: 'port-louis', index: 4, name: 'Port Louis', country: 'Mauritius', dateLabel: 'Sep 8, 2026', coordinates: [57.5012, -20.1609] },
  { id: 'gqeberha', index: 5, name: 'Port Elizabeth / Gqeberha', country: 'South Africa', dateLabel: 'Sep 14–25, 2026', coordinates: [25.6022, -33.9608] },
  { id: 'cape-town', index: 6, name: 'Cape Town', country: 'South Africa', dateLabel: 'Sep 17, 2026', coordinates: [18.4241, -33.9249] },
  { id: 'tenerife', index: 7, name: 'Tenerife', country: 'Spain', dateLabel: 'Sep 30, 2026', coordinates: [-16.2518, 28.4636] },
  { id: 'porto', index: 8, name: 'Porto', country: 'Portugal', dateLabel: 'Oct 3, 2026', coordinates: [-8.6291, 41.1579] },
  { id: 'liverpool', index: 9, name: 'Liverpool', country: 'United Kingdom', dateLabel: 'Oct 6, 2026', coordinates: [-2.9916, 53.4084] },
  { id: 'belfast', index: 10, name: 'Belfast', country: 'Northern Ireland (UK)', dateLabel: 'Oct 7, 2026', coordinates: [-5.9301, 54.5973] },
  { id: 'reykjavik', index: 11, name: 'Reykjavik', country: 'Iceland', dateLabel: 'Oct 11, 2026', coordinates: [-21.9426, 64.1466] },
  { id: 'new-york', index: 12, name: 'New York', country: 'United States', dateLabel: 'Oct 18–19, 2026', coordinates: [-74.0060, 40.7128] },
  { id: 'cristobal', index: 13, name: 'Cristobal', country: 'Panama', dateLabel: 'Oct 25–26, 2026', coordinates: [-79.9000, 9.3550] },
  { id: 'callao', index: 14, name: 'Callao', country: 'Peru', dateLabel: 'Oct 30–Nov 2, 2026', coordinates: [-77.1181, -12.0566] },
  { id: 'rapa-nui', index: 15, name: 'Rapa Nui (Easter Island)', country: 'Chile', dateLabel: 'Nov 8, 2026', coordinates: [-109.3497, -27.1127] },
  { id: 'papeete', index: 16, name: 'Papeete', country: 'Tahiti', dateLabel: 'Nov 17, 2026', coordinates: [-149.5585, -17.5516] },
  { id: 'honolulu', index: 17, name: 'Honolulu', country: 'United States', dateLabel: 'Nov 24–25, 2026', coordinates: [-157.8583, 21.3069] },
  { id: 'yokohama-return', index: 18, name: 'Yokohama', country: 'Japan', dateLabel: 'Dec 6, 2026', coordinates: [139.6380, 35.4437] },
  { id: 'kobe-return', index: 19, name: 'Kobe', country: 'Japan', dateLabel: 'Dec 7, 2026', coordinates: [135.1955, 34.6901] },
];

export const PB124_ZONES: PB124Zone[] = [
  {
    id: 'zone-01',
    code: '01',
    title: 'East Asia Departure Corridor',
    subtitle: 'Japan → Hong Kong → Singapore',
    startWaypointIndex: 0,
    endWaypointIndex: 3,
    scheduleStart: '2026-08-20',
    scheduleEnd: '2026-08-30',
    marker: [121.8, 17.0],
    alertTitle: 'COASTAL TRANSITION',
    alertDetail: 'Good first-reference window · check horizon / departure context.',
    accent: 'amber',
  },
  {
    id: 'zone-02',
    code: '02',
    title: 'Indian Ocean Open-Water Transition',
    subtitle: 'Singapore → Mauritius → South Africa',
    startWaypointIndex: 3,
    endWaypointIndex: 5,
    scheduleStart: '2026-08-29',
    scheduleEnd: '2026-09-25',
    marker: [64.0, -15.0],
    alertTitle: 'OPEN-OCEAN REFERENCE',
    alertDetail: 'Watch for temporal/spatial gaps and missing sea-surface reference.',
    accent: 'amber',
  },
  {
    id: 'zone-03',
    code: '03',
    title: 'Southern Africa Coastal Window',
    subtitle: 'Gqeberha → Cape Town',
    startWaypointIndex: 5,
    endWaypointIndex: 6,
    scheduleStart: '2026-09-14',
    scheduleEnd: '2026-09-18',
    marker: [22.0, -34.2],
    alertTitle: 'CONTEXT CHANGE',
    alertDetail: 'Coastal / offshore transition · visibility variation opportunity.',
    accent: 'cyan',
  },
  {
    id: 'zone-04',
    code: '04',
    title: 'Atlantic Crossing South to North',
    subtitle: 'Cape Town → Tenerife → Porto',
    startWaypointIndex: 6,
    endWaypointIndex: 8,
    scheduleStart: '2026-09-17',
    scheduleEnd: '2026-10-03',
    marker: [-2.0, 10.0],
    alertTitle: 'LONG SPATIAL GAP',
    alertDetail: 'Open-sea horizon and well-spaced visual reference are high-value here.',
    accent: 'amber',
  },
  {
    id: 'zone-05',
    code: '05',
    title: 'North Atlantic European Leg',
    subtitle: 'Porto → Liverpool → Belfast → Reykjavik',
    startWaypointIndex: 8,
    endWaypointIndex: 11,
    scheduleStart: '2026-10-03',
    scheduleEnd: '2026-10-11',
    marker: [-10.0, 53.0],
    alertTitle: 'WEATHER / VISIBILITY WINDOW',
    alertDetail: 'Prioritize a reference only when conditions change meaningfully.',
    accent: 'cyan',
  },
  {
    id: 'zone-06',
    code: '06',
    title: 'North Atlantic Open-Water Leg',
    subtitle: 'Reykjavik → New York',
    startWaypointIndex: 11,
    endWaypointIndex: 12,
    scheduleStart: '2026-10-11',
    scheduleEnd: '2026-10-19',
    marker: [-47.0, 53.0],
    alertTitle: 'TEMPORAL GAP',
    alertDetail: 'Sea-state / horizon update if the previous good record is >60–90 min old.',
    accent: 'amber',
  },
  {
    id: 'zone-07',
    code: '07',
    title: 'Western Atlantic to Panama Transition',
    subtitle: 'New York → Cristobal',
    startWaypointIndex: 12,
    endWaypointIndex: 13,
    scheduleStart: '2026-10-18',
    scheduleEnd: '2026-10-26',
    marker: [-76.0, 25.0],
    alertTitle: 'PORT / COASTAL TRANSITION',
    alertDetail: 'Capture only if the environmental context changes enough to add method value.',
    accent: 'cyan',
  },
  {
    id: 'zone-08',
    code: '08',
    title: 'Southeast Pacific Long Transit',
    subtitle: 'Cristobal → Callao → Rapa Nui',
    startWaypointIndex: 13,
    endWaypointIndex: 15,
    scheduleStart: '2026-10-25',
    scheduleEnd: '2026-11-08',
    marker: [-93.0, -8.0],
    alertTitle: 'PRIMARY OPEN-OCEAN WINDOW',
    alertDetail: 'Spatial gap + guided Horizon / Sea Surface / Context set can be high-value.',
    accent: 'amber',
  },
  {
    id: 'zone-09',
    code: '09',
    title: 'Polynesia Context Transition',
    subtitle: 'Rapa Nui → Papeete',
    startWaypointIndex: 15,
    endWaypointIndex: 16,
    scheduleStart: '2026-11-08',
    scheduleEnd: '2026-11-17',
    marker: [-130.0, -22.0],
    alertTitle: 'CONTEXT UPDATE',
    alertDetail: 'Visibility, surface appearance or context change may justify a new observation.',
    accent: 'cyan',
  },
  {
    id: 'zone-10',
    code: '10',
    title: 'Central Pacific Return Leg',
    subtitle: 'Papeete → Honolulu → Japan',
    startWaypointIndex: 16,
    endWaypointIndex: 19,
    scheduleStart: '2026-11-17',
    scheduleEnd: '2026-12-07',
    marker: [-170.0, 27.0],
    alertTitle: 'FINAL COVERAGE CHECK',
    alertDetail: 'Confirm the 3–5 observation target; additional capture is optional.',
    accent: 'green',
  },
];

export function getPB124ScheduleZone(date = new Date()): PB124Zone | null {
  const day = date.toISOString().slice(0, 10);
  const matches = PB124_ZONES.filter((z) => day >= z.scheduleStart && day <= z.scheduleEnd);
  if (!matches.length) return null;
  return matches[matches.length - 1];
}

export function getPB124ZoneById(id: string): PB124Zone | undefined {
  return PB124_ZONES.find((z) => z.id === id);
}
