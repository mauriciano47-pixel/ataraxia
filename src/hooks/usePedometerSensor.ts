import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { SafeStorage } from '@/utils/safeStorage';
import { getLocalTodayDateString } from '@/utils/dateUtils';
import { logger } from '@/lib/logger';
import {
  getActivityModeFromCadence,
  calculateDistanceKm,
  calculateSpeedKmh,
  calculateStepCalories,
  calculatePaceMinKm,
  ActivityMode,
} from '@/lib/fitnessCalculator';
import {
  createPedometerEngineState,
  processAccelerometerSample,
  PEDOMETER_CONSTANTS,
} from '@/lib/pedometerEngine';

const TRANSIT_MODE_STORAGE_KEY = 'ataraxia_transit_mode_active_v1';
const SENSITIVITY_STORAGE_KEY = 'ataraxia_pedometer_sensitivity_v1';
const PEDOMETER_SESSION_STEPS_KEY = 'ataraxia_pedometer_session_steps_v1';
const STRIDE_LENGTH_STORAGE_KEY = 'ataraxia_stride_length_manual_v1';

export type PedometerSensitivity = 'high' | 'standard' | 'low';
export type { ActivityMode };

const MAX_VEHICLE_SPEED_MS = PEDOMETER_CONSTANTS.MAX_VEHICLE_SPEED_MS;  // >20 km/h = Modo Vehículo

export function usePedometerSensor(
  onStepDetected?: (stepsAdded: number) => void,
  onSetSteps?: (exactDailySteps: number) => void,
  currentDailySteps: number = 0,
  userHeightCm: number = 170,
  userWeightKg: number = 70,
  isPassiveWatcher: boolean = false,
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
      return saved ? Number.parseInt(saved, 10) : currentDailySteps;
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
  const lastActiveTs = useRef<number>(0);

  // Longitud de zancada manual persistida (calibración del usuario)
  const manualStrideLengthRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    try {
      const saved = SafeStorage.getItem(STRIDE_LENGTH_STORAGE_KEY);
      if (saved) {
        manualStrideLengthRef.current = Number.parseFloat(saved);
      }
    } catch {}
  }, []);

  // Derivados en tiempo real (sin estado extra para evitar re-renders excesivos)
  const distanceKm = calculateDistanceKm(liveSessionSteps, userHeightCm, activityMode, manualStrideLengthRef.current);
  const speedKmh = calculateSpeedKmh(cadenceSpm, userHeightCm, activityMode, manualStrideLengthRef.current);
  const kcalBurned = calculateStepCalories(liveSessionSteps, userWeightKg, userHeightCm, cadenceSpm, activeMinutes);
  const paceMinKm = calculatePaceMinKm(speedKmh);

  // Estado matemático interno unificado del motor biomecánico DSP
  const engineStateRef = useRef(createPedometerEngineState());

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

  // Buffer de emisión en lote (Batching) para no saturar el hilo JS ni React en móviles
  const pendingStepBatchRef = useRef<number>(0);
  const batchEmitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emitStepsBatched = useCallback((stepsCount: number) => {
    pendingStepBatchRef.current += stepsCount;

    if (!batchEmitTimerRef.current) {
      batchEmitTimerRef.current = setTimeout(() => {
        const toEmit = pendingStepBatchRef.current;
        pendingStepBatchRef.current = 0;
        batchEmitTimerRef.current = null;
        if (toEmit > 0 && onStepDetectedRef.current) {
          onStepDetectedRef.current(toEmit);
        }
      }, 1500); // Agrupar pasos cada 1.5s
    } else if (pendingStepBatchRef.current >= 6) {
      // Si se acumulan 6 pasos, emitir inmediatamente
      clearTimeout(batchEmitTimerRef.current);
      batchEmitTimerRef.current = null;
      const toEmit = pendingStepBatchRef.current;
      pendingStepBatchRef.current = 0;
      if (toEmit > 0 && onStepDetectedRef.current) {
        onStepDetectedRef.current(toEmit);
      }
    }
  }, []);

  // Flush de pasos pendientes al desmontar
  useEffect(() => {
    return () => {
      if (batchEmitTimerRef.current) {
        clearTimeout(batchEmitTimerRef.current);
        const toEmit = pendingStepBatchRef.current;
        if (toEmit > 0 && onStepDetectedRef.current) {
          onStepDetectedRef.current(toEmit);
        }
      }
    };
  }, []);

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

    void acquireLock();

    const handleVisChange = () => {
      if (document.visibilityState === 'visible') {
        void acquireLock();
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
          setActiveMinutes(prev => Number.parseFloat((prev + elapsed).toFixed(2)));
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

      if (available && Platform.OS === 'ios') {
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
      logger.warn('[usePedometerSensor] Error sincronizando podómetro nativo:', e);
    }
  }, []);

  // 2. Velocímetro GPS / Geolocation Speed Gate (Anti-Vehículo) - Solo si el modo tránsito está activo
  useEffect(() => {
    if (isPassiveWatcher || !isTransitMode || Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.geolocation) return;

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
      logger.warn('[usePedometerSensor] Geolocation no disponible:', e);
    }

    return () => {
      if (geoWatchId !== null) {
        navigator.geolocation.clearWatch(geoWatchId);
      }
    };
  }, [isPassiveWatcher, isTransitMode]);

  // 3. Listener Nativo de Coprocesador de Movimiento en Tiempo Real
  useEffect(() => {
    if (isPassiveWatcher || Platform.OS === 'web') return;

    void syncNativeHistoricalSteps();

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

            emitStepsBatched(delta);
          }
        }
      });
    } catch (err) {
      logger.warn('[usePedometerSensor] Error iniciando watcher nativo:', err);
    }

    return () => {
      if (pedometerSubscriptionRef.current) {
        pedometerSubscriptionRef.current.remove();
        pedometerSubscriptionRef.current = null;
      }
    };
  }, [isPassiveWatcher, syncNativeHistoricalSteps, emitStepsBatched, updateCadenceWindow]);

  // 4. Sensor Web: Motor Biomecánico con Bloqueo de Cadencia Periódica (Cadence Periodicity Lock)
  useEffect(() => {
    if (isPassiveWatcher || Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (transitModeRef.current || isVehicleDetectedRef.current) return;

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

      const now = Date.now();
      const result = processAccelerometerSample(
        engineStateRef.current,
        rx,
        ry,
        rz,
        now,
        sensitivityRef.current,
        transitModeRef.current || isVehicleDetectedRef.current,
      );

      if (result.stepsAdded > 0) {
        setLiveSessionSteps((prev) => {
          const updated = prev + result.stepsAdded;
          try {
            SafeStorage.setItem(`ataraxia_pedometer_steps_${getLocalTodayDateString()}`, String(updated));
            SafeStorage.setItem('ataraxia_pedometer_session_steps_v1', String(updated));
          } catch {}
          return updated;
        });

        result.stepTimestamps.forEach((ts) => updateCadenceWindow(ts));
        emitStepsBatched(result.stepsAdded);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('devicemotion', handleMotion, { passive: true });
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, [isPassiveWatcher, emitStepsBatched, updateCadenceWindow]);

  // Control de cambio de foco y AppState
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        if (Platform.OS !== 'web') {
          syncNativeHistoricalSteps();
        } else {
          engineStateRef.current = createPedometerEngineState();
        }
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => { sub.remove(); };
  }, [syncNativeHistoricalSteps]);

  // Forzar sincronización o alternar Modo Tránsito
  const forceSyncSteps = useCallback(() => {
    if (Platform.OS !== 'web') {
      syncNativeHistoricalSteps();
    } else {
      engineStateRef.current = createPedometerEngineState();

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
