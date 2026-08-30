import React, { useState } from 'react';
import { StyleSheet, ActivityIndicator, View, ScrollView, TouchableOpacity, Modal } from 'react-native';
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
import { MonthlyResolution, DayAudit } from '@/lib/monthlyResolutionEngine';
import { HonorDiplomaModal } from '@/components/HonorDiplomaModal';
import { ExerciseTechniqueModal, ExerciseGuideData } from '@/components/ExerciseTechniqueModal';

export interface ProgramExercise {
  id: string;
  n: string;
  s: string;
  targetRpe: number;
  muscleGroup: string;
  cue: string;
}

export interface PathEquipmentRoutine {
  name: string;
  focus: string;
  equipmentLabel: string;
  exercises: ProgramExercise[];
}

export const MANDATORY_PROGRAM_MATRIX: Record<LegendaryPath, Record<EquipmentType, PathEquipmentRoutine>> = {
  spartan: {
    gym: {
      name: 'Senda del Espartano • Gimnasio Completo',
      focus: 'Fuerza Máxima, Cargas Pesadas & Sobrecarga Progresiva (RIR 1-2)',
      equipmentLabel: '🏋️ Gimnasio Completo',
      exercises: [
        { id: 'sp_g1', n: 'Sentadilla Trasera Pesada con Barra', s: '4 series x 6 reps', targetRpe: 8.5, muscleGroup: 'Piernas', cue: 'Profundidad paralela y empuje desde los talones.' },
        { id: 'sp_g2', n: 'Press de Banca Plano Olímpico', s: '4 series x 6 reps', targetRpe: 8.5, muscleGroup: 'Pecho', cue: 'Retracción escapular sólida y arco natural.' },
        { id: 'sp_g3', n: 'Peso Muerto Convencional Pesado', s: '3 series x 5 reps', targetRpe: 9.0, muscleGroup: 'Espalda / Isquios', cue: 'Bloqueo dorsal antes de despegar la barra.' },
        { id: 'sp_g4', n: 'Press Militar de Pie con Barra', s: '3 series x 8 reps', targetRpe: 8.0, muscleGroup: 'Hombros', cue: 'Glúteos y abdomen contraídos sin arquear lumbar.' },
        { id: 'sp_g5', n: 'Remo Pendlay con Barra', s: '4 series x 8 reps', targetRpe: 8.0, muscleGroup: 'Espalda', cue: 'Torso paralelo al suelo con tirón explosivo.' },
      ],
    },
    home_dumbbell: {
      name: 'Senda del Espartano • Mancuernas en Casa',
      focus: 'Tensión Mecánica Alta & Sobrecarga con Mancuernas',
      equipmentLabel: '🏠 Mancuernas en Casa',
      exercises: [
        { id: 'sp_d1', n: 'Sentadilla Goblet Pesada con Mancuerna', s: '4 series x 10 reps', targetRpe: 8.5, muscleGroup: 'Piernas', cue: 'Mancuerna pegada al esternón con codos cerrados.' },
        { id: 'sp_d2', n: 'Press de Pecho en Suelo/Banco con Mancuernas', s: '4 series x 8 reps', targetRpe: 8.5, muscleGroup: 'Pecho', cue: 'Pausa de 1 segundo en el punto de máximo estiramiento.' },
        { id: 'sp_d3', n: 'Peso Muerto Rumano con Mancuernas', s: '4 series x 8 reps', targetRpe: 8.5, muscleGroup: 'Espalda / Isquios', cue: 'Empuja la cadera hacia atrás sintiendo los isquios.' },
        { id: 'sp_d4', n: 'Press de Hombros Sentado con Mancuernas', s: '3 series x 10 reps', targetRpe: 8.0, muscleGroup: 'Hombros', cue: 'Trayectoria limpia en arco sin chocar mancuernas.' },
        { id: 'sp_d5', n: 'Remo Unilateral con Mancuerna Pesada', s: '4 series x 10 reps/lado', targetRpe: 8.5, muscleGroup: 'Espalda', cue: 'Lleva el codo hacia el bolsillo sin rotar el torso.' },
      ],
    },
    calisthenics: {
      name: 'Senda del Espartano • Peso Corporal Puro',
      focus: 'Fuerza Relativa Máxima, Cargas Unilaterales & Pausas',
      equipmentLabel: '🤸‍♂️ Peso Corporal',
      exercises: [
        { id: 'sp_c1', n: 'Pistol Squats Asistidas / Búlgaras al Fallo', s: '4 series x 8 reps/lado', targetRpe: 8.5, muscleGroup: 'Piernas', cue: 'Control excéntrico de 3 segundos por repetición.' },
        { id: 'sp_c2', n: 'Flexiones Declinadas con Pies Elevados y Pausa', s: '4 series x 12-15 reps', targetRpe: 8.5, muscleGroup: 'Pecho', cue: 'Pies sobre silla/cama con pecho al suelo.' },
        { id: 'sp_c3', n: 'Dominadas Pronas Estrictas o Lentas', s: '4 series x 6-8 reps', targetRpe: 9.0, muscleGroup: 'Espalda', cue: 'Barbilla sobre la barra y descenso completo.' },
        { id: 'sp_c4', n: 'Flexiones en Pica Elevadas (Pike Push-ups)', s: '4 series x 8 reps', targetRpe: 8.5, muscleGroup: 'Hombros', cue: 'Cabeza desciende en trípode hacia adelante.' },
        { id: 'sp_c5', n: 'Remo Invertido en Mesa o Anillas', s: '4 series x 10 reps', targetRpe: 8.0, muscleGroup: 'Espalda', cue: 'Cuerpo recto como tabla tocando el pecho al borde.' },
      ],
    },
  },
  hoplite: {
    gym: {
      name: 'Senda del Hoplita • Gimnasio Completo',
      focus: 'Capacidad Mitocondrial, Cadenas Funcionales & Cardio Zona 2',
      equipmentLabel: '🏋️ Gimnasio Completo',
      exercises: [
        { id: 'hop_g1', n: 'Sentadilla Frontal con Barra Olímpica', s: '4 series x 10 reps', targetRpe: 7.5, muscleGroup: 'Piernas', cue: 'Codos altos manteniendo el torso vertical.' },
        { id: 'hop_g2', n: 'Circuito Táctico de Cardio (Remo / Bici Zona 2)', s: '25 minutos continuos', targetRpe: 7.0, muscleGroup: 'Cardiovascular', cue: 'Ritmo conversacional sostenido (65-75% FC).' },
        { id: 'hop_g3', n: 'Press de Pecho en Máquina / Polea', s: '4 series x 12 reps', targetRpe: 8.0, muscleGroup: 'Pecho', cue: 'Tensión constante sin bloquear codos.' },
        { id: 'hop_g4', n: 'Jalón al Pecho en Polea Alta', s: '4 series x 12 reps', targetRpe: 8.0, muscleGroup: 'Espalda', cue: 'Tira con los codos y abre la caja torácica.' },
        { id: 'hop_g5', n: 'Paseo del Granjero Pesado (Farmer Walk)', s: '3 series x 40 metros', targetRpe: 8.5, muscleGroup: 'Core / Agarre', cue: 'Hombros atrás y pasos firmes sin oscilar.' },
      ],
    },
    home_dumbbell: {
      name: 'Senda del Hoplita • Mancuernas en Casa',
      focus: 'Resistencia Funcional Táctica & Capacidad de Trabajo',
      equipmentLabel: '🏠 Mancuernas en Casa',
      exercises: [
        { id: 'hop_d1', n: 'Thrusters Tácticos (Sentadilla + Press)', s: '4 series x 12 reps', targetRpe: 8.0, muscleGroup: 'Full Body', cue: 'Usa el impulso de las piernas para elevar el peso.' },
        { id: 'hop_d2', n: 'Caminata Rápida / Trote NeAT Zona 2', s: '30 minutos continuos', targetRpe: 7.0, muscleGroup: 'Cardiovascular', cue: 'Ritmo constante sin pausas para acelerar quema de grasa.' },
        { id: 'hop_d3', n: 'Renegade Rows con Mancuernas en Plancha', s: '4 series x 10 reps/lado', targetRpe: 8.0, muscleGroup: 'Core / Espalda', cue: 'Caderas quietas sin balancear al remar.' },
        { id: 'hop_d4', n: 'Zancadas Caminando con Mancuernas', s: '3 series x 14 pasos', targetRpe: 7.5, muscleGroup: 'Piernas', cue: 'Rodilla trasera roza suavemente el suelo.' },
        { id: 'hop_d5', n: 'Plancha con Arrastre de Mancuerna', s: '3 series x 45 seg', targetRpe: 8.0, muscleGroup: 'Core', cue: 'Pasa la mancuerna de un lado al otro sin girar pelvis.' },
      ],
    },
    calisthenics: {
      name: 'Senda del Hoplita • Peso Corporal',
      focus: 'Densidad Mitocondrial & Resistencia Inagotable',
      equipmentLabel: '🤸‍♂️ Peso Corporal',
      exercises: [
        { id: 'hop_c1', n: 'Circuito Táctico (Burpees + Zancadas Explosivas)', s: '4 rondas x 45 seg', targetRpe: 8.0, muscleGroup: 'Full Body', cue: 'Movimientos fluidos sin golpear articulaciones.' },
        { id: 'hop_c2', n: 'Carrera Continua NeAT / Saltos de Cuerda', s: '30 minutos Zona 2', targetRpe: 7.0, muscleGroup: 'Cardiovascular', cue: 'Respiración nasal controlada y cadencia rítmica.' },
        { id: 'hop_c3', n: 'Flexiones Tácticas con Pausa en Suelo', s: '4 series x 15 reps', targetRpe: 8.0, muscleGroup: 'Pecho / Tríceps', cue: 'Pecho al suelo y despegue de manos 0.5s.' },
        { id: 'hop_c4', n: 'Dominadas Australianas o Pronas', s: '4 series x 10 reps', targetRpe: 8.0, muscleGroup: 'Espalda', cue: 'Contracción dorsal en el punto más alto.' },
        { id: 'hop_c5', n: 'Plancha Abdominal de Acero', s: '3 series x 60 seg', targetRpe: 8.0, muscleGroup: 'Core', cue: 'Retroversión pélvica y máxima tensión abdominal.' },
      ],
    },
  },
  apollo: {
    gym: {
      name: 'Senda de Apolo • Gimnasio Completo',
      focus: 'Escultura Estética, V-Taper & Proporciones Áureas',
      equipmentLabel: '🏋️ Gimnasio Completo',
      exercises: [
        { id: 'ap_g1', n: 'Press Inclinado con Mancuernas a 30°', s: '4 series x 10-12 reps', targetRpe: 8.5, muscleGroup: 'Pecho Superior', cue: 'Énfasis en la clavícula con estiramiento profundo.' },
        { id: 'ap_g2', n: 'Elevaciones Laterales en Polea / Mancuerna en V', s: '4 series x 15 reps', targetRpe: 9.0, muscleGroup: 'Hombros Laterales', cue: 'Codos ligeramente flexionados guiando el movimiento.' },
        { id: 'ap_g3', n: 'Jalón al Pecho Agarre Neutro (V-Taper)', s: '4 series x 10 reps', targetRpe: 8.0, muscleGroup: 'Dorsales', cue: 'Deprime escápulas antes de iniciar la tracción.' },
        { id: 'ap_g4', n: 'Prensa Inclinada de Piernas / Sentadilla Hack', s: '4 series x 10 reps', targetRpe: 8.5, muscleGroup: 'Cuádriceps', cue: 'Pies en parte baja de la plataforma con descenso lento.' },
        { id: 'ap_g5', n: 'Elevación de Piernas Colgado en Barra (V-Cut)', s: '4 series x 15 reps', targetRpe: 8.5, muscleGroup: 'Abdomen', cue: 'Eleva la pelvis enrollando la columna sin balanceo.' },
      ],
    },
    home_dumbbell: {
      name: 'Senda de Apolo • Mancuernas en Casa',
      focus: 'Definición Muscular Esculpida con Mancuernas',
      equipmentLabel: '🏠 Mancuernas en Casa',
      exercises: [
        { id: 'ap_d1', n: 'Press Inclinado con Mancuernas en Cojín/Banco', s: '4 series x 10 reps', targetRpe: 8.5, muscleGroup: 'Pecho Superior', cue: 'Inclinación de 30 grados para llenar el pecho alto.' },
        { id: 'ap_d2', n: 'Elevaciones Laterales Estrictas con Mancuerna', s: '5 series x 15 reps', targetRpe: 9.0, muscleGroup: 'Hombros', cue: 'Pausa de 1 segundo arriba para crear el efecto V.' },
        { id: 'ap_d3', n: 'Remo con Mancuernas Agarre Supino', s: '4 series x 10 reps', targetRpe: 8.0, muscleGroup: 'Dorsales', cue: 'Codos pegados al cuerpo estimulando el dorsal bajo.' },
        { id: 'ap_d4', n: 'Sentadilla Búlgara Esculpida con Mancuerna', s: '3 series x 12 reps/lado', targetRpe: 8.5, muscleGroup: 'Piernas', cue: 'Tronco erguido enfocando cuádriceps y glúteos.' },
        { id: 'ap_d5', n: 'Crunch Abdominal en V (V-Ups)', s: '4 series x 15 reps', targetRpe: 8.0, muscleGroup: 'Abdomen', cue: 'Toca las puntas de los pies contrayendo el core.' },
      ],
    },
    calisthenics: {
      name: 'Senda de Apolo • Peso Corporal',
      focus: 'Físico Esculpido Clásico mediante Calistenia Estética',
      equipmentLabel: '🤸‍♂️ Peso Corporal',
      exercises: [
        { id: 'ap_c1', n: 'Flexiones Declinadas con Pies en Silla', s: '4 series x 15 reps', targetRpe: 8.5, muscleGroup: 'Pecho Superior', cue: 'Concentra la tensión en la porción clavicular.' },
        { id: 'ap_c2', n: 'Pseudo Planche Push-ups', s: '4 series x 10 reps', targetRpe: 8.5, muscleGroup: 'Hombros / Pecho', cue: 'Manos a la altura de la cintura con cuerpo inclinado.' },
        { id: 'ap_c3', n: 'Dominadas Abiertas con Énfasis Dorsal', s: '4 series x 8-10 reps', targetRpe: 8.5, muscleGroup: 'V-Taper Dorsal', cue: 'Agarre ancho llevando el esternón hacia la barra.' },
        { id: 'ap_c4', n: 'Sissy Squats / Búlgaras de Peso Corporal', s: '4 series x 12 reps', targetRpe: 8.0, muscleGroup: 'Cuádriceps', cue: 'Aislamiento supremo de cuádriceps sin pesas.' },
        { id: 'ap_c5', n: 'Hanging L-Sit / Leg Raises en Barra', s: '4 series x 12 reps', targetRpe: 9.0, muscleGroup: 'Abdomen', cue: 'Piernas totalmente rectas formando un ángulo de 90°.' },
      ],
    },
  },
  philosopher: {
    gym: {
      name: 'Senda del Filósofo • Gimnasio',
      focus: 'Fuerza Pura Calisténica & Ejercicios Compuestos',
      equipmentLabel: '🏋️ Gimnasio Completo',
      exercises: [
        { id: 'ph_g1', n: 'Dominadas Lastradas Estrictas', s: '4 series x 6 reps', targetRpe: 8.5, muscleGroup: 'Dorsales / Bíceps', cue: 'Carga añadida en cinturón manteniendo técnica perfecta.' },
        { id: 'ph_g2', n: 'Fondos en Paralelas Lastrados', s: '4 series x 8 reps', targetRpe: 8.5, muscleGroup: 'Pecho / Tríceps', cue: 'Inclinación leve de 15° y descenso controlado.' },
        { id: 'ph_g3', n: 'Sentadilla Zercher con Barra', s: '3 series x 10 reps', targetRpe: 8.0, muscleGroup: 'Core / Piernas', cue: 'Barra en la flexura de los codos con espalda neutra.' },
        { id: 'ph_g4', n: 'Remo Invertido en Multipower', s: '4 series x 10 reps', targetRpe: 8.0, muscleGroup: 'Espalda Alta', cue: 'Talones apoyados con pecho tocando la barra fija.' },
        { id: 'ph_g5', n: 'Dragon Flags / Toes to Bar', s: '4 series x 8 reps', targetRpe: 9.0, muscleGroup: 'Core Stoic', cue: 'Cuerpo rígido en descenso sin doblar caderas.' },
      ],
    },
    home_dumbbell: {
      name: 'Senda del Filósofo • Mancuernas en Casa',
      focus: 'Autodominio Físico con Mancuernas & Peso Corporal',
      equipmentLabel: '🏠 Mancuernas en Casa',
      exercises: [
        { id: 'ph_d1', n: 'Dominadas en Barra de Puerta / Remo Mancuerna', s: '4 series x 8 reps', targetRpe: 8.5, muscleGroup: 'Espalda', cue: 'Pausa en contracción máxima dorsal.' },
        { id: 'ph_d2', n: 'Fondos entre Dos Sillas con Mancuerna en Regazo', s: '4 series x 10 reps', targetRpe: 8.5, muscleGroup: 'Tríceps / Pecho', cue: 'Codos hacia atrás protegiendo los hombros.' },
        { id: 'ph_d3', n: 'Pistol Squats con Mancuerna de Contrapeso', s: '3 series x 8 reps/lado', targetRpe: 8.0, muscleGroup: 'Piernas', cue: 'Sostén una mancuerna ligera al frente para equilibrio.' },
        { id: 'ph_d4', n: 'Press Arnold con Mancuernas', s: '3 series x 10 reps', targetRpe: 8.0, muscleGroup: 'Hombros', cue: 'Rotación fluida desde palmas hacia adentro.' },
        { id: 'ph_d5', n: 'Hollow Body Hold con Mancuerna Ligera', s: '4 series x 30 seg', targetRpe: 8.5, muscleGroup: 'Core', cue: 'Lumbar pegada al suelo con brazos extendidos.' },
      ],
    },
    calisthenics: {
      name: 'Senda del Filósofo • Calistenia Pura',
      focus: 'Calistenia Pura, Dominio Gravitacional & Paz Mental',
      equipmentLabel: '🤸‍♂️ Peso Corporal',
      exercises: [
        { id: 'ph_c1', n: 'Dominadas Estrictas en Barra', s: '4 series x 10 reps', targetRpe: 8.5, muscleGroup: 'Dorsales / Bíceps', cue: 'Tirón simétrico sin balancear las piernas.' },
        { id: 'ph_c2', n: 'Fondos en Paralelas (Dips)', s: '4 series x 12 reps', targetRpe: 8.5, muscleGroup: 'Pecho / Tríceps', cue: 'Descenso a 90 grados y bloqueo controlado.' },
        { id: 'ph_c3', n: 'Pistol Squats (Sentadilla a 1 Pierna)', s: '3 series x 8 reps/pierna', targetRpe: 8.0, muscleGroup: 'Piernas', cue: 'Autodominio absoluto del equilibrio y fuerza unilateral.' },
        { id: 'ph_c4', n: 'Flexiones Diamante en Suelo', s: '4 series x 15 reps', targetRpe: 8.5, muscleGroup: 'Tríceps', cue: 'Pulgares e índices unidos con codos cerrados.' },
        { id: 'ph_c5', n: 'Hanging L-Sit / Hollow Body Stoic', s: '4 series x 30 seg', targetRpe: 9.0, muscleGroup: 'Core / Abdomen', cue: 'Temple mental sosteniendo la posición inmóvil.' },
      ],
    },
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
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={[
                styles.dossierModalCard,
                judgmentResult?.promoted ? styles.modalCardSuccess : styles.modalCardScold
              ]}>
                {/* Cabecera del Juicio */}
                <View style={styles.dossierHeaderRow}>
                  <ThemedText style={styles.modalEmblem}>
                    {judgmentResult?.promoted ? '👑' : '💀'}
                  </ThemedText>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.dossierHeaderTag}>TRIBUNAL DEL OLIMPO • RESOLUCIÓN DE 30 DÍAS</ThemedText>
                    <ThemedText style={[
                      styles.dossierMainTitle,
                      judgmentResult?.promoted ? { color: '#FFE259' } : { color: '#EF4444' }
                    ]}>
                      {judgmentResult?.title}
                    </ThemedText>
                  </View>
                </View>

                {/* Selector de Pestañas de la Resolución */}
                <View style={styles.dossierTabsRow}>
                  <TouchableOpacity
                    style={[styles.dossierTabBtn, activeResolutionTab === 'verdict' && styles.dossierTabBtnActive]}
                    onPress={() => setActiveResolutionTab('verdict')}
                  >
                    <ThemedText style={[styles.dossierTabBtnText, activeResolutionTab === 'verdict' && styles.dossierTabBtnTextActive]}>
                      📜 Veredicto
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dossierTabBtn, activeResolutionTab === 'feedback' && styles.dossierTabBtnActive]}
                    onPress={() => setActiveResolutionTab('feedback')}
                  >
                    <ThemedText style={[styles.dossierTabBtnText, activeResolutionTab === 'feedback' && styles.dossierTabBtnTextActive]}>
                      🎖️ Elogios & Reprensión
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dossierTabBtn, activeResolutionTab === 'audit' && styles.dossierTabBtnActive]}
                    onPress={() => setActiveResolutionTab('audit')}
                  >
                    <ThemedText style={[styles.dossierTabBtnText, activeResolutionTab === 'audit' && styles.dossierTabBtnTextActive]}>
                      📊 30 Días (Auditoría)
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Contenido según Pestaña Activa con Scroll */}
                <ScrollView style={styles.dossierContentScroll} showsVerticalScrollIndicator={false}>
                  {activeResolutionTab === 'verdict' && (
                    <View style={styles.dossierTabContent}>
                      {/* Tarjeta de Rango y Estadísticas Maestras */}
                      <View style={styles.rankAuditCard}>
                        <ThemedText style={styles.rankAuditSub}>RANGO SAGRADO OTORGADO</ThemedText>
                        <ThemedText style={styles.rankAuditTitle}>
                          {judgmentResult?.resolution?.tierAwarded || cycle.tier}
                        </ThemedText>
                        <View style={styles.rankStatsGrid}>
                          <View style={styles.rankStatBox}>
                            <ThemedText style={styles.rankStatVal}>{judgmentResult?.resolution?.totalScoreAverage ?? cycle.averageScore}/100</ThemedText>
                            <ThemedText style={styles.rankStatLbl}>Promedio Disciplina</ThemedText>
                          </View>
                          <View style={styles.rankStatBox}>
                            <ThemedText style={[styles.rankStatVal, { color: '#10B981' }]}>{judgmentResult?.resolution?.victoriousDaysCount ?? 0}</ThemedText>
                            <ThemedText style={styles.rankStatLbl}>Días Dignos</ThemedText>
                          </View>
                          <View style={styles.rankStatBox}>
                            <ThemedText style={[styles.rankStatVal, { color: '#EF4444' }]}>{judgmentResult?.resolution?.failedDaysCount ?? 0}</ThemedText>
                            <ThemedText style={styles.rankStatLbl}>Días en Deuda</ThemedText>
                          </View>
                        </View>
                      </View>

                      {/* Directivas del Mentor para el Próximo Ciclo */}
                      <View style={styles.directivesSection}>
                        <ThemedText style={styles.directivesTitle}>🔮 DIRECTIVAS DEL MENTOR (PRÓXIMO CICLO)</ThemedText>
                        {judgmentResult?.resolution?.nextCycleDirectives?.map((d, i) => (
                          <View key={i} style={styles.directiveCard}>
                            <ThemedText style={styles.directiveText}>{d}</ThemedText>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {activeResolutionTab === 'feedback' && (
                    <View style={styles.dossierTabContent}>
                      {/* Elogios y Méritos */}
                      <ThemedText style={styles.feedbackSectionHeader}>🎖️ FELICITACIONES & MÉRITOS REALES</ThemedText>
                      {judgmentResult?.resolution?.praises?.map((p, i) => (
                        <View key={i} style={styles.praiseCard}>
                          <ThemedText style={styles.praiseText}>{p}</ThemedText>
                        </View>
                      ))}

                      {/* Llamadas de Atención */}
                      <ThemedText style={[styles.feedbackSectionHeader, { color: '#EF4444', marginTop: Spacing.four }]}>
                        💀 LLAMADAS DE ATENCIÓN & MEDIOCRIDAD
                      </ThemedText>
                      {judgmentResult?.resolution?.scoldings?.map((s, i) => (
                        <View key={i} style={styles.scoldCard}>
                          <ThemedText style={styles.scoldText}>{s}</ThemedText>
                        </View>
                      ))}

                      {/* Balance de los 7 Pilares */}
                      {judgmentResult?.resolution?.pillarAdherence && (
                        <View style={styles.pillarAdherenceCard}>
                          <ThemedText style={styles.pillarAdherenceTitle}>📊 BALANCE DE PILARES (30 DÍAS)</ThemedText>
                          <ThemedText style={styles.pillarAdherenceLine}>⚔️ Entrenamiento: {judgmentResult.resolution.pillarAdherence.trainingPct}%</ThemedText>
                          <ThemedText style={styles.pillarAdherenceLine}>👟 Pasos & Movilidad: {judgmentResult.resolution.pillarAdherence.stepsPct}%</ThemedText>
                          <ThemedText style={styles.pillarAdherenceLine}>🍽️ Nutrición & Macros: {judgmentResult.resolution.pillarAdherence.nutritionPct}%</ThemedText>
                          <ThemedText style={styles.pillarAdherenceLine}>🌙 Calidad de Sueño: {judgmentResult.resolution.pillarAdherence.sleepPct}%</ThemedText>
                          <ThemedText style={styles.pillarAdherenceLine}>📜 Lectura Estoica: {judgmentResult.resolution.pillarAdherence.stoicReadingPct}%</ThemedText>
                          <ThemedText style={styles.pillarAdherenceLine}>🫀 Frecuencia Cardíaca: {judgmentResult.resolution.pillarAdherence.heartRatePct}%</ThemedText>
                          <ThemedText style={styles.pillarAdherenceLine}>🏛️ Reporte al Coach: {judgmentResult.resolution.pillarAdherence.coachCheckInPct}%</ThemedText>
                        </View>
                      )}
                    </View>
                  )}

                  {activeResolutionTab === 'audit' && (
                    <View style={styles.dossierTabContent}>
                      <ThemedText style={styles.auditIntroText}>
                        Registro sagrado e inmutable de los 30 días de tu Senda:
                      </ThemedText>
                      {judgmentResult?.resolution?.dayAudits?.map((audit) => (
                        <View
                          key={audit.day}
                          style={[
                            styles.dayAuditRow,
                            audit.score >= 75 ? styles.dayAuditRowSuccess : styles.dayAuditRowFailed
                          ]}
                        >
                          <View style={styles.dayAuditTop}>
                            <ThemedText style={styles.dayAuditDayTitle}>DÍA {audit.day} • {audit.date}</ThemedText>
                            <ThemedText style={[
                              styles.dayAuditScoreBadge,
                              audit.score >= 90 ? { color: '#FFE259' } : audit.score >= 75 ? { color: '#10B981' } : { color: '#EF4444' }
                            ]}>
                              {audit.score >= 90 ? '👑' : audit.score >= 75 ? '⚔️' : '💀'} {audit.score}/100
                            </ThemedText>
                          </View>

                          <View style={styles.dayAuditPillarsRow}>
                            <ThemedText style={[styles.dayAuditPillarTag, audit.pillars.training && styles.dayAuditPillarTagActive]}>⚔️</ThemedText>
                            <ThemedText style={[styles.dayAuditPillarTag, audit.pillars.steps && styles.dayAuditPillarTagActive]}>👟</ThemedText>
                            <ThemedText style={[styles.dayAuditPillarTag, audit.pillars.nutrition && styles.dayAuditPillarTagActive]}>🍽️</ThemedText>
                            <ThemedText style={[styles.dayAuditPillarTag, audit.pillars.sleep && styles.dayAuditPillarTagActive]}>🌙</ThemedText>
                            <ThemedText style={[styles.dayAuditPillarTag, audit.pillars.stoicChallenge && styles.dayAuditPillarTagActive]}>📜</ThemedText>
                            <ThemedText style={[styles.dayAuditPillarTag, audit.pillars.heartRate && styles.dayAuditPillarTagActive]}>🫀</ThemedText>
                            <ThemedText style={[styles.dayAuditPillarTag, audit.pillars.coachCheckIn && styles.dayAuditPillarTagActive]}>🏛️</ThemedText>
                            <ThemedText style={styles.dayAuditPassedCount}>({audit.passedPillarsCount}/7)</ThemedText>
                          </View>

                          <ThemedText style={styles.dayAuditVerdictText}>{audit.verdict}</ThemedText>
                        </View>
                      ))}
                    </View>
                  )}
                </ScrollView>

                {/* Acciones del Modal */}
                <View style={styles.dossierActionsRow}>
                  <TouchableOpacity
                    style={styles.copyDecreeBtn}
                    onPress={handleCopyDecree}
                    activeOpacity={0.8}
                  >
                    <ThemedText style={styles.copyDecreeBtnText}>
                      {copiedDecree ? '✅ COPIADO AL PORTAPAPELES' : '📋 COPIAR RESOLUCIÓN COMPLETA'}
                    </ThemedText>
                  </TouchableOpacity>

                  {(judgmentResult?.promoted || (judgmentResult?.resolution?.adherencePct ?? 0) >= 80 || adherencePercent >= 80) && (
                    <TouchableOpacity
                      style={styles.claimDiplomaBtn}
                      onPress={() => {
                        setModalVisible(false);
                        setDiplomaModalVisible(true);
                      }}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={['#D4AF37', '#FFE259', '#B45309']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.claimDiplomaGradient}
                      >
                        <Ionicons name="ribbon" size={16} color="#050507" />
                        <ThemedText style={styles.claimDiplomaText}>
                          👑 VER DIPLOMA DE HONOR OLÍMPICO (80%+)
                        </ThemedText>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  {!judgmentResult?.promoted && (
                    <TouchableOpacity
                      style={styles.resetCycleBtn}
                      onPress={() => {
                        resetMonthlyCycle();
                        setModalVisible(false);
                      }}
                      activeOpacity={0.8}
                    >
                      <ThemedText style={styles.resetCycleBtnText}>
                        🔄 REINICIAR DÍA 1
                      </ThemedText>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.closeModalBtn}
                    onPress={() => setModalVisible(false)}
                    activeOpacity={0.8}
                  >
                    <ThemedText style={styles.closeModalBtnText}>CERRAR JUICIO</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* MODAL INFORMATIVO DE DIPLOMA BLOQUEADO */}
          <Modal
            visible={lockedDiplomaModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setLockedDiplomaModalVisible(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={[styles.modalCard, { borderColor: '#F59E0B' }]}>
                <ThemedText style={styles.modalEmblem}>🔒</ThemedText>
                <ThemedText style={[styles.modalTitle, { color: '#FFE259' }]}>
                  DIPLOMA EN EVALUACIÓN
                </ThemedText>
                <ThemedText style={{ fontSize: 9.5, color: '#94A3B8', fontFamily: 'monospace', letterSpacing: 1 }}>
                  REQUISITO SAGRADO DEL DÍA 30
                </ThemedText>

                <ThemedText style={styles.modalMessage}>
                  Para consagrar tu nombre en el <ThemedText style={{ color: '#FFE259', fontWeight: 'bold' }}>Diploma de Honor Estoico</ThemedText> y recibir la <ThemedText style={{ color: '#38BDF8', fontWeight: 'bold' }}>Evaluación Final del Coach</ThemedText>, debes cumplir los dos requisitos inmutables:
                </ThemedText>

                <View style={styles.lockedModalReqsBox}>
                  <View style={styles.lockedReqRow}>
                    <Ionicons
                      name={isDay30Reached ? "checkmark-circle" : "time-outline"}
                      size={18}
                      color={isDay30Reached ? "#10B981" : "#38BDF8"}
                    />
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.lockedReqTitle}>1. Finalizar los 30 Días de la Evaluación</ThemedText>
                      <ThemedText style={styles.lockedReqDesc}>
                        Progreso actual: Día {currentDay} de 30 ({30 - currentDay > 0 ? `${30 - currentDay} días restantes` : 'Completado'})
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.lockedReqRow}>
                    <Ionicons
                      name={isAboveThreshold ? "checkmark-circle" : "alert-circle-outline"}
                      size={18}
                      color={isAboveThreshold ? "#10B981" : "#F59E0B"}
                    />
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.lockedReqTitle}>2. Alcanzar al menos el 80% de Días Gobernados</ThemedText>
                      <ThemedText style={styles.lockedReqDesc}>
                        Actual: {adherencePercent}% ({victoriousDays} de 24 días mínimos requeridos)
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closeLockedModalBtn}
                  onPress={() => setLockedDiplomaModalVisible(false)}
                  activeOpacity={0.85}
                >
                  <ThemedText style={styles.closeLockedModalBtnText}>ENTENDIDO, SEGUIR ENTRENANDO</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

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
  equipSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  equipChip: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  equipChipActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#FFE259',
  },
  equipChipText: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  equipChipTextActive: {
    color: '#FFE259',
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
    marginTop: 3,
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
  exerciseCue: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 2,
  },
  techGuideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFE259',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  techGuideBtnText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#050507',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
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
    marginTop: 4,
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
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    overflow: 'hidden',
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
    flexShrink: 1,
  },
  pillarRowDesc: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
    marginTop: 1,
    flexShrink: 1,
  },
  pillarRowPts: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#94A3B8',
    fontFamily: 'monospace',
    flexShrink: 0,
  },
  pillarRowPtsActive: {
    color: '#10B981',
  },
  todayVerdictText: {
    fontSize: 10.5,
    color: '#CBD5E1',
    fontStyle: 'italic',
    lineHeight: 14,
    flexShrink: 1,
  },
  adherenceCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    gap: 8,
    overflow: 'hidden',
  },
  adherenceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
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
  dossierModalCard: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '90%',
    backgroundColor: '#0A0F1D',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  dossierHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 10,
  },
  dossierHeaderTag: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  dossierMainTitle: {
    fontSize: 15,
    fontWeight: '900',
    fontFamily: 'serif',
  },
  dossierTabsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  dossierTabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  dossierTabBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  dossierTabBtnText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  dossierTabBtnTextActive: {
    color: '#FFE259',
    fontWeight: 'bold',
  },
  dossierContentScroll: {
    maxHeight: 380,
  },
  dossierTabContent: {
    paddingVertical: 6,
    gap: 10,
  },
  rankAuditCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    gap: 6,
  },
  rankAuditSub: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  rankAuditTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFE259',
    fontFamily: 'serif',
  },
  rankStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  rankStatBox: {
    alignItems: 'center',
    flex: 1,
  },
  rankStatVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  rankStatLbl: {
    fontSize: 8.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  directivesSection: {
    gap: 6,
    marginTop: 6,
  },
  directivesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#38BDF8',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  directiveCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  directiveText: {
    fontSize: 11,
    color: '#E2E8F0',
    lineHeight: 16,
  },
  feedbackSectionHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10B981',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  praiseCard: {
    backgroundColor: 'rgba(6, 78, 59, 0.25)',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  praiseText: {
    fontSize: 11,
    color: '#A7F3D0',
    lineHeight: 16,
  },
  scoldCard: {
    backgroundColor: 'rgba(127, 29, 29, 0.25)',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  scoldText: {
    fontSize: 11,
    color: '#FECACA',
    lineHeight: 16,
  },
  pillarAdherenceCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 6,
  },
  pillarAdherenceTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFE259',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  pillarAdherenceLine: {
    fontSize: 10.5,
    color: '#CBD5E1',
    fontFamily: 'monospace',
  },
  auditIntroText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  dayAuditRow: {
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    gap: 4,
  },
  dayAuditRowSuccess: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  dayAuditRowFailed: {
    backgroundColor: 'rgba(20, 10, 15, 0.85)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  dayAuditTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayAuditDayTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  dayAuditScoreBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  dayAuditPillarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  dayAuditPillarTag: {
    fontSize: 12,
    opacity: 0.35,
  },
  dayAuditPillarTagActive: {
    opacity: 1,
  },
  dayAuditPassedCount: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
    marginLeft: 4,
  },
  dayAuditVerdictText: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 14,
  },
  dossierActionsRow: {
    gap: 8,
    marginTop: 4,
  },
  copyDecreeBtn: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  copyDecreeBtnText: {
    color: '#FFE259',
    fontWeight: 'bold',
    fontSize: 11,
    fontFamily: 'monospace',
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
    fontSize: 32,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeModalBtnText: {
    color: '#94A3B8',
    fontWeight: 'bold',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  diplomaBannerBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FFE259',
    marginVertical: 4,
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  diplomaBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  diplomaBannerTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#050507',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  diplomaBannerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#050507',
    fontFamily: 'serif',
    letterSpacing: 1,
    marginTop: 2,
  },
  diplomaBannerSub: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#3B2F04',
    marginTop: 2,
  },
  claimDiplomaBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  claimDiplomaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  claimDiplomaText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#050507',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  diplomaLockedCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    padding: 14,
    marginVertical: 4,
    gap: 10,
  },
  diplomaLockedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  diplomaLockedTag: {
    fontSize: 8.5,
    fontFamily: 'monospace',
    color: '#94A3B8',
    letterSpacing: 0.5,
    fontWeight: 'bold',
  },
  diplomaLockedTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#F59E0B',
    fontFamily: 'serif',
    marginTop: 1,
  },
  diplomaLockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  diplomaLockBadgeText: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#F59E0B',
    fontFamily: 'monospace',
  },
  diplomaProgressBoxes: {
    flexDirection: 'row',
    gap: 8,
  },
  diplomaProgBox: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 8, 0.6)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  diplomaProgVal: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  diplomaProgLbl: {
    fontSize: 8,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 6,
  },
  diplomaMiniTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  diplomaMiniFill: {
    height: '100%',
    borderRadius: 2,
  },
  diplomaLockedNotice: {
    fontSize: 9.5,
    color: '#94A3B8',
    lineHeight: 14,
    fontStyle: 'italic',
  },
  lockedModalReqsBox: {
    width: '100%',
    backgroundColor: 'rgba(5, 5, 8, 0.6)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
    marginVertical: 8,
  },
  lockedReqRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  lockedReqTitle: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  lockedReqDesc: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  closeLockedModalBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 6,
  },
  closeLockedModalBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#050507',
    fontFamily: 'monospace',
  },
});
