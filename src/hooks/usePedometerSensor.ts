import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { SafeStorage } from '@/utils/safeStorage';
import { getLocalTodayDateString } from '@/utils/dateUtils';
import { logger } from '@/lib/logger';
import {
  getActivityModeFromCadence,
  calculateDistanceKm,
  calculateSpeedKmh,
  calculateStepCalories,
  calculatePaceMinKm,
  ActivityMode,
} from '@/lib/fitnessCalculator';
import {
  createPedometerEngineState,
  processAccelerometerSample,
  PEDOMETER_CONSTANTS,
} from '@/lib/pedometerEngine';

const TRANSIT_MODE_STORAGE_KEY = 'ataraxia_transit_mode_active_v1';
const SENSITIVITY_STORAGE_KEY = 'ataraxia_pedometer_sensitivity_v1';
const PEDOMETER_SESSION_STEPS_KEY = 'ataraxia_pedometer_session_steps_v1';
const STRIDE_LENGTH_STORAGE_KEY = 'ataraxia_stride_length_manual_v1';

export type PedometerSensitivity = 'high' | 'standard' | 'low';
export type { ActivityMode };

const MAX_VEHICLE_SPEED_MS = PEDOMETER_CONSTANTS.MAX_VEHICLE_SPEED_MS;

function loadInitialSensitivity(): PedometerSensitivity {
  try {
    const saved = SafeStorage.getItem(SENSITIVITY_STORAGE_KEY);
    if (saved === 'high' || saved === 'standard' || saved === 'low') return saved;
  } catch {}
  return 'standard';
}

function loadInitialTransitMode(): boolean {
  try {
    return SafeStorage.getItem(TRANSIT_MODE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function loadInitialSessionSteps(dateKey: string, fallback: number): number {
  try {
    const saved = SafeStorage.getItem(dateKey);
    return saved ? Number.parseInt(saved, 10) : fallback;
  } catch {
    return fallback;
  }
}

function extractAccelerationCoords(event: DeviceMotionEvent): { rx: number; ry: number; rz: number } {
  const ag = event.accelerationIncludingGravity;
  if (ag && ag.x !== null && ag.y !== null && ag.z !== null) {
    return { rx: ag.x, ry: ag.y, rz: ag.z };
  }
  const acc = event.acceleration;
  if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
    return { rx: acc.x, ry: acc.y, rz: acc.z };
  }
  return { rx: 0, ry: 0, rz: 0 };
}

function useWebWakeLock() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !(navigator as any).wakeLock) return;

    let wakeLockSentinel: any = null;
    const acquireLock = async () => {
      try {
        if (document.visibilityState === 'visible') {
          wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        }
      } catch {}
    };

    void acquireLock();

    const handleVisChange = () => {
      if (document.visibilityState === 'visible') {
        void acquireLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisChange);
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, []);
}

function useVehicleSpeedGate(
  isPassiveWatcher: boolean,
  isTransitMode: boolean,
  setIsVehicleDetected: (v: boolean) => void
) {
  useEffect(() => {
    if (isPassiveWatcher || !isTransitMode || Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.geolocation) return;

    let geoWatchId: number | null = null;
    try {
      geoWatchId = navigator.geolocation.watchPosition(
        (position) => {
          const speed = position.coords.speed;
          setIsVehicleDetected(typeof speed === 'number' && speed > MAX_VEHICLE_SPEED_MS);
        },
        () => {
          setIsVehicleDetected(false);
        },
        { enableHighAccuracy: false, maximumAge: 5000, timeout: 10000 }
      );
    } catch (e) {
      logger.warn('[usePedometerSensor] Geolocation no disponible:', e);
    }

    return () => {
      if (geoWatchId !== null) {
        navigator.geolocation.clearWatch(geoWatchId);
      }
    };
  }, [isPassiveWatcher, isTransitMode, setIsVehicleDetected]);
}

export function usePedometerSensor(
  onStepDetected?: (stepsAdded: number) => void,
  onSetSteps?: (exactDailySteps: number) => void,
  currentDailySteps: number = 0,
  userHeightCm: number = 170,
  userWeightKg: number = 70,
  isPassiveWatcher: boolean = false,
) {
  const todayStr = getLocalTodayDateString();
  const dateKey = `ataraxia_pedometer_steps_${todayStr}`;

  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [isVehicleDetected, setIsVehicleDetected] = useState<boolean>(false);
  const [sensitivity, setSensitivityState] = useState<PedometerSensitivity>(loadInitialSensitivity);
  const [isTransitMode, setIsTransitMode] = useState<boolean>(loadInitialTransitMode);
  const [liveSessionSteps, setLiveSessionSteps] = useState<number>(() => loadInitialSessionSteps(dateKey, currentDailySteps));

  const [cadenceSpm, setCadenceSpm] = useState<number>(0);
  const [activityMode, setActivityMode] = useState<ActivityMode>('idle');
  const [activeMinutes, setActiveMinutes] = useState<number>(0);

  const cadenceWindowRef = useRef<number[]>([]);
  const lastActiveTs = useRef<number>(0);
  const manualStrideLengthRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    try {
      const saved = SafeStorage.getItem(STRIDE_LENGTH_STORAGE_KEY);
      if (saved) manualStrideLengthRef.current = Number.parseFloat(saved);
    } catch {}
  }, []);

  const distanceKm = calculateDistanceKm(liveSessionSteps, userHeightCm, activityMode, manualStrideLengthRef.current);
  const speedKmh = calculateSpeedKmh(cadenceSpm, userHeightCm, activityMode, manualStrideLengthRef.current);
  const kcalBurned = calculateStepCalories(liveSessionSteps, userWeightKg, userHeightCm, cadenceSpm, activeMinutes);
  const paceMinKm = calculatePaceMinKm(speedKmh);

  const engineStateRef = useRef(createPedometerEngineState());
  const pedometerSubscriptionRef = useRef<any>(null);
  const lastWatcherReportedRef = useRef<number | null>(null);
  const highestAuthoritativeCountRef = useRef<number>(currentDailySteps);
  const lastSyncTimestampRef = useRef<number>(0);

  const sensitivityRef = useRef<PedometerSensitivity>(sensitivity);
  sensitivityRef.current = sensitivity;
  const transitModeRef = useRef<boolean>(isTransitMode);
  transitModeRef.current = isTransitMode;
  const isVehicleDetectedRef = useRef<boolean>(isVehicleDetected);
  isVehicleDetectedRef.current = isVehicleDetected;
  const onStepDetectedRef = useRef(onStepDetected);
  onStepDetectedRef.current = onStepDetected;
  const onSetStepsRef = useRef(onSetSteps);
  onSetStepsRef.current = onSetSteps;

  const pendingStepBatchRef = useRef<number>(0);
  const batchEmitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushPendingSteps = useCallback(() => {
    const toEmit = pendingStepBatchRef.current;
    pendingStepBatchRef.current = 0;
    batchEmitTimerRef.current = null;
    if (toEmit > 0 && onStepDetectedRef.current) {
      onStepDetectedRef.current(toEmit);
    }
  }, []);

  const emitStepsBatched = useCallback((stepsCount: number) => {
    pendingStepBatchRef.current += stepsCount;
    if (!batchEmitTimerRef.current) {
      batchEmitTimerRef.current = setTimeout(flushPendingSteps, 1500);
    } else if (pendingStepBatchRef.current >= 6) {
      clearTimeout(batchEmitTimerRef.current);
      flushPendingSteps();
    }
  }, [flushPendingSteps]);

  useEffect(() => {
    return () => {
      if (batchEmitTimerRef.current) {
        clearTimeout(batchEmitTimerRef.current);
        flushPendingSteps();
      }
    };
  }, [flushPendingSteps]);

  useWebWakeLock();
  useVehicleSpeedGate(isPassiveWatcher, isTransitMode, setIsVehicleDetected);

  useEffect(() => {
    highestAuthoritativeCountRef.current = currentDailySteps;
    setLiveSessionSteps(currentDailySteps);
    try {
      SafeStorage.setItem(`ataraxia_pedometer_steps_${getLocalTodayDateString()}`, String(currentDailySteps));
      SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(currentDailySteps));
    } catch {}
  }, [currentDailySteps]);

  const setSensitivity = useCallback((newSensitivity: PedometerSensitivity) => {
    setSensitivityState(newSensitivity);
    try {
      SafeStorage.setItem(SENSITIVITY_STORAGE_KEY, newSensitivity);
    } catch {}
  }, []);

  const setManualStrideLength = useCallback((strideLengthM: number | undefined) => {
    manualStrideLengthRef.current = strideLengthM;
    try {
      if (strideLengthM !== undefined) {
        SafeStorage.setItem(STRIDE_LENGTH_STORAGE_KEY, String(strideLengthM));
      } else {
        SafeStorage.removeItem?.(STRIDE_LENGTH_STORAGE_KEY);
      }
    } catch {}
  }, []);

  const updateCadenceWindow = useCallback((nowTs: number) => {
    const WINDOW_MS = 30000;
    cadenceWindowRef.current.push(nowTs);
    cadenceWindowRef.current = cadenceWindowRef.current.filter((t) => nowTs - t <= WINDOW_MS);

    const count = cadenceWindowRef.current.length;
    const windowSec = count > 1
      ? (cadenceWindowRef.current[count - 1] - cadenceWindowRef.current[0]) / 1000
      : 0;

    const newCadence = windowSec > 1 ? Math.round((count / windowSec) * 60) : 0;
    setCadenceSpm(newCadence);
    setActivityMode(getActivityModeFromCadence(newCadence));

    if (newCadence < 60) {
      lastActiveTs.current = 0;
      return;
    }

    if (lastActiveTs.current > 0) {
      const elapsed = (nowTs - lastActiveTs.current) / 60000;
      if (elapsed < 2) {
        setActiveMinutes((prev) => Number.parseFloat((prev + elapsed).toFixed(2)));
      }
    }
    lastActiveTs.current = nowTs;
  }, []);

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

      if (!available || Platform.OS !== 'ios') return;

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const result = await Pedometer.getStepCountAsync(startOfDay, new Date());
      if (result && typeof result.steps === 'number' && result.steps >= highestAuthoritativeCountRef.current) {
        highestAuthoritativeCountRef.current = result.steps;
        onSetStepsRef.current?.(result.steps);
      }
    } catch (e) {
      logger.warn('[usePedometerSensor] Error sincronizando podómetro nativo:', e);
    }
  }, []);

  const handleNativeStepResult = useCallback((result: { steps?: number } | null) => {
    if (!result || typeof result.steps !== 'number' || transitModeRef.current || isVehicleDetectedRef.current) return;

    const currentTotal = result.steps;
    if (lastWatcherReportedRef.current === null) {
      lastWatcherReportedRef.current = currentTotal;
      return;
    }

    const delta = Math.max(0, currentTotal - lastWatcherReportedRef.current);
    if (delta <= 0) return;

    lastWatcherReportedRef.current = currentTotal;
    highestAuthoritativeCountRef.current += delta;
    const nowTs = Date.now();

    setLiveSessionSteps((prev) => {
      const updated = prev + delta;
      try { SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(updated)); } catch {}
      return updated;
    });

    for (let i = 0; i < delta; i++) {
      updateCadenceWindow(nowTs + i * 10);
    }
    emitStepsBatched(delta);
  }, [emitStepsBatched, updateCadenceWindow]);

  useEffect(() => {
    if (isPassiveWatcher || Platform.OS === 'web') return;
    void syncNativeHistoricalSteps();

    try {
      lastWatcherReportedRef.current = null;
      pedometerSubscriptionRef.current = Pedometer.watchStepCount(handleNativeStepResult);
    } catch (err) {
      logger.warn('[usePedometerSensor] Error iniciando watcher nativo:', err);
    }

    return () => {
      if (pedometerSubscriptionRef.current) {
        pedometerSubscriptionRef.current.remove();
        pedometerSubscriptionRef.current = null;
      }
    };
  }, [isPassiveWatcher, syncNativeHistoricalSteps, handleNativeStepResult]);

  useEffect(() => {
    if (isPassiveWatcher || Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (transitModeRef.current || isVehicleDetectedRef.current) return;
      const { rx, ry, rz } = extractAccelerationCoords(event);

      const result = processAccelerometerSample(
        engineStateRef.current,
        rx,
        ry,
        rz,
        Date.now(),
        sensitivityRef.current,
        transitModeRef.current || isVehicleDetectedRef.current,
      );

      if (result.stepsAdded > 0) {
        setLiveSessionSteps((prev) => {
          const updated = prev + result.stepsAdded;
          try {
            SafeStorage.setItem(`ataraxia_pedometer_steps_${getLocalTodayDateString()}`, String(updated));
            SafeStorage.setItem(PEDOMETER_SESSION_STEPS_KEY, String(updated));
          } catch {}
          return updated;
        });

        result.stepTimestamps.forEach((ts) => updateCadenceWindow(ts));
        emitStepsBatched(result.stepsAdded);
      }
    };

    window.addEventListener('devicemotion', handleMotion, { passive: true });
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isPassiveWatcher, emitStepsBatched, updateCadenceWindow]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState !== 'active') return;
      if (Platform.OS !== 'web') {
        void syncNativeHistoricalSteps();
      } else {
        engineStateRef.current = createPedometerEngineState();
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => { sub.remove(); };
  }, [syncNativeHistoricalSteps]);

  const forceSyncSteps = useCallback(() => {
    if (Platform.OS !== 'web') {
      void syncNativeHistoricalSteps();
      return;
    }
    engineStateRef.current = createPedometerEngineState();
    if (typeof window !== 'undefined' && typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission().catch(() => {});
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
    sensitivity,
    setSensitivity,
    liveSessionSteps,
    forceSyncSteps,
    toggleTransitMode,
    toggleLiveTracking: toggleTransitMode,
    cadenceSpm,
    activityMode,
    activeMinutes: Math.round(activeMinutes),
    distanceKm,
    speedKmh,
    paceMinKm,
    kcalBurned,
    setManualStrideLength,
    manualStrideLength: manualStrideLengthRef.current,
  };
}
