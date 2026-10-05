import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GoogleGenAI } from '@google/genai';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useDailyLog } from '@/hooks/useDailyLog';
import { PearlElectricBackground } from '@/components/PearlElectricBackground';
import { SafeStorage } from '@/utils/safeStorage';
import { ExerciseTechniqueModal, ExerciseGuideData } from '@/components/ExerciseTechniqueModal';
import { StoicAuditModal } from '@/components/StoicAuditModal';
import { HeartRateScannerModal } from '@/components/HeartRateScannerModal';
import { CustomExercise } from '@/types/onboarding';
import { RUTINA_MOCK, CALISTENIA_MOCK, PRESET_ROUTINES, SUGGESTED_EXERCISES, SUGGESTED_SETS, MUSCLE_GROUPS } from '@/constants/trainerPresets';
import { ExerciseEditorModal, PresetsModal, GeneratorModal } from '@/components/TrainerModals';
import { buildFallbackAIRoutine } from '@/lib/workoutGenerator';
import { ReadinessCard } from '@/components/ReadinessCard';
import { TrainerExerciseCard } from '@/components/TrainerExerciseCard';
import { styles } from '@/styles/trainer.styles';
import { logger } from '@/utils/logger';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim() || '';
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

export default function TrainerScreen() {
  const { log, toggleTraining, saveReadinessScore, updateEffectiveSets, setCustomRoutine, updateSmartDevice } = useDailyLog();

  const [amorFatiEjercicios, setAmorFatiEjercicios] = useState<CustomExercise[]>(CALISTENIA_MOCK);
  const [isAmorFati, setIsAmorFati] = useState(false);

  // Auditoría Estoica Algorítmica contra el Autoengaño (RPE 9.5-10 vs PPG)
  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [auditExercise, setAuditExercise] = useState<{ id: string; name: string; rpe: number } | null>(null);
  const [scannerModalVisible, setScannerModalVisible] = useState(false);

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
  const [selectedGuideExercise, setSelectedGuideExercise] = useState<ExerciseGuideData | null>(null);
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
    if (value >= 9.5) {
      // Activar la Auditoría Estoica Algorítmica contra el autoengaño
      const currentList = isAmorFati ? amorFatiEjercicios : activeRoutine;
      const ex = currentList.find(e => e.id === id);
      setAuditExercise({
        id,
        name: ex ? ex.n : 'Ejercicio',
        rpe: value,
      });
      setAuditModalVisible(true);
      return;
    }
    applyRpeValue(id, value);
  };

  const applyRpeValue = (id: string, value: number) => {
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

  const finishWorkout = checkDeload;

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

      const athleteName = log.userName && log.userName !== 'Ciudadano Prokopton' ? log.userName : 'Guerrero';
      const path = log.legendaryPath || 'spartan';
      const experienceLevel = log.prokoptonProfile?.experienceLevel || 'intermediate';
      const protectedZones = log.prokoptonProfile?.protectedZones && log.prokoptonProfile.protectedZones.length > 0 && !log.prokoptonProfile.protectedZones.includes('none' as any)
        ? log.prokoptonProfile.protectedZones.join(', ')
        : 'ninguna';
      const readiness = log.readinessScore ? `${log.readinessScore.total}% (Dolor muscular: ${log.readinessScore.soreness}/10, Estrés: ${log.readinessScore.stress}/10)` : '100%';

      const prompt = `Crea una rutina de entrenamiento personalizada, de alta eficiencia biomecánica y filosofía estoica para el atleta ${athleteName}.
Senda Legendaria: ${path.toUpperCase()}
Nivel del practicante: ${experienceLevel}
Tiempo disponible: ${selectedTime} minutos
Equipo disponible: ${selectedEquip}
Enfoque muscular / objetivo: ${selectedFocus}
Zonas anatómicas protegidas / articulaciones a cuidar: ${protectedZones} (NUNCA prescribir ejercicios que comprometan estas áreas)
Estado de preparación del SNC (Readiness): ${readiness}

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
      logger.warn("Gemini AI Workout Generator fallback triggered:", error);
      const fallbackData = buildFallbackAIRoutine(selectedTime, selectedFocus, selectedEquip);
      setGeneratedRoutine(fallbackData);
    } finally {
      setIsGenerating(false);
    }
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
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          overScrollMode="never"
        >
        
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
        {/* Card de Disposición Fisiológica (Readiness Score) */}
        <ReadinessCard
          log={log}
          showReadinessModal={showReadinessModal}
          setShowReadinessModal={setShowReadinessModal}
          sleepScore={sleepScore}
          setSleepScore={setSleepScore}
          stressScore={stressScore}
          setStressScore={setStressScore}
          sorenessScore={sorenessScore}
          setSorenessScore={setSorenessScore}
          handleSaveReadiness={handleSaveReadiness}
          triggerHaptic={triggerHaptic}
          styles={styles}
        />

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
            ejercicios.map((e, index) => (
              <TrainerExerciseCard
                key={e.id}
                exercise={e}
                index={index}
                totalExercises={ejercicios.length}
                onToggleDone={toggleDone}
                onSelectGuide={setSelectedGuideExercise}
                onEdit={openEditExerciseModal}
                onMove={handleMoveExercise}
                onDelete={handleDeleteExercise}
                onSetRpe={setRPE}
                triggerHaptic={triggerHaptic}
                styles={styles}
              />
            ))
          )}
        </View>

        {/* BOTÓN FINALIZAR SESIÓN */}
        <TouchableOpacity
          style={styles.finishBtnContainer}
          onPress={finishWorkout}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#D4AF37', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.finishBtnGradient}
          >
            <ThemedText style={styles.finishBtnText}>⚡ FINALIZAR SESIÓN DE FUERZA</ThemedText>
          </LinearGradient>
        </TouchableOpacity>

        {/* MODAL PARA AÑADIR / EDITAR EJERCICIO */}
        {/* MODAL PARA AÑADIR / EDITAR EJERCICIO */}
        <ExerciseEditorModal
          visible={showExerciseModal}
          editingExerciseId={editingExerciseId}
          exerciseNameInput={exerciseNameInput}
          setExerciseNameInput={setExerciseNameInput}
          exerciseSetsInput={exerciseSetsInput}
          setExerciseSetsInput={setExerciseSetsInput}
          exerciseMuscleInput={exerciseMuscleInput}
          setExerciseMuscleInput={setExerciseMuscleInput}
          handleSaveExercise={handleSaveExercise}
          onClose={() => setShowExerciseModal(false)}
          triggerHaptic={triggerHaptic}
          styles={styles}
        />

        {/* MODAL DE PLANTILLAS RÁPIDAS (PRESETS) */}
        <PresetsModal
          visible={showPresetsModal}
          onApplyPreset={handleApplyPreset}
          onClose={() => setShowPresetsModal(false)}
          styles={styles}
        />

        {/* MODAL DEL GENERADOR DE RUTINAS IA */}
        <GeneratorModal
          visible={showGeneratorModal}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          selectedEquip={selectedEquip}
          setSelectedEquip={setSelectedEquip}
          selectedFocus={selectedFocus}
          setSelectedFocus={setSelectedFocus}
          handleGenerateAI={handleGenerateAI}
          isGenerating={isGenerating}
          generatedRoutine={generatedRoutine}
          handleApplyAIRoutine={handleApplyAIRoutine}
          onClose={() => setShowGeneratorModal(false)}
          triggerHaptic={triggerHaptic}
          styles={styles}
        />

        {/* MODAL DE GUÍA TÉCNICA Y BIOMECÁNICA */}
        <ExerciseTechniqueModal
          visible={Boolean(selectedGuideExercise)}
          exercise={selectedGuideExercise}
          onClose={() => setSelectedGuideExercise(null)}
        />

        {/* MODAL DE AUDITORÍA ESTOICA CONTRA EL AUTOENGAÑO */}
        <StoicAuditModal
          visible={auditModalVisible}
          onClose={() => {
            setAuditModalVisible(false);
            setAuditExercise(null);
          }}
          exerciseName={auditExercise?.name || 'Ejercicio'}
          declaredRpe={auditExercise?.rpe || 10}
          recordedBpm={log.smartDevice?.heartRateBpm || 0}
          onConfirmRpe={(calibratedRpe) => {
            if (auditExercise) {
              applyRpeValue(auditExercise.id, calibratedRpe);
            }
          }}
          onOpenHeartRateScanner={() => {
            setScannerModalVisible(true);
          }}
        />

        {/* MODAL DE ESCÁNER DE RITMO CARDÍACO POR CÁMARA (PPG) */}
        <HeartRateScannerModal
          visible={scannerModalVisible}
          onClose={() => setScannerModalVisible(false)}
          onSaveHeartRate={(bpm) => {
            updateSmartDevice({ heartRateBpm: bpm });
            setScannerModalVisible(false);
            if (auditExercise) {
              setAuditModalVisible(true);
            }
          }}
        />

        </ScrollView>
      </SafeAreaView>
    </PearlElectricBackground>
  );
}
