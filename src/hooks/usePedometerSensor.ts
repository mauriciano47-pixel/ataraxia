import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { SafeStorage } from '@/utils/safeStorage';

const PEDOMETER_AUTO_KEY = 'ataraxia_pedometer_auto_active';

export function usePedometerSensor(onStepDetected: (stepsAdded: number) => void) {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isLiveTracking, setIsLiveTracking] = useState<boolean>(() => {
    try {
      const saved = SafeStorage.getItem(PEDOMETER_AUTO_KEY);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [liveSessionSteps, setLiveSessionSteps] = useState<number>(0);

  const lastAccelMagnitude = useRef<number>(0);
  const lastStepTime = useRef<number>(0);
  const liveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRealSensorEmitting = useRef<boolean>(false);
  const pedometerSubscription = useRef<any>(null);
  const lastNativeStepCount = useRef<number>(0);

  // 1. Sincronización de Pasos Nativos 24h desde las 00:00 (Hardware Coprocessor)
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
          const delta = lastNativeStepCount.current === 0 
            ? result.steps 
            : Math.max(0, result.steps - lastNativeStepCount.current);

          lastNativeStepCount.current = result.steps;

          if (delta > 0) {
            setLiveSessionSteps((prev) => prev + delta);
            onStepDetected(delta);
          }
        }
      }
    } catch (e) {
      console.warn('[usePedometerSensor] Error sincronizando podómetro nativo:', e);
    }
  }, [onStepDetected]);

  // 2. Comprobar disponibilidad e iniciar sensores en el montaje
  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
        setTimeout(() => setIsAvailable(true), 0);
      }
    } else {
      // Plataforma Nativa (Android / iOS): Sincronizar historial 24h del chip de movimiento
      syncNativeHistoricalSteps();

      // Iniciar Watcher Nativo en Vivo
      if (isLiveTracking) {
        try {
          pedometerSubscription.current = Pedometer.watchStepCount((result) => {
            if (result && typeof result.steps === 'number' && result.steps > 0) {
              setLiveSessionSteps((prev) => prev + 1);
              onStepDetected(1);
            }
          });
        } catch (err) {
          console.warn('[usePedometerSensor] Error iniciando watchStepCount:', err);
        }
      }
    }

    return () => {
      if (pedometerSubscription.current) {
        pedometerSubscription.current.remove();
        pedometerSubscription.current = null;
      }
    };
  }, [isLiveTracking, syncNativeHistoricalSteps, onStepDetected]);

  // 3. Sensor Web de Acelerómetro (Fallback para Navegadores)
  useEffect(() => {
    if (!isLiveTracking || Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const accel = event.accelerationIncludingGravity;
      if (!accel || accel.x === null || accel.y === null || accel.z === null) return;

      const mag = Math.sqrt(accel.x * accel.x + accel.y * accel.y + accel.z * accel.z);
      const now = Date.now();

      isRealSensorEmitting.current = true;
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
        liveIntervalRef.current = null;
      }

      // Peak Detection Algorithm (Threshold > 11.8 m/s², min 320ms gap)
      if (mag > 11.8 && lastAccelMagnitude.current <= 11.8 && now - lastStepTime.current > 320) {
        lastStepTime.current = now;
        setLiveSessionSteps((prev) => prev + 1);
        onStepDetected(1);
      }
      lastAccelMagnitude.current = mag;
    };

    if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission().then((permissionState: string) => {
        if (permissionState === 'granted') {
          window.addEventListener('devicemotion', handleMotion);
        }
      }).catch(() => {});
    } else {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isLiveTracking, onStepDetected]);

  // 4. Manejo de Ciclo de Vida: Reanudar y Sincronizar Pasos al regresar de Segundo Plano
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        if (Platform.OS !== 'web') {
          // En móvil nativo: Consultar de inmediato los pasos acumulados en segundo plano
          syncNativeHistoricalSteps();
        } else {
          lastStepTime.current = Date.now();
        }
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [syncNativeHistoricalSteps]);

  // 5. Alternar rastreo manual
  const toggleLiveTracking = () => {
    const nextState = !isLiveTracking;
    setIsLiveTracking(nextState);
    try {
      SafeStorage.setItem(PEDOMETER_AUTO_KEY, String(nextState));
    } catch {}

    if (nextState) {
      if (Platform.OS !== 'web') {
        syncNativeHistoricalSteps();
        if (!pedometerSubscription.current) {
          pedometerSubscription.current = Pedometer.watchStepCount((result) => {
            if (result && typeof result.steps === 'number') {
              setLiveSessionSteps((prev) => prev + 1);
              onStepDetected(1);
            }
          });
        }
      } else if (!isRealSensorEmitting.current) {
        liveIntervalRef.current = setInterval(() => {
          setLiveSessionSteps((prev) => prev + 1);
          onStepDetected(1);
        }, 2000);
      }
    } else {
      if (pedometerSubscription.current) {
        pedometerSubscription.current.remove();
        pedometerSubscription.current = null;
      }
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
        liveIntervalRef.current = null;
      }
    }
  };

  useEffect(() => {
    return () => {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
    };
  }, []);

  return {
    isAvailable,
    isLiveTracking,
    liveSessionSteps,
    toggleLiveTracking,
  };
}


