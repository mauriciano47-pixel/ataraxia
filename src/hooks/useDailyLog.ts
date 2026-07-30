import { useState, useEffect, useRef } from 'react';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, onSnapshot, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserMetrics {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
  goal: 'deficit' | 'maintenance' | 'surplus';
}

export interface SmartDeviceState {
  connected: boolean;
  deviceName: string;
  heartRateBpm: number;
  lastSync: string;
  batteryLevel?: number;
}

export interface DailyLog {
  waterLitres: number;
  trainingCompleted: boolean;
  mealsLogged: number;
  totalCalories: number;
  targetCalories?: number;
  steps?: number;
  stepGoal?: number;
  userMetrics?: UserMetrics;
  energyLevel?: number;
  sleepQuality?: number;
  checkInDone?: boolean;
  stoicAvatarUri?: string;
  userName?: string;
  smartDevice?: SmartDeviceState;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

const DEFAULT_USER_METRICS: UserMetrics = {
  weightKg: 75,
  heightCm: 175,
  age: 28,
  gender: 'male',
  activityLevel: 'moderate',
  goal: 'maintenance',
};

const DEFAULT_LOG: DailyLog = {
  waterLitres: 0,
  trainingCompleted: false,
  mealsLogged: 0,
  totalCalories: 0,
  targetCalories: 2200,
  steps: 0,
  stepGoal: 10000,
  stoicAvatarUri: '',
  userName: 'Ciudadano Prokopton',
  smartDevice: {
    connected: false,
    deviceName: 'Ninguno (Desconectado)',
    heartRateBpm: 72,
    lastSync: 'Nunca',
    batteryLevel: 90,
  },
  userMetrics: DEFAULT_USER_METRICS,
  checkInDone: false,
  macros: { protein: 0, carbs: 0, fats: 0 },
};

const PROFILE_STORAGE_KEY = 'ataraxia_user_profile_v2';

export function useDailyLog() {
  const [user, setUser] = useState<User | null>(null);
  const [log, setLog] = useState<DailyLog>(DEFAULT_LOG);
  const [loading, setLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const logRef = useRef<DailyLog>(DEFAULT_LOG);

  // Helper local storage reader
  const loadLocalState = (): DailyLog => {
    let baseLog: DailyLog = { ...DEFAULT_LOG };

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // 1. Load global profile
        const savedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
        if (savedProfile) {
          const profileData = JSON.parse(savedProfile);
          baseLog = { ...baseLog, ...profileData };
        }

        // 2. Load today's log
        const savedToday = window.localStorage.getItem(`ataraxia_log_${today}`);
        if (savedToday) {
          const todayData = JSON.parse(savedToday);
          baseLog = { ...baseLog, ...todayData };
        }
      }
    } catch (e) {
      console.warn("Error leyendo localStorage:", e);
    }

    return baseLog;
  };

  // Helper local storage saver
  const saveLocalState = (currentLog: DailyLog) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Save profile
        const profileData = {
          userName: currentLog.userName,
          stoicAvatarUri: currentLog.stoicAvatarUri,
          userMetrics: currentLog.userMetrics,
          targetCalories: currentLog.targetCalories,
          stepGoal: currentLog.stepGoal,
          smartDevice: currentLog.smartDevice,
        };
        window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));

        // Save today's log
        window.localStorage.setItem(`ataraxia_log_${today}`, JSON.stringify(currentLog));
      }
    } catch (e) {
      console.warn("Error guardando en localStorage:", e);
    }
  };

  // Initial local load on mount
  useEffect(() => {
    const initialLocal = loadLocalState();
    logRef.current = initialLocal;
    setLog(initialLocal);
    setLoading(false);
  }, [today]);

  // Auth & Cloud Sync
  useEffect(() => {
    if (!auth) {
      setIsLocalMode(true);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        try {
          if (auth) await signInAnonymously(auth);
        } catch (error) {
          console.warn("Firebase Auth fallback a modo local:", error);
          setIsLocalMode(true);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Firestore sync listener
  useEffect(() => {
    if (!user || isLocalMode || !db) return;

    const docRef = doc(db, `users/${user.uid}/daily_logs/${today}`);

    const unsubscribeSnapshot = onSnapshot(
      docRef,
      (docSnap) => {
        // Prevent stale snapshot echo if local writes are currently in flight
        if (docSnap.metadata?.hasPendingWrites) return;

        const currentLocal = logRef.current;
        if (docSnap.exists()) {
          const remoteData = docSnap.data() as DailyLog;
          // Deep merge remote data with local data to prevent wiping unsaved local fields
          const mergedLog: DailyLog = {
            ...currentLocal,
            ...remoteData,
            userMetrics: { ...(currentLocal.userMetrics || DEFAULT_USER_METRICS), ...(remoteData.userMetrics || {}) },
            macros: { ...(currentLocal.macros || { protein: 0, carbs: 0, fats: 0 }), ...(remoteData.macros || {}) },
            smartDevice: { ...(currentLocal.smartDevice || DEFAULT_LOG.smartDevice!), ...(remoteData.smartDevice || {}) },
          };
          logRef.current = mergedLog;
          setLog(mergedLog);
          saveLocalState(mergedLog);
        } else {
          // Document does NOT exist in Firestore yet: upload our current local state!
          setDoc(docRef, currentLocal, { merge: true }).catch(console.error);
          saveLocalState(currentLocal);
        }
      },
      (error) => {
        console.warn("Firestore listener fallback a modo local:", error);
        setIsLocalMode(true);
      }
    );

    return () => unsubscribeSnapshot();
  }, [user, today, isLocalMode]);

  const updateLog = async (updates: Partial<DailyLog>) => {
    const current = logRef.current;
    const newLog: DailyLog = {
      ...current,
      ...updates,
      userMetrics: updates.userMetrics
        ? { ...(current.userMetrics || DEFAULT_USER_METRICS), ...updates.userMetrics }
        : current.userMetrics,
      macros: updates.macros
        ? { ...(current.macros || { protein: 0, carbs: 0, fats: 0 }), ...updates.macros }
        : current.macros,
      smartDevice: updates.smartDevice
        ? { ...(current.smartDevice || DEFAULT_LOG.smartDevice!), ...updates.smartDevice }
        : current.smartDevice,
    };

    // 1. Immediately update ref synchronously to ensure consecutive calls in the same event tick stack correctly!
    logRef.current = newLog;

    // 2. Functional React state update
    setLog(newLog);

    // 3. Persist locally immediately
    saveLocalState(newLog);

    // 4. Persist to Firestore in background if online
    if (user && db && !isLocalMode) {
      const docRef = doc(db, `users/${user.uid}/daily_logs/${today}`);
      try {
        await setDoc(docRef, updates, { merge: true });
      } catch (error) {
        console.warn("Error en setDoc Firestore:", error);
      }
    }
  };

  const logMealWithMacros = (cals: number, protein: number = 0, carbs: number = 0, fats: number = 0) => {
    const current = logRef.current;
    const currentMacros = current.macros || { protein: 0, carbs: 0, fats: 0 };
    updateLog({
      totalCalories: Math.max(0, (current.totalCalories || 0) + cals),
      mealsLogged: (current.mealsLogged || 0) + 1,
      macros: {
        protein: Math.max(0, currentMacros.protein + protein),
        carbs: Math.max(0, currentMacros.carbs + carbs),
        fats: Math.max(0, currentMacros.fats + fats),
      },
    });
  };

  const saveFullProfile = (data: {
    userName: string;
    age: number;
    weightKg: number;
    heightCm: number;
    targetCalories: number;
    stepGoal: number;
    stoicAvatarUri?: string;
  }) => {
    const currentMetrics = logRef.current.userMetrics || DEFAULT_USER_METRICS;
    updateLog({
      userName: data.userName.trim() || 'Ciudadano Prokopton',
      userMetrics: {
        ...currentMetrics,
        age: data.age,
        weightKg: data.weightKg,
        heightCm: data.heightCm,
      },
      targetCalories: data.targetCalories,
      stepGoal: data.stepGoal,
      ...(data.stoicAvatarUri ? { stoicAvatarUri: data.stoicAvatarUri } : {}),
    });
  };

  const addWater = (amount: number = 0.25) => {
    const newLitres = Math.max(0, parseFloat(((logRef.current.waterLitres || 0) + amount).toFixed(2)));
    updateLog({ waterLitres: newLitres });
  };

  const toggleTraining = () => {
    updateLog({ trainingCompleted: !logRef.current.trainingCompleted });
  };

  const addMeal = () => {
    updateLog({ mealsLogged: (logRef.current.mealsLogged || 0) + 1 });
  };

  const addCalories = (amount: number) => {
    updateLog({ totalCalories: Math.max(0, (logRef.current.totalCalories || 0) + amount) });
  };

  const saveCheckIn = (energy: number, sleep: number) => {
    updateLog({ energyLevel: energy, sleepQuality: sleep, checkInDone: true });
  };

  const addMacros = (p: number, c: number, f: number) => {
    const currentMacros = logRef.current.macros || { protein: 0, carbs: 0, fats: 0 };
    updateLog({
      macros: {
        protein: Math.max(0, currentMacros.protein + p),
        carbs: Math.max(0, currentMacros.carbs + c),
        fats: Math.max(0, currentMacros.fats + f),
      },
    });
  };

  const addSteps = (amount: number) => {
    updateLog({ steps: Math.max(0, (logRef.current.steps || 0) + amount) });
  };

  const setSteps = (amount: number) => {
    updateLog({ steps: Math.max(0, amount) });
  };

  const setStepGoal = (goal: number) => {
    updateLog({ stepGoal: Math.max(1000, goal) });
  };

  const updateUserMetrics = (metrics: Partial<UserMetrics>, targetCals?: number) => {
    const currentMetrics = logRef.current.userMetrics || DEFAULT_USER_METRICS;
    const newMetrics: UserMetrics = { ...currentMetrics, ...metrics };
    const updates: Partial<DailyLog> = { userMetrics: newMetrics };
    if (targetCals) {
      updates.targetCalories = targetCals;
    }
    updateLog(updates);
  };

  const setStoicAvatar = (uri: string) => {
    updateLog({ stoicAvatarUri: uri });
  };

  const setUserName = (name: string) => {
    updateLog({ userName: name });
  };

  const updateSmartDevice = (deviceUpdates: Partial<SmartDeviceState>) => {
    const currentDevice = logRef.current.smartDevice || DEFAULT_LOG.smartDevice!;
    updateLog({
      smartDevice: {
        ...currentDevice,
        ...deviceUpdates,
      },
    });
  };

  return {
    log,
    loading,
    user,
    saveFullProfile,
    logMealWithMacros,
    addWater,
    toggleTraining,
    addMeal,
    addCalories,
    saveCheckIn,
    addMacros,
    addSteps,
    setSteps,
    setStepGoal,
    updateUserMetrics,
    setStoicAvatar,
    setUserName,
    updateSmartDevice,
  };
}

export function useWeekHistory(days: number = 7) {
  const [weekLogs, setWeekLogs] = useState<(DailyLog & { date: string })[]>([]);
  const [loadingWeek, setLoadingWeek] = useState(true);

  useEffect(() => {
    const fetchWeek = async () => {
      if (!auth || !db || !auth.currentUser) {
        setLoadingWeek(false);
        return;
      }

      try {
        const q = query(
          collection(db, `users/${auth.currentUser.uid}/daily_logs`),
          orderBy('__name__', 'desc'),
          limit(days)
        );
        const snapshot = await getDocs(q);
        const logs: (DailyLog & { date: string })[] = [];
        snapshot.forEach((docSnap) => {
          logs.push({ ...(docSnap.data() as DailyLog), date: docSnap.id });
        });
        logs.reverse();
        setWeekLogs(logs);
      } catch (error) {
        console.error("Error obteniendo historial semanal:", error);
      } finally {
        setLoadingWeek(false);
      }
    };

    if (!auth) {
      setLoadingWeek(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchWeek();
      else setLoadingWeek(false);
    });
    return () => unsubscribe();
  }, [days]);

  return { weekLogs, loadingWeek };
}

export function useHistoryLog() {
  const [historyMap, setHistoryMap] = useState<boolean[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!auth || !db || !auth.currentUser) {
        setLoadingHistory(false);
        return;
      }

      try {
        const q = query(
          collection(db, `users/${auth.currentUser.uid}/daily_logs`),
          orderBy('__name__', 'desc'),
          limit(30)
        );
        const snapshot = await getDocs(q);
        const map: boolean[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as DailyLog;
          const success = data.checkInDone || data.trainingCompleted || false;
          map.push(success);
        });

        map.reverse();

        while (map.length < 30) {
          map.unshift(false);
        }

        setHistoryMap(map);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (!auth) {
      setLoadingHistory(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchHistory();
      else setLoadingHistory(false);
    });
    return () => unsubscribe();
  }, []);

  return { historyMap, loadingHistory };
}
