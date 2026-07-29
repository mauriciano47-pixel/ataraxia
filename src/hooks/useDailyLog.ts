import { useState, useEffect } from 'react';
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
  deviceName: string; // e.g. "Apple Watch Series 9", "Garmin Fenix 7", "Fitbit Charge 6", "Galaxy Watch 6"
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
  userMetrics: {
    weightKg: 75,
    heightCm: 175,
    age: 28,
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintenance',
  },
  checkInDone: false,
  macros: { protein: 0, carbs: 0, fats: 0 }
};

export function useDailyLog() {
  const [user, setUser] = useState<User | null>(null);
  const [log, setLog] = useState<DailyLog>(DEFAULT_LOG);
  const [loading, setLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(false);

  // Formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // Safety fallback timer: nunca permitir que la pantalla se quede colgada cargando por más de 1.5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Intentar recuperar de localStorage si está en web
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(`ataraxia_log_${today}`);
        if (saved) {
          setLog((prev) => ({ ...prev, ...JSON.parse(saved) }));
        }
      }
    } catch (e) {
      console.warn("LocalStorage no disponible:", e);
    }

    // 1. Sign in Anonymously
    const initAuth = () => {
      if (!auth) {
        setIsLocalMode(true);
        setLoading(false);
        return () => {};
      }
      const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
        } else {
          try {
            if (auth) await signInAnonymously(auth);
          } catch (error) {
            console.warn("⚠️ Firebase Auth falló. Activando modo local (sin nube) para que puedas probar la app.", error);
            setIsLocalMode(true);
            setLoading(false);
          }
        }
      });
      return unsubscribeAuth;
    };

    const unsubscribeAuth = initAuth();
    return () => unsubscribeAuth();
  }, [today]);

  useEffect(() => {
    if (!user || isLocalMode || !db) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    const docRef = doc(db, `users/${user.uid}/daily_logs/${today}`);

    // Listen to changes
    const unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setLog(docSnap.data() as DailyLog);
      } else {
        // Document doesn't exist, create it
        setDoc(docRef, DEFAULT_LOG).catch(console.error);
        setLog(DEFAULT_LOG);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setIsLocalMode(true);
      setLoading(false);
    });

    return () => unsubscribeSnapshot();
  }, [user, today, isLocalMode]);

  const updateLog = async (updates: Partial<DailyLog>) => {
    const newLog = { ...log, ...updates };
    setLog(newLog);

    // Guardar copia local en web
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(`ataraxia_log_${today}`, JSON.stringify(newLog));
      }
    } catch (e) {
      // Ignore storage error
    }

    if (isLocalMode || !db) {
      return;
    }

    if (user && db) {
      const docRef = doc(db, `users/${user.uid}/daily_logs/${today}`);
      try {
        await setDoc(docRef, updates, { merge: true });
      } catch (error) {
        console.error("Update Error:", error);
      }
    }
  };

  const addWater = (amount: number = 0.25) => {
    updateLog({ waterLitres: log.waterLitres + amount });
  };

  const toggleTraining = () => {
    updateLog({ trainingCompleted: !log.trainingCompleted });
  };

  const addMeal = () => {
    updateLog({ mealsLogged: log.mealsLogged + 1 });
  };

  const addCalories = (amount: number) => {
    updateLog({ totalCalories: (log.totalCalories || 0) + amount });
  };

  const saveCheckIn = (energy: number, sleep: number) => {
    updateLog({ energyLevel: energy, sleepQuality: sleep, checkInDone: true });
  };

  const addMacros = (p: number, c: number, f: number) => {
    updateLog({ 
      macros: {
        protein: log.macros.protein + p,
        carbs: log.macros.carbs + c,
        fats: log.macros.fats + f
      } 
    });
  };

  const addSteps = (amount: number) => {
    updateLog({ steps: Math.max(0, (log.steps || 0) + amount) });
  };

  const setSteps = (amount: number) => {
    updateLog({ steps: Math.max(0, amount) });
  };

  const setStepGoal = (goal: number) => {
    updateLog({ stepGoal: Math.max(1000, goal) });
  };

  const updateUserMetrics = (metrics: Partial<UserMetrics>, targetCals?: number) => {
    const newMetrics = { ...DEFAULT_LOG.userMetrics, ...(log.userMetrics || {}), ...metrics } as UserMetrics;
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
    const currentDevice = log.smartDevice || DEFAULT_LOG.smartDevice!;
    updateLog({
      smartDevice: {
        ...currentDevice,
        ...deviceUpdates,
      }
    });
  };

  return {
    log,
    loading,
    user,
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

/**
 * Hook que retorna el historial de los últimos N días de daily_logs.
 * Usado por el coach para construir contexto histórico.
 */
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
