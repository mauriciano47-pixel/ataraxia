import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { executeCycleJudgment } from '../src/lib/pactResolutionHelper.ts';
import { DEFAULT_LOG } from '../src/types/dailyLog.ts';
import type { DailyGrade } from '../src/types/onboarding.ts';

describe('Ataraxia — Helper de Ejecución de Juicio del Pacto (pactResolutionHelper)', () => {
  it('1. Debe ejecutar juicio con veredicto adverso cuando el ciclo no alcanza la meta', () => {
    const unpromotedLog = {
      ...DEFAULT_LOG,
      userName: 'Neófito Débil',
      monthlyCycle: {
        ...DEFAULT_LOG.monthlyCycle!,
        dailyGrades: [],
      },
    };

    const judgment = executeCycleJudgment(unpromotedLog);
    assert.equal(judgment.promoted, false);
    assert.match(judgment.title, /JUICIO ADVERSO/);
    assert.equal(judgment.updatedCycle.isJudgmentReady, true);
    assert.equal(judgment.updatedCycle.judgmentVerdict, 'scolded');
    assert.ok(judgment.resolution);
  });

  it('2. Debe ascender y generar título triunfal con ciclo completado con excelencia', () => {
    const divineGrades: DailyGrade[] = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      date: `2026-10-${String(i + 1).padStart(2, '0')}`,
      score: 92,
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
      heartRateBpm: 60,
      verdict: 'Corona de Laurel',
    }));

    const promotedLog = {
      ...DEFAULT_LOG,
      userName: 'Héroe Espartano',
      legendaryPath: 'spartan' as const,
      monthlyCycle: {
        ...DEFAULT_LOG.monthlyCycle!,
        dailyGrades: divineGrades,
      },
    };

    const judgment = executeCycleJudgment(promotedLog);
    assert.equal(judgment.promoted, true);
    assert.match(judgment.title, /ASCENSO OTORGADO/);
    assert.equal(judgment.updatedCycle.judgmentVerdict, 'promoted');
    assert.equal(judgment.updatedCycle.tier, 'Semidiós del Olimpo');
  });
});
