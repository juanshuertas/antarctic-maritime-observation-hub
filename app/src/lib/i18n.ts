/**
 * OLEA Localization (V20)
 * Six working languages: ES (base), EN, JA, NB, ZH-Hans, AR (RTL text).
 *
 * This keeps the existing `useI18nStore` API used by Header / ControlCenter /
 * ODSLegend / StoriesPage, but the locale itself now lives in a single runtime
 * (src/i18n/olea-i18n.ts) that also translates every rendered string through
 * catalogs at render time. Keys missing for a locale fall back to the Spanish
 * text, which the catalog then translates.
 */

import { create } from 'zustand';
import {
  LOCALES,
  getLocale,
  setLocale,
  subscribeLocale,
  translateString,
  type Locale,
} from '../i18n/olea-i18n';

export type SupportedLanguage = Locale;

export interface LanguageInfo {
  code: SupportedLanguage;
  short: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = LOCALES.map((l) => ({
  code: l.code,
  short: l.short,
  name: l.name,
  nativeName: `${l.short} · ${l.nativeName}`,
  flag: l.short,
  dir: l.dir,
}));

export interface TranslationDictionary {
  // Navigation & Core Actions
  nav_observatory: string;
  nav_situation: string;
  nav_explore: string;
  nav_stories: string;
  nav_diplomacy: string;
  nav_back: string;
  nav_menu: string;
  search_placeholder: string;

  // Header & Status
  status_live: string;
  status_demo: string;
  telemetry_vessels: string;
  telemetry_satellites: string;
  telemetry_flights: string;
  telemetry_floats: string;
  telemetry_stations: string;

  // Map Controls
  map_mode_map: string;
  map_mode_globe: string;
  map_mode_terrain: string;
  map_mode_satellite: string;
  map_reset: string;
  map_layers: string;

  // Control Center
  cc_title: string;
  cc_tab_now: string;
  cc_tab_layers: string;
  cc_tab_search: string;
  cc_tab_saved: string;
  cc_back_to_categories: string;
  cc_clear_layers: string;
  cc_active: string;
  cc_focus_modes: string;
  cc_quick_env: string;
  cc_domains: string;

  // Presets
  preset_maritime: string;
  preset_weather: string;
  preset_ocean: string;
  preset_ice: string;
  preset_life: string;
  preset_tourism: string;
  preset_nuclear: string;
  preset_sensors: string;
  preset_expedition: string;

  // Categories
  cat_activity: string;
  cat_activity_desc: string;
  cat_environment: string;
  cat_environment_desc: string;
  cat_ocean: string;
  cat_ocean_desc: string;
  cat_ice: string;
  cat_ice_desc: string;
  cat_life: string;
  cat_life_desc: string;
  cat_sensors: string;
  cat_sensors_desc: string;
  cat_infrastructure: string;
  cat_infrastructure_desc: string;
  cat_pollution: string;
  cat_pollution_desc: string;
  cat_governance: string;
  cat_governance_desc: string;
  cat_field: string;
  cat_field_desc: string;

  // SDG labels
  sdg_active_title: string;
  sdg_un_disclaimer: string;
}

const TRANSLATIONS: Partial<Record<SupportedLanguage, TranslationDictionary>> & { es: TranslationDictionary } = {
  es: {
    nav_observatory: 'OBSERVATORIO',
    nav_situation: 'SALA DE SITUACIÓN',
    nav_explore: 'EXPLORADOR',
    nav_stories: 'HISTORIAS & CINE',
    nav_diplomacy: 'DIPLOMACIA CIENTÍFICA',
    nav_back: 'Volver',
    nav_menu: 'MENÚ',
    search_placeholder: 'Buscar...',

    status_live: 'EN VIVO',
    status_demo: 'DEMO',
    telemetry_vessels: 'Buques AIS',
    telemetry_satellites: 'Satélites',
    telemetry_flights: 'Vuelos Polares',
    telemetry_floats: 'Boyas Argo',
    telemetry_stations: 'Bases Científicas',

    map_mode_map: 'MAPA 2D',
    map_mode_globe: 'GLOBO 3D',
    map_mode_terrain: 'Relieve',
    map_mode_satellite: 'SATÉLITE',
    map_reset: 'Restablecer',
    map_layers: 'Capas',

    cc_title: 'Centro de Control',
    cc_tab_now: 'AHORA',
    cc_tab_layers: 'CAPAS',
    cc_tab_search: 'BUSCAR',
    cc_tab_saved: 'VISTAS',
    cc_back_to_categories: 'Volver a Categorías',
    cc_clear_layers: 'LIMPIAR',
    cc_active: 'activas',
    cc_focus_modes: 'Modos de Enfoque Rápido',
    cc_quick_env: 'Atmósfera y Océano (Estilo Windy)',
    cc_domains: '10 Dominios Cartográficos',

    preset_maritime: 'Marítimo',
    preset_weather: 'Clima',
    preset_ocean: 'Océano',
    preset_ice: 'Hielo',
    preset_life: 'Vida',
    preset_tourism: 'Turismo',
    preset_nuclear: 'Nuclear',
    preset_sensors: 'Sensores',
    preset_expedition: 'Misión PAC',

    cat_activity: 'Actividad Humana',
    cat_activity_desc: 'Tráfico marítimo AIS, puentes aéreos, turismo IAATO y pesca GFW',
    cat_environment: 'Atmósfera y Clima',
    cat_environment_desc: 'Vientos sinópticos, temperatura superficial y frentes polares',
    cat_ocean: 'Océano Austral',
    cat_ocean_desc: 'Corriente Circumpolar Antártica (ACC), boyas Argo y salinidad',
    cat_ice: 'Criosfera e Hielo',
    cat_ice_desc: 'Banquisa marina, plataformas glaciares y deriva de témpanos',
    cat_life: 'Biodiversidad y Fauna',
    cat_life_desc: 'Avistamientos OBIS, cetáceos, colonias de pingüinos y krill',
    cat_sensors: 'Red de Sensores y Boyas',
    cat_sensors_desc: 'Instrumentación in situ, sismología FDSN y boyas meteorológicas',
    cat_infrastructure: 'Infraestructura Polar',
    cat_infrastructure_desc: 'Bases permanentes, cables transoceánicos y pistas aéreas',
    cat_pollution: 'Contaminación y Radiación',
    cat_pollution_desc: 'Línea base radiológica IAEA MARIS, aerosoles y microplásticos',
    cat_governance: 'Gobernanza y Tratado',
    cat_governance_desc: 'Áreas protegidas ASPA/ASMA, límites CCAMLR y directrices ATS',
    cat_field: 'Registro de Campo',
    cat_field_desc: 'Observaciones de expedición, imágenes DJI y evidencias de misión',

    sdg_active_title: 'ODS ACTIVOS',
    sdg_un_disclaimer: 'ONU Disclaimer',
  },
  en: {
    nav_observatory: 'OBSERVATORY',
    nav_situation: 'SITUATION ROOM',
    nav_explore: 'EXPLORER',
    nav_stories: 'STORIES & CINEMA',
    nav_diplomacy: 'SCIENCE DIPLOMACY',
    nav_back: 'Back',
    nav_menu: 'MENU',
    search_placeholder: 'Search...',

    status_live: 'LIVE',
    status_demo: 'DEMO',
    telemetry_vessels: 'AIS Vessels',
    telemetry_satellites: 'Satellites',
    telemetry_flights: 'Polar Flights',
    telemetry_floats: 'Argo Floats',
    telemetry_stations: 'Research Stations',

    map_mode_map: '2D MAP',
    map_mode_globe: '3D GLOBE',
    map_mode_terrain: 'Terrain',
    map_mode_satellite: 'SATELLITE',
    map_reset: 'Reset View',
    map_layers: 'Layers',

    cc_title: 'Control Center',
    cc_tab_now: 'NOW',
    cc_tab_layers: 'LAYERS',
    cc_tab_search: 'SEARCH',
    cc_tab_saved: 'SAVED',
    cc_back_to_categories: 'Back to Categories',
    cc_clear_layers: 'CLEAR',
    cc_active: 'active',
    cc_focus_modes: 'Quick Focus Modes',
    cc_quick_env: 'Atmosphere & Ocean (Windy Style)',
    cc_domains: '10 Cartographic Domains',

    preset_maritime: 'Maritime',
    preset_weather: 'Weather',
    preset_ocean: 'Ocean',
    preset_ice: 'Ice',
    preset_life: 'Life',
    preset_tourism: 'Tourism',
    preset_nuclear: 'Nuclear',
    preset_sensors: 'Sensors',
    preset_expedition: 'Expedition',

    cat_activity: 'Human Activity',
    cat_activity_desc: 'AIS maritime traffic, air bridges, IAATO tourism and GFW fisheries',
    cat_environment: 'Atmosphere & Weather',
    cat_environment_desc: 'Synoptic winds, surface temperature, and polar fronts',
    cat_ocean: 'Southern Ocean',
    cat_ocean_desc: 'Antarctic Circumpolar Current (ACC), Argo floats and salinity',
    cat_ice: 'Cryosphere & Ice',
    cat_ice_desc: 'Sea ice concentration, ice shelves and tabular iceberg drift',
    cat_life: 'Biodiversity & Wildlife',
    cat_life_desc: 'OBIS sightings, cetaceans, penguin colonies and krill',
    cat_sensors: 'Sensor Network & Buoys',
    cat_sensors_desc: 'In-situ instrumentation, FDSN seismology and weather buoys',
    cat_infrastructure: 'Polar Infrastructure',
    cat_infrastructure_desc: 'Permanent stations, transoceanic cables and runways',
    cat_pollution: 'Pollution & Radiation',
    cat_pollution_desc: 'IAEA MARIS radiological baseline, aerosols and microplastics',
    cat_governance: 'Governance & Treaty',
    cat_governance_desc: 'ASPA/ASMA protected zones, CCAMLR limits and ATS guidelines',
    cat_field: 'Field Records',
    cat_field_desc: 'Expedition observations, DJI aerial imagery and mission logs',

    sdg_active_title: 'ACTIVE SDGS',
    sdg_un_disclaimer: 'UN Disclaimer',
  },
  'zh-Hans': {
    nav_observatory: '观测中心',
    nav_situation: '态势指挥室',
    nav_explore: '探索模块',
    nav_stories: '极地故事与影像',
    nav_diplomacy: '科学外交',
    nav_back: '返回',
    nav_menu: '菜单',
    search_placeholder: '搜索图层、船舶或基地...',

    status_live: '实时',
    status_demo: '演示',
    telemetry_vessels: 'AIS船舶',
    telemetry_satellites: '在轨卫星',
    telemetry_flights: '极地航班',
    telemetry_floats: 'Argo浮标',
    telemetry_stations: '科考站',

    map_mode_map: '2D地图',
    map_mode_globe: '3D地球',
    map_mode_terrain: '地形',
    map_mode_satellite: '卫星影像',
    map_reset: '重置视角',
    map_layers: '图层',

    cc_title: '控制中心',
    cc_tab_now: '实时',
    cc_tab_layers: '图层',
    cc_tab_search: '搜索',
    cc_tab_saved: '预设',
    cc_back_to_categories: '返回图层目录',
    cc_clear_layers: '清除',
    cc_active: '已激活',
    cc_focus_modes: '快速聚焦模式',
    cc_quick_env: '大气与海洋流场',
    cc_domains: '10大科学制图领域',

    preset_maritime: '海事',
    preset_weather: '气象',
    preset_ocean: '海洋',
    preset_ice: '海冰',
    preset_life: '生态',
    preset_tourism: '旅游',
    preset_nuclear: '核辐射',
    preset_sensors: '传感器',
    preset_expedition: '科考任务',

    cat_activity: '人类活动',
    cat_activity_desc: 'AIS海事交通、空中走廊、IAATO极地旅游与GFW渔业监管',
    cat_environment: '大气与气候',
    cat_environment_desc: '天气尺度风场、海表温度及极地气象锋面',
    cat_ocean: '南大洋水文',
    cat_ocean_desc: '南极绕极流(ACC)、Argo剖面浮标与盐度分布',
    cat_ice: '冰冻圈与海冰',
    cat_ice_desc: '海冰密集度、冰架边缘与大型冰山漂移监测',
    cat_life: '生物多样性与生态',
    cat_life_desc: 'OBIS生物记录、鲸类观测、企鹅繁殖地及磷虾分布',
    cat_sensors: '传感器网络与浮标',
    cat_sensors_desc: '原位科学仪器、FDSN地震监测站及气象浮标',
    cat_infrastructure: '极地基础设施',
    cat_infrastructure_desc: '常年科考站、跨洋海底光缆及极地跑道',
    cat_pollution: '污染监测与辐射',
    cat_pollution_desc: '国际原子能机构MARIS海洋放射性基线与微塑料监测',
    cat_governance: '极地治理与条约',
    cat_governance_desc: '南极特别保护区(ASPA)、CCAMLR保护区与条约规范',
    cat_field: '现场科考记录',
    cat_field_desc: '科考航次观测、大疆无人机航空遥感与任务实证',

    sdg_active_title: '生效联合国可持续目标',
    sdg_un_disclaimer: '联合国免责声明',
  },
};

interface I18nStore {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof TranslationDictionary) => string;
}

export const useI18nStore = create<I18nStore>((set) => {
  subscribeLocale(() => set({ language: getLocale() }));
  return {
    language: getLocale(),
    setLanguage: (lang: SupportedLanguage) => {
      void setLocale(lang);
    },
    t: (key: keyof TranslationDictionary) => {
      const own = TRANSLATIONS[getLocale()]?.[key];
      if (own) return own;
      const base = TRANSLATIONS.es[key];
      return base ? translateString(base) : (key as string);
    },
  };
});
