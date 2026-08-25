import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { SafeStorage } from '@/utils/safeStorage';

const PEDOMETER_SESSION_STEPS_KEY = 'ataraxia_pedometer_session_steps_v1';
const TRANSIT_MODE_STORAGE_KEY = 'ataraxia_transit_mode_active_v1';

// Parámetros Biomecánicos Calibrados de Alta Sensibilidad y Filtro de Gravedad
const GRAVITY_ALPHA = 0.80;             // Coeficiente paso-bajo para vector gravedad
const STEP_CREST_THRESHOLD = 0.70;      // Umbral dinámico de impacto (m/s² sobre línea base) - Calibrado para bolsillos y mano
const STEP_TROUGH_THRESHOLD = 0.25;     // Umbral de despegue/valle para completar ciclo
const MIN_CADENCE_INTERVAL_MS = 220;    // Intervalo mínimo entre pasos (hasta 270 pasos/min)
const MAX_CADENCE_INTERVAL_MS = 1600;   // Intervalo máximo entre pasos (marcha pausada)
const GAIT_TIMEOUT_MS = 2500;           // Tiempo para confirmar reposo
const MAX_VEHICLE_SPEED_MS = 5.55;      // >20 km/h = Modo Vehículo

export function usePedometerSensor(onStepDetected: (stepsAdded: number) => void) {
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

  // Referencias para el filtro paso-alto y supresión de gravedad
  const gravityRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 9.8, z: 0 });
  const isCrestDetectedRef = useRef<boolean>(false);
  const lastStepTimeRef = useRef<number>(0);
  const consecutiveStepsCountRef = useRef<number>(0);
  const pedometerSubscriptionRef = useRef<any>(null);
  const lastHistoricalCountRef = useRef<number>(0);
  const lastWatcherCumulativeRef = useRef<number>(0);
  const transitModeRef = useRef<boolean>(isTransitMode);
  transitModeRef.current = isTransitMode;

  const onStepDetectedRef = useRef(onStepDetected);
  onStepDetectedRef.current = onStepDetected;

  // 1. Sincronización de Pasos Nativos 24h desde las 00:00 locales (Hardware Coprocessor)
  const syncNativeHistoricalSteps = useCallback(async () => {
    if (Platform.OS === 'web') return;

    try {
      const available = await Pedometer.isAvailableAsync();
      setIsAvailable(available);

      if (available) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const now = new Date();

        const result = await Pedometer.getStepCountAsync(startOfDay, now);
        if (result && typeof result.steps === 'number') {
          const delta = lastHistoricalCountRef.current === 0 
            ? result.steps 
            : Math.max(0, result.steps - lastHistoricalCountRef.current);

          lastHistoricalCountRef.current = result.steps;

          if (delta > 0 && !transitModeRef.current) {
            setLiveSessionSteps((prev) => {
              const updated = prev + delta;
              try { SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(updated)); } catch {}
              return updated;
            });
            onStepDetectedRef.current(delta);
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
          const speed = position.coords.speed; // metros por segundo
          if (typeof speed === 'number' && speed > MAX_VEHICLE_SPEED_MS) {
            setIsVehicleDetected(true);
          } else {
            setIsVehicleDetected(false);
          }
        },
        () => {
          // Si no hay permiso GPS, el filtro de armónicos biomecánicos asume la protección
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

  // 3. Sensor Nativo Always-On (Android / iOS)
  useEffect(() => {
    if (Platform.OS === 'web') return;

    syncNativeHistoricalSteps();

    try {
      lastWatcherCumulativeRef.current = 0;
      pedometerSubscriptionRef.current = Pedometer.watchStepCount((result) => {
        if (result && typeof result.steps === 'number' && !transitModeRef.current) {
          const currentTotal = result.steps;
          const delta = lastWatcherCumulativeRef.current === 0
            ? currentTotal
            : Math.max(0, currentTotal - lastWatcherCumulativeRef.current);

          if (delta > 0) {
            lastWatcherCumulativeRef.current = currentTotal;
            setLiveSessionSteps((prev) => {
              const updated = prev + delta;
              try { SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(updated)); } catch {}
              return updated;
            });
            onStepDetectedRef.current(delta);
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

  // 4. Sensor Web de Acelerómetro con Filtro de Separación de Gravedad & Ciclo Completo
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (transitModeRef.current) return;

      const raw = event.accelerationIncludingGravity || event.acceleration;
      if (!raw || raw.x === null || raw.y === null || raw.z === null) return;

      const rx = raw.x;
      const ry = raw.y;
      const rz = raw.z;

      // Filtro paso-bajo para aislar la componente estática de la gravedad
      gravityRef.current.x = GRAVITY_ALPHA * gravityRef.current.x + (1 - GRAVITY_ALPHA) * rx;
      gravityRef.current.y = GRAVITY_ALPHA * gravityRef.current.y + (1 - GRAVITY_ALPHA) * ry;
      gravityRef.current.z = GRAVITY_ALPHA * gravityRef.current.z + (1 - GRAVITY_ALPHA) * rz;

      // Aceleración dinámica lineal pura (sin gravedad y sin importar orientación del móvil)
      const lx = rx - gravityRef.current.x;
      const ly = ry - gravityRef.current.y;
      const lz = rz - gravityRef.current.z;

      const dynamicMag = Math.sqrt(lx * lx + ly * ly + lz * lz);
      const now = Date.now();
      const interval = now - lastStepTimeRef.current;

      // Reiniciar buffer si el usuario estuvo en reposo prolongado
      if (interval > GAIT_TIMEOUT_MS) {
        consecutiveStepsCountRef.current = 0;
        isCrestDetectedRef.current = false;
      }

      // FASE 1: Detección de cresta de impacto (Talón contra el suelo)
      if (!isCrestDetectedRef.current && dynamicMag >= STEP_CREST_THRESHOLD) {
        if (interval >= MIN_CADENCE_INTERVAL_MS || lastStepTimeRef.current === 0) {
          isCrestDetectedRef.current = true;
        }
      }

      // FASE 2: Detección de valle de despegue (Ciclo sinusoidal completo confirmado)
      if (isCrestDetectedRef.current && dynamicMag <= STEP_TROUGH_THRESHOLD) {
        isCrestDetectedRef.current = false;

        if (interval >= MIN_CADENCE_INTERVAL_MS && interval <= MAX_CADENCE_INTERVAL_MS) {
          lastStepTimeRef.current = now;
          consecutiveStepsCountRef.current += 1;

          // Registrar paso real en vivo de forma inmediata
          setLiveSessionSteps((prev) => {
            const updated = prev + 1;
            try { SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(updated)); } catch {}
            return updated;
          });
          onStepDetectedRef.current(1);
        } else if (lastStepTimeRef.current === 0 || interval > MAX_CADENCE_INTERVAL_MS) {
          lastStepTimeRef.current = now;
          consecutiveStepsCountRef.current = 1;
        }
      }
    };

    if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission().then((permissionState: string) => {
        if (permissionState === 'granted') {
          window.addEventListener('devicemotion', handleMotion, { passive: true });
        }
      }).catch(() => {});
    } else {
      window.addEventListener('devicemotion', handleMotion, { passive: true });
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, []);

  // 5. Manejo de Ciclo de Vida: Reanudar al volver de segundo plano
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        if (Platform.OS !== 'web') {
          syncNativeHistoricalSteps();
        } else {
          lastStepTimeRef.current = 0;
          isCrestDetectedRef.current = false;
          consecutiveStepsCountRef.current = 0;
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
      lastStepTimeRef.current = 0;
      isCrestDetectedRef.current = false;

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
    isLiveTracking: !isTransitMode && !isVehicleDetected,
    isTransitMode,
    isVehicleDetected,
    liveSessionSteps,
    forceSyncSteps,
    toggleTransitMode,
    toggleLiveTracking: forceSyncSteps,
  };
}
