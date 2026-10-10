import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateDistanceKm,
  calculateStepCalories,
  calculateSpeedKmh,
  getActivityModeFromCadence,
} from '../src/lib/fitnessCalculator.ts';

// Parámetros biomecánicos de filtrado calibrados (AOSP StepDetector & Ataraxia Pedometer)
export const PEDOMETER_THRESHOLDS = {
  MIN_HUMAN_CADENCE_SPM: 33,    // 1800ms período
  MAX_HUMAN_CADENCE_SPM: 240,   // 250ms período (sprint olímpico)
  MAX_PEDESTRIAN_SPEED_KMH: 20.0, // 5.55 m/s límite caminata/trote; por encima es vehículo
  MAX_VIOLENT_ACCEL_MS2: 14.50, // Límite de aceleración biológica
};

export function isBiomechanicalStep(cadenceSpm: number, speedKmh: number): boolean {
  if (speedKmh > PEDOMETER_THRESHOLDS.MAX_PEDESTRIAN_SPEED_KMH) {
    return false; // Filtro anti-vehículo: automóvil / metro / autobús
  }
  if (
    cadenceSpm < PEDOMETER_THRESHOLDS.MIN_HUMAN_CADENCE_SPM ||
    cadenceSpm > PEDOMETER_THRESHOLDS.MAX_HUMAN_CADENCE_SPM
  ) {
    return false; // Vibración estática o micro-movimiento fuera de rango biológico
  }
  return true;
}

describe('Ataraxia — Podómetro Biomecánico & Filtro Anti-Vehículo (pedometer)', () => {
  it('1. Debe validar pasos dentro del rango biomecánico humano (100 SPM a 5 km/h)', () => {
    assert.equal(isBiomechanicalStep(100, 5.0), true);
    assert.equal(isBiomechanicalStep(140, 9.5), true); // Carrera moderada
  });

  it('2. Debe activar el filtro anti-vehículo y rechazar pasos a velocidades automovilísticas (> 20 km/h)', () => {
    assert.equal(isBiomechanicalStep(110, 45.0), false); // En autobús o taxi
    assert.equal(isBiomechanicalStep(100, 80.0), false); // En carretera
    assert.equal(isBiomechanicalStep(90, 21.0), false);  // Justo sobre el umbral
  });

  it('3. Debe rechazar vibraciones estáticas o frecuencias no humanas (< 33 SPM o > 240 SPM)', () => {
    assert.equal(isBiomechanicalStep(12, 1.0), false);  // Micro-vibración en escritorio
    assert.equal(isBiomechanicalStep(300, 10.0), false); // Artefacto de motor o vibrador
  });

  it('4. Debe correlacionar cadencia con modo de actividad y distancia precisa', () => {
    const walkingCadence = 95; // SPM
    const mode = getActivityModeFromCadence(walkingCadence);
    assert.equal(mode, 'walking');

    const distKm = calculateDistanceKm(10000, 175, mode);
    assert.ok(distKm > 7.0 && distKm < 7.5, `10.000 pasos a 175cm deben ser ~7.2km: ${distKm}`);

    const cals = calculateStepCalories(10000, 75, 175, walkingCadence);
    assert.ok(cals >= 300 && cals <= 500, `Gasto NEAT esperado ~350-450 kcal: ${cals}`);
  });
});
