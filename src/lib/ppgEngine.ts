/**
 * Motor Biométrico Fotopletismográfico (PPG) en Tiempo Real
 * Procesa la absorbancia óptica del canal Rojo (hemoglobina capilar) cuadro a cuadro,
 * detecta ondas sistólicas reales (intervalos RR), calcula BPM (40-220) y HRV (RMSSD).
 */

export interface PpgEngineState {
  isInitialized: boolean;
  dcBaseline: number;
  smoothedRed: number;
  prevAc: number;
  prevSlope: number;
  lastPeakTimestampMs: number;
  rrIntervalsMs: number[];
  currentBpm: number;
  hrvRmssd: number;
  peaksDetected: number;
}

export function createPpgEngineState(): PpgEngineState {
  return {
    isInitialized: false,
    dcBaseline: 0,
    smoothedRed: 0,
    prevAc: 0,
    prevSlope: 0,
    lastPeakTimestampMs: 0,
    rrIntervalsMs: [],
    currentBpm: 0,
    hrvRmssd: 0,
    peaksDetected: 0,
  };
}

/**
 * Verifica si el lente de la cámara está cubierto por tejido capilar humano iluminado.
 * El tejido humano absorbe fuertemente longitudes de onda verdes/azules y transmite el rojo.
 */
export function isOpticalFingerCovered(avgRed: number, avgGreen: number, avgBlue: number): boolean {
  if (
    typeof avgRed !== 'number' ||
    typeof avgGreen !== 'number' ||
    typeof avgBlue !== 'number' ||
    Number.isNaN(avgRed) ||
    Number.isNaN(avgGreen) ||
    Number.isNaN(avgBlue)
  ) {
    return false;
  }
  // Evitar luz blanca quemada (lámpara directa sin dedo)
  if (avgGreen > 210 && avgBlue > 210) {
    return false;
  }
  return avgRed >= 110 && avgRed > avgGreen * 1.30 && avgRed > avgBlue * 1.45;
}

/**
 * Filtro fisiológico cardiovascular (PPG) estándar clínico (40 - 220 BPM)
 */
export function sanitizeHeartRateBpm(rawBpm: number): { valid: boolean; bpm: number } {
  if (typeof rawBpm !== 'number' || Number.isNaN(rawBpm) || rawBpm < 40 || rawBpm > 220) {
    return { valid: false, bpm: 0 };
  }
  return { valid: true, bpm: Math.round(rawBpm) };
}

/**
 * Cálculo estándar de Variabilidad del Ritmo Cardíaco (HRV / RMSSD en ms)
 */
export function calculateHeartRateVariability(intervalsMs: number[]): number {
  if (!Array.isArray(intervalsMs) || intervalsMs.length < 2) return 0;
  let sumSquaredDiffs = 0;
  for (let i = 0; i < intervalsMs.length - 1; i++) {
    const diff = intervalsMs[i + 1] - intervalsMs[i];
    sumSquaredDiffs += diff * diff;
  }
  const mean = sumSquaredDiffs / (intervalsMs.length - 1);
  return Math.round(Math.sqrt(mean));
}

export interface PpgSampleResult {
  beatDetected: boolean;
  bpm: number;
  hrvRmssd: number;
  acWaveValue: number;
  peaksCount: number;
}

/**
 * Procesa una muestra de intensidad luminosa roja (avgRed) a tiempo `nowMs`
 * y extrae latidos cardíacos reales mediante filtrado pasa-banda (0.67 Hz - 3.7 Hz).
 */
export function processPpgOpticalSample(
  state: PpgEngineState,
  avgRed: number,
  nowMs: number,
): PpgSampleResult {
  if (!state.isInitialized) {
    state.dcBaseline = avgRed;
    state.smoothedRed = avgRed;
    state.prevAc = 0;
    state.prevSlope = 0;
    state.isInitialized = true;
    return {
      beatDetected: false,
      bpm: state.currentBpm,
      hrvRmssd: state.hrvRmssd,
      acWaveValue: 0,
      peaksCount: state.peaksDetected,
    };
  }

  // 1. Eliminación de línea base DC (respiración y presión del dedo, constante lenta)
  state.dcBaseline = 0.92 * state.dcBaseline + 0.08 * avgRed;

  // 2. Suavizado de alta frecuencia para eliminar ruido del sensor CMOS
  state.smoothedRed = 0.60 * state.smoothedRed + 0.40 * avgRed;

  // 3. Componente pulsátil AC (onda pletismográfica sistólica)
  const acSignal = state.smoothedRed - state.dcBaseline;
  const currentSlope = acSignal - state.prevAc;

  let beatDetected = false;

  // Detectar máximo local (cruce de pendiente positiva a negativa sobre umbral mínimo de perfusión)
  const MIN_PERFUSION_AMPLITUDE = 0.12;
  const MIN_REFRACTORY_MS = 272; // Máx 220 BPM
  const MAX_RR_MS = 1500;        // Mín 40 BPM

  if (
    state.prevSlope > 0 &&
    currentSlope <= 0 &&
    state.prevAc >= MIN_PERFUSION_AMPLITUDE
  ) {
    const rrMs = state.lastPeakTimestampMs > 0 ? nowMs - state.lastPeakTimestampMs : 0;

    if (state.lastPeakTimestampMs === 0) {
      state.lastPeakTimestampMs = nowMs;
      state.peaksDetected += 1;
      beatDetected = true;
    } else if (rrMs >= MIN_REFRACTORY_MS && rrMs <= MAX_RR_MS) {
      // Validar coherencia con mediana previa para filtrar artefactos de movimiento del dedo
      let isConsistent = true;
      if (state.rrIntervalsMs.length >= 3) {
        const sorted = [...state.rrIntervalsMs].sort((a, b) => a - b);
        const medianRr = sorted[Math.floor(sorted.length / 2)];
        if (Math.abs(rrMs - medianRr) > medianRr * 0.35) {
          isConsistent = false;
        }
      }

      state.lastPeakTimestampMs = nowMs;
      state.peaksDetected += 1;
      beatDetected = true;

      if (isConsistent) {
        state.rrIntervalsMs.push(rrMs);
        if (state.rrIntervalsMs.length > 10) {
          state.rrIntervalsMs.shift();
        }

        const meanRr =
          state.rrIntervalsMs.reduce((acc, v) => acc + v, 0) / state.rrIntervalsMs.length;
        const rawBpm = 60000 / meanRr;
        const sanitized = sanitizeHeartRateBpm(rawBpm);
        if (sanitized.valid) {
          state.currentBpm = sanitized.bpm;
        }
        state.hrvRmssd = calculateHeartRateVariability(state.rrIntervalsMs);
      }
    } else if (rrMs > MAX_RR_MS) {
      // Reiniciar referencia temporal tras pausa larga
      state.lastPeakTimestampMs = nowMs;
    }
  }

  state.prevSlope = currentSlope;
  state.prevAc = acSignal;

  return {
    beatDetected,
    bpm: state.currentBpm,
    hrvRmssd: state.hrvRmssd,
    acWaveValue: acSignal,
    peaksCount: state.peaksDetected,
  };
}

/**
 * Evalúa la coherencia fisiológica en la Auditoría Estoica (RPE declarado vs Pulso BPM medido)
 */
export function evaluateStoicHeartRateCoherence(declaredRpe: number, recordedBpm: number): {
  status: 'no_reading' | 'suspicious_low' | 'coherent_high';
  requiresCalibrationWarning: boolean;
} {
  if (!recordedBpm || recordedBpm <= 0) {
    return { status: 'no_reading', requiresCalibrationWarning: false };
  }
  if (declaredRpe >= 9.5 && recordedBpm < 115) {
    return { status: 'suspicious_low', requiresCalibrationWarning: true };
  }
  return { status: 'coherent_high', requiresCalibrationWarning: false };
}
