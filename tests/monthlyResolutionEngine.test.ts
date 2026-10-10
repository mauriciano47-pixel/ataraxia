import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { generate30DayResolution } from '../src/lib/monthlyResolutionEngine.ts';
import type { DailyGrade } from '../src/types/onboarding.ts';

describe('Ataraxia — Juicio del Ciclo de 30 Días (monthlyResolutionEngine)', () => {
  it('1. Debe ascender a "Semidiós del Olimpo" con 30 días divinos (100% disciplina)', () => {
    const perfectGrades: DailyGrade[] = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      date: `2026-10-${String(i + 1).padStart(2, '0')}`,
      score: 95,
      status: 'divine',
      pillars: {
        training: true,
        steps: true,
        nutrition: true,
        sleep: true,
        stoicChallenge: true,
        heartRate: true,
        coachCheckIn: true,
      },
      trainingDone: true,
      stepsRatio: 1.0,
      waterRatio: 1.0,
      caloriesLogged: true,
      sleepHours: 8.0,
      heartRateBpm: 68,
      verdict: 'Corona de Laurel',
    }));

    const res = generate30DayResolution({
      dailyGrades: perfectGrades,
      path: 'spartan',
      userName: 'Mauricio Uribe',
      startDate: '2026-10-01',
      archetype: 'spartan_commander',
    });

    assert.equal(res.promoted, true);
    assert.equal(res.tierAwarded, 'Semidiós del Olimpo');
    assert.equal(res.victoriousDaysCount, 30);
    assert.equal(res.failedDaysCount, 0);
    assert.equal(res.totalScoreAverage, 95);
    assert.ok(res.praises.length > 0);
    assert.match(res.masterDecreeMarkdown, /DECRETO SUPREMO/);
    assert.match(res.masterDecreeMarkdown, /Mauricio Uribe/);
  });

  it('2. Debe reprender y reprobar a un usuario con disciplina deficiente (< 75 pts promedio)', () => {
    const poorGrades: DailyGrade[] = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      date: `2026-10-${String(i + 1).padStart(2, '0')}`,
      score: 40,
      status: 'failed',
      pillars: {
        training: false,
        steps: false,
        nutrition: false,
        sleep: false,
        stoicChallenge: false,
        heartRate: false,
        coachCheckIn: false,
      },
      trainingDone: false,
      stepsRatio: 0.2,
      waterRatio: 0.3,
      caloriesLogged: false,
      sleepHours: 5.0,
      heartRateBpm: 0,
      verdict: 'Día Indigno',
    }));

    const res = generate30DayResolution({
      dailyGrades: poorGrades,
      path: 'spartan',
      userName: 'Indigno',
      startDate: '2026-10-01',
      archetype: 'spartan_commander',
    });

    assert.equal(res.promoted, false);
    assert.equal(res.tierAwarded, 'Novicio de Esparta');
    assert.equal(res.victoriousDaysCount, 0);
    assert.equal(res.failedDaysCount, 30);
    assert.ok(res.scoldings.length > 0);
    assert.match(res.masterDecreeMarkdown, /REPRESIÓN|JUICIO|DECRETO/i);
  });

  it('3. Debe otorgar "Guerrero de Élite" con promedio entre 78 y 89', () => {
    const eliteGrades: DailyGrade[] = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      date: `2026-10-${String(i + 1).padStart(2, '0')}`,
      score: 82,
      status: 'worthy',
      pillars: {
        training: true,
        steps: true,
        nutrition: true,
        sleep: true,
        stoicChallenge: false,
        heartRate: true,
        coachCheckIn: false,
      },
      trainingDone: true,
      stepsRatio: 0.9,
      waterRatio: 0.8,
      caloriesLogged: true,
      sleepHours: 7.0,
      heartRateBpm: 72,
      verdict: 'Hoplita Digno',
    }));

    const res = generate30DayResolution({
      dailyGrades: eliteGrades,
      path: 'hoplite',
      userName: 'Hoplita Mauro',
      startDate: '2026-10-01',
      archetype: 'sports_scientist',
    });

    assert.equal(res.promoted, true);
    assert.equal(res.tierAwarded, 'Guerrero de Élite');
    assert.equal(res.totalScoreAverage, 82);
  });
});
