/**
 * AMOH Pythia Live Analyst & Multi-Agent Consensus Engine
 * Rules 121-130: 4 specialized agents, Brier score weighting formula, 7-point analytical cards.
 */

export type AgentRole = 'ICE_NAVIGATOR' | 'MARINE_BIOLOGIST' | 'NAVAL_STRATEGIST' | 'SCIENTIFIC_SKEPTIC';

export interface PythiaAgent {
  role: AgentRole;
  name: string;
  specialty: string;
  avatar: string;
  historicalBrierScore: number; // lower is better (0.0 to 1.0)
  consensusWeight: number; // dynamically calculated
}

export interface AnalyticalCard {
  id: string;
  timestampUtc: string;
  targetEntityId?: string;
  primaryAgent: AgentRole;
  confidenceScore: number; // 0 to 100%
  // 7-point analytical structure
  whatChanged: string;
  directlyObserved: string;
  whyItMatters: string;
  evidence: { source: string; timestamp: string; qualityFlag: string };
  uncertain: string;
  alternatives: string;
  nextRecommendedAction: string;
  isForecastRingSimulated: boolean;
}

export class PythiaConsensusEngine {
  private static agents: PythiaAgent[] = [
    {
      role: 'ICE_NAVIGATOR',
      name: 'Dr. Nils Lindqvist',
      specialty: 'Dinámica de Hielo Marino, Viento Catabático y Deriva de Témpanos',
      avatar: '🧊',
      historicalBrierScore: 0.14,
      consensusWeight: 0.28,
    },
    {
      role: 'MARINE_BIOLOGIST',
      name: 'Dra. Camila Morales',
      specialty: 'Ecología Trófica del Krill y Corredores de Mamíferos Marinos',
      avatar: '🐋',
      historicalBrierScore: 0.18,
      consensusWeight: 0.24,
    },
    {
      role: 'NAVAL_STRATEGIST',
      name: 'Capitán Arthur Vance',
      specialty: 'Seguridad Marítima, Detección SAR y Cumplimiento CCAMLR',
      avatar: '🧭',
      historicalBrierScore: 0.16,
      consensusWeight: 0.26,
    },
    {
      role: 'SCIENTIFIC_SKEPTIC',
      name: 'Agente Escéptico (simulado)',
      specialty: 'Control de Calidad, Errores de Sensores y Verificación Epistémica',
      avatar: '🔬',
      historicalBrierScore: 0.20,
      consensusWeight: 0.22,
    },
  ];

  /**
   * Recalculates weights using the Brier formula:
   * W_i = (1 - BS_i)^2 / sum(1 - BS_j)^2
   */
  static recalculateWeights(): PythiaAgent[] {
    const numerators = this.agents.map((a) => Math.pow(1.0 - a.historicalBrierScore, 2));
    const sum = numerators.reduce((acc, v) => acc + v, 0);

    this.agents.forEach((agent, i) => {
      agent.consensusWeight = parseFloat((numerators[i] / sum).toFixed(3));
    });

    return [...this.agents];
  }

  static getAgents(): PythiaAgent[] {
    return this.recalculateWeights();
  }

  static generateSampleCard(topic: 'ICE' | 'VESSEL' | 'FAUNA'): AnalyticalCard {
    const now = new Date().toISOString();

    if (topic === 'ICE') {
      return {
        id: `PYTHIA-ICE-${Date.now().toString().slice(-4)}`,
        timestampUtc: now,
        primaryAgent: 'ICE_NAVIGATOR',
        confidenceScore: 88,
        whatChanged: 'Apertura de canal de aguas libres (polinia de viento) en la costa oeste de la Isla Anvers.',
        directlyObserved: 'Reflectancia Sentinel-1 SAR muestra disminución de concentración de banquisa de 8/10 a 2/10 en 24h.',
        whyItMatters: 'Permite navegación segura de embarcaciones de investigación hacia Bahía Paraíso sin riesgo de compresión.',
        evidence: {
          source: 'Copernicus Sentinel-1 SAR / OSI SAF Sea Ice Edge',
          timestamp: now,
          qualityFlag: 'OPERATIONAL_VERIFIED',
        },
        uncertain: 'Posible cierre rápido si el viento rota al sudoeste en las próximas 18 horas.',
        alternatives: 'Mantener derrota por el Canal Bismarck como vía alternativa de escape.',
        nextRecommendedAction: 'Cruzar con guardia de témpanos reforzada antes de las 18:00 UTC.',
        isForecastRingSimulated: true,
      };
    }

    if (topic === 'FAUNA') {
      return {
        id: `PYTHIA-BIO-${Date.now().toString().slice(-4)}`,
        timestampUtc: now,
        primaryAgent: 'MARINE_BIOLOGIST',
        confidenceScore: 92,
        whatChanged: 'Concentración densa de krill detectada por ecosonda hidroacústica en Boca del Estrecho de Gerlache.',
        directlyObserved: 'Avistamiento confirmado de 14 ballenas jorobadas (Megaptera novaeangliae) en maniobra de alimentación sincronizada.',
        whyItMatters: 'Intersección con la ruta planificada de dos cruceros de expedición turística.',
        evidence: {
          source: 'AMOH Cuaderno de Campo (ID: OBS-2026-401) + Ecosonda Simrad EK80',
          timestamp: now,
          qualityFlag: 'PEER_REVIEWED_GROUND_TRUTH',
        },
        uncertain: 'Dirección de dispersión del enjambre de krill en función de la marea entrante.',
        alternatives: 'Reducir velocidad a 7 nudos o derivar 2 millas náuticas al norte.',
        nextRecommendedAction: 'Emitir aviso de velocidad precautoria (IAATO Whale Watch Guidelines).',
        isForecastRingSimulated: false,
      };
    }

    return {
      id: `PYTHIA-NAV-${Date.now().toString().slice(-4)}`,
      timestampUtc: now,
      primaryAgent: 'NAVAL_STRATEGIST',
      confidenceScore: 79,
      whatChanged: 'Contacto no identificado detectado por SAR a 45 mn al norte de Isla Elefante sin AIS coincidente.',
      directlyObserved: 'Firma radar de 65 metros con velocidad estimada de 4 nudos.',
      whyItMatters: 'Zona CCAMLR de veda para palangreros nocturnos de bacalao.',
      evidence: {
        source: 'Sentinel-1 C-SAR Interferometric Wide Swath + GFW Dark Vessel Pipeline',
        timestamp: now,
        qualityFlag: 'NEAR_REAL_TIME_CORRELATED',
      },
      uncertain: 'Podría tratarse de un buque oceanográfico con transpondedor en mantenimiento o pesquero sin licencia.',
      alternatives: 'Cruzar con datos ópticos del satélite Sentinel-2 en el próximo pase diurno si la nubosidad lo permite.',
      nextRecommendedAction: 'Registrar la posición como contacto de interés en el Registro de Pesquerías AMOH.',
      isForecastRingSimulated: true,
    };
  }
}
