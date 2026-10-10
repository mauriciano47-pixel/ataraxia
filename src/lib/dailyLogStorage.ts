import { SafeStorage } from '@/utils/safeStorage';
import { getLocalTodayDateString } from '@/utils/dateUtils';
import { logger } from '@/utils/logger';
import {
  DailyLog,
  DEFAULT_LOG,
  DEFAULT_USER_METRICS,
  DEFAULT_MONTHLY_CYCLE,
} from '@/types/dailyLog';
import { BodySnapshot, DailyGrade, MonthlyCycleState } from '@/types/onboarding';

export const PROFILE_STORAGE_KEY = 'ataraxia_user_profile_v5';
export const AVATAR_STORAGE_KEY = 'ataraxia_user_avatar_uri_v2';
export const ONBOARDING_KEY = 'ataraxia_onboarding_completed_v2';
export const BODY_SNAPSHOTS_STORAGE_KEY = 'ataraxia_body_snapshots_v2';

export function loadLocalBodySnapshots(): BodySnapshot[] {
  try {
    const raw = SafeStorage.getItem(BODY_SNAPSHOTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    logger.warn('[dailyLogStorage] Error cargando fotos de evolución:', e);
  }
  return [];
}

export function loadLocalDailyLog(targetDate: string): DailyLog {
  let baseLog: DailyLog = { ...DEFAULT_LOG };

  try {
    const savedProfile = SafeStorage.getItem(PROFILE_STORAGE_KEY);
    const isArchonMaster = SafeStorage.getItem('ataraxia_is_archon_master') === 'true' ||
      SafeStorage.getItem('ataraxia_current_logged_key') === '742091' ||
      SafeStorage.getItem('ataraxia_current_logged_key') === 'MAURO-ARCHON';

    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      baseLog = {
        ...baseLog,
        ...profileData,
        userMetrics: {
          ...DEFAULT_USER_METRICS,
          ...(profileData.userMetrics || {}),
        },
      };
    } else if (isArchonMaster) {
      baseLog = {
        ...baseLog,
        userName: 'Mauro',
        hasCompletedOnboarding: true,
        legendaryPath: 'spartan',
      };
    }

    const onboardingCompletedRaw = SafeStorage.getItem(ONBOARDING_KEY);
    if (onboardingCompletedRaw === 'true' || isArchonMaster) {
      baseLog.hasCompletedOnboarding = true;
    } else if (onboardingCompletedRaw === 'false' || !savedProfile) {
      baseLog.hasCompletedOnboarding = false;
    }

    if (isArchonMaster && (!baseLog.userName || baseLog.userName === 'Ciudadano Prokopton')) {
      baseLog.userName = 'Mauro';
      baseLog.legendaryPath = baseLog.legendaryPath || 'spartan';
    } else if (!baseLog.userName || baseLog.userName.trim() === '') {
      baseLog.userName = 'Ciudadano Prokopton';
    }

    if (!baseLog.legendaryPath && isArchonMaster) {
      baseLog.legendaryPath = 'spartan';
    }

    const savedAvatar = SafeStorage.getItem(AVATAR_STORAGE_KEY);
    if (savedAvatar) {
      baseLog.stoicAvatarUri = savedAvatar;
    }

    const savedToday = SafeStorage.getItem(`ataraxia_log_${targetDate}`);
    if (savedToday) {
      const todayData = JSON.parse(savedToday);
      const {
        waterLitres,
        trainingCompleted,
        mealsLogged,
        totalCalories,
        steps,
        energyLevel,
        sleepQuality,
        checkInDone,
        macros,
        readinessScore,
        effectiveSets,
        lastNutrientDensityScore,
        lastNutrientVerdict,
      } = todayData;

      baseLog = {
        ...baseLog,
        ...(waterLitres !== undefined ? { waterLitres } : {}),
        ...(trainingCompleted !== undefined ? { trainingCompleted } : {}),
        ...(mealsLogged !== undefined ? { mealsLogged } : {}),
        ...(totalCalories !== undefined ? { totalCalories } : {}),
        ...(steps !== undefined ? { steps } : {}),
        ...(energyLevel !== undefined ? { energyLevel } : {}),
        ...(sleepQuality !== undefined ? { sleepQuality } : {}),
        ...(checkInDone !== undefined ? { checkInDone } : {}),
        ...(macros !== undefined ? { macros } : {}),
        ...(readinessScore !== undefined ? { readinessScore } : {}),
        ...(effectiveSets !== undefined ? { effectiveSets } : {}),
        ...(lastNutrientDensityScore !== undefined ? { lastNutrientDensityScore } : {}),
        ...(lastNutrientVerdict !== undefined ? { lastNutrientVerdict } : {}),
      };
    }

    // Blindaje de persistencia de pasos: recuperar último conteo guardado de la sesión de hoy si steps es 0
    if (!baseLog.steps || baseLog.steps === 0) {
      const savedSteps =
        SafeStorage.getItem(`ataraxia_pedometer_steps_${targetDate}`) ||
        SafeStorage.getItem('ataraxia_pedometer_session_steps_v1');
      if (savedSteps) {
        const parsed = parseInt(savedSteps, 10);
        if (!isNaN(parsed) && parsed > 0) {
          baseLog.steps = parsed;
        }
      }
    }
  } catch (e) {
    logger.warn('[dailyLogStorage] Error cargando estado:', e);
  }

  return baseLog;
}

export function saveLocalDailyLog(targetDate: string, currentLog: DailyLog): void {
  try {
    const profileCore = {
      userName: currentLog.userName,
      userMetrics: currentLog.userMetrics,
      targetCalories: currentLog.targetCalories,
      stepGoal: currentLog.stepGoal,
      smartDevice: currentLog.smartDevice,
      hasCompletedOnboarding: currentLog.hasCompletedOnboarding,
      prokoptonProfile: currentLog.prokoptonProfile,
      customRoutine: currentLog.customRoutine,
      coachArchetype: currentLog.coachArchetype || 'stoic_mentor',
      legendaryPath: currentLog.legendaryPath,
      monthlyCycle: currentLog.monthlyCycle,
    };
    SafeStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileCore));

    if (currentLog.legendaryPath) {
      SafeStorage.setItem('ataraxia_path_chosen_v2', 'true');
      SafeStorage.setItem('ataraxia_pact_accepted_v2', 'true');
    }

    if (currentLog.hasCompletedOnboarding) {
      SafeStorage.setItem(ONBOARDING_KEY, 'true');
    }

    const dailyMetrics = {
      waterLitres: currentLog.waterLitres,
      trainingCompleted: currentLog.trainingCompleted,
      mealsLogged: currentLog.mealsLogged,
      totalCalories: currentLog.totalCalories,
      steps: currentLog.steps,
      energyLevel: currentLog.energyLevel,
      sleepQuality: currentLog.sleepQuality,
      checkInDone: currentLog.checkInDone,
      macros: currentLog.macros,
      readinessScore: currentLog.readinessScore,
      effectiveSets: currentLog.effectiveSets,
      lastNutrientDensityScore: currentLog.lastNutrientDensityScore,
      lastNutrientVerdict: currentLog.lastNutrientVerdict,
    };
    SafeStorage.setItem(`ataraxia_log_${targetDate}`, JSON.stringify(dailyMetrics));

    if (currentLog.stoicAvatarUri) {
      SafeStorage.setItem(AVATAR_STORAGE_KEY, currentLog.stoicAvatarUri);
    }
  } catch (e) {
    logger.warn('[dailyLogStorage] Error guardando estado:', e);
  }
}

export function consolidateCycleHistory(currentLog: DailyLog): DailyLog {
  try {
    if (!currentLog) return currentLog;
    const cycle = currentLog.monthlyCycle || DEFAULT_MONTHLY_CYCLE;
    const todayStr = getLocalTodayDateString();
    // El Reto Stoic Oficial de 30 Días inició inmutablemente el 1 de Septiembre de 2026
    const startStr = '2026-09-01';

    const [sY, sM, sD] = startStr.split('-').map((n) => parseInt(n, 10) || 0);
    const [tY, tM, tD] = (todayStr || '2026-09-01').split('-').map((n) => parseInt(n, 10) || 0);

    const startDateObj = new Date(sY || 2026, sM > 0 ? sM - 1 : 8, sD || 1);
    const todayDateObj = new Date(tY || 2026, tM > 0 ? tM - 1 : 8, tD || 1);

    // Calcular diferencia en días exactos desde el 1 de Septiembre (1 sep = Día 1, 4 sep = Día 4)
    const diffTime = todayDateObj.getTime() - startDateObj.getTime();
    const rawDiffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffDays = Math.max(0, isNaN(rawDiffDays) ? 0 : rawDiffDays);
    const currentDayNum = Math.min(30, Math.max(1, diffDays + 1));

    const existingGradesMap = new Map<string, DailyGrade>();
    (cycle?.dailyGrades || []).forEach((g) => {
      if (g && g.date) {
        existingGradesMap.set(g.date, g);
      }
    });

    let passedCount = 0;
    let failedCount = 0;
    let totalScoreSum = 0;
    const consolidatedGrades: DailyGrade[] = [];

    // Recorrer todos los días concluidos (estrictamente anteriores a hoy)
    for (let d = 0; d < diffDays && d < 30; d++) {
      const dayDate = new Date(startDateObj.getTime() + d * (1000 * 60 * 60 * 24));
      const year = dayDate.getFullYear();
      const month = String(dayDate.getMonth() + 1).padStart(2, '0');
      const day = String(dayDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      const dayNumber = d + 1;

      let grade = existingGradesMap.get(dateKey);
      if (!grade) {
        const rawPast = SafeStorage.getItem(`ataraxia_log_${dateKey}`);
        if (rawPast) {
          try {
            const parsed = JSON.parse(rawPast);
            const trainingDone = Boolean(parsed.trainingCompleted);
            const trainingPts = trainingDone ? 20 : 0;
            const stepGoal = currentLog.stepGoal || 10000;
            const stepsRatio = Math.min(1, (parsed.steps || 0) / stepGoal);
            const stepsPassed = (parsed.steps || 0) >= stepGoal * 0.85;
            const stepsPts = Math.round(stepsRatio * 20);
            const nutritionPassed = (parsed.mealsLogged || 0) > 0 || (parsed.totalCalories || 0) > 0;
            const nutritionPts = nutritionPassed ? 15 : 0;
            const sleepPassed = (parsed.sleepQuality || 0) >= 6.5;
            const sleepPts = sleepPassed ? 15 : 0;
            const stoicChallengePassed =
              Boolean(SafeStorage.getItem(`ataraxia_stoic_challenge_completed_${dateKey}`)) ||
              Boolean(SafeStorage.getItem(`ataraxia_journal_${dateKey}`));
            const stoicChallengePts = stoicChallengePassed ? 10 : 0;
            const heartRatePassed = Boolean(parsed.smartDevice?.heartRateBpm && parsed.smartDevice.heartRateBpm > 0);
            const heartRatePts = heartRatePassed ? 10 : 0;
            const coachCheckInPassed = Boolean(parsed.checkInDone) || Boolean(parsed.readinessScore);
            const coachCheckInPts = coachCheckInPassed ? 10 : 0;

            const totalScore =
              trainingPts + stepsPts + nutritionPts + sleepPts + stoicChallengePts + heartRatePts + coachCheckInPts;
            const isPassed = totalScore >= 75;

            grade = {
              day: dayNumber,
              date: dateKey,
              score: totalScore,
              status: totalScore >= 90 ? 'divine' : isPassed ? 'worthy' : totalScore >= 50 ? 'mediocre' : 'failed',
              pillars: {
                training: trainingDone,
                steps: stepsPassed,
                nutrition: nutritionPassed,
                sleep: sleepPassed,
                stoicChallenge: stoicChallengePassed,
                heartRate: heartRatePassed,
                coachCheckIn: coachCheckInPassed,
              },
              trainingDone,
              steps: parsed.steps || 0,
              stepGoal,
              stepsRatio: parseFloat((isNaN(stepsRatio) ? 0 : stepsRatio).toFixed(2)),
              waterLitres: parsed.waterLitres || 0,
              waterRatio: parseFloat(Math.min(1, (parsed.waterLitres || 0) / 2.5).toFixed(2)),
              caloriesLogged: nutritionPassed,
              totalCalories: parsed.totalCalories || 0,
              sleepHours: parsed.sleepQuality || 0,
              heartRateBpm: parsed.smartDevice?.heartRateBpm || 0,
              verdict: isPassed
                ? '⚔️ Hoplita Digno: Día cumplido con disciplina.'
                : '💀 Día Indigno: No se completaron los requisitos del Pacto dentro de la ventana de 24 horas.',
              recordedAt: new Date().toISOString(),
            };
          } catch {}
        }

        if (!grade) {
          grade = {
            day: dayNumber,
            date: dateKey,
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
            trainingDone: false,
            steps: 0,
            stepGoal: currentLog.stepGoal || 10000,
            stepsRatio: 0,
            waterLitres: 0,
            waterRatio: 0,
            caloriesLogged: false,
            totalCalories: 0,
            sleepHours: 0,
            heartRateBpm: 0,
            verdict: '💀 Día Indigno: No se completaron los requisitos del Pacto dentro de la ventana de 24 horas.',
            recordedAt: new Date().toISOString(),
          };
        }
      }

      if (grade.status === 'worthy' || grade.status === 'divine') {
        passedCount++;
      } else {
        failedCount++;
      }
      totalScoreSum += grade.score || 0;
      consolidatedGrades.push(grade);
    }

    const evaluatedDaysCount = consolidatedGrades.length;
    const avgScore = evaluatedDaysCount > 0 ? Math.round(totalScoreSum / evaluatedDaysCount) : 100;

    const updatedCycle: MonthlyCycleState = {
      ...cycle,
      currentDay: currentDayNum,
      startDate: cycle?.startDate || `${startStr}T00:00:00.000Z`,
      dailyGrades: consolidatedGrades,
      passedDaysCount: passedCount,
      failedDaysCount: failedCount,
      averageScore: isNaN(avgScore) ? 100 : avgScore,
      isJudgmentReady: currentDayNum >= 30 && diffDays >= 30,
      isPactActive: true,
    };

    return {
      ...currentLog,
      monthlyCycle: updatedCycle,
    };
  } catch (err) {
    logger.warn('[dailyLogStorage] Error en consolidateCycleHistory:', err);
    return currentLog;
  }
}
