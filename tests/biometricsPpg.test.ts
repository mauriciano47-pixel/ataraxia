/**
 * Ataraxia — Suite de Pruebas Unitarias del Escáner Óptico de Ritmo Cardíaco (PPG)
 * Titularidad: Mauricio Uribe Maldonado
 */

export function sanitizeHeartRateBpm(rawBpm: number): { valid: boolean; bpm: number } {
  // Frecuencia fisiológica humana válida en reposo/ejercicio
  if (rawBpm < 40 || rawBpm > 220 || isNaN(rawBpm)) {
    return { valid: false, bpm: 0 };
  }
  return { valid: true, bpm: Math.round(rawBpm) };
}

export function calculateHeartRateVariability(intervalsMs: number[]): number {
  if (intervalsMs.length < 2) return 0;
  
  // RMSSD: Root Mean Square of Successive Differences
  let sumSquaredDiffs = 0;
  for (let i = 0; i < intervalsMs.length - 1; i++) {
    const diff = intervalsMs[i + 1] - intervalsMs[i];
    sumSquaredDiffs += diff * diff;
  }
  const mean = sumSquaredDiffs / (intervalsMs.length - 1);
  return Math.round(Math.sqrt(mean));
}

describe('Ataraxia Biometric PPG Engine', () => {
  test('Debe validar lecturas de BPM dentro de rango fisiológico seguro', () => {
    expect(sanitizeHeartRateBpm(72).valid).toBe(true);
    expect(sanitizeHeartRateBpm(165).valid).toBe(true);
    expect(sanitizeHeartRateBpm(25).valid).toBe(false);
    expect(sanitizeHeartRateBpm(260).valid).toBe(false);
  });

  test('Debe calcular RMSSD (HRV) a partir de serie de intervalos RR', () => {
    const rrIntervals = [800, 820, 790, 810, 830];
    const rmssd = calculateHeartRateVariability(rrIntervals);
    expect(rmssd).toBeGreaterThan(0);
    expect(typeof rmssd).toBe('number');
  });
});
