import {
  CoachArchetype,
  LegendaryPath,
  MonthlyCycleState,
  ProkoptonProfile,
  CustomExercise,
  EquipmentType,
  SessionDurationMinutes,
  ExperienceLevel,
  InjuryCare,
  BodySnapshot,
  DailyGrade,
} from '@/types/onboarding';
import { MonthlyResolution } from '@/lib/monthlyResolutionEngine';
import type { User } from 'firebase/auth';

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
  currentDay: 4,
  startDate: '2026-09-01T00:00:00.000Z',
  path: 'spartan',
  tier: 'Novicio de Esparta',
  dailyGrades: [],
  passedDaysCount: 0,
  failedDaysCount: 0,
  averageScore: 100,
  isJudgmentReady: false,
  isPactActive: true,
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
  userName: 'Mauro',
  userEmail: '',
  hasCompletedOnboarding: true,
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

export type UserProfile = {
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

export interface DailyLogContextType {
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
    equipment?: EquipmentType;
    sessionDurationMinutes?: SessionDurationMinutes;
    experienceLevel?: ExperienceLevel;
    injuryCare?: InjuryCare;
  }) => void;
  setCoachArchetype: (archetype: CoachArchetype) => void;
  selectLegendaryPath: (path: LegendaryPath) => void;
  calculateTodayGrade: () => DailyGrade;
  executeJudgment: () => { promoted: boolean; title: string; message: string; resolution?: MonthlyResolution };
  get30DayResolution: () => MonthlyResolution;
  resetMonthlyCycle: () => void;
  start30DayPact: (path?: LegendaryPath) => void;
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
  bodySnapshots: BodySnapshot[];
  addBodySnapshot: (snapshot: Omit<BodySnapshot, 'id' | 'createdAt'>) => Promise<BodySnapshot>;
  deleteBodySnapshot: (id: string) => Promise<void>;
}
