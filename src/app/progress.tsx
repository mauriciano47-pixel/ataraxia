import React, { useState } from 'react';
import { ActivityIndicator, View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useDailyLog, useHistoryLog } from '@/hooks/useDailyLog';
import { PearlElectricBackground } from '@/components/PearlElectricBackground';
import { LegendaryPath, LEGENDARY_PATHS, EquipmentType } from '@/types/onboarding';
import { SafeStorage } from '@/utils/safeStorage';
import { MonthlyResolution } from '@/lib/monthlyResolutionEngine';
import { HonorDiplomaModal } from '@/components/HonorDiplomaModal';
import { ExerciseTechniqueModal, ExerciseGuideData } from '@/components/ExerciseTechniqueModal';
import { JudgmentDossierModal } from '@/components/JudgmentDossierModal';
import { LockedDiplomaModal } from '@/components/LockedDiplomaModal';
import { MANDATORY_PROGRAM_MATRIX, ProgramExercise, PathEquipmentRoutine } from '@/constants/mandatoryProgramMatrix';
import { styles } from '@/styles/progress.styles';

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
  const [judgmentResult, setJudgmentResult] = useState<{ promoted: boolean; title: string; message: string; resolution?: MonthlyResolution } | null>(null);
  const [activeResolutionTab, setActiveResolutionTab] = useState<'verdict' | 'feedback' | 'audit'>('verdict');
  const [copiedDecree, setCopiedDecree] = useState(false);
  const [diplomaModalVisible, setDiplomaModalVisible] = useState(false);
  const [lockedDiplomaModalVisible, setLockedDiplomaModalVisible] = useState(false);

  // Estado local para los checkboxes de la sesión obligatoria del día
  const [completedExerciseIds, setCompletedExerciseIds] = useState<Record<string, boolean>>({});
  const [selectedGuideExercise, setSelectedGuideExercise] = useState<ExerciseGuideData | null>(null);

  const activePathKey = (log.legendaryPath as LegendaryPath) || 'spartan';
  const activePathInfo = LEGENDARY_PATHS[activePathKey] || LEGENDARY_PATHS.spartan;

  // Equipamiento activo: detectado del perfil, SafeStorage o fallback a 'gym'
  const initialEquip: EquipmentType =
    (log.prokoptonProfile?.equipment as EquipmentType) ||
    (SafeStorage.getItem('ataraxia_user_equipment_v1') as EquipmentType) ||
    activePathInfo.equipment ||
    'gym';

  const [activeEquipment, setActiveEquipment] = useState<EquipmentType>(initialEquip);

  React.useEffect(() => {
    if (log.prokoptonProfile?.equipment) {
      setActiveEquipment(log.prokoptonProfile.equipment);
    }
  }, [log.prokoptonProfile?.equipment]);

  const handleSelectEquipment = (equip: EquipmentType) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setActiveEquipment(equip);
    SafeStorage.setItem('ataraxia_user_equipment_v1', equip);
  };

  if (loading || loadingHistory) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#050507' }]}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <ThemedText style={{ marginTop: Spacing.three, color: '#D4AF37', fontFamily: 'monospace' }}>Conectando con el Oráculo...</ThemedText>
      </ThemedView>
    );
  }

  const pathRoutines = MANDATORY_PROGRAM_MATRIX[activePathKey] || MANDATORY_PROGRAM_MATRIX.spartan;
  const mandatoryProgram = pathRoutines[activeEquipment] || pathRoutines.gym;

  const cycle = log.monthlyCycle || {
    currentDay: 4,
    startDate: '2026-09-01T00:00:00.000Z',
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

  const currentDay = cycle.currentDay || 1;
  const isDay30Reached = currentDay >= 30 || Boolean(cycle.isJudgmentReady);
  const victoriousDays = fullMap.filter(Boolean).length;
  const adherencePercent = Math.round((victoriousDays / 30) * 100);
  const isAboveThreshold = adherencePercent >= 80;
  const isDiplomaUnlocked = isDay30Reached && isAboveThreshold;

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
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    const res = executeJudgment();
    setJudgmentResult(res);
    setActiveResolutionTab('verdict');
    setModalVisible(true);
  };

  const handleCopyDecree = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(judgmentResult?.resolution?.masterDecreeMarkdown || judgmentResult?.message || '');
        setCopiedDecree(true);
        setTimeout(() => setCopiedDecree(false), 3000);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          overScrollMode="never"
        >
          
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

          {/* 1. SECCIÓN OBLIGATORIA: SESIÓN MARCIAL DEL DÍA (ADAPTADA AL EQUIPAMIENTO) */}
          <View style={styles.mandatoryCard}>
            <View style={styles.mandatoryHeaderRow}>
              <View style={styles.mandatoryBadge}>
                <ThemedText style={styles.mandatoryBadgeText}>⚔️ PROGRAMA SAGRADO • OBLIGATORIO</ThemedText>
              </View>
              <ThemedText style={[styles.statusText, log.trainingCompleted ? { color: '#10B981' } : { color: '#F59E0B' }]}>
                {log.trainingCompleted ? 'SELLADO ✓ (+20 PTS)' : 'PENDIENTE (0/20)'}
              </ThemedText>
            </View>

            {/* SELECTOR INTERACTIVO DE EQUIPAMIENTO DEL DÍA */}
            <View style={styles.equipSelectorRow}>
              <TouchableOpacity
                style={[styles.equipChip, activeEquipment === 'gym' && styles.equipChipActive]}
                onPress={() => handleSelectEquipment('gym')}
                activeOpacity={0.8}
              >
                <ThemedText style={[styles.equipChipText, activeEquipment === 'gym' && styles.equipChipTextActive]}>
                  🏋️ Gimnasio
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.equipChip, activeEquipment === 'home_dumbbell' && styles.equipChipActive]}
                onPress={() => handleSelectEquipment('home_dumbbell')}
                activeOpacity={0.8}
              >
                <ThemedText style={[styles.equipChipText, activeEquipment === 'home_dumbbell' && styles.equipChipTextActive]}>
                  🏠 Mancuernas
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.equipChip, activeEquipment === 'calisthenics' && styles.equipChipActive]}
                onPress={() => handleSelectEquipment('calisthenics')}
                activeOpacity={0.8}
              >
                <ThemedText style={[styles.equipChipText, activeEquipment === 'calisthenics' && styles.equipChipTextActive]}>
                  🤸‍♂️ Calistenia
                </ThemedText>
              </TouchableOpacity>
            </View>

            <ThemedText style={styles.mandatoryTitle}>{mandatoryProgram.name}</ThemedText>
            <ThemedText style={styles.mandatoryFocus}>{mandatoryProgram.focus}</ThemedText>

            {/* AVISO DE INMUTABILIDAD & CALIBRACIÓN */}
            <View style={styles.immutableNoticeBox}>
              <ThemedText style={styles.immutableNoticeText}>
                🔒 Rutina inmutable calibrada para <ThemedText style={{ color: '#FFE259', fontWeight: 'bold' }}>{mandatoryProgram.equipmentLabel}</ThemedText>. Cumplir esta sesión es requisito sagrado para validar tu día.
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
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        <ThemedText style={[styles.exerciseName, isChecked && styles.exerciseNameChecked, { flex: 1 }]}>
                          {ex.n}
                        </ThemedText>
                        <TouchableOpacity
                          style={styles.techGuideBtn}
                          onPress={(e) => {
                            e.stopPropagation?.();
                            setSelectedGuideExercise({
                              id: ex.id,
                              name: ex.n,
                              setsReps: ex.s,
                              targetRpe: ex.targetRpe,
                              muscleGroup: ex.muscleGroup,
                              cue: ex.cue,
                            });
                          }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="help-circle-outline" size={13} color="#050507" />
                          <ThemedText style={styles.techGuideBtnText}>Técnica</ThemedText>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.exerciseMetaRow}>
                        <ThemedText style={styles.exerciseSeries}>{ex.s}</ThemedText>
                        <ThemedText style={styles.exerciseRpe}>• RPE {ex.targetRpe}</ThemedText>
                        <ThemedText style={styles.exerciseGroup}>• {ex.muscleGroup}</ThemedText>
                      </View>
                      <ThemedText style={styles.exerciseCue}>💡 {ex.cue}</ThemedText>
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

            <ThemedText style={styles.optionalHintText}>
              💡 ¿Quieres más entreno? Usa la pestaña "Entreno" para sesiones libres o con IA (Opcional).
            </ThemedText>
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
                  <ThemedText style={styles.pillarRowDesc}>{pillars.heartRate ? `${log.smartDevice?.heartRateBpm} BPM registrado` : 'Falta escaneo PPG o Smartwatch'}</ThemedText>
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
              {Array.from({ length: 30 }).map((_, index) => {
                const dayNum = index + 1;
                const isToday = index === (currentDay - 1);
                const isPast = dayNum < currentDay;
                const isFuture = dayNum > currentDay;

                const pastGrade = (cycle.dailyGrades || []).find((g) => g && g.day === dayNum);
                const isPastWorthy = pastGrade ? (pastGrade.score >= 75) : (fullMap[index] ?? false);
                const isDayWorthy = isToday ? isTodaySuccess : isPastWorthy;

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
                      isDayWorthy && !isFuture ? {
                        backgroundColor: '#FFE259',
                        shadowColor: '#D4AF37',
                        shadowOpacity: 1,
                        shadowRadius: 8,
                        elevation: 5,
                      } : isPast ? {
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
                      D{dayNum}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          </View>

          {/* SECCIÓN DEL DIPLOMA DE HONOR ESTOICO (BLOQUEADO HASTA EL DÍA 30 CON >=80% DÍAS GOBERNADOS) */}
          {isDiplomaUnlocked ? (
            <TouchableOpacity
              style={styles.diplomaBannerBtn}
              onPress={() => {
                try {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } catch {}
                setDiplomaModalVisible(true);
              }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#D4AF37', '#FFE259', '#B45309']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.diplomaBannerGradient}
              >
                <ThemedText style={{ fontSize: 28 }}>👑</ThemedText>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.diplomaBannerTag}>
                    CONQUISTA DEL DÍA 30 • {adherencePercent}% GOBERNADO
                  </ThemedText>
                  <ThemedText style={styles.diplomaBannerTitle}>DIPLOMA DE HONOR ESTOICO</ThemedText>
                  <ThemedText style={styles.diplomaBannerSub}>
                    📜 Toca para ver tu Diploma Oficial y la Evaluación Final del Coach
                  </ThemedText>
                </View>
                <Ionicons name="ribbon" size={26} color="#050507" />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.diplomaLockedCard}
              onPress={() => setLockedDiplomaModalVisible(true)}
              activeOpacity={0.85}
            >
              <View style={styles.diplomaLockedHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                  <ThemedText style={{ fontSize: 24 }}>🔒</ThemedText>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.diplomaLockedTag}>
                      REQUISITOS DE GRADUACIÓN DEL SANTUARIO
                    </ThemedText>
                    <ThemedText style={styles.diplomaLockedTitle}>
                      DIPLOMA DE HONOR (BLOQUEADO)
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.diplomaLockBadge}>
                  <Ionicons name="lock-closed" size={13} color="#F59E0B" />
                  <ThemedText style={styles.diplomaLockBadgeText}>
                    DÍA {currentDay}/30
                  </ThemedText>
                </View>
              </View>

              {/* Medidores de Progreso de Desbloqueo */}
              <View style={styles.diplomaProgressBoxes}>
                <View style={styles.diplomaProgBox}>
                  <ThemedText style={styles.diplomaProgVal}>Día {currentDay} / 30</ThemedText>
                  <ThemedText style={styles.diplomaProgLbl}>Evaluación de 30 Días</ThemedText>
                  <View style={styles.diplomaMiniTrack}>
                    <View style={[styles.diplomaMiniFill, { width: `${Math.min(100, Math.round((currentDay / 30) * 100))}%`, backgroundColor: isDay30Reached ? '#10B981' : '#38BDF8' }]} />
                  </View>
                </View>

                <View style={styles.diplomaProgBox}>
                  <ThemedText style={[styles.diplomaProgVal, isAboveThreshold ? { color: '#10B981' } : { color: '#F59E0B' }]}>
                    {adherencePercent}% / 80%
                  </ThemedText>
                  <ThemedText style={styles.diplomaProgLbl}>Días Gobernados ({victoriousDays}/24)</ThemedText>
                  <View style={styles.diplomaMiniTrack}>
                    <View style={[styles.diplomaMiniFill, { width: `${Math.min(100, adherencePercent)}%`, backgroundColor: isAboveThreshold ? '#10B981' : '#F59E0B' }]} />
                  </View>
                </View>
              </View>

              <ThemedText style={styles.diplomaLockedNotice}>
                «El diploma y la evaluación final del coach con recomendaciones se otorgarán únicamente al finalizar el <ThemedText style={{ color: '#FFE259', fontWeight: 'bold' }}>Día 30</ThemedText> si gobiernas al menos el <ThemedText style={{ color: '#FFE259', fontWeight: 'bold' }}>80% de los días</ThemedText> (mínimo 24 días dignos).»
              </ThemedText>
            </TouchableOpacity>
          )}

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

          {/* MODAL DEL JUICIO DEL DÍA 30 • DOSSIER SAGRADO */}
          <JudgmentDossierModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            judgmentResult={judgmentResult}
            activeResolutionTab={activeResolutionTab}
            setActiveResolutionTab={setActiveResolutionTab}
            cycle={cycle}
            handleCopyDecree={handleCopyDecree}
            copiedDecree={copiedDecree}
            adherencePercent={adherencePercent}
            onOpenDiploma={() => {
              setModalVisible(false);
              setDiplomaModalVisible(true);
            }}
            onResetCycle={() => {
              resetMonthlyCycle();
              setModalVisible(false);
            }}
            styles={styles}
          />

          {/* MODAL INFORMATIVO DE DIPLOMA BLOQUEADO */}
          <LockedDiplomaModal
            visible={lockedDiplomaModalVisible}
            onClose={() => setLockedDiplomaModalVisible(false)}
            isDay30Reached={isDay30Reached}
            currentDay={currentDay}
            isAboveThreshold={isAboveThreshold}
            adherencePercent={adherencePercent}
            victoriousDays={victoriousDays}
            styles={styles}
          />

          {/* MODAL DEL DIPLOMA DE HONOR */}
          <HonorDiplomaModal
            visible={diplomaModalVisible}
            onClose={() => setDiplomaModalVisible(false)}
            userName={log.userName || 'Ciudadano Prokopton'}
            path={activePathKey}
            scoreAverage={judgmentResult?.resolution?.totalScoreAverage ?? cycle.averageScore}
            adherencePct={judgmentResult?.resolution?.adherencePct ?? adherencePercent}
            tier={judgmentResult?.resolution?.tierAwarded || cycle.tier}
            coachArchetype={log.coachArchetype || 'stoic_mentor'}
            observations={judgmentResult?.resolution?.praises}
            recommendations={judgmentResult?.resolution?.nextCycleDirectives}
          />

          {/* MODAL DE GUÍA TÉCNICA Y BIOMECÁNICA PASO A PASO */}
          <ExerciseTechniqueModal
            visible={Boolean(selectedGuideExercise)}
            exercise={selectedGuideExercise}
            onClose={() => setSelectedGuideExercise(null)}
          />

        </ScrollView>
      </SafeAreaView>
    </PearlElectricBackground>
  );
}
