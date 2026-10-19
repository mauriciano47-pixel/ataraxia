import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  createPpgEngineState,
  isOpticalFingerCovered,
  processPpgOpticalSample,
  sanitizeHeartRateBpm,
  calculateHeartRateVariability,
  evaluateStoicHeartRateCoherence,
} from '../src/lib/ppgEngine.ts';

describe('Ataraxia — Pruebas Estrictas de Usuario Real: Lector Óptico de Pulso (PPG) & Auditoría Estoica', () => {
  it('1. [Detección Óptica de Dedo en Cámara] Debe distinguir piel humana iluminada vs lente descubierta o luz blanca', () => {
    // Dedo cubriendo lente con flash (transmisión hemoglobina roja dominante)
    assert.equal(isOpticalFingerCovered(185, 82, 55), true);
    assert.equal(isOpticalFingerCovered(140, 95, 70), true);

    // Lente descubierta apuntando a habitación o mesa oscura
    assert.equal(isOpticalFingerCovered(45, 42, 40), false);
    // Lente apuntando a lámpara blanca brillante (saturación R, G, B altos)
    assert.equal(isOpticalFingerCovered(245, 235, 230), false);
  });

  it('2. [Usuario en Reposo ~68 BPM] Debe medir con exactitud el pulso real de 68 BPM a partir del stream óptico de 30 FPS (15 segundos)', () => {
    const state = createPpgEngineState();
    const targetBpm = 68;
    const beatPeriodMs = 60000 / targetBpm; // ~882.35 ms
    const frameIntervalMs = 33; // ~30 FPS

    let lastResult = { beatDetected: false, bpm: 0, hrvRmssd: 0, acWaveValue: 0, peaksCount: 0 };

    // Simular 15 segundos de video (455 frames) con onda pletismográfica sistólica + deriva respiratoria lenta
    for (let t = 0; t <= 15000; t += frameIntervalMs) {
      const systolicWave = 2.8 * Math.sin((2 * Math.PI * t) / beatPeriodMs);
      const respiratoryBaseline = 1.2 * Math.sin((2 * Math.PI * t) / 4500);
      const avgRed = 175 + respiratoryBaseline + systolicWave;

      lastResult = processPpgOpticalSample(state, avgRed, 1000 + t);
    }

    assert.ok(
      lastResult.bpm >= 66 && lastResult.bpm <= 70,
      `Para un pulso capilar real de ${targetBpm} BPM en reposo, el escáner debe medir 68 ± 2 BPM (obtenido: ${lastResult.bpm} BPM)`,
    );
    assert.ok(lastResult.peaksCount >= 14, `Debe haber detectado al menos 14 latidos sistólicos en 15s (detectados: ${lastResult.peaksCount})`);
  });

  it('3. [Usuario Post-Serie al Fallo RPE 10 a ~152 BPM] Debe medir ~152 BPM reales y aprobar la Auditoría Estoica por esfuerzo auténtico', () => {
    const state = createPpgEngineState();
    const targetHighBpm = 152;
    const beatPeriodMs = 60000 / targetHighBpm; // ~394.7 ms
    const frameIntervalMs = 33;

    let lastResult = { beatDetected: false, bpm: 0, hrvRmssd: 0, acWaveValue: 0, peaksCount: 0 };

    for (let t = 0; t <= 15000; t += frameIntervalMs) {
      const systolicWave = 3.2 * Math.sin((2 * Math.PI * t) / beatPeriodMs);
      const avgRed = 182 + systolicWave;
      lastResult = processPpgOpticalSample(state, avgRed, 5000 + t);
    }

    assert.ok(
      lastResult.bpm >= 149 && lastResult.bpm <= 155,
      `Post-serie intensa a ${targetHighBpm} BPM, el escáner debe reflejar ~152 BPM reales sin estancarse en 68-75 BPM (obtenido: ${lastResult.bpm} BPM)`,
    );

    const audit = evaluateStoicHeartRateCoherence(10, lastResult.bpm);
    assert.equal(audit.status, 'coherent_high');
    assert.equal(audit.requiresCalibrationWarning, false);
  });

  it('4. [Detección de Autoengaño en Auditoría Estoica] Debe alertar incongruencia si el usuario declara RPE 10 pero su pulso medido es de reposo (72 BPM)', () => {
    const auditFakeFailure = evaluateStoicHeartRateCoherence(10, 72);
    assert.equal(auditFakeFailure.status, 'suspicious_low');
    assert.equal(auditFakeFailure.requiresCalibrationWarning, true);
  });

  it('5. [Sanitización Clínica y Cálculo de HRV RMSSD] Debe rechazar artefactos fuera de 40-220 BPM y calcular RMSSD con precisión', () => {
    assert.equal(sanitizeHeartRateBpm(60).valid, true);
    assert.equal(sanitizeHeartRateBpm(185).valid, true);
    assert.equal(sanitizeHeartRateBpm(25).valid, false);
    assert.equal(sanitizeHeartRateBpm(255).valid, false);
    assert.equal(sanitizeHeartRateBpm(Number.NaN).valid, false);

    const rrIntervals = [800, 825, 790, 815, 835];
    const rmssd = calculateHeartRateVariability(rrIntervals);
    assert.ok(rmssd >= 20 && rmssd <= 35, `RMSSD calculado correctamente en ms: ${rmssd}`);
    assert.equal(calculateHeartRateVariability([800]), 0);
  });
});
