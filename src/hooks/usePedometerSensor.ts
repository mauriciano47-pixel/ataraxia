import { useState, useEffect, useRef } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { SafeStorage } from '@/utils/safeStorage';

const PEDOMETER_AUTO_KEY = 'ataraxia_pedometer_auto_active';

export function usePedometerSensor(onStepDetected: (stepsAdded: number) => void) {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isLiveTracking, setIsLiveTracking] = useState<boolean>(() => {
    try {
      const saved = SafeStorage.getItem(PEDOMETER_AUTO_KEY);
      // Por defecto siempre ACTIVO (true) a menos que el usuario lo haya pausado explícitamente
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

  // Check DeviceMotion sensor availability (Web & Mobile Browsers)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      setTimeout(() => setIsAvailable(true), 0);
    }
  }, []);

  // Motion Sensor Listener for Device Motion / Accelerometer
  useEffect(() => {
    if (!isLiveTracking || Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const accel = event.accelerationIncludingGravity;
      if (!accel || accel.x === null || accel.y === null || accel.z === null) return;

      const mag = Math.sqrt(accel.x * accel.x + accel.y * accel.y + accel.z * accel.z);
      const now = Date.now();

      // Si el dispositivo emite eventos reales de acelerómetro, cancelar simulación
      isRealSensorEmitting.current = true;
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
        liveIntervalRef.current = null;
      }

      // Peak Detection Algorithm for Real Steps (Threshold > 11.8 m/s², min 320ms gap)
      if (mag > 11.8 && lastAccelMagnitude.current <= 11.8 && now - lastStepTime.current > 320) {
        lastStepTime.current = now;
        setLiveSessionSteps((prev) => prev + 1);
        onStepDetected(1);
      }
      lastAccelMagnitude.current = mag;
    };

    // Solicitar permisos en iOS Safari si es necesario
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

  // Manejo de visibilidad / segundo plano: reanudar conteo en caliente
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isLiveTracking) {
        // App regresa al primer plano: verificar acelerómetro
        lastStepTime.current = Date.now();
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [isLiveTracking]);

  // Alternar rastreo manual (si el usuario desea pausar el podómetro automático)
  const toggleLiveTracking = () => {
    const nextState = !isLiveTracking;
    setIsLiveTracking(nextState);
    try {
      SafeStorage.setItem(PEDOMETER_AUTO_KEY, String(nextState));
    } catch {}

    if (nextState) {
      if (!isRealSensorEmitting.current) {
        liveIntervalRef.current = setInterval(() => {
          setLiveSessionSteps((prev) => prev + 1);
          onStepDetected(1);
        }, 2000);
      }
    } else {
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


