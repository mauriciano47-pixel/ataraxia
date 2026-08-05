import { View, StyleSheet, ScrollView, useColorScheme, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';
import { OledBackground } from '@/components/OledBackground';
import { useDailyLog } from '@/hooks/useDailyLog';

const RUTINA_MOCK = [
  { id: '1', n: "Sentadilla", s: "4x8", done: false, rpe: null as number | null },
  { id: '2', n: "Peso muerto", s: "3x6", done: false, rpe: null as number | null },
  { id: '3', n: "Zancadas", s: "3x12", done: false, rpe: null as number | null },
  { id: '4', n: "Prensa", s: "3x15", done: false, rpe: null as number | null },
];

const CALISTENIA_MOCK = [
  { id: 'c1', n: "Flexiones (Push-ups)", s: "4 al fallo", done: false, rpe: null as number | null },
  { id: 'c2', n: "Sentadillas libres", s: "4x20", done: false, rpe: null as number | null },
  { id: 'c3', n: "Plancha Abdominal", s: "3x1min", done: false, rpe: null as number | null },
];

export default function TrainerScreen() {
  const { log, toggleTraining, saveReadinessScore, updateEffectiveSets } = useDailyLog();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  const activeRoutine = log.customRoutine && log.customRoutine.length > 0 ? log.customRoutine : RUTINA_MOCK;
  const [ejercicios, setEjercicios] = useState(activeRoutine);
  const [isAmorFati, setIsAmorFati] = useState(false);

  // Readiness State
  const [sleepScore, setSleepScore] = useState(log.readinessScore?.sleep || 8);
  const [stressScore, setStressScore] = useState(log.readinessScore?.stress || 3);
  const [sorenessScore, setSorenessScore] = useState(log.readinessScore?.soreness || 2);
  const [showReadinessModal, setShowReadinessModal] = useState(!log.readinessScore);

  const toggleDone = (id: string) => {
    setEjercicios(prev => {
      const updated = prev.map(e => {
        if (e.id === id) {
          return { ...e, done: !e.done, rpe: !e.done ? (e.rpe || 7) : null };
        }
        return e;
      });
      calculateEffectiveSets(updated);
      return updated;
    });
  };

  const setRPE = (id: string, value: number) => {
    setEjercicios(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, rpe: value, done: true } : e);
      calculateEffectiveSets(updated);
      return updated;
    });
  };

  const calculateEffectiveSets = (list: typeof ejercicios) => {
    // Cuenta el total estimado de sets efectivos (RPE >= 7)
    let totalEffective = 0;
    list.filter(e => e.done && (e.rpe || 0) >= 7).forEach(e => {
      // Extrae el número de series del string "4x8" -> 4
      const setsMatch = e.s.match(/^(\d+)/);
      const numSets = setsMatch ? parseInt(setsMatch[1], 10) : 3;
      totalEffective += numSets;
    });
    updateEffectiveSets(totalEffective);
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
    setIsAmorFati(!isAmorFati);
    setEjercicios(!isAmorFati ? CALISTENIA_MOCK : activeRoutine);
    Alert.alert("Amor Fati", !isAmorFati ? "No controlas tu entorno, pero controlas tu reacción. Rutina adaptada a peso corporal." : "Volviendo a tu rutina de gimnasio.");
  };

  const durationMin = log.prokoptonProfile?.sessionDurationMinutes || 45;
  const equipName = log.prokoptonProfile?.equipment === 'gym' ? 'Gimnasio' : log.prokoptonProfile?.equipment === 'home_dumbbell' ? 'Mancuernas en Casa' : 'Calistenia';

  const completedCount = ejercicios.filter(e => e.done).length;
  const effectiveSetsToday = log.effectiveSets || 0;

  return (
    <OledBackground glowColor="rgba(0, 82, 255, 0.08)">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Header de la Sesión */}
        <View style={styles.header}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <View>
              <ThemedText style={styles.label}>HOY — {equipName.toUpperCase()}</ThemedText>
              <ThemedText style={styles.title}>{isAmorFati ? "Calistenia Espartana" : "Rutina Personalizada IA"}</ThemedText>
              <ThemedText style={{fontSize: 12, color: colors.accent, marginTop: 2, fontWeight: 'bold'}}>
                ⏱️ {durationMin} min | {completedCount}/{ejercicios.length} ejercicios
              </ThemedText>
            </View>
            <TouchableOpacity 
              style={[styles.amorFatiBtn, { borderColor: colors.accent, backgroundColor: isAmorFati ? colors.accent : 'transparent' }]}
              onPress={toggleAmorFati}
            >
              <ThemedText style={[styles.amorFatiText, { color: isAmorFati ? '#FFF' : colors.accent }]}>Amor Fati</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card de Disposición Fisiológica (Readiness Score) */}
        <View style={[styles.readinessCard, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
            <ThemedText style={styles.cardSectionTitle}>⚡ Disposición Fisiológica (Readiness)</ThemedText>
            <TouchableOpacity onPress={() => setShowReadinessModal(!showReadinessModal)}>
              <ThemedText style={{fontSize: 12, color: colors.accent, fontWeight: 'bold'}}>
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
                <ThemedText style={{fontSize: 12, color: colors.textSecondary}}>
                  Sueño: <ThemedText style={{fontWeight: 'bold'}}>{log.readinessScore.sleep}/10</ThemedText> | Estrés: <ThemedText style={{fontWeight: 'bold'}}>{log.readinessScore.stress}/10</ThemedText>
                </ThemedText>
                <ThemedText style={{fontSize: 11, color: colors.accent, marginTop: 2, fontStyle: 'italic'}}>
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
                    <TouchableOpacity key={`sl_${v}`} style={[styles.miniBtn, sleepScore === v && {backgroundColor: colors.accent}]} onPress={() => setSleepScore(v)}>
                      <ThemedText style={sleepScore === v ? {color: '#FFF'} : {}}>{v}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.sliderRow}>
                <ThemedText style={styles.sliderLabel}>Fatiga / Dolor Muscular (1-10): {sorenessScore}</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 4}}>
                  {[1,3,5,7,8,9,10].map(v => (
                    <TouchableOpacity key={`sr_${v}`} style={[styles.miniBtn, sorenessScore === v && {backgroundColor: colors.accent}]} onPress={() => setSorenessScore(v)}>
                      <ThemedText style={sorenessScore === v ? {color: '#FFF'} : {}}>{v}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TouchableOpacity style={[styles.saveReadinessBtn, {backgroundColor: colors.accent}]} onPress={handleSaveReadiness}>
                <ThemedText style={{color: '#FFF', fontWeight: 'bold', fontSize: 12}}>Guardar Evaluación de Disposición</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Indicator de Volume Efectivo Acumulado */}
        <View style={[styles.volumeBanner, { backgroundColor: 'rgba(0, 82, 255, 0.08)', borderColor: 'rgba(0, 82, 255, 0.25)' }]}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <View>
              <ThemedText style={{fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1}}>Series Efectivas Hoy (RPE ≥ 7)</ThemedText>
              <ThemedText style={{fontSize: 20, fontWeight: 'bold', color: colors.accent}}>{effectiveSetsToday} Sets</ThemedText>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <ThemedText style={{fontSize: 10, color: colors.textSecondary}}>Meta Semanal Científica</ThemedText>
              <ThemedText style={{fontSize: 12, fontWeight: 'bold', color: colors.text}}>10 - 20 Sets / Músculo</ThemedText>
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
              <View key={e.id} style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
                <TouchableOpacity 
                  style={styles.cardHeader}
                  onPress={() => toggleDone(e.id)}
                  activeOpacity={0.7}
                >
                  <View style={{flex: 1}}>
                    <ThemedText style={styles.exerciseName}>{e.n}</ThemedText>
                    <ThemedText style={[styles.exerciseSets, { color: colors.textSecondary }]}>{e.s}</ThemedText>
                  </View>
                  
                  <View style={[
                    styles.checkbox,
                    e.done ? { 
                      backgroundColor: colors.accent, 
                      borderColor: colors.accent,
                    } : { 
                      backgroundColor: 'transparent', 
                      borderColor: 'rgba(0, 82, 255, 0.20)' 
                    }
                  ]} />
                </TouchableOpacity>
                
                <View style={styles.rpeContainer}>
                  <ThemedText style={{ fontSize: 10, color: colors.textSecondary, marginBottom: 6 }}>RPE (Esfuerzo Percibido 1-10):</ThemedText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
                    {[...Array(10)].map((_, i) => {
                      const rpeValue = i + 1;
                      const isSelected = e.rpe === rpeValue;
                      return (
                        <TouchableOpacity 
                          key={rpeValue} 
                          style={[
                            styles.rpeButton, 
                            { borderColor: 'rgba(0, 82, 255, 0.15)' },
                            isSelected && { backgroundColor: colors.accent, borderColor: colors.accent }
                          ]}
                          onPress={() => setRPE(e.id, rpeValue)}
                        >
                          <ThemedText style={isSelected ? { color: '#FFF' } : {}}>{rpeValue}</ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {progressionTip !== "" && (
                  <View style={styles.progressionBox}>
                    <ThemedText style={{fontSize: 11, color: colors.accent, fontStyle: 'italic'}}>
                      {progressionTip}
                    </ThemedText>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <TouchableOpacity 
          style={[styles.finishBtn, { backgroundColor: colors.accent }]}
          onPress={checkDeload}
        >
          <ThemedText style={{ color: '#FFF', fontWeight: 'bold' }}>Finalizar Entreno</ThemedText>
        </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </OledBackground>
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
    marginBottom: Spacing.three,
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
    color: '#0F172A',
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
  finishBtn: {
    marginTop: Spacing.four,
    padding: Spacing.four,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0052FF',
    alignItems: 'center',
  }
});
