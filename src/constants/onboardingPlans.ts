import {
  CustomExercise,
  LegendaryPath,
  LEGENDARY_PATHS,
  EquipmentType,
  DaysPerWeek,
  SessionDurationMinutes,
} from '@/types/onboarding';

export interface PlanGenerationInput {
  age: string;
  weightKg: string;
  heightCm: string;
  selectedPath: LegendaryPath;
  equipment: EquipmentType;
  daysPerWeek: DaysPerWeek;
  sessionDuration: SessionDurationMinutes;
}

export interface CalculatedPlanOutput {
  routine: CustomExercise[];
  targetCals: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  stepGoal: number;
}

export function generateCalculatedPlan(input: PlanGenerationInput): CalculatedPlanOutput {
  const { age, weightKg, heightCm, selectedPath, equipment, daysPerWeek } = input;
  const ageNum = parseInt(age, 10) || 28;
  const weightNum = parseFloat(weightKg) || 78;
  const heightNum = parseFloat(heightCm) || 176;
  const pathInfo = LEGENDARY_PATHS[selectedPath];

  // BMR Fórmula Mifflin-St Jeor
  const bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
  const activityMult = daysPerWeek >= 5 ? 1.55 : daysPerWeek >= 4 ? 1.4 : 1.25;
  const tdee = Math.round(bmr * activityMult);
  const targetCals = Math.max(1450, tdee + pathInfo.recommendedCalsDelta);

  // Macros
  const proteinGrams = Math.round(weightNum * pathInfo.targetProteinGPerKg);
  const fatsGrams = Math.round((targetCals * 0.25) / 9);
  const remainingCals = targetCals - (proteinGrams * 4) - (fatsGrams * 9);
  const carbsGrams = Math.max(80, Math.round(remainingCals / 4));

  // Meta de Pasos según la Senda
  const stepGoal = selectedPath === 'hoplite' ? 12000 : selectedPath === 'apollo' ? 10000 : selectedPath === 'spartan' ? 8000 : 9000;

  // Rutina adaptada a la Senda + Equipamiento + Tiempo
  let routine: CustomExercise[] = [];

  if (selectedPath === 'spartan') {
    if (equipment === 'gym') {
      routine = [
        { id: 'sp1', n: 'Sentadilla Trasera con Barra Olímpica', s: '4x6 (Pesado RIR 2)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Piernas' },
        { id: 'sp2', n: 'Press de Banca Plano con Barra', s: '4x6 (Sobrecarga Progresiva)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho' },
        { id: 'sp3', n: 'Peso Muerto Convencional', s: '3x5 (Poder Espartano)', targetRpe: 9.0, done: false, rpe: null, muscleGroup: 'Espalda' },
        { id: 'sp4', n: 'Press Militar de Pie con Barra', s: '3x8 (Estricto)', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Hombros' },
        { id: 'sp5', n: 'Remo Pendlay con Barra', s: '4x8 (Espalda Densa)', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Espalda' },
      ];
    } else if (equipment === 'home_dumbbell') {
      routine = [
        { id: 'sph1', n: 'Goblet Squat Pesado con Pausa', s: '4x10 (RIR 1)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Piernas' },
        { id: 'sph2', n: 'Press de Pecho en Suelo (Floor Press)', s: '4x10 (Pesado)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho' },
        { id: 'sph3', n: 'Peso Muerto Rumano con Mancuernas', s: '4x10 (Cadena Posterior)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Isquios' },
        { id: 'sph4', n: 'Press Militar con Mancuernas de Pie', s: '3x10 (Hombros)', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Hombros' },
      ];
    } else {
      routine = [
        { id: 'spc1', n: 'Dominadas Lastradas / Isométricas', s: '4x6 (Fuerza)', targetRpe: 9.0, done: false, rpe: null, muscleGroup: 'Espalda' },
        { id: 'spc2', n: 'Fondos en Paralelas / Dips', s: '4x8 (Pecho/Tríceps)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho' },
        { id: 'spc3', n: 'Pistol Squats (Sentadillas a 1 pierna)', s: '4x6 por pierna', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Piernas' },
        { id: 'spc4', n: 'Flexiones Diamante Espartanas', s: '3x al fallo técnico', targetRpe: 9.0, done: false, rpe: null, muscleGroup: 'Tríceps' },
      ];
    }
  } else if (selectedPath === 'hoplite') {
    routine = [
      { id: 'hop1', n: 'Circuito de Resistencia Hoplita (Burpees + Zancadas)', s: '4 rondas x 45 seg', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Full Body' },
      { id: 'hop2', n: 'Caminata Rápida / Trote NeAT Zona 2', s: '35 minutos continuos', targetRpe: 7.0, done: false, rpe: null, muscleGroup: 'Cardiovascular' },
      { id: 'hop3', n: 'Flexiones Tácticas con Pausa', s: '4x15 reps', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Pecho' },
      { id: 'hop4', n: 'Dominadas Pronas Estrictas', s: '4x8 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'hop5', n: 'Plancha Abdominal de Acero', s: '3x60 seg', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Core' },
    ];
  } else if (selectedPath === 'apollo') {
    routine = [
      { id: 'ap1', n: 'Press Inclinado con Mancuernas (Énfasis Superior)', s: '4x10-12 (Ardor)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho' },
      { id: 'ap2', n: 'Elevaciones Laterales Estrictas (Hombros en V)', s: '4x15 (Bombeo)', targetRpe: 9.0, done: false, rpe: null, muscleGroup: 'Hombros' },
      { id: 'ap3', n: 'Jalón al Pecho con Agarre Neutro (Tempo 3-1-1)', s: '4x10 (Espalda)', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'ap4', n: 'Sentadilla Búlgara Esculpida', s: '3x12 por pierna', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Piernas' },
      { id: 'ap5', n: 'Elevación de Piernas Colgado (V-Cut Abs)', s: '4x15 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Core' },
    ];
  } else {
    // Filósofo Guerrero (Calistenia + Temple)
    routine = [
      { id: 'ph1', n: 'Dominadas Estrictas en Barra (Autodominio)', s: '4x10 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'ph2', n: 'Flexiones en Suelo Militares (Cadencia 2-1-1)', s: '4x15 reps', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Pecho' },
      { id: 'ph3', n: 'Sentadillas Profundas de Calistenia', s: '4x25 reps', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Piernas' },
      { id: 'ph4', n: 'Elevación de Piernas en Barra', s: '4x12 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Core' },
      { id: 'ph5', n: 'Plancha Abdominal Estoica (Respiración Calmada)', s: '3x60 seg', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Mente/Core' },
    ];
  }

  return { routine, targetCals, proteinGrams, carbsGrams, fatsGrams, stepGoal };
}
