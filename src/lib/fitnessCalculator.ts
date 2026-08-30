import { UserMetrics } from '@/hooks/useDailyLog';

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

export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female'): number {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
}

export function calculateTDEE(bmr: number, activityLevel: UserMetrics['activityLevel']): number {
  const multipliers: Record<UserMetrics['activityLevel'], number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.55));
}

export function calculateFitnessIndex(metrics: UserMetrics): FitnessCalculation {
  const bmr = calculateBMR(metrics.weightKg, metrics.heightCm, metrics.age, metrics.gender);
  const tdee = calculateTDEE(bmr, metrics.activityLevel);

  let targetCalories = tdee;
  if (metrics.goal === 'deficit') {
    targetCalories = Math.round(tdee * 0.82);
  } else if (metrics.goal === 'surplus') {
    targetCalories = Math.round(tdee * 1.12);
  }

  let proteinPct = 30;
  let carbsPct = 40;
  let fatsPct = 30;

  if (metrics.goal === 'deficit') {
    proteinPct = 40;
    carbsPct = 35;
    fatsPct = 25;
  } else if (metrics.goal === 'surplus') {
    proteinPct = 25;
    carbsPct = 50;
    fatsPct = 25;
  }

  const proteinGrams = Math.round((targetCalories * (proteinPct / 100)) / 4);
  const carbsGrams = Math.round((targetCalories * (carbsPct / 100)) / 4);
  const fatsGrams = Math.round((targetCalories * (fatsPct / 100)) / 9);

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
 * @param heightCm altura en cm
 * @param mode modo de actividad
 * @returns longitud de zancada en metros
 */
export function getPersonalStrideLength(heightCm: number, mode: ActivityMode = 'walking'): number {
  const heightM = (heightCm > 0 ? heightCm : 170) / 100;
  switch (mode) {
    case 'running': return heightM * 0.497;   // ACSM fórmula carrera
    case 'jogging': return heightM * 0.460;   // Interpolado trote
    case 'walking':
    default:        return heightM * 0.413;   // ACSM fórmula caminata
  }
}

/**
 * Determina el modo de actividad a partir de la cadencia (SPM).
 * Estándar: Fitbit, Garmin, Samsung Health.
 */
export function getActivityModeFromCadence(cadenceSpm: number): ActivityMode {
  if (cadenceSpm <= 0) return 'idle';
  if (cadenceSpm < 60)  return 'idle';
  if (cadenceSpm < 100) return 'walking';
  if (cadenceSpm < 130) return 'jogging';
  return 'running';
}

/**
 * MET (Metabolic Equivalent of Task) según cadencia SPM.
 * Basado en tablas ACSM/Compendium of Physical Activities.
 */
export function getMETFromCadence(cadenceSpm: number): number {
  if (cadenceSpm <= 0)   return 1.0;  // Reposo/sedentario
  if (cadenceSpm < 60)   return 1.5;  // Muy lento
  if (cadenceSpm < 80)   return 2.5;  // Caminata lenta (~3 km/h)
  if (cadenceSpm < 100)  return 3.5;  // Caminata normal (~4.8 km/h) — ESTÁNDAR FITBIT
  if (cadenceSpm < 110)  return 4.5;  // Caminata rápida (~6 km/h)
  if (cadenceSpm < 120)  return 5.5;  // Marcha atlética
  if (cadenceSpm < 130)  return 7.0;  // Trote suave (~8 km/h)
  if (cadenceSpm < 150)  return 9.5;  // Carrera moderada (~10 km/h)
  if (cadenceSpm < 170)  return 11.5; // Carrera (~12 km/h)
  return 14.0;                        // Carrera rápida (>13 km/h)
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
  if (steps <= 0) return 0;
  const effectiveCadence = cadenceSpm > 0 ? cadenceSpm : 85; // 85 SPM = caminata normal estándar
  const met = getMETFromCadence(effectiveCadence);
  const timeH = activeMinutes > 0
    ? activeMinutes / 60
    : steps / (effectiveCadence * 60);
  return Math.max(0, Math.round(met * (weightKg > 0 ? weightKg : 70) * timeH));
}

/**
 * Calcula la distancia recorrida en km con la zancada personal del usuario.
 * Más preciso que el valor genérico de 0.00075 km/paso.
 */
export function calculateDistanceKm(
  steps: number,
  heightCm: number = 170,
  mode: ActivityMode = 'walking',
  manualStrideLengthM?: number
): number {
  const strideLengthM = manualStrideLengthM ?? getPersonalStrideLength(heightCm, mode);
  return parseFloat(((steps * strideLengthM) / 1000).toFixed(2));
}

/**
 * Calcula la velocidad estimada en km/h.
 * Fórmula: velocidad_kmh = (cadencia_spm × longitud_zancada_m × 60) / 1000
 */
export function calculateSpeedKmh(
  cadenceSpm: number,
  heightCm: number = 170,
  mode: ActivityMode = 'walking',
  manualStrideLengthM?: number
): number {
  if (cadenceSpm <= 0) return 0;
  const strideLengthM = manualStrideLengthM ?? getPersonalStrideLength(heightCm, mode);
  return parseFloat(((cadenceSpm * strideLengthM * 60) / 1000).toFixed(1));
}

/**
 * Calcula el ritmo (min/km).
 */
export function calculatePaceMinKm(speedKmh: number): string {
  if (speedKmh <= 0) return '--:--';
  const totalMin = 60 / speedKmh;
  const mins = Math.floor(totalMin);
  const secs = Math.round((totalMin - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Función legada mantenida por retrocompatibilidad.
 * @deprecated Usar calculateDistanceKm + calculateStepCalories con la altura y peso del usuario
 */
export function estimateStepMetrics(steps: number, heightCm?: number, weightKg?: number) {
  const km = calculateDistanceKm(steps, heightCm ?? 170);
  const caloriesBurned = weightKg
    ? calculateStepCalories(steps, weightKg, heightCm ?? 170)
    : Math.round(steps * 0.04);
  return { km, caloriesBurned };
}
