import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { GoogleGenAI } from '@google/genai';

import { ThemedText } from '@/components/themed-text';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { PearlElectricBackground } from '@/components/PearlElectricBackground';
import { useDailyLog } from '@/hooks/useDailyLog';
import { CustomExercise } from '@/types/onboarding';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim() || '';
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const RUTINA_MOCK: CustomExercise[] = [
  { id: '1', n: "Sentadilla Trasera con Barra", s: "4x8", done: false, rpe: null },
  { id: '2', n: "Peso Muerto Rumano", s: "3x8", done: false, rpe: null },
  { id: '3', n: "Zancadas Búlgaras", s: "3x10", done: false, rpe: null },
  { id: '4', n: "Prensa Inclinada", s: "3x12", done: false, rpe: null },
];

const CALISTENIA_MOCK: CustomExercise[] = [
  { id: 'c1', n: "Flexiones Declinadas (Push-ups)", s: "4 al fallo", done: false, rpe: null },
  { id: 'c2', n: "Sentadillas Libres Explosivas", s: "4x20", done: false, rpe: null },
  { id: 'c3', n: "Plancha Abdominal Estoica", s: "3x1min", done: false, rpe: null },
];

export default function TrainerScreen() {
  const { log, toggleTraining, saveReadinessScore, updateEffectiveSets, setCustomRoutine } = useDailyLog();

  const [amorFatiEjercicios, setAmorFatiEjercicios] = useState<CustomExercise[]>(CALISTENIA_MOCK);
  const [isAmorFati, setIsAmorFati] = useState(false);

  // Derivar siempre la rutina activa directamente de log.customRoutine (100% reactivo sin desincronización)
  const activeRoutine = (log.customRoutine && log.customRoutine.length > 0) ? log.customRoutine : RUTINA_MOCK;
  const ejercicios = isAmorFati ? amorFatiEjercicios : activeRoutine;

  // Readiness State
  const [sleepScore, setSleepScore] = useState(log.readinessScore?.sleep || 8);
  const [stressScore, setStressScore] = useState(log.readinessScore?.stress || 3);
  const [sorenessScore, setSorenessScore] = useState(log.readinessScore?.soreness || 2);
  const [showReadinessModal, setShowReadinessModal] = useState(!log.readinessScore);

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

  const handleSaveReadiness = () => {
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
        // Fallback inteligente enriquecido
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
    { "id": "1", "n": "Nombre del Ejercicio", "s": "4x8 (RIR 2)" },
    { "id": "2", "n": "Nombre del Ejercicio 2", "s": "3x10 (RIR 2)" },
    { "id": "3", "n": "Nombre del Ejercicio 3", "s": "3x12 (Fallo)" }
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
        { id: 'fa1', n: 'Flexiones Declinadas o Pica', s: '4 al fallo', done: false, rpe: null },
        { id: 'fa2', n: 'Sentadillas Explosivas con Pausa', s: '4x20', done: false, rpe: null },
        { id: 'fa3', n: 'Zancadas Alternas en Desplazamiento', s: '3x16', done: false, rpe: null },
        { id: 'fa4', n: 'Plancha Isométrica de Oso', s: '3x50s', done: false, rpe: null },
      ];
    } else if (focus.includes('Empuje')) {
      title = `Poder de Empuje & Hombros (${time} min)`;
      exercises = [
        { id: 'fe1', n: 'Press de Banca Plano con Barra', s: '4x8 (RIR 2)', done: false, rpe: null },
        { id: 'fe2', n: 'Press Militar de Hombro con Mancuernas', s: '3x10 (RIR 2)', done: false, rpe: null },
        { id: 'fe3', n: 'Fondos en Paralelas / Inclinado', s: '3x12 (RIR 1)', done: false, rpe: null },
        { id: 'fe4', n: 'Elevaciones Laterales para Deltoides', s: '3x15', done: false, rpe: null },
      ];
    } else if (focus.includes('Tracción')) {
      title = `Densidad de Espalda & Bíceps (${time} min)`;
      exercises = [
        { id: 'ft1', n: 'Peso Muerto Rumano', s: '4x8 (RIR 2)', done: false, rpe: null },
        { id: 'ft2', n: 'Remo Gironda o con Barra', s: '4x10 (RIR 2)', done: false, rpe: null },
        { id: 'ft3', n: 'Jalón al Pecho Agarre Neutro', s: '3x10', done: false, rpe: null },
        { id: 'ft4', n: 'Curl Martillo de Bíceps', s: '3x12', done: false, rpe: null },
      ];
    } else {
      title = `Fuerza Full Body Estoica (${time} min)`;
      exercises = [
        { id: 'fb1', n: 'Sentadilla Trasera Profunda', s: '4x8 (RIR 2)', done: false, rpe: null },
        { id: 'fb2', n: 'Press Inclinado con Mancuernas', s: '3x10 (RIR 2)', done: false, rpe: null },
        { id: 'fb3', n: 'Remo Unilateral con Mancuerna', s: '3x10 por lado', done: false, rpe: null },
        { id: 'fb4', n: 'Zancadas Búlgaras', s: '3x10 por pierna', done: false, rpe: null },
        { id: 'fb5', n: 'Plancha Abdominal con Peso', s: '3x45s', done: false, rpe: null },
      ];
    }

    return { title, exercises };
  };

  const handleApplyAIRoutine = () => {
    if (!generatedRoutine) return;
    setCustomRoutine(generatedRoutine.exercises);
    if (isAmorFati) setIsAmorFati(false);
    setShowGeneratorModal(false);
    Alert.alert("⚡ Rutina IA Cargada", `"${generatedRoutine.title}" ha sido cargada como tu sesión activa de hoy.`);
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
    if (!log.prokoptonProfile) return '⚡ Rutina Imperial IA';
    switch (log.prokoptonProfile.focus) {
      case 'strength': return '⚡ Fuerza Espartana & Hipertrofia';
      case 'fat_loss': return '🔥 Recomposición & Definición';
      case 'longevity': return '🏛️ Resistencia & Longevidad';
      case 'mental': return '🧠 Disciplina & Temple Mental';
      default: return '⚡ Rutina Imperial IA';
    }
  };

  const equipName = getEquipmentLabel();
  const focusTitle = getFocusLabel();
  const completedCount = ejercicios.filter(e => e.done).length;
  const effectiveSetsToday = log.effectiveSets || 0;

  return (
    <PearlElectricBackground glowColor="rgba(212, 175, 55, 0.28)">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Header de la Sesión */}
        <View style={styles.header}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <View style={{flex: 1, paddingRight: 8}}>
              <ThemedText style={styles.label}>HOY — {equipName.toUpperCase()}</ThemedText>
              <ThemedText style={styles.title}>{focusTitle}</ThemedText>
              <ThemedText style={{fontSize: 12, color: '#D4AF37', marginTop: 2, fontWeight: 'bold'}}>
                ⏱️ {durationMin} min | {completedCount}/{ejercicios.length} ejercicios completados
              </ThemedText>
            </View>
            <TouchableOpacity 
              style={[styles.amorFatiBtn, { borderColor: '#D4AF37', backgroundColor: isAmorFati ? '#D4AF37' : 'rgba(212, 175, 55, 0.12)' }]}
              onPress={toggleAmorFati}
            >
              <ThemedText style={[styles.amorFatiText, { color: isAmorFati ? '#050507' : '#FDE68A' }]}>Amor Fati</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* BANNER DE PLAN PERSONALIZADO (PROKOPTON) */}
        {log.prokoptonProfile && (
          <View style={styles.prokoptonBanner}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <ThemedText style={{fontSize: 20}}>🏛️</ThemedText>
              <View style={{flex: 1}}>
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
            colors={['#D4AF37', '#F59E0B', '#B45309']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.generatorMainGradient}
          >
            <ThemedText style={styles.generatorBtnTitle}>⚡ GENERADOR DE RUTINAS IA A MEDIDA</ThemedText>
            <ThemedText style={styles.generatorBtnSub}>Diseña tu sesión perfecta según tiempo, equipo y nivel con Gemini</ThemedText>
          </LinearGradient>
        </TouchableOpacity>

        {/* Card de Disposición Fisiológica (Readiness Score) */}
        <View style={[styles.readinessCard, { backgroundColor: 'rgba(13, 17, 28, 0.94)', borderColor: 'rgba(212, 175, 55, 0.35)' }]}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
            <ThemedText style={styles.cardSectionTitle}>⚡ Disposición Fisiológica (Readiness)</ThemedText>
            <TouchableOpacity onPress={() => setShowReadinessModal(!showReadinessModal)}>
              <ThemedText style={{fontSize: 12, color: '#D4AF37', fontWeight: 'bold'}}>
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
              <View style={{flex: 1, marginLeft: 12}}>
                <ThemedText style={{fontSize: 12, color: '#CBD5E1'}}>
                  Sueño: <ThemedText style={{fontWeight: 'bold', color: '#FDE68A'}}>{log.readinessScore.sleep}/10</ThemedText> | Estrés: <ThemedText style={{fontWeight: 'bold', color: '#FDE68A'}}>{log.readinessScore.stress}/10</ThemedText>
                </ThemedText>
                <ThemedText style={{fontSize: 11, color: '#D4AF37', marginTop: 2, fontStyle: 'italic'}}>
                  {log.readinessScore.total >= 7 ? "🟢 Estado Óptimo para Alta Carga" : log.readinessScore.total >= 5 ? "🟡 Estado Moderado (Ajusta RPE a 7-8)" : "🔴 Alta Fatiga: Sugerido Amor Fati / Calistenia"}
                </ThemedText>
              </View>
            </View>
          ) : (
            <View style={styles.readinessSliders}>
              <View style={styles.sliderRow}>
                <ThemedText style={styles.sliderLabel}>Calidad de Sueño (1-10): {sleepScore}</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 4}}>
                  {[1,3,5,7,8,9,10].map(v => (
                    <TouchableOpacity key={`sl_${v}`} style={[styles.miniBtn, sleepScore === v && {backgroundColor: '#D4AF37', borderColor: '#D4AF37'}]} onPress={() => setSleepScore(v)}>
                      <ThemedText style={sleepScore === v ? {color: '#050507', fontWeight: 'bold'} : {color: '#94A3B8'}}>{v}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.sliderRow}>
                <ThemedText style={styles.sliderLabel}>Estrés / Carga Mental (1-10): {stressScore}</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 4}}>
                  {[1,3,5,7,8,9,10].map(v => (
                    <TouchableOpacity key={`st_${v}`} style={[styles.miniBtn, stressScore === v && {backgroundColor: '#D4AF37', borderColor: '#D4AF37'}]} onPress={() => setStressScore(v)}>
                      <ThemedText style={stressScore === v ? {color: '#050507', fontWeight: 'bold'} : {color: '#94A3B8'}}>{v}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.sliderRow}>
                <ThemedText style={styles.sliderLabel}>Fatiga / Dolor Muscular (1-10): {sorenessScore}</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 4}}>
                  {[1,3,5,7,8,9,10].map(v => (
                    <TouchableOpacity key={`sr_${v}`} style={[styles.miniBtn, sorenessScore === v && {backgroundColor: '#D4AF37', borderColor: '#D4AF37'}]} onPress={() => setSorenessScore(v)}>
                      <ThemedText style={sorenessScore === v ? {color: '#050507', fontWeight: 'bold'} : {color: '#94A3B8'}}>{v}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TouchableOpacity style={[styles.saveReadinessBtn, {backgroundColor: '#D4AF37'}]} onPress={handleSaveReadiness}>
                <ThemedText style={{color: '#050507', fontWeight: '900', fontSize: 12}}>Guardar Evaluación de Disposición</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Indicator de Volumen Efectivo Acumulado */}
        <View style={[styles.volumeBanner, { backgroundColor: 'rgba(13, 17, 28, 0.94)', borderColor: 'rgba(212, 175, 55, 0.35)' }]}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <View>
              <ThemedText style={{fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1}}>Series Efectivas Hoy (RPE ≥ 7)</ThemedText>
              <ThemedText style={{fontSize: 22, fontWeight: '900', color: '#FFE259', fontFamily: 'serif'}}>{effectiveSetsToday} Sets</ThemedText>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <ThemedText style={{fontSize: 10, color: '#94A3B8'}}>Meta Semanal Científica</ThemedText>
              <ThemedText style={{fontSize: 12, fontWeight: 'bold', color: '#FDE68A'}}>10 - 20 Sets / Músculo</ThemedText>
            </View>
          </View>
        </View>

        {/* Lista de Ejercicios */}
        <View style={styles.list}>
          {ejercicios.map((e) => {
            const hasRpe = e.rpe !== null && e.rpe !== undefined;
            let progressionTip = "";
            if (hasRpe) {
              if (e.rpe! <= 7) {
                progressionTip = "💡 Progresión sugerida: Incrementar peso +2.5% a +5% en la siguiente sesión.";
              } else if (e.rpe! >= 9.5) {
                progressionTip = "⚠️ Límite de fallo alcanzado. Consolidar técnica con misma carga antes de subir.";
              } else {
                progressionTip = "🎯 Zona óptima de hipertrofia y estimulo (RPE 8-9).";
              }
            }

            return (
              <View key={e.id} style={[styles.card, { backgroundColor: 'rgba(13, 17, 28, 0.94)', borderColor: 'rgba(212, 175, 55, 0.35)' }]}>
                <TouchableOpacity 
                  style={styles.cardHeader}
                  onPress={() => toggleDone(e.id)}
                  activeOpacity={0.7}
                >
                  <View style={{flex: 1}}>
                    <ThemedText style={styles.exerciseName}>{e.n}</ThemedText>
                    <ThemedText style={[styles.exerciseSets, { color: '#D4AF37' }]}>{e.s}</ThemedText>
                  </View>
                  
                  <View style={[
                    styles.checkbox,
                    e.done ? { 
                      backgroundColor: '#D4AF37', 
                      borderColor: '#D4AF37',
                    } : { 
                      backgroundColor: 'transparent', 
                      borderColor: 'rgba(212, 175, 55, 0.35)' 
                    }
                  ]}>
                    {e.done && <ThemedText style={{fontSize: 14, color: '#050507', textAlign: 'center', fontWeight: 'bold'}}>✓</ThemedText>}
                  </View>
                </TouchableOpacity>
                
                <View style={styles.rpeContainer}>
                  <ThemedText style={{ fontSize: 10, color: '#94A3B8', marginBottom: 6 }}>RPE (Esfuerzo Percibido 1-10):</ThemedText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
                    {[...Array(10)].map((_, i) => {
                      const rpeValue = i + 1;
                      const isSelected = e.rpe === rpeValue;
                      return (
                        <TouchableOpacity 
                          key={rpeValue} 
                          style={[
                            styles.rpeButton, 
                            { borderColor: 'rgba(212, 175, 55, 0.30)', backgroundColor: isSelected ? '#D4AF37' : 'rgba(212, 175, 55, 0.08)' }
                          ]}
                          onPress={() => setRPE(e.id, rpeValue)}
                        >
                          <ThemedText style={isSelected ? { color: '#050507', fontWeight: 'bold' } : { color: '#CBD5E1' }}>{rpeValue}</ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {progressionTip !== "" && (
                  <View style={styles.progressionBox}>
                    <ThemedText style={{fontSize: 11, color: '#FDE68A', fontStyle: 'italic'}}>
                      {progressionTip}
                    </ThemedText>
                  </View>
                )}
              </View>
            );
          })}
        </View>

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
            <ThemedText style={{ color: '#050507', fontWeight: '900', fontSize: 14, letterSpacing: 1 }}>⚡ FINALIZAR SESIÓN DE FUERZA</ThemedText>
          </LinearGradient>
        </TouchableOpacity>

        {/* MODAL DEL GENERADOR DE RUTINAS IA */}
        <Modal visible={showGeneratorModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <ThemedText style={styles.modalTitle}>⚡ Oráculo de Entrenamientos IA</ThemedText>
              <ThemedText style={styles.modalSub}>Configura los parámetros para crear tu sesión perfecta:</ThemedText>

              {/* Parámetro 1: Tiempo */}
              <View style={styles.paramSection}>
                <ThemedText style={styles.paramLabel}>⏱️ Tiempo Disponible:</ThemedText>
                <View style={styles.chipRow}>
                  {[15, 30, 45, 60].map((t) => (
                    <TouchableOpacity
                      key={`t_${t}`}
                      style={[styles.paramChip, selectedTime === t && styles.paramChipActive]}
                      onPress={() => setSelectedTime(t)}
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
                      onPress={() => setSelectedEquip(eq)}
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
                      onPress={() => setSelectedFocus(f)}
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
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#0052FF',
    letterSpacing: 3,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  title: {
    fontSize: 24,
    fontFamily: 'serif',
    marginTop: 4,
    textTransform: 'uppercase',
    fontWeight: '900',
    color: '#F8FAFC',
  },
  generatorMainTouch: {
    marginBottom: Spacing.three,
    borderRadius: 16,
    overflow: 'hidden',
  },
  generatorMainGradient: {
    padding: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  generatorBtnTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  generatorBtnSub: {
    fontSize: 10.5,
    color: '#E2E8F0',
    fontFamily: 'sans-serif',
    textAlign: 'center',
    opacity: 0.9,
  },
  readinessCard: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  cardSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    color: '#0052FF',
  },
  readinessSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(0, 82, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0052FF',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#0052FF',
    marginLeft: 2,
  },
  readinessSliders: {
    marginTop: 8,
    gap: 8,
  },
  sliderRow: {
    gap: 4,
  },
  sliderLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  miniBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 82, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveReadinessBtn: {
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 6,
  },
  volumeBanner: {
    padding: Spacing.three,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  list: {
    gap: Spacing.three,
  },
  card: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 82, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontFamily: 'monospace',
    color: '#0F172A',
  },
  exerciseSets: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
  },
  rpeContainer: {
    marginTop: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 82, 255, 0.08)',
  },
  rpeButton: {
    width: 34,
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressionBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 82, 255, 0.05)',
  },
  amorFatiBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  amorFatiText: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 7, 0.90)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0A0D16',
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.two,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
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
  },
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
});
