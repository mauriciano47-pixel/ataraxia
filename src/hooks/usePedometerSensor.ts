import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { SafeStorage } from '@/utils/safeStorage';

const PEDOMETER_SESSION_STEPS_KEY = 'ataraxia_pedometer_session_steps_v1';

// Parámetros Biomecánicos Optimizados para Respuesta Inmediata (Zero-Lag)
const MIN_RHYTHMIC_STRIDE_BUFFER = 2;    // Comienza a registrar al 2do paso rítmico (respuesta en <1 segundo)
const MIN_STEP_INTERVAL_MS = 250;       // Intervalo mínimo entre pasos (hasta 240 pasos/minuto - trote/marcha rápida)
const MAX_STEP_INTERVAL_MS = 1400;      // Intervalo máximo entre pasos (marcha lenta relajada)
const GAIT_TIMEOUT_MS = 2200;           // Si transcurren >2.2s sin paso, se confirma reposo
const MIN_VALID_ACCEL = 10.35;          // Umbral de impacto de talón optimizado para bolsillo y mano (m/s²)
const MAX_VALID_ACCEL = 18.5;           // Descarte de sacudidas espasmódicas excesivas

export function usePedometerSensor(onStepDetected: (stepsAdded: number) => void) {
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const isLiveTracking = true; // Always-On 24/7
  const [liveSessionSteps, setLiveSessionSteps] = useState<number>(() => {
    try {
      const saved = SafeStorage.getItem(PEDOMETER_SESSION_STEPS_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const lastAccelMagnitude = useRef<number>(0);
  const lastStepTime = useRef<number>(0);
  const candidateStepTimestamps = useRef<number[]>([]);
  const isWalkingGaitLocked = useRef<boolean>(false);
  const pedometerSubscription = useRef<any>(null);
  const lastHistoricalStepCount = useRef<number>(0);
  const lastWatcherSteps = useRef<number>(0);

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
          const delta = lastHistoricalStepCount.current === 0 
            ? result.steps 
            : Math.max(0, result.steps - lastHistoricalStepCount.current);

          lastHistoricalStepCount.current = result.steps;

          if (delta > 0) {
            setLiveSessionSteps((prev) => {
              const updated = prev + delta;
              try { SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(updated)); } catch {}
              return updated;
            });
            onStepDetected(delta);
          }
        }
      }
    } catch (e) {
      console.warn('[usePedometerSensor] Error sincronizando podómetro nativo:', e);
    }
  }, [onStepDetected]);

  // 2. Iniciar sensores permanentes en el montaje
  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
        setIsAvailable(true);
      }
    } else {
      // Plataforma Nativa (Android / iOS): Sincronizar historial 24h inicial
      syncNativeHistoricalSteps();

      // Iniciar Watcher Nativo en Vivo con cálculo de Delta acumulativo exacto
      try {
        lastWatcherSteps.current = 0;
        pedometerSubscription.current = Pedometer.watchStepCount((result) => {
          if (result && typeof result.steps === 'number') {
            const currentTotal = result.steps;
            const delta = lastWatcherSteps.current === 0
              ? currentTotal
              : Math.max(0, currentTotal - lastWatcherSteps.current);

            if (delta > 0) {
              lastWatcherSteps.current = currentTotal;
              setLiveSessionSteps((prev) => {
                const updated = prev + delta;
                try { SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(updated)); } catch {}
                return updated;
              });
              onStepDetected(delta);
            }
          }
        });
      } catch (err) {
        console.warn('[usePedometerSensor] Error iniciando watchStepCount:', err);
      }
    }

    return () => {
      if (pedometerSubscription.current) {
        pedometerSubscription.current.remove();
        pedometerSubscription.current = null;
      }
    };
  }, [syncNativeHistoricalSteps, onStepDetected]);

  // 3. Sensor Web de Acelerómetro de Alta Sensibilidad & Respuesta Instantánea
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const accel = event.accelerationIncludingGravity || event.acceleration;
      if (!accel || accel.x === null || accel.y === null || accel.z === null) return;

      const mag = Math.sqrt(accel.x * accel.x + accel.y * accel.y + accel.z * accel.z);
      const now = Date.now();

      // Resetear buffer si el tiempo entre pasos supera el timeout de marcha
      if (now - lastStepTime.current > GAIT_TIMEOUT_MS) {
        candidateStepTimestamps.current = [];
        isWalkingGaitLocked.current = false;
      }

      // Descartar sacudidas no fisiológicas
      if (mag > MAX_VALID_ACCEL) {
        candidateStepTimestamps.current = [];
        isWalkingGaitLocked.current = false;
        lastAccelMagnitude.current = mag;
        return;
      }

      // Detección de cresta de onda de impacto
      const isPeakCrossing = mag >= MIN_VALID_ACCEL && lastAccelMagnitude.current < MIN_VALID_ACCEL;

      if (isPeakCrossing) {
        const interval = now - lastStepTime.current;

        // Descartar vibración ultrarrápida
        if (interval < MIN_STEP_INTERVAL_MS && lastStepTime.current !== 0) {
          lastAccelMagnitude.current = mag;
          return;
        }

        // Rango fisiológico de marcha
        if (interval >= MIN_STEP_INTERVAL_MS && interval <= MAX_STEP_INTERVAL_MS) {
          lastStepTime.current = now;

          if (isWalkingGaitLocked.current) {
            // Marcha continua confirmada: registrar paso en vivo al instante (0ms lag)
            setLiveSessionSteps((prev) => {
              const updated = prev + 1;
              try { SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(updated)); } catch {}
              return updated;
            });
            onStepDetected(1);
          } else {
            // Acumulando candidatos en el buffer rápido
            candidateStepTimestamps.current.push(now);

            if (candidateStepTimestamps.current.length >= MIN_RHYTHMIC_STRIDE_BUFFER) {
              isWalkingGaitLocked.current = true;
              const countToCommit = candidateStepTimestamps.current.length;
              candidateStepTimestamps.current = [];

              setLiveSessionSteps((prev) => {
                const updated = prev + countToCommit;
                try { SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(updated)); } catch {}
                return updated;
              });
              onStepDetected(countToCommit);
            }
          }
        } else if (lastStepTime.current === 0 || interval > MAX_STEP_INTERVAL_MS) {
          // Primer paso tentativo desde reposo
          lastStepTime.current = now;
          candidateStepTimestamps.current = [now];
        }
      }

      lastAccelMagnitude.current = mag;
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
  }, [onStepDetected]);

  // 4. Manejo de Ciclo de Vida: Reanudar y Sincronizar Pasos al regresar de Segundo Plano
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        if (Platform.OS !== 'web') {
          syncNativeHistoricalSteps();
        } else {
          lastStepTime.current = 0;
          candidateStepTimestamps.current = [];
          isWalkingGaitLocked.current = false;
        }
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [syncNativeHistoricalSteps]);

  // Forzar sincronización inmediata
  const forceSyncSteps = useCallback(() => {
    if (Platform.OS !== 'web') {
      syncNativeHistoricalSteps();
    } else {
      lastStepTime.current = 0;
      candidateStepTimestamps.current = [];
      isWalkingGaitLocked.current = false;
    }
  }, [syncNativeHistoricalSteps]);

  return {
    isAvailable,
    isLiveTracking: true,
    liveSessionSteps,
    forceSyncSteps,
    toggleLiveTracking: forceSyncSteps,
  };
}
