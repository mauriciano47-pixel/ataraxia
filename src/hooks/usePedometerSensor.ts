import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { SafeStorage } from '@/utils/safeStorage';

const PEDOMETER_SESSION_STEPS_KEY = 'ataraxia_pedometer_session_steps_v1';
const TRANSIT_MODE_STORAGE_KEY = 'ataraxia_transit_mode_active_v1';

// ─────────────────────────────────────────────────────────────
// PARÁMETROS DSP BIOMECÁNICOS (FILTRO PASA-BANDA 0.7 Hz - 3.2 Hz)
// ─────────────────────────────────────────────────────────────
const HP_GRAVITY_ALPHA = 0.94;        // Pasa-altos (~0.7 Hz): elimina gravedad y rotaciones lentas
const LP_NOISE_ALPHA = 0.40;          // Pasa-bajos (~3.2 Hz): elimina sacudidas de mano, clics y vibración
const POSITIVE_PEAK_THRESHOLD = 0.65; // Umbral de elevación de zancada (m/s²)
const ZERO_CROSS_FALL_THRESHOLD = -0.45; // Umbral de caída por debajo de cero para confirmar zancada
const MIN_GAIT_INTERVAL_MS = 300;     // Máxima cadencia humana admisible: 200 pasos/min (300ms)
const MAX_GAIT_INTERVAL_MS = 1500;    // Mínima cadencia humana admisible: 40 pasos/min (1500ms)
const MAX_CADENCE_VARIANCE_MS = 480;  // Tolerancia de variación temporal entre pasos consecutivos
const MAX_VIOLENT_ACCEL_MS2 = 14.00;  // Límite de aceleración: descarta caídas o sacudidas violentas
const MAX_VEHICLE_SPEED_MS = 5.55;    // >20 km/h = Modo Vehículo (desactiva podómetro en auto/bus)

export function usePedometerSensor(
  onStepDetected?: (stepsAdded: number) => void,
  onSetSteps?: (exactDailySteps: number) => void,
  currentDailySteps: number = 0
) {
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [isVehicleDetected, setIsVehicleDetected] = useState<boolean>(false);
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

  // Estados internos del procesador DSP de señales
  const gravityBaselineRef = useRef<number>(9.80);
  const lowPassSignalRef = useRef<number>(0);
  const isPositivePeakArmedRef = useRef<boolean>(false);
  const lastStepTimestampRef = useRef<number>(0);
  const lastIntervalRef = useRef<number>(0);
  const consecutiveRhythmicStepsRef = useRef<number>(0);

  const pedometerSubscriptionRef = useRef<any>(null);
  const lastWatcherReportedRef = useRef<number | null>(null);
  const highestAuthoritativeCountRef = useRef<number>(currentDailySteps);
  const lastSyncTimestampRef = useRef<number>(0);

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

  // 4. Sensor Web: Motor DSP Pasa-Banda con Cruce por Cero y Coherencia Periódica
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

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

      const totalNorm = Math.sqrt(rx * rx + ry * ry + rz * rz);
      if (totalNorm === 0) return;

      // Descartar sacudidas destructivas violentas (>14.0 m/s²)
      if (totalNorm > MAX_VIOLENT_ACCEL_MS2 + 9.8) {
        isPositivePeakArmedRef.current = false;
        consecutiveRhythmicStepsRef.current = 0;
        return;
      }

      // ETAPA 1 DSP: Filtro Pasa-Altos (HPF ~0.7 Hz) para eliminar gravedad estática y giros lentos
      gravityBaselineRef.current = HP_GRAVITY_ALPHA * gravityBaselineRef.current + (1 - HP_GRAVITY_ALPHA) * totalNorm;
      const highPassed = totalNorm - gravityBaselineRef.current;

      // ETAPA 2 DSP: Filtro Pasa-Bajos (LPF ~3.2 Hz) para eliminar temblores de mano, clics y sacudidas
      const bandPassed = LP_NOISE_ALPHA * highPassed + (1 - LP_NOISE_ALPHA) * lowPassSignalRef.current;
      lowPassSignalRef.current = bandPassed;

      const now = Date.now();

      // ETAPA 3 DSP: Detector de Cruce por Cero con Histéresis
      // 1. Armar si la onda filtrada sube al umbral positivo (+0.65 m/s²)
      if (bandPassed >= POSITIVE_PEAK_THRESHOLD && !isPositivePeakArmedRef.current) {
        isPositivePeakArmedRef.current = true;
      }

      // 2. Disparar cuando la onda cruza por debajo de cero (-0.45 m/s²)
      if (isPositivePeakArmedRef.current && bandPassed <= ZERO_CROSS_FALL_THRESHOLD) {
        isPositivePeakArmedRef.current = false;

        const interval = now - lastStepTimestampRef.current;

        // Si el intervalo es menor a 300ms, es frecuencia >3.3Hz (agitación rápida de mano) -> IGNORAR
        if (interval > 0 && interval < MIN_GAIT_INTERVAL_MS) {
          consecutiveRhythmicStepsRef.current = 0;
          return;
        }

        // Si pasó demasiado tiempo (>1500ms), es un reinicio de caminata
        if (lastStepTimestampRef.current === 0 || interval > MAX_GAIT_INTERVAL_MS) {
          lastStepTimestampRef.current = now;
          lastIntervalRef.current = 0;
          consecutiveRhythmicStepsRef.current = 1;
          return;
        }

        // Intervalo en rango de marcha humana [300ms - 1500ms]
        const intervalVariance = lastIntervalRef.current > 0 ? Math.abs(interval - lastIntervalRef.current) : 0;
        lastIntervalRef.current = interval;
        lastStepTimestampRef.current = now;

        // Comprobación de ritmo periódico humano
        if (intervalVariance > MAX_CADENCE_VARIANCE_MS && consecutiveRhythmicStepsRef.current === 0) {
          consecutiveRhythmicStepsRef.current = 1;
          return;
        }

        consecutiveRhythmicStepsRef.current += 1;

        // Cuando se confirman al menos 2 pasos rítmicos o la marcha ya está activa
        if (consecutiveRhythmicStepsRef.current >= 2) {
          const stepsToCredit = consecutiveRhythmicStepsRef.current === 2 ? 2 : 1;

          setLiveSessionSteps((prev) => {
            const updated = prev + stepsToCredit;
            try { SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(updated)); } catch {}
            return updated;
          });

          if (onStepDetectedRef.current) {
            onStepDetectedRef.current(stepsToCredit);
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
          lastStepTimestampRef.current = 0;
          lastIntervalRef.current = 0;
          consecutiveRhythmicStepsRef.current = 0;
          isPositivePeakArmedRef.current = false;
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
      lastStepTimestampRef.current = 0;
      lastIntervalRef.current = 0;
      consecutiveRhythmicStepsRef.current = 0;
      isPositivePeakArmedRef.current = false;

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
    liveSessionSteps,
    forceSyncSteps,
    toggleTransitMode,
    toggleLiveTracking: toggleTransitMode,
  };
}
