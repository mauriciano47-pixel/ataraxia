import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, useColorScheme, View, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';
import { useDailyLog, useHistoryLog } from '@/hooks/useDailyLog';
import { StepCounterCard } from '@/components/StepCounterCard';
import { CalorieIndexCard } from '@/components/CalorieIndexCard';
import { SmartDeviceCard } from '@/components/SmartDeviceCard';

const backgroundImages = [
  { 
    src: require('../../assets/images/bg_stoic_statue.png'), 
    title: 'MARCO AURELIO HD', 
    quote: '"Controla tu percepción. Acepta tu destino con fortaleza."' 
  },
  { 
    src: require('../../assets/images/bg_workout_dark.png'), 
    title: 'DISCIPLINA EN EL TEMPLO', 
    quote: '"Ningún hombre tiene derecho a ser un aficionado en el entrenamiento físico."' 
  },
  { 
    src: require('../../assets/images/bg_stoic_cosmos.png'), 
    title: 'CONSTELACIÓN DEL COSMOS', 
    quote: '"Mira las estrellas y siéntete parte de la danza del universo."' 
  },
];

function Constellation({ points, size = 150 }: { points: boolean[], size?: number }) {
  const coords = [
    [35, 110], [75, 45], [115, 65], [100, 120], [55, 135],
  ].slice(0, points.length);

  return (
    <Svg width={size} height={size}>
      {coords.map((c, i) =>
        i < coords.length - 1 && points[i] && points[i + 1] ? (
          <Line 
            key={`l-${i}`} 
            x1={c[0]} 
            y1={c[1]} 
            x2={coords[i + 1][0]} 
            y2={coords[i + 1][1]} 
            stroke="#D32F2F" 
            strokeWidth="2" 
            opacity="0.8" 
          />
        ) : null
      )}
      {coords.map((c, i) => (
        <Circle
          key={i}
          cx={c[0]}
          cy={c[1]}
          r={points[i] ? 6 : 3}
          fill={points[i] ? "#D32F2F" : "#555555"}
          stroke={points[i] ? "#FFAAAA" : "transparent"}
          strokeWidth={points[i] ? 1.5 : 0}
        />
      ))}
    </Svg>
  );
}

export default function HoyScreen() {
  const { log, loading, addWater, toggleTraining, addMeal, saveCheckIn, addSteps, setStepGoal, updateUserMetrics, updateSmartDevice } = useDailyLog();
  const { historyMap } = useHistoryLog();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const [energy, setEnergy] = useState<number | null>(null);
  const [sleep, setSleep] = useState<number | null>(null);

  // Background carousel state and animation
  const [bgIndex, setBgIndex] = useState(0);
  const [fadeAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        setBgIndex((prev) => (prev + 1) % backgroundImages.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [fadeAnim]);

  const habitos = [
    log.trainingCompleted,
    log.waterLitres >= 2,
    log.mealsLogged >= 3,
    log.checkInDone || false,
    (log.trainingCompleted && log.waterLitres >= 2 && log.mealsLogged >= 3)
  ];

  const habitsDone = habitos.filter(Boolean).length;

  // Calcular racha
  const getStreak = () => {
    let streak = 0;
    for (let i = historyMap.length - 1; i >= 0; i--) {
      if (historyMap[i]) streak++;
      else break;
    }
    const completedToday = log.trainingCompleted && log.waterLitres >= 2 && log.mealsLogged >= 3;
    if (completedToday) streak += 1;
    return streak > 0 ? streak : 3;
  };

  const getFitnessFocus = () => {
    if (!log.trainingCompleted) {
      return {
        title: "ENFOQUE: RENDIMIENTO Y FUERZA",
        description: "El entrenamiento constante estimula el crecimiento muscular, refuerza tu disciplina y eleva tu metabolismo diario. ¡Convierte la intención en acción!",
        tip: "⚡ Tu entrenamiento de hoy está pendiente. ¡Regístralo o inicia tu sesión!",
        icon: "fitness"
      };
    }
    if (log.waterLitres < 2) {
      return {
        title: "ENFOQUE: HIDRATACIÓN Y RECUPERACIÓN",
        description: "Una hidratación óptima acelera el transporte de nutrientes hacia los músculos y mejora la concentración mental durante todo el día.",
        tip: "💧 Falta hidratación. Bebe suficiente agua para potenciar tu recuperación.",
        icon: "water"
      };
    }
    if (log.mealsLogged < 3) {
      return {
        title: "ENFOQUE: NUTRICIÓN Y ENERGÍA",
        description: "Nutrir tu cuerpo con la cantidad adecuada de proteínas y macronutrientes asegura la reconstrucción muscular y el nivel de energía constante.",
        tip: "🥩 Registra tus comidas para verificar que alcanzas tus metas calóricas.",
        icon: "restaurant"
      };
    }
    return {
      title: "OBJETIVOS DEL DÍA COMPLETADOS",
      description: "¡Felicidades! Has cumplido con todos los pilares clave del rendimiento. Tu constancia de hoy construye tu condición física del mañana.",
      tip: "🏆 Todos los hábitos completados. ¡Mantén este ritmo de alto nivel!",
      icon: "trophy"
    };
  };

  const focus = getFitnessFocus();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Background dynamic carousel */}
      <View style={StyleSheet.absoluteFill}>
        <Animated.Image
          source={backgroundImages[bgIndex].src}
          style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}
          resizeMode="cover"
        />
        {/* Gritty overlay to ensure contrast */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.65)' }]} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header con Racha */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <ThemedText style={styles.label}>ATARAXIA</ThemedText>
            <ThemedText style={styles.title}>Visto desde arriba, todo pesa menos</ThemedText>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={18} color="#D32F2F" />
              <ThemedText style={styles.streakText}>{getStreak()} DÍAS</ThemedText>
            </View>
            <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileBtn}>
              <Ionicons name="person-circle-outline" size={32} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Constellation Widget */}
        <View style={styles.constellationCard}>
          <Constellation points={habitos} />
          <View style={styles.constellationInfo}>
            <ThemedText style={styles.constellationTitle}>CONSTELACIÓN DIARIA</ThemedText>
            <ThemedText style={styles.constellationSubtitle}>
              {habitsDone} de 5 pilares estoicos encendidos hoy
            </ThemedText>
            <ThemedText style={styles.constellationTip}>
              Completa hábitos abajo para encender las estrellas y conectar la constelación.
            </ThemedText>
          </View>
        </View>

        {/* Enfoque / Lección Stoic-Fitness (Didáctica) */}
        <View style={styles.didacticCard}>
          <View style={styles.didacticHeader}>
            <Ionicons name={focus.icon as any} size={20} color="#D32F2F" style={{ marginRight: 8 }} />
            <ThemedText style={styles.didacticTitle}>{focus.title}</ThemedText>
          </View>
          <ThemedText style={styles.didacticDescription}>
            {focus.description}
          </ThemedText>
          <View style={styles.didacticFooter}>
            <ThemedText style={styles.didacticTipText}>{focus.tip}</ThemedText>
          </View>
        </View>

        {/* Check-In Diario */}
        {!log.checkInDone ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="heart-half-outline" size={18} color="#D32F2F" style={{ marginRight: 6 }} />
              <ThemedText style={styles.cardTitle}>Señal de Recuperación Estoica</ThemedText>
            </View>
            <ThemedText style={styles.cardSubtitle}>Evalúa tu estado mental y físico para calibrar tu día.</ThemedText>

            <ThemedText style={styles.checkInLabel}>Energía (1-5)</ThemedText>
            <View style={styles.checkInRow}>
              {[1, 2, 3, 4, 5].map(v => (
                <TouchableOpacity
                  key={`e-${v}`}
                  style={[styles.checkInBtn, energy === v && styles.checkInBtnActive]}
                  onPress={() => setEnergy(v)}
                >
                  <ThemedText style={[styles.checkInBtnText, energy === v && styles.checkInBtnTextActive]}>{v}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText style={[styles.checkInLabel, { marginTop: 12 }]}>Calidad de Sueño (1-5)</ThemedText>
            <View style={styles.checkInRow}>
              {[1, 2, 3, 4, 5].map(v => (
                <TouchableOpacity
                  key={`s-${v}`}
                  style={[styles.checkInBtn, sleep === v && styles.checkInBtnActive]}
                  onPress={() => setSleep(v)}
                >
                  <ThemedText style={[styles.checkInBtnText, sleep === v && styles.checkInBtnTextActive]}>{v}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.actionBtn, (!energy || !sleep) && { opacity: 0.5 }]}
              onPress={() => {
                if (energy && sleep) {
                  saveCheckIn(energy, sleep);
                }
              }}
              disabled={!energy || !sleep}
            >
              <ThemedText style={styles.actionBtnText}>Guardar Check-in</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="bookmark-outline" size={18} color="#D32F2F" style={{ marginRight: 6 }} />
              <ThemedText style={styles.cardTitle}>Máxima Stoica</ThemedText>
            </View>
            <ThemedText style={styles.quoteText}>
              {'"Contempla a menudo el conjunto del tiempo y de la sustancia, y verás qué pequeño es cada cosa."'}
            </ThemedText>
            <ThemedText style={styles.quoteAuthor}>— Marco Aurelio</ThemedText>
          </View>
        )}

        {/* NUEVO MÓDULO: Contador de Pasos Diarios */}
        <StepCounterCard
          steps={log.steps || 0}
          stepGoal={log.stepGoal || 10000}
          onAddSteps={addSteps}
          onSetStepGoal={setStepGoal}
        />

        {/* NUEVO MÓDULO: Índice Calórico & TDEE */}
        <CalorieIndexCard
          consumedCalories={log.totalCalories || 0}
          targetCalories={log.targetCalories || 2200}
          userMetrics={log.userMetrics}
          consumedMacros={log.macros}
          onUpdateMetrics={updateUserMetrics}
        />

        {/* NUEVO MÓDULO: Telemetría & Enlazamiento con Smartwatch */}
        <SmartDeviceCard
          deviceState={log.smartDevice}
          onUpdateDevice={updateSmartDevice}
          onSyncSteps={addSteps}
        />

        {/* Panel de Hábitos Interactivos */}
        <View style={styles.habitsContainer}>
          {/* ENTRENAMIENTO */}
          <View style={styles.habitCard}>
            <View style={styles.habitHeader}>
              <ThemedText style={styles.habitLabel}>TEMPLO (ENTRENO)</ThemedText>
              <Ionicons 
                name={log.trainingCompleted ? "checkmark-circle" : "ellipse-outline"} 
                size={22} 
                color={log.trainingCompleted ? "#D32F2F" : "#555"} 
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.habitMainBtn, log.trainingCompleted && styles.habitMainBtnActive]} 
              onPress={toggleTraining}
            >
              <ThemedText style={styles.habitMainBtnText}>
                {log.trainingCompleted ? 'Completado ✓' : 'Registrar Entreno'}
              </ThemedText>
            </TouchableOpacity>
            
            <ThemedText style={styles.habitFooterText}>
              {log.trainingCompleted 
                ? 'Has dominado la pereza hoy. Buen trabajo.' 
                : 'Obliga a tu cuerpo a seguir las órdenes de tu mente.'}
            </ThemedText>
          </View>

          {/* AGUA */}
          <View style={styles.habitCard}>
            <View style={styles.habitHeader}>
              <ThemedText style={styles.habitLabel}>AGUA (MIN. 2L)</ThemedText>
              <Ionicons 
                name={log.waterLitres >= 2 ? "water" : "water-outline"} 
                size={22} 
                color={log.waterLitres >= 2 ? "#D32F2F" : "#555"} 
              />
            </View>
            
            <View style={styles.habitInteractiveRow}>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => addWater(-0.25)}>
                <ThemedText style={styles.adjustBtnText}>-</ThemedText>
              </TouchableOpacity>
              
              <View style={styles.habitValueContainer}>
                <ThemedText style={styles.habitValue}>{log.waterLitres.toFixed(2)} L</ThemedText>
                {/* Progress bar */}
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${Math.min((log.waterLitres / 2) * 100, 100)}%` }]} />
                </View>
              </View>

              <TouchableOpacity style={styles.adjustBtn} onPress={() => addWater(0.25)}>
                <ThemedText style={styles.adjustBtnText}>+</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* COMIDAS */}
          <View style={styles.habitCard}>
            <View style={styles.habitHeader}>
              <ThemedText style={styles.habitLabel}>COMIDAS (META 3)</ThemedText>
              <Ionicons 
                name={log.mealsLogged >= 3 ? "restaurant" : "restaurant-outline"} 
                size={20} 
                color={log.mealsLogged >= 3 ? "#D32F2F" : "#555"} 
              />
            </View>

            <View style={styles.habitInteractiveRow}>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => addMeal()}>
                <ThemedText style={styles.adjustBtnText}>+</ThemedText>
              </TouchableOpacity>
              
              <View style={styles.habitValueContainer}>
                <ThemedText style={styles.habitValue}>{log.mealsLogged} / 3</ThemedText>
                {/* Progress bar */}
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${Math.min((log.mealsLogged / 3) * 100, 100)}%` }]} />
                </View>
              </View>
              
              <TouchableOpacity style={[styles.adjustBtn, {opacity: 0.5}]} disabled={true}>
                <ThemedText style={styles.adjustBtnText}>...</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: Spacing.three,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileBtn: {
    padding: Spacing.one,
  },
  label: {
    fontSize: 9,
    textTransform: 'uppercase',
    color: '#D32F2F',
    letterSpacing: 3,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  title: {
    fontSize: 20,
    fontFamily: 'serif',
    marginTop: 4,
    color: '#FFF',
    textTransform: 'uppercase',
    fontWeight: '900',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(211,47,47,0.15)',
    borderWidth: 1.5,
    borderColor: '#D32F2F',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  streakText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#FFF',
    marginLeft: 4,
  },
  constellationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
    borderWidth: 2,
    borderColor: 'rgba(211, 47, 47, 0.3)',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  constellationInfo: {
    flex: 1,
    gap: 4,
  },
  constellationTitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#D32F2F',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1.5,
  },
  constellationSubtitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
  },
  constellationTip: {
    fontSize: 10,
    color: '#777',
    lineHeight: 14,
  },
  didacticCard: {
    backgroundColor: 'rgba(15, 15, 15, 0.9)',
    borderWidth: 2,
    borderColor: '#D32F2F',
    padding: Spacing.four,
    gap: 8,
  },
  didacticHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  didacticTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#FFF',
    letterSpacing: 1.5,
  },
  didacticDescription: {
    fontSize: 13.5,
    color: '#DDD',
    lineHeight: 20,
    fontFamily: 'serif',
  },
  didacticFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
    marginTop: 4,
  },
  didacticTipText: {
    fontSize: 11,
    color: '#D32F2F',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
    padding: Spacing.four,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#FFF',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#666',
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 14.5,
    fontFamily: 'serif',
    fontStyle: 'italic',
    lineHeight: 22,
    color: '#EEE',
  },
  quoteAuthor: {
    fontSize: 11,
    color: '#D32F2F',
    marginTop: 10,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  checkInLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 6,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  checkInRow: {
    flexDirection: 'row',
    gap: 8,
  },
  checkInBtn: {
    width: 38,
    height: 38,
    borderWidth: 1.5,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  checkInBtnActive: {
    borderColor: '#D32F2F',
    backgroundColor: '#D32F2F',
  },
  checkInBtnText: {
    color: '#888',
    fontWeight: 'bold',
  },
  checkInBtnTextActive: {
    color: '#FFF',
  },
  actionBtn: {
    paddingVertical: 12,
    backgroundColor: '#D32F2F',
    borderWidth: 1.5,
    borderColor: '#D32F2F',
    alignItems: 'center',
    marginTop: 16,
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  habitsContainer: {
    gap: Spacing.three,
  },
  habitCard: {
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: Spacing.four,
    gap: 10,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#FFF',
    letterSpacing: 1.5,
  },
  habitMainBtn: {
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#D32F2F',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  habitMainBtnActive: {
    backgroundColor: 'rgba(211,47,47,0.15)',
  },
  habitMainBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  habitFooterText: {
    fontSize: 10.5,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 14,
  },
  habitInteractiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adjustBtn: {
    width: 44,
    height: 44,
    borderWidth: 1.5,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  adjustBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  habitValueContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  habitValue: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#FFF',
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D32F2F',
  }
});
