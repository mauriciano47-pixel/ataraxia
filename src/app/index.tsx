import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useDailyLog, useHistoryLog } from '@/hooks/useDailyLog';
import { StepCounterCard } from '@/components/StepCounterCard';
import { CalorieIndexCard } from '@/components/CalorieIndexCard';
import { SmartDeviceCard } from '@/components/SmartDeviceCard';
import { FlameIcon, PersonIcon, HeartIcon, WaterIcon, RestaurantIcon, CheckmarkIcon, TrophyIcon } from '@/components/ModuleSvgIcons';
import { BarbellTabIcon } from '@/components/TabSvgIcons';
import { OledBackground } from '@/components/OledBackground';
import { PwaInstallButton } from '@/components/PwaInstallButton';

// Radial Ring Gauge Component
function ProgressRing({ progress, size = 110, strokeWidth = 10 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <LinearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0052FF" />
            <Stop offset="50%" stopColor="#00C6FF" />
            <Stop offset="100%" stopColor="#D4AF37" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </Svg>
      <View style={styles.ringCenter}>
        <ThemedText style={styles.ringPercentText}>{Math.round(progress * 100)}%</ThemedText>
        <ThemedText style={styles.ringLabelText}>PILARES</ThemedText>
      </View>
    </View>
  );
}

// Constellation Visual Dots Component
function Constellation({ points, size = 120 }: { points: boolean[]; size?: number }) {
  const coords = [
    [25, 90], [55, 30], [95, 45], [85, 95], [45, 105],
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
            stroke="#D4AF37" 
            strokeWidth="2" 
            opacity="0.9" 
          />
        ) : null
      )}
      {coords.map((c, i) => (
        <Circle
          key={i}
          cx={c[0]}
          cy={c[1]}
          r={points[i] ? 6 : 3.5}
          fill={points[i] ? "#D4AF37" : "#1E293B"}
          stroke={points[i] ? "#0052FF" : "transparent"}
          strokeWidth={points[i] ? 1.5 : 0}
        />
      ))}
    </Svg>
  );
}

export default function HoyScreen() {
  const { log, addWater, toggleTraining, saveCheckIn, addSteps, setStepGoal, updateUserMetrics, updateSmartDevice } = useDailyLog();
  const { historyMap } = useHistoryLog();
  const router = useRouter();

  const [energy, setEnergy] = useState<number | null>(null);
  const [sleep, setSleep] = useState<number | null>(null);

  const scrollY = useState(() => new Animated.Value(0))[0];

  const habitos = [
    log.trainingCompleted,
    log.waterLitres >= 2,
    log.mealsLogged >= 3,
    log.checkInDone || false,
    (log.trainingCompleted && log.waterLitres >= 2 && log.mealsLogged >= 3)
  ];

  const habitsDone = habitos.filter(Boolean).length;
  const progressRatio = habitsDone / 5;

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
        description: "El entrenamiento constante estimula el crecimiento muscular y refuerza tu disciplina.",
        tip: "⚡ Tu entrenamiento de hoy está pendiente.",
        type: "fitness",
        accent: "#0052FF"
      };
    }
    if (log.waterLitres < 2) {
      return {
        title: "ENFOQUE: HIDRATACIÓN Y RECUPERACIÓN",
        description: "Una hidratación óptima acelera el transporte de nutrientes hacia los músculos.",
        tip: "💧 Falta hidratación. Bebe suficiente agua hoy.",
        type: "water",
        accent: "#00C6FF"
      };
    }
    if (log.mealsLogged < 3) {
      return {
        title: "ENFOQUE: NUTRICIÓN Y ENERGÍA",
        description: "Nutrir tu cuerpo con la cantidad adecuada de proteínas asegura la reconstrucción muscular.",
        tip: "🥩 Registra tus comidas para verificar tus metas calóricas.",
        type: "restaurant",
        accent: "#0052FF"
      };
    }
    return {
      title: "OBJETIVOS DEL DÍA COMPLETADOS",
      description: "¡Felicidades! Has cumplido con todos los pilares clave del rendimiento estoico.",
      tip: "🏆 Todos los hábitos completados. ¡Mantén este ritmo!",
      type: "trophy",
      accent: "#0052FF"
    };
  };

  const focus = getFitnessFocus();

  return (
    <OledBackground glowColor="rgba(0, 82, 255, 0.08)">
      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.content}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          {/* Header Superior Estilo Pearl Luxury */}
          <View style={styles.headerContainer}>
            <View style={styles.headerTitleBox}>
              <View style={styles.badgeRow}>
                <View style={styles.statusDot} />
                <ThemedText style={styles.appBadgeText}>ATARAXIA • SYSTEM V1.0</ThemedText>
              </View>
              <ThemedText style={styles.title}>Visto desde arriba, todo pesa menos</ThemedText>
            </View>
            
            <View style={styles.headerRight}>
              <View style={styles.streakBadge}>
                <FlameIcon color="#0052FF" size={16} />
                <ThemedText style={styles.streakText}>{getStreak()} DÍAS</ThemedText>
              </View>
              <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileBtn}>
                <PersonIcon color="#0052FF" size={24} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón PWA si aplica */}
          <PwaInstallButton />

          {/* HERO RING & CONSTELACIÓN CARD */}
          <View style={styles.heroCard}>
            <View style={styles.heroGaugeContainer}>
              <ProgressRing progress={progressRatio} size={110} strokeWidth={10} />
            </View>

            <View style={styles.heroInfo}>
              <View style={styles.heroTitleRow}>
                <ThemedText style={styles.heroLabel}>PILAS ESTOICAS</ThemedText>
                <ThemedText style={styles.heroStatusCount}>{habitsDone}/5</ThemedText>
              </View>
              <ThemedText style={styles.heroMainTitle}>
                {habitsDone === 5 ? '¡Constelación Completa!' : `${5 - habitsDone} pilares pendientes`}
              </ThemedText>
              <ThemedText style={styles.heroSubtitle}>
                Cada esfuerzo diario enciende una estrella en tu universo estoico.
              </ThemedText>
            </View>

            <View style={styles.constellationWrapper}>
              <Constellation points={habitos} size={90} />
            </View>
          </View>

          {/* TARJETA DE ENFOQUE DEL DÍA */}
          <View style={[styles.focusCard, { borderColor: focus.accent }]}>
            <View style={styles.focusHeader}>
              {focus.type === 'fitness' && <BarbellTabIcon color="#0052FF" size={20} />}
              {focus.type === 'water' && <WaterIcon color="#00C6FF" size={20} />}
              {focus.type === 'restaurant' && <RestaurantIcon color="#0052FF" size={20} />}
              {focus.type === 'trophy' && <TrophyIcon color="#0052FF" size={20} />}
              <ThemedText style={[styles.focusTitle, { color: focus.accent, marginLeft: 8 }]}>{focus.title}</ThemedText>
            </View>
            <ThemedText style={styles.focusDescription}>{focus.description}</ThemedText>
            <View style={styles.focusFooter}>
              <ThemedText style={styles.focusTipText}>{focus.tip}</ThemedText>
            </View>
          </View>

          {/* DOCK DE ACCESOS RÁPIDOS */}
          <View style={styles.quickDockRow}>
            <TouchableOpacity style={styles.quickDockBtn} onPress={() => router.push('/trainer')}>
              <BarbellTabIcon color="#0052FF" size={18} />
              <ThemedText style={styles.quickDockText}>Entreno</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickDockBtn} onPress={() => router.push('/nutrition')}>
              <RestaurantIcon color="#0052FF" size={18} />
              <ThemedText style={styles.quickDockText}>Nutrición IA</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickDockBtn} onPress={() => router.push('/journal')}>
              <FlameIcon color="#00C6FF" size={18} />
              <ThemedText style={styles.quickDockText}>Oráculo</ThemedText>
            </TouchableOpacity>
          </View>

          {/* SEÑAL DE RECUPERACIÓN ESTOICA (CHECK-IN) */}
          {!log.checkInDone ? (
            <View style={styles.glassCard}>
              <View style={styles.cardHeaderRow}>
                <HeartIcon color="#0052FF" size={20} />
                <ThemedText style={styles.cardHeaderTitle}>SEÑAL DE RECUPERACIÓN ESTOICA</ThemedText>
              </View>
              <ThemedText style={styles.cardSubtitleText}>Evalúa tu estado mental y físico para calibrar tu día.</ThemedText>

              <ThemedText style={styles.inputSectionLabel}>ENERGÍA PERCIBIDA (1-5)</ThemedText>
              <View style={styles.pillRow}>
                {[1, 2, 3, 4, 5].map(v => (
                  <TouchableOpacity
                    key={`e-${v}`}
                    style={[styles.pillBtn, energy === v && styles.pillBtnActive]}
                    onPress={() => setEnergy(v)}
                  >
                    <ThemedText style={[styles.pillText, energy === v && styles.pillTextActive]}>{v}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <ThemedText style={[styles.inputSectionLabel, { marginTop: 14 }]}>CALIDAD DE SUEÑO (1-5)</ThemedText>
              <View style={styles.pillRow}>
                {[1, 2, 3, 4, 5].map(v => (
                  <TouchableOpacity
                    key={`s-${v}`}
                    style={[styles.pillBtn, sleep === v && styles.pillBtnActive]}
                    onPress={() => setSleep(v)}
                  >
                    <ThemedText style={[styles.pillText, sleep === v && styles.pillTextActive]}>{v}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.primaryActionBtn, (!energy || !sleep) && styles.btnDisabled]}
                onPress={() => {
                  if (energy && sleep) saveCheckIn(energy, sleep);
                }}
                disabled={!energy || !sleep}
              >
                <ThemedText style={styles.primaryActionText}>GUARDAR CHECK-IN ESTOICO</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.glassCard}>
              <View style={styles.cardHeaderRow}>
                <FlameIcon color="#0052FF" size={20} />
                <ThemedText style={styles.cardHeaderTitle}>MÁXIMA ESTOICA DEL DÍA</ThemedText>
              </View>
              <ThemedText style={styles.quoteBody}>
                {'"Contempla a menudo el conjunto del tiempo y de la sustancia, y verás qué pequeño es cada cosa."'}
              </ThemedText>
              <ThemedText style={styles.quoteAuthorText}>— MARCO AURELIO</ThemedText>
            </View>
          )}

          {/* GRID DE CONTROL DE HÁBITOS */}
          <View style={styles.habitsGrid}>
            {/* HABITO 1: ENTRENO */}
            <View style={[styles.habitGridItem, log.trainingCompleted && styles.habitGridItemActive]}>
              <View style={styles.habitItemHeader}>
                <BarbellTabIcon color={log.trainingCompleted ? "#0052FF" : "#94A3B8"} size={22} />
                <CheckmarkIcon color={log.trainingCompleted ? "#0052FF" : "#CBD5E1"} size={20} />
              </View>
              <ThemedText style={styles.habitItemTitle}>TEMPLO (ENTRENO)</ThemedText>
              <ThemedText style={styles.habitItemStatus}>
                {log.trainingCompleted ? 'Completado ✓' : 'Pendiente'}
              </ThemedText>
              <TouchableOpacity 
                style={[styles.habitToggleBtn, log.trainingCompleted && styles.habitToggleBtnActive]} 
                onPress={toggleTraining}
              >
                <ThemedText style={styles.habitToggleBtnText}>
                  {log.trainingCompleted ? 'REGISTRADO' : 'MARCAR HECHO'}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* HABITO 2: HIDRATACIÓN */}
            <View style={[styles.habitGridItem, log.waterLitres >= 2 && styles.habitGridItemActive]}>
              <View style={styles.habitItemHeader}>
                <WaterIcon color={log.waterLitres >= 2 ? "#00C6FF" : "#94A3B8"} size={22} />
                <ThemedText style={styles.waterValueText}>{log.waterLitres.toFixed(1)}L / 2L</ThemedText>
              </View>
              <ThemedText style={styles.habitItemTitle}>HIDRATACIÓN</ThemedText>

              {/* Progress bar */}
              <View style={styles.gridProgressBarBg}>
                <View style={[styles.gridProgressBarFill, { width: `${Math.min((log.waterLitres / 2) * 100, 100)}%`, backgroundColor: '#00C6FF' }]} />
              </View>

              <View style={styles.waterControlRow}>
                <TouchableOpacity style={styles.smallAdjustBtn} onPress={() => addWater(-0.25)}>
                  <ThemedText style={styles.smallAdjustText}>-250m</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.smallAdjustBtn, styles.smallAdjustBtnHighlight]} onPress={() => addWater(0.25)}>
                  <ThemedText style={[styles.smallAdjustText, { color: '#00C6FF' }]}>+250ml</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* MÓDULO PASOS DIARIOS */}
          <StepCounterCard
            steps={log.steps || 0}
            stepGoal={log.stepGoal || 10000}
            onAddSteps={addSteps}
            onSetStepGoal={setStepGoal}
          />

          {/* MÓDULO ÍNDICE CALÓRICO TDEE */}
          <CalorieIndexCard
            consumedCalories={log.totalCalories || 0}
            targetCalories={log.targetCalories || 2200}
            userMetrics={log.userMetrics}
            consumedMacros={log.macros}
            onUpdateMetrics={updateUserMetrics}
          />

          {/* MÓDULO SMARTWATCH */}
          <SmartDeviceCard
            deviceState={log.smartDevice}
            onUpdateDevice={updateSmartDevice}
            onSyncSteps={addSteps}
          />

        </Animated.ScrollView>
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
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 82, 255, 0.22)',
    shadowColor: '#0052FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  headerTitleBox: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37',
  },
  appBadgeText: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#D4AF37',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontFamily: 'serif',
    color: '#F8FAFC',
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.10)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.30)',
  },
  streakText: {
    color: '#D4AF37',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  profileBtn: {
    padding: 6,
    backgroundColor: 'rgba(0, 82, 255, 0.10)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 82, 255, 0.25)',
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(0, 82, 255, 0.22)',
    gap: Spacing.three,
    shadowColor: '#0052FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  heroGaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringPercentText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#F8FAFC',
  },
  ringLabelText: {
    fontSize: 8,
    fontFamily: 'monospace',
    color: '#D4AF37',
    letterSpacing: 1,
  },
  heroInfo: {
    flex: 1,
    gap: 4,
  },
  heroTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#0052FF',
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  heroStatusCount: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#F8FAFC',
    fontWeight: 'bold',
  },
  heroMainTitle: {
    fontSize: 15,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  heroSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
  constellationWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.four,
    gap: 8,
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  focusTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1.5,
  },
  focusDescription: {
    fontSize: 13.5,
    color: '#CBD5E1',
    lineHeight: 20,
    fontFamily: 'serif',
  },
  focusFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
    marginTop: 4,
  },
  focusTipText: {
    fontSize: 11,
    color: '#D4AF37',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  quickDockRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  quickDockBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 82, 255, 0.20)',
  },
  quickDockText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  glassCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    padding: Spacing.four,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 82, 255, 0.20)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardHeaderTitle: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#F8FAFC',
    letterSpacing: 1,
  },
  cardSubtitleText: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 12,
  },
  inputSectionLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#0052FF',
    letterSpacing: 1,
    marginBottom: 6,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillBtnActive: {
    backgroundColor: 'rgba(0, 82, 255, 0.22)',
    borderColor: '#0052FF',
  },
  pillText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  pillTextActive: {
    color: '#D4AF37',
  },
  primaryActionBtn: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#0052FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0052FF',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  primaryActionText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1,
  },
  quoteBody: {
    fontSize: 14,
    fontFamily: 'serif',
    fontStyle: 'italic',
    color: '#CBD5E1',
    lineHeight: 22,
  },
  quoteAuthorText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#D4AF37',
    marginTop: 8,
  },
  habitsGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  habitGridItem: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 82, 255, 0.18)',
    gap: 6,
  },
  habitGridItemActive: {
    borderColor: 'rgba(212, 175, 55, 0.40)',
  },
  habitItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitItemTitle: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  habitItemStatus: {
    fontSize: 11,
    color: '#94A3B8',
  },
  habitToggleBtn: {
    marginTop: 4,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  habitToggleBtnActive: {
    backgroundColor: 'rgba(0, 82, 255, 0.20)',
    borderColor: '#0052FF',
  },
  habitToggleBtnText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  waterValueText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#00C6FF',
    fontWeight: 'bold',
  },
  gridProgressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 4,
  },
  gridProgressBarFill: {
    height: '100%',
  },
  waterControlRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  smallAdjustBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  smallAdjustBtnHighlight: {
    backgroundColor: 'rgba(0, 198, 255, 0.12)',
    borderColor: 'rgba(0, 198, 255, 0.30)',
  },
  smallAdjustText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#94A3B8',
  },
});
