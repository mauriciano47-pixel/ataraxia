import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { SafeStorage } from '@/utils/safeStorage';
import { getLocalTodayDateString } from '@/utils/dateUtils';
import {
  ProkoptonProfile,
  CustomExercise,
  CoachArchetype,
  LegendaryPath,
  LEGENDARY_PATHS,
  MonthlyCycleState,
  DailyGrade,
  DailyGradeStatus,
  CycleTier,
} from '@/types/onboarding';

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
  userEmail?: string;
  smartDevice?: SmartDeviceState;
  prokoptonProfile?: ProkoptonProfile;
  customRoutine?: CustomExercise[];
  hasCompletedOnboarding?: boolean;
  coachArchetype?: CoachArchetype;
  legendaryPath?: LegendaryPath;
  monthlyCycle?: MonthlyCycleState;
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

export const DEFAULT_MONTHLY_CYCLE: MonthlyCycleState = {
  currentDay: 1,
  startDate: new Date().toISOString(),
  path: 'spartan',
  tier: 'Novicio de Esparta',
  dailyGrades: [],
  passedDaysCount: 0,
  failedDaysCount: 0,
  averageScore: 100,
  isJudgmentReady: false,
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
  userEmail: '',
  hasCompletedOnboarding: false,
  coachArchetype: 'stoic_mentor',
  legendaryPath: 'spartan',
  monthlyCycle: DEFAULT_MONTHLY_CYCLE,
  smartDevice: {
    connected: false,
    deviceName: 'Ninguno (Desconectado)',
    heartRateBpm: 0,
    lastSync: 'Nunca',
    batteryLevel: 0,
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
const ONBOARDING_KEY = 'ataraxia_onboarding_completed_v1';
const MONTHLY_CYCLE_KEY = 'ataraxia_monthly_cycle_v1';

type UserProfile = {
  userName: string;
  userEmail?: string;
  userMetrics: UserMetrics;
  targetCalories: number;
  stepGoal: number;
  stoicAvatarUri: string;
  smartDevice?: SmartDeviceState;
  hasCompletedOnboarding?: boolean;
  prokoptonProfile?: ProkoptonProfile;
  customRoutine?: CustomExercise[];
  coachArchetype?: CoachArchetype;
  legendaryPath?: LegendaryPath;
  monthlyCycle?: MonthlyCycleState;
};

interface DailyLogContextType {
  log: DailyLog;
  loading: boolean;
  user: User | null;
  saveFullProfile: (data: {
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
  setUserEmail: (email: string) => void;
  saveGuardianKey: (data: {
    email: string;
    userName: string;
    weightKg: number;
    heightCm: number;
    age: number;
    path: LegendaryPath;
  }) => void;
  setCoachArchetype: (archetype: CoachArchetype) => void;
  selectLegendaryPath: (path: LegendaryPath) => void;
  calculateTodayGrade: () => DailyGrade;
  executeJudgment: () => { promoted: boolean; title: string; message: string };
  resetMonthlyCycle: () => void;
  updateSmartDevice: (deviceUpdates: Partial<SmartDeviceState>) => void;
  saveOnboardingProfile: (profile: ProkoptonProfile, routine: CustomExercise[], targetCals: number) => void;
  resetOnboarding: () => void;
  saveReadinessScore: (sleep: number, stress: number, soreness: number) => void;
  updateEffectiveSets: (count: number) => void;
  logMealWithEnrichedMacros: (cals: number, p: number, c: number, f: number, densityScore?: number, verdict?: string) => void;
  setCustomRoutine: (routine: CustomExercise[]) => void;
  syncExternalHealthData: (payload: {
    steps: number;
    deviceName: string;
    lastSync: string;
    heartRateBpm?: number;
    batteryLevel?: number;
    sleepHours?: number;
  }) => void;
}

const DailyLogContext = createContext<DailyLogContextType | null>(null);

function loadLocalDailyLog(targetDate: string): DailyLog {
  let baseLog: DailyLog = { ...DEFAULT_LOG };

  try {
    const savedProfile = SafeStorage.getItem(PROFILE_STORAGE_KEY);
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      baseLog = {
        ...baseLog,
        ...profileData,
        userMetrics: {
          ...DEFAULT_USER_METRICS,
          ...(profileData.userMetrics || {}),
        },
      };
    }

    const isCompleted = SafeStorage.getItem(ONBOARDING_KEY) === 'true';
    if (isCompleted || baseLog.hasCompletedOnboarding) {
      baseLog.hasCompletedOnboarding = true;
    }

    const savedAvatar = SafeStorage.getItem(AVATAR_STORAGE_KEY);
    if (savedAvatar) {
      baseLog.stoicAvatarUri = savedAvatar;
    }

    const savedToday = SafeStorage.getItem(`ataraxia_log_${targetDate}`);
    if (savedToday) {
      const todayData = JSON.parse(savedToday);
      const {
        waterLitres,
        trainingCompleted,
        mealsLogged,
        totalCalories,
        steps,
        energyLevel,
        sleepQuality,
        checkInDone,
        macros,
        readinessScore,
        effectiveSets,
        lastNutrientDensityScore,
        lastNutrientVerdict,
      } = todayData;

      baseLog = {
        ...baseLog,
        ...(waterLitres !== undefined ? { waterLitres } : {}),
        ...(trainingCompleted !== undefined ? { trainingCompleted } : {}),
        ...(mealsLogged !== undefined ? { mealsLogged } : {}),
        ...(totalCalories !== undefined ? { totalCalories } : {}),
        ...(steps !== undefined ? { steps } : {}),
        ...(energyLevel !== undefined ? { energyLevel } : {}),
        ...(sleepQuality !== undefined ? { sleepQuality } : {}),
        ...(checkInDone !== undefined ? { checkInDone } : {}),
        ...(macros !== undefined ? { macros } : {}),
        ...(readinessScore !== undefined ? { readinessScore } : {}),
        ...(effectiveSets !== undefined ? { effectiveSets } : {}),
        ...(lastNutrientDensityScore !== undefined ? { lastNutrientDensityScore } : {}),
        ...(lastNutrientVerdict !== undefined ? { lastNutrientVerdict } : {}),
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
      hasCompletedOnboarding: currentLog.hasCompletedOnboarding,
      prokoptonProfile: currentLog.prokoptonProfile,
      customRoutine: currentLog.customRoutine,
      coachArchetype: currentLog.coachArchetype || 'stoic_mentor',
      legendaryPath: currentLog.legendaryPath,
      monthlyCycle: currentLog.monthlyCycle,
    };
    SafeStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileCore));

    if (currentLog.legendaryPath) {
      SafeStorage.setItem('ataraxia_path_chosen_v1', 'true');
      SafeStorage.setItem('ataraxia_pact_accepted_v1', 'true');
    }

    if (currentLog.hasCompletedOnboarding) {
      SafeStorage.setItem(ONBOARDING_KEY, 'true');
    }

    const dailyMetrics = {
      waterLitres: currentLog.waterLitres,
      trainingCompleted: currentLog.trainingCompleted,
      mealsLogged: currentLog.mealsLogged,
      totalCalories: currentLog.totalCalories,
      steps: currentLog.steps,
      energyLevel: currentLog.energyLevel,
      sleepQuality: currentLog.sleepQuality,
      checkInDone: currentLog.checkInDone,
      macros: currentLog.macros,
      readinessScore: currentLog.readinessScore,
      effectiveSets: currentLog.effectiveSets,
      lastNutrientDensityScore: currentLog.lastNutrientDensityScore,
      lastNutrientVerdict: currentLog.lastNutrientVerdict,
    };
    SafeStorage.setItem(`ataraxia_log_${targetDate}`, JSON.stringify(dailyMetrics));

    if (currentLog.stoicAvatarUri) {
      SafeStorage.setItem(AVATAR_STORAGE_KEY, currentLog.stoicAvatarUri);
    }
  } catch (e) {
    console.warn("[DailyLogContext] Error guardando estado:", e);
  }
}

export function DailyLogProvider({ children }: { children: React.ReactNode }) {
  const today = getLocalTodayDateString();
  const [user, setUser] = useState<User | null>(null);
  const [log, setLog] = useState<DailyLog>(() => loadLocalDailyLog(today));
  const loading = false;
  const [isLocalMode, setIsLocalMode] = useState(() => !auth);

  const logRef = useRef<DailyLog>(log);
  const prevTodayRef = useRef(today);
  const firestoreDebounceTimer = useRef<any>(null);

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
                hasCompletedOnboarding: cloudProfile.hasCompletedOnboarding ?? current.hasCompletedOnboarding ?? false,
                prokoptonProfile: cloudProfile.prokoptonProfile || current.prokoptonProfile,
                customRoutine: (cloudProfile.customRoutine && cloudProfile.customRoutine.length > 0)
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
      waterLitres: typeof local.waterLitres === 'number' ? local.waterLitres : (remote.waterLitres || 0),
      totalCalories: typeof local.totalCalories === 'number' ? local.totalCalories : (remote.totalCalories || 0),
      mealsLogged: typeof local.mealsLogged === 'number' ? local.mealsLogged : (remote.mealsLogged || 0),
      steps: typeof local.steps === 'number' ? local.steps : (remote.steps || 0),
      stepGoal: local.stepGoal || remote.stepGoal || 10000,
      targetCalories: local.targetCalories || remote.targetCalories || 2200,
      trainingCompleted: Boolean(local.trainingCompleted || remote.trainingCompleted),
      checkInDone: Boolean(local.checkInDone || remote.checkInDone),
      userName: (local.userName && local.userName !== DEFAULT_LOG.userName)
        ? local.userName
        : (remote.userName || DEFAULT_LOG.userName),
      stoicAvatarUri: local.stoicAvatarUri || remote.stoicAvatarUri || '',
      hasCompletedOnboarding: Boolean(local.hasCompletedOnboarding || remote.hasCompletedOnboarding),
      prokoptonProfile: local.prokoptonProfile || remote.prokoptonProfile,
      customRoutine: (local.customRoutine && local.customRoutine.length > 0)
        ? local.customRoutine
        : (remote.customRoutine || undefined),
      coachArchetype: local.coachArchetype || remote.coachArchetype || 'stoic_mentor',
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

  const updateLog = (updates: Partial<DailyLog>) => {
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
      if (firestoreDebounceTimer.current) {
        clearTimeout(firestoreDebounceTimer.current);
      }
      firestoreDebounceTimer.current = setTimeout(async () => {
        try {
          if (!db) return;
          const docRef = doc(db, `users/${user.uid}/daily_logs/${today}`);
          await setDoc(docRef, updates, { merge: true });
        } catch (error) {
          console.warn("Error en setDoc Firestore:", error);
        }
      }, 1000);
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
    coachArchetype?: CoachArchetype;
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
      ...(data.coachArchetype ? { coachArchetype: data.coachArchetype } : {}),
    });
    saveProfileToFirestore({
      userName: data.userName.trim() || 'Ciudadano Prokopton',
      userMetrics: newMetrics,
      targetCalories: data.targetCalories,
      stepGoal: data.stepGoal,
      ...(data.stoicAvatarUri ? { stoicAvatarUri: data.stoicAvatarUri } : {}),
      ...(data.coachArchetype ? { coachArchetype: data.coachArchetype } : {}),
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

  const setUserEmail = (email: string) => {
    updateLog({ userEmail: email });
    saveProfileToFirestore({ userEmail: email });
  };

  const saveGuardianKey = ({
    email,
    userName,
    weightKg,
    heightCm,
    age,
    path,
  }: {
    email: string;
    userName: string;
    weightKg: number;
    heightCm: number;
    age: number;
    path: LegendaryPath;
  }) => {
    const pathInfo = LEGENDARY_PATHS[path];
    const bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    const baseCals = Math.round(bmr * 1.4);
    const targetCals = Math.max(1400, baseCals + pathInfo.recommendedCalsDelta);

    const updatedMetrics: UserMetrics = {
      weightKg,
      heightCm,
      age,
      gender: 'male',
      activityLevel: 'moderate',
      goal: pathInfo.dietPreference === 'deficit' ? 'deficit' : pathInfo.dietPreference === 'surplus' ? 'surplus' : 'maintenance',
    };

    let routine: CustomExercise[] = [];
    if (path === 'spartan') {
      routine = [
        { id: 'sp1', n: 'Sentadilla Trasera Pesada', s: '4 series x 6 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Piernas' },
        { id: 'sp2', n: 'Press de Banca Olímpico', s: '4 series x 6 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho' },
        { id: 'sp3', n: 'Peso Muerto Convencional', s: '3 series x 5 reps', targetRpe: 9.0, done: false, rpe: null, muscleGroup: 'Espalda' },
        { id: 'sp4', n: 'Press Militar de Pie con Barra', s: '3 series x 8 reps', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Hombros' },
        { id: 'sp5', n: 'Remo Pendlay con Barra', s: '4 series x 8 reps', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Espalda' },
      ];
    } else if (path === 'hoplite') {
      routine = [
        { id: 'hop1', n: 'Circuito de Resistencia Hoplita', s: '4 rondas x 45 seg', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Full Body' },
        { id: 'hop2', n: 'Caminata Rápida / Trote NeAT Zona 2', s: '35 minutos continuos', targetRpe: 7.0, done: false, rpe: null, muscleGroup: 'Cardiovascular' },
        { id: 'hop3', n: 'Flexiones Tácticas con Pausa', s: '4 series x 15 reps', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Pecho/Tríceps' },
        { id: 'hop4', n: 'Dominadas Pronas Estrictas', s: '4 series x 8-10 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Espalda' },
        { id: 'hop5', n: 'Plancha Abdominal de Acero', s: '3 series x 60 seg', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Core' },
      ];
    } else if (path === 'apollo') {
      routine = [
        { id: 'ap1', n: 'Press Inclinado con Mancuernas (Énfasis Superior)', s: '4 series x 10-12 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho' },
        { id: 'ap2', n: 'Elevaciones Laterales Estrictas (Hombros en V)', s: '4 series x 15 reps', targetRpe: 9.0, done: false, rpe: null, muscleGroup: 'Hombros' },
        { id: 'ap3', n: 'Jalón al Pecho con Agarre Neutro', s: '4 series x 10 reps', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Espalda' },
        { id: 'ap4', n: 'Sentadilla Búlgara Esculpida', s: '3 series x 12 reps/pierna', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Piernas' },
        { id: 'ap5', n: 'Elevación de Piernas Colgado', s: '4 series x 15 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Abdomen' },
      ];
    } else {
      routine = [
        { id: 'ph1', n: 'Dominadas Estrictas en Barra (Autodominio)', s: '4 series x 10 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Espalda' },
        { id: 'ph2', n: 'Fondos en Paralelas (Dips)', s: '4 series x 12 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho/Tríceps' },
        { id: 'ph3', n: 'Pistol Squats (Sentadilla a una pierna)', s: '3 series x 8 reps/pierna', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Piernas' },
        { id: 'ph4', n: 'Flexiones Diamante en Suelo', s: '4 series x 15 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Tríceps' },
        { id: 'ph5', n: 'Hanging L-Sit / Hollow Body Stoic', s: '4 series x 30 seg', targetRpe: 9.0, done: false, rpe: null, muscleGroup: 'Core' },
      ];
    }

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
    };

    const profileData: ProkoptonProfile = {
      userName,
      focus: pathInfo.focus,
      equipment: pathInfo.equipment,
      daysPerWeek: 4,
      sessionDurationMinutes: 45,
      dietPreference: pathInfo.dietPreference,
      age,
      weightKg,
      targetWeightKg: weightKg,
      heightCm,
      completedAt: new Date().toISOString(),
      legendaryPath: path,
    };

    updateLog({
      userEmail: email,
      userName,
      userMetrics: updatedMetrics,
      targetCalories: targetCals,
      targetCaloriesMin: targetCals - 100,
      targetCaloriesMax: targetCals + 100,
      legendaryPath: path,
      coachArchetype: pathInfo.archetype,
      customRoutine: routine,
      monthlyCycle: newCycle,
      prokoptonProfile: profileData,
      hasCompletedOnboarding: true,
    });

    saveProfileToFirestore({
      userEmail: email,
      userName,
      userMetrics: updatedMetrics,
      targetCalories: targetCals,
      legendaryPath: path,
      coachArchetype: pathInfo.archetype,
      customRoutine: routine,
      monthlyCycle: newCycle,
      prokoptonProfile: profileData,
      hasCompletedOnboarding: true,
    });
  };

  const setCoachArchetype = (archetype: CoachArchetype) => {
    updateLog({ coachArchetype: archetype });
    saveProfileToFirestore({ coachArchetype: archetype });
  };

  const updateSmartDevice = (deviceUpdates: Partial<SmartDeviceState>) => {
    const currentDevice = logRef.current.smartDevice || DEFAULT_LOG.smartDevice!;
    const newDevice = { ...currentDevice, ...deviceUpdates };
    updateLog({ smartDevice: newDevice });
    saveProfileToFirestore({ smartDevice: newDevice });
  };

  const syncExternalHealthData = (payload: {
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
          total: Math.round((payload.sleepHours * 0.4) + ((10 - 2) * 0.3) + ((10 - 2) * 0.3)),
        }
      } : {})
    });

    saveProfileToFirestore({ smartDevice: newDevice });

    try {
      SafeStorage.setItem('ataraxia_pedometer_session_steps_v1', String(payload.steps));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
      }
    } catch {}
  };

  const saveOnboardingProfile = (profile: ProkoptonProfile, routine: CustomExercise[], targetCals: number) => {
    const updatedMetrics: UserMetrics = {
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
      age: profile.age,
      gender: 'male',
      activityLevel: profile.daysPerWeek >= 5 ? 'active' : profile.daysPerWeek >= 4 ? 'moderate' : 'light',
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
      hasCompletedOnboarding: true,
      prokoptonProfile: profile,
      customRoutine: routine,
    });
  };

  const resetOnboarding = () => {
    SafeStorage.removeItem(ONBOARDING_KEY);
    updateLog({
      hasCompletedOnboarding: false,
      prokoptonProfile: undefined,
      customRoutine: undefined,
    });
    saveProfileToFirestore({
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

  const calculateTodayGrade = useCallback((): DailyGrade => {
    const current = logRef.current;
    const cycle = current.monthlyCycle || DEFAULT_MONTHLY_CYCLE;

    // 1. Entreno (40 pts)
    const trainingPts = current.trainingCompleted ? 40 : 0;

    // 2. Pasos (30 pts vs meta)
    const stepsGoal = current.stepGoal || 10000;
    const stepsRatio = Math.min(1, (current.steps || 0) / stepsGoal);
    const stepsPts = Math.round(stepsRatio * 30);

    // 3. Agua (15 pts vs 2.5L)
    const waterRatio = Math.min(1, (current.waterLitres || 0) / 2.5);
    const waterPts = Math.round(waterRatio * 15);

    // 4. Nutrición / Checkin (15 pts)
    const mealsPts = (current.mealsLogged || 0) > 0 ? 10 : 0;
    const checkinPts = current.checkInDone ? 5 : 0;
    const nutritionPts = mealsPts + checkinPts;

    const totalScore = trainingPts + stepsPts + waterPts + nutritionPts;

    let status: DailyGradeStatus = 'failed';
    let verdict = 'Día Indigno: La mediocridad no tiene cabida en este templo.';
    if (totalScore >= 90) {
      status = 'divine';
      verdict = 'Corona de Laurel: Día de Semidiós impecable.';
    } else if (totalScore >= 75) {
      status = 'worthy';
      verdict = 'Hoplita Digno: Disciplina firme y honor cumplido.';
    } else if (totalScore >= 50) {
      status = 'mediocre';
      verdict = 'Tibio / En Peligro: Estás al borde de la debilidad.';
    }

    return {
      day: cycle.currentDay,
      date: getLocalTodayDateString(),
      score: totalScore,
      status,
      trainingDone: !!current.trainingCompleted,
      stepsRatio: parseFloat(stepsRatio.toFixed(2)),
      waterRatio: parseFloat(waterRatio.toFixed(2)),
      caloriesLogged: (current.mealsLogged || 0) > 0,
      verdict,
    };
  }, []);

  const selectLegendaryPath = useCallback((path: LegendaryPath) => {
    const pathInfo = LEGENDARY_PATHS[path];
    const currentMetrics = logRef.current.userMetrics || DEFAULT_USER_METRICS;

    const bmr = (10 * currentMetrics.weightKg) + (6.25 * currentMetrics.heightCm) - (5 * currentMetrics.age) + 5;
    const baseCals = Math.round(bmr * 1.4);
    const targetCals = Math.max(1400, baseCals + pathInfo.recommendedCalsDelta);

    let routine: CustomExercise[] = [];
    if (path === 'spartan') {
      routine = [
        { id: 'sp1', n: 'Sentadilla Trasera Pesada', s: '4 series x 6 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Piernas' },
        { id: 'sp2', n: 'Press de Banca Olímpico', s: '4 series x 6 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho' },
        { id: 'sp3', n: 'Peso Muerto Convencional', s: '3 series x 5 reps', targetRpe: 9.0, done: false, rpe: null, muscleGroup: 'Espalda' },
        { id: 'sp4', n: 'Press Militar de Pie con Barra', s: '3 series x 8 reps', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Hombros' },
        { id: 'sp5', n: 'Remo Pendlay con Barra', s: '4 series x 8 reps', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Espalda' },
      ];
    } else if (path === 'hoplite') {
      routine = [
        { id: 'hop1', n: 'Circuito de Resistencia Hoplita (Burpees + Zancadas)', s: '4 rondas x 45 seg', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Full Body' },
        { id: 'hop2', n: 'Caminata Rápida / Trote NeAT Zona 2', s: '35 minutos continuos', targetRpe: 7.0, done: false, rpe: null, muscleGroup: 'Cardiovascular' },
        { id: 'hop3', n: 'Flexiones Tácticas con Pausa', s: '4 series x 15 reps', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Pecho/Tríceps' },
        { id: 'hop4', n: 'Dominadas Pronas Estrictas', s: '4 series x 8-10 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Espalda' },
        { id: 'hop5', n: 'Plancha Abdominal de Acero', s: '3 series x 60 seg', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Core' },
      ];
    } else if (path === 'apollo') {
      routine = [
        { id: 'ap1', n: 'Press Inclinado con Mancuernas (Énfasis Superior)', s: '4 series x 10-12 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho' },
        { id: 'ap2', n: 'Elevaciones Laterales Estrictas (Hombros en V)', s: '4 series x 15 reps', targetRpe: 9.0, done: false, rpe: null, muscleGroup: 'Hombros' },
        { id: 'ap3', n: 'Jalón al Pecho con Agarre Neutro (Tempo 3-1-1)', s: '4 series x 10 reps', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Espalda' },
        { id: 'ap4', n: 'Sentadilla Búlgara Esculpida', s: '3 series x 12 reps/pierna', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Piernas' },
        { id: 'ap5', n: 'Elevación de Piernas Colgado (V-Cut Abs)', s: '4 series x 15 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Abdomen' },
      ];
    } else {
      routine = [
        { id: 'ph1', n: 'Dominadas Estrictas en Barra (Autodominio)', s: '4 series x 10 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Espalda' },
        { id: 'ph2', n: 'Fondos en Paralelas (Dips)', s: '4 series x 12 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho/Tríceps' },
        { id: 'ph3', n: 'Pistol Squats (Sentadilla a una pierna)', s: '3 series x 8 reps/pierna', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Piernas' },
        { id: 'ph4', n: 'Flexiones Diamante en Suelo', s: '4 series x 15 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Tríceps' },
        { id: 'ph5', n: 'Hanging L-Sit / Hollow Body Stoic', s: '4 series x 30 seg', targetRpe: 9.0, done: false, rpe: null, muscleGroup: 'Core' },
      ];
    }

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
    };

    updateLog({
      legendaryPath: path,
      coachArchetype: pathInfo.archetype,
      targetCalories: targetCals,
      targetCaloriesMin: targetCals - 100,
      targetCaloriesMax: targetCals + 100,
      customRoutine: routine,
      monthlyCycle: newCycle,
    });

    saveProfileToFirestore({
      legendaryPath: path,
      coachArchetype: pathInfo.archetype,
      targetCalories: targetCals,
      customRoutine: routine,
      monthlyCycle: newCycle,
    });
  }, []);

  const executeJudgment = useCallback(() => {
    const current = logRef.current;
    const cycle = current.monthlyCycle || DEFAULT_MONTHLY_CYCLE;
    const passedRatio = cycle.dailyGrades.length > 0
      ? cycle.passedDaysCount / cycle.dailyGrades.length
      : (cycle.averageScore >= 75 ? 1 : 0);

    const isPromoted = (cycle.averageScore >= 80 || passedRatio >= 0.8);
    let title = '';
    let message = '';

    if (isPromoted) {
      title = '👑 ¡ASCENSO OTORGADO: SEMIDIÓS DEL OLIMPO!';
      message = `Has completado el Ciclo de 30 Días con ${Math.round(cycle.averageScore)}% de excelencia. Has demostrado templanza, honor y fuerza real. Tu rango asciende y desbloqueas el nivel superior del Templo.`;
    } else {
      title = '💀 JUICIO ADVERSO: REPRENSIÓN POR MEDIOCRIDAD';
      message = `Tu promedio de disciplina fue de apenas ${Math.round(cycle.averageScore)}%. En Ataraxia no toleramos quejas ni excusas de niños. Tu rango queda revocado y deberás reiniciar el Ciclo de 30 Días desde el Día 1 con absoluta seriedad.`;
    }

    const updatedCycle: MonthlyCycleState = {
      ...cycle,
      isJudgmentReady: true,
      judgmentVerdict: isPromoted ? 'promoted' : 'scolded',
      judgmentText: message,
      tier: isPromoted ? 'Semidiós del Olimpo' : 'Novicio de Esparta',
    };

    updateLog({ monthlyCycle: updatedCycle });
    saveProfileToFirestore({ monthlyCycle: updatedCycle });

    return { promoted: isPromoted, title, message };
  }, []);

  const resetMonthlyCycle = useCallback(() => {
    const current = logRef.current;
    const path = current.legendaryPath || 'spartan';
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
    };
    updateLog({ monthlyCycle: newCycle });
    saveProfileToFirestore({ monthlyCycle: newCycle });
  }, []);

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
        setUserEmail,
        saveGuardianKey,
        setCoachArchetype,
        selectLegendaryPath,
        calculateTodayGrade,
        executeJudgment,
        resetMonthlyCycle,
        updateSmartDevice,
        saveOnboardingProfile,
        resetOnboarding,
        saveReadinessScore,
        updateEffectiveSets,
        logMealWithEnrichedMacros,
        setCustomRoutine,
        syncExternalHealthData,
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
