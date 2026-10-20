import { useMemo } from 'react';
import { DailyLog, useDailyLog, useWeekHistory } from './useDailyLog';
import { getLocalTodayDateString } from '@/utils/dateUtils';
import { SafeStorage } from '@/utils/safeStorage';

export interface CoachPatterns {
  skippedTrainingStreak: number;
  avgWeeklyRpe: number | null;
  needsDeload: boolean;
  calorieAdherence: number | null;
  activeStreak: number;
  undereating: boolean;
  showsFatigue: boolean;
  poorDeepSleep: boolean;
  highSoreness: boolean;
}

export interface CoachContext {
  today: DailyLog;
  weekLogs: (DailyLog & { date: string })[];
  patterns: CoachPatterns;
  contextSummary: string;
  loading: boolean;
}

const PATH_LABELS: Record<string, string> = {
  spartan: '⚔️ SENDA DEL ESPARTANO (Fuerza Bruta & Hipertrofia Pesada)',
  hoplite: '🛡️ SENDA DEL HOPLITA (Resistencia Mitocondrial & Longevidad)',
  apollo: '⚡ SENDA DE APOLO (Estética Divina & V-Taper)',
  philosopher: '🧘‍♂️ SENDA DEL FILÓSOFO GUERRERO (Calistenia & Dominio Mente-Cuerpo)',
};

const ARCHETYPE_LABELS: Record<string, string> = {
  spartan_commander: 'Comandante Espartano ⚔️',
  sports_scientist: 'Fisiólogo & Científico Deportivo 🔬',
  stoic_mentor: 'Mentor Sabio Estoico 🏛️',
};

const FOCUS_LABELS: Record<string, string> = {
  strength: 'Fuerza & Hipertrofia Muscular',
  fat_loss: 'Recomposición Corporal & Quema Grasa',
  longevity: 'Salud Metabólica & Resistencia',
  mental_clarity: 'Claridad Mental & Templanza',
};

const EQUIPMENT_LABELS: Record<string, string> = {
  gym: 'Gimnasio Comercial Completo (Barras, Máquinas, Poleas)',
  home_dumbbell: 'Mancuernas y Banco en Casa',
  bodyweight: 'Calistenia (Barra de dominadas y Peso Corporal)',
};

function computeCoachPatterns(
  log: DailyLog,
  weekLogs: (DailyLog & { date: string })[],
  sleepRecord: any
): CoachPatterns {
  let skippedTrainingStreak = 0;
  for (let i = weekLogs.length - 1; i >= 0; i--) {
    if (!weekLogs[i].trainingCompleted) skippedTrainingStreak++;
    else break;
  }
  if (!log.trainingCompleted) {
    const today = getLocalTodayDateString();
    const lastLogDate = weekLogs.length > 0 ? weekLogs[weekLogs.length - 1].date : null;
    if (lastLogDate !== today) skippedTrainingStreak++;
  }

  const logsWithEnergy = weekLogs.filter((l) => l.energyLevel != null);
  const avgWeeklyRpe = logsWithEnergy.length > 0
    ? logsWithEnergy.reduce((acc, l) => acc + (l.energyLevel || 0), 0) / logsWithEnergy.length
    : null;

  const targetCals = log.targetCalories || 2100;
  const logsWithCalories = weekLogs.filter((l) => l.totalCalories > 0);
  const calorieAdherence = logsWithCalories.length > 0
    ? logsWithCalories.reduce((acc, l) => acc + l.totalCalories, 0) / (logsWithCalories.length * targetCals)
    : null;

  let activeStreak = 0;
  for (let i = weekLogs.length - 1; i >= 0; i--) {
    if (weekLogs[i].trainingCompleted) activeStreak++;
    else break;
  }
  if (log.trainingCompleted) activeStreak++;

  const readinessSoreness = log.readinessScore?.soreness || 0;
  const readinessStress = log.readinessScore?.stress || 0;
  const showsFatigue = Boolean(
    (log.energyLevel != null && log.energyLevel <= 2) ||
    (log.sleepQuality != null && log.sleepQuality <= 2) ||
    (log.readinessScore != null && log.readinessScore.total < 60)
  );

  return {
    skippedTrainingStreak,
    avgWeeklyRpe,
    needsDeload: (avgWeeklyRpe !== null && avgWeeklyRpe >= 4) || readinessStress >= 8,
    calorieAdherence,
    activeStreak,
    undereating: calorieAdherence !== null && calorieAdherence < 0.7,
    showsFatigue,
    poorDeepSleep: Boolean(sleepRecord?.deepHours != null && sleepRecord.deepHours < 1.0),
    highSoreness: readinessSoreness >= 7,
  };
}

function appendProfileAndBiometrics(lines: string[], log: DailyLog): void {
  const athleteName = log.userName && log.userName !== 'Ciudadano Prokopton' ? log.userName : 'Guerrero Prokopton';
  lines.push('=== FICHA MAESTRA DEL ATLETA PROKOPTON ===');
  lines.push(`Nombre: ${athleteName}`);
  lines.push(`Senda Legendaria: ${PATH_LABELS[log.legendaryPath || ''] || PATH_LABELS.philosopher}`);
  lines.push(`Pacto de 30 Días: Día ${log.monthlyCycle?.currentDay || 1}/30 | Rango: ${log.monthlyCycle?.tier || 'Novicio de Esparta'}`);
  lines.push(`Arquetipo de Mentor Activo: ${ARCHETYPE_LABELS[log.coachArchetype || ''] || ARCHETYPE_LABELS.stoic_mentor}`);

  const p = log.prokoptonProfile;
  if (p) {
    const expMap: Record<string, string> = {
      beginner: 'Novato / Principiante',
      intermediate: 'Intermedio con base técnica',
      advanced: 'Avanzado / Veterano',
    };
    lines.push(`Nivel del Practicante: ${expMap[p.experienceLevel || ''] || expMap.advanced}`);
    lines.push(`Enfoque Principal: ${FOCUS_LABELS[p.focus] || FOCUS_LABELS.mental_clarity}`);
    lines.push(`Equipamiento Disponible: ${EQUIPMENT_LABELS[p.equipment] || EQUIPMENT_LABELS.bodyweight}`);
    lines.push(`Compromiso Semanal: ${p.daysPerWeek} días/semana | ${p.sessionDurationMinutes} min por sesión`);
    lines.push(`Preferencia Nutricional: ${p.dietPreference || 'Equilibrada de Alta Densidad'}`);
    lines.push(`Biometría: Edad ${p.age} años | Género: ${p.gender || 'No especificado'} | Peso Actual: ${p.weightKg} kg | Meta: ${p.targetWeightKg} kg | Altura: ${p.heightCm} cm`);

    const injuryZone = p.injuryCare && p.injuryCare !== 'none' ? p.injuryCare : null;
    const hasZones = p.protectedZones && p.protectedZones.length > 0 && !p.protectedZones.includes('none' as any);
    const zonesList = hasZones ? p.protectedZones!.join(', ') : (injuryZone || 'Ninguna lesión reportada');
    lines.push(`⚠️ CUIDADO ARTICULAR / ZONAS A PROTEGER: ${zonesList.toUpperCase()}`);
    return;
  }

  if (log.userMetrics) {
    lines.push(`Biometría: Edad ${log.userMetrics.age} años | Peso ${log.userMetrics.weightKg} kg | Altura ${log.userMetrics.heightCm} cm | Objetivo: ${log.userMetrics.goal}`);
  }
}

function appendSleepAndReadiness(lines: string[], log: DailyLog, sleepRecord: any): void {
  if (sleepRecord) {
    lines.push('');
    lines.push('=== ARQUITECTURA DEL SUEÑO & RECUPERACIÓN NOCTURNA ===');
    lines.push(`Total de Sueño: ${sleepRecord.totalHours || 7.5} horas | Eficiencia: ${sleepRecord.efficiencyPct || 92}%`);
    const deepTag = sleepRecord.deepHours && sleepRecord.deepHours >= 1.5 ? '👑 Excelente regeneración hormonal' : '⚠️ Regeneración lenta';
    lines.push(`Sueño Profundo (Fase 4 Anabólica): ${sleepRecord.deepHours || 1.8}h ${deepTag}`);
    lines.push(`Sueño REM (SNC y Mente): ${sleepRecord.remHours || 1.6}h | Ligero: ${sleepRecord.lightHours || 4.1}h`);
    if (sleepRecord.restingBpm) lines.push(`Frecuencia Cardíaca Mínima en Reposo: ${sleepRecord.restingBpm} BPM`);
    if (sleepRecord.hrvMs) {
      const hrvTag = sleepRecord.hrvMs >= 55 ? '(Tono vagal óptimo)' : '(SNC en estrés)';
      lines.push(`Variabilidad de Frecuencia Cardíaca (VFC / HRV): ${sleepRecord.hrvMs} ms ${hrvTag}`);
    }
  }

  if (log.readinessScore) {
    lines.push('');
    lines.push('=== DISPONIBILIDAD DEL SISTEMA NERVIOSO CENTRAL (READINESS) ===');
    const rTotal = log.readinessScore.total;
    const rTag = rTotal >= 80 ? '⚡ Alta capacidad de carga' : rTotal >= 60 ? '🛡️ Capacidad media' : '⚠️ Fatiga central / Priorizar técnica';
    lines.push(`Índice de Preparación del SNC: ${rTotal}% ${rTag}`);
    lines.push(`Dolor Muscular (Soreness): ${log.readinessScore.soreness}/10 | Estrés Percibido: ${log.readinessScore.stress}/10 | Calidad de Sueño: ${log.readinessScore.sleep}/10`);
  } else if (log.checkInDone) {
    lines.push(`Check-in Subjetivo: Energía ${log.energyLevel}/5 | Sueño ${log.sleepQuality}/5`);
  }
}

function appendNutritionAndTraining(lines: string[], log: DailyLog): void {
  lines.push('');
  lines.push('=== NUTRICIÓN Y BALANCE CALÓRICO HOY ===');
  const targetCals = log.targetCalories || 2200;
  const remainingCals = Math.max(0, targetCals - (log.totalCalories || 0));
  lines.push(`Calorías Ingeridas: ${log.totalCalories} kcal / Meta: ${targetCals} kcal (Restan ${remainingCals} kcal)`);
  lines.push(`Comidas Registradas: ${log.mealsLogged} ingestas`);
  if (log.macros) {
    const userWeight = log.prokoptonProfile?.weightKg || log.userMetrics?.weightKg || 75;
    const mult = log.legendaryPath === 'spartan' || log.legendaryPath === 'apollo' ? 2.2 : 1.8;
    const targetProtein = Math.round(userWeight * mult);
    const remainingProtein = Math.max(0, targetProtein - log.macros.protein);
    lines.push(`Macronutrientes: Proteína: ${log.macros.protein}g (Meta diaria: ${targetProtein}g | Faltan: ${remainingProtein}g), Carbos: ${log.macros.carbs}g, Grasas: ${log.macros.fats}g`);
  }
  if (log.lastNutrientDensityScore != null) {
    lines.push(`Última Comida Analizada por IA: Densidad Nutricional ${log.lastNutrientDensityScore}/10 | Veredicto: ${log.lastNutrientVerdict || 'Balanceada'}`);
  }

  lines.push('');
  lines.push('=== ENTRENAMIENTO Y ESTÍMULO MECÁNICO HOY ===');
  lines.push(`Estado del Entrenamiento: ${log.trainingCompleted ? '🏆 COMPLETADO CON ÉXITO' : '⏳ PENDIENTE POR REALIZAR'}`);
  if (log.effectiveSets && log.effectiveSets > 0) {
    lines.push(`Series Efectivas (RPE >= 7): ${log.effectiveSets} series registradas`);
  }
  if (log.customRoutine && log.customRoutine.length > 0) {
    lines.push('Rutina en Ejecución:');
    log.customRoutine.forEach((ex, idx) => {
      const status = ex.done ? '✓ HECHO' : '○ PENDIENTE';
      const rpeStr = ex.rpe != null ? ` [RPE ${ex.rpe}]` : '';
      const muscleStr = ex.muscleGroup ? ` (${ex.muscleGroup})` : '';
      lines.push(`  ${idx + 1}. ${ex.n} - ${ex.s}${muscleStr} | ${status}${rpeStr}`);
    });
  }
}

function appendAlertsAndHistory(
  lines: string[],
  patterns: CoachPatterns,
  weekLogs: (DailyLog & { date: string })[]
): void {
  lines.push('');
  lines.push('=== PATRONES & ALERTAS DETECTADAS ===');
  if (patterns.skippedTrainingStreak >= 2) {
    lines.push(`⚠️ ALERTA: El usuario lleva ${patterns.skippedTrainingStreak} días sin registrar entrenamiento.`);
  }
  if (patterns.needsDeload) {
    lines.push('⚠️ ALERTA: Fatiga acumulada o estrés alto. Recomendar autorregulación, RIR 2-3 o sesión de movilidad.');
  }
  if (patterns.poorDeepSleep) {
    lines.push('⚠️ ALERTA: Sueño profundo insuficiente anoche (<1.0h). Sugerir siesta estratégica o magnesio nocturno.');
  }
  if (patterns.highSoreness) {
    lines.push('⚠️ ALERTA: Dolor muscular elevado (DOMS >= 7/10). Enfatizar calentamiento dinámico y no forzar articulaciones.');
  }
  if (patterns.activeStreak >= 3) {
    lines.push(`✅ Racha de Constancia: ${patterns.activeStreak} días consecutivos cumpliendo.`);
  }
  if (patterns.calorieAdherence !== null) {
    lines.push(`Adherencia Calórica Semanal: ${Math.round(patterns.calorieAdherence * 100)}%`);
  }

  if (weekLogs.length > 0) {
    lines.push('');
    lines.push('=== HISTORIAL DE LOS ÚLTIMOS DÍAS ===');
    weekLogs.forEach((l) => {
      const trained = l.trainingCompleted ? '✓ Entrenó' : '✗ Sin entreno';
      const cals = l.totalCalories > 0 ? `${l.totalCalories} kcal` : 'Sin registro';
      const steps = l.steps ? `${l.steps.toLocaleString()} pasos` : '0 pasos';
      lines.push(`• ${l.date}: ${trained} | ${cals} | ${steps}`);
    });
  }
}

export function useCoachContext(): CoachContext {
  const { log, loading: loadingToday } = useDailyLog();
  const { weekLogs, loadingWeek } = useWeekHistory(7);

  const sleepRecord = useMemo(() => {
    try {
      const raw = SafeStorage.getItem('ataraxia_sleep_record_v1');
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }, []);

  const patterns = useMemo<CoachPatterns>(
    () => computeCoachPatterns(log, weekLogs, sleepRecord),
    [log, weekLogs, sleepRecord]
  );

  const contextSummary = useMemo(() => {
    const lines: string[] = [];
    appendProfileAndBiometrics(lines, log);

    lines.push('');
    lines.push('=== TELEMETRÍA Y BIOMARCADORES DE HOY ===');
    const currentSteps = log.steps || 0;
    const currentStepGoal = log.stepGoal || 10000;
    const stepKm = (currentSteps * 0.00078).toFixed(2);
    const stepCals = Math.round(currentSteps * 0.045);
    lines.push(`Pasos Activos: ${currentSteps.toLocaleString()} / ${currentStepGoal.toLocaleString()} pasos (${stepKm} km recorridos | ~${stepCals} kcal quemadas por NeAT)`);
    lines.push(`Hidratación: ${log.waterLitres.toFixed(1)}L consumidos (meta: 3.0L) | ${log.waterLitres >= 2.5 ? '✅ Óptima' : '⚠️ Requiere hidratar'}`);

    if (log.smartDevice?.connected) {
      lines.push(`Smartwatch Vinculado: ${log.smartDevice.deviceName} | Frecuencia Cardíaca en Vivo: ${log.smartDevice.heartRateBpm} BPM | Batería: ${log.smartDevice.batteryLevel || 100}%`);
    }

    appendSleepAndReadiness(lines, log, sleepRecord);
    appendNutritionAndTraining(lines, log);
    appendAlertsAndHistory(lines, patterns, weekLogs);

    return lines.join('\n');
  }, [log, patterns, weekLogs, sleepRecord]);

  return {
    today: log,
    weekLogs,
    patterns,
    contextSummary,
    loading: loadingToday || loadingWeek,
  };
}
