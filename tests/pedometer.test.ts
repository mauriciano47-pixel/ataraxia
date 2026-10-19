import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateDistanceKm,
  calculateStepCalories,
  calculateSpeedKmh,
  calculatePaceMinKm,
  getActivityModeFromCadence,
} from '../src/lib/fitnessCalculator.ts';
import {
  createPedometerEngineState,
  processAccelerometerSample,
  PEDOMETER_CONSTANTS,
} from '../src/lib/pedometerEngine.ts';

export const PEDOMETER_THRESHOLDS = {
  MIN_HUMAN_CADENCE_SPM: 30,
  MAX_HUMAN_CADENCE_SPM: 230,
  MAX_PEDESTRIAN_SPEED_KMH: 20.0,
  MAX_VIOLENT_ACCEL_MS2: PEDOMETER_CONSTANTS.MAX_VIOLENT_ACCEL_MS2,
};

export function isBiomechanicalStep(cadenceSpm: number, speedKmh: number): boolean {
  if (speedKmh > PEDOMETER_THRESHOLDS.MAX_PEDESTRIAN_SPEED_KMH) {
    return false;
  }
  if (
    cadenceSpm < PEDOMETER_THRESHOLDS.MIN_HUMAN_CADENCE_SPM ||
    cadenceSpm > PEDOMETER_THRESHOLDS.MAX_HUMAN_CADENCE_SPM
  ) {
    return false;
  }
  return true;
}

describe('Ataraxia — Pruebas Estrictas de Usuario Real: Podómetro Biomecánico 24/7', () => {
  it('1. [Simulación Usuario Caminando] Debe detectar con precisión una caminata real de 50 pasos a 112 SPM (muestreo 25Hz)', () => {
    const state = createPedometerEngineState();
    const stepPeriodMs = 60000 / 112; // ~535.7 ms por paso
    const totalStepsToSimulate = 50;
    const totalDurationMs = totalStepsToSimulate * stepPeriodMs;
    let totalDetectedSteps = 0;

    // Simular acelerómetro 3D (teléfono inclinado en bolsillo/mano + impacto plantar periódico)
    for (let t = 0; t <= totalDurationMs; t += 40) {
      const phase = (2 * Math.PI * t) / stepPeriodMs;
      // Señal biomecánica de impacto de talón: fundamental + segundo armónico
      const dynamicImpact = 2.1 * Math.sin(phase) + 0.6 * Math.sin(2 * phase);
      const totalAccel = 9.80665 + dynamicImpact;

      // Distribuir en 3 ejes (invariante a orientación: 0.6x, 0.7y, 0.387z -> norma = 1)
      const rx = totalAccel * 0.6;
      const ry = totalAccel * 0.7;
      const rz = totalAccel * Math.sqrt(1 - 0.36 - 0.49);

      const res = processAccelerometerSample(state, rx, ry, rz, 1000 + t, 'standard', false);
      totalDetectedSteps += res.stepsAdded;
    }

    assert.ok(
      totalDetectedSteps >= 48 && totalDetectedSteps <= 51,
      `El usuario dio ${totalStepsToSimulate} pasos reales y el motor detectó ${totalDetectedSteps} (precisión >= 96%)`,
    );
  });

  it('2. [Arranque de Marcha desde Reposo] Debe acreditar los primeros 4 pasos aunque el usuario acelere gradualmente al empezar a caminar', () => {
    const state = createPedometerEngineState();
    // Intervalos progresivos típicos al arrancar del reposo: 700ms, 590ms, 500ms (varianza = 200ms)
    const stepDurations = [700, 620, 520, 500];
    let now = 10000;
    let detected = 0;

    for (const periodMs of stepDurations) {
      for (let localT = 0; localT < periodMs; localT += 40) {
        now += 40;
        const phase = (2 * Math.PI * localT) / periodMs;
        const accel = 9.80665 + 2.2 * Math.sin(phase);
        const res = processAccelerometerSample(state, 0, accel, 0, now, 'standard', false);
        detected += res.stepsAdded;
      }
    }

    assert.equal(detected, 4, `Los 4 pasos iniciales de arranque de marcha deben acreditarse íntegramente (detectados: ${detected})`);
  });

  it('3. [Falsos Positivos: Golpes en Escritorio, Vibración Rápida y Sacudidas] Debe registrar 0 pasos ante ruido no humano', () => {
    const state = createPedometerEngineState();
    let falseSteps = 0;
    let now = 50000;

    // Caso A: 2 golpes aislados dejando el celular en la mesa (menos de 4 pasos rítmicos)
    for (let i = 0; i < 2; i++) {
      for (let localT = 0; localT < 500; localT += 40) {
        now += 40;
        const phase = (2 * Math.PI * localT) / 500;
        const accel = 9.80665 + 2.0 * Math.sin(phase);
        falseSteps += processAccelerometerSample(state, 0, 0, accel, now, 'standard', false).stepsAdded;
      }
    }
    // Pausa de 3 segundos en la mesa
    now += 3000;

    // Caso B: Vibración rápida de motor o agitación nerviosa de mano (5 Hz = 200ms período < 260ms)
    for (let t = 0; t < 4000; t += 40) {
      now += 40;
      const phase = (2 * Math.PI * t) / 200;
      const accel = 9.80665 + 2.5 * Math.sin(phase);
      falseSteps += processAccelerometerSample(state, 0, accel, 0, now, 'standard', false).stepsAdded;
    }

    // Caso C: Sacudida violenta (> 25 m/s²)
    for (let t = 0; t < 2000; t += 40) {
      now += 40;
      falseSteps += processAccelerometerSample(state, 20, 20, 10, now, 'standard', false).stepsAdded;
    }

    // Caso D: Usuario en automóvil / Modo Tránsito activo (baches rítmicos)
    for (let t = 0; t < 5000; t += 40) {
      now += 40;
      const phase = (2 * Math.PI * t) / 550;
      const accel = 9.80665 + 2.2 * Math.sin(phase);
      falseSteps += processAccelerometerSample(state, 0, accel, 0, now, 'standard', true).stepsAdded;
    }

    assert.equal(falseSteps, 0, `Cero pasos falsos deben acreditarse ante golpes aislados, vibraciones o vehículo (registrados: ${falseSteps})`);
  });

  it('4. [Telemetría Biomecánica Completa] Debe calcular modo de actividad, distancia ACSM, velocidad, ritmo y kcal MET con exactitud', () => {
    assert.equal(getActivityModeFromCadence(0), 'idle');
    assert.equal(getActivityModeFromCadence(85), 'walking');
    assert.equal(getActivityModeFromCadence(115), 'jogging');
    assert.equal(getActivityModeFromCadence(155), 'running');

    const distWalk = calculateDistanceKm(10000, 175, 'walking');
    assert.ok(distWalk >= 7.1 && distWalk <= 7.4, `Distancia 10k pasos a 175cm debe ser ~7.26km: ${distWalk}`);

    const speedWalk = calculateSpeedKmh(110, 175, 'walking');
    assert.ok(speedWalk >= 4.5 && speedWalk <= 5.2, `Velocidad a 110 SPM debe ser ~4.8 km/h: ${speedWalk}`);

    const pace = calculatePaceMinKm(5.0);
    assert.equal(pace, '12:00');

    const cals = calculateStepCalories(10000, 75, 175, 95, 0);
    assert.ok(cals >= 320 && cals <= 520, `Calorías MET para 10k pasos (75kg) deben estar en rango clínico: ${cals}`);
  });
});
