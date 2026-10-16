import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBMR,
  calculateTDEE,
  calculateFitnessIndex,
  getActivityModeFromCadence,
  getMETFromCadence,
  calculateStepCalories,
  calculateDistanceKm,
  calculateSpeedKmh,
  calculatePaceMinKm,
} from '../src/lib/fitnessCalculator.ts';
import { calculateTodayGrade } from '../src/lib/cycleGrading.ts';
import { DEFAULT_LOG } from '../src/types/dailyLog.ts';
import type { UserMetrics, DailyLog } from '../src/types/dailyLog.ts';

/**
 * Generador Pseudo-Aleatorio Determinista (Mulberry32 PRNG)
 * Garantiza reproducibilidad exacta al 100% en auditorías de CI/CD.
 */
function createSeededPRNG(seed: number) {
  let a = seed;
  return function nextFloat(): number {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const EXTREME_NUMBERS: number[] = [
  NaN,
  Infinity,
  -Infinity,
  0,
  -0,
  -1,
  -999999,
  Number.MAX_SAFE_INTEGER,
  Number.MIN_SAFE_INTEGER,
  Number.EPSILON,
  1e-12,
  1e12,
  170.555555555,
];

describe('Ataraxia — Property-Based Testing & Fuzzing Matemático (Grado Institucional)', () => {
  test('1. Invariante Metabólico: calculateBMR, calculateTDEE y calculateFitnessIndex jamás retornan NaN, Infinity ni negativos bajo 500 vectores extremos', () => {
    const rand = createSeededPRNG(742091);
    const activities: UserMetrics['activityLevel'][] = ['sedentary', 'light', 'moderate', 'active', 'athlete'];
    const goals: UserMetrics['goal'][] = ['deficit', 'maintenance', 'surplus'];

    for (let i = 0; i < 500; i++) {
      const useExtreme = i < EXTREME_NUMBERS.length * 4;
      const weightKg = useExtreme
        ? EXTREME_NUMBERS[i % EXTREME_NUMBERS.length]
        : (rand() - 0.3) * 600;
      const heightCm = useExtreme
        ? EXTREME_NUMBERS[(i + 3) % EXTREME_NUMBERS.length]
        : (rand() - 0.3) * 400;
      const age = useExtreme
        ? EXTREME_NUMBERS[(i + 7) % EXTREME_NUMBERS.length]
        : (rand() - 0.2) * 200;
      const gender = rand() > 0.5 ? 'male' : 'female';
      const activityLevel = activities[i % activities.length];
      const goal = goals[i % goals.length];

      const res = calculateFitnessIndex({
        weightKg,
        heightCm,
        age,
        gender,
        activityLevel,
        goal,
      });

      assert.ok(Number.isFinite(res.bmr), `BMR no finito en iteración ${i}: ${res.bmr}`);
      assert.ok(res.bmr >= 500, `BMR bajo mínimo biológico en iteración ${i}: ${res.bmr}`);
      assert.ok(Number.isFinite(res.tdee) && res.tdee >= res.bmr, `TDEE inválido en iteración ${i}: ${res.tdee}`);
      assert.ok(Number.isFinite(res.targetCalories) && res.targetCalories > 0, `TargetCalories inválido: ${res.targetCalories}`);
      assert.ok(Number.isFinite(res.macros.protein) && res.macros.protein >= 0, 'Proteína inválida');
      assert.ok(Number.isFinite(res.macros.carbs) && res.macros.carbs >= 0, 'Carbohidratos inválidos');
      assert.ok(Number.isFinite(res.macros.fats) && res.macros.fats >= 0, 'Grasas inválidas');
      assert.equal(
        res.macros.proteinPct + res.macros.carbsPct + res.macros.fatsPct,
        100,
        'La suma porcentual de macronutrientes debe ser siempre 100%'
      );
    }
  });

  test('2. Invariante Biomecánico: Cadencia, MET, Distancia, Velocidad y Ritmo resisten 500 inyecciones de caos numérico', () => {
    const rand = createSeededPRNG(1337);
    const validModes = new Set(['idle', 'walking', 'jogging', 'running']);

    for (let i = 0; i < 500; i++) {
      const steps = i < EXTREME_NUMBERS.length ? EXTREME_NUMBERS[i] : (rand() - 0.25) * 300000;
      const cadence = i < EXTREME_NUMBERS.length ? EXTREME_NUMBERS[(i + 2) % EXTREME_NUMBERS.length] : (rand() - 0.2) * 350;
      const weight = (rand() - 0.2) * 400;
      const height = (rand() - 0.2) * 300;
      const speed = i < EXTREME_NUMBERS.length ? EXTREME_NUMBERS[(i + 5) % EXTREME_NUMBERS.length] : (rand() - 0.2) * 50;

      const mode = getActivityModeFromCadence(cadence);
      assert.ok(validModes.has(mode), `Modo inválido para cadencia ${cadence}: ${mode}`);

      const met = getMETFromCadence(cadence);
      assert.ok(Number.isFinite(met) && met >= 1.0 && met <= 14.0, `MET fuera de rango [1.0, 14.0]: ${met}`);

      const kcal = calculateStepCalories(steps, weight, height, cadence);
      assert.ok(Number.isFinite(kcal) && kcal >= 0, `Calorías negativas o NaN: ${kcal}`);

      const km = calculateDistanceKm(steps, height, mode);
      assert.ok(Number.isFinite(km) && km >= 0, `Distancia negativa o NaN: ${km}`);

      const kmh = calculateSpeedKmh(cadence, height, mode);
      assert.ok(Number.isFinite(kmh) && kmh >= 0, `Velocidad negativa o NaN: ${kmh}`);

      const pace = calculatePaceMinKm(speed);
      assert.ok(typeof pace === 'string' && !pace.includes('NaN') && !pace.includes('Infinity'), `Pace corrupto: ${pace}`);
    }
  });

  test('3. Invariante de Juicio Estoico: calculateTodayGrade jamás rompe límites [0, 100] ni días [1, 30] ante 500 estados corruptos', () => {
    const rand = createSeededPRNG(9999);
    const validStatuses = new Set(['divine', 'worthy', 'mediocre', 'failed']);
    const corruptedDates = ['INVALID', '2099-99-99', '', 'NaN', '1970-01-01T00:00:00Z', '2026-10-01'];

    for (let i = 0; i < 500; i++) {
      const fuzzedLog: DailyLog = {
        ...DEFAULT_LOG,
        steps: i < EXTREME_NUMBERS.length ? EXTREME_NUMBERS[i] : Math.floor((rand() - 0.3) * 50000),
        stepGoal: i < EXTREME_NUMBERS.length ? EXTREME_NUMBERS[(i + 1) % EXTREME_NUMBERS.length] : Math.floor((rand() - 0.2) * 25000),
        waterLitres: (rand() - 0.2) * 10,
        mealsLogged: Math.floor((rand() - 0.3) * 10),
        totalCalories: (rand() - 0.3) * 8000,
        trainingCompleted: rand() > 0.5,
        checkInDone: rand() > 0.5,
        monthlyCycle: {
          ...DEFAULT_LOG.monthlyCycle,
          currentDay: i < EXTREME_NUMBERS.length ? EXTREME_NUMBERS[i] : Math.floor((rand() - 0.5) * 100),
          startDate: corruptedDates[i % corruptedDates.length],
        },
      };

      const grade = calculateTodayGrade(fuzzedLog);
      assert.ok(Number.isFinite(grade.score) && grade.score >= 0 && grade.score <= 100, `Score fuera de [0,100]: ${grade.score}`);
      assert.ok(Number.isFinite(grade.day) && grade.day >= 1 && grade.day <= 30, `Día fuera de [1,30]: ${grade.day}`);
      assert.ok(validStatuses.has(grade.status), `Status inválido: ${grade.status}`);
      assert.ok(Number.isFinite(grade.stepsRatio) && grade.stepsRatio >= 0 && grade.stepsRatio <= 1, `stepsRatio inválido: ${grade.stepsRatio}`);
      assert.ok(Number.isFinite(grade.waterRatio) && grade.waterRatio >= 0 && grade.waterRatio <= 1, `waterRatio inválido: ${grade.waterRatio}`);
    }
  });
});
