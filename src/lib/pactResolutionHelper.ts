import { MonthlyCycleState } from '@/types/onboarding';
import { generate30DayResolution, MonthlyResolution } from '@/lib/monthlyResolutionEngine';
import { DailyLog, DEFAULT_MONTHLY_CYCLE } from '@/types/dailyLog';

export function executeCycleJudgment(current: DailyLog): {
  promoted: boolean;
  title: string;
  message: string;
  resolution: MonthlyResolution;
  updatedCycle: MonthlyCycleState;
} {
  const cycle = current.monthlyCycle || DEFAULT_MONTHLY_CYCLE;
  const path = current.legendaryPath || 'spartan';
  const userName = current.userName || 'Ciudadano Prokopton';

  const resolution = generate30DayResolution({
    dailyGrades: cycle.dailyGrades || [],
    path,
    userName,
    startDate: cycle.startDate,
    archetype: current.coachArchetype || 'stoic_mentor',
  });

  const isPromoted = resolution.promoted;
  const title = isPromoted
    ? '👑 ¡ASCENSO OTORGADO: SEMIDIÓS DEL OLIMPO!'
    : '💀 JUICIO ADVERSO: REPRENSIÓN POR MEDIOCRIDAD';
  const message = resolution.masterDecreeMarkdown;

  const updatedCycle: MonthlyCycleState = {
    ...cycle,
    isJudgmentReady: true,
    judgmentVerdict: isPromoted ? 'promoted' : 'scolded',
    judgmentText: isPromoted
      ? `Has completado el Ciclo de 30 Días con ${resolution.totalScoreAverage}% de excelencia (${resolution.victoriousDaysCount} días dignos). Tu rango asciende a ${resolution.tierAwarded}.`
      : `Tu promedio de disciplina fue de apenas ${resolution.totalScoreAverage}%. Tu rango queda en ${resolution.tierAwarded}. Deberás reiniciar con honor.`,
    resolutionMarkdown: resolution.masterDecreeMarkdown,
    tier: resolution.tierAwarded as any,
  };

  return {
    promoted: isPromoted,
    title,
    message,
    resolution,
    updatedCycle,
  };
}
