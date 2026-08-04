export type StoicFocus = 'strength' | 'fat_loss' | 'longevity' | 'mental';
export type EquipmentType = 'gym' | 'home_dumbbell' | 'calisthenics';
export type DaysPerWeek = 3 | 4 | 5 | 6;
export type SessionDurationMinutes = 30 | 45 | 60 | 90;
export type DietPreference = 'deficit' | 'maintenance' | 'surplus' | 'intermittent_fasting';

export interface ProkoptonProfile {
  userName: string;
  focus: StoicFocus;
  equipment: EquipmentType;
  daysPerWeek: DaysPerWeek;
  sessionDurationMinutes: SessionDurationMinutes;
  dietPreference: DietPreference;
  age: number;
  weightKg: number;
  targetWeightKg: number;
  heightCm: number;
  completedAt: string;
}

export interface CustomExercise {
  id: string;
  n: string;
  s: string;
  targetRpe?: number;
  done: boolean;
  rpe: number | null;
  muscleGroup?: string;
}
