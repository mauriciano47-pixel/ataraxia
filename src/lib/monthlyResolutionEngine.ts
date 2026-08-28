import { LegendaryPath, LEGENDARY_PATHS, CoachArchetype, DailyGrade, DailyPillars } from '@/types/onboarding';

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

export function generate30DayResolution(params: {
  dailyGrades: DailyGrade[];
  path: LegendaryPath;
  userName: string;
  startDate: string;
  archetype?: CoachArchetype;
}): MonthlyResolution {
  const { dailyGrades, path, userName, startDate, archetype = 'stoic_mentor' } = params;
  const pathInfo = LEGENDARY_PATHS[path] || LEGENDARY_PATHS.spartan;
  const totalDays = 30;

  // 1. Mapeo y Normalización de los 30 Días (Auditoría Integral Día por Día)
  const dayAudits: DayAudit[] = [];
  let sumScore = 0;
  let victoriousDaysCount = 0;
  let divineDaysCount = 0;
  let failedDaysCount = 0;

  let countTraining = 0;
  let countSteps = 0;
  let countNutrition = 0;
  let countSleep = 0;
  let countStoic = 0;
  let countHeartRate = 0;
  let countCoach = 0;

  for (let d = 1; d <= totalDays; d++) {
    const existing = dailyGrades.find((g) => g.day === d) || dailyGrades[d - 1];
    
    if (existing) {
      const p = existing.pillars || {
        training: existing.trainingDone,
        steps: existing.stepsRatio >= 0.85,
        nutrition: existing.caloriesLogged,
        sleep: (existing.sleepHours || 0) >= 6.5,
        stoicChallenge: false,
        heartRate: (existing.heartRateBpm || 0) > 0,
        coachCheckIn: false,
      };

      const passedCount = Object.values(p).filter(Boolean).length;
      if (p.training) countTraining++;
      if (p.steps) countSteps++;
      if (p.nutrition) countNutrition++;
      if (p.sleep) countSleep++;
      if (p.stoicChallenge) countStoic++;
      if (p.heartRate) countHeartRate++;
      if (p.coachCheckIn) countCoach++;

      sumScore += existing.score;
      if (existing.score >= 90) divineDaysCount++;
      if (existing.score >= 75) victoriousDaysCount++;
      else failedDaysCount++;

      dayAudits.push({
        day: d,
        date: existing.date || `Día ${d}`,
        score: existing.score,
        status: existing.status,
        pillars: p,
        passedPillarsCount: passedCount,
        steps: existing.steps || 0,
        stepGoal: existing.stepGoal || 10000,
        sleepHours: existing.sleepHours || 7.0,
        cals: existing.totalCalories || 0,
        verdict: existing.verdict,
      });
    } else {
      // Día no registrado aún / omitido
      failedDaysCount++;
      dayAudits.push({
        day: d,
        date: `Día ${d}`,
        score: 0,
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
        passedPillarsCount: 0,
        steps: 0,
        stepGoal: 10000,
        sleepHours: 0,
        cals: 0,
        verdict: 'Día Omitido / Indigno: Sin registro de actividad en el Santuario.',
      });
    }
  }

  const totalScoreAverage = Math.round(sumScore / totalDays);
  const adherencePct = Math.round((victoriousDaysCount / totalDays) * 100);
  const isPromoted = adherencePct >= 80 || totalScoreAverage >= 75;

  let tierAwarded = 'Novicio de Esparta';
  if (totalScoreAverage >= 90 && adherencePct >= 90) {
    tierAwarded = 'Semidiós del Olimpo';
  } else if (isPromoted) {
    tierAwarded = 'Guerrero de Élite';
  } else if (totalScoreAverage >= 60) {
    tierAwarded = 'Hoplita Probado';
  }

  const pillarAdherence = {
    trainingPct: Math.round((countTraining / totalDays) * 100),
    stepsPct: Math.round((countSteps / totalDays) * 100),
    nutritionPct: Math.round((countNutrition / totalDays) * 100),
    sleepPct: Math.round((countSleep / totalDays) * 100),
    stoicReadingPct: Math.round((countStoic / totalDays) * 100),
    heartRatePct: Math.round((countHeartRate / totalDays) * 100),
    coachCheckInPct: Math.round((countCoach / totalDays) * 100),
  };

  // 2. Generación de Felicitaciones & Elogios Detallados
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
    praises.push(`🏛️ **Persistencia en el Comienzo**: Diste el paso al aceptar el pacto de 30 días en la ${pathInfo.name}. El fuego sagrado ha sido encendido.`);
  }

  // 3. Generación de Llamadas de Atención & Reprensión Estoica
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

  // 4. Conclusiones y Patrones Clave
  const keyInsights: string[] = [
    `📊 Adherencia Total al Juicio: **${adherencePct}%** (${victoriousDaysCount} días dignos de 30).`,
    `⚡ Promedio General de Disciplina: **${totalScoreAverage}/100 pts**.`,
    `🛡️ Pilar más Fuerte: ${getPillarLeader(pillarAdherence, true)}.`,
    `⚠️ Pilar a Fortalecer: ${getPillarLeader(pillarAdherence, false)}.`,
  ];

  // 5. Prescripción Táctica para el Próximo Ciclo (según la Senda)
  const nextCycleDirectives: string[] = [];
  if (path === 'spartan') {
    nextCycleDirectives.push('1. **Sobrecarga Progresiva RIR 1-2**: Incrementa un 2.5% a 5% la carga en sentadilla trasera y press olímpico.');
    nextCycleDirectives.push('2. **Densidad Proteica**: Asegura 2.2g de proteína por kg de peso en cada uno de los 30 días.');
    nextCycleDirectives.push('3. **Descanso Neurovegetativo**: No negocies las 7.5h de sueño para permitir la hipertrofia miofibrilar.');
  } else if (path === 'apollo') {
    nextCycleDirectives.push('1. **Déficit Limpio & V-Taper**: Mantén el déficit moderado de -350 kcal con énfasis en deltoides laterales y dorsal ancho.');
    nextCycleDirectives.push('2. **Cadencia 3-1-1**: Controla la fase excéntrica en cada repetición para maximizar la tensión mecánica.');
    nextCycleDirectives.push('3. **Caminata Zona 2**: 10,000 pasos innegociables para quemar grasa visceral sin elevar el cortisol.');
  } else if (path === 'hoplite') {
    nextCycleDirectives.push('1. **Capacidad Mitocondrial**: Realiza 3 sesiones de cardio Zona 2 de 40 minutos semanales.');
    nextCycleDirectives.push('2. **Movilidad Articular**: Dedica 10 minutos de movilidad de cadera y tobillo antes de cada circuito.');
    nextCycleDirectives.push('3. **Hidratación Electrolítica**: Mantén un mínimo de 3.0L de agua con sal marina no refinada.');
  } else {
    nextCycleDirectives.push('1. **Dominio del Peso Propio**: Perfecciona la postura en anillas y dominadas sin ningún impulso tramposo.');
    nextCycleDirectives.push('2. **Ventana de Ayuno 16/8**: Consolida la claridad mental entrenando en ayunas cuando el horario lo permita.');
    nextCycleDirectives.push('3. **Examen de Conciencia**: 5 minutos de diario estoico nocturno para vaciar el juicio de toda queja.');
  }

  // 6. Redacción del Gran Decreto Magistral en Markdown
  const nowFormatted = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const masterDecreeMarkdown = `
# 🏛️ RESOLUCIÓN OFICIAL DEL JUICIO DE LOS 30 DÍAS
**Santuario de Ataraxia • Tribunal del Olimpo**
*Otorgado a ${userName.toUpperCase()} • Senda del ${pathInfo.name.toUpperCase()}*
*Fecha de Veredicto: ${nowFormatted}*

---

### 👑 VEREDICTO SAGRADO & ASCENSO
* **Rango Otorgado:** **${tierAwarded.toUpperCase()}**
* **Veredicto Final:** ${isPromoted ? '⚔️ **APROBADO CON HONOR MILITAR**' : '💀 **REPRENSIÓN POR MEDIOCRIDAD (REINICIO OBLIGATORIO)**'}
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

### 🔮 DIRECTIVA DEL MENTOR PARA EL PRÓXIMO CICLO
${nextCycleDirectives.map((d) => `${d}`).join('\n\n')}

---
*«No expliques tu filosofía; encárnala en tus actos cada uno de los 30 días venideros.»* — **Epicteto**
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
