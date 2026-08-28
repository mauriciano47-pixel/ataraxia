export type StoicFocus = 'strength' | 'fat_loss' | 'longevity' | 'mental';
export type EquipmentType = 'gym' | 'home_dumbbell' | 'calisthenics';
export type DaysPerWeek = 3 | 4 | 5 | 6;
export type SessionDurationMinutes = 30 | 45 | 60 | 90;
export type DietPreference = 'deficit' | 'maintenance' | 'surplus' | 'intermittent_fasting';

export type CoachArchetype = 'stoic_mentor' | 'spartan_commander' | 'sports_scientist';

export type LegendaryPath = 'spartan' | 'hoplite' | 'apollo' | 'philosopher';

export interface LegendaryPathInfo {
  id: LegendaryPath;
  name: string;
  subtitle: string;
  icon: string;
  focus: StoicFocus;
  equipment: EquipmentType;
  dietPreference: DietPreference;
  archetype: CoachArchetype;
  description: string;
  motto: string;
  recommendedCalsDelta: number; // e.g. +300 for spartan, -350 for apollo
  targetProteinGPerKg: number;
}

export const LEGENDARY_PATHS: Record<LegendaryPath, LegendaryPathInfo> = {
  spartan: {
    id: 'spartan',
    name: 'Senda del Espartano',
    subtitle: 'Fuerza Máxima, Cargas Pesadas & Hipertrofia Titánica',
    icon: '⚔️',
    focus: 'strength',
    equipment: 'gym',
    dietPreference: 'surplus',
    archetype: 'spartan_commander',
    description: 'Enfocado en mover cargas extremas, sobrecarga progresiva y construir un físico denso y poderoso como los guerreros de Leónidas.',
    motto: '«El dolor es temporal; el templo de hierro que forjas hoy te sobrevivirá.»',
    recommendedCalsDelta: 300,
    targetProteinGPerKg: 2.2,
  },
  hoplite: {
    id: 'hoplite',
    name: 'Senda del Hoplita',
    subtitle: 'Resistencia Inagotable, Cardio Zona 2 & Longevidad',
    icon: '🛡️',
    focus: 'longevity',
    equipment: 'home_dumbbell',
    dietPreference: 'maintenance',
    archetype: 'sports_scientist',
    description: 'Enfocado en capacidad aeróbica superior, salud cardiovascular, movilidad articular y resistencia física para no caer jamás.',
    motto: '«La verdadera victoria es permanecer de pie cuando todos los demás han caído.»',
    recommendedCalsDelta: 0,
    targetProteinGPerKg: 1.8,
  },
  apollo: {
    id: 'apollo',
    name: 'Senda de Apolo',
    subtitle: 'Definición Estética, Recomposición & Escultura en Mármol',
    icon: '⚡',
    focus: 'fat_loss',
    equipment: 'gym',
    dietPreference: 'deficit',
    archetype: 'sports_scientist',
    description: 'Enfocado en pérdida de grasa pura manteniendo masa magra, densidad muscular y proporciones áureas clásicas.',
    motto: '«La perfección no se alcanza añadiendo peso, sino eliminando lo que sobra.»',
    recommendedCalsDelta: -350,
    targetProteinGPerKg: 2.2,
  },
  philosopher: {
    id: 'philosopher',
    name: 'Senda del Filósofo Guerrero',
    subtitle: 'Calistenia Pura, Dominio Gravitacional & Paz Mental',
    icon: '🧘‍♂️',
    focus: 'mental',
    equipment: 'calisthenics',
    dietPreference: 'intermittent_fasting',
    archetype: 'stoic_mentor',
    description: 'Enfocado en el control absoluto del peso corporal, gimnasia natural, ayuno intermitente y templanza mental inquebrantable.',
    motto: '«Nadie es libre si no es dueño absoluto de su propio cuerpo y mente.»',
    recommendedCalsDelta: -100,
    targetProteinGPerKg: 1.9,
  },
};

export type CycleTier = 'Novicio de Esparta' | 'Hoplita Probado' | 'Guerrero de Élite' | 'Semidiós del Olimpo';

export type DailyGradeStatus = 'divine' | 'worthy' | 'mediocre' | 'failed';

export interface DailyPillars {
  training: boolean;       // 1. Ejercicios / rutina sellada
  steps: boolean;          // 2. Pasos diarios vs meta
  nutrition: boolean;      // 3. Ingesta de alimentos registrada
  sleep: boolean;          // 4. Calidad / horas de sueño registradas
  stoicChallenge: boolean; // 5. Lectura / Reto estoico diario completado
  heartRate: boolean;      // 6. Medición de latidos / telemetría registrada
  coachCheckIn: boolean;   // 7. Información dada al Coach / Check-in
}

export interface DailyGrade {
  day: number; // 1 to 30
  date: string;
  score: number; // 0 to 100
  status: DailyGradeStatus;
  pillars: DailyPillars;
  trainingDone: boolean;
  stepsRatio: number;
  waterRatio: number;
  waterLitres?: number;
  caloriesLogged: boolean;
  steps?: number;
  stepGoal?: number;
  totalCalories?: number;
  sleepHours?: number;
  heartRateBpm?: number;
  verdict: string;
  recordedAt?: string;
}

export interface MonthlyCycleState {
  currentDay: number; // 1 - 30
  startDate: string;
  path: LegendaryPath;
  tier: CycleTier;
  dailyGrades: DailyGrade[];
  passedDaysCount: number;
  failedDaysCount: number;
  averageScore: number;
  isJudgmentReady: boolean;
  isPactActive: boolean;
  judgmentVerdict?: 'promoted' | 'scolded';
  judgmentText?: string;
  resolutionMarkdown?: string;
}

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

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type InjuryCare = 'none' | 'back' | 'knees' | 'shoulders';

export interface ProkoptonProfile {
  userName: string;
  focus: StoicFocus;
  equipment: EquipmentType;
  daysPerWeek: DaysPerWeek;
  sessionDurationMinutes: SessionDurationMinutes;
  dietPreference: DietPreference;
  experienceLevel?: ExperienceLevel;
  injuryCare?: InjuryCare;
  age: number;
  weightKg: number;
  targetWeightKg: number;
  heightCm: number;
  completedAt: string;
  legendaryPath?: LegendaryPath;
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
