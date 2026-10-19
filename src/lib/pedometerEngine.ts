export type PedometerSensitivity = 'high' | 'standard' | 'low';

export interface SensitivityProfile {
  peakThreshold: number;
  valleyDrop: number;
  minPulseMs: number;
  maxPulseMs: number;
}

export const SENSITIVITY_PROFILES: Record<PedometerSensitivity, SensitivityProfile> = {
  high: {
    peakThreshold: 0.45,      // Caminata suave / bolsillo holgado / mochila
    valleyDrop: 0.22,
    minPulseMs: 40,           // Compatible con muestreo discreto a 25Hz (40ms)
    maxPulseMs: 650,
  },
  standard: {
    peakThreshold: 0.65,      // Calibración balanceada óptima (mano y bolsillo)
    valleyDrop: 0.30,
    minPulseMs: 40,
    maxPulseMs: 600,
  },
  low: {
    peakThreshold: 0.95,      // Anti-vibración / trabajo activo
    valleyDrop: 0.45,
    minPulseMs: 60,
    maxPulseMs: 520,
  },
};

export const PEDOMETER_CONSTANTS = {
  MIN_STEP_INTERVAL_MS: 260,       // Máximo ~230 SPM (sprint humano máximo)
  MAX_HUMAN_CADENCE_MS: 2000,      // Mínimo 30 SPM (caminata lenta de inicio)
  MAX_CADENCE_VARIANCE_MS: 320,    // Permite aceleración natural al iniciar la marcha desde reposo
  MAX_VIOLENT_ACCEL_MS2: 14.50,    // Límite de aceleración biológica humana sobre 1G
  MAX_VEHICLE_SPEED_MS: 5.55,      // >20 km/h = Modo Vehículo
};

export interface PedometerEngineState {
  lastSampleTime: number;
  gravityNorm: number;
  smoothedDynamic: number;
  isInitialized: boolean;
  isRisingPeak: boolean;
  peakStartTime: number;
  peakMaxVal: number;
  lastCandidateTime: number;
  candidateStepsBuffer: number[];
  isWalkingConfirmed: boolean;
}

export function createPedometerEngineState(): PedometerEngineState {
  return {
    lastSampleTime: 0,
    gravityNorm: 9.80665,
    smoothedDynamic: 9.80665,
    isInitialized: false,
    isRisingPeak: false,
    peakStartTime: 0,
    peakMaxVal: 0,
    lastCandidateTime: 0,
    candidateStepsBuffer: [],
    isWalkingConfirmed: false,
  };
}

export interface StepDetectionResult {
  stepsAdded: number;
  stepTimestamps: number[];
  rejectedReason?: 'throttled' | 'zero_signal' | 'violent_shake' | 'high_freq_vibration' | 'buffering';
}

/**
 * Procesa una muestra triaxial del acelerómetro (m/s²) y determina si hubo pasos biomecánicos reales.
 */
export function processAccelerometerSample(
  state: PedometerEngineState,
  rx: number,
  ry: number,
  rz: number,
  nowMs: number,
  sensitivity: PedometerSensitivity = 'standard',
  isPausedOrVehicle: boolean = false,
): StepDetectionResult {
  if (isPausedOrVehicle) {
    return { stepsAdded: 0, stepTimestamps: [] };
  }

  // Throttle biomecánico a 25Hz (40ms)
  if (state.lastSampleTime > 0 && nowMs - state.lastSampleTime < 38) {
    return { stepsAdded: 0, stepTimestamps: [], rejectedReason: 'throttled' };
  }

  const lastTime = state.lastSampleTime || nowMs - 40;
  state.lastSampleTime = nowMs;
  const dt = Math.min(0.15, Math.max(0.005, (nowMs - lastTime) / 1000));

  // ETAPA A: Magnitud vectorial 3D invariante a la orientación del teléfono
  const rawMagnitude = Math.sqrt(rx * rx + ry * ry + rz * rz);
  if (rawMagnitude === 0 || Number.isNaN(rawMagnitude)) {
    return { stepsAdded: 0, stepTimestamps: [], rejectedReason: 'zero_signal' };
  }

  // Inicializar filtros en la primera muestra real para evitar transitorio negativo de 1.5s
  if (!state.isInitialized) {
    state.gravityNorm = rawMagnitude;
    state.smoothedDynamic = rawMagnitude;
    state.isInitialized = true;
  }

  // Descartar sacudidas destructivas no biológicas (> 24.3 m/s² totales)
  if (rawMagnitude > PEDOMETER_CONSTANTS.MAX_VIOLENT_ACCEL_MS2 + 9.80665) {
    state.isRisingPeak = false;
    state.peakMaxVal = 0;
    state.candidateStepsBuffer = [];
    state.isWalkingConfirmed = false;
    return { stepsAdded: 0, stepTimestamps: [], rejectedReason: 'violent_shake' };
  }

  // ETAPA B: Filtro Pasa-Bajo Biomecánico (tau = 0.07s, corte ~2.2 Hz)
  const alphaLP = dt / (0.07 + dt);
  const filteredSignal = alphaLP * rawMagnitude + (1 - alphaLP) * state.smoothedDynamic;
  state.smoothedDynamic = filteredSignal;

  // ETAPA C: Estimación continua de gravedad adaptativa (tau_g = 1.1s)
  const alphaG = dt / (1.10 + dt);
  state.gravityNorm = alphaG * filteredSignal + (1 - alphaG) * state.gravityNorm;
  const dynamicDelta = filteredSignal - state.gravityNorm;

  const profile = SENSITIVITY_PROFILES[sensitivity] || SENSITIVITY_PROFILES.standard;

  // 1. Detección de cresta ascendente
  if (dynamicDelta >= profile.peakThreshold) {
    if (!state.isRisingPeak) {
      state.isRisingPeak = true;
      state.peakStartTime = nowMs;
      state.peakMaxVal = dynamicDelta;
    } else if (dynamicDelta > state.peakMaxVal) {
      state.peakMaxVal = dynamicDelta;
    }
  }

  // 2. Confirmación de valle descendente (Peak-to-Valley)
  if (state.isRisingPeak) {
    const drop = state.peakMaxVal - dynamicDelta;
    if (drop >= profile.valleyDrop) {
      const pulseDuration = nowMs - state.peakStartTime;
      state.isRisingPeak = false;
      state.peakMaxVal = 0;

      if (pulseDuration >= profile.minPulseMs && pulseDuration <= profile.maxPulseMs) {
        const timeSinceLastCandidate = state.lastCandidateTime > 0
          ? nowMs - state.lastCandidateTime
          : PEDOMETER_CONSTANTS.MAX_HUMAN_CADENCE_MS + 1;

        // Rechazar vibración rápida de mano o motor (> 3.85 Hz / < 260ms entre picos)
        if (state.lastCandidateTime > 0 && timeSinceLastCandidate < PEDOMETER_CONSTANTS.MIN_STEP_INTERVAL_MS) {
          state.candidateStepsBuffer = [];
          state.isWalkingConfirmed = false;
          return { stepsAdded: 0, stepTimestamps: [], rejectedReason: 'high_freq_vibration' };
        }

        // Si pasaron más de 2.0s desde la última zancada, iniciar nueva ventana de marcha con este primer paso
        if (timeSinceLastCandidate > PEDOMETER_CONSTANTS.MAX_HUMAN_CADENCE_MS) {
          state.candidateStepsBuffer = [nowMs];
          state.lastCandidateTime = nowMs;
          state.isWalkingConfirmed = false;
          return { stepsAdded: 0, stepTimestamps: [], rejectedReason: 'buffering' };
        }

        state.lastCandidateTime = nowMs;

        if (!state.isWalkingConfirmed) {
          state.candidateStepsBuffer.push(nowMs);

          // Step Windowing: 4 pasos rítmicos consecutivos confirman marcha humana real
          if (state.candidateStepsBuffer.length >= 4) {
            const times = state.candidateStepsBuffer;
            const int1 = times[1] - times[0];
            const int2 = times[2] - times[1];
            const int3 = times[3] - times[2];
            const maxInt = Math.max(int1, int2, int3);
            const minInt = Math.min(int1, int2, int3);
            const variance = maxInt - minInt;

            if (
              variance <= PEDOMETER_CONSTANTS.MAX_CADENCE_VARIANCE_MS &&
              maxInt <= 1750 &&
              minInt >= PEDOMETER_CONSTANTS.MIN_STEP_INTERVAL_MS
            ) {
              state.isWalkingConfirmed = true;
              const verifiedTimestamps = [...times];
              state.candidateStepsBuffer = [];
              return {
                stepsAdded: verifiedTimestamps.length,
                stepTimestamps: verifiedTimestamps,
              };
            } else {
              state.candidateStepsBuffer.shift();
              return { stepsAdded: 0, stepTimestamps: [], rejectedReason: 'buffering' };
            }
          }
          return { stepsAdded: 0, stepTimestamps: [], rejectedReason: 'buffering' };
        } else {
          // Marcha ya confirmada: cada zancada rítmica suma +1 en tiempo real
          return {
            stepsAdded: 1,
            stepTimestamps: [nowMs],
          };
        }
      }
    }
  }

  return { stepsAdded: 0, stepTimestamps: [] };
}
