/**
 * AMOH Professional SVG Map Icon Atlas - V8.5
 * Registers crisp vector silhouettes into MapLibre GL for polar cartography.
 *
 * Strict Invariant: No generic dots. No emojis. Professional silhouettes with consistent line weights.
 * Features dedicated Antarctic Krill Identity (Euphausia superba with photophore dot accents),
 * Research vessels, Icebreakers, Hydrophones, AWS Weather stations, Profiling Argo, Luxury Camps, Boreholes.
 */

import type { Map as MlMap } from 'maplibre-gl';

export interface IconDefinition {
  id: string;
  svg: string;
  width: number;
  height: number;
}

export const AMOH_SVG_ICONS: Record<string, string> = {
  // 1. Vessel (Generic / Base): Crisp ship silhouette pointing upwards (heading = 0° is North)
  'icon-vessel': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M16 2 L22 10 L21 26 L16 29 L11 26 L10 10 Z" fill="#35c3c8" stroke="#05141d" stroke-width="1.5" stroke-linejoin="round"/>
      <rect x="13.5" y="12" width="5" height="7" rx="1" fill="#072230" stroke="#35c3c8" stroke-width="0.8"/>
      <circle cx="16" cy="8" r="1.5" fill="#caf9f7"/>
    </svg>
  `,

  // 1b. Research Vessel (Oceanographic / Polar Survey)
  'icon-vessel-research': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M16 2 L22 10 L21 26 L16 29 L11 26 L10 10 Z" fill="#00e5ff" stroke="#041926" stroke-width="1.5" stroke-linejoin="round"/>
      <rect x="13" y="13" width="6" height="8" rx="1" fill="#062233" stroke="#00e5ff" stroke-width="0.8"/>
      <circle cx="16" cy="7" r="1.8" fill="#ffd600"/>
      <line x1="16" y1="1" x2="16" y2="4" stroke="#00e5ff" stroke-width="1.5"/>
    </svg>
  `,

  // 1c. Polar Icebreaker (Heavy reinforced hull & crane)
  'icon-vessel-icebreaker': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M16 2 L24 9 L22 26 L16 30 L10 26 L8 9 Z" fill="#ff9100" stroke="#261002" stroke-width="1.8" stroke-linejoin="round"/>
      <rect x="12" y="11" width="8" height="9" rx="1" fill="#1c0c02" stroke="#ffd600" stroke-width="1"/>
      <polygon points="16,4 18,8 14,8" fill="#ffffff"/>
      <line x1="16" y1="21" x2="16" y2="27" stroke="#ffffff" stroke-width="1.2"/>
    </svg>
  `,

  // 1d. Luxury Expedition Vessel (Yacht / White Desert / Ultima cruise)
  'icon-vessel-luxury': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M16 2 L22 10 L20 27 L16 29 L12 27 L10 10 Z" fill="#ffd700" stroke="#261c02" stroke-width="1.5" stroke-linejoin="round"/>
      <polygon points="16,8 20,16 12,16" fill="#0b1720" stroke="#ffd700" stroke-width="0.8"/>
      <circle cx="16" cy="20" r="1.5" fill="#ffffff"/>
    </svg>
  `,

  // 2. Aircraft: Fixed-wing aircraft silhouette pointing North
  'icon-aircraft': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M16 2 L18 10 L28 17 L28 19 L18 16 L18 24 L22 27 L22 29 L16 27 L10 29 L10 27 L14 24 L14 16 L4 19 L4 17 L14 10 Z" fill="#4da8ff" stroke="#071b2b" stroke-width="1.2" stroke-linejoin="round"/>
    </svg>
  `,

  // 2b. Ski-Equipped Twin Otter / Basler BT-67 (Antarctic logistics aircraft)
  'icon-plane-ski': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M16 2 L18 10 L29 17 L29 19 L18 16 L18 24 L22 27 L22 29 L16 27 L10 29 L10 27 L14 24 L14 16 L3 19 L3 17 L14 10 Z" fill="#58d5e3" stroke="#071b2b" stroke-width="1.2" stroke-linejoin="round"/>
      <!-- Skis on landing gear -->
      <line x1="10" y1="18" x2="10" y2="23" stroke="#ffd600" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="22" y1="18" x2="22" y2="23" stroke="#ffd600" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `,

  // 2c. Polar Helicopter (Bell 212 / AS350 for ship-to-shore transfers)
  'icon-helicopter': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <line x1="4" y1="9" x2="28" y2="9" stroke="#58d5e3" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="16" cy="9" r="2" fill="#caf9f7"/>
      <ellipse cx="16" cy="17" rx="6" ry="4" fill="#4da8ff" stroke="#071b2b" stroke-width="1.2"/>
      <line x1="16" y1="17" x2="27" y2="22" stroke="#4da8ff" stroke-width="1.8"/>
      <line x1="27" y1="19" x2="27" y2="25" stroke="#58d5e3" stroke-width="1.5"/>
    </svg>
  `,

  // 3. Satellite: Earth observation satellite with solar arrays
  'icon-satellite': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <rect x="12" y="11" width="8" height="10" rx="1.5" fill="#a995ff" stroke="#0f1124" stroke-width="1.2"/>
      <rect x="2" y="13" width="9" height="6" rx="1" fill="#7a62e0" stroke="#a995ff" stroke-width="0.8"/>
      <line x1="5" y1="13" x2="5" y2="19" stroke="#0f1124" stroke-width="0.8"/>
      <line x1="8" y1="13" x2="8" y2="19" stroke="#0f1124" stroke-width="0.8"/>
      <rect x="21" y="13" width="9" height="6" rx="1" fill="#7a62e0" stroke="#a995ff" stroke-width="0.8"/>
      <line x1="24" y1="13" x2="24" y2="19" stroke="#0f1124" stroke-width="0.8"/>
      <line x1="27" y1="13" x2="27" y2="19" stroke="#0f1124" stroke-width="0.8"/>
      <circle cx="16" cy="16" r="2" fill="#caf9f7"/>
    </svg>
  `,

  // 4. Fisheries: Commercial trawler / longliner / fishing net
  'icon-fishery': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M16 4 L22 12 L20 25 L16 28 L12 25 L10 12 Z" fill="#ff8a4c" stroke="#240f06" stroke-width="1.4"/>
      <path d="M12 16 L20 24 M20 16 L12 24" stroke="#240f06" stroke-width="1.2"/>
    </svg>
  `,

  // 5. Fauna - Penguin: Classic upright penguin silhouette
  'icon-penguin': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M16 4 C13 4 11 6 11 9 C11 11 12 12 11 15 C10 18 9 22 9 26 C9 28 11 29 13 29 L19 29 C21 29 23 28 23 26 C23 22 22 18 21 15 C20 12 21 11 21 9 C21 6 19 4 16 4 Z" fill="#72e0b5" stroke="#06241a" stroke-width="1.2"/>
      <ellipse cx="16" cy="19" rx="3.5" ry="6" fill="#06241a"/>
      <polygon points="16,9 18,11 16,12 14,11" fill="#ffc845"/>
    </svg>
  `,

  // 6. Fauna - Whale: Cetacean fluke / body silhouette
  'icon-whale': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M6 18 C10 12 18 10 24 13 C27 15 28 18 27 20 C24 22 18 22 13 20 L8 24 L9 19 Z" fill="#72e0b5" stroke="#06241a" stroke-width="1.2"/>
      <path d="M22 10 C21 13 19 14 17 14" stroke="#caf9f7" stroke-width="1.2" stroke-linecap="round"/>
    </svg>
  `,

  // 7. Fauna - Seal: Pinniped resting / swimming silhouette
  'icon-seal': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M8 20 C6 18 6 14 9 12 C13 10 19 11 23 15 C26 17 27 20 25 22 C22 23 17 23 13 21 L10 23 Z" fill="#72e0b5" stroke="#06241a" stroke-width="1.2"/>
      <circle cx="23" cy="15" r="1.2" fill="#06241a"/>
    </svg>
  `,

  // 8. Custom Dedicated Antarctic Krill Identity (Euphausia superba)
  // Curved segmented body, antenna rostrum, thoracic appendages, fan uropods, and bioluminescent photophores
  'icon-krill': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <!-- Main curved carapace and abdomen -->
      <path d="M7 16 C9 11 16 9 22 12 C25 13 26 16 24 18 C20 21 14 20 9 22 L5 23 L7 19 Z" fill="#ff9f43" stroke="#2b1502" stroke-width="1.3" stroke-linejoin="round"/>
      <!-- Thoracic feeding basket legs -->
      <path d="M12 20 L10 25 M15 19 L14 26 M18 18 L18 25 M21 16 L22 23" stroke="#ffb86c" stroke-width="1.2" stroke-linecap="round"/>
      <!-- Long rostrum and sensory antennae -->
      <line x1="24" y1="13" x2="30" y2="9" stroke="#ffa15e" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="24" y1="14" x2="29" y2="15" stroke="#ffa15e" stroke-width="1.1" stroke-linecap="round"/>
      <!-- Fan uropod tail -->
      <polygon points="5,23 3,21 3,25" fill="#ff7a29"/>
      <!-- Bioluminescent photophore light accents (AMOH signature) -->
      <circle cx="12" cy="17" r="1.1" fill="#00e5ff"/>
      <circle cx="16" cy="16" r="1.1" fill="#00e5ff"/>
      <circle cx="20" cy="14" r="1.1" fill="#00e5ff"/>
    </svg>
  `,
  'icon_krill_antarctic': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M7 16 C9 11 16 9 22 12 C25 13 26 16 24 18 C20 21 14 20 9 22 L5 23 L7 19 Z" fill="#ff9f43" stroke="#2b1502" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M12 20 L10 25 M15 19 L14 26 M18 18 L18 25 M21 16 L22 23" stroke="#ffb86c" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="24" y1="13" x2="30" y2="9" stroke="#ffa15e" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="24" y1="14" x2="29" y2="15" stroke="#ffa15e" stroke-width="1.1" stroke-linecap="round"/>
      <polygon points="5,23 3,21 3,25" fill="#ff7a29"/>
      <circle cx="12" cy="17" r="1.1" fill="#00e5ff"/>
      <circle cx="16" cy="16" r="1.1" fill="#00e5ff"/>
      <circle cx="20" cy="14" r="1.1" fill="#00e5ff"/>
    </svg>
  `,

  // 9. Fauna - Seabird: Wandering albatross in glide
  'icon-seabird': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M16 12 C12 7 6 9 3 11 C8 12 12 14 16 18 C20 14 24 12 29 11 C26 9 20 7 16 12 Z" fill="#a78bfa" stroke="#1f0f38" stroke-width="1.2"/>
      <polygon points="16,18 17,24 15,24" fill="#1f0f38"/>
    </svg>
  `,

  // 9b. Fauna - Orca / Killer Whale
  'icon-orca': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M4 18 C7 12 16 11 23 13 C27 15 28 17 28 19 C25 21 18 21 12 19 L7 23 L8 19 Z" fill="#38bdf8" stroke="#041f2f" stroke-width="1.2"/>
      <path d="M15 13 L17 5 L20 13 Z" fill="#38bdf8" stroke="#041f2f" stroke-width="1.2"/>
      <ellipse cx="21" cy="15" rx="2" ry="1.2" fill="#ffffff"/>
      <circle cx="25" cy="16" r="1" fill="#041f2f"/>
    </svg>
  `,

  // 9c. Fauna - Polar Fish / Icefish / Toothfish
  'icon-fish': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M5 16 C9 11 20 10 26 14 C27 12 29 10 30 11 C29 14 29 18 30 21 C29 22 27 20 26 18 C20 22 9 21 5 16 Z" fill="#93c5fd" stroke="#08213b" stroke-width="1.2"/>
      <polygon points="26,14 30,10 29,16 30,22 26,18" fill="#60a5fa"/>
      <path d="M14 11 L17 8 L18 11 Z" fill="#93c5fd"/>
      <circle cx="9" cy="15" r="1.5" fill="#08213b"/>
      <circle cx="9.3" cy="14.7" r="0.6" fill="#ffffff"/>
    </svg>
  `,

  // 9d. Fauna - Colossal Squid / Benthic Cephalopod / VME
  'icon-squid': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M16 3 C12 7 11 14 12 19 C13 22 19 22 20 19 C21 14 20 7 16 3 Z" fill="#f472b6" stroke="#2c0819" stroke-width="1.2"/>
      <polygon points="16,3 10,8 12,12" fill="#f472b6" stroke="#2c0819" stroke-width="1.1"/>
      <polygon points="16,3 22,8 20,12" fill="#f472b6" stroke="#2c0819" stroke-width="1.1"/>
      <path d="M13 21 C12 25 11 28 9 30 M15 21 C15 25 14 28 13 31 M17 21 C17 25 18 28 19 31 M19 21 C20 25 21 28 23 30" stroke="#f472b6" stroke-width="1.3" stroke-linecap="round"/>
      <circle cx="13.5" cy="17" r="1.5" fill="#00e5ff"/>
      <circle cx="18.5" cy="17" r="1.5" fill="#00e5ff"/>
    </svg>
  `,

  'icon-coral': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M16 28 V18 M16 21 L10 14 M16 23 L22 13 M10 14 V8 M10 14 L6 11 M22 13 V7 M22 13 L27 10" fill="none" stroke="#fb7185" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="10" cy="8" r="2.2" fill="#fda4af" stroke="#881337" stroke-width="1"/>
      <circle cx="22" cy="7" r="2.2" fill="#fda4af" stroke="#881337" stroke-width="1"/>
      <circle cx="6" cy="11" r="2" fill="#fda4af" stroke="#881337" stroke-width="1"/>
      <circle cx="27" cy="10" r="2" fill="#fda4af" stroke="#881337" stroke-width="1"/>
    </svg>
  `,

  // 9e. Fauna/Flora - Phytoplankton & Chlorophyll Bloom (Diatom / Chaetoceros / Phaeocystis)
  'icon-phytoplankton': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="16" r="6" fill="#10b981" stroke="#064e3b" stroke-width="1.2"/>
      <circle cx="16" cy="16" r="2.5" fill="#a7f3d0"/>
      <line x1="16" y1="4" x2="16" y2="9" stroke="#34d399" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="16" y1="23" x2="16" y2="28" stroke="#34d399" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="4" y1="16" x2="9" y2="16" stroke="#34d399" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="23" y1="16" x2="28" y2="16" stroke="#34d399" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="7.5" y1="7.5" x2="11" y2="11" stroke="#6ee7b7" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="21" y1="21" x2="24.5" y2="24.5" stroke="#6ee7b7" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="24.5" y1="7.5" x2="21" y2="11" stroke="#6ee7b7" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="11" y1="21" x2="7.5" y2="24.5" stroke="#6ee7b7" stroke-width="1.2" stroke-linecap="round"/>
    </svg>
  `,

  // 9f. Flora / Polar Algae & Vegetation
  'icon-plant': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M16 6 C12 12 10 18 16 26 C22 18 20 12 16 6 Z" fill="#10b981" stroke="#064e3b" stroke-width="1.2"/>
      <line x1="16" y1="10" x2="16" y2="26" stroke="#a7f3d0" stroke-width="1.2"/>
    </svg>
  `,

  // 10. Subsea Cable Node: Fiber terminal / landing station
  'icon-cable': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="16" r="10" fill="#0f1924" stroke="#ffc845" stroke-width="2"/>
      <circle cx="16" cy="16" r="5" fill="#ffc845"/>
      <line x1="4" y1="16" x2="11" y2="16" stroke="#ffc845" stroke-width="2"/>
      <line x1="21" y1="16" x2="28" y2="16" stroke="#ffc845" stroke-width="2"/>
    </svg>
  `,

  // 11. Radioactivity: IAEA MARIS trefoil
  'icon-radiation': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="16" r="12" fill="#1f0914" stroke="#ff5e8a" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="2.8" fill="#ff5e8a"/>
      <path d="M16 13 L13 7 A10 10 0 0 1 19 7 Z" fill="#ff5e8a"/>
      <path d="M18.5 17.5 L24 20 A10 10 0 0 1 21 25.5 Z" fill="#ff5e8a"/>
      <path d="M13.5 17.5 L8 20 A10 10 0 0 0 11 25.5 Z" fill="#ff5e8a"/>
    </svg>
  `,

  // 12. Earthquake: Seismic waveform / epicenter
  'icon-seismic': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="16" r="11" fill="#240c0c" stroke="#ff827d" stroke-width="1.4"/>
      <polyline points="8,16 12,16 14,10 17,22 19,13 21,18 24,16" fill="none" stroke="#ff827d" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,

  // 13. Ocean Sensor: Argo profiling float / surface buoy
  'icon-sensor': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="16" r="11" fill="#071e26" stroke="#58d5e3" stroke-width="1.4"/>
      <rect x="14" y="9" width="4" height="14" rx="1.5" fill="#58d5e3"/>
      <line x1="16" y1="4" x2="16" y2="9" stroke="#caf9f7" stroke-width="1.5"/>
      <circle cx="16" cy="4" r="1.5" fill="#caf9f7"/>
      <line x1="11" y1="13" x2="21" y2="13" stroke="#071e26" stroke-width="1.2"/>
    </svg>
  `,

  // 13b. Acoustic Ocean Network: Passive Acoustic Monitoring (PAM) Hydrophone
  'icon-hydrophone': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="16" r="11" fill="#0a1d26" stroke="#00e5ff" stroke-width="1.4"/>
      <!-- Concentric acoustic soundwaves -->
      <path d="M12 11 A6 6 0 0 0 12 21" stroke="#00e5ff" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M9 8 A10 10 0 0 0 9 24" stroke="#58d5e3" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-opacity="0.8"/>
      <!-- Hydrophone sensor core -->
      <circle cx="16" cy="16" r="3.5" fill="#00e5ff"/>
      <line x1="16" y1="19" x2="16" y2="25" stroke="#caf9f7" stroke-width="1.5"/>
    </svg>
  `,

  // 13c. Automatic Weather Station (AWS): Anemometer, solar shield & mast
  'icon-aws': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <!-- Mast -->
      <line x1="16" y1="6" x2="16" y2="28" stroke="#58d5e3" stroke-width="1.8"/>
      <line x1="11" y1="28" x2="21" y2="28" stroke="#58d5e3" stroke-width="2"/>
      <!-- Anemometer cups -->
      <circle cx="11" cy="7" r="2" fill="#ffd600"/>
      <circle cx="21" cy="7" r="2" fill="#ffd600"/>
      <line x1="9" y1="7" x2="23" y2="7" stroke="#ffd600" stroke-width="1.2"/>
      <!-- Radiation shield -->
      <rect x="13" y="14" width="6" height="6" rx="1" fill="#ffffff" stroke="#05141d" stroke-width="0.8"/>
    </svg>
  `,

  // 14. Ice: Iceberg / cryosphere landmark
  'icon-iceberg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <polygon points="16,4 25,18 22,27 10,27 7,18" fill="#caf9f7" stroke="#25627a" stroke-width="1.5" stroke-linejoin="round"/>
      <polyline points="16,4 18,18 22,27" fill="none" stroke="#68a8c2" stroke-width="1"/>
      <polyline points="16,4 13,18 10,27" fill="none" stroke="#68a8c2" stroke-width="1"/>
    </svg>
  `,

  // 15. Tourism: Expedition passenger ship
  'icon-tourism': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M16 3 L23 11 L21 26 L16 29 L11 26 L9 11 Z" fill="#dda63a" stroke="#241904" stroke-width="1.5" stroke-linejoin="round"/>
      <rect x="13" y="10" width="6" height="10" rx="1" fill="#241904"/>
      <line x1="16" y1="12" x2="16" y2="18" stroke="#ffe082" stroke-width="1.2"/>
      <circle cx="16" cy="7" r="1.2" fill="#ffe082"/>
    </svg>
  `,

  // 16. Station: Polar research base outpost
  'icon-station': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <rect x="8" y="12" width="16" height="12" rx="2" fill="#edf5f5" stroke="#122733" stroke-width="1.5"/>
      <polygon points="6,12 16,5 26,12" fill="#35c3c8" stroke="#122733" stroke-width="1.2"/>
      <rect x="14" y="16" width="4" height="8" fill="#122733"/>
      <circle cx="16" cy="9" r="1.5" fill="#edf5f5"/>
    </svg>
  `,

  // 16b. Luxury Field Camp (White Desert Whichaway / Echo / Ultima Oasis)
  'icon-camp-luxury': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <!-- Geodesic polar dome -->
      <path d="M6 24 C6 15 11 9 16 9 C21 9 26 15 26 24 Z" fill="#0d2433" stroke="#ffd700" stroke-width="1.6"/>
      <polygon points="16,9 12,18 20,18" fill="none" stroke="#ffd700" stroke-width="1"/>
      <polygon points="12,18 16,24 20,18" fill="none" stroke="#ffd700" stroke-width="1"/>
      <circle cx="16" cy="6" r="1.5" fill="#ffd700"/>
    </svg>
  `,

  // 16c. Scientific Borehole / Drilling site (IODP / ANDRILL / Ice Core)
  'icon-borehole': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <!-- Derrick derrick rig -->
      <polygon points="16,4 23,26 9,26" fill="#101924" stroke="#38bdf8" stroke-width="1.4"/>
      <line x1="12" y1="18" x2="20" y2="18" stroke="#38bdf8" stroke-width="1"/>
      <line x1="13" y1="11" x2="19" y2="11" stroke="#38bdf8" stroke-width="1"/>
      <line x1="16" y1="2" x2="16" y2="28" stroke="#00e5ff" stroke-width="1.8"/>
      <circle cx="16" cy="2" r="1.5" fill="#00e5ff"/>
    </svg>
  `,

  // 17. Flora: Antarctic plant & mosses (Deschampsia / Colobanthus)
  'icon-moss': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M16 28 L16 14 M16 20 C11 20 8 16 8 11 C13 11 16 15 16 20 Z M16 16 C21 16 24 12 24 7 C19 7 16 11 16 16 Z" fill="#56c02b" stroke="#0b2408" stroke-width="1.3" stroke-linejoin="round"/>
    </svg>
  `,

  // 18. Offshore Energy Platform (Rig / Jacket) - Strictly North of 60°S
  'icon-platform': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M7 26 L11 13 L21 13 L25 26 Z" fill="#241b0b" stroke="#f59e0b" stroke-width="1.3"/>
      <line x1="11" y1="13" x2="25" y2="26" stroke="#f59e0b" stroke-width="0.9"/>
      <line x1="21" y1="13" x2="7" y2="26" stroke="#f59e0b" stroke-width="0.9"/>
      <rect x="9" y="9" width="14" height="4" fill="#f59e0b" stroke="#241b0b" stroke-width="0.8"/>
      <line x1="16" y1="3" x2="16" y2="9" stroke="#f59e0b" stroke-width="1.4"/>
      <circle cx="16" cy="3" r="1.2" fill="#ef4444"/>
    </svg>
  `,

  // 20. Military Base: Fortified outpost & shield
  'icon-military': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <polygon points="16,3 27,8 27,18 16,29 5,18 5,8" fill="#1b2416" stroke="#84cc16" stroke-width="1.6"/>
      <polygon points="16,7 23,11 23,18 16,25 9,18 9,11" fill="#84cc16" opacity="0.3"/>
      <polygon points="16,9 18,14 23,14 19,17 21,22 16,19 11,22 13,17 9,14 14,14" fill="#84cc16"/>
    </svg>
  `,

  // 21. AI Datacenter: High performance compute cluster / microchip
  'icon-datacenter': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <rect x="7" y="7" width="18" height="18" rx="3" fill="#061c24" stroke="#00f0ff" stroke-width="1.6"/>
      <rect x="11" y="11" width="10" height="10" rx="1" fill="#00f0ff" opacity="0.4"/>
      <circle cx="16" cy="16" r="2.5" fill="#ffffff"/>
      <line x1="11" y1="3" x2="11" y2="7" stroke="#00f0ff" stroke-width="1.4"/>
      <line x1="16" y1="3" x2="16" y2="7" stroke="#00f0ff" stroke-width="1.4"/>
      <line x1="21" y1="3" x2="21" y2="7" stroke="#00f0ff" stroke-width="1.4"/>
      <line x1="11" y1="25" x2="11" y2="29" stroke="#00f0ff" stroke-width="1.4"/>
      <line x1="16" y1="25" x2="16" y2="29" stroke="#00f0ff" stroke-width="1.4"/>
      <line x1="21" y1="25" x2="21" y2="29" stroke="#00f0ff" stroke-width="1.4"/>
    </svg>
  `,

  // 22. Spaceport: Rocket launch trajectory
  'icon-spaceport': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M16 2 C19 7 21 14 20 22 L16 20 L12 22 C11 14 13 7 16 2 Z" fill="#6366f1" stroke="#ffffff" stroke-width="1.4"/>
      <polygon points="12,18 8,24 13,22" fill="#818cf8"/>
      <polygon points="20,18 24,24 19,22" fill="#818cf8"/>
      <circle cx="16" cy="11" r="2" fill="#ffffff"/>
      <path d="M14 24 L16 30 L18 24 Z" fill="#f59e0b"/>
    </svg>
  `,

  // 23. Wildfire / Thermal Anomaly
  'icon-wildfire': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M16 3 C16 9 10 13 10 19 C10 24 13 28 17 28 C15 25 15 22 17 19 C18 22 20 23 20 26 C22 24 23 21 23 18 C23 11 18 8 16 3 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.2"/>
      <path d="M16 16 C14 18 14 21 16 24 C17 22 18 20 18 18 Z" fill="#f59e0b"/>
    </svg>
  `,

  // 24. Strategic Waterway / Chokepoint
  'icon-waterway': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="8" r="3" fill="#0d2433" stroke="#38bdf8" stroke-width="1.6"/>
      <line x1="16" y1="11" x2="16" y2="26" stroke="#38bdf8" stroke-width="2"/>
      <line x1="10" y1="14" x2="22" y2="14" stroke="#38bdf8" stroke-width="1.8"/>
      <path d="M8 20 C10 27 22 27 24 20" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,

  // 25. GPS Jamming / EW Sensor
  'icon-jamming': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="16" r="3" fill="#ef4444"/>
      <path d="M11 11 A7 7 0 0 0 11 21" stroke="#ef4444" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M21 11 A7 7 0 0 1 21 21" stroke="#ef4444" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M7 7 A13 13 0 0 0 7 25" stroke="#f87171" stroke-width="1.5" stroke-dasharray="2 2" fill="none" stroke-linecap="round"/>
      <path d="M25 7 A13 13 0 0 1 25 25" stroke="#f87171" stroke-width="1.5" stroke-dasharray="2 2" fill="none" stroke-linecap="round"/>
      <line x1="6" y1="26" x2="26" y2="6" stroke="#ffffff" stroke-width="1.5"/>
    </svg>
  `,

  // 26. Live Webcam
  'icon-webcam': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <rect x="5" y="8" width="16" height="16" rx="3" fill="#0d2433" stroke="#22d3ee" stroke-width="1.6"/>
      <circle cx="13" cy="16" r="4.5" fill="#05141d" stroke="#22d3ee" stroke-width="1.2"/>
      <circle cx="13" cy="16" r="2" fill="#22d3ee"/>
      <polygon points="21,12 28,8 28,24 21,20" fill="#22d3ee" stroke="#0d2433" stroke-width="1"/>
      <circle cx="8" cy="11" r="1" fill="#ef4444"/>
    </svg>
  `,

  // 27. Conflict Zone / UCDP Event
  'icon-conflict': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <line x1="7" y1="7" x2="25" y2="25" stroke="#f43f5e" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="25" y1="7" x2="7" y2="25" stroke="#f43f5e" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="16" cy="16" r="4" fill="#0f0507" stroke="#f43f5e" stroke-width="1.6"/>
      <line x1="16" y1="12" x2="16" y2="20" stroke="#f43f5e" stroke-width="1.2"/>
      <line x1="12" y1="16" x2="20" y2="16" stroke="#f43f5e" stroke-width="1.2"/>
    </svg>
  `,

  // 28. Critical Minerals
  'icon-minerals': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <polygon points="16,3 27,11 22,28 10,28 5,11" fill="#0d2433" stroke="#38bdf8" stroke-width="1.6"/>
      <polygon points="16,3 10,11 16,28 22,11" fill="none" stroke="#38bdf8" stroke-width="1.1"/>
      <line x1="5" y1="11" x2="27" y2="11" stroke="#38bdf8" stroke-width="1.1"/>
    </svg>
  `,

  // 29. Climate Anomaly / Severe Weather
  'icon-weather': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <path d="M9 22 C6 22 4 20 4 17 C4 14 6 12 9 12 C10 8 14 6 18 7 C21 8 23 10 24 13 C26 13 28 15 28 17 C28 20 26 22 23 22 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="1.6"/>
      <polyline points="15,22 13,26 17,26 15,30" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-linejoin="round"/>
    </svg>
  `,

  // 30. Grey Zones & Strategic Radar Threat
  'icon-grey-zone': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="16" r="14" fill="#1e1035" stroke="#a855f7" stroke-width="1.8"/>
      <circle cx="16" cy="16" r="9" fill="none" stroke="#c084fc" stroke-width="1.2" stroke-dasharray="3 2"/>
      <circle cx="16" cy="16" r="4" fill="none" stroke="#e9d5ff" stroke-width="1"/>
      <line x1="16" y1="2" x2="16" y2="30" stroke="#a855f7" stroke-width="1" opacity="0.6"/>
      <line x1="2" y1="16" x2="30" y2="16" stroke="#a855f7" stroke-width="1" opacity="0.6"/>
      <polygon points="16,16 26,10 24,16" fill="#f43f5e" opacity="0.85"/>
      <circle cx="16" cy="16" r="2" fill="#f43f5e"/>
    </svg>
  `,
};

/**
 * Loads all SVG icons as HTML images into MapLibre instance.
 */
export async function registerAmohIcons(map: MlMap): Promise<void> {
  const promises = Object.entries(AMOH_SVG_ICONS).map(([id, svgString]) => {
    return new Promise<void>((resolve) => {
      try {
        if (typeof (map as any).hasImage === 'function' && map.hasImage(id)) {
          resolve();
          return;
        }
      } catch {
        // ignore style initialization timing
      }

      const img = new Image(48, 48);
      img.onload = () => {
        try {
          let exists = false;
          try {
            exists = typeof (map as any).hasImage === 'function' && map.hasImage(id);
          } catch {
            exists = false;
          }
          if (!exists) {
            map.addImage(id, img, { pixelRatio: 2 });
          }
        } catch (e) {
          console.warn(`[AMOH Atlas] Error adding image ${id}:`, e);
        } finally {
          URL.revokeObjectURL(img.src);
          resolve();
        }
      };
      img.onerror = () => {
        console.warn(`[AMOH Atlas] Failed to load SVG icon: ${id}`);
        URL.revokeObjectURL(img.src);
        resolve();
      };
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      img.src = URL.createObjectURL(blob);
    });
  });

  await Promise.all(promises);
}

/**
 * Returns the registered MapLibre icon ID for a given layer.
 */
export function getIconForLayer(layerId: string): string {
  const id = layerId.toLowerCase().trim();
  if (id.includes('vessel') || id.includes('ship') || id.includes('barco') || id.includes('traffic') || id.includes('ais')) return 'icon-vessel';
  if (id.includes('aircraft') || id.includes('flight') || id.includes('avion') || id.includes('militar_fly') || id.includes('aviation')) return 'icon-aircraft';
  if (id.includes('satellit') || id.includes('orbital')) return 'icon-satellite';
  if (id.includes('penguin') || id.includes('pinguin')) return 'icon-penguin';
  if (id.includes('whale') || id.includes('ballen')) return 'icon-whale';
  if (id.includes('seal') || id.includes('foca')) return 'icon-seal';
  if (id.includes('seabird') || id.includes('albatros') || id.includes('petrel') || id.includes('skua') || id.includes('ave')) return 'icon-seabird';
  if (id.includes('fish') || id.includes('pez') || id.includes('toothfish') || id.includes('merluza') || id.includes('notothen')) return 'icon-fish';
  if (id.includes('coral') || id.includes('stylaster') || id.includes('hexacor')) return 'icon-coral';
  if (id.includes('squid') || id.includes('calamar') || id.includes('benthos') || id.includes('pulpo') || id.includes('sponge')) return 'icon-squid';
  if (id.includes('krill')) return 'icon_krill_antarctic';
  if (id.includes('orca')) return 'icon-orca';
  if (id.includes('phyto') || id.includes('chlorophyll') || id.includes('clorofil') || id.includes('bloom')) return 'icon-phytoplankton';
  if (id.includes('fauna') || id.includes('polar_wildlife')) return 'icon-penguin';
  if (id.includes('plant') || id.includes('vegetation') || id.includes('flora') || id.includes('moss')) return 'icon-plant';
  if (id.includes('fisher') || id.includes('fishing') || id.includes('pesca')) return 'icon-fishery';
  if (id.includes('tourism') || id.includes('iaato') || id.includes('cruise')) return 'icon-tourism';
  if (id.includes('camp') || id.includes('luxury') || id.includes('lujo') || id.includes('glamping')) return 'icon-camp-luxury';
  if (id.includes('borehole') || id.includes('drilling')) return 'icon-borehole';
  if (id.includes('energy') || id.includes('offshore') || id.includes('platform')) return 'icon-platform';
  if (id.includes('nuclear') || id.includes('radiat') || id.includes('irradiat') || id.includes('maris')) return 'icon-radiation';
  if (id.includes('seismic') || id.includes('earthquake') || id.includes('volcan')) return 'icon-seismic';
  if (id.includes('station') || id.includes('base') || id.includes('comnap') || id.includes('facility')) return 'icon-station';
  if (id.includes('military') || id.includes('defens')) return 'icon-military';
  if (id.includes('datacenter') || id.includes('ia_data')) return 'icon-datacenter';
  if (id.includes('spaceport') || id.includes('cohete')) return 'icon-spaceport';
  if (id.includes('cable') || id.includes('internet')) return 'icon-cable';
  if (id.includes('fire') || id.includes('incendio') || id.includes('thermal') || id.includes('wildfire')) return 'icon-wildfire';
  if (id.includes('waterway') || id.includes('canal') || id.includes('strait') || id.includes('trade')) return 'icon-waterway';
  if (id.includes('jamming') || id.includes('gps')) return 'icon-jamming';
  if (id.includes('webcam') || id.includes('camara') || id.includes('cctv')) return 'icon-webcam';
  if (id.includes('conflict') || id.includes('ucdp') || id.includes('war')) return 'icon-conflict';
  if (id.includes('grey') || id.includes('gris') || id.includes('defense') || id.includes('hybrid') || id.includes('threat')) return 'icon-grey-zone';
  if (id.includes('mineral') || id.includes('mining')) return 'icon-minerals';
  if (id.includes('hydrophone') || id.includes('acoust') || id.includes('pam')) return 'icon-hydrophone';
  if (id.includes('aws') || id.includes('weather_station')) return 'icon-aws';
  if (id.includes('weather') || id.includes('clima') || id.includes('storm') || id.includes('climate') || id.includes('anomal')) return 'icon-weather';
  if (id.includes('iceberg') || id.includes('glacier') || id.includes('criosfera')) return 'icon-iceberg';
  if (id.includes('sar')) return 'icon-satellite';
  if (id.includes('field') || id.includes('observation')) return 'icon-sensor';
  if (id.includes('sensor') || id.includes('argo') || id.includes('buoy') || id.includes('boya')) return 'icon-sensor';
  return 'icon-station';
}

/**
 * Returns a data:image/svg+xml;utf8 URI for a given SVG icon ID, suitable for <img> tags.
 */
export function getSvgDataUri(iconId: string): string {
  const svg = AMOH_SVG_ICONS[iconId] || AMOH_SVG_ICONS['icon-station'];
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

/**
 * Convenience helper to get the Data URI directly for a layer ID.
 */
export function getLayerSvgDataUri(layerId: string): string {
  return getSvgDataUri(getIconForLayer(layerId));
}
