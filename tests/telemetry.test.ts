import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Telemetry } from '../src/lib/telemetry.ts';

describe('Suite de Observabilidad & Telemetría (Institutional Observability Gateway)', () => {
  beforeEach(() => {
    Telemetry.clearBreadcrumbs();
    Telemetry.clearIncidents();
  });

  test('debe agregar y recuperar breadcrumbs en orden cronológico', () => {
    Telemetry.addBreadcrumb('navigation', 'Usuario abrió pantalla Hoy', { route: '/' });
    Telemetry.addBreadcrumb('sensor', 'Paso registrado con podómetro', { count: 120 });

    const crumbs = Telemetry.getBreadcrumbs();
    assert.equal(crumbs.length, 2);
    assert.equal(crumbs[0].category, 'navigation');
    assert.equal(crumbs[1].category, 'sensor');
    assert.equal(crumbs[1].data?.count, 120);
  });

  test('debe limitar los breadcrumbs al tamaño máximo del buffer rotatorio (25)', () => {
    for (let i = 0; i < 30; i++) {
      Telemetry.addBreadcrumb('action', `Paso de prueba ${i}`);
    }

    const crumbs = Telemetry.getBreadcrumbs();
    assert.equal(crumbs.length, 25);
    // El primer breadcrumb debe ser el índice 5 (30 - 25)
    assert.equal(crumbs[0].message, 'Paso de prueba 5');
    assert.equal(crumbs[24].message, 'Paso de prueba 29');
  });

  test('debe capturar y persistir una excepción en el buffer local seguro', () => {
    Telemetry.addBreadcrumb('ui', 'Click en botón de cálculo');
    const testError = new Error('Fallo simulado en motor biomecánico');

    const event = Telemetry.captureException(testError, { userId: 'archon-test' });

    assert.equal(event.name, 'Error');
    assert.equal(event.message, 'Fallo simulado en motor biomecánico');
    assert.equal(event.breadcrumbs.length, 1);
    assert.equal(event.deviceMeta.userId, 'archon-test');

    // Comprobar persistencia
    const stored = Telemetry.getLastIncident();
    assert.ok(stored);
    assert.equal(stored?.message, 'Fallo simulado en motor biomecánico');
  });

  test('debe manejar errores no estándar (strings o literales) sin colapsar', () => {
    const event = Telemetry.captureException('Excepción cruda en formato string');
    assert.equal(event.name, 'Error');
    assert.equal(event.message, 'Excepción cruda en formato string');
  });

  test('debe limpiar los incidentes tras su resolución', () => {
    Telemetry.captureException(new Error('Incidente temporal'));
    assert.ok(Telemetry.getLastIncident());

    Telemetry.clearIncidents();
    assert.equal(Telemetry.getLastIncident(), null);
  });
});
