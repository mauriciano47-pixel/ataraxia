import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Platform, AppState } from 'react-native';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { SafeStorage } from '@/utils/safeStorage';
import { getLocalTodayDateString } from '@/utils/dateUtils';
import { logger } from '@/utils/logger';
import {
  ProkoptonProfile,
  CustomExercise,
  CoachArchetype,
  LegendaryPath,
  LEGENDARY_PATHS,
  MonthlyCycleState,
  DailyGrade,
  EquipmentType,
  SessionDurationMinutes,
  ExperienceLevel,
  InjuryCare,
  BodySnapshot,
} from '@/types/onboarding';
import { generate30DayResolution, MonthlyResolution } from '@/lib/monthlyResolutionEngine';
import {
  DailyLog,
  DailyLogContextType,
  UserMetrics,
  SmartDeviceState,
  UserProfile,
  DEFAULT_LOG,
  DEFAULT_USER_METRICS,
  DEFAULT_MONTHLY_CYCLE,
} from '@/types/dailyLog';
import {
  loadLocalBodySnapshots,
  loadLocalDailyLog,
  saveLocalDailyLog,
  consolidateCycleHistory,
  ONBOARDING_KEY,
  BODY_SNAPSHOTS_STORAGE_KEY,
} from '@/lib/dailyLogStorage';
import {
  calculateTodayGrade as evaluateTodayGrade,
  getLegendaryPathRoutine,
} from '@/lib/cycleGrading';
import { buildGuardianKeyPayload } from '@/lib/guardianProfileHelper';
import { executeCycleJudgment } from '@/lib/pactResolutionHelper';

// Re-export types for backward compatibility
export type { UserMetrics, SmartDeviceState, DailyLog, DailyLogContextType, UserProfile };
export { DEFAULT_USER_METRICS, DEFAULT_MONTHLY_CYCLE, DEFAULT_LOG };

const DailyLogContext = createContext<DailyLogContextType | null>(null);

export function DailyLogProvider({ children }: { children: React.ReactNode }) {
  const [currentDateString, setCurrentDateString] = useState<string>(() => getLocalTodayDateString());
  const today = currentDateString;
  const [user, setUser] = useState<User | null>(null);
  const [log, setLog] = useState<DailyLog>(() => {
    const raw = loadLocalDailyLog(today);
    return consolidateCycleHistory(raw);
  });
  const loading = false;
  const [isLocalMode, setIsLocalMode] = useState(() => !auth);
  const [bodySnapshots, setBodySnapshots] = useState<BodySnapshot[]>(() => loadLocalBodySnapshots());

  const logRef = useRef<DailyLog>(log);
  const prevTodayRef = useRef(today);
  const firestoreDebounceTimer = useRef<any>(null);
  const localSaveDebounceTimer = useRef<any>(null);

  // Flush garantizado en cambio de foco o cierre de app
  useEffect(() => {
    const flushSave = () => {
      if (localSaveDebounceTimer.current) {
        clearTimeout(localSaveDebounceTimer.current);
        localSaveDebounceTimer.current = null;
      }
      saveLocalDailyLog(today, logRef.current);
    };

    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') flushSave();
    });

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('beforeunload', flushSave);
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') flushSave();
        });
      }
    }

    return () => {
      flushSave();
      appStateSub.remove();
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', flushSave);
      }
    };
  }, [today]);

  // Monitor continuo de medianoche local (00:00:00 exacto)
  useEffect(() => {
    const midnightInterval = setInterval(() => {
      const liveToday = getLocalTodayDateString();
      if (liveToday !== prevTodayRef.current) {
        logger.info(`[DailyLogContext] 🕛 Medianoche local: ${prevTodayRef.current} -> ${liveToday}.`);
        prevTodayRef.current = liveToday;
        setCurrentDateString(liveToday);
        const consolidated = consolidateCycleHistory(loadLocalDailyLog(liveToday));
        logRef.current = consolidated;
        setLog(consolidated);
      }
    }, 5000);

    return () => clearInterval(midnightInterval);
  }, []);

  useEffect(() => {
    if (!auth) return;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (db) {
          try {
            const profileSnap = await getDoc(doc(db, `users/${currentUser.uid}/meta/profile`));
            if (profileSnap.exists()) {
              const cloudProfile = profileSnap.data() as UserProfile;
              const current = logRef.current;
              const merged: DailyLog = {
                ...current,
                userName: cloudProfile.userName || current.userName,
                userMetrics: { ...DEFAULT_USER_METRICS, ...(cloudProfile.userMetrics || {}) },
                targetCalories: cloudProfile.targetCalories || current.targetCalories,
                stepGoal: cloudProfile.stepGoal || current.stepGoal,
                stoicAvatarUri: cloudProfile.stoicAvatarUri || current.stoicAvatarUri,
                hasCompletedOnboarding: cloudProfile.hasCompletedOnboarding ?? current.hasCompletedOnboarding ?? false,
                prokoptonProfile: cloudProfile.prokoptonProfile || current.prokoptonProfile,
                customRoutine:
                  cloudProfile.customRoutine && cloudProfile.customRoutine.length > 0
                    ? cloudProfile.customRoutine
                    : current.customRoutine,
                coachArchetype: cloudProfile.coachArchetype || current.coachArchetype || 'stoic_mentor',
                smartDevice: cloudProfile.smartDevice
                  ? { ...(current.smartDevice || DEFAULT_LOG.smartDevice!), ...cloudProfile.smartDevice }
                  : current.smartDevice,
              };
              logRef.current = merged;
              setLog(merged);
              saveLocalDailyLog(today, merged);
            }
          } catch (e) {
            logger.warn('[DailyLogContext] No se pudo cargar el perfil de Firestore:', e);
          }
        }
      } else {
        try {
          if (auth) await signInAnonymously(auth);
        } catch (error) {
          logger.warn('Firebase Auth fallback local:', error);
          setIsLocalMode(true);
        }
      }
    });

    return () => unsubscribeAuth();
  }, [today]);

  const smartMerge = (local: DailyLog, remote: DailyLog): DailyLog => ({
    ...DEFAULT_LOG,
    ...remote,
    ...local,
    waterLitres: Math.max(local.waterLitres || 0, remote.waterLitres || 0),
    totalCalories: Math.max(local.totalCalories || 0, remote.totalCalories || 0),
    mealsLogged: Math.max(local.mealsLogged || 0, remote.mealsLogged || 0),
    steps: Math.max(local.steps || 0, remote.steps || 0),
    stepGoal: local.stepGoal || remote.stepGoal || 10000,
    targetCalories: local.targetCalories || remote.targetCalories || 2200,
    trainingCompleted: Boolean(local.trainingCompleted || remote.trainingCompleted),
    checkInDone: Boolean(local.checkInDone || remote.checkInDone),
    effectiveSets: Math.max(local.effectiveSets || 0, remote.effectiveSets || 0),
    userName:
      local.userName && local.userName !== DEFAULT_LOG.userName
        ? local.userName
        : remote.userName || DEFAULT_LOG.userName,
    stoicAvatarUri: local.stoicAvatarUri || remote.stoicAvatarUri || '',
    hasCompletedOnboarding: Boolean(local.hasCompletedOnboarding || remote.hasCompletedOnboarding),
    prokoptonProfile: local.prokoptonProfile || remote.prokoptonProfile,
    customRoutine:
      local.customRoutine && local.customRoutine.length > 0
        ? local.customRoutine
        : remote.customRoutine || undefined,
    coachArchetype: local.coachArchetype || remote.coachArchetype || 'stoic_mentor',
    userMetrics: { ...DEFAULT_USER_METRICS, ...(remote.userMetrics || {}), ...(local.userMetrics || {}) },
    macros: {
      protein: Math.max(local.macros?.protein || 0, remote.macros?.protein || 0),
      carbs: Math.max(local.macros?.carbs || 0, remote.macros?.carbs || 0),
      fats: Math.max(local.macros?.fats || 0, remote.macros?.fats || 0),
    },
    smartDevice: { ...(remote.smartDevice || DEFAULT_LOG.smartDevice!), ...(local.smartDevice || {}) },
  });

  useEffect(() => {
    if (!user || isLocalMode || !db) return;
    const docRef = doc(db, `users/${user.uid}/daily_logs/${today}`);

    const unsubscribeSnapshot = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.metadata?.hasPendingWrites) return;
        const currentLocal = logRef.current;
        if (docSnap.exists()) {
          const remoteData = docSnap.data() as DailyLog;
          const merged = smartMerge(currentLocal, remoteData);
          logRef.current = merged;
          setLog(merged);
          saveLocalDailyLog(today, merged);
        } else {
          setDoc(docRef, currentLocal, { merge: true }).catch(console.error);
          saveLocalDailyLog(today, currentLocal);
        }
      },
      (error) => {
        logger.warn('Firestore listener fallback local:', error);
        setIsLocalMode(true);
      }
    );

    return () => unsubscribeSnapshot();
  }, [user, today, isLocalMode]);

  const updateLog = useCallback((updates: Partial<DailyLog>) => {
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

    logRef.current = newLog;
    setLog(newLog);

    if (localSaveDebounceTimer.current) clearTimeout(localSaveDebounceTimer.current);
    localSaveDebounceTimer.current = setTimeout(() => {
      saveLocalDailyLog(today, logRef.current);
    }, 500);

    if (user && db && !isLocalMode) {
      if (firestoreDebounceTimer.current) clearTimeout(firestoreDebounceTimer.current);
      firestoreDebounceTimer.current = setTimeout(async () => {
        try {
          if (!db) return;
          await setDoc(doc(db, `users/${user.uid}/daily_logs/${today}`), updates, { merge: true });
        } catch (error) {
          logger.warn('Error en setDoc Firestore:', error);
        }
      }, 1000);
    }
  }, [today, user, isLocalMode]);

  const saveProfileToFirestore = useCallback(async (profileData: Partial<UserProfile>) => {
    if (!user || !db || isLocalMode) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/meta/profile`), profileData, { merge: true });
    } catch (e) {
      logger.warn('[DailyLogContext] Error guardando perfil en Firestore:', e);
    }
  }, [user, isLocalMode]);

  const saveFullProfile = useCallback((data: {
    userName: string;
    userEmail?: string;
    age: number;
    weightKg: number;
    heightCm: number;
    targetCalories: number;
    stepGoal: number;
    stoicAvatarUri?: string;
    coachArchetype?: CoachArchetype;
    legendaryPath?: LegendaryPath;
  }) => {
    const currentMetrics = logRef.current.userMetrics || DEFAULT_USER_METRICS;
    const newMetrics: UserMetrics = { ...currentMetrics, age: data.age, weightKg: data.weightKg, heightCm: data.heightCm };
    const updates = {
      userName: data.userName.trim() || 'Ciudadano Prokopton',
      ...(data.userEmail !== undefined ? { userEmail: data.userEmail } : {}),
      userMetrics: newMetrics,
      targetCalories: data.targetCalories,
      stepGoal: data.stepGoal,
      ...(data.stoicAvatarUri ? { stoicAvatarUri: data.stoicAvatarUri } : {}),
      ...(data.coachArchetype ? { coachArchetype: data.coachArchetype } : {}),
      ...(data.legendaryPath ? { legendaryPath: data.legendaryPath } : {}),
    };
    updateLog(updates);
    saveProfileToFirestore(updates);
  }, [updateLog, saveProfileToFirestore]);

  const logMealWithMacros = useCallback((cals: number, protein = 0, carbs = 0, fats = 0) => {
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
  }, [updateLog]);

  const addWater = useCallback((amount = 0.25) => {
    updateLog({ waterLitres: Math.max(0, parseFloat(((logRef.current.waterLitres || 0) + amount).toFixed(2))) });
  }, [updateLog]);

  const toggleTraining = useCallback(() => {
    updateLog({ trainingCompleted: !logRef.current.trainingCompleted });
  }, [updateLog]);

  const addMeal = useCallback(() => {
    updateLog({ mealsLogged: (logRef.current.mealsLogged || 0) + 1 });
  }, [updateLog]);

  const addCalories = useCallback((amount: number) => {
    updateLog({ totalCalories: Math.max(0, (logRef.current.totalCalories || 0) + amount) });
  }, [updateLog]);

  const saveCheckIn = useCallback((energy: number, sleep: number) => {
    updateLog({ energyLevel: energy, sleepQuality: sleep, checkInDone: true });
  }, [updateLog]);

  const addMacros = useCallback((p: number, c: number, f: number) => {
    const currentMacros = logRef.current.macros || { protein: 0, carbs: 0, fats: 0 };
    updateLog({
      macros: {
        protein: Math.max(0, currentMacros.protein + p),
        carbs: Math.max(0, currentMacros.carbs + c),
        fats: Math.max(0, currentMacros.fats + f),
      },
    });
  }, [updateLog]);

  const addSteps = useCallback((amount: number) => {
    updateLog({ steps: Math.max(0, (logRef.current.steps || 0) + amount) });
  }, [updateLog]);

  const setSteps = useCallback((amount: number) => {
    const val = Math.max(0, amount);
    updateLog({ steps: val });
    try {
      SafeStorage.setItem(`ataraxia_pedometer_steps_${today}`, String(val));
      SafeStorage.setItem('ataraxia_pedometer_session_steps_v1', String(val));
      if (Platform.OS === 'web' && typeof window !== 'undefined') window.dispatchEvent(new Event('storage'));
    } catch {}
  }, [updateLog, today]);

  const setStepGoal = useCallback((goal: number) => {
    updateLog({ stepGoal: Math.max(1000, goal) });
  }, [updateLog]);

  const updateUserMetrics = useCallback((metrics: Partial<UserMetrics>, targetCals?: number) => {
    const currentMetrics = logRef.current.userMetrics || DEFAULT_USER_METRICS;
    const newMetrics: UserMetrics = { ...currentMetrics, ...metrics };
    updateLog({ userMetrics: newMetrics, ...(targetCals ? { targetCalories: targetCals } : {}) });
  }, [updateLog]);

  const setStoicAvatar = useCallback((uri: string) => {
    updateLog({ stoicAvatarUri: uri });
    saveProfileToFirestore({ stoicAvatarUri: uri });
  }, [updateLog, saveProfileToFirestore]);

  const setUserName = useCallback((name: string) => {
    updateLog({ userName: name });
    saveProfileToFirestore({ userName: name });
  }, [updateLog, saveProfileToFirestore]);

  const setUserEmail = useCallback((email: string) => {
    updateLog({ userEmail: email });
    saveProfileToFirestore({ userEmail: email });
  }, [updateLog, saveProfileToFirestore]);

  const saveGuardianKey = useCallback((data: {
    email: string;
    userName: string;
    weightKg: number;
    heightCm: number;
    age: number;
    path: LegendaryPath;
    equipment?: EquipmentType;
    sessionDurationMinutes?: SessionDurationMinutes;
    experienceLevel?: ExperienceLevel;
    injuryCare?: InjuryCare;
  }) => {
    const { logUpdates, profileUpdates } = buildGuardianKeyPayload(data);
    updateLog(logUpdates);
    saveProfileToFirestore(profileUpdates);
  }, [updateLog, saveProfileToFirestore]);

  const setCoachArchetype = useCallback((archetype: CoachArchetype) => {
    updateLog({ coachArchetype: archetype });
    saveProfileToFirestore({ coachArchetype: archetype });
  }, [updateLog, saveProfileToFirestore]);

  const updateSmartDevice = useCallback((deviceUpdates: Partial<SmartDeviceState>) => {
    const currentDevice = logRef.current.smartDevice || DEFAULT_LOG.smartDevice!;
    const newDevice = { ...currentDevice, ...deviceUpdates };
    updateLog({ smartDevice: newDevice });
    saveProfileToFirestore({ smartDevice: newDevice });
  }, [updateLog, saveProfileToFirestore]);

  const syncExternalHealthData = useCallback((payload: {
    steps: number;
    deviceName: string;
    lastSync: string;
    heartRateBpm?: number;
    batteryLevel?: number;
    sleepHours?: number;
  }) => {
    const currentDevice = logRef.current.smartDevice || DEFAULT_LOG.smartDevice!;
    const newDevice: SmartDeviceState = {
      ...currentDevice,
      connected: true,
      deviceName: payload.deviceName,
      lastSync: payload.lastSync,
      heartRateBpm: payload.heartRateBpm ?? currentDevice.heartRateBpm ?? 0,
      batteryLevel: payload.batteryLevel ?? 100,
    };

    updateLog({
      steps: Math.max(0, payload.steps),
      smartDevice: newDevice,
      ...(payload.sleepHours ? {
        readinessScore: {
          sleep: payload.sleepHours,
          stress: logRef.current.readinessScore?.stress || 2,
          soreness: logRef.current.readinessScore?.soreness || 2,
          total: Math.round(payload.sleepHours * 0.4 + (10 - 2) * 0.3 + (10 - 2) * 0.3),
        },
      } : {}),
    });

    saveProfileToFirestore({ smartDevice: newDevice });

    try {
      SafeStorage.setItem('ataraxia_pedometer_session_steps_v1', String(payload.steps));
      if (Platform.OS === 'web' && typeof window !== 'undefined') window.dispatchEvent(new Event('storage'));
    } catch {}
  }, [updateLog, saveProfileToFirestore]);

  const saveOnboardingProfile = useCallback((profile: ProkoptonProfile, routine: CustomExercise[], targetCals: number) => {
    const updatedMetrics: UserMetrics = {
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
      age: profile.age,
      gender: 'male',
      activityLevel: profile.daysPerWeek >= 5 ? 'active' : profile.daysPerWeek >= 4 ? 'moderate' : 'light',
      goal: profile.dietPreference === 'deficit' ? 'deficit' : profile.dietPreference === 'surplus' ? 'surplus' : 'maintenance',
    };
    const updates = { userName: profile.userName, userMetrics: updatedMetrics, targetCalories: targetCals, prokoptonProfile: profile, customRoutine: routine, hasCompletedOnboarding: true };
    updateLog(updates);
    saveProfileToFirestore(updates);
  }, [updateLog, saveProfileToFirestore]);

  const resetOnboarding = useCallback(() => {
    SafeStorage.removeItem(ONBOARDING_KEY);
    const updates = { hasCompletedOnboarding: false, prokoptonProfile: undefined, customRoutine: undefined };
    updateLog(updates);
    saveProfileToFirestore(updates);
  }, [updateLog, saveProfileToFirestore]);

  const saveReadinessScore = useCallback((sleep: number, stress: number, soreness: number) => {
    const total = Math.round(sleep * 0.4 + (10 - stress) * 0.3 + (10 - soreness) * 0.3);
    updateLog({ readinessScore: { sleep, stress, soreness, total }, checkInDone: true });
  }, [updateLog]);

  const updateEffectiveSets = useCallback((count: number) => {
    updateLog({ effectiveSets: Math.max(0, count) });
  }, [updateLog]);

  const logMealWithEnrichedMacros = useCallback((cals: number, p = 0, c = 0, f = 0, densityScore?: number, verdict?: string) => {
    const current = logRef.current;
    const currentMacros = current.macros || { protein: 0, carbs: 0, fats: 0 };
    updateLog({
      totalCalories: Math.max(0, (current.totalCalories || 0) + cals),
      mealsLogged: (current.mealsLogged || 0) + 1,
      macros: { protein: Math.max(0, currentMacros.protein + p), carbs: Math.max(0, currentMacros.carbs + c), fats: Math.max(0, currentMacros.fats + f) },
      ...(densityScore !== undefined ? { lastNutrientDensityScore: densityScore } : {}),
      ...(verdict ? { lastNutrientVerdict: verdict } : {}),
    });
  }, [updateLog]);

  const calculateTodayGrade = useCallback((): DailyGrade => evaluateTodayGrade(logRef.current), []);

  const get30DayResolution = useCallback((): MonthlyResolution => {
    const current = logRef.current;
    const cycle = current.monthlyCycle || DEFAULT_MONTHLY_CYCLE;
    return generate30DayResolution({
      dailyGrades: cycle.dailyGrades || [],
      path: current.legendaryPath || 'spartan',
      userName: current.userName || 'Ciudadano Prokopton',
      startDate: cycle.startDate,
      archetype: current.coachArchetype || 'stoic_mentor',
    });
  }, []);

  const start30DayPact = useCallback((path?: LegendaryPath) => {
    const activePath = path || logRef.current.legendaryPath || 'spartan';
    const newCycle: MonthlyCycleState = {
      currentDay: 1,
      startDate: new Date().toISOString(),
      path: activePath,
      tier: 'Novicio de Esparta',
      dailyGrades: [],
      passedDaysCount: 0,
      failedDaysCount: 0,
      averageScore: 100,
      isJudgmentReady: false,
      isPactActive: true,
    };
    const updates = { monthlyCycle: newCycle, legendaryPath: activePath };
    updateLog(updates);
    saveProfileToFirestore(updates);
  }, [updateLog, saveProfileToFirestore]);

  const selectLegendaryPath = useCallback((path: LegendaryPath) => {
    const pathInfo = LEGENDARY_PATHS[path];
    const currentMetrics = logRef.current.userMetrics || DEFAULT_USER_METRICS;
    const bmr = 10 * currentMetrics.weightKg + 6.25 * currentMetrics.heightCm - 5 * currentMetrics.age + 5;
    const targetCals = Math.max(1400, Math.round(bmr * 1.4) + pathInfo.recommendedCalsDelta);
    const routine = getLegendaryPathRoutine(path);
    const newCycle: MonthlyCycleState = {
      currentDay: 1,
      startDate: new Date().toISOString(),
      path,
      tier: 'Novicio de Esparta',
      dailyGrades: [],
      passedDaysCount: 0,
      failedDaysCount: 0,
      averageScore: 100,
      isJudgmentReady: false,
      isPactActive: true,
    };
    const updates = {
      legendaryPath: path,
      coachArchetype: pathInfo.archetype,
      targetCalories: targetCals,
      targetCaloriesMin: targetCals - 100,
      targetCaloriesMax: targetCals + 100,
      customRoutine: routine,
      monthlyCycle: newCycle,
    };
    updateLog(updates);
    saveProfileToFirestore(updates);
  }, [updateLog, saveProfileToFirestore]);

  const executeJudgment = useCallback(() => {
    const { promoted, title, message, resolution, updatedCycle } = executeCycleJudgment(logRef.current);
    updateLog({ monthlyCycle: updatedCycle });
    saveProfileToFirestore({ monthlyCycle: updatedCycle });
    return { promoted, title, message, resolution };
  }, [updateLog, saveProfileToFirestore]);

  const resetMonthlyCycle = useCallback(() => {
    const newCycle: MonthlyCycleState = {
      currentDay: 1,
      startDate: new Date().toISOString(),
      path: logRef.current.legendaryPath || 'spartan',
      tier: 'Novicio de Esparta',
      dailyGrades: [],
      passedDaysCount: 0,
      failedDaysCount: 0,
      averageScore: 100,
      isJudgmentReady: false,
      isPactActive: true,
    };
    updateLog({ monthlyCycle: newCycle });
    saveProfileToFirestore({ monthlyCycle: newCycle });
  }, [updateLog, saveProfileToFirestore]);

  const setCustomRoutine = useCallback((routine: CustomExercise[]) => {
    updateLog({ customRoutine: routine });
    saveProfileToFirestore({ customRoutine: routine });
  }, [updateLog, saveProfileToFirestore]);

  const addBodySnapshot = useCallback(async (snapshotData: Omit<BodySnapshot, 'id' | 'createdAt'>): Promise<BodySnapshot> => {
    const newSnapshot: BodySnapshot = {
      ...snapshotData,
      id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };

    setBodySnapshots((prev) => {
      const updated = [newSnapshot, ...prev];
      try {
        SafeStorage.setItem(BODY_SNAPSHOTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        logger.warn('[DailyLogContext] Error guardando foto local:', e);
      }
      return updated;
    });

    if (db && user) {
      try {
        await setDoc(doc(db, `users/${user.uid}/bodySnapshots/${newSnapshot.id}`), newSnapshot, { merge: true });
      } catch (e) {
        logger.warn('[DailyLogContext] Error sincronizando foto en Firestore:', e);
      }
    }

    return newSnapshot;
  }, [user]);

  const deleteBodySnapshot = useCallback(async (id: string): Promise<void> => {
    setBodySnapshots((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      try {
        SafeStorage.setItem(BODY_SNAPSHOTS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (db && user) {
      try {
        await setDoc(doc(db, `users/${user.uid}/bodySnapshots/${id}`), { deleted: true, deletedAt: Date.now() }, { merge: true });
      } catch {}
    }
  }, [user]);

  const contextValue = useMemo(
    () => ({
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
      setUserEmail,
      saveGuardianKey,
      setCoachArchetype,
      selectLegendaryPath,
      calculateTodayGrade,
      executeJudgment,
      get30DayResolution,
      resetMonthlyCycle,
      start30DayPact,
      updateSmartDevice,
      saveOnboardingProfile,
      resetOnboarding,
      saveReadinessScore,
      updateEffectiveSets,
      logMealWithEnrichedMacros,
      setCustomRoutine,
      syncExternalHealthData,
      bodySnapshots,
      addBodySnapshot,
      deleteBodySnapshot,
    }),
    [
      log, loading, user, saveFullProfile, logMealWithMacros, addWater, toggleTraining,
      addMeal, addCalories, saveCheckIn, addMacros, addSteps, setSteps, setStepGoal,
      updateUserMetrics, setStoicAvatar, setUserName, setUserEmail, saveGuardianKey,
      setCoachArchetype, selectLegendaryPath, calculateTodayGrade, executeJudgment,
      get30DayResolution, resetMonthlyCycle, start30DayPact, updateSmartDevice,
      saveOnboardingProfile, resetOnboarding, saveReadinessScore, updateEffectiveSets,
      logMealWithEnrichedMacros, setCustomRoutine, syncExternalHealthData, bodySnapshots,
      addBodySnapshot, deleteBodySnapshot,
    ]
  );

  return <DailyLogContext.Provider value={contextValue}>{children}</DailyLogContext.Provider>;
}

export function useDailyLog() {
  const context = useContext(DailyLogContext);
  if (!context) throw new Error('useDailyLog must be used within a DailyLogProvider');
  return context;
}
