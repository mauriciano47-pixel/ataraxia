import { useMemo } from 'react';
import { DailyLog, useDailyLog, useWeekHistory } from './useDailyLog';
import { getLocalTodayDateString } from '@/utils/dateUtils';
import { SafeStorage } from '@/utils/safeStorage';

/**
 * Patrones de comportamiento detectados automáticamente
 * para que el coach pueda dar respuestas contextuales y asertivas.
 */
export interface CoachPatterns {
  /** El usuario no ha entrenado en 2+ días consecutivos */
  skippedTrainingStreak: number;
  /** RPE promedio de la semana (si hay datos) */
  avgWeeklyRpe: number | null;
  /** ¿Necesita semana de descarga? (RPE > 8.5) */
  needsDeload: boolean;
  /** Calorías promedio vs objetivo (ratio) */
  calorieAdherence: number | null;
  /** Racha activa de días con entreno */
  activeStreak: number;
  /** ¿Comió consistentemente bajo el objetivo? */
  undereating: boolean;
  /** ¿El check-in de energía/sueño indica fatiga? */
  showsFatigue: boolean;
  /** ¿El sueño profundo fue deficiente (< 1h)? */
  poorDeepSleep: boolean;
  /** ¿El dolor muscular es elevado (>= 7/10)? */
  highSoreness: boolean;
}

export interface CoachContext {
  /** Datos del día actual */
  today: DailyLog;
  /** Historial de la última semana */
  weekLogs: (DailyLog & { date: string })[];
  /** Patrones detectados */
  patterns: CoachPatterns;
  /** Resumen en texto plano para inyectar en el prompt */
  contextSummary: string;
  /** ¿Está cargando los datos? */
  loading: boolean;
}

/**
 * Hook que construye el contexto maestro y exhaustivo del coach estoico.
 * Recopila todos los datos biométricos, sueño, telemetría, nutrición,
 * rutina activa, zonas protegidas y hábitos del atleta Prokopton.
 */
export function useCoachContext(): CoachContext {
  const { log, loading: loadingToday } = useDailyLog();
  const { weekLogs, loadingWeek } = useWeekHistory(7);

  // Leer registro profundo de sueño persistido en SafeStorage si existe
  const sleepRecord = useMemo(() => {
    try {
      const raw = SafeStorage.getItem('ataraxia_sleep_record_v1');
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return null;
  }, []);

  const patterns = useMemo<CoachPatterns>(() => {
    // Días consecutivos sin entreno (contando hacia atrás)
    let skippedTrainingStreak = 0;
    for (let i = weekLogs.length - 1; i >= 0; i--) {
      if (!weekLogs[i].trainingCompleted) skippedTrainingStreak++;
      else break;
    }
    // Si hoy tampoco ha entrenado, sumamos 1
    if (!log.trainingCompleted) {
      const today = getLocalTodayDateString();
      const lastLogDate = weekLogs.length > 0 ? weekLogs[weekLogs.length - 1].date : null;
      if (lastLogDate !== today) skippedTrainingStreak++;
    }

    // Energía promedio semanal
    const logsWithEnergy = weekLogs.filter(l => l.energyLevel != null);
    const avgWeeklyRpe = logsWithEnergy.length > 0
      ? logsWithEnergy.reduce((acc, l) => acc + (l.energyLevel || 0), 0) / logsWithEnergy.length
      : null;

    // Adherencia calórica (respecto a su meta calórica o 2100 kcal)
    const targetCals = log.targetCalories || 2100;
    const logsWithCalories = weekLogs.filter(l => l.totalCalories > 0);
    const calorieAdherence = logsWithCalories.length > 0
      ? logsWithCalories.reduce((acc, l) => acc + l.totalCalories, 0) / (logsWithCalories.length * targetCals)
      : null;

    // Racha activa de entreno
    let activeStreak = 0;
    for (let i = weekLogs.length - 1; i >= 0; i--) {
      if (weekLogs[i].trainingCompleted) activeStreak++;
      else break;
    }
    if (log.trainingCompleted) activeStreak++;

    // Fatiga detectada por check-in o readiness
    const readinessSoreness = log.readinessScore?.soreness || 0;
    const readinessStress = log.readinessScore?.stress || 0;
    const showsFatigue = (log.energyLevel != null && log.energyLevel <= 2) ||
      (log.sleepQuality != null && log.sleepQuality <= 2) ||
      (log.readinessScore != null && log.readinessScore.total < 60);

    const poorDeepSleep = sleepRecord?.deepHours != null && sleepRecord.deepHours < 1.0;
    const highSoreness = readinessSoreness >= 7;

    return {
      skippedTrainingStreak,
      avgWeeklyRpe,
      needsDeload: (avgWeeklyRpe !== null && avgWeeklyRpe >= 4) || readinessStress >= 8,
      calorieAdherence,
      activeStreak,
      undereating: calorieAdherence !== null && calorieAdherence < 0.7,
      showsFatigue: showsFatigue || false,
      poorDeepSleep,
      highSoreness,
    };
  }, [log, weekLogs, sleepRecord]);

  const contextSummary = useMemo(() => {
    const lines: string[] = [];

    lines.push('=== FICHA MAESTRA DEL ATLETA PROKOPTON ===');
    const athleteName = log.userName && log.userName !== 'Ciudadano Prokopton' ? log.userName : 'Guerrero Prokopton';
    lines.push(`Nombre: ${athleteName}`);
    lines.push(`Senda Legendaria: ${
      log.legendaryPath === 'spartan'
        ? '⚔️ SENDA DEL ESPARTANO (Fuerza Bruta & Hipertrofia Pesada)'
        : log.legendaryPath === 'hoplite'
        ? '🛡️ SENDA DEL HOPLITA (Resistencia Mitocondrial & Longevidad)'
        : log.legendaryPath === 'apollo'
        ? '⚡ SENDA DE APOLO (Estética Divina & V-Taper)'
        : '🧘‍♂️ SENDA DEL FILÓSOFO GUERRERO (Calistenia & Dominio Mente-Cuerpo)'
    }`);
    lines.push(`Pacto de 30 Días: Día ${log.monthlyCycle?.currentDay || 1}/30 | Rango: ${log.monthlyCycle?.tier || 'Novicio de Esparta'}`);
    lines.push(`Arquetipo de Mentor Activo: ${
      log.coachArchetype === 'spartan_commander'
        ? 'Comandante Espartano ⚔️'
        : log.coachArchetype === 'sports_scientist'
        ? 'Fisiólogo & Científico Deportivo 🔬'
        : 'Mentor Sabio Estoico 🏛️'
    }`);

    // Biometría y Perfil Avanzado
    if (log.prokoptonProfile) {
      const p = log.prokoptonProfile;
      lines.push(`Nivel del Practicante: ${p.experienceLevel === 'beginner' ? 'Novato / Principiante' : p.experienceLevel === 'intermediate' ? 'Intermedio con base técnica' : 'Avanzado / Veterano'}`);
      lines.push(`Enfoque Principal: ${
        p.focus === 'strength' ? 'Fuerza & Hipertrofia Muscular' :
        p.focus === 'fat_loss' ? 'Recomposición Corporal & Quema Grasa' :
        p.focus === 'longevity' ? 'Salud Metabólica & Resistencia' : 'Claridad Mental & Templanza'
      }`);
      lines.push(`Equipamiento Disponible: ${
        p.equipment === 'gym' ? 'Gimnasio Comercial Completo (Barras, Máquinas, Poleas)' :
        p.equipment === 'home_dumbbell' ? 'Mancuernas y Banco en Casa' : 'Calistenia (Barra de dominadas y Peso Corporal)'
      }`);
      lines.push(`Compromiso Semanal: ${p.daysPerWeek} días/semana | ${p.sessionDurationMinutes} min por sesión`);
      lines.push(`Preferencia Nutricional: ${p.dietPreference || 'Equilibrada de Alta Densidad'}`);
      lines.push(`Biometría: Edad ${p.age} años | Género: ${p.gender || 'No especificado'} | Peso Actual: ${p.weightKg} kg | Meta: ${p.targetWeightKg} kg | Altura: ${p.heightCm} cm`);

      const injuryZone = p.injuryCare && p.injuryCare !== 'none' ? p.injuryCare : null;
      const zonesList = (p.protectedZones && p.protectedZones.length > 0 && !p.protectedZones.includes('none' as any))
        ? p.protectedZones.join(', ')
        : (injuryZone || 'Ninguna lesión reportada');
      lines.push(`⚠️ CUIDADO ARTICULAR / ZONAS A PROTEGER: ${zonesList.toUpperCase()}`);
    } else if (log.userMetrics) {
      lines.push(`Biometría: Edad ${log.userMetrics.age} años | Peso ${log.userMetrics.weightKg} kg | Altura ${log.userMetrics.heightCm} cm | Objetivo: ${log.userMetrics.goal}`);
    }

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

    // Arquitectura del Sueño
    if (sleepRecord) {
      lines.push('');
      lines.push('=== ARQUITECTURA DEL SUEÑO & RECUPERACIÓN NOCTURNA ===');
      lines.push(`Total de Sueño: ${sleepRecord.totalHours || 7.5} horas | Eficiencia: ${sleepRecord.efficiencyPct || 92}%`);
      lines.push(`Sueño Profundo (Fase 4 Anabólica): ${sleepRecord.deepHours || 1.8}h ${sleepRecord.deepHours && sleepRecord.deepHours >= 1.5 ? '👑 Excelente regeneración hormonal' : '⚠️ Regeneración lenta'}`);
      lines.push(`Sueño REM (SNC y Mente): ${sleepRecord.remHours || 1.6}h | Ligero: ${sleepRecord.lightHours || 4.1}h`);
      if (sleepRecord.restingBpm) lines.push(`Frecuencia Cardíaca Mínima en Reposo: ${sleepRecord.restingBpm} BPM`);
      if (sleepRecord.hrvMs) lines.push(`Variabilidad de Frecuencia Cardíaca (VFC / HRV): ${sleepRecord.hrvMs} ms ${sleepRecord.hrvMs >= 55 ? '(Tono vagal óptimo)' : '(SNC en estrés)'}`);
    }

    // Readiness & SNC
    if (log.readinessScore) {
      lines.push('');
      lines.push('=== DISPONIBILIDAD DEL SISTEMA NERVIOSO CENTRAL (READINESS) ===');
      lines.push(`Índice de Preparación del SNC: ${log.readinessScore.total}% ${log.readinessScore.total >= 80 ? '⚡ Alta capacidad de carga' : log.readinessScore.total >= 60 ? '🛡️ Capacidad media' : '⚠️ Fatiga central / Priorizar técnica'}`);
      lines.push(`Dolor Muscular (Soreness): ${log.readinessScore.soreness}/10 | Estrés Percibido: ${log.readinessScore.stress}/10 | Calidad de Sueño: ${log.readinessScore.sleep}/10`);
    } else if (log.checkInDone) {
      lines.push(`Check-in Subjetivo: Energía ${log.energyLevel}/5 | Sueño ${log.sleepQuality}/5`);
    }

    // Nutrición & Balance
    lines.push('');
    lines.push('=== NUTRICIÓN Y BALANCE CALÓRICO HOY ===');
    const targetCals = log.targetCalories || 2200;
    const remainingCals = Math.max(0, targetCals - (log.totalCalories || 0));
    lines.push(`Calorías Ingeridas: ${log.totalCalories} kcal / Meta: ${targetCals} kcal (Restan ${remainingCals} kcal)`);
    lines.push(`Comidas Registradas: ${log.mealsLogged} ingestas`);
    if (log.macros) {
      const userWeight = log.prokoptonProfile?.weightKg || log.userMetrics?.weightKg || 75;
      const targetProtein = Math.round(userWeight * (log.legendaryPath === 'spartan' || log.legendaryPath === 'apollo' ? 2.2 : 1.8));
      const remainingProtein = Math.max(0, targetProtein - log.macros.protein);
      lines.push(`Macronutrientes: Proteína: ${log.macros.protein}g (Meta diaria: ${targetProtein}g | Faltan: ${remainingProtein}g), Carbos: ${log.macros.carbs}g, Grasas: ${log.macros.fats}g`);
    }
    if (log.lastNutrientDensityScore != null) {
      lines.push(`Última Comida Analizada por IA: Densidad Nutricional ${log.lastNutrientDensityScore}/10 | Veredicto: ${log.lastNutrientVerdict || 'Balanceada'}`);
    }

    // Entrenamiento de hoy y Rutina
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

    // Patrones y Alertas Semanales
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
      weekLogs.forEach(l => {
        const trained = l.trainingCompleted ? '✓ Entrenó' : '✗ Sin entreno';
        const cals = l.totalCalories > 0 ? `${l.totalCalories} kcal` : 'Sin registro';
        const steps = l.steps ? `${l.steps.toLocaleString()} pasos` : '0 pasos';
        lines.push(`• ${l.date}: ${trained} | ${cals} | ${steps}`);
      });
    }

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
