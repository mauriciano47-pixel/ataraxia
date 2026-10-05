import { SafeStorage } from '@/utils/safeStorage';
import { getLocalTodayDateString } from '@/utils/dateUtils';
import {
  DailyGrade,
  DailyGradeStatus,
  LegendaryPath,
  CustomExercise,
} from '@/types/onboarding';
import { DailyLog, DEFAULT_MONTHLY_CYCLE } from '@/types/dailyLog';

export function calculateTodayGrade(current: DailyLog): DailyGrade {
  const cycle = current.monthlyCycle || DEFAULT_MONTHLY_CYCLE;
  const todayStr = getLocalTodayDateString();

  // 1. Entreno (20 pts): Sesión sellada
  const trainingDone = Boolean(current.trainingCompleted);
  const trainingPts = trainingDone ? 20 : 0;

  // 2. Pasos (20 pts vs meta): >= 85% de la meta o meta cumplida
  const stepsGoal = current.stepGoal || 10000;
  const stepsRatio = Math.min(1, (current.steps || 0) / stepsGoal);
  const stepsPassed = (current.steps || 0) >= stepsGoal * 0.85;
  const stepsPts = Math.round(stepsRatio * 20);

  // 3. Ingesta de alimentos (15 pts): Comidas registradas
  const nutritionPassed = (current.mealsLogged || 0) > 0 || (current.totalCalories || 0) > 0;
  const nutritionPts = nutritionPassed ? 15 : 0;

  // 4. Calidad de sueño (15 pts): Sueño registrado >= 6.5h
  let sleepHours = current.readinessScore?.sleep || (current.sleepQuality ? current.sleepQuality * 1.0 : 0);
  try {
    const savedSleep = SafeStorage.getItem('ataraxia_sleep_record_v1');
    if (savedSleep) {
      const parsed = JSON.parse(savedSleep);
      if (parsed.totalHours) sleepHours = parsed.totalHours;
    }
  } catch {}
  const sleepPassed = sleepHours >= 6.5;
  const sleepPts = sleepPassed ? 15 : 0;

  // 5. Lectura / Reto estoico (10 pts): Reto diario o diario completado
  let stoicChallengePassed = false;
  try {
    stoicChallengePassed =
      Boolean(SafeStorage.getItem(`ataraxia_stoic_challenge_completed_${todayStr}`)) ||
      Boolean(SafeStorage.getItem(`ataraxia_journal_${todayStr}`));
  } catch {}
  const stoicChallengePts = stoicChallengePassed ? 10 : 0;

  // 6. Medición de latidos / telemetría (10 pts)
  const heartRatePassed =
    (current.smartDevice?.heartRateBpm && current.smartDevice.heartRateBpm > 0) ||
    current.smartDevice?.connected === true;
  const heartRatePts = heartRatePassed ? 10 : 0;

  // 7. Info dada al Coach / Check-in SNC (10 pts)
  const coachCheckInPassed = Boolean(current.checkInDone) || Boolean(current.readinessScore);
  const coachCheckInPts = coachCheckInPassed ? 10 : 0;

  const totalScore =
    trainingPts + stepsPts + nutritionPts + sleepPts + stoicChallengePts + heartRatePts + coachCheckInPts;

  const pillars = {
    training: trainingDone,
    steps: stepsPassed,
    nutrition: nutritionPassed,
    sleep: sleepPassed,
    stoicChallenge: stoicChallengePassed,
    heartRate: heartRatePassed,
    coachCheckIn: coachCheckInPassed,
  };

  let status: DailyGradeStatus = 'failed';
  let verdict = 'Día Indigno: La mediocridad no tiene cabida en este templo. Faltan pilares sagrados de tu Senda.';

  if (totalScore >= 90) {
    status = 'divine';
    verdict = 'Corona de Laurel: Día de Semidiós impecable. Los 7 pilares conquistados con excelencia.';
  } else if (totalScore >= 75) {
    status = 'worthy';
    verdict = 'Hoplita Digno: Disciplina firme y honor militar cumplido conforme a tu Senda.';
  } else if (totalScore >= 50) {
    status = 'mediocre';
    verdict = 'Tibio / Al Límite: Estás al borde de la deshonra. Completa los pilares pendientes.';
  }

  // Calcular día actual preciso basado en la fecha de inicio del pacto
  let preciseDay = cycle.currentDay;
  if (cycle.startDate) {
    const start = new Date(cycle.startDate);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    preciseDay = Math.min(30, Math.max(1, diffDays));
  }

  return {
    day: preciseDay,
    date: todayStr,
    score: totalScore,
    status,
    pillars,
    trainingDone,
    steps: current.steps || 0,
    stepGoal: stepsGoal,
    stepsRatio: parseFloat(stepsRatio.toFixed(2)),
    waterLitres: current.waterLitres || 0,
    waterRatio: parseFloat(Math.min(1, (current.waterLitres || 0) / 2.5).toFixed(2)),
    caloriesLogged: nutritionPassed,
    totalCalories: current.totalCalories || 0,
    sleepHours,
    heartRateBpm: current.smartDevice?.heartRateBpm || 0,
    verdict,
    recordedAt: new Date().toISOString(),
  };
}

export function getLegendaryPathRoutine(path: LegendaryPath): CustomExercise[] {
  if (path === 'spartan') {
    return [
      { id: 'sp1', n: 'Sentadilla Trasera Pesada', s: '4 series x 6 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Piernas' },
      { id: 'sp2', n: 'Press de Banca Olímpico', s: '4 series x 6 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho' },
      { id: 'sp3', n: 'Peso Muerto Convencional', s: '3 series x 5 reps', targetRpe: 9.0, done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'sp4', n: 'Press Militar de Pie con Barra', s: '3 series x 8 reps', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Hombros' },
      { id: 'sp5', n: 'Remo Pendlay con Barra', s: '4 series x 8 reps', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Espalda' },
    ];
  }
  if (path === 'hoplite') {
    return [
      { id: 'hop1', n: 'Circuito de Resistencia Hoplita (Burpees + Zancadas)', s: '4 rondas x 45 seg', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Full Body' },
      { id: 'hop2', n: 'Caminata Rápida / Trote NeAT Zona 2', s: '35 minutos continuos', targetRpe: 7.0, done: false, rpe: null, muscleGroup: 'Cardiovascular' },
      { id: 'hop3', n: 'Flexiones Tácticas con Pausa', s: '4 series x 15 reps', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Pecho/Tríceps' },
      { id: 'hop4', n: 'Dominadas Pronas Estrictas', s: '4 series x 8-10 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'hop5', n: 'Plancha Abdominal de Acero', s: '3 series x 60 seg', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Core' },
    ];
  }
  if (path === 'apollo') {
    return [
      { id: 'ap1', n: 'Press Inclinado con Mancuernas (Énfasis Superior)', s: '4 series x 10-12 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho' },
      { id: 'ap2', n: 'Elevaciones Laterales Estrictas (Hombros en V)', s: '4 series x 15 reps', targetRpe: 9.0, done: false, rpe: null, muscleGroup: 'Hombros' },
      { id: 'ap3', n: 'Jalón al Pecho con Agarre Neutro (Tempo 3-1-1)', s: '4 series x 10 reps', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'ap4', n: 'Sentadilla Búlgara Esculpida', s: '3 series x 12 reps/pierna', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Piernas' },
      { id: 'ap5', n: 'Elevación de Piernas Colgado (V-Cut Abs)', s: '4 series x 15 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Abdomen' },
    ];
  }
  return [
    { id: 'ph1', n: 'Dominadas Estrictas en Barra (Autodominio)', s: '4 series x 10 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Espalda' },
    { id: 'ph2', n: 'Fondos en Paralelas (Dips)', s: '4 series x 12 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho/Tríceps' },
    { id: 'ph3', n: 'Pistol Squats (Sentadilla a una pierna)', s: '3 series x 8 reps/pierna', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Piernas' },
    { id: 'ph4', n: 'Flexiones Diamante en Suelo', s: '4 series x 15 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Tríceps' },
    { id: 'ph5', n: 'Hanging L-Sit / Hollow Body Stoic', s: '4 series x 30 seg', targetRpe: 9.0, done: false, rpe: null, muscleGroup: 'Core' },
  ];
}
