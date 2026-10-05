import { CustomExercise } from '@/types/onboarding';

export function buildFallbackAIRoutine(time: number, focus: string, equip: string) {
  let title = `Rutina ${focus} (${time} min)`;
  let exercises: CustomExercise[] = [];

  if (equip === 'Peso Corporal') {
    title = `Calistenia Espartana ${focus} (${time} min)`;
    exercises = [
      { id: 'fa1', n: 'Flexiones Declinadas o en Pica', s: '4 al fallo', done: false, rpe: null, muscleGroup: 'Pecho' },
      { id: 'fa2', n: 'Sentadillas Explosivas con Pausa', s: '4x20', done: false, rpe: null, muscleGroup: 'Piernas' },
      { id: 'fa3', n: 'Zancadas Alternas en Desplazamiento', s: '3x16', done: false, rpe: null, muscleGroup: 'Piernas' },
      { id: 'fa4', n: 'Plancha Isométrica de Oso', s: '3x50s', done: false, rpe: null, muscleGroup: 'Core' },
    ];
  } else if (focus.includes('Empuje')) {
    title = `Poder de Empuje & Hombros (${time} min)`;
    exercises = [
      { id: 'fe1', n: 'Press de Banca Plano con Barra', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Pecho' },
      { id: 'fe2', n: 'Press Militar de Hombro con Mancuernas', s: '3x10 (RIR 2)', done: false, rpe: null, muscleGroup: 'Hombros' },
      { id: 'fe3', n: 'Fondos en Paralelas / Inclinado', s: '3x12 (RIR 1)', done: false, rpe: null, muscleGroup: 'Pecho' },
      { id: 'fe4', n: 'Elevaciones Laterales para Deltoides', s: '3x15', done: false, rpe: null, muscleGroup: 'Hombros' },
    ];
  } else if (focus.includes('Tracción')) {
    title = `Densidad de Espalda & Bíceps (${time} min)`;
    exercises = [
      { id: 'ft1', n: 'Peso Muerto Rumano con Barra', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'ft2', n: 'Remo Pendlay con Barra', s: '4x10 (RIR 2)', done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'ft3', n: 'Jalón al Pecho Agarre Neutro', s: '3x10', done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'ft4', n: 'Curl Martillo de Bíceps', s: '3x12', done: false, rpe: null, muscleGroup: 'Brazos' },
    ];
  } else {
    title = `Fuerza Full Body Estoica (${time} min)`;
    exercises = [
      { id: 'fb1', n: 'Sentadilla Trasera Profunda', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Piernas' },
      { id: 'fb2', n: 'Press Inclinado con Mancuernas', s: '3x10 (RIR 2)', done: false, rpe: null, muscleGroup: 'Pecho' },
      { id: 'fb3', n: 'Remo Unilateral con Mancuerna', s: '3x10 por lado', done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'fb4', n: 'Zancadas Búlgaras', s: '3x10 por pierna', done: false, rpe: null, muscleGroup: 'Piernas' },
      { id: 'fb5', n: 'Plancha Abdominal con Peso', s: '3x45s', done: false, rpe: null, muscleGroup: 'Core' },
    ];
  }

  return { title, exercises };
}
