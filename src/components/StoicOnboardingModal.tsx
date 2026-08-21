import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ProkoptonProfile,
  StoicFocus,
  EquipmentType,
  DaysPerWeek,
  SessionDurationMinutes,
  DietPreference,
  CustomExercise,
  LegendaryPath,
  LEGENDARY_PATHS,
} from '@/types/onboarding';
import { useDailyLog } from '@/hooks/useDailyLog';
import { Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  onComplete?: (profile: ProkoptonProfile) => void;
}

export function StoicOnboardingModal({ visible, onClose, onComplete }: Props) {
  const { saveOnboardingProfile, selectLegendaryPath } = useDailyLog();

  const [step, setStep] = useState<number>(1);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Senda elegida (Paso 1)
  const [selectedPath, setSelectedPath] = useState<LegendaryPath>('spartan');

  // Calibración Biométrica & Equipamiento (Paso 2)
  const [userName, setUserName] = useState<string>('Guerrero');
  const [equipment, setEquipment] = useState<EquipmentType>('gym');
  const [daysPerWeek, setDaysPerWeek] = useState<DaysPerWeek>(4);
  const [sessionDuration, setSessionDuration] = useState<SessionDurationMinutes>(45);
  const [age, setAge] = useState<string>('28');
  const [weightKg, setWeightKg] = useState<string>('78');
  const [heightCm, setHeightCm] = useState<string>('176');

  // Cálculo del Plan Personalizado
  const generateCalculatedPlan = (): {
    routine: CustomExercise[];
    targetCals: number;
    proteinGrams: number;
    carbsGrams: number;
    fatsGrams: number;
    stepGoal: number;
  } => {
    const ageNum = parseInt(age, 10) || 28;
    const weightNum = parseFloat(weightKg) || 78;
    const heightNum = parseFloat(heightCm) || 176;
    const pathInfo = LEGENDARY_PATHS[selectedPath];

    // BMR Fórmula Mifflin-St Jeor
    const bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
    const activityMult = daysPerWeek >= 5 ? 1.55 : daysPerWeek >= 4 ? 1.4 : 1.25;
    const tdee = Math.round(bmr * activityMult);
    const targetCals = Math.max(1450, tdee + pathInfo.recommendedCalsDelta);

    // Macros
    const proteinGrams = Math.round(weightNum * pathInfo.targetProteinGPerKg);
    const fatsGrams = Math.round((targetCals * 0.25) / 9);
    const remainingCals = targetCals - (proteinGrams * 4) - (fatsGrams * 9);
    const carbsGrams = Math.max(80, Math.round(remainingCals / 4));

    // Meta de Pasos según la Senda
    const stepGoal = selectedPath === 'hoplite' ? 12000 : selectedPath === 'apollo' ? 10000 : selectedPath === 'spartan' ? 8000 : 9000;

    // Rutina adaptada a la Senda + Equipamiento + Tiempo
    let routine: CustomExercise[] = [];

    if (selectedPath === 'spartan') {
      if (equipment === 'gym') {
        routine = [
          { id: 'sp1', n: 'Sentadilla Trasera con Barra Olímpica', s: '4x6 (Pesado RIR 2)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Piernas' },
          { id: 'sp2', n: 'Press de Banca Plano con Barra', s: '4x6 (Sobrecarga Progresiva)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho' },
          { id: 'sp3', n: 'Peso Muerto Convencional', s: '3x5 (Poder Espartano)', targetRpe: 9.0, done: false, rpe: null, muscleGroup: 'Espalda' },
          { id: 'sp4', n: 'Press Militar de Pie con Barra', s: '3x8 (Estricto)', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Hombros' },
          { id: 'sp5', n: 'Remo Pendlay con Barra', s: '4x8 (Espalda Densa)', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Espalda' },
        ];
      } else if (equipment === 'home_dumbbell') {
        routine = [
          { id: 'sph1', n: 'Goblet Squat Pesado con Pausa', s: '4x10 (RIR 1)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Piernas' },
          { id: 'sph2', n: 'Press de Pecho en Suelo (Floor Press)', s: '4x10 (Pesado)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho' },
          { id: 'sph3', n: 'Peso Muerto Rumano con Mancuernas', s: '4x10 (Cadena Posterior)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Isquios' },
          { id: 'sph4', n: 'Press Militar con Mancuernas de Pie', s: '3x10 (Hombros)', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Hombros' },
        ];
      } else {
        routine = [
          { id: 'spc1', n: 'Dominadas Lastradas / Isométricas', s: '4x6 (Fuerza)', targetRpe: 9.0, done: false, rpe: null, muscleGroup: 'Espalda' },
          { id: 'spc2', n: 'Fondos en Paralelas / Dips', s: '4x8 (Pecho/Tríceps)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho' },
          { id: 'spc3', n: 'Pistol Squats (Sentadillas a 1 pierna)', s: '4x6 por pierna', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Piernas' },
          { id: 'spc4', n: 'Flexiones Diamante Espartanas', s: '3x al fallo técnico', targetRpe: 9.0, done: false, rpe: null, muscleGroup: 'Tríceps' },
        ];
      }
    } else if (selectedPath === 'hoplite') {
      routine = [
        { id: 'hop1', n: 'Circuito de Resistencia Hoplita (Burpees + Zancadas)', s: '4 rondas x 45 seg', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Full Body' },
        { id: 'hop2', n: 'Caminata Rápida / Trote NeAT Zona 2', s: '35 minutos continuos', targetRpe: 7.0, done: false, rpe: null, muscleGroup: 'Cardiovascular' },
        { id: 'hop3', n: 'Flexiones Tácticas con Pausa', s: '4x15 reps', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Pecho' },
        { id: 'hop4', n: 'Dominadas Pronas Estrictas', s: '4x8 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Espalda' },
        { id: 'hop5', n: 'Plancha Abdominal de Acero', s: '3x60 seg', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Core' },
      ];
    } else if (selectedPath === 'apollo') {
      routine = [
        { id: 'ap1', n: 'Press Inclinado con Mancuernas (Énfasis Superior)', s: '4x10-12 (Ardor)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho' },
        { id: 'ap2', n: 'Elevaciones Laterales Estrictas (Hombros en V)', s: '4x15 (Bombeo)', targetRpe: 9.0, done: false, rpe: null, muscleGroup: 'Hombros' },
        { id: 'ap3', n: 'Jalón al Pecho con Agarre Neutro (Tempo 3-1-1)', s: '4x10 (Espalda)', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Espalda' },
        { id: 'ap4', n: 'Sentadilla Búlgara Esculpida', s: '3x12 por pierna', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Piernas' },
        { id: 'ap5', n: 'Elevación de Piernas Colgado (V-Cut Abs)', s: '4x15 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Core' },
      ];
    } else {
      // Filósofo Guerrero (Calistenia + Temple)
      routine = [
        { id: 'ph1', n: 'Dominadas Estrictas en Barra (Autodominio)', s: '4x10 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Espalda' },
        { id: 'ph2', n: 'Flexiones en Suelo Militares (Cadencia 2-1-1)', s: '4x15 reps', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Pecho' },
        { id: 'ph3', n: 'Sentadillas Profundas de Calistenia', s: '4x25 reps', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Piernas' },
        { id: 'ph4', n: 'Elevación de Piernas en Barra', s: '4x12 reps', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Core' },
        { id: 'ph5', n: 'Plancha Abdominal Estoica (Respiración Calmada)', s: '3x60 seg', targetRpe: 8.0, done: false, rpe: null, muscleGroup: 'Mente/Core' },
      ];
    }

    return { routine, targetCals, proteinGrams, carbsGrams, fatsGrams, stepGoal };
  };

  const handleFinish = async () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      const plan = generateCalculatedPlan();
      const pathInfo = LEGENDARY_PATHS[selectedPath];

      const profile: ProkoptonProfile = {
        userName: userName.trim() || 'Guerrero',
        focus: pathInfo.focus,
        equipment,
        daysPerWeek,
        sessionDurationMinutes: sessionDuration,
        dietPreference: pathInfo.dietPreference,
        age: parseInt(age, 10) || 28,
        weightKg: parseFloat(weightKg) || 78,
        targetWeightKg: selectedPath === 'spartan' ? (parseFloat(weightKg) + 3) : (parseFloat(weightKg) - 3),
        heightCm: parseFloat(heightCm) || 176,
        completedAt: new Date().toISOString(),
        legendaryPath: selectedPath,
      };

      saveOnboardingProfile(profile, plan.routine, plan.targetCals);
      selectLegendaryPath(selectedPath);

      if (onComplete) onComplete(profile);
      setIsAnalyzing(false);
      onClose();
    }, 1200);
  };

  const pathsKeys: LegendaryPath[] = ['spartan', 'hoplite', 'apollo', 'philosopher'];
  const activePathInfo = LEGENDARY_PATHS[selectedPath];
  const calculatedPlan = generateCalculatedPlan();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.cardContainer}>
          {/* HEADER PRINCIPAL */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.badgeTop}>🏛️ INICIACIÓN ESTOICA • CICLO DE 30 DÍAS</Text>
              <Text style={styles.titleMain}>
                {step === 1 && 'ELIGE TU SENDA LEGENDARIA'}
                {step === 2 && 'CALIBRACIÓN BIOMÉTRICA'}
                {step === 3 && 'FORJA DE TU DESTINO'}
              </Text>
            </View>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>Paso {step}/3</Text>
            </View>
          </View>

          {/* CONTENIDO SEGÚN EL PASO */}
          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* ========================================================================= */}
            {/* PASO 1: ELECCIÓN DE LA SENDA LEGENDARIA */}
            {/* ========================================================================= */}
            {step === 1 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepDescription}>
                  Tu elección forjará tu rutina mensual, tus calorías y la severidad del Coach. Al Día 30 serás juzgado: <Text style={{ color: '#FFE259', fontWeight: 'bold' }}>ascenso o reprensión</Text>.
                </Text>

                {pathsKeys.map((key) => {
                  const p = LEGENDARY_PATHS[key];
                  const isSelected = selectedPath === key;

                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.pathOptionCard, isSelected && styles.pathOptionSelected]}
                      onPress={() => setSelectedPath(key)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.pathHeaderRow}>
                        <View style={[styles.pathIconCircle, isSelected && styles.pathIconCircleActive]}>
                          <Text style={{ fontSize: 20 }}>{p.icon}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.pathTitleText, isSelected && styles.pathTitleTextActive]}>
                            {p.name}
                          </Text>
                          <Text style={styles.pathSubText}>{p.subtitle}</Text>
                        </View>
                        <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                      </View>

                      <Text style={styles.pathDescBody}>{p.description}</Text>

                      <View style={styles.pathMottoBox}>
                        <Text style={styles.pathMottoText}>{p.motto}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* ========================================================================= */}
            {/* PASO 2: CALIBRACIÓN BIOMÉTRICA & EQUIPAMIENTO */}
            {/* ========================================================================= */}
            {step === 2 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepDescription}>
                  Ajusta tus parámetros físicos reales para que el motor calcule tus calorías exactas y adapte los ejercicios a tu entorno.
                </Text>

                {/* Nombre */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>NOMBRE DE GUERRERO / USUARIO</Text>
                  <TextInput
                    style={styles.textInput}
                    value={userName}
                    onChangeText={setUserName}
                    placeholder="Ej. Marco"
                    placeholderTextColor="#64748B"
                  />
                </View>

                {/* Equipamiento */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>EQUIPAMIENTO DISPONIBLE</Text>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.choiceBtn, equipment === 'gym' && styles.choiceBtnActive]}
                      onPress={() => setEquipment('gym')}
                    >
                      <Text style={[styles.choiceBtnText, equipment === 'gym' && styles.choiceBtnTextActive]}>
                        🏋️ Gimnasio
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.choiceBtn, equipment === 'home_dumbbell' && styles.choiceBtnActive]}
                      onPress={() => setEquipment('home_dumbbell')}
                    >
                      <Text style={[styles.choiceBtnText, equipment === 'home_dumbbell' && styles.choiceBtnTextActive]}>
                        🏠 Mancuernas
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.choiceBtn, equipment === 'calisthenics' && styles.choiceBtnActive]}
                      onPress={() => setEquipment('calisthenics')}
                    >
                      <Text style={[styles.choiceBtnText, equipment === 'calisthenics' && styles.choiceBtnTextActive]}>
                        🤸 Calistenia
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Tiempo por Sesión */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>TIEMPO DISPONIBLE POR SESIÓN</Text>
                  <View style={styles.buttonRow}>
                    {[30, 45, 60].map((mins) => (
                      <TouchableOpacity
                        key={mins}
                        style={[styles.choiceBtn, sessionDuration === mins && styles.choiceBtnActive]}
                        onPress={() => setSessionDuration(mins as SessionDurationMinutes)}
                      >
                        <Text style={[styles.choiceBtnText, sessionDuration === mins && styles.choiceBtnTextActive]}>
                          ⏱️ {mins} mins
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Días por Semana */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>FRECUENCIA SEMANAL DE ENTRENO</Text>
                  <View style={styles.buttonRow}>
                    {[3, 4, 5, 6].map((days) => (
                      <TouchableOpacity
                        key={days}
                        style={[styles.choiceBtn, daysPerWeek === days && styles.choiceBtnActive]}
                        onPress={() => setDaysPerWeek(days as DaysPerWeek)}
                      >
                        <Text style={[styles.choiceBtnText, daysPerWeek === days && styles.choiceBtnTextActive]}>
                          {days} días
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Métricas Corporales: Peso, Altura, Edad */}
                <View style={styles.metricsRow}>
                  <View style={styles.metricInputCol}>
                    <Text style={styles.inputLabel}>PESO (KG)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={weightKg}
                      onChangeText={setWeightKg}
                    />
                  </View>
                  <View style={styles.metricInputCol}>
                    <Text style={styles.inputLabel}>ALTURA (CM)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={heightCm}
                      onChangeText={setHeightCm}
                    />
                  </View>
                  <View style={styles.metricInputCol}>
                    <Text style={styles.inputLabel}>EDAD</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={age}
                      onChangeText={setAge}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* ========================================================================= */}
            {/* PASO 3: FORJA Y RESUMEN DEL PACTO DE 30 DÍAS */}
            {/* ========================================================================= */}
            {step === 3 && (
              <View style={styles.stepContent}>
                {/* Banner de la Senda */}
                <View style={styles.summarySendaBanner}>
                  <View style={styles.summaryIconBox}>
                    <Text style={{ fontSize: 26 }}>{activePathInfo.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.summarySendaName}>{activePathInfo.name}</Text>
                    <Text style={styles.summarySendaSub}>{activePathInfo.subtitle}</Text>
                  </View>
                </View>

                {/* Panel de Métricas Forjadas */}
                <View style={styles.summaryStatsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>CALORÍAS DIARIAS</Text>
                    <Text style={styles.statBoxValue}>{calculatedPlan.targetCals} <Text style={styles.statUnit}>kcal</Text></Text>
                  </View>

                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>META DE PROTEÍNA</Text>
                    <Text style={styles.statBoxValue}>{calculatedPlan.proteinGrams}g <Text style={styles.statUnit}>/ día</Text></Text>
                  </View>

                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>META DE PASOS</Text>
                    <Text style={styles.statBoxValue}>{calculatedPlan.stepGoal.toLocaleString()} <Text style={styles.statUnit}>pasos</Text></Text>
                  </View>

                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>SESIONES/SEM</Text>
                    <Text style={styles.statBoxValue}>{daysPerWeek} <Text style={styles.statUnit}>días x {sessionDuration}m</Text></Text>
                  </View>
                </View>

                {/* Vista Previa de la Rutina Base */}
                <View style={styles.routinePreviewBox}>
                  <Text style={styles.routinePreviewTitle}>⚔️ RUTINA INICIAL FORJADA ({calculatedPlan.routine.length} EJERCICIOS)</Text>
                  {calculatedPlan.routine.map((ex, idx) => (
                    <View key={ex.id || idx} style={styles.routinePreviewItem}>
                      <Text style={styles.routineExIndex}>{idx + 1}.</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.routineExName}>{ex.n}</Text>
                        <Text style={styles.routineExSets}>{ex.s} • {ex.muscleGroup || 'Full Body'}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Advertencia del Juicio del Día 30 */}
                <View style={styles.pactNoticeBox}>
                  <Text style={styles.pactNoticeTitle}>⚖️ PACTO SAGRADO DEL DÍA 30</Text>
                  <Text style={styles.pactNoticeBody}>
                    Al completar los 30 días con más del 80% de disciplina en Entreno, Pasos, Agua y Nutrición, serás promovido de rango. Cada día cuenta.
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* BOTONES DE NAVEGACIÓN INFERIOR */}
          <View style={styles.footerRow}>
            {step > 1 && (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setStep((prev) => prev - 1)}
                activeOpacity={0.8}
              >
                <Text style={styles.backBtnText}>← Atrás</Text>
              </TouchableOpacity>
            )}

            {step < 3 ? (
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={() => setStep((prev) => prev + 1)}
                activeOpacity={0.85}
              >
                <Text style={styles.nextBtnText}>Continuar →</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.finishBtn}
                onPress={handleFinish}
                disabled={isAnalyzing}
                activeOpacity={0.85}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color="#04060A" size="small" />
                ) : (
                  <Text style={styles.finishBtnText}>⚡ CONSAGRAR PACTO Y COMENZAR</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 3, 6, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '92%',
    backgroundColor: 'rgba(10, 14, 24, 0.98)',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    padding: Spacing.four,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.20)',
    paddingBottom: Spacing.three,
    marginBottom: Spacing.three,
  },
  badgeTop: {
    fontSize: 9.5,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#D4AF37',
    letterSpacing: 1.5,
  },
  titleMain: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  stepBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#FFE259',
  },
  scrollBody: {
    maxHeight: 460,
  },
  stepContent: {
    gap: Spacing.three,
  },
  stepDescription: {
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 4,
  },
  pathOptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    padding: Spacing.three,
  },
  pathOptionSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  pathHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pathIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathIconCircleActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    borderWidth: 1,
    borderColor: '#FFE259',
  },
  pathTitleText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#E2E8F0',
  },
  pathTitleTextActive: {
    color: '#FFE259',
  },
  pathSubText: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#FFE259',
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#FFE259',
  },
  pathDescBody: {
    fontSize: 11.5,
    color: '#CBD5E1',
    lineHeight: 16,
    marginTop: 8,
  },
  pathMottoBox: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 6,
    borderLeftWidth: 2,
    borderLeftColor: '#D4AF37',
  },
  pathMottoText: {
    fontSize: 10.5,
    fontStyle: 'italic',
    color: '#FDE68A',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#D4AF37',
    letterSpacing: 1,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.30)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  choiceBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderColor: '#D4AF37',
  },
  choiceBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  choiceBtnTextActive: {
    color: '#FFE259',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricInputCol: {
    flex: 1,
    gap: 6,
  },
  summarySendaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#D4AF37',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  summaryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summarySendaName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFE259',
  },
  summarySendaSub: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  summaryStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBox: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.20)',
    padding: 10,
  },
  statBoxLabel: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  statBoxValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  statUnit: {
    fontSize: 10,
    color: '#FFE259',
    fontWeight: 'normal',
  },
  routinePreviewBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: Spacing.three,
    gap: 8,
  },
  routinePreviewTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#D4AF37',
    letterSpacing: 1,
  },
  routinePreviewItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingVertical: 2,
  },
  routineExIndex: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F59E0B',
    fontFamily: 'monospace',
  },
  routineExName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  routineExSets: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  pactNoticeBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
    padding: 10,
    gap: 4,
  },
  pactNoticeTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'monospace',
  },
  pactNoticeBody: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#94A3B8',
    fontWeight: 'bold',
    fontSize: 12,
  },
  nextBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    color: '#04060A',
    fontWeight: '900',
    fontFamily: 'monospace',
    fontSize: 12.5,
  },
  finishBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FFE259',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishBtnText: {
    color: '#04060A',
    fontWeight: '900',
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
