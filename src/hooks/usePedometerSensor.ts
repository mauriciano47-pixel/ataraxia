import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { SafeStorage } from '@/utils/safeStorage';

const PEDOMETER_SESSION_STEPS_KEY = 'ataraxia_pedometer_session_steps_v1';
const TRANSIT_MODE_STORAGE_KEY = 'ataraxia_transit_mode_active_v1';

// Parámetros Biomecánicos Calibrados de Alta Sensibilidad y Filtro de Gravedad
const GRAVITY_ALPHA = 0.98;             // Coeficiente paso-bajo estándar (constante de tiempo ~1s a 60Hz)
const STEP_THRESHOLD = 0.55;            // Umbral dinámico de aceleración lineal neta (m/s²)
const MIN_CADENCE_INTERVAL_MS = 240;    // Intervalo mínimo entre pasos (hasta 250 pasos/min)
const MAX_CADENCE_INTERVAL_MS = 1800;   // Intervalo máximo entre pasos (marcha pausada)
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
  const lastStepTimeRef = useRef<number>(0);
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

  // 4. Sensor Web de Acelerómetro con Fusión Dual (Linear Acceleration + Gravity Isolation)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (transitModeRef.current) return;

      let dynamicMag = 0;

      // Opción A: Aceleración lineal directa del hardware (Chrome Android & navegadores modernos)
      if (
        event.acceleration &&
        event.acceleration.x !== null &&
        event.acceleration.y !== null &&
        event.acceleration.z !== null
      ) {
        const ax = event.acceleration.x;
        const ay = event.acceleration.y;
        const az = event.acceleration.z;
        dynamicMag = Math.sqrt(ax * ax + ay * ay + az * az);
      } 
      // Opción B: Aceleración con gravedad (Filtro paso-alto con constante de 1 segundo)
      else if (
        event.accelerationIncludingGravity &&
        event.accelerationIncludingGravity.x !== null &&
        event.accelerationIncludingGravity.y !== null &&
        event.accelerationIncludingGravity.z !== null
      ) {
        const rx = event.accelerationIncludingGravity.x;
        const ry = event.accelerationIncludingGravity.y;
        const rz = event.accelerationIncludingGravity.z;

        gravityRef.current.x = GRAVITY_ALPHA * gravityRef.current.x + (1 - GRAVITY_ALPHA) * rx;
        gravityRef.current.y = GRAVITY_ALPHA * gravityRef.current.y + (1 - GRAVITY_ALPHA) * ry;
        gravityRef.current.z = GRAVITY_ALPHA * gravityRef.current.z + (1 - GRAVITY_ALPHA) * rz;

        const lx = rx - gravityRef.current.x;
        const ly = ry - gravityRef.current.y;
        const lz = rz - gravityRef.current.z;

        dynamicMag = Math.sqrt(lx * lx + ly * ly + lz * lz);
      }

      if (dynamicMag === 0) return;

      const now = Date.now();
      const interval = now - lastStepTimeRef.current;

      // Registro de paso con ventana de cadencia humana (240ms - 1800ms)
      if (dynamicMag >= STEP_THRESHOLD && (interval >= MIN_CADENCE_INTERVAL_MS || lastStepTimeRef.current === 0)) {
        lastStepTimeRef.current = now;

        setLiveSessionSteps((prev) => {
          const updated = prev + 1;
          try { SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(updated)); } catch {}
          return updated;
        });
        onStepDetectedRef.current(1);
      }
    };

    // Registro estándar de devicemotion
    window.addEventListener('devicemotion', handleMotion, { passive: true });

    // En iOS Safari se requiere permiso explícito en respuesta a un gesto
    const requestIOSMotion = () => {
      if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
        (DeviceMotionEvent as any).requestPermission().then((res: string) => {
          if (res === 'granted') {
            window.addEventListener('devicemotion', handleMotion, { passive: true });
          }
        }).catch(() => {});
      }
    };

    window.addEventListener('touchstart', requestIOSMotion, { once: true, passive: true });
    window.addEventListener('click', requestIOSMotion, { once: true, passive: true });

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('touchstart', requestIOSMotion);
      window.removeEventListener('click', requestIOSMotion);
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
