import { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, onSnapshot, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface DailyLog {
  waterLitres: number;
  trainingCompleted: boolean;
  mealsLogged: number;
  totalCalories: number;
  energyLevel?: number;
  sleepQuality?: number;
  checkInDone?: boolean;
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

  useEffect(() => {
    // 1. Sign in Anonymously
    const initAuth = () => {
      const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
        } else {
          try {
            await signInAnonymously(auth);
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
  }, []);

  useEffect(() => {
    if (!user || isLocalMode) {
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

    if (isLocalMode) {
      // Solo actualizamos el estado local, no intentamos ir a Firebase
      return;
    }

    if (user) {
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

  return {
    log,
    loading,
    addWater,
    toggleTraining,
    addMeal,
    addCalories,
    saveCheckIn,
    addMacros,
  };
}

export function useHistoryLog() {
  const [historyMap, setHistoryMap] = useState<boolean[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!auth.currentUser) {
        setLoadingHistory(false);
        return;
      }

      try {
        // Document IDs are YYYY-MM-DD
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
        
        // Reverse so the oldest is first, newest is last (index 29)
        map.reverse();
        
        // If there are less than 30 days, fill the rest with empty space
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

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchHistory();
      else setLoadingHistory(false);
    });
    return () => unsubscribe();
  }, []);

  return { historyMap, loadingHistory };
}
