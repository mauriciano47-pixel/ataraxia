import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export function usePedometerSensor(onStepDetected: (stepsAdded: number) => void) {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isLiveTracking, setIsLiveTracking] = useState<boolean>(false);
  const [liveSessionSteps, setLiveSessionSteps] = useState<number>(0);

  const lastAccelMagnitude = useRef<number>(0);
  const lastStepTime = useRef<number>(0);
  const liveIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

      // Si el dispositivo emite eventos reales de acelerómetro, cancelar simulación por temporizador
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
        liveIntervalRef.current = null;
      }

      // Simple Peak Detection Algorithm for Real Steps (Threshold > 11.8 m/s², min 300ms gap)
      if (mag > 11.8 && lastAccelMagnitude.current <= 11.8 && now - lastStepTime.current > 320) {
        lastStepTime.current = now;
        setLiveSessionSteps((prev) => prev + 1);
        onStepDetected(1);
      }
      lastAccelMagnitude.current = mag;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isLiveTracking, onStepDetected]);

  // Live Auto-Walker Simulation (Para navegadores de escritorio sin acelerómetro físico)
  const toggleLiveTracking = () => {
    const nextState = !isLiveTracking;
    setIsLiveTracking(nextState);

    if (nextState) {
      // Inicia un pulso sutil cada 2s para simulación desktop que se apaga si hay acelerómetro real
      liveIntervalRef.current = setInterval(() => {
        setLiveSessionSteps((prev) => prev + 1);
        onStepDetected(1);
      }, 2000);
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

