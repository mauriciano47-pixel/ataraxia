import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { GoogleGenAI } from '@google/genai';

import { ThemedText } from '@/components/themed-text';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { PearlElectricBackground } from '@/components/PearlElectricBackground';
import { useDailyLog } from '@/hooks/useDailyLog';
import { CustomExercise } from '@/types/onboarding';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim() || '';
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const RUTINA_MOCK: CustomExercise[] = [
  { id: '1', n: 'Sentadilla Trasera con Barra', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Piernas' },
  { id: '2', n: 'Peso Muerto Rumano', s: '3x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Espalda / Isquios' },
  { id: '3', n: 'Press de Banca Olímpico', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Pecho' },
  { id: '4', n: 'Remo con Barra Pendlay', s: '3x10 (RIR 2)', done: false, rpe: null, muscleGroup: 'Espalda' },
  { id: '5', n: 'Zancadas Búlgaras', s: '3x10 por pierna', done: false, rpe: null, muscleGroup: 'Piernas' },
];

const CALISTENIA_MOCK: CustomExercise[] = [
  { id: 'c1', n: 'Flexiones Declinadas con Pausa', s: '4 al fallo', done: false, rpe: null, muscleGroup: 'Pecho' },
  { id: 'c2', n: 'Dominadas Pronas Estrictas', s: '4x8 reps', done: false, rpe: null, muscleGroup: 'Espalda' },
  { id: 'c3', n: 'Sentadillas Libres Explosivas', s: '4x20 reps', done: false, rpe: null, muscleGroup: 'Piernas' },
  { id: 'c4', n: 'Fondos en Paralelas / Dips', s: '3x12 reps', done: false, rpe: null, muscleGroup: 'Tríceps/Pecho' },
  { id: 'c5', n: 'Plancha Abdominal Estoica', s: '3x60 seg', done: false, rpe: null, muscleGroup: 'Core' },
];

const PRESET_ROUTINES: { id: string; title: string; subtitle: string; icon: string; exercises: CustomExercise[] }[] = [
  {
    id: 'push',
    title: 'Torso & Empuje (Push)',
    subtitle: 'Pecho, Deltoides Anterior y Tríceps',
    icon: '⚔️',
    exercises: [
      { id: 'p1', n: 'Press de Banca Plano Olímpico', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Pecho' },
      { id: 'p2', n: 'Press Inclinado con Mancuernas', s: '3x10 (RIR 2)', done: false, rpe: null, muscleGroup: 'Pecho' },
      { id: 'p3', n: 'Press Militar de Pie con Barra', s: '3x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Hombros' },
      { id: 'p4', n: 'Fondos en Paralelas / Dips', s: '3x12 (RIR 1)', done: false, rpe: null, muscleGroup: 'Pecho/Tríceps' },
      { id: 'p5', n: 'Elevaciones Laterales Estrictas', s: '4x15 (Fallo)', done: false, rpe: null, muscleGroup: 'Hombros' },
      { id: 'p6', n: 'Extensiones de Tríceps en Polea', s: '3x12 (RIR 1)', done: false, rpe: null, muscleGroup: 'Brazos' },
    ],
  },
  {
    id: 'pull',
    title: 'Espalda & Tracción (Pull)',
    subtitle: 'Dorsales, Trapecios y Bíceps',
    icon: '🛡️',
    exercises: [
      { id: 'pu1', n: 'Dominadas Pronas Estrictas', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'pu2', n: 'Remo con Barra Pendlay 90°', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'pu3', n: 'Jalón al Pecho Agarre Neutro', s: '3x10 (RIR 1)', done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'pu4', n: 'Remo Unilateral con Mancuerna', s: '3x10 por lado', done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'pu5', n: 'Face Pulls para Deltoides Posterior', s: '4x15 (RIR 1)', done: false, rpe: null, muscleGroup: 'Hombros' },
      { id: 'pu6', n: 'Curl Martillo Pesado de Bíceps', s: '3x10 (RIR 1)', done: false, rpe: null, muscleGroup: 'Brazos' },
    ],
  },
  {
    id: 'legs',
    title: 'Pierna & Glúteos (Legs)',
    subtitle: 'Cuádriceps, Isquiosurales y Core',
    icon: '🦵',
    exercises: [
      { id: 'l1', n: 'Sentadilla Trasera Profunda', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Piernas' },
      { id: 'l2', n: 'Peso Muerto Rumano con Barra', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Isquios' },
      { id: 'l3', n: 'Prensa Inclinada 45°', s: '3x12 (RIR 1)', done: false, rpe: null, muscleGroup: 'Piernas' },
      { id: 'l4', n: 'Zancadas Búlgaras con Mancuernas', s: '3x10 por pierna', done: false, rpe: null, muscleGroup: 'Piernas' },
      { id: 'l5', n: 'Elevación de Talones en Máquina', s: '4x15 (Pausa 2s)', done: false, rpe: null, muscleGroup: 'Gemelos' },
      { id: 'l6', n: 'Plancha Abdominal con Disco', s: '3x50 seg', done: false, rpe: null, muscleGroup: 'Core' },
    ],
  },
  {
    id: 'fullbody',
    title: 'Full Body Imperial',
    subtitle: 'Patrones Básicos de Fuerza Total',
    icon: '🏛️',
    exercises: [
      { id: 'fb1', n: 'Sentadilla Trasera con Barra', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Piernas' },
      { id: 'fb2', n: 'Press de Banca Plano Olímpico', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Pecho' },
      { id: 'fb3', n: 'Peso Muerto Convencional', s: '3x6 (RIR 2)', done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'fb4', n: 'Press Militar de Pie con Barra', s: '3x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Hombros' },
      { id: 'fb5', n: 'Remo Unilateral con Mancuerna', s: '3x10 por lado', done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'fb6', n: 'Plancha Abdominal Estoica', s: '3x60 seg', done: false, rpe: null, muscleGroup: 'Core' },
    ],
  },
  {
    id: 'calisthenics',
    title: 'Calistenia Espartana (Peso Corporal)',
    subtitle: 'Autodominio Físico y Tensión Gravitacional',
    icon: '🤸‍♂️',
    exercises: [
      { id: 'c1', n: 'Flexiones Declinadas con Pausa', s: '4 al fallo', done: false, rpe: null, muscleGroup: 'Pecho' },
      { id: 'c2', n: 'Dominadas Pronas Estrictas', s: '4x8 reps', done: false, rpe: null, muscleGroup: 'Espalda' },
      { id: 'c3', n: 'Fondos en Paralelas / Dips', s: '4x12 reps', done: false, rpe: null, muscleGroup: 'Pecho/Tríceps' },
      { id: 'c4', n: 'Pistol Squats o Búlgaras Libres', s: '3x10 por pierna', done: false, rpe: null, muscleGroup: 'Piernas' },
      { id: 'c5', n: 'Flexiones en Pica (Pike Push-ups)', s: '3x10 reps', done: false, rpe: null, muscleGroup: 'Hombros' },
      { id: 'c6', n: 'Hanging Leg Raises / L-Sit', s: '3x12 reps', done: false, rpe: null, muscleGroup: 'Core' },
    ],
  },
];

const SUGGESTED_EXERCISES = [
  'Sentadilla Trasera con Barra',
  'Press de Banca Olímpico',
  'Peso Muerto Rumano',
  'Press Militar con Barra',
  'Dominadas Pronas Estrictas',
  'Remo con Barra Pendlay',
  'Zancadas Búlgaras',
  'Press Inclinado con Mancuernas',
  'Fondos en Paralelas',
  'Elevaciones Laterales',
  'Curl de Bíceps con Barra',
  'Extensiones de Tríceps',
  'Hip Thrust con Barra',
  'Prensa de Piernas 45°',
  'Plancha Abdominal de Acero',
];

const SUGGESTED_SETS = [
  '4x8 (RIR 2)',
  '3x10 (RIR 2)',
  '4x12 (RIR 1)',
  '3x15 (Fallo)',
  '4 al fallo',
  '3x50 seg',
  '4x6 (Pesado)',
];

const MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Full Body'];

export default function TrainerScreen() {
  const { log, toggleTraining, saveReadinessScore, updateEffectiveSets, setCustomRoutine } = useDailyLog();

  const [amorFatiEjercicios, setAmorFatiEjercicios] = useState<CustomExercise[]>(CALISTENIA_MOCK);
  const [isAmorFati, setIsAmorFati] = useState(false);

  // Derivar la rutina activa directamente de log.customRoutine
  const activeRoutine = (log.customRoutine && log.customRoutine.length > 0) ? log.customRoutine : RUTINA_MOCK;
  const ejercicios = isAmorFati ? amorFatiEjercicios : activeRoutine;

  // Readiness State
  const [sleepScore, setSleepScore] = useState(log.readinessScore?.sleep || 8);
  const [stressScore, setStressScore] = useState(log.readinessScore?.stress || 3);
  const [sorenessScore, setSorenessScore] = useState(log.readinessScore?.soreness || 2);
  const [showReadinessModal, setShowReadinessModal] = useState(!log.readinessScore);

  // Custom Exercise Editor State (Modal para Crear / Editar)
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [exerciseNameInput, setExerciseNameInput] = useState('');
  const [exerciseSetsInput, setExerciseSetsInput] = useState('4x8 (RIR 2)');
  const [exerciseMuscleInput, setExerciseMuscleInput] = useState('Pecho');

  // Presets Modal State
  const [showPresetsModal, setShowPresetsModal] = useState(false);

  // AI Workout Generator State
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<number>(log.prokoptonProfile?.sessionDurationMinutes || 45);
  const [selectedFocus, setSelectedFocus] = useState<string>(
    log.prokoptonProfile?.focus === 'fat_loss' ? 'Recomposición / Grasa' :
    log.prokoptonProfile?.focus === 'longevity' ? 'Longevidad / Resistencia' :
    log.prokoptonProfile?.focus === 'mental' ? 'Disciplina / Temple' :
    'Full Body / Fuerza'
  );
  const [selectedEquip, setSelectedEquip] = useState<string>(
    log.prokoptonProfile?.equipment === 'calisthenics' ? 'Peso Corporal' :
    log.prokoptonProfile?.equipment === 'home_dumbbell' ? 'Mancuernas en Casa' :
    'Gimnasio'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRoutine, setGeneratedRoutine] = useState<{ title: string; exercises: CustomExercise[] } | null>(null);

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  };

  const calculateEffectiveSets = (list: CustomExercise[]) => {
    let totalEffective = 0;
    list.filter(e => e.done && (e.rpe || 0) >= 7).forEach(e => {
      const setsMatch = e.s.match(/^(\d+)/);
      const numSets = setsMatch ? parseInt(setsMatch[1], 10) : 3;
      totalEffective += numSets;
    });
    updateEffectiveSets(totalEffective);
  };

  const toggleDone = (id: string) => {
    triggerHaptic();
    if (isAmorFati) {
      const updated = amorFatiEjercicios.map(e => {
        if (e.id === id) {
          return { ...e, done: !e.done, rpe: !e.done ? (e.rpe || 7) : null };
        }
        return e;
      });
      setAmorFatiEjercicios(updated);
      calculateEffectiveSets(updated);
    } else {
      const updated = activeRoutine.map(e => {
        if (e.id === id) {
          return { ...e, done: !e.done, rpe: !e.done ? (e.rpe || 7) : null };
        }
        return e;
      });
      setCustomRoutine(updated);
      calculateEffectiveSets(updated);
    }
  };

  const setRPE = (id: string, value: number) => {
    triggerHaptic();
    if (isAmorFati) {
      const updated = amorFatiEjercicios.map(e => e.id === id ? { ...e, rpe: value, done: true } : e);
      setAmorFatiEjercicios(updated);
      calculateEffectiveSets(updated);
    } else {
      const updated = activeRoutine.map(e => e.id === id ? { ...e, rpe: value, done: true } : e);
      setCustomRoutine(updated);
      calculateEffectiveSets(updated);
    }
  };

  // CUSTOMIZATION ACTIONS
  const openAddExerciseModal = () => {
    setEditingExerciseId(null);
    setExerciseNameInput('');
    setExerciseSetsInput('4x8 (RIR 2)');
    setExerciseMuscleInput('Pecho');
    setShowExerciseModal(true);
  };

  const openEditExerciseModal = (exercise: CustomExercise) => {
    setEditingExerciseId(exercise.id);
    setExerciseNameInput(exercise.n);
    setExerciseSetsInput(exercise.s);
    setExerciseMuscleInput(exercise.muscleGroup || 'Pecho');
    setShowExerciseModal(true);
  };

  const handleSaveExercise = () => {
    const trimmedName = exerciseNameInput.trim();
    if (!trimmedName) {
      Alert.alert('Campo Requerido', 'Ingresa un nombre para el ejercicio.');
      return;
    }

    triggerHaptic();
    const finalSets = exerciseSetsInput.trim() || '3x10';

    if (editingExerciseId) {
      // Editar existente
      if (isAmorFati) {
        const updated = amorFatiEjercicios.map(e =>
          e.id === editingExerciseId
            ? { ...e, n: trimmedName, s: finalSets, muscleGroup: exerciseMuscleInput }
            : e
        );
        setAmorFatiEjercicios(updated);
      } else {
        const updated = activeRoutine.map(e =>
          e.id === editingExerciseId
            ? { ...e, n: trimmedName, s: finalSets, muscleGroup: exerciseMuscleInput }
            : e
        );
        setCustomRoutine(updated);
      }
    } else {
      // Crear nuevo
      const newEx: CustomExercise = {
        id: `custom_${Date.now()}`,
        n: trimmedName,
        s: finalSets,
        done: false,
        rpe: null,
        muscleGroup: exerciseMuscleInput,
      };

      if (isAmorFati) {
        setAmorFatiEjercicios([...amorFatiEjercicios, newEx]);
      } else {
        setCustomRoutine([...activeRoutine, newEx]);
      }
    }

    setShowExerciseModal(false);
  };

  const handleDeleteExercise = (id: string, name: string) => {
    Alert.alert(
      'Eliminar Ejercicio',
      `¿Deseas quitar "${name}" de tu sesión libre?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            triggerHaptic();
            if (isAmorFati) {
              const updated = amorFatiEjercicios.filter(e => e.id !== id);
              setAmorFatiEjercicios(updated);
              calculateEffectiveSets(updated);
            } else {
              const updated = activeRoutine.filter(e => e.id !== id);
              setCustomRoutine(updated);
              calculateEffectiveSets(updated);
            }
          },
        },
      ]
    );
  };

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    triggerHaptic();
    const targetList = isAmorFati ? [...amorFatiEjercicios] : [...activeRoutine];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= targetList.length) return;

    const item = targetList[index];
    targetList[index] = targetList[targetIndex];
    targetList[targetIndex] = item;

    if (isAmorFati) {
      setAmorFatiEjercicios(targetList);
    } else {
      setCustomRoutine(targetList);
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_ROUTINES[0]) => {
    triggerHaptic();
    if (isAmorFati) setIsAmorFati(false);
    setCustomRoutine(preset.exercises);
    setShowPresetsModal(false);
    Alert.alert('⚡ Rutina Cargada', `Se ha aplicado la plantilla "${preset.title}" a tu sesión libre.`);
  };

  const handleResetToDefault = () => {
    Alert.alert(
      'Restablecer Rutina Base',
      '¿Deseas restaurar la rutina recomendada por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'default',
          onPress: () => {
            triggerHaptic();
            if (isAmorFati) setIsAmorFati(false);
            setCustomRoutine(RUTINA_MOCK);
            Alert.alert('✓ Rutina Restaurada', 'Se ha cargado la rutina base de fuerza.');
          },
        },
      ]
    );
  };

  const handleSaveReadiness = () => {
    triggerHaptic();
    saveReadinessScore(sleepScore, stressScore, sorenessScore);
    setShowReadinessModal(false);
    const calculatedTotal = Math.round((sleepScore * 0.4) + ((10 - stressScore) * 0.3) + ((10 - sorenessScore) * 0.3));
    if (calculatedTotal < 5) {
      Alert.alert(
        "⚡ Recomendación Amor Fati",
        `Tu índice de disposición actual es de ${calculatedTotal}/10 (Bajo). Se recomienda reducir volumen o cambiar a rutina adaptada de calistenia.`
      );
    }
  };

  const checkDeload = () => {
    triggerHaptic();
    const doneExercises = ejercicios.filter(e => e.done && e.rpe !== null);
    if (doneExercises.length === 0) {
      Alert.alert("Entreno no iniciado", "Marca al menos un ejercicio completado para finalizar la sesión.");
      return;
    }

    if (!log.trainingCompleted) {
      toggleTraining();
    }

    const avgRpe = doneExercises.reduce((acc, curr) => acc + (curr.rpe || 0), 0) / doneExercises.length;
    if (avgRpe > 8.5) {
      Alert.alert(
        "Semana de Descarga",
        "El arco que siempre está tenso termina por romperse. Tu esfuerzo (RPE) ha sido muy alto. Bajaremos la intensidad mañana. Lo que depende de ti es recuperar."
      );
    } else {
      Alert.alert("Entreno Finalizado", "Buen trabajo manteniendo el control. Tu hábito de entreno fue registrado.");
    }
  };

  const toggleAmorFati = () => {
    triggerHaptic();
    const nextAmorFati = !isAmorFati;
    setIsAmorFati(nextAmorFati);
    Alert.alert("Amor Fati", nextAmorFati ? "No controlas tu entorno, pero controlas tu reacción. Rutina adaptada a peso corporal." : "Volviendo a tu rutina personalizada.");
  };

  // AI GENERATOR LOGIC
  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setGeneratedRoutine(null);

    try {
      if (!ai) {
        setTimeout(() => {
          const fallbackData = buildFallbackAIRoutine(selectedTime, selectedFocus, selectedEquip);
          setGeneratedRoutine(fallbackData);
          setIsGenerating(false);
        }, 1200);
        return;
      }

      const prompt = `Crea una rutina de entrenamiento de alta eficiencia científica y filosofía estoica para una sesión de ${selectedTime} minutos.
Equipo disponible: ${selectedEquip}.
Enfoque muscular / objetivo: ${selectedFocus}.

Responde SOLAMENTE con un JSON válido sin texto adicional con esta estructura exacta:
{
  "title": "Nombre épico en español (ej: Torso Estoico de Alta Intensidad)",
  "exercises": [
    { "id": "1", "n": "Nombre del Ejercicio", "s": "4x8 (RIR 2)", "muscleGroup": "Pecho" },
    { "id": "2", "n": "Nombre del Ejercicio 2", "s": "3x10 (RIR 2)", "muscleGroup": "Espalda" },
    { "id": "3", "n": "Nombre del Ejercicio 3", "s": "3x12 (Fallo)", "muscleGroup": "Piernas" }
  ]
}`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), 7500)
      );

      const apiCall = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const response = await Promise.race([apiCall, timeoutPromise]);
      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const formattedExercises: CustomExercise[] = parsed.exercises.map((e: any, idx: number) => ({
        id: `ai_${idx + 1}_${Date.now()}`,
        n: e.n,
        s: e.s,
        done: false,
        rpe: null,
        muscleGroup: e.muscleGroup || 'Full Body',
      }));

      setGeneratedRoutine({
        title: parsed.title,
        exercises: formattedExercises,
      });
    } catch (error) {
      console.warn("Gemini AI Workout Generator fallback triggered:", error);
      const fallbackData = buildFallbackAIRoutine(selectedTime, selectedFocus, selectedEquip);
      setGeneratedRoutine(fallbackData);
    } finally {
      setIsGenerating(false);
    }
  };

  const buildFallbackAIRoutine = (time: number, focus: string, equip: string) => {
    let title = `Rutina ${focus} (${time} min)`;
    let exercises: CustomExercise[] = [];

    if (equip === 'Peso Corporal') {
      title = `Calistenia Espartana ${focus} (${time} min)`;
      exercises = [
        { id: 'fa1', n: 'Flexiones Declinadas o en Pica', s: '4 al fallo', done: false, rpe: null, muscleGroup: 'Pecho' },
        { id: 'fa2', n: 'Sentadillas Explosivas con Pausa', s: '4x20', done: false, rpe: null, muscleGroup: 'Piernas' },
        { id: 'fa3', n: 'Zancadas Alternas en Desplazamiento', s: '3x16', done: false, rpe: null, muscleGroup: 'Piernas' },
        { id: 'fa4', n: 'Plancha Isométrica de Oso', s: '3x50s', done: false, rpe: null, muscleGroup: 'Core' },
      ];
    } else if (focus.includes('Empuje')) {
      title = `Poder de Empuje & Hombros (${time} min)`;
      exercises = [
        { id: 'fe1', n: 'Press de Banca Plano con Barra', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Pecho' },
        { id: 'fe2', n: 'Press Militar de Hombro con Mancuernas', s: '3x10 (RIR 2)', done: false, rpe: null, muscleGroup: 'Hombros' },
        { id: 'fe3', n: 'Fondos en Paralelas / Inclinado', s: '3x12 (RIR 1)', done: false, rpe: null, muscleGroup: 'Pecho' },
        { id: 'fe4', n: 'Elevaciones Laterales para Deltoides', s: '3x15', done: false, rpe: null, muscleGroup: 'Hombros' },
      ];
    } else if (focus.includes('Tracción')) {
      title = `Densidad de Espalda & Bíceps (${time} min)`;
      exercises = [
        { id: 'ft1', n: 'Peso Muerto Rumano con Barra', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Espalda' },
        { id: 'ft2', n: 'Remo Pendlay con Barra', s: '4x10 (RIR 2)', done: false, rpe: null, muscleGroup: 'Espalda' },
        { id: 'ft3', n: 'Jalón al Pecho Agarre Neutro', s: '3x10', done: false, rpe: null, muscleGroup: 'Espalda' },
        { id: 'ft4', n: 'Curl Martillo de Bíceps', s: '3x12', done: false, rpe: null, muscleGroup: 'Brazos' },
      ];
    } else {
      title = `Fuerza Full Body Estoica (${time} min)`;
      exercises = [
        { id: 'fb1', n: 'Sentadilla Trasera Profunda', s: '4x8 (RIR 2)', done: false, rpe: null, muscleGroup: 'Piernas' },
        { id: 'fb2', n: 'Press Inclinado con Mancuernas', s: '3x10 (RIR 2)', done: false, rpe: null, muscleGroup: 'Pecho' },
        { id: 'fb3', n: 'Remo Unilateral con Mancuerna', s: '3x10 por lado', done: false, rpe: null, muscleGroup: 'Espalda' },
        { id: 'fb4', n: 'Zancadas Búlgaras', s: '3x10 por pierna', done: false, rpe: null, muscleGroup: 'Piernas' },
        { id: 'fb5', n: 'Plancha Abdominal con Peso', s: '3x45s', done: false, rpe: null, muscleGroup: 'Core' },
      ];
    }

    return { title, exercises };
  };

  const handleApplyAIRoutine = () => {
    if (!generatedRoutine) return;
    triggerHaptic();
    setCustomRoutine(generatedRoutine.exercises);
    if (isAmorFati) setIsAmorFati(false);
    setShowGeneratorModal(false);
    Alert.alert("⚡ Rutina IA Cargada", `"${generatedRoutine.title}" ha sido cargada como tu sesión activa.`);
  };

  const durationMin = log.prokoptonProfile?.sessionDurationMinutes || selectedTime || 45;
  const daysFreq = log.prokoptonProfile?.daysPerWeek || 4;

  const getEquipmentLabel = () => {
    if (isAmorFati) return 'Calistenia (Amor Fati)';
    if (!log.prokoptonProfile) return 'Gimnasio';
    switch (log.prokoptonProfile.equipment) {
      case 'gym': return 'Gimnasio';
      case 'home_dumbbell': return 'Mancuernas en Casa';
      case 'calisthenics': return 'Calistenia';
      default: return 'Gimnasio';
    }
  };

  const getFocusLabel = () => {
    if (isAmorFati) return 'Calistenia Espartana';
    if (!log.prokoptonProfile) return '⚡ Rutina de Fuerza Libre';
    switch (log.prokoptonProfile.focus) {
      case 'strength': return '⚡ Fuerza Espartana & Hipertrofia';
      case 'fat_loss': return '🔥 Recomposición & Definición';
      case 'longevity': return '🏛️ Resistencia & Longevidad';
      case 'mental': return '🧠 Disciplina & Temple Mental';
      default: return '⚡ Rutina de Fuerza Libre';
    }
  };

  const equipName = getEquipmentLabel();
  const focusTitle = getFocusLabel();
  const completedCount = ejercicios.filter(e => e.done).length;
  const effectiveSetsToday = log.effectiveSets || 0;

  return (
    <PearlElectricBackground glowColor="rgba(212, 175, 55, 0.28)">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header de la Sesión */}
        <View style={styles.header}>
          <View style={styles.headerTopBadgeRow}>
            <View style={styles.moduleBadgeContainer}>
              <ThemedText style={styles.moduleBadgeText}>
                🏋️‍♂️ ENTRENO LIBRE & PERSONALIZABLE • 100% MODULAR
              </ThemedText>
            </View>
          </View>

          <View style={styles.headerMainRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <ThemedText style={styles.label}>SESIÓN LIBRE — {equipName.toUpperCase()}</ThemedText>
              <ThemedText style={styles.title}>{focusTitle}</ThemedText>
              <ThemedText style={styles.metaSub}>
                ⏱️ {durationMin} min | {completedCount}/{ejercicios.length} ejercicios completados
              </ThemedText>
            </View>
            <TouchableOpacity 
              style={[
                styles.amorFatiBtn, 
                { 
                  borderColor: '#D4AF37', 
                  backgroundColor: isAmorFati ? '#D4AF37' : 'rgba(212, 175, 55, 0.15)' 
                }
              ]}
              onPress={toggleAmorFati}
              activeOpacity={0.8}
            >
              <ThemedText style={[styles.amorFatiText, { color: isAmorFati ? '#050507' : '#FFE259' }]}>
                {isAmorFati ? '✓ Calistenia' : 'Amor Fati'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBanner}>
            <ThemedText style={styles.infoBannerText}>
              💡 Personaliza tu sesión añadiendo, editando o reordenando ejercicios a tu ritmo. Para registrar el reto sagrado de 30 días, sella la sesión obligatoria en la pestaña "Historial / Programa".
            </ThemedText>
          </View>
        </View>

        {/* BARRA DE ACCIONES DE PERSONALIZACIÓN */}
        <View style={styles.customActionToolbar}>
          <TouchableOpacity
            style={styles.actionToolBtnPrimary}
            onPress={openAddExerciseModal}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#D4AF37', '#F59E0B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionToolGradient}
            >
              <ThemedText style={styles.actionToolPrimaryText}>➕ AÑADIR EJERCICIO</ThemedText>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionToolBtnSecondary}
            onPress={() => setShowPresetsModal(true)}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.actionToolSecondaryText}>📂 PLANTILLAS</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionToolBtnIcon}
            onPress={handleResetToDefault}
            activeOpacity={0.75}
          >
            <ThemedText style={styles.actionToolIconText}>🔄</ThemedText>
          </TouchableOpacity>
        </View>

        {/* BANNER DE PLAN PERSONALIZADO (PROKOPTON) */}
        {log.prokoptonProfile && (
          <View style={styles.prokoptonBanner}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ThemedText style={{ fontSize: 20 }}>🏛️</ThemedText>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.prokoptonBannerTitle}>
                  PLAN PERSONALIZADO • {(log.userName || 'PROKOPTON').toUpperCase()}
                </ThemedText>
                <ThemedText style={styles.prokoptonBannerSub}>
                  {equipName} • {daysFreq} días/sem • {durationMin} min por sesión
                </ThemedText>
              </View>
              <View style={styles.prokoptonTag}>
                <ThemedText style={styles.prokoptonTagText}>CALIBRADO</ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* BOTÓN PRINCIPAL GENERADOR DE RUTINAS IA */}
        <TouchableOpacity
          onPress={() => setShowGeneratorModal(true)}
          activeOpacity={0.85}
          style={styles.generatorMainTouch}
        >
          <LinearGradient
            colors={['#0F172A', '#1E293B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.generatorMainGradient}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ThemedText style={{ fontSize: 24 }}>✨</ThemedText>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.generatorBtnTitle}>⚡ GENERADOR DE RUTINAS CON GEMINI IA</ThemedText>
                <ThemedText style={styles.generatorBtnSub}>Diseña tu sesión perfecta según tiempo, equipo y nivel en segundos</ThemedText>
              </View>
              <ThemedText style={{ fontSize: 16, color: '#FFE259' }}>➔</ThemedText>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Card de Disposición Fisiológica (Readiness Score) */}
        <View style={styles.readinessCard}>
          <View style={styles.readinessHeaderRow}>
            <ThemedText style={styles.cardSectionTitle}>⚡ Disposición Fisiológica (Readiness)</ThemedText>
            <TouchableOpacity onPress={() => setShowReadinessModal(!showReadinessModal)}>
              <ThemedText style={styles.readinessToggleBtnText}>
                {showReadinessModal ? "Ocultar" : "Ajustar"}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {log.readinessScore && !showReadinessModal ? (
            <View style={styles.readinessSummary}>
              <View style={styles.scoreBadge}>
                <ThemedText style={styles.scoreNumber}>{log.readinessScore.total}</ThemedText>
                <ThemedText style={styles.scoreLabel}>/ 10</ThemedText>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <ThemedText style={styles.readinessMetricsText}>
                  Sueño: <ThemedText style={{ fontWeight: 'bold', color: '#FFE259' }}>{log.readinessScore.sleep}/10</ThemedText> | Estrés: <ThemedText style={{ fontWeight: 'bold', color: '#FFE259' }}>{log.readinessScore.stress}/10</ThemedText>
                </ThemedText>
                <ThemedText style={styles.readinessVerdictText}>
                  {log.readinessScore.total >= 7 ? "🟢 Estado Óptimo para Alta Carga" : log.readinessScore.total >= 5 ? "🟡 Estado Moderado (Ajusta RPE a 7-8)" : "🔴 Alta Fatiga: Sugerido Amor Fati / Calistenia"}
                </ThemedText>
              </View>
            </View>
          ) : (
            <View style={styles.readinessSliders}>
              <View style={styles.sliderRow}>
                <ThemedText style={styles.sliderLabel}>Calidad de Sueño (1-10): {sleepScore}</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
                  {[1, 3, 5, 7, 8, 9, 10].map(v => (
                    <TouchableOpacity
                      key={`sl_${v}`}
                      style={[styles.miniBtn, sleepScore === v && styles.miniBtnActive]}
                      onPress={() => {
                        triggerHaptic();
                        setSleepScore(v);
                      }}
                    >
                      <ThemedText style={sleepScore === v ? styles.miniBtnTextActive : styles.miniBtnTextInactive}>{v}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.sliderRow}>
                <ThemedText style={styles.sliderLabel}>Estrés / Carga Mental (1-10): {stressScore}</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
                  {[1, 3, 5, 7, 8, 9, 10].map(v => (
                    <TouchableOpacity
                      key={`st_${v}`}
                      style={[styles.miniBtn, stressScore === v && styles.miniBtnActive]}
                      onPress={() => {
                        triggerHaptic();
                        setStressScore(v);
                      }}
                    >
                      <ThemedText style={stressScore === v ? styles.miniBtnTextActive : styles.miniBtnTextInactive}>{v}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.sliderRow}>
                <ThemedText style={styles.sliderLabel}>Fatiga / Dolor Muscular (1-10): {sorenessScore}</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
                  {[1, 3, 5, 7, 8, 9, 10].map(v => (
                    <TouchableOpacity
                      key={`sr_${v}`}
                      style={[styles.miniBtn, sorenessScore === v && styles.miniBtnActive]}
                      onPress={() => {
                        triggerHaptic();
                        setSorenessScore(v);
                      }}
                    >
                      <ThemedText style={sorenessScore === v ? styles.miniBtnTextActive : styles.miniBtnTextInactive}>{v}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TouchableOpacity style={styles.saveReadinessBtn} onPress={handleSaveReadiness}>
                <ThemedText style={styles.saveReadinessBtnText}>Guardar Evaluación de Disposición</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Indicator de Volumen Efectivo Acumulado */}
        <View style={styles.volumeBanner}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <ThemedText style={styles.volumeLabel}>Series Efectivas Hoy (RPE ≥ 7)</ThemedText>
              <ThemedText style={styles.volumeValue}>{effectiveSetsToday} Sets</ThemedText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <ThemedText style={styles.volumeSubLabel}>Meta Semanal Científica</ThemedText>
              <ThemedText style={styles.volumeSubValue}>10 - 20 Sets / Músculo</ThemedText>
            </View>
          </View>
        </View>

        {/* TÍTULO DE LA LISTA DE EJERCICIOS */}
        <View style={styles.listHeaderRow}>
          <ThemedText style={styles.listHeaderTitle}>
            ⚔️ EJERCICIOS DE LA SESIÓN ({ejercicios.length})
          </ThemedText>
          <TouchableOpacity onPress={openAddExerciseModal} activeOpacity={0.7}>
            <ThemedText style={styles.listAddQuickBtn}>+ Añadir</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Lista de Ejercicios */}
        <View style={styles.list}>
          {ejercicios.length === 0 ? (
            <View style={styles.emptyListCard}>
              <ThemedText style={{ fontSize: 32, textAlign: 'center' }}>🏋️‍♂️</ThemedText>
              <ThemedText style={styles.emptyTitle}>Rutina Vacía</ThemedText>
              <ThemedText style={styles.emptySub}>Añade ejercicios personalizados o carga una plantilla rápida para comenzar.</ThemedText>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={openAddExerciseModal}>
                <ThemedText style={styles.emptyAddBtnText}>➕ Añadir Primer Ejercicio</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            ejercicios.map((e, index) => {
              const hasRpe = e.rpe !== null && e.rpe !== undefined;
              let progressionTip = "";
              if (hasRpe) {
                if (e.rpe! <= 7) {
                  progressionTip = "💡 Progresión sugerida: Incrementar peso +2.5% a +5% en la siguiente sesión.";
                } else if (e.rpe! >= 9.5) {
                  progressionTip = "⚠️ Límite de fallo alcanzado. Consolidar técnica con misma carga antes de subir.";
                } else {
                  progressionTip = "🎯 Zona óptima de hipertrofia y estímulo (RPE 8-9).";
                }
              }

              return (
                <View key={e.id} style={styles.card}>
                  {/* Fila Principal del Ejercicio */}
                  <View style={styles.cardTopRow}>
                    <TouchableOpacity 
                      style={styles.cardHeaderTouch}
                      onPress={() => toggleDone(e.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.checkbox,
                        e.done ? styles.checkboxDone : styles.checkboxPending
                      ]}>
                        {e.done && <ThemedText style={styles.checkboxCheck}>✓</ThemedText>}
                      </View>

                      <View style={{ flex: 1 }}>
                        <ThemedText style={[styles.exerciseName, e.done && styles.exerciseNameDone]}>
                          {e.n}
                        </ThemedText>

                        <View style={styles.exerciseBadgesRow}>
                          <View style={styles.setsBadge}>
                            <ThemedText style={styles.setsBadgeText}>{e.s}</ThemedText>
                          </View>
                          {e.muscleGroup && (
                            <View style={styles.muscleBadge}>
                              <ThemedText style={styles.muscleBadgeText}>{e.muscleGroup}</ThemedText>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Botones de Gestión de Ejercicio (Editar, Subir/Bajar, Borrar) */}
                    <View style={styles.exerciseControlsRow}>
                      <TouchableOpacity
                        style={styles.iconCtrlBtn}
                        onPress={() => openEditExerciseModal(e)}
                        activeOpacity={0.7}
                      >
                        <ThemedText style={styles.iconCtrlText}>✏️</ThemedText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.iconCtrlBtn}
                        onPress={() => handleMoveExercise(index, 'up')}
                        disabled={index === 0}
                        activeOpacity={0.7}
                      >
                        <ThemedText style={[styles.iconCtrlText, index === 0 && { opacity: 0.3 }]}>⬆️</ThemedText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.iconCtrlBtn}
                        onPress={() => handleMoveExercise(index, 'down')}
                        disabled={index === ejercicios.length - 1}
                        activeOpacity={0.7}
                      >
                        <ThemedText style={[styles.iconCtrlText, index === ejercicios.length - 1 && { opacity: 0.3 }]}>⬇️</ThemedText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.iconCtrlBtn, styles.iconCtrlDelete]}
                        onPress={() => handleDeleteExercise(e.id, e.n)}
                        activeOpacity={0.7}
                      >
                        <ThemedText style={styles.iconCtrlText}>🗑️</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {/* Selector de RPE */}
                  <View style={styles.rpeContainer}>
                    <ThemedText style={styles.rpeSectionLabel}>RPE (Esfuerzo Percibido 1-10):</ThemedText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 5 }}>
                      {[...Array(10)].map((_, i) => {
                        const rpeValue = i + 1;
                        const isSelected = e.rpe === rpeValue;
                        return (
                          <TouchableOpacity 
                            key={rpeValue} 
                            style={[
                              styles.rpeButton, 
                              isSelected && styles.rpeButtonActive
                            ]}
                            onPress={() => setRPE(e.id, rpeValue)}
                          >
                            <ThemedText style={isSelected ? styles.rpeButtonTextActive : styles.rpeButtonTextInactive}>
                              {rpeValue}
                            </ThemedText>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {progressionTip !== "" && (
                    <View style={styles.progressionBox}>
                      <ThemedText style={styles.progressionTipText}>
                        {progressionTip}
                      </ThemedText>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* BOTÓN DE FINALIZAR SESIÓN */}
        <TouchableOpacity 
          style={styles.finishBtnTouch}
          onPress={checkDeload}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#D4AF37', '#F59E0B', '#B45309']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.finishBtnGradient}
          >
            <ThemedText style={styles.finishBtnText}>⚡ FINALIZAR SESIÓN DE FUERZA</ThemedText>
          </LinearGradient>
        </TouchableOpacity>

        {/* MODAL PARA AÑADIR / EDITAR EJERCICIO */}
        <Modal visible={showExerciseModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <ThemedText style={styles.modalTitle}>
                {editingExerciseId ? '✏️ Editar Ejercicio' : '➕ Añadir Ejercicio'}
              </ThemedText>
              <ThemedText style={styles.modalSub}>
                Configura los detalles del movimiento para tu rutina personalizada:
              </ThemedText>

              {/* Nombre del Ejercicio */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Nombre del Ejercicio:</ThemedText>
                <TextInput
                  style={styles.formInput}
                  value={exerciseNameInput}
                  onChangeText={setExerciseNameInput}
                  placeholder="Ej: Press Francés, Sentadilla Búlgara..."
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* Sugerencias Rápidas de Ejercicios */}
              <View style={styles.quickChipsSection}>
                <ThemedText style={styles.quickChipsLabel}>Sugerencias Rápidas:</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {SUGGESTED_EXERCISES.map((sug, i) => (
                    <TouchableOpacity
                      key={`sug_${i}`}
                      style={styles.sugChip}
                      onPress={() => {
                        triggerHaptic();
                        setExerciseNameInput(sug);
                      }}
                    >
                      <ThemedText style={styles.sugChipText}>{sug}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Series y Repeticiones */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Series y Repeticiones:</ThemedText>
                <TextInput
                  style={styles.formInput}
                  value={exerciseSetsInput}
                  onChangeText={setExerciseSetsInput}
                  placeholder="Ej: 4x8 (RIR 2), 3x12, 4 al fallo..."
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* Sugerencias de Series */}
              <View style={styles.quickChipsSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {SUGGESTED_SETS.map((sugSet, i) => (
                    <TouchableOpacity
                      key={`set_${i}`}
                      style={styles.sugChip}
                      onPress={() => {
                        triggerHaptic();
                        setExerciseSetsInput(sugSet);
                      }}
                    >
                      <ThemedText style={styles.sugChipText}>{sugSet}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Grupo Muscular */}
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Grupo Muscular:</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {MUSCLE_GROUPS.map((m) => (
                    <TouchableOpacity
                      key={`mg_${m}`}
                      style={[styles.muscleChip, exerciseMuscleInput === m && styles.muscleChipActive]}
                      onPress={() => {
                        triggerHaptic();
                        setExerciseMuscleInput(m);
                      }}
                    >
                      <ThemedText style={[styles.muscleChipText, exerciseMuscleInput === m && styles.muscleChipTextActive]}>
                        {m}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Botón Guardar */}
              <TouchableOpacity
                style={styles.saveExerciseModalBtn}
                onPress={handleSaveExercise}
                activeOpacity={0.85}
              >
                <ThemedText style={styles.saveExerciseModalBtnText}>
                  {editingExerciseId ? 'Guardar Cambios ✓' : 'Añadir a la Rutina ✓'}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setShowExerciseModal(false)}
              >
                <ThemedText style={{ color: '#94A3B8', fontFamily: 'monospace' }}>Cancelar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* MODAL DE PLANTILLAS RÁPIDAS (PRESETS) */}
        <Modal visible={showPresetsModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <ThemedText style={styles.modalTitle}>📂 Plantillas de Rutinas Rápidas</ThemedText>
              <ThemedText style={styles.modalSub}>Selecciona una estructura probada para cargarla al instante:</ThemedText>

              <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                <View style={{ gap: 10, paddingVertical: 4 }}>
                  {PRESET_ROUTINES.map((preset) => (
                    <TouchableOpacity
                      key={preset.id}
                      style={styles.presetCard}
                      onPress={() => handleApplyPreset(preset)}
                      activeOpacity={0.8}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <ThemedText style={{ fontSize: 26 }}>{preset.icon}</ThemedText>
                        <View style={{ flex: 1 }}>
                          <ThemedText style={styles.presetTitle}>{preset.title}</ThemedText>
                          <ThemedText style={styles.presetSub}>{preset.subtitle}</ThemedText>
                          <ThemedText style={styles.presetCount}>
                            {preset.exercises.length} ejercicios calibrados
                          </ThemedText>
                        </View>
                        <ThemedText style={{ color: '#FFE259', fontSize: 16 }}>➔</ThemedText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setShowPresetsModal(false)}
              >
                <ThemedText style={{ color: '#94A3B8', fontFamily: 'monospace' }}>Cerrar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* MODAL DEL GENERADOR DE RUTINAS IA */}
        <Modal visible={showGeneratorModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <ThemedText style={styles.modalTitle}>⚡ Oráculo de Entrenamientos IA</ThemedText>
              <ThemedText style={styles.modalSub}>Configura los parámetros para crear tu sesión perfecta con Gemini:</ThemedText>

              {/* Parámetro 1: Tiempo */}
              <View style={styles.paramSection}>
                <ThemedText style={styles.paramLabel}>⏱️ Tiempo Disponible:</ThemedText>
                <View style={styles.chipRow}>
                  {[15, 30, 45, 60].map((t) => (
                    <TouchableOpacity
                      key={`t_${t}`}
                      style={[styles.paramChip, selectedTime === t && styles.paramChipActive]}
                      onPress={() => {
                        triggerHaptic();
                        setSelectedTime(t);
                      }}
                    >
                      <ThemedText style={[styles.paramChipText, selectedTime === t && styles.paramChipTextActive]}>
                        {t} min
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Parámetro 2: Equipo */}
              <View style={styles.paramSection}>
                <ThemedText style={styles.paramLabel}>🏋️‍♂️ Equipo Disponible:</ThemedText>
                <View style={styles.chipRow}>
                  {['Gimnasio', 'Mancuernas en Casa', 'Peso Corporal'].map((eq) => (
                    <TouchableOpacity
                      key={`eq_${eq}`}
                      style={[styles.paramChip, selectedEquip === eq && styles.paramChipActive]}
                      onPress={() => {
                        triggerHaptic();
                        setSelectedEquip(eq);
                      }}
                    >
                      <ThemedText style={[styles.paramChipText, selectedEquip === eq && styles.paramChipTextActive]}>
                        {eq}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Parámetro 3: Enfoque Muscular */}
              <View style={styles.paramSection}>
                <ThemedText style={styles.paramLabel}>⚔️ Enfoque Principal:</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {['Full Body / Fuerza', 'Empuje (Pecho/Hombro)', 'Tracción (Espalda/Bíceps)', 'Pierna & Core'].map((f) => (
                    <TouchableOpacity
                      key={`f_${f}`}
                      style={[styles.paramChip, selectedFocus === f && styles.paramChipActive]}
                      onPress={() => {
                        triggerHaptic();
                        setSelectedFocus(f);
                      }}
                    >
                      <ThemedText style={[styles.paramChipText, selectedFocus === f && styles.paramChipTextActive]}>
                        {f}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Botón de Generar */}
              <TouchableOpacity
                style={styles.generateActionBtn}
                onPress={handleGenerateAI}
                disabled={isGenerating}
                activeOpacity={0.85}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#070B14" />
                ) : (
                  <ThemedText style={styles.generateActionBtnText}>Diseñar Rutina con Gemini IA 🚀</ThemedText>
                )}
              </TouchableOpacity>

              {/* Resultado de la Generación */}
              {generatedRoutine && (
                <View style={styles.generatedPreviewBox}>
                  <ThemedText style={styles.genTitle}>{generatedRoutine.title}</ThemedText>
                  <View style={styles.genList}>
                    {generatedRoutine.exercises.map((ex, i) => (
                      <ThemedText key={`gen_${i}`} style={styles.genExerciseItem}>
                        • {ex.n} ({ex.s})
                      </ThemedText>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={styles.loadRoutineBtn}
                    onPress={handleApplyAIRoutine}
                    activeOpacity={0.85}
                  >
                    <ThemedText style={styles.loadRoutineBtnText}>Cargar Rutina en la Sesión de Hoy ✓</ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setShowGeneratorModal(false)}
              >
                <ThemedText style={{ color: '#94A3B8', fontFamily: 'monospace' }}>Cerrar</ThemedText>
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
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
  header: {
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  headerTopBadgeRow: {
    marginBottom: 8,
  },
  moduleBadgeContainer: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  moduleBadgeText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#38BDF8',
    letterSpacing: 1,
  },
  headerMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#38BDF8',
    letterSpacing: 2,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  title: {
    fontSize: 24,
    fontFamily: 'serif',
    marginTop: 4,
    textTransform: 'uppercase',
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(212, 175, 55, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  metaSub: {
    fontSize: 12,
    color: '#FFE259',
    marginTop: 4,
    fontWeight: 'bold',
  },
  amorFatiBtn: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  amorFatiText: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  infoBannerText: {
    fontSize: 10.5,
    color: '#CBD5E1',
    fontStyle: 'italic',
    lineHeight: 15,
  },

  // TOOLBAR DE PERSONALIZACIÓN
  customActionToolbar: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: Spacing.two,
    alignItems: 'center',
  },
  actionToolBtnPrimary: {
    flex: 1.4,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  actionToolGradient: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionToolPrimaryText: {
    color: '#050507',
    fontWeight: '900',
    fontFamily: 'monospace',
    fontSize: 11.5,
    letterSpacing: 0.5,
  },
  actionToolBtnSecondary: {
    flex: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.40)',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionToolSecondaryText: {
    color: '#FFE259',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  actionToolBtnIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionToolIconText: {
    fontSize: 16,
  },

  // PROKOPTON BANNER
  prokoptonBanner: {
    backgroundColor: 'rgba(212, 175, 55, 0.10)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: Spacing.two,
  },
  prokoptonBannerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'serif',
    letterSpacing: 0.5,
  },
  prokoptonBannerSub: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 1,
  },
  prokoptonTag: {
    backgroundColor: '#D4AF37',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  prokoptonTagText: {
    color: '#050507',
    fontSize: 9,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },

  // GENERATOR BUTTON
  generatorMainTouch: {
    marginBottom: Spacing.two,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  generatorMainGradient: {
    padding: Spacing.three,
  },
  generatorBtnTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  generatorBtnSub: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontFamily: 'sans-serif',
    marginTop: 2,
  },

  // READINESS CARD
  readinessCard: {
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: 'rgba(13, 17, 28, 0.95)',
    marginBottom: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  readinessHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardSectionTitle: {
    fontSize: 12.5,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    color: '#FFE259',
  },
  readinessToggleBtnText: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: 'bold',
  },
  readinessSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFE259',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#FFE259',
    marginLeft: 2,
  },
  readinessMetricsText: {
    fontSize: 12,
    color: '#E2E8F0',
  },
  readinessVerdictText: {
    fontSize: 11,
    color: '#38BDF8',
    marginTop: 2,
    fontStyle: 'italic',
  },
  readinessSliders: {
    marginTop: 8,
    gap: 8,
  },
  sliderRow: {
    gap: 4,
  },
  sliderLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  miniBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniBtnActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  miniBtnTextActive: {
    color: '#050507',
    fontWeight: 'bold',
  },
  miniBtnTextInactive: {
    color: '#94A3B8',
  },
  saveReadinessBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  saveReadinessBtnText: {
    color: '#050507',
    fontWeight: '900',
    fontSize: 12,
  },

  // VOLUME BANNER
  volumeBanner: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: 'rgba(13, 17, 28, 0.95)',
    marginBottom: Spacing.two,
  },
  volumeLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  volumeValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'serif',
  },
  volumeSubLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  volumeSubValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FDE68A',
  },

  // LIST HEADER
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  listHeaderTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#FFE259',
    letterSpacing: 1,
  },
  listAddQuickBtn: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#38BDF8',
  },

  // LIST & CARDS
  list: {
    gap: Spacing.two,
  },
  emptyListCard: {
    padding: Spacing.four,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(212, 175, 55, 0.4)',
    backgroundColor: 'rgba(13, 17, 28, 0.8)',
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFE259',
    fontFamily: 'serif',
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
  emptyAddBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 4,
  },
  emptyAddBtnText: {
    color: '#050507',
    fontWeight: '900',
    fontFamily: 'monospace',
    fontSize: 12,
  },

  card: {
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.40)',
    backgroundColor: 'rgba(13, 17, 28, 0.96)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardHeaderTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxDone: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  checkboxPending: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  checkboxCheck: {
    fontSize: 15,
    color: '#050507',
    fontWeight: '900',
    textAlign: 'center',
  },

  // HIGH CONTRAST EXERCISE TITLE & BADGES
  exerciseName: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'serif',
    color: '#FFFFFF', // High-contrast crisp white!
    letterSpacing: 0.3,
    lineHeight: 22,
  },
  exerciseNameDone: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
    color: '#94A3B8',
  },
  exerciseBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  setsBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.40)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  setsBadgeText: {
    fontSize: 11.5,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#FFE259',
  },
  muscleBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  muscleBadgeText: {
    fontSize: 10.5,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#38BDF8',
  },

  // EXERCISE CONTROLS (EDIT, REORDER, DELETE)
  exerciseControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 6,
  },
  iconCtrlBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCtrlDelete: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  iconCtrlText: {
    fontSize: 12,
  },

  // RPE SELECTOR
  rpeContainer: {
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.15)',
  },
  rpeSectionLabel: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  rpeButton: {
    width: 32,
    height: 32,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpeButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  rpeButtonTextActive: {
    color: '#050507',
    fontWeight: 'bold',
  },
  rpeButtonTextInactive: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  progressionBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  progressionTipText: {
    fontSize: 11,
    color: '#FDE68A',
    fontStyle: 'italic',
    lineHeight: 15,
  },

  // FINISH BUTTON
  finishBtnTouch: {
    marginTop: Spacing.four,
    marginBottom: Spacing.three,
  },
  finishBtnGradient: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  finishBtnText: {
    color: '#050507',
    fontWeight: '900',
    fontSize: 13.5,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 7, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0A0D16',
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.two,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'serif',
    letterSpacing: 1,
  },
  modalSub: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginBottom: 4,
    lineHeight: 16,
  },

  // FORM INPUTS & CHIPS
  formGroup: {
    gap: 4,
    marginTop: 4,
  },
  formLabel: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#FFFFFF',
    fontSize: 13,
  },
  quickChipsSection: {
    gap: 4,
  },
  quickChipsLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  sugChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  sugChipText: {
    color: '#CBD5E1',
    fontSize: 10.5,
  },
  muscleChip: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.20)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  muscleChipActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    borderColor: '#D4AF37',
  },
  muscleChipText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  muscleChipTextActive: {
    color: '#FFE259',
    fontWeight: 'bold',
  },
  saveExerciseModalBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  saveExerciseModalBtnText: {
    color: '#050507',
    fontWeight: '900',
    fontFamily: 'monospace',
    fontSize: 13,
    letterSpacing: 0.5,
  },

  // PRESETS LIST
  presetCard: {
    backgroundColor: 'rgba(13, 17, 28, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.30)',
    borderRadius: 12,
    padding: Spacing.three,
  },
  presetTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFE259',
    fontFamily: 'serif',
  },
  presetSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  presetCount: {
    fontSize: 10,
    color: '#38BDF8',
    fontFamily: 'monospace',
    marginTop: 2,
  },

  // AI GENERATOR MODAL CONTROLS
  paramSection: {
    gap: 4,
  },
  paramLabel: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  paramChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.20)',
  },
  paramChipActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    borderColor: '#D4AF37',
  },
  paramChipText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  paramChipTextActive: {
    color: '#FDE68A',
    fontWeight: 'bold',
  },
  generateActionBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  generateActionBtnText: {
    color: '#050507',
    fontWeight: '900',
    fontFamily: 'monospace',
    fontSize: 13,
    letterSpacing: 1,
  },
  generatedPreviewBox: {
    backgroundColor: 'rgba(13, 17, 28, 0.94)',
    borderRadius: 12,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    gap: 6,
    marginTop: 6,
  },
  genTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFE259',
    fontFamily: 'serif',
  },
  genList: {
    gap: 4,
  },
  genExerciseItem: {
    fontSize: 11.5,
    color: '#F8FAFC',
    fontFamily: 'monospace',
  },
  loadRoutineBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  loadRoutineBtnText: {
    color: '#050507',
    fontWeight: '900',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  closeModalBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
});
