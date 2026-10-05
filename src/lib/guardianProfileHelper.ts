import {
  EquipmentType,
  SessionDurationMinutes,
  ExperienceLevel,
  InjuryCare,
  LegendaryPath,
  LEGENDARY_PATHS,
  MonthlyCycleState,
  ProkoptonProfile,
  CustomExercise,
} from '@/types/onboarding';
import { UserMetrics, DailyLog } from '@/types/dailyLog';
import { getLegendaryPathRoutine } from '@/lib/cycleGrading';

export interface GuardianKeyInput {
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
}

export interface GuardianKeyResult {
  logUpdates: Partial<DailyLog>;
  profileUpdates: Record<string, any>;
}

export function buildGuardianKeyPayload(data: GuardianKeyInput): GuardianKeyResult {
  const pathInfo = LEGENDARY_PATHS[data.path];
  const userEquip: EquipmentType = data.equipment || pathInfo.equipment || 'gym';
  const userDuration: SessionDurationMinutes = data.sessionDurationMinutes || 45;
  const bmr = 10 * data.weightKg + 6.25 * data.heightCm - 5 * data.age + 5;
  const baseCals = Math.round(bmr * 1.4);
  const targetCals = Math.max(1400, baseCals + pathInfo.recommendedCalsDelta);

  const updatedMetrics: UserMetrics = {
    weightKg: data.weightKg,
    heightCm: data.heightCm,
    age: data.age,
    gender: 'male',
    activityLevel: 'moderate',
    goal:
      pathInfo.dietPreference === 'deficit'
        ? 'deficit'
        : pathInfo.dietPreference === 'surplus'
        ? 'surplus'
        : 'maintenance',
  };

  const routine: CustomExercise[] = getLegendaryPathRoutine(data.path);

  const newCycle: MonthlyCycleState = {
    currentDay: 1,
    startDate: new Date().toISOString(),
    path: data.path,
    tier: 'Novicio de Esparta',
    dailyGrades: [],
    passedDaysCount: 0,
    failedDaysCount: 0,
    averageScore: 100,
    isJudgmentReady: false,
    isPactActive: true,
  };

  const profileData: ProkoptonProfile = {
    userName: data.userName,
    focus: pathInfo.focus,
    equipment: userEquip,
    daysPerWeek: 4,
    sessionDurationMinutes: userDuration,
    dietPreference: pathInfo.dietPreference,
    experienceLevel: data.experienceLevel || 'intermediate',
    injuryCare: data.injuryCare || 'none',
    age: data.age,
    weightKg: data.weightKg,
    targetWeightKg: data.weightKg,
    heightCm: data.heightCm,
    completedAt: new Date().toISOString(),
    legendaryPath: data.path,
  };

  const payload: Partial<DailyLog> = {
    userEmail: data.email,
    userName: data.userName,
    userMetrics: updatedMetrics,
    targetCalories: targetCals,
    targetCaloriesMin: targetCals - 100,
    targetCaloriesMax: targetCals + 100,
    legendaryPath: data.path,
    coachArchetype: pathInfo.archetype,
    customRoutine: routine,
    monthlyCycle: newCycle,
    prokoptonProfile: profileData,
    hasCompletedOnboarding: true,
  };

  return {
    logUpdates: payload,
    profileUpdates: payload,
  };
}
