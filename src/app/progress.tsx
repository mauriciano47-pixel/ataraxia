import React, { useState } from 'react';
import { StyleSheet, ActivityIndicator, View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useDailyLog, useHistoryLog } from '@/hooks/useDailyLog';
import { PearlElectricBackground } from '@/components/PearlElectricBackground';
import { LegendaryPath, LEGENDARY_PATHS } from '@/types/onboarding';

const PATH_MANDATORY_ROUTINES: Record<LegendaryPath, {
  name: string;
  focus: string;
  exercises: { id: string; n: string; s: string; targetRpe: number; muscleGroup: string }[];
}> = {
  spartan: {
    name: 'Senda del Espartano',
    focus: 'Fuerza Máxima & Hipertrofia Titánica (RIR 1-2)',
    exercises: [
      { id: 'sp1', n: 'Sentadilla Trasera Pesada con Barra', s: '4 series x 6 reps', targetRpe: 8.5, muscleGroup: 'Piernas' },
      { id: 'sp2', n: 'Press de Banca Olímpico', s: '4 series x 6 reps', targetRpe: 8.5, muscleGroup: 'Pecho' },
      { id: 'sp3', n: 'Peso Muerto Convencional', s: '3 series x 5 reps', targetRpe: 9.0, muscleGroup: 'Espalda / Isquios' },
      { id: 'sp4', n: 'Press Militar de Pie con Barra', s: '3 series x 8 reps', targetRpe: 8.0, muscleGroup: 'Hombros' },
      { id: 'sp5', n: 'Remo Pendlay con Barra', s: '4 series x 8 reps', targetRpe: 8.0, muscleGroup: 'Espalda' },
    ],
  },
  hoplite: {
    name: 'Senda del Hoplita',
    focus: 'Resistencia Inagotable & Densidad Mitocondrial',
    exercises: [
      { id: 'hop1', n: 'Circuito Táctico de Resistencia', s: '4 rondas x 45 seg', targetRpe: 8.0, muscleGroup: 'Full Body' },
      { id: 'hop2', n: 'Caminata Rápida / Trote NeAT Zona 2', s: '35 min continuos', targetRpe: 7.0, muscleGroup: 'Cardiovascular' },
      { id: 'hop3', n: 'Flexiones Tácticas con Pausa', s: '4 series x 15 reps', targetRpe: 8.0, muscleGroup: 'Pecho / Tríceps' },
      { id: 'hop4', n: 'Dominadas Pronas Estrictas', s: '4 series x 8-10 reps', targetRpe: 8.5, muscleGroup: 'Espalda' },
      { id: 'hop5', n: 'Plancha Abdominal de Acero', s: '3 series x 60 seg', targetRpe: 8.0, muscleGroup: 'Core' },
    ],
  },
  apollo: {
    name: 'Senda de Apolo',
    focus: 'Escultura Estética, V-Taper & Proporciones Áureas',
    exercises: [
      { id: 'ap1', n: 'Press Inclinado con Mancuernas (Énfasis Superior)', s: '4 series x 10-12 reps', targetRpe: 8.5, muscleGroup: 'Pecho Superior' },
      { id: 'ap2', n: 'Elevaciones Laterales Estrictas (Hombros en V)', s: '4 series x 15 reps', targetRpe: 9.0, muscleGroup: 'Hombros Laterales' },
      { id: 'ap3', n: 'Jalón al Pecho con Agarre Neutro', s: '4 series x 10 reps', targetRpe: 8.0, muscleGroup: 'Dorsales' },
      { id: 'ap4', n: 'Sentadilla Búlgara Esculpida', s: '3 series x 12 reps/pierna', targetRpe: 8.5, muscleGroup: 'Cuádriceps / Glúteos' },
      { id: 'ap5', n: 'Elevación de Piernas Colgado en Barra', s: '4 series x 15 reps', targetRpe: 8.5, muscleGroup: 'Abdomen' },
    ],
  },
  philosopher: {
    name: 'Senda del Filósofo Guerrero',
    focus: 'Calistenia Pura, Autodominio & Temple Corporal',
    exercises: [
      { id: 'ph1', n: 'Dominadas Estrictas en Barra', s: '4 series x 10 reps', targetRpe: 8.5, muscleGroup: 'Dorsales / Bíceps' },
      { id: 'ph2', n: 'Fondos en Paralelas (Dips)', s: '4 series x 12 reps', targetRpe: 8.5, muscleGroup: 'Pecho / Tríceps' },
      { id: 'ph3', n: 'Pistol Squats (Sentadilla a 1 Pierna)', s: '3 series x 8 reps/pierna', targetRpe: 8.0, muscleGroup: 'Piernas' },
      { id: 'ph4', n: 'Flexiones Diamante en Suelo', s: '4 series x 15 reps', targetRpe: 8.5, muscleGroup: 'Tríceps' },
      { id: 'ph5', n: 'Hanging L-Sit / Hollow Body Stoic', s: '4 series x 30 seg', targetRpe: 9.0, muscleGroup: 'Core / Abdomen' },
    ],
  },
};

export default function ProgressScreen() {
  const {
    log,
    loading,
    calculateTodayGrade,
    executeJudgment,
    resetMonthlyCycle,
    start30DayPact,
    toggleTraining,
  } = useDailyLog();
  const { historyMap, loadingHistory } = useHistoryLog();
  const [modalVisible, setModalVisible] = useState(false);
  const [pactModalVisible, setPactModalVisible] = useState(false);
  const [judgmentResult, setJudgmentResult] = useState<{ promoted: boolean; title: string; message: string } | null>(null);
  
  // Estado local para los checkboxes de la sesión obligatoria del día
  const [completedExerciseIds, setCompletedExerciseIds] = useState<Record<string, boolean>>({});

  if (loading || loadingHistory) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#050507' }]}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <ThemedText style={{ marginTop: Spacing.three, color: '#D4AF37', fontFamily: 'monospace' }}>Conectando con el Oráculo...</ThemedText>
      </ThemedView>
    );
  }

  const activePathKey = (log.legendaryPath as LegendaryPath) || 'spartan';
  const activePathInfo = LEGENDARY_PATHS[activePathKey] || LEGENDARY_PATHS.spartan;
  const mandatoryProgram = PATH_MANDATORY_ROUTINES[activePathKey] || PATH_MANDATORY_ROUTINES.spartan;

  const cycle = log.monthlyCycle || {
    currentDay: 1,
    startDate: new Date().toISOString(),
    path: activePathKey,
    tier: 'Novicio de Esparta',
    dailyGrades: [],
    passedDaysCount: 0,
    failedDaysCount: 0,
    averageScore: 100,
    isJudgmentReady: false,
    isPactActive: true,
  };

  const todayGrade = calculateTodayGrade();
  const isTodaySuccess = todayGrade.score >= 75;
  const fullMap = [...historyMap];
  if (fullMap.length > 0) {
    fullMap[fullMap.length - 1] = isTodaySuccess;
  }

  const victoriousDays = fullMap.filter(Boolean).length;
  const adherencePercent = Math.round((victoriousDays / 30) * 100);
  const isAboveThreshold = adherencePercent >= 80;

  // Formato de fecha de inicio
  const formattedStartDate = cycle.startDate
    ? new Date(cycle.startDate).toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'No iniciado';

  const handleToggleExercise = (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setCompletedExerciseIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSealWorkout = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    toggleTraining();
  };

  const handleStartPact = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    start30DayPact(activePathKey);
    setPactModalVisible(false);
  };

  const handleOpenJudgment = () => {
    const res = executeJudgment();
    setJudgmentResult(res);
    setModalVisible(true);
  };

  const pillars = todayGrade.pillars || {
    training: Boolean(log.trainingCompleted),
    steps: Boolean((log.steps || 0) >= (log.stepGoal || 10000) * 0.85),
    nutrition: Boolean((log.mealsLogged || 0) > 0 || (log.totalCalories || 0) > 0),
    sleep: Boolean(log.readinessScore?.sleep || log.sleepQuality),
    stoicChallenge: false,
    heartRate: Boolean(log.smartDevice?.heartRateBpm && log.smartDevice.heartRateBpm > 0),
    coachCheckIn: Boolean(log.checkInDone || log.readinessScore),
  };

  return (
    <PearlElectricBackground glowColor="rgba(212, 175, 55, 0.28)">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* HEADER PRINCIPAL */}
          <View style={styles.header}>
            <View style={styles.tierBadge}>
              <ThemedText style={styles.tierBadgeText}>
                🏛️ RANGO: {cycle.tier.toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText style={styles.title}>PROGRAMA DE 30 DÍAS</ThemedText>
            <ThemedText style={styles.pathSubheader}>
              {activePathInfo.icon} {activePathInfo.name.toUpperCase()} • DÍA {cycle.currentDay}/30
            </ThemedText>
          </View>

          {/* 0. TARJETA DEL PACTO SAGRADO & CRONÓMETRO DE 30 DÍAS */}
          <View style={styles.pactCard}>
            <View style={styles.pactCardHeaderRow}>
              <View style={styles.pactStatusBadge}>
                <ThemedText style={styles.pactStatusBadgeText}>
                  {cycle.isPactActive ? '⚡ PACTO ACTIVO • CUENTA INICIADA' : '⏳ PACTO PENDIENTE'}
                </ThemedText>
              </View>
              <ThemedText style={styles.pactDayCounterText}>
                DÍA {cycle.currentDay} / 30
              </ThemedText>
            </View>

            <ThemedText style={styles.pactStartDateText}>
              📅 Inicio oficial: {formattedStartDate}
            </ThemedText>
            <ThemedText style={styles.pactDescText}>
              En este santuario cada día cuenta. Si no alcanzas los 7 pilares obligatorios de tu Senda, el día será calificado implacablemente como <ThemedText style={{ color: '#EF4444', fontWeight: 'bold' }}>INDIGNO</ThemedText>.
            </ThemedText>

            <TouchableOpacity
              style={styles.startPactBtn}
              activeOpacity={0.85}
              onPress={() => setPactModalVisible(true)}
            >
              <LinearGradient
                colors={['#D4AF37', '#F59E0B', '#B45309']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.startPactGradient}
              >
                <ThemedText style={styles.startPactBtnText}>
                  {cycle.isPactActive ? '🔄 REINICIAR PACTO DESDE EL DÍA 1' : '🏛️ ACEPTAR EL PACTO DE LOS 30 DÍAS'}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* 1. SECCIÓN OBLIGATORIA: SESIÓN MARCIAL DEL DÍA (INMUTABLE) */}
          <View style={styles.mandatoryCard}>
            <View style={styles.mandatoryHeaderRow}>
              <View style={styles.mandatoryBadge}>
                <ThemedText style={styles.mandatoryBadgeText}>⚔️ PILAR 1: RUTINA SAGRADA • OBLIGATORIO</ThemedText>
              </View>
              <ThemedText style={[styles.statusText, log.trainingCompleted ? { color: '#10B981' } : { color: '#F59E0B' }]}>
                {log.trainingCompleted ? 'SELLADO ✓ (+20 PTS)' : 'PENDIENTE (0/20)'}
              </ThemedText>
            </View>

            <ThemedText style={styles.mandatoryTitle}>{mandatoryProgram.name}</ThemedText>
            <ThemedText style={styles.mandatoryFocus}>{mandatoryProgram.focus}</ThemedText>

            {/* AVISO DE INMUTABILIDAD */}
            <View style={styles.immutableNoticeBox}>
              <ThemedText style={styles.immutableNoticeText}>
                🔒 Esta rutina es inmutable y obligatoria. Sellar esta sesión es requisito sagrado para validar el día en tu ciclo.
              </ThemedText>
            </View>

            {/* LISTA DE EJERCICIOS DEL PROGRAMA */}
            <View style={styles.exerciseList}>
              {mandatoryProgram.exercises.map((ex, idx) => {
                const isChecked = Boolean(completedExerciseIds[ex.id]) || Boolean(log.trainingCompleted);
                return (
                  <TouchableOpacity
                    key={ex.id}
                    style={[styles.exerciseItemRow, isChecked && styles.exerciseItemRowChecked]}
                    activeOpacity={0.8}
                    onPress={() => handleToggleExercise(ex.id)}
                  >
                    <View style={[styles.checkCircle, isChecked && styles.checkCircleChecked]}>
                      <ThemedText style={styles.checkMarkText}>{isChecked ? '✓' : idx + 1}</ThemedText>
                    </View>

                    <View style={{ flex: 1 }}>
                      <ThemedText style={[styles.exerciseName, isChecked && styles.exerciseNameChecked]}>
                        {ex.n}
                      </ThemedText>
                      <View style={styles.exerciseMetaRow}>
                        <ThemedText style={styles.exerciseSeries}>{ex.s}</ThemedText>
                        <ThemedText style={styles.exerciseRpe}>• RPE {ex.targetRpe}</ThemedText>
                        <ThemedText style={styles.exerciseGroup}>• {ex.muscleGroup}</ThemedText>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* BOTÓN SELLAR ENTRENAMIENTO DEL DÍA */}
            <TouchableOpacity
              style={styles.sealWorkoutBtn}
              activeOpacity={0.85}
              onPress={handleSealWorkout}
            >
              <LinearGradient
                colors={log.trainingCompleted ? ['#059669', '#10B981', '#047857'] : ['#D4AF37', '#F59E0B', '#B45309']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sealWorkoutGradient}
              >
                <ThemedText style={styles.sealWorkoutText}>
                  {log.trainingCompleted ? '🏆 SESIÓN SELLADA EN EL PACTO (COMPLETADA)' : '⚔️ SELLAR SESIÓN OBLIGATORIA (+20 PTS)'}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* 2. TARJETA DE CALIFICACIÓN DEL DÍA & LOS 7 PILARES SAGRADOS */}
          <View style={styles.todayCard}>
            <View style={styles.todayCardHeader}>
              <View style={styles.scorePill}>
                <ThemedText style={styles.scoreText}>{todayGrade.score}</ThemedText>
                <ThemedText style={styles.scoreMax}>/100</ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.todayGradeLabel}>VEREDICTO DEL DÍA {cycle.currentDay}</ThemedText>
                <ThemedText style={[
                  styles.todayGradeStatus,
                  todayGrade.status === 'divine' ? { color: '#FFE259' } :
                  todayGrade.status === 'worthy' ? { color: '#00E676' } :
                  todayGrade.status === 'mediocre' ? { color: '#F59E0B' } : { color: '#EF4444' }
                ]}>
                  {todayGrade.status === 'divine' ? '👑 SEMIDIÓS (IMPECABLE)' :
                   todayGrade.status === 'worthy' ? '⚔️ DÍA DIGNO (CUMPLIDO)' :
                   todayGrade.status === 'mediocre' ? '⚠️ TIBIO / AL LÍMITE' : '💀 DÍA INDIGNO'}
                </ThemedText>
              </View>
            </View>

            {/* TABLA DE LOS 7 PILARES SAGRADOS */}
            <ThemedText style={styles.pillarsGridTitle}>🛡️ ESTADO DE LOS 7 PILARES OBLIGATORIOS:</ThemedText>
            
            <View style={styles.pillarsListGrid}>
              {/* 1. Entreno */}
              <View style={[styles.pillarRowCard, pillars.training && styles.pillarRowCardActive]}>
                <ThemedText style={styles.pillarRowIcon}>{pillars.training ? '✅' : '❌'}</ThemedText>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.pillarRowName}>1. Sesión Marcial de la Senda</ThemedText>
                  <ThemedText style={styles.pillarRowDesc}>{log.trainingCompleted ? 'Rutina sagrada sellada' : 'Falta sellar la rutina del día'}</ThemedText>
                </View>
                <ThemedText style={[styles.pillarRowPts, pillars.training && styles.pillarRowPtsActive]}>
                  {pillars.training ? '+20' : '0'}/20
                </ThemedText>
              </View>

              {/* 2. Pasos */}
              <View style={[styles.pillarRowCard, pillars.steps && styles.pillarRowCardActive]}>
                <ThemedText style={styles.pillarRowIcon}>{pillars.steps ? '✅' : '👟'}</ThemedText>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.pillarRowName}>2. Pasos Diarios ({log.steps || 0} / {log.stepGoal || 10000})</ThemedText>
                  <ThemedText style={styles.pillarRowDesc}>{pillars.steps ? 'Meta de movilidad alcanzada' : 'En camino hacia la meta'}</ThemedText>
                </View>
                <ThemedText style={[styles.pillarRowPts, pillars.steps && styles.pillarRowPtsActive]}>
                  {Math.round(todayGrade.stepsRatio * 20)}/20
                </ThemedText>
              </View>

              {/* 3. Nutrición */}
              <View style={[styles.pillarRowCard, pillars.nutrition && styles.pillarRowCardActive]}>
                <ThemedText style={styles.pillarRowIcon}>{pillars.nutrition ? '✅' : '🍽️'}</ThemedText>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.pillarRowName}>3. Ingesta de Alimentos & Macros</ThemedText>
                  <ThemedText style={styles.pillarRowDesc}>{pillars.nutrition ? `${log.mealsLogged || 1} comidas registradas (${log.totalCalories || 0} kcal)` : 'Sin registro de alimentos hoy'}</ThemedText>
                </View>
                <ThemedText style={[styles.pillarRowPts, pillars.nutrition && styles.pillarRowPtsActive]}>
                  {pillars.nutrition ? '+15' : '0'}/15
                </ThemedText>
              </View>

              {/* 4. Sueño */}
              <View style={[styles.pillarRowCard, pillars.sleep && styles.pillarRowCardActive]}>
                <ThemedText style={styles.pillarRowIcon}>{pillars.sleep ? '✅' : '🌙'}</ThemedText>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.pillarRowName}>4. Calidad de Sueño Anabólico</ThemedText>
                  <ThemedText style={styles.pillarRowDesc}>{pillars.sleep ? 'Registro de descanso validado' : 'Falta calibrar / registrar sueño'}</ThemedText>
                </View>
                <ThemedText style={[styles.pillarRowPts, pillars.sleep && styles.pillarRowPtsActive]}>
                  {pillars.sleep ? '+15' : '0'}/15
                </ThemedText>
              </View>

              {/* 5. Lectura / Reto Estoico */}
              <View style={[styles.pillarRowCard, pillars.stoicChallenge && styles.pillarRowCardActive]}>
                <ThemedText style={styles.pillarRowIcon}>{pillars.stoicChallenge ? '✅' : '📜'}</ThemedText>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.pillarRowName}>5. Lectura & Reto Estoico Diario</ThemedText>
                  <ThemedText style={styles.pillarRowDesc}>{pillars.stoicChallenge ? 'Prueba de temple superada' : 'Pendiente prueba o diario estoico'}</ThemedText>
                </View>
                <ThemedText style={[styles.pillarRowPts, pillars.stoicChallenge && styles.pillarRowPtsActive]}>
                  {pillars.stoicChallenge ? '+10' : '0'}/10
                </ThemedText>
              </View>

              {/* 6. Medición de Latidos */}
              <View style={[styles.pillarRowCard, pillars.heartRate && styles.pillarRowCardActive]}>
                <ThemedText style={styles.pillarRowIcon}>{pillars.heartRate ? '✅' : '🫀'}</ThemedText>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.pillarRowName}>6. Telemetría de Frecuencia Cardíaca</ThemedText>
                  <ThemedText style={styles.pillarRowDesc}>{pillars.heartRate ? `${log.smartDevice?.heartRateBpm || 60} BPM registrado` : 'Falta escaneo PPG o Smartwatch'}</ThemedText>
                </View>
                <ThemedText style={[styles.pillarRowPts, pillars.heartRate && styles.pillarRowPtsActive]}>
                  {pillars.heartRate ? '+10' : '0'}/10
                </ThemedText>
              </View>

              {/* 7. Info dada al Coach */}
              <View style={[styles.pillarRowCard, pillars.coachCheckIn && styles.pillarRowCardActive]}>
                <ThemedText style={styles.pillarRowIcon}>{pillars.coachCheckIn ? '✅' : '🏛️'}</ThemedText>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.pillarRowName}>7. Reporte al Coach / Check-in SNC</ThemedText>
                  <ThemedText style={styles.pillarRowDesc}>{pillars.coachCheckIn ? 'Preparación del SNC evaluada' : 'Falta realizar check-in matutino'}</ThemedText>
                </View>
                <ThemedText style={[styles.pillarRowPts, pillars.coachCheckIn && styles.pillarRowPtsActive]}>
                  {pillars.coachCheckIn ? '+10' : '0'}/10
                </ThemedText>
              </View>
            </View>

            <ThemedText style={styles.todayVerdictText}>{todayGrade.verdict}</ThemedText>
          </View>

          {/* 3. ADHERENCIA AL PLAN DE 30 DÍAS */}
          <View style={styles.adherenceCard}>
            <View style={styles.adherenceHeaderRow}>
              <ThemedText style={styles.adherenceTitle}>ADHERENCIA AL JUICIO DEL DÍA 30</ThemedText>
              <ThemedText style={[
                styles.adherencePercent,
                isAboveThreshold ? { color: '#00E676' } : { color: '#F59E0B' }
              ]}>
                {adherencePercent}% / 80% min
              </ThemedText>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[
                styles.progressBarFill,
                { width: `${Math.min(100, adherencePercent)}%` },
                isAboveThreshold ? { backgroundColor: '#00E676' } : { backgroundColor: '#F59E0B' }
              ]} />
            </View>
            <ThemedText style={styles.adherenceSub}>
              {victoriousDays} de 30 días cumplidos con honor militar ({30 - victoriousDays} días en deuda o pendientes).
            </ThemedText>
          </View>

          {/* 4. CONSTELACIÓN ESTELAR DE LOS 30 DÍAS */}
          <View style={styles.constellationCard}>
            <ThemedText style={styles.constellationTitle}>⚡ CONSTELACIÓN DE FUERZA (30 DÍAS)</ThemedText>
            <ThemedText style={styles.constellationDesc}>
              Cada estrella dorada es un día digno conquistado. Las calaveras rojas representan días indignos en deuda.
            </ThemedText>
            <View style={styles.starMap}>
              {fullMap.map((success, index) => {
                const isToday = index === (cycle.currentDay - 1);
                const isFuture = index >= cycle.currentDay;
                return (
                  <View 
                    key={index} 
                    style={[
                      styles.starContainer,
                      isToday && styles.todayContainer
                    ]}
                  >
                    <View style={[
                      styles.star,
                      success && !isFuture ? {
                        backgroundColor: '#FFE259',
                        shadowColor: '#D4AF37',
                        shadowOpacity: 1,
                        shadowRadius: 8,
                        elevation: 5,
                      } : !isFuture ? {
                        backgroundColor: 'rgba(239, 68, 68, 0.35)',
                        borderColor: '#EF4444',
                        borderWidth: 1,
                      } : {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                      },
                      isToday && { borderWidth: 2, borderColor: '#38BDF8' }
                    ]} />
                    <ThemedText style={[styles.starDayLabel, isToday && { color: '#38BDF8', fontWeight: 'bold' }]}>
                      D{index + 1}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          </View>

          {/* BOTÓN DEL JUICIO DEL DÍA 30 */}
          <TouchableOpacity
            style={styles.judgmentBtn}
            onPress={handleOpenJudgment}
            activeOpacity={0.85}
          >
            <View style={styles.judgmentBtnInner}>
              <ThemedText style={{ fontSize: 18 }}>⚖️</ThemedText>
              <ThemedText style={styles.judgmentBtnText}>
                CONSULTAR EL JUICIO DEL OLIMPO (DÍA 30)
              </ThemedText>
              <ThemedText style={{ fontSize: 18 }}>⚖️</ThemedText>
            </View>
          </TouchableOpacity>

          {/* MODAL PARA ACEPTAR / REINICIAR EL PACTO DE LOS 30 DÍAS */}
          <Modal
            visible={pactModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setPactModalVisible(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={[styles.modalCard, styles.modalCardSuccess]}>
                <ThemedText style={styles.modalEmblem}>🏛️</ThemedText>
                <ThemedText style={[styles.modalTitle, { color: '#FFE259' }]}>
                  PACTO SAGRADO DE LOS 30 DÍAS
                </ThemedText>
                <ThemedText style={styles.modalMessage}>
                  Al aceptar este reto en la <ThemedText style={{ color: '#FFE259', fontWeight: 'bold' }}>{activePathInfo.name.toUpperCase()}</ThemedText>, la cuenta regresiva comenzará en este instante exacto. Cada día deberás cumplir con los 7 pilares obligatorios. Si fallas, el día se registrará como <ThemedText style={{ color: '#EF4444', fontWeight: 'bold' }}>INDIGNO</ThemedText>.
                </ThemedText>

                <TouchableOpacity
                  style={styles.confirmPactBtn}
                  activeOpacity={0.85}
                  onPress={handleStartPact}
                >
                  <LinearGradient
                    colors={['#D4AF37', '#F59E0B', '#B45309']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sealWorkoutGradient}
                  >
                    <ThemedText style={styles.confirmPactBtnText}>
                      ⚡ SELLAR PACTO E INICIAR CUENTA (DÍA 1)
                    </ThemedText>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setPactModalVisible(false)}
                >
                  <ThemedText style={styles.closeModalBtnText}>CANCELAR</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* MODAL DEL JUICIO DEL DÍA 30 */}
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={[
                styles.modalCard,
                judgmentResult?.promoted ? styles.modalCardSuccess : styles.modalCardScold
              ]}>
                <ThemedText style={styles.modalEmblem}>
                  {judgmentResult?.promoted ? '👑' : '💀'}
                </ThemedText>
                <ThemedText style={[
                  styles.modalTitle,
                  judgmentResult?.promoted ? { color: '#FFE259' } : { color: '#EF4444' }
                ]}>
                  {judgmentResult?.title}
                </ThemedText>
                <ThemedText style={styles.modalMessage}>
                  {judgmentResult?.message}
                </ThemedText>

                {!judgmentResult?.promoted && (
                  <TouchableOpacity
                    style={styles.resetCycleBtn}
                    onPress={() => {
                      resetMonthlyCycle();
                      setModalVisible(false);
                    }}
                  >
                    <ThemedText style={styles.resetCycleBtnText}>
                      🔄 ACEPTAR REPRENSIÓN Y REINICIAR DÍA 1
                    </ThemedText>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <ThemedText style={styles.closeModalBtnText}>CERRAR JUICIO</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </ScrollView>
      </SafeAreaView>
    </PearlElectricBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  tierBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#FFE259',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginBottom: 6,
  },
  tierBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFE259',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  title: {
    fontSize: 24,
    fontFamily: 'serif',
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  pathSubheader: {
    fontSize: 11,
    color: '#D4AF37',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginTop: 2,
  },
  pactCard: {
    backgroundColor: 'rgba(14, 20, 36, 0.95)',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    borderRadius: 18,
    padding: 16,
    gap: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  pactCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pactStatusBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderWidth: 1,
    borderColor: '#FFE259',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pactStatusBadgeText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFE259',
    letterSpacing: 1,
  },
  pactDayCounterText: {
    fontSize: 12.5,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#38BDF8',
  },
  pactStartDateText: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  pactDescText: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  startPactBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  startPactGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startPactBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#050507',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  confirmPactBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    marginTop: 6,
  },
  confirmPactBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#050507',
    fontFamily: 'monospace',
    letterSpacing: 1,
    textAlign: 'center',
  },
  mandatoryCard: {
    backgroundColor: 'rgba(14, 20, 36, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.55)',
    borderRadius: 18,
    padding: 16,
    gap: 10,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  mandatoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mandatoryBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#FFE259',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  mandatoryBadgeText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFE259',
    letterSpacing: 1,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  mandatoryTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'serif',
  },
  mandatoryFocus: {
    fontSize: 11,
    color: '#D4AF37',
    fontFamily: 'monospace',
    marginTop: -4,
  },
  immutableNoticeBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 8,
    padding: 8,
  },
  immutableNoticeText: {
    fontSize: 10,
    color: '#CBD5E1',
    fontStyle: 'italic',
    lineHeight: 14,
  },
  exerciseList: {
    gap: 8,
    marginTop: 4,
  },
  exerciseItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
    borderRadius: 12,
    padding: 10,
  },
  exerciseItemRowChecked: {
    borderColor: 'rgba(16, 185, 129, 0.45)',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkMarkText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  exerciseName: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exerciseNameChecked: {
    color: '#6EE7B7',
    textDecorationLine: 'line-through',
  },
  exerciseMetaRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  exerciseSeries: {
    fontSize: 10,
    color: '#D4AF37',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  exerciseRpe: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  exerciseGroup: {
    fontSize: 10,
    color: '#38BDF8',
    fontFamily: 'monospace',
  },
  sealWorkoutBtn: {
    marginTop: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sealWorkoutGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealWorkoutText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#050507',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  optionalHintText: {
    fontSize: 9.5,
    color: '#94A3B8',
    textAlign: 'center',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  todayCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    gap: 10,
  },
  todayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scorePill: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#FFE259',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    flexDirection: 'row',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'monospace',
  },
  scoreMax: {
    fontSize: 10,
    color: '#D4AF37',
    fontFamily: 'monospace',
  },
  todayGradeLabel: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  todayGradeStatus: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  pillarsGridTitle: {
    fontSize: 10.5,
    color: '#D4AF37',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  pillarsListGrid: {
    gap: 6,
  },
  pillarRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pillarRowCardActive: {
    borderColor: 'rgba(16, 185, 129, 0.45)',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  pillarRowIcon: {
    fontSize: 15,
  },
  pillarRowName: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pillarRowDesc: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
    marginTop: 1,
  },
  pillarRowPts: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  pillarRowPtsActive: {
    color: '#10B981',
  },
  todayVerdictText: {
    fontSize: 10.5,
    color: '#CBD5E1',
    fontStyle: 'italic',
    lineHeight: 14,
  },
  adherenceCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    gap: 8,
  },
  adherenceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adherenceTitle: {
    fontSize: 10,
    color: '#D4AF37',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  adherencePercent: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  adherenceSub: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  constellationCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    gap: 8,
  },
  constellationTitle: {
    fontSize: 10,
    color: '#FFE259',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  constellationDesc: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 14,
  },
  starMap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginTop: 6,
  },
  starContainer: {
    alignItems: 'center',
    width: 24,
  },
  todayContainer: {
    transform: [{ scale: 1.15 }],
  },
  star: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  starDayLabel: {
    fontSize: 7.5,
    color: '#64748B',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  judgmentBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  judgmentBtnInner: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  judgmentBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#050507',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 4, 8, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1.5,
    gap: 12,
    alignItems: 'center',
  },
  modalCardSuccess: {
    borderColor: '#FFE259',
  },
  modalCardScold: {
    borderColor: '#EF4444',
  },
  modalEmblem: {
    fontSize: 36,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    fontFamily: 'serif',
  },
  modalMessage: {
    fontSize: 12,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 18,
  },
  resetCycleBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  resetCycleBtnText: {
    color: '#FCA5A5',
    fontWeight: 'bold',
    fontSize: 10.5,
    fontFamily: 'monospace',
  },
  closeModalBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeModalBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
