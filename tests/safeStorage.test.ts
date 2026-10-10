import test, { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { SafeStorage } from '../src/utils/safeStorage.ts';

describe('Ataraxia — Persistencia Offline-First & Resiliencia (SafeStorage)', () => {
  beforeEach(() => {
    SafeStorage.clearAll();
  });

  it('1. Debe guardar y recuperar cadenas de texto en el almacenamiento seguro', () => {
    const success = SafeStorage.setItem('ataraxia_user_rank', 'Hoplita Probado');
    assert.equal(success, true);

    const retrieved = SafeStorage.getItem('ataraxia_user_rank');
    assert.equal(retrieved, 'Hoplita Probado');
  });

  it('2. Debe retornar null para claves inexistentes', () => {
    const missing = SafeStorage.getItem('clave_inexistente_xyz');
    assert.equal(missing, null);
  });

  it('3. Debe eliminar elementos con removeItem', () => {
    SafeStorage.setItem('temp_metric', '12345');
    assert.equal(SafeStorage.getItem('temp_metric'), '12345');

    SafeStorage.removeItem('temp_metric');
    assert.equal(SafeStorage.getItem('temp_metric'), null);
  });

  it('4. Debe serializar y deserializar estructuras JSON complejas sin corromper datos', () => {
    const payload = {
      day: 14,
      score: 88,
      pillars: { training: true, nutrition: true, sleep: true },
      archetype: 'spartan_commander',
    };

    SafeStorage.setItem('ataraxia_test_json', JSON.stringify(payload));
    const raw = SafeStorage.getItem('ataraxia_test_json');
    assert.ok(raw);

    const parsed = JSON.parse(raw);
    assert.equal(parsed.day, 14);
    assert.equal(parsed.score, 88);
    assert.equal(parsed.archetype, 'spartan_commander');
    assert.equal(parsed.pillars.training, true);
  });

  it('5. Debe purgar todo el estado con clearAll manteniendo la estabilidad del sistema', () => {
    SafeStorage.setItem('k1', 'v1');
    SafeStorage.setItem('k2', 'v2');
    SafeStorage.clearAll();

    assert.equal(SafeStorage.getItem('k1'), null);
    assert.equal(SafeStorage.getItem('k2'), null);
  });
});
