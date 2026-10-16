import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { SafeStorage } from '../src/utils/safeStorage.ts';
import { Telemetry } from '../src/lib/telemetry.ts';
import { calculateTodayGrade } from '../src/lib/cycleGrading.ts';
import { getSubscriptionStatus } from '../src/utils/stripeService.ts';
import { DEFAULT_LOG } from '../src/types/dailyLog.ts';

describe('Ataraxia — Chaos Engineering & Fault-Injection Suite (Resiliencia Extrema)', () => {
  beforeEach(() => {
    SafeStorage.clearAll();
    Telemetry.clearBreadcrumbs();
    Telemetry.clearIncidents();
  });

  test('1. Corrupción de Almacenamiento Local: JSON truncado en SafeStorage no colapsa la Telemetría ni el Ciclo Diario', () => {
    const corruptedPayloads = [
      '{corrupted_json: [1, 2, ',
      '<<<XSS_PAYLOAD>>>',
      '\u0000\u0001\uFFFF',
      '{"totalHours": "NOT_A_NUMBER"}',
      'null',
      'undefined',
    ];

    for (const payload of corruptedPayloads) {
      SafeStorage.setItem('ataraxia_telemetry_last_incident', payload);
      SafeStorage.setItem('ataraxia_sleep_record_v1', payload);
      SafeStorage.setItem('ataraxia_subscription_v1', payload);

      // Ningún módulo debe lanzar excepción no capturada; deben conmutar a estado seguro
      assert.doesNotThrow(() => {
        const incident = Telemetry.getLastIncident();
        assert.ok(incident === null || typeof incident === 'object');
      });

      assert.doesNotThrow(() => {
        const grade = calculateTodayGrade(DEFAULT_LOG);
        assert.ok(Number.isFinite(grade.score));
        assert.ok(Number.isFinite(grade.sleepHours) && grade.sleepHours >= 0);
      });

      assert.doesNotThrow(() => {
        const sub = getSubscriptionStatus();
        assert.ok(sub && typeof sub.tier === 'string');
      });
    }
  });

  test('2. Tormenta de Excepciones (Exception Storm): El anillo de Telemetría absorbe 200 fallos concurrentes sin fuga de memoria', () => {
    for (let i = 0; i < 200; i++) {
      Telemetry.addBreadcrumb('chaos-storm', `Evento de alta frecuencia #${i}`, { idx: i });
      if (i % 10 === 0) {
        Telemetry.captureException(new Error(`Fallo inyectado #${i}`), { stormIteration: i });
      }
    }

    const crumbs = Telemetry.getBreadcrumbs();
    assert.equal(crumbs.length, 25, 'El buffer circular debe mantenerse estrictamente acotado en 25 entradas');
    const lastIncident = Telemetry.getLastIncident();
    assert.ok(lastIncident);
    assert.equal(lastIncident?.message, 'Fallo inyectado #190');
  });
});
