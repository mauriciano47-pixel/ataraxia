import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Filtro fisiológico cardiovascular (PPG) estándar clínico
 */
function sanitizeHeartRateBpm(rawBpm: number): { valid: boolean; bpm: number } {
  if (typeof rawBpm !== 'number' || isNaN(rawBpm) || rawBpm < 40 || rawBpm > 220) {
    return { valid: false, bpm: 0 };
  }
  return { valid: true, bpm: Math.round(rawBpm) };
}

/**
 * Cálculo estándar de Variabilidad del Ritmo Cardíaco (HRV / RMSSD)
 */
function calculateHeartRateVariability(intervalsMs: number[]): number {
  if (!Array.isArray(intervalsMs) || intervalsMs.length < 2) return 0;
  let sumSquaredDiffs = 0;
  for (let i = 0; i < intervalsMs.length - 1; i++) {
    const diff = intervalsMs[i + 1] - intervalsMs[i];
    sumSquaredDiffs += diff * diff;
  }
  const mean = sumSquaredDiffs / (intervalsMs.length - 1);
  return Math.round(Math.sqrt(mean));
}

describe('Ataraxia — Motor Biométrico Óptico & Filtros Cardiovasculares (biometricsPpg)', () => {
  it('1. Debe validar lecturas de BPM dentro de rango fisiológico seguro (40 - 220)', () => {
    assert.equal(sanitizeHeartRateBpm(60).valid, true);
    assert.equal(sanitizeHeartRateBpm(72.4).bpm, 72);
    assert.equal(sanitizeHeartRateBpm(185).valid, true);
    assert.equal(sanitizeHeartRateBpm(220).valid, true);
  });

  it('2. Debe rechazar artefactos, ruido y valores no fisiológicos (<40 o >220)', () => {
    assert.equal(sanitizeHeartRateBpm(20).valid, false);
    assert.equal(sanitizeHeartRateBpm(260).valid, false);
    assert.equal(sanitizeHeartRateBpm(0).valid, false);
    assert.equal(sanitizeHeartRateBpm(-10).valid, false);
    assert.equal(sanitizeHeartRateBpm(NaN).valid, false);
  });

  it('3. Debe calcular RMSSD (HRV) a partir de serie de intervalos RR consecutivos', () => {
    const rrIntervals = [800, 820, 790, 810, 830];
    const rmssd = calculateHeartRateVariability(rrIntervals);
    assert.ok(rmssd > 15 && rmssd < 40, `RMSSD debe estar en rango esperado: ${rmssd}`);
    assert.equal(typeof rmssd, 'number');
  });

  it('4. Debe retornar 0 de HRV si la muestra tiene menos de 2 intervalos', () => {
    assert.equal(calculateHeartRateVariability([]), 0);
    assert.equal(calculateHeartRateVariability([800]), 0);
  });
});
