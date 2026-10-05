/**
 * Ataraxia — Suite de Pruebas Unitarias de Podómetro Biomecánico & Filtro Anti-Vehículo
 * Titularidad: Mauricio Uribe Maldonado
 */

export interface StepFilterConfig {
  minCadenceHz: number; // Mínimo paso por segundo (ej. 0.5 Hz)
  maxCadenceHz: number; // Máximo paso por segundo (ej. 3.5 Hz)
  maxSpeedKmh: number;  // Velocidad límite caminata/running (ej. 25 km/h)
}

export function isValidPedestrianStep(cadenceHz: number, speedKmh: number, config: StepFilterConfig): boolean {
  if (speedKmh > config.maxSpeedKmh) {
    // Filtro anti-vehículo activado: automóvil o transporte público
    return false;
  }
  if (cadenceHz < config.minCadenceHz || cadenceHz > config.maxCadenceHz) {
    // Ruido vibratorio o movimiento fuera de rango biomecánico
    return false;
  }
  return true;
}

export function estimateNeatCalories(steps: number, weightKg: number): number {
  // Gasto calórico aproximado: ~0.04 a 0.05 kcal por paso por cada 70kg
  const calorieFactor = 0.04 * (weightKg / 70);
  return Math.round(steps * calorieFactor);
}

describe('Ataraxia Biomechanical Pedometer & NEAT Engine', () => {
  const config: StepFilterConfig = {
    minCadenceHz: 0.5,
    maxCadenceHz: 3.5,
    maxSpeedKmh: 22.0,
  };

  test('Debe aceptar cadencia de caminata normal (1.8 Hz a 5 km/h)', () => {
    expect(isValidPedestrianStep(1.8, 5.0, config)).toBe(true);
  });

  test('Debe rechazar movimiento en vehículo (60 km/h)', () => {
    expect(isValidPedestrianStep(2.0, 60.0, config)).toBe(false);
  });

  test('Debe filtrar vibración estática o micro-movimiento (< 0.5 Hz)', () => {
    expect(isValidPedestrianStep(0.2, 0.0, config)).toBe(false);
  });

  test('Debe calcular gasto calórico NEAT acorde al peso corporal', () => {
    const calories = estimateNeatCalories(10000, 70);
    expect(calories).toBe(400); // 10000 * 0.04 = 400 kcal
  });
});
