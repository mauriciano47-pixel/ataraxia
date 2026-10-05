import { CustomExercise } from '@/types/onboarding';

export const RUTINA_MOCK: CustomExercise[] = [
  { id: '1', n: 'Sentadilla Trasera con Barra', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Piernas' },
  { id: '2', n: 'Peso Muerto Rumano', s: '3x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Espalda / Isquios' },
  { id: '3', n: 'Press de Banca Olímpico', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Pecho' },
  { id: '4', n: 'Remo con Barra Pendlay', s: '3x10 (RIR 2)', done: false, rpe: null, muscleGroup: 'Espalda' },
  { id: '5', n: 'Zancadas Búlgaras', s: '3x10 por pierna', done: false, rpe: null, muscleGroup: 'Piernas' },
];

export const CALISTENIA_MOCK: CustomExercise[] = [
  { id: 'c1', n: 'Flexiones Declinadas con Pausa', s: '4 al fallo', done: false, rpe: null, muscleGroup: 'Pecho' },
  { id: 'c2', n: 'Dominadas Pronas Estrictas', s: '4x8 reps', done: false, rpe: null, muscleGroup: 'Espalda' },
  { id: 'c3', n: 'Sentadillas Libres Explosivas', s: '4x20 reps', done: false, rpe: null, muscleGroup: 'Piernas' },
  { id: 'c4', n: 'Fondos en Paralelas / Dips', s: '3x12 reps', done: false, rpe: null, muscleGroup: 'Tríceps/Pecho' },
  { id: 'c5', n: 'Plancha Abdominal Estoica', s: '3x60 seg', done: false, rpe: null, muscleGroup: 'Core' },
];

export const PRESET_ROUTINES: { id: string; title: string; subtitle: string; icon: string; exercises: CustomExercise[] }[] = [
  {
    id: 'push',
    title: 'Torso & Empuje (Push)',
    subtitle: 'Pecho, Deltoides Anterior y Tríceps',
    icon: '⚔️',
    exercises: [
      { id: 'p1', n: 'Press de Banca Plano Olímpico', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Pecho' },
      { id: 'p2', n: 'Press Inclinado con Mancuernas', s: '3x10 (RIR 2)', done: false, rpe: null, muscleGroup: 'Pecho' },
      { id: 'p3', n: 'Press Militar de Pie con Barra', s: '3x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Hombros' },
      { id: 'p4', n: 'Fondos en Paralelas / Dips', s: '3x12 (RIR 1)', done: false, rpe: null, muscleGroup: 'Pecho/Tríceps' },
      { id: 'p5', n: 'Elevaciones Laterales Estrictas', s: '4x15 (Fallo)', done: false, rpe: null, muscleGroup: 'Hombros' },
      { id: 'p6', n: 'Extensiones de Tríceps en Polea', s: '3x12 (RIR 1)', done: false, rpe: null, muscleGroup: 'Brazos' },
    ],
  },
  {
    id: 'pull',
    title: 'Espalda & Tracción (Pull)',
    subtitle: 'Dorsales, Trapecios y Bíceps',
    icon: '🛡️',
    exercises: [
      { id: 'pu1', n: 'Dominadas Pronas Estrictas', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'pu2', n: 'Remo con Barra Pendlay 90°', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'pu3', n: 'Jalón al Pecho Agarre Neutro', s: '3x10 (RIR 1)', done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'pu4', n: 'Remo Unilateral con Mancuerna', s: '3x10 por lado', done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'pu5', n: 'Face Pulls para Deltoides Posterior', s: '4x15 (RIR 1)', done: false, rpe: null, muscleGroup: 'Hombros' },
      { id: 'pu6', n: 'Curl Martillo Pesado de Bíceps', s: '3x10 (RIR 1)', done: false, rpe: null, muscleGroup: 'Brazos' },
    ],
  },
  {
    id: 'legs',
    title: 'Pierna & Glúteos (Legs)',
    subtitle: 'Cuádriceps, Isquiosurales y Core',
    icon: '🦵',
    exercises: [
      { id: 'l1', n: 'Sentadilla Trasera Profunda', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Piernas' },
      { id: 'l2', n: 'Peso Muerto Rumano con Barra', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Isquios' },
      { id: 'l3', n: 'Prensa Inclinada 45°', s: '3x12 (RIR 1)', done: false, rpe: null, muscleGroup: 'Piernas' },
      { id: 'l4', n: 'Zancadas Búlgaras con Mancuernas', s: '3x10 por pierna', done: false, rpe: null, muscleGroup: 'Piernas' },
      { id: 'l5', n: 'Elevación de Talones en Máquina', s: '4x15 (Pausa 2s)', done: false, rpe: null, muscleGroup: 'Gemelos' },
      { id: 'l6', n: 'Plancha Abdominal con Disco', s: '3x50 seg', done: false, rpe: null, muscleGroup: 'Core' },
    ],
  },
  {
    id: 'fullbody',
    title: 'Full Body Imperial',
    subtitle: 'Patrones Básicos de Fuerza Total',
    icon: '🏛️',
    exercises: [
      { id: 'fb1', n: 'Sentadilla Trasera con Barra', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Piernas' },
      { id: 'fb2', n: 'Press de Banca Plano Olímpico', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Pecho' },
      { id: 'fb3', n: 'Peso Muerto Convencional', s: '3x6 (RIR 2)', done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'fb4', n: 'Press Militar de Pie con Barra', s: '3x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Hombros' },
      { id: 'fb5', n: 'Remo Unilateral con Mancuerna', s: '3x10 por lado', done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'fb6', n: 'Plancha Abdominal Estoica', s: '3x60 seg', done: false, rpe: null, muscleGroup: 'Core' },
    ],
  },
  {
    id: 'calisthenics',
    title: 'Calistenia Espartana (Peso Corporal)',
    subtitle: 'Autodominio Físico y Tensión Gravitacional',
    icon: '🤸‍♂️',
    exercises: [
      { id: 'c1', n: 'Flexiones Declinadas con Pausa', s: '4 al fallo', done: false, rpe: null, muscleGroup: 'Pecho' },
      { id: 'c2', n: 'Dominadas Pronas Estrictas', s: '4x8 reps', done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'c3', n: 'Fondos en Paralelas / Dips', s: '4x12 reps', done: false, rpe: null, muscleGroup: 'Pecho/Tríceps' },
      { id: 'c4', n: 'Pistol Squats o Búlgaras Libres', s: '3x10 por pierna', done: false, rpe: null, muscleGroup: 'Piernas' },
      { id: 'c5', n: 'Flexiones en Pica (Pike Push-ups)', s: '3x10 reps', done: false, rpe: null, muscleGroup: 'Hombros' },
      { id: 'c6', n: 'Hanging Leg Raises / L-Sit', s: '3x12 reps', done: false, rpe: null, muscleGroup: 'Core' },
    ],
  },
];

export const SUGGESTED_EXERCISES = [
  'Sentadilla Trasera con Barra',
  'Press de Banca Olímpico',
  'Peso Muerto Rumano',
  'Press Militar con Barra',
  'Dominadas Pronas Estrictas',
  'Remo con Barra Pendlay',
  'Zancadas Búlgaras',
  'Press Inclinado con Mancuernas',
  'Fondos en Paralelas',
  'Elevaciones Laterales',
  'Curl de Bíceps con Barra',
  'Extensiones de Tríceps',
  'Hip Thrust con Barra',
  'Prensa de Piernas 45°',
  'Plancha Abdominal de Acero',
];

export const SUGGESTED_SETS = [
  '4x8 (RIR 2)',
  '3x10 (RIR 2)',
  '4x12 (RIR 1)',
  '3x15 (Fallo)',
  '4 al fallo',
  '3x50 seg',
  '4x6 (Pesado)',
];

export const MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Full Body'];
