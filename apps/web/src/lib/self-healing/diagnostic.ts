/**
 * AMOH V9 — Self-Healing Engine: Ring 2 (AI Diagnostic)
 * Analyzes health anomalies, classifies failure domains, and predicts upstream risks.
 */

import type { HealthAnomaly } from './detector';

export interface Diagnosis {
  anomalyId: string;
  rootCause: string;
  classification: 'RED' | 'AUTH' | 'QUERY' | 'SCHEMA' | 'UI' | 'VIEWPORT';
  repairPlan: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  autoRepairable: boolean;
  scientificExplanation: string;
}

export class AIDiagnostic {
  public analyze(anomaly: HealthAnomaly): Diagnosis {
    const msg = anomaly.message.toLowerCase();

    // 1. Auth & Credentials
    if (anomaly.type === 'AUTH' || msg.includes('401') || msg.includes('403') || msg.includes('unauthorized')) {
      return {
        anomalyId: anomaly.id,
        rootCause: 'Token upstream o credencial de proveedor expirada o no autorizada.',
        classification: 'AUTH',
        repairPlan: [
          'Verificar clave en entorno local',
          'Recargar token de sesión',
          'Degradar a caché local verificada (Offline Fallback)',
        ],
        riskLevel: 'LOW',
        autoRepairable: true,
        scientificExplanation:
          'El proveedor de datos satelitales/marítimos requiere renovación de token. Se activa la copia local de respaldo de la base de datos de expedición sin interrumpir la visualización.',
      };
    }

    // 2. Rate Limits
    if (msg.includes('429') || msg.includes('rate limit')) {
      return {
        anomalyId: anomaly.id,
        rootCause: 'Cuota de peticiones API alcanzada para el intervalo actual.',
        classification: 'RED',
        repairPlan: [
          'Activar backoff exponencial con jitter',
          'Aumentar tiempo entre refrescos a 60s',
          'Servir últimos registros cacheados',
        ],
        riskLevel: 'LOW',
        autoRepairable: true,
        scientificExplanation:
          'Se ha alcanzado el límite de consultas por minuto. El sistema retiene los últimos datos válidos y pausa nuevas solicitudes hasta restablecer la ventana de cuota.',
      };
    }

    // 3. Query Bbox / Parameter Issues
    if (anomaly.type === 'QUERY' || msg.includes('422') || msg.includes('invalid bbox')) {
      return {
        anomalyId: anomaly.id,
        rootCause: 'Consulta espacial restringida o mal formada. Se requiere bbox maestra antártica.',
        classification: 'QUERY',
        repairPlan: [
          'Forzar bounding box circumpolar maestra [-180, -90, 180, -45]',
          'Reintentar query con esquema V9',
        ],
        riskLevel: 'MEDIUM',
        autoRepairable: true,
        scientificExplanation:
          'La consulta no respetó el rango circumpolar completo. Se reajusta automáticamente al dominio continental antártico.',
      };
    }

    // 4. Viewport / WebGL context loss
    if (anomaly.type === 'VIEWPORT' || msg.includes('webgl') || msg.includes('canvas')) {
      return {
        anomalyId: anomaly.id,
        rootCause: 'Contexto gráfico WebGL saturado o cámara fuera del dominio antártico.',
        classification: 'VIEWPORT',
        repairPlan: [
          'Centrar cámara en Polo Sur [-50, -82, pitch 38]',
          'Restablecer proyección polar',
          'Reducir LOD de capas complejas',
        ],
        riskLevel: 'MEDIUM',
        autoRepairable: true,
        scientificExplanation:
          'La vista del mapa se desvió de las coordenadas válidas. El auto-reparador reposiciona la cámara en el centro orbital antártico.',
      };
    }

    // Default / Server errors (500, 502, 503)
    return {
      anomalyId: anomaly.id,
      rootCause: `Fallo upstream del servicio (${anomaly.target}).`,
      classification: anomaly.type || 'RED',
      repairPlan: [
        'Conmutar a modo OFFLINE_FALLBACK con DuckDB/IndexedDB',
        'Programar reintento silencioso en 5 minutos',
        'Notificar en el indicador de telemetría',
      ],
      riskLevel: 'LOW',
      autoRepairable: true,
      scientificExplanation:
        'El servidor remoto no respondió adecuadamente. Se mantiene la visualización usando la última instantánea científica almacenada localmente.',
    };
  }
}
