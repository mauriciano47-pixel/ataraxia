export type StoicFocus = 'strength' | 'fat_loss' | 'longevity' | 'mental';
export type EquipmentType = 'gym' | 'home_dumbbell' | 'calisthenics';
export type DaysPerWeek = 3 | 4 | 5 | 6;
export type SessionDurationMinutes = 30 | 45 | 60 | 90;
export type DietPreference = 'deficit' | 'maintenance' | 'surplus' | 'intermittent_fasting';

export type CoachArchetype = 'stoic_mentor' | 'spartan_commander' | 'sports_scientist';

export interface CoachArchetypeInfo {
  id: CoachArchetype;
  name: string;
  shortName: string;
  icon: string;
  tagline: string;
  description: string;
}

export const COACH_ARCHETYPES: Record<CoachArchetype, CoachArchetypeInfo> = {
  stoic_mentor: {
    id: 'stoic_mentor',
    name: 'Mentor Sabio Estoico',
    shortName: 'Estoico',
    icon: '🏛️',
    tagline: 'Virtud, Templanza & Filosofía Aplicada',
    description: 'Guía reflexiva inspirada en Marco Aurelio y Séneca. Enfocado en la serenidad mental, la constancia y el amor al proceso.',
  },
  spartan_commander: {
    id: 'spartan_commander',
    name: 'Comandante Espartano',
    shortName: 'Espartano',
    icon: '⚔️',
    tagline: 'Disciplina de Hierro & Cero Excusas',
    description: 'Mentor de batalla implacable y motivador de alta intensidad. Exige tu 100% físico y forja una voluntad inquebrantable.',
  },
  sports_scientist: {
    id: 'sports_scientist',
    name: 'Fisiólogo & Biohacker',
    shortName: 'Científico',
    icon: '🔬',
    tagline: 'Ciencia del Deporte & Optimización',
    description: 'Análisis biomecánico, RPE/RIR, síntesis proteica y nutrición milimétrica basada en la evidencia deportiva más reciente.',
  },
};

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
