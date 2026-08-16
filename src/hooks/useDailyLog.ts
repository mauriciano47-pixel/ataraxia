import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { DailyLog } from '@/context/DailyLogContext';
import { SafeStorage } from '@/utils/safeStorage';

export { useDailyLog, DailyLogProvider, DailyLog, UserMetrics, SmartDeviceState, DEFAULT_LOG, DEFAULT_USER_METRICS } from '@/context/DailyLogContext';

const HISTORY_MAP_STORAGE_KEY = 'ataraxia_history_map_30';
const WEEK_LOGS_STORAGE_KEY = 'ataraxia_week_logs_cache';

export function useWeekHistory(days: number = 7) {
  const [weekLogs, setWeekLogs] = useState<(DailyLog & { date: string })[]>(() => {
    try {
      const cached = SafeStorage.getItem(WEEK_LOGS_STORAGE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });
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
        SafeStorage.setItem(WEEK_LOGS_STORAGE_KEY, JSON.stringify(logs));
      } catch (error) {
        console.warn("Error obteniendo historial semanal de Firestore, usando caché local:", error);
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
  const [historyMap, setHistoryMap] = useState<boolean[]>(() => {
    try {
      const cached = SafeStorage.getItem(HISTORY_MAP_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length === 30) return parsed;
      }
    } catch {}
    return Array(30).fill(false);
  });
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
          const success = Boolean(data.checkInDone || data.trainingCompleted);
          map.push(success);
        });

        map.reverse();

        while (map.length < 30) {
          map.unshift(false);
        }

        setHistoryMap(map);
        SafeStorage.setItem(HISTORY_MAP_STORAGE_KEY, JSON.stringify(map));
      } catch (error) {
        console.warn("Error fetching history from Firestore, keeping local history:", error);
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
