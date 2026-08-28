import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { SafeStorage } from '@/utils/safeStorage';

const PEDOMETER_SESSION_STEPS_KEY = 'ataraxia_pedometer_session_steps_v1';
const TRANSIT_MODE_STORAGE_KEY = 'ataraxia_transit_mode_active_v1';

// Parámetros Biomecánicos Calibrados Anti-Shock con Filtro de Duración de Zancada Real
const GRAVITY_ALPHA = 0.85;             // Coeficiente paso-bajo de convergencia rápida (~200ms)
const GAIT_EMA_ALPHA = 0.35;            // Filtro paso-bajo de marcha humana (~3 Hz, atenúa impactos táctiles rápidos)
const WEB_STEP_THRESHOLD = 1.35;        // Umbral dinámico de activación de zancada (m/s²)
const WEB_STEP_RESET_THRESHOLD = 0.50;  // Umbral de caída de ciclo para detector de picos
const MIN_PEAK_DURATION_MS = 85;        // Duración mínima del pico (m descarta toques rápidos en pantalla <85ms)
const MAX_PEAK_DURATION_MS = 600;       // Duración máxima del pico de aceleración de zancada
const MIN_CADENCE_INTERVAL_MS = 300;    // Intervalo mínimo entre pasos (hasta 200 pasos/min, trote/marcha)
const MAX_CADENCE_INTERVAL_MS = 1500;   // Intervalo máximo entre pasos (caminata pausada)
const MAX_HUMAN_ACCEL_MS2 = 12.00;      // Aceleración máxima permitida (rechaza sacudidas violentas de mano)
const MAX_INTERVAL_VARIANCE_MS = 500;   // Tolerancia de variación de ritmo al girar o cambiar de velocidad
const REQUIRED_CADENCE_STEPS = 4;       // Marcha real confirmada: 4 pasos rítmicos antes de sumar a la cuenta
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

  // Referencias para el filtro web, listeners nativos y buffer anti-agitación
  const gravityRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 9.8, z: 0 });
  const isPeakArmRef = useRef<boolean>(false);
  const peakStartTimeRef = useRef<number>(0);
  const lastStepTimeRef = useRef<number>(0);
  const lastIntervalRef = useRef<number>(0);
  const candidateStepsRef = useRef<number>(0);
  const isWalkingCadenceConfirmedRef = useRef<boolean>(false);
  const lastFilteredMagRef = useRef<number>(0);
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

  // Sincronizar referencia autoritativa cuando cambia el conteo diario (ej. sincronización con Google Health, Smartwatch o reinicio)
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

    // Evitar llamadas concurrentes o en ráfaga (mínimo 3 segundos entre syncs)
    const nowTimestamp = Date.now();
    if (nowTimestamp - lastSyncTimestampRef.current < 3000) return;
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
          
          // Si el coprocesador de hardware tiene un conteo mayor o igual, actualizar el baseline authoritative
          if (hardwareSteps >= highestAuthoritativeCountRef.current) {
            highestAuthoritativeCountRef.current = hardwareSteps;
            
            // Si tenemos callback para fijar el número exacto, sincronizar directamente sin sumar deltas desfasados
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

  // 3. Sensor Nativo Always-On en Tiempo Real (Android / iOS)
  useEffect(() => {
    if (Platform.OS === 'web') return;

    syncNativeHistoricalSteps();

    try {
      lastWatcherReportedRef.current = null;
      pedometerSubscriptionRef.current = Pedometer.watchStepCount((result) => {
        if (result && typeof result.steps === 'number' && !transitModeRef.current && !isVehicleDetectedRef.current) {
          const currentTotal = result.steps;

          // Primera lectura: establecer el punto de partida de la sesión
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

  // 4. Sensor Web: Filtro de Marcha Biomecánica & Detección Fluida de Pasos
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (transitModeRef.current || isVehicleDetectedRef.current) return;

      let rawMag = 0;

      // Opción A: Aceleración lineal directa del hardware
      if (
        event.acceleration &&
        event.acceleration.x !== null &&
        event.acceleration.y !== null &&
        event.acceleration.z !== null
      ) {
        const ax = event.acceleration.x;
        const ay = event.acceleration.y;
        const az = event.acceleration.z;
        rawMag = Math.sqrt(ax * ax + ay * ay + az * az);
      } 
      // Opción B: Aceleración con gravedad (Filtro paso-alto adaptativo)
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

        rawMag = Math.sqrt(lx * lx + ly * ly + lz * lz);
      }

      if (rawMag === 0) return;

      // Filtro paso-bajo de marcha: atenúa fuertemente picos y golpes táctiles rápidos en la pantalla
      const dynamicMag = lastFilteredMagRef.current === 0
        ? rawMag
        : (GAIT_EMA_ALPHA * rawMag + (1 - GAIT_EMA_ALPHA) * lastFilteredMagRef.current);
      lastFilteredMagRef.current = dynamicMag;

      // Rechazar sacudidas destructivas violentas (>12.0 m/s²)
      if (dynamicMag > MAX_HUMAN_ACCEL_MS2) {
        candidateStepsRef.current = 0;
        isWalkingCadenceConfirmedRef.current = false;
        isPeakArmRef.current = false;
        return;
      }

      const now = Date.now();
      const interval = now - lastStepTimeRef.current;

      // 1. Armar pico si supera el umbral de marcha y registrar el tiempo exacto en que empezó
      if (dynamicMag >= WEB_STEP_THRESHOLD && !isPeakArmRef.current) {
        isPeakArmRef.current = true;
        peakStartTimeRef.current = now;
      }

      // 2. Disparar evaluación cuando la señal desciende tras la cresta
      if (isPeakArmRef.current && dynamicMag <= WEB_STEP_RESET_THRESHOLD) {
        const peakDuration = now - peakStartTimeRef.current;
        isPeakArmRef.current = false;

        // FILTRO DE ANCHO DE PULSO: Si el pico duró menos de 85ms, es un toque en la pantalla o clic de botón -> IGNORAR
        if (peakDuration < MIN_PEAK_DURATION_MS || peakDuration > MAX_PEAK_DURATION_MS) {
          return;
        }

        // Si el intervalo es menor a 300ms, es vibración de alta frecuencia -> Ignorar
        if (interval > 0 && interval < MIN_CADENCE_INTERVAL_MS) {
          candidateStepsRef.current = 0;
          isWalkingCadenceConfirmedRef.current = false;
          return;
        }

        // Si pasó demasiado tiempo (>1500ms), iniciar nueva evaluación de marcha
        if (lastStepTimeRef.current === 0 || interval > MAX_CADENCE_INTERVAL_MS) {
          lastStepTimeRef.current = now;
          lastIntervalRef.current = 0;
          candidateStepsRef.current = 1;
          isWalkingCadenceConfirmedRef.current = false;
          return;
        }

        // Intervalo en rango humano [300ms - 1500ms]
        const intervalDelta = lastIntervalRef.current > 0 ? Math.abs(interval - lastIntervalRef.current) : 0;
        lastIntervalRef.current = interval;
        lastStepTimeRef.current = now;

        // Validar armonía de cadencia periódica
        if (intervalDelta > MAX_INTERVAL_VARIANCE_MS && candidateStepsRef.current > 0) {
          candidateStepsRef.current = 1;
          isWalkingCadenceConfirmedRef.current = false;
          return;
        }

        // Si ya está en marcha confirmada (ritmo establecido continuo)
        if (isWalkingCadenceConfirmedRef.current) {
          setLiveSessionSteps((prev) => {
            const updated = prev + 1;
            try { SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(updated)); } catch {}
            return updated;
          });

          if (onStepDetectedRef.current) {
            onStepDetectedRef.current(1);
          }
        } else {
          // Confirmación estricta de marcha real: 4 pasos rítmicos antes de sumar a la cuenta
          candidateStepsRef.current += 1;

          if (candidateStepsRef.current >= REQUIRED_CADENCE_STEPS) {
            isWalkingCadenceConfirmedRef.current = true;
            const verifiedInitial = candidateStepsRef.current;

            setLiveSessionSteps((prev) => {
              const updated = prev + verifiedInitial;
              try { SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(updated)); } catch {}
              return updated;
            });

            if (onStepDetectedRef.current) {
              onStepDetectedRef.current(verifiedInitial);
            }
          }
        }
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

  // Control de cambio de foco y AppState
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        if (Platform.OS !== 'web') {
          syncNativeHistoricalSteps();
        } else {
          lastStepTimeRef.current = 0;
          isPeakArmRef.current = false;
          candidateStepsRef.current = 0;
          isWalkingCadenceConfirmedRef.current = false;
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
      isPeakArmRef.current = false;
      candidateStepsRef.current = 0;
      isWalkingCadenceConfirmedRef.current = false;

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
