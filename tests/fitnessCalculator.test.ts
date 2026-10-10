import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateBMR,
  calculateTDEE,
  calculateFitnessIndex,
  getPersonalStrideLength,
  getActivityModeFromCadence,
  getMETFromCadence,
  calculateStepCalories,
  calculateDistanceKm,
  calculateSpeedKmh,
  calculatePaceMinKm,
} from '../src/lib/fitnessCalculator.ts';
import type { UserMetrics } from '../src/types/dailyLog.ts';

describe('Ataraxia — Motor de Biometría & Fitness (fitnessCalculator)', () => {
  const maleAthlete: UserMetrics = {
    weightKg: 80,
    heightCm: 180,
    age: 30,
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintenance',
  };

  const femaleAthlete: UserMetrics = {
    weightKg: 60,
    heightCm: 165,
    age: 25,
    gender: 'female',
    activityLevel: 'active',
    goal: 'deficit',
  };

  it('1. Debe calcular BMR masculino con fórmula Mifflin-St Jeor (+5)', () => {
    // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    const bmr = calculateBMR(maleAthlete.weightKg, maleAthlete.heightCm, maleAthlete.age, maleAthlete.gender);
    assert.equal(bmr, 1780);
  });

  it('2. Debe calcular BMR femenino con fórmula Mifflin-St Jeor (-161)', () => {
    // 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25 -> 1345
    const bmr = calculateBMR(femaleAthlete.weightKg, femaleAthlete.heightCm, femaleAthlete.age, femaleAthlete.gender);
    assert.equal(bmr, 1345);
  });

  it('3. Debe calcular TDEE según los 5 niveles de actividad física', () => {
    const bmr = 1500;
    assert.equal(calculateTDEE(bmr, 'sedentary'), Math.round(1500 * 1.2));   // 1800
    assert.equal(calculateTDEE(bmr, 'light'), Math.round(1500 * 1.375));     // 2063
    assert.equal(calculateTDEE(bmr, 'moderate'), Math.round(1500 * 1.55));   // 2325
    assert.equal(calculateTDEE(bmr, 'active'), Math.round(1500 * 1.725));    // 2588
    assert.equal(calculateTDEE(bmr, 'athlete'), Math.round(1500 * 1.9));     // 2850
  });

  it('4. Debe calcular FitnessIndex para déficit calórico (-18%) y macros proteicos altos', () => {
    const result = calculateFitnessIndex(femaleAthlete);
    assert.equal(result.bmr, 1345);
    const expectedTdee = Math.round(1345 * 1.725); // 2320
    assert.equal(result.tdee, expectedTdee);
    assert.equal(result.targetCalories, Math.round(expectedTdee * 0.82));
    assert.equal(result.macros.proteinPct, 40);
    assert.equal(result.macros.carbsPct, 35);
    assert.equal(result.macros.fatsPct, 25);
    assert.ok(result.macros.protein > 0);
    assert.ok(result.macros.carbs > 0);
    assert.ok(result.macros.fats > 0);
  });

  it('5. Debe calcular FitnessIndex para superávit calórico (+12%)', () => {
    const surplusMetrics: UserMetrics = {
      ...maleAthlete,
      goal: 'surplus',
    };
    const result = calculateFitnessIndex(surplusMetrics);
    const expectedTdee = Math.round(1780 * 1.55); // 2759
    assert.equal(result.targetCalories, Math.round(expectedTdee * 1.12));
    assert.equal(result.macros.proteinPct, 25);
    assert.equal(result.macros.carbsPct, 50);
    assert.equal(result.macros.fatsPct, 25);
  });

  it('6. Debe calcular longitud de zancada personal según estándar ACSM', () => {
    const height = 180;
    const walkingStride = getPersonalStrideLength(height, 'walking');
    const joggingStride = getPersonalStrideLength(height, 'jogging');
    const runningStride = getPersonalStrideLength(height, 'running');

    assert.equal(walkingStride, 1.8 * 0.413);
    assert.equal(joggingStride, 1.8 * 0.460);
    assert.equal(runningStride, 1.8 * 0.497);
    assert.ok(walkingStride < joggingStride && joggingStride < runningStride);
  });

  it('7. Debe clasificar ActivityMode según cadencia en SPM', () => {
    assert.equal(getActivityModeFromCadence(0), 'idle');
    assert.equal(getActivityModeFromCadence(45), 'idle');
    assert.equal(getActivityModeFromCadence(80), 'walking');
    assert.equal(getActivityModeFromCadence(115), 'jogging');
    assert.equal(getActivityModeFromCadence(145), 'running');
  });

  it('8. Debe retornar MET creciente según cadencia en SPM', () => {
    assert.equal(getMETFromCadence(0), 1.0);
    assert.equal(getMETFromCadence(70), 2.5);
    assert.equal(getMETFromCadence(90), 3.5);
    assert.equal(getMETFromCadence(115), 5.5);
    assert.equal(getMETFromCadence(125), 7.0);
    assert.equal(getMETFromCadence(160), 11.5);
    assert.equal(getMETFromCadence(180), 14.0);
  });

  it('9. Debe calcular calorías quemadas por pasos usando ecuación MET', () => {
    const calories = calculateStepCalories(10000, 70, 175, 85, 0);
    assert.ok(calories > 200 && calories < 500, `Calorías estimadas esperadas en rango biomecánico: ${calories}`);
    assert.equal(calculateStepCalories(0, 70, 175), 0);
  });

  it('10. Debe calcular distancia exacta en km y velocidad en km/h', () => {
    const dist = calculateDistanceKm(5000, 180, 'walking');
    assert.ok(dist > 3.0 && dist < 4.0, `Distancia en km debe ser ~3.7km: ${dist}`);

    const speed = calculateSpeedKmh(100, 180, 'walking');
    assert.ok(speed > 4.0 && speed < 5.0, `Velocidad caminata debe ser ~4.5 km/h: ${speed}`);
  });

  it('11. Debe formatear ritmo (Pace) en min/km correctamente', () => {
    assert.equal(calculatePaceMinKm(0), '--:--');
    assert.equal(calculatePaceMinKm(-5), '--:--');
    // 10 km/h -> 60 / 10 = 6:00 min/km
    assert.equal(calculatePaceMinKm(10), '6:00');
    // 12 km/h -> 60 / 12 = 5:00 min/km
    assert.equal(calculatePaceMinKm(12), '5:00');
  });
});
