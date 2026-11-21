/**
 * AMOH V9 — Unified Self-Healing Engine
 */

import { HealthDetector } from './detector';
import { AIDiagnostic } from './diagnostic';
import { AutoRepair } from './repair';

class SelfHealingEngine {
  public detector: HealthDetector;
  public diagnostic: AIDiagnostic;
  public repair: AutoRepair;

  constructor() {
    this.detector = new HealthDetector();
    this.diagnostic = new AIDiagnostic();
    this.repair = new AutoRepair();

    // Wire detection directly to repair
    this.detector.subscribe((anomalies) => {
      const latest = anomalies[0];
      if (latest && latest.severity !== 'LOW') {
        this.repair.repair(latest);
      }
    });

    this.detector.start();
  }

  public getState() {
    const anomalies = this.detector.getAnomalies();
    const diagnostics = anomalies.map((a) => {
      const d = this.diagnostic.analyze(a);
      return {
        anomaly: a,
        diagnosis: d,
        explanation: d.scientificExplanation,
      };
    });

    return {
      networkMode: 'ONLINE' as const,
      anomalies,
      diagnostics,
      repairLogs: this.repair.getHistory(),
    };
  }

  public async runCycle() {
    await this.detector.runAllChecks();
    return this.getState();
  }
}

export const SelfHealing = new SelfHealingEngine();

if (typeof window !== 'undefined') {
  (window as any).__selfHealing = SelfHealing;
}
