import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { SafeStorage } from '@/utils/safeStorage';
import { ProkoptonProfile, CustomExercise } from '@/types/onboarding';

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
  prokoptonProfile?: ProkoptonProfile;
  customRoutine?: CustomExercise[];
  hasCompletedOnboarding?: boolean;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  readinessScore?: {
    sleep: number;
    stress: number;
    soreness: number;
    total: number;
  };
  effectiveSets?: number;
  targetCaloriesMin?: number;
  targetCaloriesMax?: number;
  lastNutrientDensityScore?: number;
  lastNutrientVerdict?: string;
}

export const DEFAULT_USER_METRICS: UserMetrics = {
  weightKg: 75,
  heightCm: 175,
  age: 28,
  gender: 'male',
  activityLevel: 'moderate',
  goal: 'maintenance',
};

export const DEFAULT_LOG: DailyLog = {
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
  targetCaloriesMin: 2100,
  targetCaloriesMax: 2300,
  effectiveSets: 0,
};

const PROFILE_STORAGE_KEY = 'ataraxia_user_profile_v4';
const AVATAR_STORAGE_KEY = 'ataraxia_user_avatar_uri';

type UserProfile = {
  userName: string;
  userMetrics: UserMetrics;
  targetCalories: number;
  stepGoal: number;
  stoicAvatarUri: string;
  smartDevice?: SmartDeviceState;
};

interface DailyLogContextType {
  log: DailyLog;
  loading: boolean;
  user: User | null;
  saveFullProfile: (data: {
    userName: string;
    age: number;
    weightKg: number;
    heightCm: number;
    targetCalories: number;
    stepGoal: number;
    stoicAvatarUri?: string;
  }) => void;
  logMealWithMacros: (cals: number, protein?: number, carbs?: number, fats?: number) => void;
  addWater: (amount?: number) => void;
  toggleTraining: () => void;
  addMeal: () => void;
  addCalories: (amount: number) => void;
  saveCheckIn: (energy: number, sleep: number) => void;
  addMacros: (p: number, c: number, f: number) => void;
  addSteps: (amount: number) => void;
  setSteps: (amount: number) => void;
  setStepGoal: (goal: number) => void;
  updateUserMetrics: (metrics: Partial<UserMetrics>, targetCals?: number) => void;
  setStoicAvatar: (uri: string) => void;
  setUserName: (name: string) => void;
  updateSmartDevice: (deviceUpdates: Partial<SmartDeviceState>) => void;
  saveOnboardingProfile: (profile: ProkoptonProfile, routine: CustomExercise[], targetCals: number) => void;
  resetOnboarding: () => void;
  saveReadinessScore: (sleep: number, stress: number, soreness: number) => void;
  updateEffectiveSets: (count: number) => void;
  logMealWithEnrichedMacros: (cals: number, p: number, c: number, f: number, densityScore?: number, verdict?: string) => void;
  setCustomRoutine: (routine: CustomExercise[]) => void;
}

const DailyLogContext = createContext<DailyLogContextType | null>(null);

function loadLocalDailyLog(targetDate: string): DailyLog {
  let baseLog: DailyLog = { ...DEFAULT_LOG };

  try {
    const savedProfile = SafeStorage.getItem(PROFILE_STORAGE_KEY);
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      baseLog = { ...baseLog, ...profileData };
    }

    const savedAvatar = SafeStorage.getItem(AVATAR_STORAGE_KEY);
    if (savedAvatar) {
      baseLog.stoicAvatarUri = savedAvatar;
    }

    const savedToday = SafeStorage.getItem(`ataraxia_log_${targetDate}`);
    if (savedToday) {
      const todayData = JSON.parse(savedToday);
      const { stoicAvatarUri, ...todayDataClean } = todayData;
      baseLog = {
        ...baseLog,
        ...todayDataClean,
        ...(stoicAvatarUri ? { stoicAvatarUri } : {}),
      };
    }
  } catch (e) {
    console.warn("[DailyLogContext] Error cargando estado:", e);
  }

  return baseLog;
}

function saveLocalDailyLog(targetDate: string, currentLog: DailyLog) {
  try {
    const profileCore = {
      userName: currentLog.userName,
      userMetrics: currentLog.userMetrics,
      targetCalories: currentLog.targetCalories,
      stepGoal: currentLog.stepGoal,
      smartDevice: currentLog.smartDevice,
    };
    SafeStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileCore));

    const { stoicAvatarUri, ...cleanLog } = currentLog;
    SafeStorage.setItem(`ataraxia_log_${targetDate}`, JSON.stringify(cleanLog));

    if (currentLog.stoicAvatarUri) {
      SafeStorage.setItem(AVATAR_STORAGE_KEY, currentLog.stoicAvatarUri);
    }
  } catch (e) {
    console.warn("[DailyLogContext] Error guardando estado:", e);
  }
}

export function DailyLogProvider({ children }: { children: React.ReactNode }) {
  const today = new Date().toISOString().split('T')[0];
  const [user, setUser] = useState<User | null>(null);
  const [log, setLog] = useState<DailyLog>(() => loadLocalDailyLog(today));
  const loading = false;
  const [isLocalMode, setIsLocalMode] = useState(() => !auth);

  const logRef = useRef<DailyLog>(log);
  const prevTodayRef = useRef(today);

  useEffect(() => {
    if (prevTodayRef.current !== today) {
      prevTodayRef.current = today;
      const initial = loadLocalDailyLog(today);
      logRef.current = initial;
      setLog(initial);
    }
  }, [today]);

  useEffect(() => {
    if (!auth) {
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        if (db) {
          try {
            const profileDocRef = doc(db, `users/${currentUser.uid}/meta/profile`);
            const profileSnap = await getDoc(profileDocRef);
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
                smartDevice: cloudProfile.smartDevice
                  ? { ...(current.smartDevice || DEFAULT_LOG.smartDevice!), ...cloudProfile.smartDevice }
                  : current.smartDevice,
              };
              logRef.current = merged;
              setLog(merged);
              saveLocalDailyLog(today, merged);
            }
          } catch (e) {
            console.warn('[DailyLogContext] No se pudo cargar el perfil de Firestore:', e);
          }
        }
      } else {
        try {
          if (auth) await signInAnonymously(auth);
        } catch (error) {
          console.warn('Firebase Auth fallback local:', error);
          setIsLocalMode(true);
        }
      }
    });

    return () => unsubscribeAuth();
  }, [today]);

  const smartMerge = (local: DailyLog, remote: DailyLog): DailyLog => {
    return {
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
      userName: (local.userName && local.userName !== DEFAULT_LOG.userName)
        ? local.userName
        : (remote.userName || DEFAULT_LOG.userName),
      stoicAvatarUri: local.stoicAvatarUri || remote.stoicAvatarUri || '',
      userMetrics: {
        ...DEFAULT_USER_METRICS,
        ...(remote.userMetrics || {}),
        ...(local.userMetrics || {}),
      },
      macros: {
        protein: Math.max(local.macros?.protein || 0, remote.macros?.protein || 0),
        carbs: Math.max(local.macros?.carbs || 0, remote.macros?.carbs || 0),
        fats: Math.max(local.macros?.fats || 0, remote.macros?.fats || 0),
      },
      smartDevice: {
        ...(remote.smartDevice || DEFAULT_LOG.smartDevice!),
        ...(local.smartDevice || {}),
      },
    };
  };

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
          setDoc(docRef, merged, { merge: true }).catch(console.error);
        } else {
          setDoc(docRef, currentLocal, { merge: true }).catch(console.error);
          saveLocalDailyLog(today, currentLocal);
        }
      },
      (error) => {
        console.warn("Firestore listener fallback local:", error);
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

    logRef.current = newLog;
    setLog(newLog);
    saveLocalDailyLog(today, newLog);

    if (user && db && !isLocalMode) {
      const docRef = doc(db, `users/${user.uid}/daily_logs/${today}`);
      try {
        await setDoc(docRef, updates, { merge: true });
      } catch (error) {
        console.warn("Error en setDoc Firestore:", error);
      }
    }
  };

  const saveProfileToFirestore = useCallback(async (profileData: Partial<UserProfile>) => {
    if (!user || !db || isLocalMode) return;
    try {
      const profileDocRef = doc(db, `users/${user.uid}/meta/profile`);
      await setDoc(profileDocRef, profileData, { merge: true });
    } catch (e) {
      console.warn('[DailyLogContext] Error guardando perfil en Firestore:', e);
    }
  }, [user, isLocalMode]);

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
    const newMetrics: UserMetrics = {
      ...currentMetrics,
      age: data.age,
      weightKg: data.weightKg,
      heightCm: data.heightCm,
    };
    updateLog({
      userName: data.userName.trim() || 'Ciudadano Prokopton',
      userMetrics: newMetrics,
      targetCalories: data.targetCalories,
      stepGoal: data.stepGoal,
      ...(data.stoicAvatarUri ? { stoicAvatarUri: data.stoicAvatarUri } : {}),
    });
    saveProfileToFirestore({
      userName: data.userName.trim() || 'Ciudadano Prokopton',
      userMetrics: newMetrics,
      targetCalories: data.targetCalories,
      stepGoal: data.stepGoal,
      ...(data.stoicAvatarUri ? { stoicAvatarUri: data.stoicAvatarUri } : {}),
    });
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
    saveProfileToFirestore({ stoicAvatarUri: uri });
  };

  const setUserName = (name: string) => {
    updateLog({ userName: name });
    saveProfileToFirestore({ userName: name });
  };

  const updateSmartDevice = (deviceUpdates: Partial<SmartDeviceState>) => {
    const currentDevice = logRef.current.smartDevice || DEFAULT_LOG.smartDevice!;
    const newDevice = { ...currentDevice, ...deviceUpdates };
    updateLog({ smartDevice: newDevice });
    saveProfileToFirestore({ smartDevice: newDevice });
  };

  const saveOnboardingProfile = (profile: ProkoptonProfile, routine: CustomExercise[], targetCals: number) => {
    const updatedMetrics: UserMetrics = {
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
      age: profile.age,
      gender: 'male',
      activityLevel: 'moderate',
      goal: profile.dietPreference === 'deficit' ? 'deficit' : profile.dietPreference === 'surplus' ? 'surplus' : 'maintenance',
    };

    updateLog({
      userName: profile.userName,
      userMetrics: updatedMetrics,
      targetCalories: targetCals,
      prokoptonProfile: profile,
      customRoutine: routine,
      hasCompletedOnboarding: true,
    });

    saveProfileToFirestore({
      userName: profile.userName,
      userMetrics: updatedMetrics,
      targetCalories: targetCals,
    });
  };

  const resetOnboarding = () => {
    updateLog({
      hasCompletedOnboarding: false,
      prokoptonProfile: undefined,
      customRoutine: undefined,
    });
  };

  const saveReadinessScore = (sleep: number, stress: number, soreness: number) => {
    // Escala del 1 al 10 calculada ponderando sueño (40%), bajo estrés (30%), baja agobio físico (30%)
    const total = Math.round((sleep * 0.4) + ((10 - stress) * 0.3) + ((10 - soreness) * 0.3));
    updateLog({
      readinessScore: { sleep, stress, soreness, total },
      checkInDone: true
    });
  };

  const updateEffectiveSets = (count: number) => {
    updateLog({ effectiveSets: Math.max(0, count) });
  };

  const logMealWithEnrichedMacros = (cals: number, p: number = 0, c: number = 0, f: number = 0, densityScore?: number, verdict?: string) => {
    const current = logRef.current;
    const currentMacros = current.macros || { protein: 0, carbs: 0, fats: 0 };
    updateLog({
      totalCalories: Math.max(0, (current.totalCalories || 0) + cals),
      mealsLogged: (current.mealsLogged || 0) + 1,
      macros: {
        protein: Math.max(0, currentMacros.protein + p),
        carbs: Math.max(0, currentMacros.carbs + c),
        fats: Math.max(0, currentMacros.fats + f),
      },
      ...(densityScore !== undefined ? { lastNutrientDensityScore: densityScore } : {}),
      ...(verdict ? { lastNutrientVerdict: verdict } : {})
    });
  };

  const setCustomRoutine = (routine: CustomExercise[]) => {
    updateLog({ customRoutine: routine });
  };

  return (
    <DailyLogContext.Provider
      value={{
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
        saveOnboardingProfile,
        resetOnboarding,
        saveReadinessScore,
        updateEffectiveSets,
        logMealWithEnrichedMacros,
        setCustomRoutine,
      }}
    >
      {children}
    </DailyLogContext.Provider>
  );
}

export function useDailyLog() {
  const context = useContext(DailyLogContext);
  if (!context) {
    throw new Error("useDailyLog must be used within a DailyLogProvider");
  }
  return context;
}
