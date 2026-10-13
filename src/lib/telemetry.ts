/**
 * Ataraxia — Telemetry & Observability Gateway (Grado Institucional)
 * Proporciona recolección de métricas, breadcrumbs, captura de excepciones
 * y fallback offline-first con buffer de incidentes.
 */

import { logger } from './logger.ts';
import { SafeStorage } from '../utils/safeStorage.ts';

export interface TelemetryBreadcrumb {
  timestamp: string;
  category: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface TelemetryErrorEvent {
  timestamp: string;
  name: string;
  message: string;
  stack?: string;
  breadcrumbs: TelemetryBreadcrumb[];
  deviceMeta: Record<string, unknown>;
}

const MAX_BREADCRUMBS = 25;
const breadcrumbRing: TelemetryBreadcrumb[] = [];

export const Telemetry = {
  addBreadcrumb(category: string, message: string, data?: Record<string, unknown>): void {
    const entry: TelemetryBreadcrumb = {
      timestamp: new Date().toISOString(),
      category,
      message,
      data,
    };
    breadcrumbRing.push(entry);
    if (breadcrumbRing.length > MAX_BREADCRUMBS) {
      breadcrumbRing.shift();
    }
  },

  getBreadcrumbs(): TelemetryBreadcrumb[] {
    return [...breadcrumbRing];
  },

  clearBreadcrumbs(): void {
    breadcrumbRing.length = 0;
  },

  captureException(error: unknown, context?: Record<string, unknown>): TelemetryErrorEvent {
    const errObj = error instanceof Error ? error : new Error(String(error));
    const event: TelemetryErrorEvent = {
      timestamp: new Date().toISOString(),
      name: errObj.name,
      message: errObj.message,
      stack: errObj.stack,
      breadcrumbs: [...breadcrumbRing],
      deviceMeta: {
        platform: typeof window !== 'undefined' ? 'web' : 'node/native',
        ...context,
      },
    };

    logger.error('[Telemetry Crash Intercepted]:', event.name, event.message);

    // Buffer local seguro para diagnóstico de caja negra post-incidente
    try {
      SafeStorage.setItem('ataraxia_telemetry_last_incident', JSON.stringify(event));
    } catch {
      // Failsafe silencioso
    }

    return event;
  },

  getLastIncident(): TelemetryErrorEvent | null {
    try {
      const raw = SafeStorage.getItem('ataraxia_telemetry_last_incident');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  clearIncidents(): void {
    try {
      SafeStorage.setItem('ataraxia_telemetry_last_incident', '');
    } catch {}
  },
};
