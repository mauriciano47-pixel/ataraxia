import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useDailyLog } from '@/hooks/useDailyLog';
import { GlowArcGauge } from '@/components/GlowArcGauge';
import { FlameIcon, PersonIcon } from '@/components/ModuleSvgIcons';
import { PearlElectricBackground } from '@/components/PearlElectricBackground';
import { PwaInstallButton } from '@/components/PwaInstallButton';
import { StepCounterCard } from '@/components/StepCounterCard';
import { CalorieIndexCard } from '@/components/CalorieIndexCard';
import { SmartDeviceCard } from '@/components/SmartDeviceCard';
import { StoicOnboardingModal } from '@/components/StoicOnboardingModal';

// Custom Bell Icon component matching the Cobalt Blue glow of the mockup
function BellIcon({ color = '#1D64F2', size = 20 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size * 0.7, height: size * 0.7, borderRadius: size * 0.35, backgroundColor: color, opacity: 0.2, position: 'absolute' }} />
      <ThemedText style={{ color: color, fontSize: 16 }}>🔔</ThemedText>
    </View>
  );
}

export default function HoyScreen() {
  const { log, toggleTraining, addSteps, setStepGoal, updateUserMetrics, updateSmartDevice } = useDailyLog();
  const router = useRouter();

  const [onboardingVisible, setOnboardingVisible] = useState<boolean>(!log.hasCompletedOnboarding);

  const scrollY = useState(() => new Animated.Value(0))[0];

  // Fuerza (Physical Strength & Energy): 
  // - Entrenamiento completado: 40%
  // - Progreso de pasos (vs meta): 40%
  // - Registro de comidas/nutrición: 20%
  const stepRatio = Math.min(1, (log.steps || 8450) / (log.stepGoal || 10000));
  const trainingRatio = log.trainingCompleted ? 1 : 0.75;
  const nutritionRatio = log.mealsLogged > 0 ? Math.min(1, log.mealsLogged / 3) : 0.8;
  const strengthProgress = (trainingRatio * 0.40) + (stepRatio * 0.40) + (nutritionRatio * 0.20);

  // Virtud (Stoic Mindfulness & Habits):
  // - Hidratación (2L - 3L meta): 35%
  // - Meditación / Racha activa: 35%
  // - Check-in / Reflexión diaria: 30%
  const waterRatio = Math.min(1, (log.waterLitres || 2.4) / 3.0);
  const meditationRatio = 0.95; // 14 días racha activa
  const checkInRatio = log.checkInDone ? 1 : 0.85;
  const virtueProgress = (waterRatio * 0.35) + (meditationRatio * 0.35) + (checkInRatio * 0.30);

  const overallProgress = (strengthProgress + virtueProgress) / 2;

  return (
    <PearlElectricBackground glowColor="rgba(29, 100, 242, 0.22)">
      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER STOIC ROYAL */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.push('/profile')} style={styles.avatarBtn}>
              <PersonIcon color="#E2C068" size={20} />
            </TouchableOpacity>

            <View style={styles.titleCenterGroup}>
              <ThemedText style={styles.brandTitle}>ATARAXIA</ThemedText>
              <ThemedText style={styles.brandSubtitle}>Stoic Strength & Wellness</ThemedText>
            </View>

            <TouchableOpacity style={styles.bellBtn}>
              <BellIcon color="#1D64F2" size={20} />
            </TouchableOpacity>
          </View>

          {/* PWA INSTALL BUTTON IF APPLICABLE */}
          <PwaInstallButton />

          {/* HERO SECTION: STRENGTH & VIRTUE ARC GAUGE */}
          <View style={styles.heroGaugeSection}>
            <ThemedText style={styles.sectionHeaderTitle}>STRENGTH & VIRTUE</ThemedText>

            <GlowArcGauge
              strengthProgress={strengthProgress}
              virtueProgress={virtueProgress}
              overallProgress={overallProgress}
              size={280}
              steps={log.steps || 8450}
              stepGoal={log.stepGoal || 10000}
              km={log.steps ? Number((log.steps * 0.00075).toFixed(1)) : 6.2}
              calories={log.totalCalories || 340}
              waterLitres={log.waterLitres || 2.4}
              trainingCompleted={log.trainingCompleted}
              streakDays={14}
            />
          </View>

          {/* CARD 1: MEDITATION HABIT (HABIT STREAK) */}
          <View style={styles.meditationCard}>
            <View style={styles.meditationLeft}>
              <ThemedText style={styles.cardHeaderGoldText}>MEDITATION HABIT</ThemedText>
              <View style={styles.streakRow}>
                <FlameIcon color="#E2C068" size={28} />
                <ThemedText style={styles.streakNumberText}>14</ThemedText>
                <View style={styles.streakSubCol}>
                  <ThemedText style={styles.streakDayText}>Day</ThemedText>
                  <ThemedText style={styles.streakLabelText}>Streak</ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.meditationRight}>
              <TouchableOpacity
                style={styles.continuePillBtn}
                onPress={() => router.push('/journal')}
              >
                <ThemedText style={styles.continuePillText}>Continue</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.viewSubtext}>View</ThemedText>
            </View>
          </View>

          {/* TWO COLUMN ROW: PHYSICAL ENDURANCE & STOIC PRINCIPLE */}
          <View style={styles.twoColRow}>
            {/* LEFT CARD: PHYSICAL ENDURANCE */}
            <View style={styles.halfCard}>
              <ThemedText style={styles.cardHeaderGoldText}>PHYSICAL ENDURANCE</ThemedText>

              <View style={styles.workoutCobaltBox}>
                <ThemedText style={styles.workoutTitleText}>Workout Session</ThemedText>
                <ThemedText style={styles.workoutMetaText}>55 mins | 720 kcal</ThemedText>
              </View>

              <TouchableOpacity
                onPress={toggleTraining}
                activeOpacity={0.8}
                style={styles.startButtonTouch}
              >
                <LinearGradient
                  colors={['#E2C068', '#C5A869']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.startButtonGradient}
                >
                  <ThemedText style={styles.startButtonText}>
                    {log.trainingCompleted ? 'Done ✓' : 'Start'}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* RIGHT CARD: STOIC PRINCIPLE */}
            <View style={styles.halfCard}>
              <ThemedText style={styles.cardHeaderGoldText}>STOIC PRINCIPLE</ThemedText>

              <ThemedText style={styles.stoicQuoteText}>
                {'"Focus on what you can control, to control forms..."'}
              </ThemedText>

              <ThemedText style={styles.stoicAuthorText}>— Marcus Aurelius</ThemedText>
            </View>
          </View>

          {/* CARD 3: HEALTH METRICS */}
          <View style={styles.healthMetricsCard}>
            <ThemedText style={styles.cardHeaderGoldText}>HEALTH METRICS</ThemedText>

            <View style={styles.metricsGridRow}>
              {/* Metric 1 */}
              <View style={styles.metricCol}>
                <ThemedText style={styles.metricLabelText}>Heart Rate</ThemedText>
                <ThemedText style={styles.metricValText}>
                  {log.smartDevice?.heartRateBpm || 72} <ThemedText style={styles.unitText}>bpm</ThemedText>
                </ThemedText>
              </View>

              <View style={styles.metricDividerLine} />

              {/* Metric 2 */}
              <View style={styles.metricCol}>
                <ThemedText style={styles.metricLabelText}>Deep Sleep</ThemedText>
                <ThemedText style={styles.metricValText}>6h 32m</ThemedText>
              </View>

              <View style={styles.metricDividerLine} />

              {/* Metric 3 */}
              <View style={styles.metricCol}>
                <ThemedText style={styles.metricLabelText}>Hydration</ThemedText>
                <ThemedText style={styles.metricValText}>
                  {log.waterLitres.toFixed(1)}L <ThemedText style={styles.unitText}>/ 3L</ThemedText>
                </ThemedText>
              </View>
            </View>
          </View>

          {/* INTEGRATED EXPANDABLE MODULE CARDS (Step Counter, TDEE, SmartDevice) */}
          <View style={styles.extraModulesContainer}>
            <StepCounterCard
              steps={log.steps || 0}
              stepGoal={log.stepGoal || 10000}
              onAddSteps={addSteps}
              onSetStepGoal={setStepGoal}
            />

            <CalorieIndexCard
              consumedCalories={log.totalCalories || 0}
              targetCalories={log.targetCalories || 2200}
              userMetrics={log.userMetrics}
              consumedMacros={log.macros}
              onUpdateMetrics={updateUserMetrics}
            />

            <SmartDeviceCard
              deviceState={log.smartDevice}
              onUpdateDevice={updateSmartDevice}
              onSyncSteps={addSteps}
            />
          </View>

        </Animated.ScrollView>

        <StoicOnboardingModal
          visible={onboardingVisible || !log.hasCompletedOnboarding}
          onClose={() => setOnboardingVisible(false)}
        />
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
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(14, 20, 36, 0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 192, 104, 0.45)',
  },
  titleCenterGroup: {
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontFamily: 'serif',
    fontWeight: '800',
    color: '#E2C068',
    letterSpacing: 3,
  },
  brandSubtitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#C5A869',
    opacity: 0.9,
    marginTop: -2,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(14, 20, 36, 0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(29, 100, 242, 0.35)',
  },
  heroGaugeSection: {
    alignItems: 'center',
    marginVertical: 4,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#C5A869',
    letterSpacing: 3,
    marginBottom: 4,
  },
  meditationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 20, 36, 0.88)',
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(226, 192, 104, 0.35)',
    shadowColor: '#E2C068',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  meditationLeft: {
    gap: 4,
  },
  cardHeaderGoldText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#C5A869',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakNumberText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'sans-serif',
  },
  streakSubCol: {
    justifyContent: 'center',
  },
  streakDayText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
    lineHeight: 14,
  },
  streakLabelText: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 14,
  },
  meditationRight: {
    alignItems: 'center',
    gap: 4,
  },
  continuePillBtn: {
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 192, 104, 0.55)',
    backgroundColor: 'rgba(226, 192, 104, 0.05)',
  },
  continuePillText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#E2C068',
  },
  viewSubtext: {
    fontSize: 11,
    color: '#94A3B8',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  halfCard: {
    flex: 1,
    backgroundColor: 'rgba(14, 20, 36, 0.88)',
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(226, 192, 104, 0.35)',
    justifyContent: 'space-between',
    gap: 8,
  },
  workoutCobaltBox: {
    backgroundColor: '#1D64F2',
    borderRadius: 12,
    padding: 10,
    gap: 2,
  },
  workoutTitleText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  workoutMetaText: {
    fontSize: 11,
    color: '#BFDBFE',
    fontFamily: 'monospace',
  },
  startButtonTouch: {
    marginTop: 4,
  },
  startButtonGradient: {
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#070B14',
    letterSpacing: 0.5,
  },
  stoicQuoteText: {
    fontSize: 12.5,
    fontFamily: 'serif',
    fontStyle: 'italic',
    color: '#E2E8F0',
    lineHeight: 18,
  },
  stoicAuthorText: {
    fontSize: 10.5,
    fontFamily: 'monospace',
    color: '#C5A869',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  healthMetricsCard: {
    backgroundColor: 'rgba(14, 20, 36, 0.88)',
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(226, 192, 104, 0.35)',
    gap: 8,
  },
  metricsGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricLabelText: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  metricValText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  unitText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: 'normal',
  },
  metricDividerLine: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  extraModulesContainer: {
    marginTop: Spacing.two,
    gap: Spacing.three,
  },
});
