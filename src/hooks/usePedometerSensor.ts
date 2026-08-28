import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { SafeStorage } from '@/utils/safeStorage';

const PEDOMETER_SESSION_STEPS_KEY = 'ataraxia_pedometer_session_steps_v1';
const TRANSIT_MODE_STORAGE_KEY = 'ataraxia_transit_mode_active_v1';

// Parámetros Biomecánicos Calibrados de Alta Precisión & Zero-Lag (Estándar Peak-Valley)
const GRAVITY_SMOOTH_ALPHA = 0.97;      // Filtro paso-bajo de gravedad estable (constante temporal ~1.8s)
const GAIT_SMOOTH_ALPHA = 0.70;         // Suavizado dinámico reactivo
const STEP_PEAK_THRESHOLD = 1.05;       // Umbral mínimo de cresta de zancada (m/s²), óptimo para bolsillo, mano y bolso
const STEP_VALLEY_DELTA = 0.32;         // Caída mínima desde la cresta para confirmar el ciclo de zancada
const STEP_VALLEY_FLOOR = 0.75;         // Umbral de retorno al suelo
const MIN_STEP_INTERVAL_MS = 250;       // Intervalo mínimo entre pasos (hasta 240 pasos/min, ritmo humano máximo)
const MAX_STEP_INTERVAL_MS = 1800;      // Intervalo máximo entre pasos (caminata pausada / reinicio de ciclo)
const MAX_HUMAN_ACCEL_MS2 = 14.50;      // Límite de aceleración biológica humana (rechaza sacudidas violentas de mano)
const MAX_VEHICLE_SPEED_MS = 5.55;      // >20 km/h = Modo Vehículo

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

  // Referencias para el filtro web, listeners nativos y buffer de zancada
  const gravityNormRef = useRef<number>(9.80);
  const smoothedMagRef = useRef<number>(0);
  const isPeakArmedRef = useRef<boolean>(false);
  const peakMaxValRef = useRef<number>(0);
  const peakArmedTimeRef = useRef<number>(0);
  const lastStepTimestampRef = useRef<number>(0);
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

  // Sincronizar referencia autoritativa cuando cambia el conteo diario
  useEffect(() => {
    highestAuthoritativeCountRef.current = currentDailySteps;
    setLiveSessionSteps(currentDailySteps);
    try {
      SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(currentDailySteps));
    } catch {}
  }, [currentDailySteps]);

  // 1. Sincronización de Pasos Nativos 24h desde las 00:00 locales (Hardware Coprocessor)
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

  // 2. Velocímetro GPS / Geolocation Speed Gate (Anti-Vehículo / Auto / Bus)
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

  // 3. Sensor Nativo Always-On en Tiempo Real (Android / iOS)
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

  // 4. Sensor Web: Motor Biomecánico Adaptativo Peak-Valley Zero-Lag
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (transitModeRef.current || isVehicleDetectedRef.current) return;

      let dynamicAcc = 0;

      // Método A: Aceleración lineal directa del hardware (si está disponible)
      if (
        event.acceleration &&
        event.acceleration.x !== null &&
        event.acceleration.y !== null &&
        event.acceleration.z !== null
      ) {
        const ax = event.acceleration.x;
        const ay = event.acceleration.y;
        const az = event.acceleration.z;
        const rawLinear = Math.sqrt(ax * ax + ay * ay + az * az);
        dynamicAcc = rawLinear;
      } 
      // Método B: Aceleración con gravedad (Norma 3D invariante a la orientación)
      else if (
        event.accelerationIncludingGravity &&
        event.accelerationIncludingGravity.x !== null &&
        event.accelerationIncludingGravity.y !== null &&
        event.accelerationIncludingGravity.z !== null
      ) {
        const rx = event.accelerationIncludingGravity.x;
        const ry = event.accelerationIncludingGravity.y;
        const rz = event.accelerationIncludingGravity.z;
        const totalNorm = Math.sqrt(rx * rx + ry * ry + rz * rz);

        // Filtro IIR de gravedad continuo (conserva la gravedad ~9.8m/s² sin restar las oscilaciones de los pasos)
        gravityNormRef.current = GRAVITY_SMOOTH_ALPHA * gravityNormRef.current + (1 - GRAVITY_SMOOTH_ALPHA) * totalNorm;
        dynamicAcc = Math.abs(totalNorm - gravityNormRef.current);
      }

      if (dynamicAcc === 0) return;

      // Suavizado dinámico reactivo
      const smoothMag = smoothedMagRef.current === 0
        ? dynamicAcc
        : (GAIT_SMOOTH_ALPHA * dynamicAcc + (1 - GAIT_SMOOTH_ALPHA) * smoothedMagRef.current);
      smoothedMagRef.current = smoothMag;

      // Descartar sacudidas destructivas violentas (>14.5 m/s²)
      if (smoothMag > MAX_HUMAN_ACCEL_MS2) {
        isPeakArmedRef.current = false;
        peakMaxValRef.current = 0;
        return;
      }

      const now = Date.now();

      // FASE 1: Detección y armado de cresta (Peak Detection)
      if (smoothMag >= STEP_PEAK_THRESHOLD) {
        if (!isPeakArmedRef.current) {
          isPeakArmedRef.current = true;
          peakMaxValRef.current = smoothMag;
          peakArmedTimeRef.current = now;
        } else {
          // Registrar el pico máximo durante la fase de ascenso
          if (smoothMag > peakMaxValRef.current) {
            peakMaxValRef.current = smoothMag;
          }
        }
      }

      // FASE 2: Detección de valle y confirmación de zancada (Valley Confirmation)
      if (isPeakArmedRef.current) {
        const peakDrop = peakMaxValRef.current - smoothMag;
        const hasDroppedFromPeak = peakDrop >= STEP_VALLEY_DELTA || smoothMag <= STEP_VALLEY_FLOOR;

        if (hasDroppedFromPeak) {
          isPeakArmedRef.current = false;
          const peakMax = peakMaxValRef.current;
          peakMaxValRef.current = 0;

          const timeSinceLastStep = now - lastStepTimestampRef.current;

          // Validar ventana de cadencia humana [250ms - 1800ms]
          if (lastStepTimestampRef.current === 0 || timeSinceLastStep >= MIN_STEP_INTERVAL_MS) {
            lastStepTimestampRef.current = now;

            // Incremento instantáneo en tiempo real (Zero-Lag)
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
    };

    window.addEventListener('devicemotion', handleMotion, { passive: true });

    // Permisos en navegadores móviles (iOS Safari / Chrome Android)
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
          isPeakArmedRef.current = false;
          peakMaxValRef.current = 0;
          smoothedMagRef.current = 0;
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
      isPeakArmedRef.current = false;
      peakMaxValRef.current = 0;
      smoothedMagRef.current = 0;

      // Solicitar permiso de movimiento en navegadores móviles (iOS/Android)
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
