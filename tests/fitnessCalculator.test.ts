/**
 * Ataraxia — Suite de Pruebas Unitarias de Biohacking & Fitness Calculator
 * Titularidad: Mauricio Uribe Maldonado
 */

export interface UserBiometrics {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  gender: 'male' | 'female';
  activityFactor: number; // 1.2 (sedentario) a 1.9 (atleta extremo)
}

export function calculateBMR(bio: UserBiometrics): number {
  // Fórmula Mifflin-St Jeor
  const base = 10 * bio.weightKg + 6.25 * bio.heightCm - 5 * bio.ageYears;
  return bio.gender === 'male' ? Math.round(base + 5) : Math.round(base - 161);
}

export function calculateTDEE(bio: UserBiometrics): number {
  const bmr = calculateBMR(bio);
  return Math.round(bmr * bio.activityFactor);
}

export function evaluateDeloadNeed(averageRpeWeek: number): boolean {
  // Principio estoico: "El arco siempre tenso se rompe" (Séneca)
  return averageRpeWeek >= 8.5;
}

export function calculateMacros(targetCalories: number, goal: 'cut' | 'maintain' | 'bulk') {
  let proteinRatio = 0.30;
  let fatRatio = 0.25;
  let carbRatio = 0.45;

  if (goal === 'cut') {
    proteinRatio = 0.35;
    fatRatio = 0.25;
    carbRatio = 0.40;
  } else if (goal === 'bulk') {
    proteinRatio = 0.25;
    fatRatio = 0.25;
    carbRatio = 0.50;
  }

  return {
    proteinGrams: Math.round((targetCalories * proteinRatio) / 4),
    fatGrams: Math.round((targetCalories * fatRatio) / 9),
    carbGrams: Math.round((targetCalories * carbRatio) / 4),
  };
}

describe('Ataraxia Fitness & Biohacking Calculations', () => {
  const athlete: UserBiometrics = {
    weightKg: 80,
    heightCm: 180,
    ageYears: 30,
    gender: 'male',
    activityFactor: 1.55,
  };

  test('Debe calcular BMR según ecuación Mifflin-St Jeor', () => {
    // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780 kcal
    const bmr = calculateBMR(athlete);
    expect(bmr).toBe(1780);
  });

  test('Debe calcular TDEE aplicando factor de actividad moderada', () => {
    const tdee = calculateTDEE(athlete);
    expect(tdee).toBe(Math.round(1780 * 1.55)); // 2759 kcal
  });

  test('Debe recomendar descarga (Deload) si RPE promedio supera 8.5', () => {
    expect(evaluateDeloadNeed(8.8)).toBe(true);
    expect(evaluateDeloadNeed(7.2)).toBe(false);
  });

  test('Debe distribuir macronutrientes balanceadamente para déficit (cut)', () => {
    const macros = calculateMacros(2000, 'cut');
    expect(macros.proteinGrams).toBeGreaterThan(150);
    expect(macros.fatGrams).toBeGreaterThan(40);
    expect(macros.carbGrams).toBeGreaterThan(150);
  });
});
