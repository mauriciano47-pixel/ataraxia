import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { SafeStorage } from '@/utils/safeStorage';

const PEDOMETER_SESSION_STEPS_KEY = 'ataraxia_pedometer_session_steps_v1';
const TRANSIT_MODE_STORAGE_KEY = 'ataraxia_transit_mode_active_v1';
const SENSITIVITY_STORAGE_KEY = 'ataraxia_pedometer_sensitivity_v1';

export type PedometerSensitivity = 'high' | 'standard' | 'low';

// Parámetros por nivel de sensibilidad (AOSP StepDetector Calibrated)
const SENSITIVITY_PROFILES = {
  high: {
    peakThreshold: 0.42,      // Para caminata suave / bolsillo holgado / mochila
    valleyDrop: 0.22,
    minPulseMs: 80,
    maxPulseMs: 480,
  },
  standard: {
    peakThreshold: 0.58,      // Calibración balanceada óptima (mano y bolsillo)
    valleyDrop: 0.28,
    minPulseMs: 90,
    maxPulseMs: 450,
  },
  low: {
    peakThreshold: 0.85,      // Anti-vibración / trabajo activo
    valleyDrop: 0.40,
    minPulseMs: 100,
    maxPulseMs: 420,
  },
};

const MIN_STEP_CADENCE_MS = 260;    // Máxima cadencia humana admisible: 230 pasos/min
const MAX_STEP_CADENCE_MS = 1600;   // Mínima cadencia humana admisible: 37 pasos/min
const MAX_VIOLENT_ACCEL_MS2 = 14.50;// Límite de aceleración biológica humana
const MAX_VEHICLE_SPEED_MS = 5.55;  // >20 km/h = Modo Vehículo

export function usePedometerSensor(
  onStepDetected?: (stepsAdded: number) => void,
  onSetSteps?: (exactDailySteps: number) => void,
  currentDailySteps: number = 0
) {
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
      const saved = SafeStorage.getItem(PEDOMETER_SESSION_STEPS_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Estados matemáticos internos para filtrado temporal continuo (Delta-t)
  const lastSampleTimeRef = useRef<number>(0);
  const gravityNormRef = useRef<number>(9.80);
  const smoothedDynamicRef = useRef<number>(0);
  const isRisingPeakRef = useRef<boolean>(false);
  const peakStartTimeRef = useRef<number>(0);
  const peakMaxValRef = useRef<number>(0);
  const lastStepTimestampRef = useRef<number>(0);

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

  // Sincronizar referencia autoritativa cuando cambia el conteo diario (Firestore / Google Health / Modales)
  useEffect(() => {
    highestAuthoritativeCountRef.current = currentDailySteps;
    setLiveSessionSteps(currentDailySteps);
    try {
      SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(currentDailySteps));
    } catch {}
  }, [currentDailySteps]);

  // Cambiar y persistir sensibilidad
  const setSensitivity = useCallback((newSensitivity: PedometerSensitivity) => {
    setSensitivityState(newSensitivity);
    try {
      SafeStorage.setItem(SENSITIVITY_STORAGE_KEY, newSensitivity);
    } catch {}
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

            setLiveSessionSteps((prev) => {
              const updated = prev + delta;
              try { SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(updated)); } catch {}
              return updated;
            });

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

  // 4. Sensor Web: Motor Continuo AOSP Delta-t Invariante
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (transitModeRef.current || isVehicleDetectedRef.current) return;

      const now = Date.now();
      const lastTime = lastSampleTimeRef.current || now;
      lastSampleTimeRef.current = now;

      // Calcular Delta-t real en segundos (acotado para robustez)
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

      const totalNorm = Math.sqrt(rx * rx + ry * ry + rz * rz);
      if (totalNorm === 0) return;

      // Descartar sacudidas destructivas violentas (>14.5 m/s²)
      if (totalNorm > MAX_VIOLENT_ACCEL_MS2 + 9.8) {
        isRisingPeakRef.current = false;
        peakMaxValRef.current = 0;
        return;
      }

      // Constante temporal de gravedad tau_g = 0.8s (invariante a FPS)
      const alphaG = dt / (0.80 + dt);
      gravityNormRef.current = (1 - alphaG) * gravityNormRef.current + alphaG * totalNorm;
      const rawDynamic = Math.abs(totalNorm - gravityNormRef.current);

      // Constante temporal de suavizado tau_s = 0.045s (invariante a FPS)
      const alphaS = dt / (0.045 + dt);
      const smoothDynamic = (1 - alphaS) * smoothedDynamicRef.current + alphaS * rawDynamic;
      smoothedDynamicRef.current = smoothDynamic;

      const profile = SENSITIVITY_PROFILES[sensitivityRef.current] || SENSITIVITY_PROFILES.standard;

      // FASE 1: Detección y armado de cresta
      if (smoothDynamic >= profile.peakThreshold) {
        if (!isRisingPeakRef.current) {
          isRisingPeakRef.current = true;
          peakStartTimeRef.current = now;
          peakMaxValRef.current = smoothDynamic;
        } else {
          if (smoothDynamic > peakMaxValRef.current) {
            peakMaxValRef.current = smoothDynamic;
          }
        }
      }

      // FASE 2: Detección de caída de cresta (Zancada Confirmada)
      if (isRisingPeakRef.current) {
        const drop = peakMaxValRef.current - smoothDynamic;
        if (drop >= profile.valleyDrop) {
          const pulseDuration = now - peakStartTimeRef.current;
          isRisingPeakRef.current = false;
          peakMaxValRef.current = 0;

          // Validar duración física del pulso de zancada humana
          if (pulseDuration >= profile.minPulseMs && pulseDuration <= profile.maxPulseMs) {
            const timeSinceLastStep = now - lastStepTimestampRef.current;

            // Validar intervalo de cadencia humana [260ms - 1600ms]
            if (lastStepTimestampRef.current === 0 || timeSinceLastStep >= MIN_STEP_CADENCE_MS) {
              lastStepTimestampRef.current = now;

              setLiveSessionSteps((prev) => {
                const updated = prev + 1;
                try { SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(updated)); } catch {}
                return updated;
              });

              if (onStepDetectedRef.current) {
                onStepDetectedRef.current(1);
              }
            }
          }
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion, { passive: true });

    const requestMotionPermission = () => {
      if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
        (DeviceMotionEvent as any).requestPermission().then((res: string) => {
          if (res === 'granted') {
            window.addEventListener('devicemotion', handleMotion, { passive: true });
          }
        }).catch(() => {});
      }
    };

    window.addEventListener('touchstart', requestMotionPermission, { once: true, passive: true });
    window.addEventListener('click', requestMotionPermission, { once: true, passive: true });

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('touchstart', requestMotionPermission);
      window.removeEventListener('click', requestMotionPermission);
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
  };
}
