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

export function estimateStepMetrics(steps: number) {
  const km = (steps * 0.00075).toFixed(2);
  const caloriesBurned = Math.round(steps * 0.04);
  return {
    km: parseFloat(km),
    caloriesBurned,
  };
}
