import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { SafeStorage } from '@/utils/safeStorage';
import { getLocalTodayDateString } from '@/utils/dateUtils';
import {
  getActivityModeFromCadence,
  calculateDistanceKm,
  calculateSpeedKmh,
  calculateStepCalories,
  calculatePaceMinKm,
  ActivityMode,
} from '@/lib/fitnessCalculator';

const TRANSIT_MODE_STORAGE_KEY = 'ataraxia_transit_mode_active_v1';
const SENSITIVITY_STORAGE_KEY = 'ataraxia_pedometer_sensitivity_v1';
const PEDOMETER_SESSION_STEPS_KEY = 'ataraxia_pedometer_session_steps_v1';
const STRIDE_LENGTH_STORAGE_KEY = 'ataraxia_stride_length_manual_v1';

export type PedometerSensitivity = 'high' | 'standard' | 'low';
export type { ActivityMode };

// Parámetros por nivel de sensibilidad (AOSP StepDetector Calibrated)
const SENSITIVITY_PROFILES = {
  high: {
    peakThreshold: 0.52,      // Para caminata suave / bolsillo holgado / mochila
    valleyDrop: 0.25,
    minPulseMs: 90,
    maxPulseMs: 500,
  },
  standard: {
    peakThreshold: 0.72,      // Calibración balanceada óptima (mano y bolsillo)
    valleyDrop: 0.35,
    minPulseMs: 100,
    maxPulseMs: 460,
  },
  low: {
    peakThreshold: 0.98,      // Anti-vibración / trabajo activo
    valleyDrop: 0.48,
    minPulseMs: 110,
    maxPulseMs: 420,
  },
};

const MIN_HUMAN_CADENCE_MS = 340;   // Máxima frecuencia humana real: 176 pasos/min (340ms)
const MAX_HUMAN_CADENCE_MS = 1800;  // Mínima frecuencia humana: 33 pasos/min (1800ms)
const MAX_CADENCE_VARIANCE_MS = 180;// Varianza máxima permitida entre zancadas periódicas (180ms)
const MAX_VIOLENT_ACCEL_MS2 = 14.50;// Límite de aceleración biológica humana
const MAX_VEHICLE_SPEED_MS = 5.55;  // >20 km/h = Modo Vehículo

export function usePedometerSensor(
  onStepDetected?: (stepsAdded: number) => void,
  onSetSteps?: (exactDailySteps: number) => void,
  currentDailySteps: number = 0,
  userHeightCm: number = 170,
  userWeightKg: number = 70,
) {
  const todayStr = getLocalTodayDateString();
  const dateKey = `ataraxia_pedometer_steps_${todayStr}`;

  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [isVehicleDetected, setIsVehicleDetected] = useState<boolean>(false);
  const [sensitivity, setSensitivityState] = useState<PedometerSensitivity>(() => {
    try {
      const saved = SafeStorage.getItem(SENSITIVITY_STORAGE_KEY);
      if (saved === 'high' || saved === 'standard' || saved === 'low') return saved;
      return 'standard';
    } catch {
      return 'standard';
    }
  });

  const [isTransitMode, setIsTransitMode] = useState<boolean>(() => {
    try {
      return SafeStorage.getItem(TRANSIT_MODE_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [liveSessionSteps, setLiveSessionSteps] = useState<number>(() => {
    try {
      const saved = SafeStorage.getItem(dateKey);
      return saved ? parseInt(saved, 10) : currentDailySteps;
    } catch {
      return currentDailySteps;
    }
  });

  // ─── Estados de métricas avanzadas (nivel Fitbit / Google Fit) ───────────────
  const [cadenceSpm, setCadenceSpm] = useState<number>(0);
  const [activityMode, setActivityMode] = useState<ActivityMode>('idle');
  const [activeMinutes, setActiveMinutes] = useState<number>(0);

  // Buffer de timestamps para cálculo de cadencia en ventana rodante de 30s (estándar Google Fit)
  const cadenceWindowRef = useRef<number[]>([]);
  const activeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActiveTs = useRef<number>(0);

  // Longitud de zancada manual persistida (calibración del usuario)
  const manualStrideLengthRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    try {
      const saved = SafeStorage.getItem(STRIDE_LENGTH_STORAGE_KEY);
      if (saved) {
        manualStrideLengthRef.current = parseFloat(saved);
      }
    } catch {}
  }, []);

  // Derivados en tiempo real (sin estado extra para evitar re-renders excesivos)
  const distanceKm = calculateDistanceKm(liveSessionSteps, userHeightCm, activityMode, manualStrideLengthRef.current);
  const speedKmh = calculateSpeedKmh(cadenceSpm, userHeightCm, activityMode, manualStrideLengthRef.current);
  const kcalBurned = calculateStepCalories(liveSessionSteps, userWeightKg, userHeightCm, cadenceSpm, activeMinutes);
  const paceMinKm = calculatePaceMinKm(speedKmh);

  // Estados matemáticos internos para filtrado temporal continuo (Delta-t) y cadencia periódica
  const lastSampleTimeRef = useRef<number>(0);
  const gravityNormRef = useRef<number>(9.80);
  const smoothedDynamicRef = useRef<number>(0);
  const isRisingPeakRef = useRef<boolean>(false);
  const peakStartTimeRef = useRef<number>(0);
  const peakMaxValRef = useRef<number>(0);
  const lastCandidateTimeRef = useRef<number>(0);
  const candidateStepsBufferRef = useRef<number[]>([]);
  const isWalkingConfirmedRef = useRef<boolean>(false);

  const pedometerSubscriptionRef = useRef<any>(null);
  const lastWatcherReportedRef = useRef<number | null>(null);
  const highestAuthoritativeCountRef = useRef<number>(currentDailySteps);
  const lastSyncTimestampRef = useRef<number>(0);

  const sensitivityRef = useRef<PedometerSensitivity>(sensitivity);
  sensitivityRef.current = sensitivity;

  const transitModeRef = useRef<boolean>(isTransitMode);
  transitModeRef.current = isTransitMode;

  const isVehicleDetectedRef = useRef<boolean>(isVehicleDetected);
  isVehicleDetectedRef.current = isVehicleDetected;

  const onStepDetectedRef = useRef(onStepDetected);
  onStepDetectedRef.current = onStepDetected;

  const onSetStepsRef = useRef(onSetSteps);
  onSetStepsRef.current = onSetSteps;

  // Screen WakeLock para mantener sensor activo en caminatas con PWA Web
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !(navigator as any).wakeLock) return;

    let wakeLockSentinel: any = null;
    const acquireLock = async () => {
      try {
        if (document.visibilityState === 'visible') {
          wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        }
      } catch {}
    };

    acquireLock();

    const handleVisChange = () => {
      if (document.visibilityState === 'visible') {
        acquireLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisChange);
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, []);

  // Sincronizar referencia autoritativa cuando cambia el conteo diario (Firestore / Google Health / Modales)
  useEffect(() => {
    highestAuthoritativeCountRef.current = currentDailySteps;
    setLiveSessionSteps(currentDailySteps);
    try {
      SafeStorage.setItem(`ataraxia_pedometer_steps_${getLocalTodayDateString()}`, String(currentDailySteps));
      SafeStorage.setItem('ataraxia_pedometer_session_steps_v1', String(currentDailySteps));
    } catch {}
  }, [currentDailySteps]);

  // Cambiar y persistir sensibilidad
  const setSensitivity = useCallback((newSensitivity: PedometerSensitivity) => {
    setSensitivityState(newSensitivity);
    try {
      SafeStorage.setItem(SENSITIVITY_STORAGE_KEY, newSensitivity);
    } catch {}
  }, []);

  // Guardar longitud de zancada manual del usuario (desde calibración)
  const setManualStrideLength = useCallback((strideLengthM: number | undefined) => {
    manualStrideLengthRef.current = strideLengthM;
    try {
      if (strideLengthM !== undefined) {
        SafeStorage.setItem(STRIDE_LENGTH_STORAGE_KEY, String(strideLengthM));
      } else {
        SafeStorage.removeItem?.(STRIDE_LENGTH_STORAGE_KEY);
      }
    } catch {}
  }, []);

  // ─── MOTOR DE CADENCIA SPM (ventana rodante 30s — estándar Google Fit) ───────
  const updateCadenceWindow = useCallback((nowTs: number) => {
    const WINDOW_MS = 30000; // ventana de 30 segundos (estándar de la industria)
    // Añadir el timestamp actual al buffer
    cadenceWindowRef.current.push(nowTs);
    // Purgar timestamps fuera de la ventana de 30s
    cadenceWindowRef.current = cadenceWindowRef.current.filter(t => nowTs - t <= WINDOW_MS);

    const count = cadenceWindowRef.current.length;
    const windowSec = count > 1
      ? (cadenceWindowRef.current[count - 1] - cadenceWindowRef.current[0]) / 1000
      : 0;

    const newCadence = windowSec > 1 ? Math.round((count / windowSec) * 60) : 0;
    const newMode = getActivityModeFromCadence(newCadence);

    setCadenceSpm(newCadence);
    setActivityMode(newMode);

    // Acumular tiempo activo: si cadencia > 60 SPM, el usuario está activo
    if (newCadence >= 60) {
      if (lastActiveTs.current > 0) {
        const elapsed = (nowTs - lastActiveTs.current) / 60000; // en minutos
        if (elapsed < 2) { // evitar saltos enormes al reanudar
          setActiveMinutes(prev => parseFloat((prev + elapsed).toFixed(2)));
        }
      }
      lastActiveTs.current = nowTs;
    } else {
      lastActiveTs.current = 0;
    }
  }, []);

  // 1. Sincronización con Coprocesador de Hardware Nativo (Android / iOS)
  const syncNativeHistoricalSteps = useCallback(async () => {
    if (Platform.OS === 'web') return;

    const nowTimestamp = Date.now();
    if (nowTimestamp - lastSyncTimestampRef.current < 2500) return;
    lastSyncTimestampRef.current = nowTimestamp;

    try {
      const permission = await Pedometer.requestPermissionsAsync();
      if (!permission.granted) {
        setIsAvailable(false);
        return;
      }

      const available = await Pedometer.isAvailableAsync();
      setIsAvailable(available);

      if (available) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const now = new Date();

        const result = await Pedometer.getStepCountAsync(startOfDay, now);
        if (result && typeof result.steps === 'number') {
          const hardwareSteps = result.steps;
          
          if (hardwareSteps >= highestAuthoritativeCountRef.current) {
            highestAuthoritativeCountRef.current = hardwareSteps;
            if (onSetStepsRef.current) {
              onSetStepsRef.current(hardwareSteps);
            }
          }
        }
      }
    } catch (e) {
      console.warn('[usePedometerSensor] Error sincronizando podómetro nativo:', e);
    }
  }, []);

  // 2. Velocímetro GPS / Geolocation Speed Gate (Anti-Vehículo)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;

    let geoWatchId: number | null = null;
    try {
      geoWatchId = navigator.geolocation.watchPosition(
        (position) => {
          const speed = position.coords.speed;
          if (typeof speed === 'number' && speed > MAX_VEHICLE_SPEED_MS) {
            setIsVehicleDetected(true);
          } else {
            setIsVehicleDetected(false);
          }
        },
        () => {
          setIsVehicleDetected(false);
        },
        { enableHighAccuracy: false, maximumAge: 5000, timeout: 10000 }
      );
    } catch (e) {
      console.warn('[usePedometerSensor] Geolocation no disponible:', e);
    }

    return () => {
      if (geoWatchId !== null) {
        navigator.geolocation.clearWatch(geoWatchId);
      }
    };
  }, []);

  // 3. Listener Nativo de Coprocesador de Movimiento en Tiempo Real
  useEffect(() => {
    if (Platform.OS === 'web') return;

    syncNativeHistoricalSteps();

    try {
      lastWatcherReportedRef.current = null;
      pedometerSubscriptionRef.current = Pedometer.watchStepCount((result) => {
        if (result && typeof result.steps === 'number' && !transitModeRef.current && !isVehicleDetectedRef.current) {
          const currentTotal = result.steps;

          if (lastWatcherReportedRef.current === null) {
            lastWatcherReportedRef.current = currentTotal;
            return;
          }

          const rawDelta = currentTotal - lastWatcherReportedRef.current;
          const delta = Math.max(0, rawDelta);

          if (delta > 0) {
            lastWatcherReportedRef.current = currentTotal;
            highestAuthoritativeCountRef.current += delta;
            const nowTs = Date.now();

            setLiveSessionSteps((prev) => {
              const updated = prev + delta;
              try { SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(updated)); } catch {}
              return updated;
            });

            // Alimentar motor de cadencia SPM con cada paso nativo detectado
            for (let i = 0; i < delta; i++) {
              updateCadenceWindow(nowTs + i * 10); // pequeño offset para múltiples pasos juntos
            }

            if (onStepDetectedRef.current) {
              onStepDetectedRef.current(delta);
            }
          }
        }
      });
    } catch (err) {
      console.warn('[usePedometerSensor] Error iniciando watcher nativo:', err);
    }

    return () => {
      if (pedometerSubscriptionRef.current) {
        pedometerSubscriptionRef.current.remove();
        pedometerSubscriptionRef.current = null;
      }
    };
  }, [syncNativeHistoricalSteps]);

  // 4. Sensor Web: Motor Biomecánico con Bloqueo de Cadencia Periódica (Cadence Periodicity Lock)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (transitModeRef.current || isVehicleDetectedRef.current) return;

      const now = Date.now();
      const lastTime = lastSampleTimeRef.current || now;
      lastSampleTimeRef.current = now;

      // Calcular Delta-t real en segundos (acotado para estabilidad matemática)
      const dt = Math.min(0.1, Math.max(0.005, (now - lastTime) / 1000));

      let rx = 0, ry = 0, rz = 0;

      if (
        event.accelerationIncludingGravity &&
        event.accelerationIncludingGravity.x !== null &&
        event.accelerationIncludingGravity.y !== null &&
        event.accelerationIncludingGravity.z !== null
      ) {
        rx = event.accelerationIncludingGravity.x;
        ry = event.accelerationIncludingGravity.y;
        rz = event.accelerationIncludingGravity.z;
      } else if (
        event.acceleration &&
        event.acceleration.x !== null &&
        event.acceleration.y !== null &&
        event.acceleration.z !== null
      ) {
        rx = event.acceleration.x;
        ry = event.acceleration.y;
        rz = event.acceleration.z;
      }

      // ETAPA A: Cálculo de Magnitud 3D a 1D (Invariante a la orientación)
      const rawMagnitude = Math.sqrt(rx * rx + ry * ry + rz * rz);
      if (rawMagnitude === 0) return;

      // Descartar sacudidas destructivas violentas (>15.0 m/s²)
      if (rawMagnitude > MAX_VIOLENT_ACCEL_MS2 + 9.8) {
        isRisingPeakRef.current = false;
        peakMaxValRef.current = 0;
        candidateStepsBufferRef.current = [];
        isWalkingConfirmedRef.current = false;
        return;
      }

      // ETAPA B: Filtrado Pasa-Bajo Biomecánico (1 Hz a 3 Hz)
      // Constante temporal tau = 0.08s (corte ~2.0 Hz a cualquier tasa de FPS)
      const alphaLP = dt / (0.08 + dt);
      const filteredSignal = alphaLP * rawMagnitude + (1 - alphaLP) * smoothedDynamicRef.current;
      smoothedDynamicRef.current = filteredSignal;

      // ETAPA C: Estimación de Umbral Dinámico Adaptativo
      // Actualizar línea base de gravedad adaptativa (tau_g = 1.2s)
      const alphaG = dt / (1.20 + dt);
      gravityNormRef.current = alphaG * filteredSignal + (1 - alphaG) * gravityNormRef.current;
      const dynamicDelta = filteredSignal - gravityNormRef.current;

      const profile = SENSITIVITY_PROFILES[sensitivityRef.current] || SENSITIVITY_PROFILES.standard;

      // 1. Armar cresta cuando la señal supera el umbral adaptativo
      if (dynamicDelta >= profile.peakThreshold) {
        if (!isRisingPeakRef.current) {
          isRisingPeakRef.current = true;
          peakStartTimeRef.current = now;
          peakMaxValRef.current = dynamicDelta;
        } else {
          if (dynamicDelta > peakMaxValRef.current) {
            peakMaxValRef.current = dynamicDelta;
          }
        }
      }

      // 2. Confirmar ciclo cuando desciende tras la cresta (Peak-to-Valley con delta mínimo)
      if (isRisingPeakRef.current) {
        const drop = peakMaxValRef.current - dynamicDelta;
        if (drop >= profile.valleyDrop) {
          const pulseDuration = now - peakStartTimeRef.current;
          isRisingPeakRef.current = false;
          peakMaxValRef.current = 0;

          // ETAPA D: Ventana de Tiempo (Debounce 250ms - 1800ms) y Ráfaga (Step Windowing de 4 Pasos)
          if (pulseDuration >= profile.minPulseMs && pulseDuration <= profile.maxPulseMs) {
            const timeSinceLastCandidate = now - lastCandidateTimeRef.current;

            // Frecuencia mayor a 3.3 Hz (<300ms) -> Descartar vibración rápida de mano
            if (timeSinceLastCandidate < 300) {
              candidateStepsBufferRef.current = [];
              isWalkingConfirmedRef.current = false;
              return;
            }

            // Más de 1.8 segundos sin zancadas -> Reinicio a modo reposo
            if (timeSinceLastCandidate > MAX_HUMAN_CADENCE_MS) {
              candidateStepsBufferRef.current = [now];
              lastCandidateTimeRef.current = now;
              isWalkingConfirmedRef.current = false;
              return;
            }

            lastCandidateTimeRef.current = now;

            if (!isWalkingConfirmedRef.current) {
              // Ráfaga de Validación (Step Windowing): Acumular 4 pasos rítmicos antes de sumar
              candidateStepsBufferRef.current.push(now);

              if (candidateStepsBufferRef.current.length >= 4) {
                const times = candidateStepsBufferRef.current;
                const int1 = times[1] - times[0];
                const int2 = times[2] - times[1];
                const int3 = times[3] - times[2];
                const maxInt = Math.max(int1, int2, int3);
                const minInt = Math.min(int1, int2, int3);
                const variance = maxInt - minInt;

                // Validación de periodicidad humana (cadencia estable)
                if (variance <= MAX_CADENCE_VARIANCE_MS && maxInt <= 1500 && minInt >= 300) {
                  isWalkingConfirmedRef.current = true;
                  const verifiedSteps = times.length;
                  const nowVerified = Date.now();
                  candidateStepsBufferRef.current = [];

                  setLiveSessionSteps((prev) => {
                    const updated = prev + verifiedSteps;
                    try {
                      SafeStorage.setItem(`ataraxia_pedometer_steps_${getLocalTodayDateString()}`, String(updated));
                      SafeStorage.setItem('ataraxia_pedometer_session_steps_v1', String(updated));
                    } catch {}
                    return updated;
                  });

                  // Alimentar motor de cadencia SPM con los pasos verificados del buffer
                  times.forEach((t, i) => updateCadenceWindow(nowVerified - (verifiedSteps - 1 - i) * 300));

                  if (onStepDetectedRef.current) {
                    onStepDetectedRef.current(verifiedSteps);
                  }
                } else {
                  candidateStepsBufferRef.current.shift();
                }
              }
            } else {
              // Marcha confirmada: sumar cada zancada rítmica en tiempo real (+1)
              const nowStep = Date.now();
              setLiveSessionSteps((prev) => {
                const updated = prev + 1;
                try {
                  SafeStorage.setItem(`ataraxia_pedometer_steps_${getLocalTodayDateString()}`, String(updated));
                  SafeStorage.setItem('ataraxia_pedometer_session_steps_v1', String(updated));
                } catch {}
                return updated;
              });

              // Alimentar motor de cadencia SPM con cada paso confirmado
              updateCadenceWindow(nowStep);

              if (onStepDetectedRef.current) {
                onStepDetectedRef.current(1);
              }
            }
          }
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion, { passive: true });

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, []);

  // Control de cambio de foco y AppState
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        if (Platform.OS !== 'web') {
          syncNativeHistoricalSteps();
        } else {
          lastSampleTimeRef.current = 0;
          isRisingPeakRef.current = false;
          peakMaxValRef.current = 0;
          smoothedDynamicRef.current = 0;
          candidateStepsBufferRef.current = [];
          isWalkingConfirmedRef.current = false;
        }
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [syncNativeHistoricalSteps]);

  // Forzar sincronización o alternar Modo Tránsito
  const forceSyncSteps = useCallback(() => {
    if (Platform.OS !== 'web') {
      syncNativeHistoricalSteps();
    } else {
      lastSampleTimeRef.current = 0;
      isRisingPeakRef.current = false;
      peakMaxValRef.current = 0;
      smoothedDynamicRef.current = 0;
      candidateStepsBufferRef.current = [];
      isWalkingConfirmedRef.current = false;

      if (typeof window !== 'undefined' && typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
        (DeviceMotionEvent as any).requestPermission().catch(() => {});
      }
    }
  }, [syncNativeHistoricalSteps]);

  const toggleTransitMode = useCallback(() => {
    setIsTransitMode((prev) => {
      const nextVal = !prev;
      try {
        SafeStorage.setItem(TRANSIT_MODE_STORAGE_KEY, String(nextVal));
      } catch {}
      return nextVal;
    });
  }, []);

  return {
    isAvailable,
    isLiveTracking: isAvailable && !isTransitMode && !isVehicleDetected,
    isTransitMode,
    isVehicleDetected,
    sensitivity,
    setSensitivity,
    liveSessionSteps,
    forceSyncSteps,
    toggleTransitMode,
    toggleLiveTracking: toggleTransitMode,
    // ─── Métricas Avanzadas (Nivel Google Fit / Fitbit) ───────────────────
    cadenceSpm,
    activityMode,
    activeMinutes: Math.round(activeMinutes),
    distanceKm,
    speedKmh,
    paceMinKm,
    kcalBurned,
    setManualStrideLength,
    manualStrideLength: manualStrideLengthRef.current,
  };
}
