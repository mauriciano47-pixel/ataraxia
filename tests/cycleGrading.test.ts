import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { calculateTodayGrade, getLegendaryPathRoutine } from '../src/lib/cycleGrading.ts';
import { DEFAULT_LOG } from '../src/types/dailyLog.ts';
import type { DailyLog } from '../src/types/dailyLog.ts';

describe('Ataraxia — Calificación Diaria & Sendas Legendarias (cycleGrading)', () => {
  it('1. Debe calificar como "failed" un día con cero cumplimiento (0 pts)', () => {
    const emptyLog: DailyLog = {
      ...DEFAULT_LOG,
      trainingCompleted: false,
      steps: 0,
      mealsLogged: 0,
      totalCalories: 0,
      readinessScore: undefined,
      sleepQuality: 0,
      checkInDone: false,
      smartDevice: {
        connected: false,
        deviceName: '',
        heartRateBpm: 0,
        lastSync: '',
      },
    };

    const grade = calculateTodayGrade(emptyLog);
    assert.equal(grade.score, 0);
    assert.equal(grade.status, 'failed');
    assert.match(grade.verdict, /Día Indigno/);
    assert.equal(grade.pillars.training, false);
    assert.equal(grade.pillars.steps, false);
  });

  it('2. Debe calificar como "divine" (Corona de Laurel) cuando se cumplen los 7 pilares (>=90 pts)', () => {
    const perfectLog: DailyLog = {
      ...DEFAULT_LOG,
      trainingCompleted: true, // +20
      steps: 12000,            // +20 (>= 85% de 10000)
      stepGoal: 10000,
      mealsLogged: 3,          // +15
      totalCalories: 2400,
      readinessScore: { sleep: 8.0, stress: 2, soreness: 2, total: 85 }, // +15 (sleep >= 6.5)
      checkInDone: true,       // +10 (coach check-in)
      smartDevice: {
        connected: true,       // +10 (heart rate / telemetría)
        deviceName: 'Garmin Epix',
        heartRateBpm: 65,
        lastSync: 'Ahora',
      },
    };

    const grade = calculateTodayGrade(perfectLog);
    // 20 + 20 + 15 + 15 + 10 + 10 = 90 pts (sin stoic challenge de storage)
    assert.ok(grade.score >= 90, `Puntuación debe ser >= 90: ${grade.score}`);
    assert.equal(grade.status, 'divine');
    assert.match(grade.verdict, /Corona de Laurel/);
    assert.equal(grade.pillars.training, true);
    assert.equal(grade.pillars.steps, true);
    assert.equal(grade.pillars.nutrition, true);
    assert.equal(grade.pillars.sleep, true);
    assert.equal(grade.pillars.heartRate, true);
  });

  it('3. Debe calificar como "worthy" (Hoplita Digno) con puntuación entre 75 y 89', () => {
    const worthyLog: DailyLog = {
      ...DEFAULT_LOG,
      trainingCompleted: true, // +20
      steps: 9000,             // +18 pts (90% ratio * 20 = 18)
      stepGoal: 10000,
      mealsLogged: 2,          // +15
      totalCalories: 2000,
      readinessScore: { sleep: 7.0, stress: 3, soreness: 3, total: 78 }, // +15
      checkInDone: true,       // +10
      smartDevice: {
        connected: false,      // 0
        deviceName: '',
        heartRateBpm: 0,
        lastSync: '',
      },
    };

    const grade = calculateTodayGrade(worthyLog);
    // 20 + 18 + 15 + 15 + 10 = 78 pts
    assert.ok(grade.score >= 75 && grade.score < 90, `Puntuación debe ser 75-89: ${grade.score}`);
    assert.equal(grade.status, 'worthy');
    assert.match(grade.verdict, /Hoplita Digno/);
  });

  it('4. Debe retornar las 5 rutinas pesadas de la Senda Espartana con targetRPE >= 8.0', () => {
    const routine = getLegendaryPathRoutine('spartan');
    assert.equal(routine.length, 5);
    const exerciseNames = routine.map(e => e.n);
    assert.ok(exerciseNames.some(n => n.includes('Sentadilla Trasera')));
    assert.ok(exerciseNames.some(n => n.includes('Press de Banca')));
    assert.ok(exerciseNames.some(n => n.includes('Peso Muerto')));
    routine.forEach(ex => {
      assert.ok(ex.targetRpe && ex.targetRpe >= 8.0, `RPE debe ser exigente para espartano: ${ex.targetRpe}`);
      assert.equal(ex.done, false);
    });
  });

  it('5. Debe retornar las rutinas de Apolo, Hoplita y Filósofo con ejercicios específicos', () => {
    const apollo = getLegendaryPathRoutine('apollo');
    assert.equal(apollo.length, 5);
    assert.ok(apollo.some(e => e.n.includes('Press Inclinado') || e.n.includes('Elevaciones Laterales')));

    const hoplite = getLegendaryPathRoutine('hoplite');
    assert.equal(hoplite.length, 5);
    assert.ok(hoplite.some(e => e.n.includes('Resistencia Hoplita') || e.n.includes('Caminata Rápida')));

    const philosopher = getLegendaryPathRoutine('philosopher');
    assert.equal(philosopher.length, 5);
    assert.ok(philosopher.some(e => e.n.includes('Dominadas') || e.n.includes('Fondos')));
  });
});
