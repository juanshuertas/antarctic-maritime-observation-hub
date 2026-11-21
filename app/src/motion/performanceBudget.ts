/**
 * AMOH V8.3 Performance Budget & Adaptive Quality Tiers
 * 
 * Supports 4 performance profiles:
 * - ULTRA: Full 3D terrain, high-density particle currents/wind, unconstrained animations, 60 FPS target.
 * - BALANCED: Standard DEM relief, optimized particle density, smooth desktop performance.
 * - FIELD: Mobile/Samsung S25+ optimized, reduced draw calls, simplified vector symbols, battery saving.
 * - BATTERY_SAVER: Minimal WebGL overhead, static vector fields, low refresh rate for field nodes.
 */

export type QualityTier = 'ULTRA' | 'BALANCED' | 'FIELD' | 'BATTERY_SAVER';

export interface PerformanceConfig {
  tier: QualityTier;
  terrainExaggeration: number;
  particleDensity: number; // multiplier 0.2 - 1.0
  maxVisibleVessels: number;
  maxVisibleSatellites: number;
  animationFramerateCap: number; // 30 or 60
  enableShadows: boolean;
  enableAtmosphereFog: boolean;
  refreshIntervalMs: number;
}

export const QUALITY_TIER_CONFIGS: Record<QualityTier, PerformanceConfig> = {
  ULTRA: {
    tier: 'ULTRA',
    terrainExaggeration: 1.25,
    particleDensity: 1.0,
    maxVisibleVessels: 150,
    maxVisibleSatellites: 80,
    animationFramerateCap: 60,
    enableShadows: true,
    enableAtmosphereFog: true,
    refreshIntervalMs: 15000,
  },
  BALANCED: {
    tier: 'BALANCED',
    terrainExaggeration: 1.0,
    particleDensity: 0.7,
    maxVisibleVessels: 80,
    maxVisibleSatellites: 40,
    animationFramerateCap: 60,
    enableShadows: false,
    enableAtmosphereFog: true,
    refreshIntervalMs: 30000,
  },
  FIELD: {
    tier: 'FIELD',
    terrainExaggeration: 0.8,
    particleDensity: 0.4,
    maxVisibleVessels: 40,
    maxVisibleSatellites: 20,
    animationFramerateCap: 30,
    enableShadows: false,
    enableAtmosphereFog: false,
    refreshIntervalMs: 60000,
  },
  BATTERY_SAVER: {
    tier: 'BATTERY_SAVER',
    terrainExaggeration: 0.0,
    particleDensity: 0.2,
    maxVisibleVessels: 25,
    maxVisibleSatellites: 10,
    animationFramerateCap: 30,
    enableShadows: false,
    enableAtmosphereFog: false,
    refreshIntervalMs: 120000,
  },
};

export class PerformanceBudgetManager {
  private currentTier: QualityTier = 'BALANCED';

  constructor() {
    // Detect mobile device / touch screen
    if (typeof window !== 'undefined') {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        this.currentTier = 'FIELD';
      }
    }
  }

  getTier(): QualityTier {
    return this.currentTier;
  }

  setTier(tier: QualityTier) {
    this.currentTier = tier;
  }

  getConfig(): PerformanceConfig {
    return QUALITY_TIER_CONFIGS[this.currentTier];
  }
}

export const performanceBudget = new PerformanceBudgetManager();
