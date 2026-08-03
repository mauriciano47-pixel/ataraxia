import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { DailyLog } from '@/context/DailyLogContext';

export { useDailyLog, DailyLogProvider, DailyLog, UserMetrics, SmartDeviceState, DEFAULT_LOG, DEFAULT_USER_METRICS } from '@/context/DailyLogContext';

export function useWeekHistory(days: number = 7) {
  const [weekLogs, setWeekLogs] = useState<(DailyLog & { date: string })[]>([]);
  const [loadingWeek, setLoadingWeek] = useState(Boolean(auth && db));

  useEffect(() => {
    if (!auth || !db) {
      return;
    }

    const currentAuth = auth;
    const currentDb = db;

    const fetchWeek = async (user: User) => {
      try {
        const q = query(
          collection(currentDb, `users/${user.uid}/daily_logs`),
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

    const unsubscribe = onAuthStateChanged(currentAuth, (user) => {
      if (user) fetchWeek(user);
      else setLoadingWeek(false);
    });
    return () => unsubscribe();
  }, [days]);

  return { weekLogs, loadingWeek };
}

export function useHistoryLog() {
  const [historyMap, setHistoryMap] = useState<boolean[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(Boolean(auth && db));

  useEffect(() => {
    if (!auth || !db) {
      return;
    }

    const currentAuth = auth;
    const currentDb = db;

    const fetchHistory = async (user: User) => {
      try {
        const q = query(
          collection(currentDb, `users/${user.uid}/daily_logs`),
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

    const unsubscribe = onAuthStateChanged(currentAuth, (user) => {
      if (user) fetchHistory(user);
      else setLoadingHistory(false);
    });
    return () => unsubscribe();
  }, []);

  return { historyMap, loadingHistory };
}
