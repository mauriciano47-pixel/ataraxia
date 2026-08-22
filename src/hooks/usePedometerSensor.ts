import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { SafeStorage } from '@/utils/safeStorage';

const PEDOMETER_SESSION_STEPS_KEY = 'ataraxia_pedometer_session_steps_v1';

// Parámetros Biomecánicos de Marcha Humana (Filtro Anti-Trampa & Anti-Sacudidas)
const MIN_RHYTHMIC_STRIDE_BUFFER = 5;    // Requiere mínimo 5 pasos consecutivos rítmicos para confirmar marcha
const MIN_STEP_INTERVAL_MS = 380;       // Intervalo mínimo entre pasos (~158 pasos/min)
const MAX_STEP_INTERVAL_MS = 1150;      // Intervalo máximo entre pasos (~52 pasos/min)
const GAIT_TIMEOUT_MS = 1800;           // Si transcurren >1.8s sin paso, se confirma reposo y se descarta el buffer
const MIN_VALID_ACCEL = 11.4;           // Umbral mínimo de impacto de talón (m/s²)
const MAX_VALID_ACCEL = 17.2;           // Sacudidas bruscas de mano (>17.2 m/s²) son descartadas como trampa

export function usePedometerSensor(onStepDetected: (stepsAdded: number) => void) {
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const isLiveTracking = true; // IMPERATIVO: Siempre Activo 24/7 (Inmutable)
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
  const lastNativeStepCount = useRef<number>(0);

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
          const delta = lastNativeStepCount.current === 0 
            ? result.steps 
            : Math.max(0, result.steps - lastNativeStepCount.current);

          lastNativeStepCount.current = result.steps;

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
      // Plataforma Nativa (Android / iOS): Sincronizar historial 24h
      syncNativeHistoricalSteps();

      // Iniciar Watcher Nativo en Vivo Always-On
      try {
        pedometerSubscription.current = Pedometer.watchStepCount((result) => {
          if (result && typeof result.steps === 'number' && result.steps > 0) {
            setLiveSessionSteps((prev) => {
              const updated = prev + 1;
              try { SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(updated)); } catch {}
              return updated;
            });
            onStepDetected(1);
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

  // 3. Sensor Web de Acelerómetro con FILTRO BIOMECÁNICO ANTI-SACUDIDAS & ANTI-TRAMPA
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const accel = event.accelerationIncludingGravity;
      if (!accel || accel.x === null || accel.y === null || accel.z === null) return;

      const mag = Math.sqrt(accel.x * accel.x + accel.y * accel.y + accel.z * accel.z);
      const now = Date.now();

      // Resetear buffer si el tiempo entre pasos supera el timeout de marcha (sujeto en reposo)
      if (now - lastStepTime.current > GAIT_TIMEOUT_MS) {
        candidateStepTimestamps.current = [];
        isWalkingGaitLocked.current = false;
      }

      // Descartar sacudidas bruscas no fisiológicas de muñeca/mano (violencia > 17.2 m/s²)
      if (mag > MAX_VALID_ACCEL) {
        candidateStepTimestamps.current = [];
        isWalkingGaitLocked.current = false;
        lastAccelMagnitude.current = mag;
        return;
      }

      // Detección de cresta de onda de impacto de talón
      const isPeakCrossing = mag >= MIN_VALID_ACCEL && lastAccelMagnitude.current < MIN_VALID_ACCEL;

      if (isPeakCrossing) {
        const interval = now - lastStepTime.current;

        // Si la frecuencia es demasiado rápida (<380ms), es agitación espasmódica de mano: DESCARTAR
        if (interval < MIN_STEP_INTERVAL_MS && lastStepTime.current !== 0) {
          candidateStepTimestamps.current = [];
          isWalkingGaitLocked.current = false;
          lastAccelMagnitude.current = mag;
          return;
        }

        // Si el intervalo está en el rango fisiológico de marcha bípeda (380ms - 1150ms)
        if (interval >= MIN_STEP_INTERVAL_MS && interval <= MAX_STEP_INTERVAL_MS) {
          lastStepTime.current = now;

          if (isWalkingGaitLocked.current) {
            // Ya está en marcha activa confirmada: Registrar paso real
            setLiveSessionSteps((prev) => {
              const updated = prev + 1;
              try { SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(updated)); } catch {}
              return updated;
            });
            onStepDetected(1);
          } else {
            // Acumulando candidatos en el buffer previo a validación
            candidateStepTimestamps.current.push(now);

            if (candidateStepTimestamps.current.length >= MIN_RHYTHMIC_STRIDE_BUFFER) {
              // Confirmada marcha humana continua de 5 pasos: Desbloquear y consolidar
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
          window.addEventListener('devicemotion', handleMotion);
        }
      }).catch(() => {});
    } else {
      window.addEventListener('devicemotion', handleMotion);
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

  // Forzar sincronización inmediata (no pausa)
  const forceSyncSteps = useCallback(() => {
    if (Platform.OS !== 'web') {
      syncNativeHistoricalSteps();
    }
  }, [syncNativeHistoricalSteps]);

  return {
    isAvailable,
    isLiveTracking: true,
    liveSessionSteps,
    forceSyncSteps,
    toggleLiveTracking: forceSyncSteps, // Al tocar el botón ejecuta sincronización forzada
  };
}
