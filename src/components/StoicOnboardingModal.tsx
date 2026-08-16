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
} from '@/types/onboarding';
import { useDailyLog } from '@/hooks/useDailyLog';

interface Props {
  visible: boolean;
  onClose: () => void;
  onComplete?: (profile: ProkoptonProfile) => void;
}

export function StoicOnboardingModal({ visible, onClose, onComplete }: Props) {
  const { saveOnboardingProfile } = useDailyLog();

  const [step, setStep] = useState<number>(1);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Form state
  const [userName, setUserName] = useState<string>('Prokopton');
  const [focus, setFocus] = useState<StoicFocus>('strength');
  const [equipment, setEquipment] = useState<EquipmentType>('gym');
  const [daysPerWeek, setDaysPerWeek] = useState<DaysPerWeek>(4);
  const [sessionDuration, setSessionDuration] = useState<SessionDurationMinutes>(45);
  const [dietPreference, setDietPreference] = useState<DietPreference>('deficit');
  const [age, setAge] = useState<string>('26');
  const [weightKg, setWeightKg] = useState<string>('75');
  const [targetWeightKg, setTargetWeightKg] = useState<string>('70');
  const [heightCm, setHeightCm] = useState<string>('175');

  const generateCalculatedPlan = (): { routine: CustomExercise[]; targetCals: number } => {
    const ageNum = parseInt(age, 10) || 26;
    const weightNum = parseFloat(weightKg) || 75;
    const heightNum = parseFloat(heightCm) || 175;

    // Mifflin-St Jeor BMR
    const bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
    const activityMult = daysPerWeek >= 5 ? 1.55 : daysPerWeek >= 4 ? 1.4 : 1.25;
    let tdee = Math.round(bmr * activityMult);

    if (dietPreference === 'deficit') tdee -= 400;
    else if (dietPreference === 'surplus') tdee += 350;

    const targetCals = Math.max(1400, tdee);

    // Build routine according to equipment, focus & sessionDuration
    let routine: CustomExercise[] = [];

    if (equipment === 'gym') {
      if (focus === 'strength') {
        if (sessionDuration <= 30) {
          routine = [
            { id: 'gs1', n: 'Sentadilla Trasera Pesada con Barra', s: '4x6 (RIR 2)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Piernas' },
            { id: 'gs2', n: 'Press de Banca Plano con Barra', s: '4x6 (RIR 2)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho' },
            { id: 'gs3', n: 'Remo Pendlay con Barra Olímpica', s: '3x6 (RIR 2)', targetRpe: 8, done: false, rpe: null, muscleGroup: 'Espalda' },
          ];
        } else if (sessionDuration <= 45) {
          routine = [
            { id: 'gs1', n: 'Sentadilla Libre con Barra', s: '4x6 (RIR 2)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Piernas' },
            { id: 'gs2', n: 'Press de Banca Plano con Barra', s: '4x6 (RIR 2)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho' },
            { id: 'gs3', n: 'Peso Muerto Convencional / Rumano', s: '3x5 (RIR 2)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Cadena Posterior' },
            { id: 'gs4', n: 'Press Militar de Hombros de Pie', s: '3x8 (RIR 2)', targetRpe: 8, done: false, rpe: null, muscleGroup: 'Hombros' },
          ];
        } else {
          routine = [
            { id: 'gs1', n: 'Sentadilla Trasera con Barra', s: '4x6 (RIR 2)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Piernas' },
            { id: 'gs2', n: 'Press Banca Plano con Barra', s: '4x6 (RIR 2)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho' },
            { id: 'gs3', n: 'Peso Muerto Rumano', s: '4x8 (RIR 2)', targetRpe: 8, done: false, rpe: null, muscleGroup: 'Isquios' },
            { id: 'gs4', n: 'Dominadas Lastradas o Jalón al Pecho', s: '4x8 (RIR 2)', targetRpe: 8, done: false, rpe: null, muscleGroup: 'Espalda' },
            { id: 'gs5', n: 'Press Militar con Barra', s: '3x8 (RIR 2)', targetRpe: 8, done: false, rpe: null, muscleGroup: 'Hombros' },
            { id: 'gs6', n: 'Curl de Bíceps con Barra Z', s: '3x10 (RIR 1)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Brazos' },
          ];
        }
      } else if (focus === 'fat_loss') {
        if (sessionDuration <= 30) {
          routine = [
            { id: 'gf1', n: 'Sentadilla Hack en Máquina', s: '4x12 (Tempo 3-0-1)', targetRpe: 8, done: false, rpe: null, muscleGroup: 'Piernas' },
            { id: 'gf2', n: 'Press Inclinado con Mancuernas', s: '4x12 (Densidad)', targetRpe: 8, done: false, rpe: null, muscleGroup: 'Pecho' },
            { id: 'gf3', n: 'Remo Gironda en Polea Baja', s: '4x12 + Drop Set', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Espalda' },
          ];
        } else {
          routine = [
            { id: 'gf1', n: 'Prensa 45° con Pies Altos', s: '4x15 (Ardor Metabólico)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Piernas' },
            { id: 'gf2', n: 'Press Plano en Máquina Convergente', s: '4x12 (RIR 1)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho' },
            { id: 'gf3', n: 'Jalón al Pecho Agarre Neutro', s: '4x12 (Controlado)', targetRpe: 8, done: false, rpe: null, muscleGroup: 'Espalda' },
            { id: 'gf4', n: 'Elevaciones Laterales en Polea', s: '3x15 (Bombeo)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Hombros' },
            { id: 'gf5', n: 'Plancha Abdominal con Disco', s: '3x45 seg (Core Activo)', targetRpe: 8, done: false, rpe: null, muscleGroup: 'Core' },
          ];
        }
      } else {
        // longevity or mental
        routine = [
          { id: 'gl1', n: 'Sentadilla Goblet Profunda', s: '4x10 (Pausa 2s abajo)', targetRpe: 7.5, done: false, rpe: null, muscleGroup: 'Piernas' },
          { id: 'gl2', n: 'Press de Banca con Mancuernas', s: '3x10 (Control articular)', targetRpe: 7.5, done: false, rpe: null, muscleGroup: 'Pecho' },
          { id: 'gl3', n: 'Remo Unilateral con Mancuerna', s: '3x10 por lado', targetRpe: 7.5, done: false, rpe: null, muscleGroup: 'Espalda' },
          { id: 'gl4', n: 'Face Pulls en Polea Alta', s: '3x15 (Salud Manguito)', targetRpe: 7, done: false, rpe: null, muscleGroup: 'Postura' },
          { id: 'gl5', n: 'Paseo del Granjero (Farmer Walk)', s: '3x40 metros', targetRpe: 8, done: false, rpe: null, muscleGroup: 'Agarre/Core' },
        ];
      }
    } else if (equipment === 'home_dumbbell') {
      if (focus === 'strength') {
        routine = [
          { id: 'hd1', n: 'Goblet Squat Pesado', s: '4x10 (RIR 2)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Piernas' },
          { id: 'hd2', n: 'Press de Pecho en Suelo (Floor Press)', s: '4x10 (Pesado)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho' },
          { id: 'hd3', n: 'Peso Muerto Rumano con Mancuernas', s: '4x10 (RIR 2)', targetRpe: 8, done: false, rpe: null, muscleGroup: 'Isquios' },
          { id: 'hd4', n: 'Press Militar de Hombros de Pie', s: '3x10 (Estricto)', targetRpe: 8, done: false, rpe: null, muscleGroup: 'Hombros' },
        ];
      } else {
        routine = [
          { id: 'hd1', n: 'Zancadas Dinámicas con Mancuernas', s: '4x12 por pierna', targetRpe: 8, done: false, rpe: null, muscleGroup: 'Piernas' },
          { id: 'hd2', n: 'Flexiones (Push-ups) sobre Mancuernas', s: '4x15', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho' },
          { id: 'hd3', n: 'Remo Renegado con Mancuerna', s: '3x10 por lado', targetRpe: 8, done: false, rpe: null, muscleGroup: 'Espalda/Core' },
          { id: 'hd4', n: 'Elevaciones Laterales + Pájaros', s: '3x15 (Superserie)', targetRpe: 8, done: false, rpe: null, muscleGroup: 'Hombros' },
        ];
      }
    } else {
      // Calistenia Pura
      if (focus === 'strength') {
        routine = [
          { id: 'c1', n: 'Dominadas Estrictas Pronadas (Pull-ups)', s: '4x6-8 (Control)', targetRpe: 9, done: false, rpe: null, muscleGroup: 'Espalda' },
          { id: 'c2', n: 'Fondos en Paralelas / Barra (Dips)', s: '4x8-10 (RIR 1)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho/Tríceps' },
          { id: 'c3', n: 'Pistol Squats o Zancadas Explosivas', s: '4x8 por pierna', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Piernas' },
          { id: 'c4', n: 'Flexiones Espartanas / Diamante', s: '3x al fallo técnico', targetRpe: 9, done: false, rpe: null, muscleGroup: 'Pecho' },
        ];
      } else {
        routine = [
          { id: 'c1', n: 'Flexiones Militares Espartanas', s: '4x15 (Cadencia 2-1-1)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Pecho/Tríceps' },
          { id: 'c2', n: 'Sentadillas Profundas de Calistenia', s: '4x25 (Ritmo Fluido)', targetRpe: 8, done: false, rpe: null, muscleGroup: 'Piernas' },
          { id: 'c3', n: 'Elevación de Piernas en Barra / Suelo', s: '4x15 (Core Imperial)', targetRpe: 8.5, done: false, rpe: null, muscleGroup: 'Core' },
          { id: 'c4', n: 'Plancha Abdominal Estoica', s: '3x60 seg (Temple Mental)', targetRpe: 8, done: false, rpe: null, muscleGroup: 'Core' },
        ];
      }
    }

    return { routine, targetCals };
  };

  const handleFinish = async () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      const { routine, targetCals } = generateCalculatedPlan();

      const profile: ProkoptonProfile = {
        userName: userName.trim() || 'Ciudadano Prokopton',
        focus,
        equipment,
        daysPerWeek,
        sessionDurationMinutes: sessionDuration,
        dietPreference,
        age: parseInt(age, 10) || 26,
        weightKg: parseFloat(weightKg) || 75,
        targetWeightKg: parseFloat(targetWeightKg) || 70,
        heightCm: parseFloat(heightCm) || 175,
        completedAt: new Date().toISOString(),
      };

      saveOnboardingProfile(profile, routine, targetCals);
      setIsAnalyzing(false);
      onComplete?.(profile);
      onClose();
    }, 500);
  };

  const handleSkip = () => {
    const { routine, targetCals } = generateCalculatedPlan();
    const profile: ProkoptonProfile = {
      userName: userName.trim() || 'Ciudadano Prokopton',
      focus,
      equipment,
      daysPerWeek,
      sessionDurationMinutes: sessionDuration,
      dietPreference,
      age: 26,
      weightKg: 75,
      targetWeightKg: 70,
      heightCm: 175,
      completedAt: new Date().toISOString(),
    };
    saveOnboardingProfile(profile, routine, targetCals);
    onComplete?.(profile);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.badgeGold}>
              <Text style={styles.badgeGoldText}>🏛️ ESCÁNER DEL PROKOPTON</Text>
            </View>
            <TouchableOpacity onPress={handleSkip} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Steps Progress Indicator */}
          <View style={styles.progressRow}>
            {[1, 2, 3, 4].map((stepNum) => (
              <View
                key={stepNum}
                style={[
                  styles.stepDot,
                  step >= stepNum && styles.stepDotActive,
                  step === stepNum && styles.stepDotCurrent,
                ]}
              />
            ))}
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
            {isAnalyzing ? (
              <View style={styles.analyzingContainer}>
                <ActivityIndicator size="large" color="#D4AF37" />
                <Text style={styles.analyzingTitle}>Sincronizando con el Oráculo IA...</Text>
                <Text style={styles.analyzingSub}>
                  Calibrando tiempo de sesión ({sessionDuration} min), presupuesto calórico y rutina de sobrecarga...
                </Text>
              </View>
            ) : step === 1 ? (
              /* PASO 1: Identidad & Foco Estoico */
              <View>
                <Text style={styles.stepTitle}>Paso 1: Identidad & Enfoque Estoico</Text>
                <Text style={styles.stepSubtitle}>
                  ¿Cómo responderás al llamado del autodominio físico y mental?
                </Text>

                <Text style={styles.label}>Tu Nombre o Alias Atleta:</Text>
                <TextInput
                  style={styles.textInput}
                  value={userName}
                  onChangeText={setUserName}
                  placeholder="Ej: Marco, Prokopton, Atleta"
                  placeholderTextColor="#64748B"
                />

                <Text style={styles.label}>Enfoque Principal de Vida:</Text>

                <TouchableOpacity
                  style={[styles.optionCard, focus === 'strength' && styles.optionCardActive]}
                  onPress={() => setFocus('strength')}
                >
                  <Ionicons name="barbell-outline" size={24} color={focus === 'strength' ? '#D4AF37' : '#94A3B8'} />
                  <View style={styles.optionTextCol}>
                    <Text style={[styles.optionTitle, focus === 'strength' && styles.textGold]}>Fuerza Espartana & Hipertrofia</Text>
                    <Text style={styles.optionDesc}>Desarrollar masa muscular sólida y fuerza máxima.</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionCard, focus === 'fat_loss' && styles.optionCardActive]}
                  onPress={() => setFocus('fat_loss')}
                >
                  <Ionicons name="flame-outline" size={24} color={focus === 'fat_loss' ? '#D4AF37' : '#94A3B8'} />
                  <View style={styles.optionTextCol}>
                    <Text style={[styles.optionTitle, focus === 'fat_loss' && styles.textGold]}>Recomposición & Definición</Text>
                    <Text style={styles.optionDesc}>Reducir porcentaje de grasa manteniendo el músculo.</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionCard, focus === 'longevity' && styles.optionCardActive]}
                  onPress={() => setFocus('longevity')}
                >
                  <Ionicons name="heart-outline" size={24} color={focus === 'longevity' ? '#D4AF37' : '#94A3B8'} />
                  <View style={styles.optionTextCol}>
                    <Text style={[styles.optionTitle, focus === 'longevity' && styles.textGold]}>Resistencia & Longevidad</Text>
                    <Text style={styles.optionDesc}>Salud cardiovascular, vitalidad y energía ilimitada.</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionCard, focus === 'mental' && styles.optionCardActive]}
                  onPress={() => setFocus('mental')}
                >
                  <Ionicons name="sparkles-outline" size={24} color={focus === 'mental' ? '#D4AF37' : '#94A3B8'} />
                  <View style={styles.optionTextCol}>
                    <Text style={[styles.optionTitle, focus === 'mental' && styles.textGold]}>Claridad Mental & Estoicismo</Text>
                    <Text style={styles.optionDesc}>Disciplina diaria, temple mental y ataraxia.</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : step === 2 ? (
              /* PASO 2: Biometría & Nutrición */
              <View>
                <Text style={styles.stepTitle}>Paso 2: Biometría & Estrategia Nutricional</Text>
                <Text style={styles.stepSubtitle}>
                  Para calcular tus calorías objetivo exactas y macronutrientes.
                </Text>

                <View style={styles.rowInputs}>
                  <View style={styles.flex1}>
                    <Text style={styles.label}>Edad:</Text>
                    <TextInput
                      style={styles.textInput}
                      value={age}
                      onChangeText={setAge}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.label}>Altura (cm):</Text>
                    <TextInput
                      style={styles.textInput}
                      value={heightCm}
                      onChangeText={setHeightCm}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.rowInputs}>
                  <View style={styles.flex1}>
                    <Text style={styles.label}>Peso Actual (kg):</Text>
                    <TextInput
                      style={styles.textInput}
                      value={weightKg}
                      onChangeText={setWeightKg}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.label}>Peso Meta (kg):</Text>
                    <TextInput
                      style={styles.textInput}
                      value={targetWeightKg}
                      onChangeText={setTargetWeightKg}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <Text style={styles.label}>Estrategia de Nutrición:</Text>
                <View style={styles.grid2Row}>
                  <TouchableOpacity
                    style={[styles.chipBtn, dietPreference === 'deficit' && styles.chipBtnActive]}
                    onPress={() => setDietPreference('deficit')}
                  >
                    <Text style={[styles.chipText, dietPreference === 'deficit' && styles.textGold]}>🔥 Déficit Calórico</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.chipBtn, dietPreference === 'maintenance' && styles.chipBtnActive]}
                    onPress={() => setDietPreference('maintenance')}
                  >
                    <Text style={[styles.chipText, dietPreference === 'maintenance' && styles.textGold]}>⚖️ Mantenimiento</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.grid2Row}>
                  <TouchableOpacity
                    style={[styles.chipBtn, dietPreference === 'surplus' && styles.chipBtnActive]}
                    onPress={() => setDietPreference('surplus')}
                  >
                    <Text style={[styles.chipText, dietPreference === 'surplus' && styles.textGold]}>💪 Volumen Limpio</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.chipBtn, dietPreference === 'intermittent_fasting' && styles.chipBtnActive]}
                    onPress={() => setDietPreference('intermittent_fasting')}
                  >
                    <Text style={[styles.chipText, dietPreference === 'intermittent_fasting' && styles.textGold]}>⏳ Ayuno 16/8</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : step === 3 ? (
              /* PASO 3: Equipamiento & Entorno */
              <View>
                <Text style={styles.stepTitle}>Paso 3: Equipamiento Disponible</Text>
                <Text style={styles.stepSubtitle}>
                  La rutina se adaptará al equipo real que tienes a tu alcance.
                </Text>

                <TouchableOpacity
                  style={[styles.optionCard, equipment === 'gym' && styles.optionCardActive]}
                  onPress={() => setEquipment('gym')}
                >
                  <Ionicons name="fitness-outline" size={24} color={equipment === 'gym' ? '#D4AF37' : '#94A3B8'} />
                  <View style={styles.optionTextCol}>
                    <Text style={[styles.optionTitle, equipment === 'gym' && styles.textGold]}>Gimnasio Completo</Text>
                    <Text style={styles.optionDesc}>Barras, Discos, Poleas, Máquinas de aislamiento.</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionCard, equipment === 'home_dumbbell' && styles.optionCardActive]}
                  onPress={() => setEquipment('home_dumbbell')}
                >
                  <Ionicons name="home-outline" size={24} color={equipment === 'home_dumbbell' ? '#D4AF37' : '#94A3B8'} />
                  <View style={styles.optionTextCol}>
                    <Text style={[styles.optionTitle, equipment === 'home_dumbbell' && styles.textGold]}>Casa con Mancuernas</Text>
                    <Text style={styles.optionDesc}>Par de mancuernas, banco o bandas de resistencia.</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionCard, equipment === 'calisthenics' && styles.optionCardActive]}
                  onPress={() => setEquipment('calisthenics')}
                >
                  <Ionicons name="body-outline" size={24} color={equipment === 'calisthenics' ? '#D4AF37' : '#94A3B8'} />
                  <View style={styles.optionTextCol}>
                    <Text style={[styles.optionTitle, equipment === 'calisthenics' && styles.textGold]}>Calistenia (Peso Corporal)</Text>
                    <Text style={styles.optionDesc}>Sin pesas. Solo barra de dominadas y gravedad.</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              /* PASO 4: Tiempo de Ejecución & Frecuencia */
              <View>
                <Text style={styles.stepTitle}>Paso 4: Tiempo & Frecuencia</Text>
                <Text style={styles.stepSubtitle}>
                  Construimos tu rutina ajustada a tus minutos reales de disponibilidad.
                </Text>

                <Text style={styles.label}>Frecuencia (Días a la semana):</Text>
                <View style={styles.daysRow}>
                  {([3, 4, 5, 6] as DaysPerWeek[]).map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.dayBtn, daysPerWeek === d && styles.dayBtnActive]}
                      onPress={() => setDaysPerWeek(d)}
                    >
                      <Text style={[styles.dayText, daysPerWeek === d && styles.textGold]}>{d} Días</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Tiempo Exacto por Sesión:</Text>
                <View style={styles.grid2Row}>
                  {([30, 45, 60, 90] as SessionDurationMinutes[]).map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.chipBtn, sessionDuration === m && styles.chipBtnActive]}
                      onPress={() => setSessionDuration(m)}
                    >
                      <Text style={[styles.chipText, sessionDuration === m && styles.textGold]}>
                        ⏱️ {m} Minutos
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.summaryBox}>
                  <Text style={styles.summaryTitle}>🏛️ Resumen de Ficha del Prokopton</Text>
                  <Text style={styles.summaryItem}>• Atleta: {userName}</Text>
                  <Text style={styles.summaryItem}>
                    • Meta: {focus === 'strength' ? 'Fuerza & Masa' : focus === 'fat_loss' ? 'Definición' : focus === 'longevity' ? 'Longevidad' : 'Mente'}
                  </Text>
                  <Text style={styles.summaryItem}>• Equipo: {equipment === 'gym' ? 'Gimnasio' : equipment === 'home_dumbbell' ? 'Mancuernas en Casa' : 'Calistenia'}</Text>
                  <Text style={styles.summaryItem}>• Sesión: {daysPerWeek} días x {sessionDuration} min</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Navigation Buttons */}
          {!isAnalyzing && (
            <View style={styles.footerRow}>
              {step > 1 ? (
                <TouchableOpacity style={styles.btnSecondary} onPress={() => setStep(step - 1)}>
                  <Text style={styles.btnSecondaryText}>Atrás</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.btnSecondary} onPress={handleSkip}>
                  <Text style={styles.btnSecondaryText}>Omitir por ahora</Text>
                </TouchableOpacity>
              )}

              {step < 4 ? (
                <TouchableOpacity style={styles.btnPrimary} onPress={() => setStep(step + 1)}>
                  <Text style={styles.btnPrimaryText}>Siguiente →</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.btnGold} onPress={handleFinish}>
                  <Text style={styles.btnGoldText}>⚡ ESCANEAR CON IA</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 8, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: '#0A0D16',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    padding: 20,

    ...Platform.select({
      ios: {
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: { elevation: 10 },
      web: { boxShadow: '0 8px 32px rgba(212, 175, 55, 0.25)' },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeGold: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  badgeGoldText: {
    color: '#FFE259',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  stepDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  stepDotActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.40)',
  },
  stepDotCurrent: {
    backgroundColor: '#FFE259',
  },
  scrollArea: {
    maxHeight: 420,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFE259',
    marginBottom: 4,
    fontFamily: 'serif',
  },
  stepSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D4AF37',
    marginTop: 10,
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  textInput: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 10,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 14,
    marginBottom: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.20)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  optionCardActive: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
  },
  optionTextCol: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FDE68A',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  textGold: {
    color: '#D4AF37',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
  grid2Row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  chipBtn: {
    flex: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.20)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  chipBtnActive: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dayBtn: {
    flex: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.20)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dayBtnActive: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
  },
  dayText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFE259',
  },
  summaryBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.30)',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  summaryTitle: {
    color: '#FFE259',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    fontFamily: 'serif',
  },
  summaryItem: {
    color: '#CBD5E1',
    fontSize: 12,
    marginBottom: 3,
  },
  analyzingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  analyzingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFE259',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'serif',
  },
  analyzingSub: {
    fontSize: 13,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
  },
  btnSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  btnSecondaryText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  btnPrimaryText: {
    color: '#050507',
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  btnGold: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  btnGoldText: {
    color: '#050508',
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
});
