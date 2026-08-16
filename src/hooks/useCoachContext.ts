import { useMemo } from 'react';
import { DailyLog, useDailyLog, useWeekHistory } from './useDailyLog';

/**
 * Patrones de comportamiento detectados automáticamente
 * para que el coach pueda dar respuestas contextuales.
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
 * Hook que construye el contexto completo del coach estoico.
 * Analiza los datos del día actual + historial semanal para
 * detectar patrones y generar un resumen textual.
 */
export function useCoachContext(): CoachContext {
  const { log, loading: loadingToday } = useDailyLog();
  const { weekLogs, loadingWeek } = useWeekHistory(7);

  const patterns = useMemo<CoachPatterns>(() => {
    // Días consecutivos sin entreno (contando hacia atrás)
    let skippedTrainingStreak = 0;
    for (let i = weekLogs.length - 1; i >= 0; i--) {
      if (!weekLogs[i].trainingCompleted) skippedTrainingStreak++;
      else break;
    }
    // Si hoy tampoco ha entrenado, sumamos 1
    if (!log.trainingCompleted) {
      const today = new Date().toISOString().split('T')[0];
      const lastLogDate = weekLogs.length > 0 ? weekLogs[weekLogs.length - 1].date : null;
      if (lastLogDate !== today) skippedTrainingStreak++;
    }

    // Energía promedio semanal (usamos energyLevel como proxy de esfuerzo)
    const logsWithEnergy = weekLogs.filter(l => l.energyLevel != null);
    const avgWeeklyRpe = logsWithEnergy.length > 0
      ? logsWithEnergy.reduce((acc, l) => acc + (l.energyLevel || 0), 0) / logsWithEnergy.length
      : null;

    // Adherencia calórica (ratio promedio respecto a 2100 kcal objetivo)
    const logsWithCalories = weekLogs.filter(l => l.totalCalories > 0);
    const calorieAdherence = logsWithCalories.length > 0
      ? logsWithCalories.reduce((acc, l) => acc + l.totalCalories, 0) / (logsWithCalories.length * 2100)
      : null;

    // Racha activa de entreno
    let activeStreak = 0;
    for (let i = weekLogs.length - 1; i >= 0; i--) {
      if (weekLogs[i].trainingCompleted) activeStreak++;
      else break;
    }
    if (log.trainingCompleted) activeStreak++;

    // Fatiga detectada por check-in
    const showsFatigue = (log.energyLevel != null && log.energyLevel <= 2) ||
      (log.sleepQuality != null && log.sleepQuality <= 2);

    return {
      skippedTrainingStreak,
      avgWeeklyRpe,
      needsDeload: avgWeeklyRpe !== null && avgWeeklyRpe >= 4,
      calorieAdherence,
      activeStreak,
      undereating: calorieAdherence !== null && calorieAdherence < 0.7,
      showsFatigue: showsFatigue || false,
    };
  }, [log, weekLogs]);

  const contextSummary = useMemo(() => {
    const lines: string[] = [];

    lines.push('=== FICHA TÉCNICA DEL ATLETA PROKOPTON ===');
    lines.push(`Nombre: ${log.userName || 'Ciudadano Prokopton'}`);
    if (log.prokoptonProfile) {
      const p = log.prokoptonProfile;
      lines.push(`Enfoque Principal: ${p.focus === 'strength' ? 'Fuerza Espartana & Hipertrofia' : p.focus === 'fat_loss' ? 'Recomposición & Déficit' : p.focus === 'longevity' ? 'Resistencia & Longevidad' : 'Claridad Mental & Estoicismo'}`);
      lines.push(`Equipamiento: ${p.equipment === 'gym' ? 'Gimnasio Completo' : p.equipment === 'home_dumbbell' ? 'Mancuernas en Casa' : 'Calistenia (Peso Corporal)'}`);
      lines.push(`Sesión Objetivo: ${p.daysPerWeek} días/semana | ${p.sessionDurationMinutes} minutos por sesión`);
      lines.push(`Nutrición Objetivo: ${p.dietPreference}`);
      lines.push(`Biometría: Edad ${p.age} años | Peso Actual: ${p.weightKg} kg | Meta: ${p.targetWeightKg} kg | Altura: ${p.heightCm} cm`);
    } else if (log.userMetrics) {
      lines.push(`Biometría: Edad ${log.userMetrics.age} | Peso ${log.userMetrics.weightKg}kg | Altura ${log.userMetrics.heightCm}cm`);
    }

    lines.push('');
    lines.push('=== ESTADO ACTUAL DEL USUARIO HOY ===');
    lines.push(`Entrenamiento: ${log.trainingCompleted ? 'COMPLETADO' : 'PENDIENTE'}`);
    lines.push(`Agua: ${log.waterLitres.toFixed(1)}L (meta: 2L)`);
    lines.push(`Comidas registradas: ${log.mealsLogged} (meta: 3)`);
    lines.push(`Calorías consumidas: ${log.totalCalories} (meta: ${log.targetCalories || 2100} kcal)`);
    if (log.macros) {
      lines.push(`Macros: P:${log.macros.protein}g C:${log.macros.carbs}g G:${log.macros.fats}g`);
    }
    const currentSteps = log.steps || 0;
    const currentStepGoal = log.stepGoal || 10000;
    const stepKm = (currentSteps * 0.00078).toFixed(2);
    const stepCals = Math.round(currentSteps * 0.045);
    lines.push(`Pasos activos (Podómetro): ${currentSteps.toLocaleString()} / ${currentStepGoal.toLocaleString()} pasos (${stepKm} km)`);
    lines.push(`Gasto activo por caminata (NeAT): ~${stepCals} kcal quemadas`);
    if (log.smartDevice?.connected) {
      lines.push(`Smartwatch Conectado: ${log.smartDevice.deviceName} | Ritmo Cardíaco: ${log.smartDevice.heartRateBpm} BPM`);
    }
    if (log.checkInDone) {
      lines.push(`Check-in: Energía ${log.energyLevel}/5, Sueño ${log.sleepQuality}/5`);
    } else {
      lines.push('Check-in: NO realizado aún');
    }

    lines.push('');
    lines.push('=== PATRONES DETECTADOS (ÚLTIMA SEMANA) ===');

    if (patterns.skippedTrainingStreak >= 2) {
      lines.push(`⚠️ ALERTA: El usuario NO ha entrenado en ${patterns.skippedTrainingStreak} días consecutivos.`);
    }
    if (patterns.needsDeload) {
      lines.push('⚠️ ALERTA: Señales de fatiga acumulada. Considerar sugerir descanso o deload.');
    }
    if (patterns.undereating) {
      lines.push('⚠️ ALERTA: Calorías consistentemente por debajo del objetivo (< 70%).');
    }
    if (patterns.showsFatigue) {
      lines.push('⚠️ ALERTA: Check-in indica baja energía o mal sueño hoy.');
    }
    if (patterns.activeStreak >= 5) {
      lines.push(`✅ Racha activa de ${patterns.activeStreak} días de entrenamiento.`);
    }
    if (patterns.calorieAdherence !== null) {
      lines.push(`Adherencia calórica semanal: ${Math.round(patterns.calorieAdherence * 100)}%`);
    }

    if (weekLogs.length > 0) {
      lines.push('');
      lines.push('=== RESUMEN ÚLTIMOS DÍAS ===');
      weekLogs.forEach(l => {
        const trained = l.trainingCompleted ? '✓ entreno' : '✗ sin entreno';
        const meals = `${l.mealsLogged} comidas`;
        const cals = l.totalCalories > 0 ? `${l.totalCalories} kcal` : 'sin registro cal';
        lines.push(`${l.date}: ${trained}, ${meals}, ${cals}`);
      });
    }

    return lines.join('\n');
  }, [log, patterns, weekLogs]);

  return {
    today: log,
    weekLogs,
    patterns,
    contextSummary,
    loading: loadingToday || loadingWeek,
  };
}
