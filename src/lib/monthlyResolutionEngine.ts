import { COACH_ARCHETYPES, getLegendaryPathInfo } from '../types/onboarding.ts';
import type { LegendaryPath, CoachArchetype, DailyGrade, DailyPillars } from '../types/onboarding.ts';

export interface DayAudit {
  day: number;
  date: string;
  score: number;
  status: 'divine' | 'worthy' | 'mediocre' | 'failed';
  pillars: DailyPillars;
  passedPillarsCount: number;
  steps: number;
  stepGoal: number;
  sleepHours: number;
  cals: number;
  verdict: string;
}

export interface MonthlyResolution {
  cycleDays: number;
  startDate: string;
  endDate: string;
  path: LegendaryPath;
  userName: string;
  tierAwarded: string;
  promoted: boolean;
  totalScoreAverage: number;
  victoriousDaysCount: number;
  failedDaysCount: number;
  divineDaysCount: number;
  adherencePct: number;
  pillarAdherence: {
    trainingPct: number;
    stepsPct: number;
    nutritionPct: number;
    sleepPct: number;
    stoicReadingPct: number;
    heartRatePct: number;
    coachCheckInPct: number;
  };
  dayAudits: DayAudit[];
  praises: string[];
  scoldings: string[];
  keyInsights: string[];
  nextCycleDirectives: string[];
  masterDecreeMarkdown: string;
}

const EMPTY_PILLARS: DailyPillars = {
  training: false,
  steps: false,
  nutrition: false,
  sleep: false,
  stoicChallenge: false,
  heartRate: false,
  coachCheckIn: false,
};

function normalizeDayAudit(d: number, existing?: DailyGrade): DayAudit {
  if (!existing) {
    return {
      day: d,
      date: `Día ${d}`,
      score: 0,
      status: 'failed',
      pillars: { ...EMPTY_PILLARS },
      passedPillarsCount: 0,
      steps: 0,
      stepGoal: 10000,
      sleepHours: 0,
      cals: 0,
      verdict: 'Día Omitido / Indigno: Sin registro de actividad en el Santuario.',
    };
  }

  const p: DailyPillars = existing.pillars || {
    training: existing.trainingDone,
    steps: existing.stepsRatio >= 0.85,
    nutrition: existing.caloriesLogged,
    sleep: (existing.sleepHours || 0) >= 6.5,
    stoicChallenge: false,
    heartRate: (existing.heartRateBpm || 0) > 0,
    coachCheckIn: false,
  };

  return {
    day: d,
    date: existing.date || `Día ${d}`,
    score: existing.score,
    status: existing.status,
    pillars: p,
    passedPillarsCount: Object.values(p).filter(Boolean).length,
    steps: existing.steps || 0,
    stepGoal: existing.stepGoal || 10000,
    sleepHours: existing.sleepHours || 7.0,
    cals: existing.totalCalories || 0,
    verdict: existing.verdict,
  };
}

function resolveTierAwarded(totalScoreAverage: number, adherencePct: number, isPromoted: boolean): string {
  if (totalScoreAverage >= 90 && adherencePct >= 90) return 'Semidiós del Olimpo';
  if (isPromoted) return 'Guerrero de Élite';
  if (totalScoreAverage >= 60) return 'Hoplita Probado';
  return 'Novicio de Esparta';
}

function buildPraises(
  divineDaysCount: number,
  pillarAdherence: MonthlyResolution['pillarAdherence'],
  countSleep: number,
  pathName: string
): string[] {
  const praises: string[] = [];
  if (divineDaysCount > 0) {
    praises.push(`🏆 **${divineDaysCount} Días de Semidiós (100% Impecables)**: Conquistaste los 7 pilares sagrados sin ninguna concesión a la debilidad.`);
  }
  if (pillarAdherence.trainingPct >= 75) {
    praises.push(`⚔️ **Fuerza Inquebrantable en la Senda**: Cumpliste el entrenamiento marcial en el ${pillarAdherence.trainingPct}% del ciclo.`);
  }
  if (pillarAdherence.sleepPct >= 70) {
    praises.push(`🌙 **Descanso Anabólico Superior**: Mantuviste un sueño profundo y reparador en ${countSleep} de los 30 días.`);
  }
  if (pillarAdherence.stepsPct >= 80) {
    praises.push(`👟 **Motor NeAT Incansable**: Cumpliste la meta de movilidad y pasos en el ${pillarAdherence.stepsPct}% del programa.`);
  }
  if (praises.length === 0) {
    praises.push(`🏛️ **Persistencia en el Comienzo**: Diste el paso al aceptar el pacto de 30 días en la ${pathName}. El fuego sagrado ha sido encendido.`);
  }
  return praises;
}

function buildScoldings(
  failedDaysCount: number,
  pillarAdherence: MonthlyResolution['pillarAdherence']
): string[] {
  const scoldings: string[] = [];
  if (failedDaysCount > 6) {
    scoldings.push(`💀 **${failedDaysCount} Días Indignos Acumulados**: Dejaste ${failedDaysCount} días en deuda con el templo. La holgazanería y la dispersión mental dañaron tu promedio.`);
  }
  if (pillarAdherence.nutritionPct < 60) {
    scoldings.push(`🍽️ **Negligencia Nutricional**: Solo registraste tus comidas el ${pillarAdherence.nutritionPct}% del tiempo. Un guerrero que no mide su combustible entrena a ciegas.`);
  }
  if (pillarAdherence.heartRatePct < 50) {
    scoldings.push(`🫀 **Omisión de Telemetría Cardíaca**: Olvidaste medir tu frecuencia cardíaca y HRV en más de la mitad del ciclo.`);
  }
  if (pillarAdherence.coachCheckInPct < 50) {
    scoldings.push(`🏛️ **Desconexión con el Mentor**: Omitiste los check-ins de preparación del SNC matutinos. El sabio siempre examina su estado antes de la batalla.`);
  }
  if (scoldings.length === 0) {
    scoldings.push(`⚖️ **Rigor Permanente**: Mantuviste la guardia alta durante todo el ciclo sin fallos graves. No bajes el escudo.`);
  }
  return scoldings;
}

const DIRECTIVES_BY_PATH: Record<LegendaryPath, string[]> = {
  spartan: [
    '1. **Sobrecarga Progresiva RIR 1-2**: Incrementa un 2.5% a 5% la carga en sentadilla trasera y press olímpico.',
    '2. **Densidad Proteica**: Asegura 2.2g de proteína por kg de peso en cada uno de los 30 días.',
    '3. **Descanso Neurovegetativo**: No negocies las 7.5h de sueño para permitir la hipertrofia miofibrilar.',
  ],
  apollo: [
    '1. **Déficit Limpio & V-Taper**: Mantén el déficit moderado de -350 kcal con énfasis en deltoides laterales y dorsal ancho.',
    '2. **Cadencia 3-1-1**: Controla la fase excéntrica en cada repetición para maximizar la tensión mecánica.',
    '3. **Caminata Zona 2**: 10,000 pasos innegociables para quemar grasa visceral sin elevar el cortisol.',
  ],
  hoplite: [
    '1. **Capacidad Mitocondrial**: Realiza 3 sesiones de cardio Zona 2 de 40 minutos semanales.',
    '2. **Movilidad Articular**: Dedica 10 minutos de movilidad de cadera y tobillo antes de cada circuito.',
    '3. **Hidratación Electrolítica**: Mantén un mínimo de 3.0L de agua con sal marina no refinada.',
  ],
  philosopher: [
    '1. **Dominio del Peso Propio**: Perfecciona la postura en anillas y dominadas sin ningún impulso tramposo.',
    '2. **Ventana de Ayuno 16/8**: Consolida la claridad mental entrenando en ayunas cuando el horario lo permita.',
    '3. **Examen de Conciencia**: 5 minutos de diario estoico nocturno para vaciar el juicio de toda queja.',
  ],
};

export function generate30DayResolution(params: {
  dailyGrades: DailyGrade[];
  path: LegendaryPath;
  userName: string;
  startDate: string;
  archetype?: CoachArchetype;
}): MonthlyResolution {
  const { dailyGrades, path, userName, startDate, archetype = 'stoic_mentor' } = params;
  const pathInfo = getLegendaryPathInfo(path);
  const coachInfo = COACH_ARCHETYPES[archetype] || COACH_ARCHETYPES.stoic_mentor;
  const totalDays = 30;

  const dayAudits: DayAudit[] = [];
  for (let d = 1; d <= totalDays; d++) {
    const existing = dailyGrades.find((g) => g.day === d) || dailyGrades[d - 1];
    dayAudits.push(normalizeDayAudit(d, existing));
  }

  const sumScore = dayAudits.reduce((acc, a) => acc + a.score, 0);
  const divineDaysCount = dayAudits.filter((a) => a.score >= 90).length;
  const victoriousDaysCount = dayAudits.filter((a) => a.score >= 75).length;
  const failedDaysCount = totalDays - victoriousDaysCount;

  const countTraining = dayAudits.filter((a) => a.pillars.training).length;
  const countSteps = dayAudits.filter((a) => a.pillars.steps).length;
  const countNutrition = dayAudits.filter((a) => a.pillars.nutrition).length;
  const countSleep = dayAudits.filter((a) => a.pillars.sleep).length;
  const countStoic = dayAudits.filter((a) => a.pillars.stoicChallenge).length;
  const countHeartRate = dayAudits.filter((a) => a.pillars.heartRate).length;
  const countCoach = dayAudits.filter((a) => a.pillars.coachCheckIn).length;

  const totalScoreAverage = Math.round(sumScore / totalDays);
  const adherencePct = Math.round((victoriousDaysCount / totalDays) * 100);
  const isPromoted = adherencePct >= 80 || totalScoreAverage >= 75;
  const tierAwarded = resolveTierAwarded(totalScoreAverage, adherencePct, isPromoted);

  const pillarAdherence = {
    trainingPct: Math.round((countTraining / totalDays) * 100),
    stepsPct: Math.round((countSteps / totalDays) * 100),
    nutritionPct: Math.round((countNutrition / totalDays) * 100),
    sleepPct: Math.round((countSleep / totalDays) * 100),
    stoicReadingPct: Math.round((countStoic / totalDays) * 100),
    heartRatePct: Math.round((countHeartRate / totalDays) * 100),
    coachCheckInPct: Math.round((countCoach / totalDays) * 100),
  };

  const praises = buildPraises(divineDaysCount, pillarAdherence, countSleep, pathInfo.name);
  const scoldings = buildScoldings(failedDaysCount, pillarAdherence);
  const nextCycleDirectives = DIRECTIVES_BY_PATH[path] || DIRECTIVES_BY_PATH.philosopher;

  const keyInsights: string[] = [
    `📊 Adherencia Total al Juicio: **${adherencePct}%** (${victoriousDaysCount} días dignos de 30).`,
    `⚡ Promedio General de Disciplina: **${totalScoreAverage}/100 pts**.`,
    `🛡️ Pilar más Fuerte: ${getPillarLeader(pillarAdherence, true)}.`,
    `⚠️ Pilar a Fortalecer: ${getPillarLeader(pillarAdherence, false)}.`,
  ];

  const nowFormatted = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const verdictLine = isPromoted
    ? '⚔️ **APROBADO CON HONOR MILITAR**'
    : '💀 **REPRENSIÓN POR MEDIOCRIDAD (REINICIO OBLIGATORIO)**';

  const masterDecreeMarkdown = `
# 🏛️ RESOLUCIÓN OFICIAL DEL JUICIO DE LOS 30 DÍAS
**Santuario de Ataraxia • Tribunal del Olimpo**
*Otorgado a ${userName.toUpperCase()} • Senda del ${pathInfo.name.toUpperCase()}*
*Fecha de Veredicto: ${nowFormatted}*

---

### 👑 VEREDICTO SAGRADO & ASCENSO
* **Rango Otorgado:** **${tierAwarded.toUpperCase()}**
* **Veredicto Final:** ${verdictLine}
* **Puntuación Promedio:** **${totalScoreAverage}/100 Puntos**
* **Adherencia Total:** **${adherencePct}%** (${victoriousDaysCount} días dignos / ${failedDaysCount} días en deuda)

> *«${pathInfo.motto}»*

---

### 🎖️ FELICITACIONES & MÉRITOS CONQUISTADOS
${praises.map((p) => `- ${p}`).join('\n')}

---

### ⚔️ LLAMADAS DE ATENCIÓN & VICIOS A ERRADICAR
${scoldings.map((s) => `- ${s}`).join('\n')}

---

### 📊 BALANCE DE LOS 7 PILARES SAGRADOS (30 DÍAS)
* ⚔️ **Entrenamiento Marcial:** ${pillarAdherence.trainingPct}% (${countTraining}/30 días)
* 👟 **Pasos & Movilidad NeAT:** ${pillarAdherence.stepsPct}% (${countSteps}/30 días)
* 🍽️ **Nutrición & Balance Calórico:** ${pillarAdherence.nutritionPct}% (${countNutrition}/30 días)
* 🌙 **Calidad de Sueño Anabólico:** ${pillarAdherence.sleepPct}% (${countSleep}/30 días)
* 📜 **Lectura & Reto Estoico:** ${pillarAdherence.stoicReadingPct}% (${countStoic}/30 días)
* 🫀 **Medición de Latidos & Telemetría:** ${pillarAdherence.heartRatePct}% (${countHeartRate}/30 días)
* 🏛️ **Reporte al Coach & Check-in SNC:** ${pillarAdherence.coachCheckInPct}% (${countCoach}/30 días)

---

### 🔮 DIRECTIVA DEL ${coachInfo.name.toUpperCase()} PARA EL PRÓXIMO CICLO
${nextCycleDirectives.join('\n\n')}

---
*«${coachInfo.tagline} — No expliques tu filosofía; encárnala en tus actos cada uno de los 30 días venideros.»* — **${coachInfo.name}**
`.trim();

  return {
    cycleDays: totalDays,
    startDate,
    endDate: nowFormatted,
    path,
    userName,
    tierAwarded,
    promoted: isPromoted,
    totalScoreAverage,
    victoriousDaysCount,
    failedDaysCount,
    divineDaysCount,
    adherencePct,
    pillarAdherence,
    dayAudits,
    praises,
    scoldings,
    keyInsights,
    nextCycleDirectives,
    masterDecreeMarkdown,
  };
}

function getPillarLeader(adherence: Record<string, number>, best: boolean): string {
  const names: Record<string, string> = {
    trainingPct: 'Entrenamiento Marcial',
    stepsPct: 'Pasos & Movilidad',
    nutritionPct: 'Nutrición & Macros',
    sleepPct: 'Calidad de Sueño',
    stoicReadingPct: 'Lectura Estoica',
    heartRatePct: 'Telemetría Cardíaca',
    coachCheckInPct: 'Check-in del Coach',
  };

  const entries = Object.entries(adherence);
  entries.sort((a, b) => (best ? b[1] - a[1] : a[1] - b[1]));
  const [key, val] = entries[0];
  return `${names[key]} (${val}%)`;
}
