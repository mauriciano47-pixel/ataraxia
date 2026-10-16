import type { UserMetrics } from '../types/dailyLog';

export interface FitnessCalculation {
  bmr: number;
  tdee: number;
  targetCalories: number;
  stoicScore?: number;
  macros: {
    protein: number; // grams
    carbs: number;   // grams
    fats: number;    // grams
    proteinPct: number;
    carbsPct: number;
    fatsPct: number;
  };
}

function clampFinite(val: unknown, fallback: number, min: number, max: number): number {
  const n = typeof val === 'number' ? val : Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female'): number {
  const w = clampFinite(weightKg, 70, 20, 350);
  const h = clampFinite(heightCm, 170, 80, 260);
  const a = clampFinite(age, 30, 10, 120);

  const raw = gender === 'male'
    ? Math.round(10 * w + 6.25 * h - 5 * a + 5)
    : Math.round(10 * w + 6.25 * h - 5 * a - 161);

  return Math.max(500, raw);
}

export function calculateTDEE(bmr: number, activityLevel: UserMetrics['activityLevel']): number {
  const safeBmr = clampFinite(bmr, 1600, 500, 10000);
  const multipliers: Record<UserMetrics['activityLevel'], number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9
  };
  return Math.round(safeBmr * (multipliers[activityLevel] || 1.55));
}

export function calculateFitnessIndex(metrics: UserMetrics): FitnessCalculation {
  const safeMetrics = metrics || ({} as UserMetrics);
  const bmr = calculateBMR(safeMetrics.weightKg, safeMetrics.heightCm, safeMetrics.age, safeMetrics.gender === 'female' ? 'female' : 'male');
  const tdee = calculateTDEE(bmr, safeMetrics.activityLevel);

  let targetCalories = tdee;
  if (safeMetrics.goal === 'deficit') {
    targetCalories = Math.round(tdee * 0.82);
  } else if (safeMetrics.goal === 'surplus') {
    targetCalories = Math.round(tdee * 1.12);
  }

  let proteinPct = 30;
  let carbsPct = 40;
  let fatsPct = 30;

  if (safeMetrics.goal === 'deficit') {
    proteinPct = 40;
    carbsPct = 35;
    fatsPct = 25;
  } else if (safeMetrics.goal === 'surplus') {
    proteinPct = 25;
    carbsPct = 50;
    fatsPct = 25;
  }

  const proteinGrams = Math.max(0, Math.round((targetCalories * (proteinPct / 100)) / 4));
  const carbsGrams = Math.max(0, Math.round((targetCalories * (carbsPct / 100)) / 4));
  const fatsGrams = Math.max(0, Math.round((targetCalories * (fatsPct / 100)) / 9));

  return {
    bmr,
    tdee,
    targetCalories,
    stoicScore: 88,
    macros: {
      protein: proteinGrams,
      carbs: carbsGrams,
      fats: fatsGrams,
      proteinPct,
      carbsPct,
      fatsPct,
    }
  };
}

// ─── ESTÁNDARES DE LA INDUSTRIA (Fitbit / Google Fit / Apple Health) ─────────

export type ActivityMode = 'idle' | 'walking' | 'jogging' | 'running';

/**
 * Calcula la longitud de zancada personal usando la fórmula ACSM.
 * Referencia: American College of Sports Medicine Exercise Guidelines.
 */
export function getPersonalStrideLength(heightCm: number, mode: ActivityMode = 'walking'): number {
  const safeH = Number.isFinite(heightCm) && heightCm > 0 ? Math.min(260, Math.max(80, heightCm)) : 170;
  const heightM = safeH / 100;
  switch (mode) {
    case 'running': return heightM * 0.497;   // ACSM fórmula carrera
    case 'jogging': return heightM * 0.460;   // Interpolado trote
    case 'walking':
    default: return heightM * 0.413;          // ACSM fórmula caminata
  }
}

/**
 * Determina el modo de actividad a partir de la cadencia (SPM).
 * Estándar: Fitbit, Garmin, Samsung Health.
 */
export function getActivityModeFromCadence(cadenceSpm: number): ActivityMode {
  if (!Number.isFinite(cadenceSpm) || cadenceSpm <= 0) return 'idle';
  if (cadenceSpm < 60) return 'idle';
  if (cadenceSpm < 100) return 'walking';
  if (cadenceSpm < 130) return 'jogging';
  return 'running';
}

/**
 * MET (Metabolic Equivalent of Task) según cadencia SPM.
 * Basado en tablas ACSM/Compendium of Physical Activities.
 */
export function getMETFromCadence(cadenceSpm: number): number {
  if (!Number.isFinite(cadenceSpm) || cadenceSpm <= 0) return 1.0;  // Reposo/sedentario
  if (cadenceSpm < 60) return 1.5;  // Muy lento
  if (cadenceSpm < 80) return 2.5;  // Caminata lenta (~3 km/h)
  if (cadenceSpm < 100) return 3.5; // Caminata normal (~4.8 km/h) — ESTÁNDAR FITBIT
  if (cadenceSpm < 110) return 4.5; // Caminata rápida (~6 km/h)
  if (cadenceSpm < 120) return 5.5; // Marcha atlética
  if (cadenceSpm < 130) return 7.0; // Trote suave (~8 km/h)
  if (cadenceSpm < 150) return 9.5; // Carrera moderada (~10 km/h)
  if (cadenceSpm < 170) return 11.5;// Carrera (~12 km/h)
  return 14.0;                      // Carrera rápida (>13 km/h)
}

/**
 * Calcula calorías usando fórmula MET estándar: Calorías = MET × peso_kg × tiempo_h
 * Referencia: ACSM, utilizado por Fitbit, Garmin y Apple Health.
 */
export function calculateStepCalories(
  steps: number,
  weightKg: number = 70,
  heightCm: number = 170,
  cadenceSpm: number = 0,
  activeMinutes: number = 0
): number {
  if (!Number.isFinite(steps) || steps <= 0) return 0;
  const safeSteps = Math.min(200000, steps);
  const safeWeight = Number.isFinite(weightKg) && weightKg > 0 ? Math.min(350, Math.max(20, weightKg)) : 70;
  const effectiveCadence = Number.isFinite(cadenceSpm) && cadenceSpm > 0 ? Math.min(250, cadenceSpm) : 85;
  const met = getMETFromCadence(effectiveCadence);
  const timeH = Number.isFinite(activeMinutes) && activeMinutes > 0
    ? Math.min(1440, activeMinutes) / 60
    : safeSteps / (effectiveCadence * 60);
  return Math.max(0, Math.round(met * safeWeight * timeH));
}

/**
 * Calcula la distancia recorrida en km con la zancada personal del usuario.
 */
export function calculateDistanceKm(
  steps: number,
  heightCm: number = 170,
  mode: ActivityMode = 'walking',
  manualStrideLengthM?: number
): number {
  if (!Number.isFinite(steps) || steps <= 0) return 0;
  const safeSteps = Math.min(200000, steps);
  const validManual = typeof manualStrideLengthM === 'number' && Number.isFinite(manualStrideLengthM) && manualStrideLengthM > 0
    ? Math.min(3.0, Math.max(0.2, manualStrideLengthM))
    : undefined;
  const strideLengthM = validManual ?? getPersonalStrideLength(heightCm, mode);
  return Math.max(0, Number.parseFloat(((safeSteps * strideLengthM) / 1000).toFixed(2)));
}

/**
 * Calcula la velocidad estimada en km/h.
 */
export function calculateSpeedKmh(
  cadenceSpm: number,
  heightCm: number = 170,
  mode: ActivityMode = 'walking',
  manualStrideLengthM?: number
): number {
  if (!Number.isFinite(cadenceSpm) || cadenceSpm <= 0) return 0;
  const safeCadence = Math.min(260, cadenceSpm);
  const validManual = typeof manualStrideLengthM === 'number' && Number.isFinite(manualStrideLengthM) && manualStrideLengthM > 0
    ? Math.min(3.0, Math.max(0.2, manualStrideLengthM))
    : undefined;
  const strideLengthM = validManual ?? getPersonalStrideLength(heightCm, mode);
  return Math.max(0, Number.parseFloat(((safeCadence * strideLengthM * 60) / 1000).toFixed(1)));
}

/**
 * Calcula el ritmo (min/km).
 */
export function calculatePaceMinKm(speedKmh: number): string {
  if (!Number.isFinite(speedKmh) || speedKmh <= 0) return '--:--';
  const totalMin = 60 / speedKmh;
  if (!Number.isFinite(totalMin) || totalMin <= 0 || totalMin > 999) return '--:--';
  let mins = Math.floor(totalMin);
  let secs = Math.round((totalMin - mins) * 60);
  if (secs === 60) {
    mins += 1;
    secs = 0;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Función legada mantenida por retrocompatibilidad.
 */
export function estimateStepMetrics(steps: number, heightCm?: number, weightKg?: number) {
  const safeSteps = Number.isFinite(steps) && steps > 0 ? steps : 0;
  const km = calculateDistanceKm(safeSteps, heightCm ?? 170);
  const caloriesBurned = weightKg && Number.isFinite(weightKg) && weightKg > 0
    ? calculateStepCalories(safeSteps, weightKg, heightCm ?? 170)
    : Math.max(0, Math.round(safeSteps * 0.04));
  return { km, caloriesBurned };
}
