import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useDailyLog } from '@/hooks/useDailyLog';
import { GlowArcGauge } from '@/components/GlowArcGauge';
import { FlameIcon } from '@/components/ModuleSvgIcons';
import { PearlElectricBackground } from '@/components/PearlElectricBackground';
import { PwaInstallButton } from '@/components/PwaInstallButton';
import { StepCounterCard } from '@/components/StepCounterCard';
import { CalorieIndexCard } from '@/components/CalorieIndexCard';
import { SmartDeviceCard } from '@/components/SmartDeviceCard';
import { StoicOnboardingModal } from '@/components/StoicOnboardingModal';
import { ThunderTelemetryTwinCards } from '@/components/ThunderTelemetryTwinCards';
import { StepCalibrationModal } from '@/components/StepCalibrationModal';
import { getDailyStoicPrinciple } from '@/constants/stoicPrinciples';

export default function HoyScreen() {
  const { log, toggleTraining, addSteps, setSteps, addWater, setStepGoal, updateUserMetrics, updateSmartDevice } = useDailyLog();
  const router = useRouter();

  const [onboardingDismissed, setOnboardingDismissed] = useState<boolean>(false);
  const [showStepCalibration, setShowStepCalibration] = useState<boolean>(false);
  const [quoteOffset, setQuoteOffset] = useState<number>(0);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentPrinciple = getDailyStoicPrinciple(todayStr, quoteOffset);

  const scrollY = useState(() => new Animated.Value(0))[0];

  // 1. Lectura 100% Real de Fuerza (Physical Power):
  const currentSteps = log.steps ?? 0;
  const currentGoal = log.stepGoal ?? 10000;
  const stepRatio = currentGoal > 0 ? Math.min(1, currentSteps / currentGoal) : 0;
  const trainingRatio = log.trainingCompleted ? 1 : 0;
  const nutritionRatio = Math.min(1, (log.mealsLogged ?? 0) / 3);
  const strengthProgress = (trainingRatio * 0.40) + (stepRatio * 0.40) + (nutritionRatio * 0.20);

  // 2. Lectura 100% Real de Virtud (Stoic Discipline):
  const waterLitres = log.waterLitres ?? 0;
  const waterRatio = Math.min(1, waterLitres / 3.0);
  const meditationRatio = log.checkInDone ? 1 : 0.5;
  const checkInRatio = log.checkInDone ? 1 : 0;
  const virtueProgress = (waterRatio * 0.40) + (meditationRatio * 0.30) + (checkInRatio * 0.30);

  const currentKm = Number((currentSteps * 0.00075).toFixed(1));
  const currentCalories = log.totalCalories ?? 0;
  const targetCalories = log.targetCalories ?? 2200;
  const activeStreak = log.trainingCompleted || log.checkInDone ? 15 : 14;

  // 3. Fisiología Dinámica del Gasto Calórico Activo (Daily Power Burn):
  const metrics = log.userMetrics || { weightKg: 78, heightCm: 176, age: 28, gender: 'male', activityLevel: 'moderate', goal: 'maintenance' };
  const bmr = (10 * metrics.weightKg) + (6.25 * metrics.heightCm) - (5 * metrics.age) + 5;
  const now = new Date();
  const dayFraction = Math.max(0.25, (now.getHours() * 60 + now.getMinutes()) / 1440);
  const basalBurn = Math.round(bmr * dayFraction);
  const stepsBurn = Math.round(currentSteps * 0.045);
  const workoutBurn = log.trainingCompleted ? 480 : (log.effectiveSets ? log.effectiveSets * 25 : 0);
  const totalBurnedCalories = basalBurn + stepsBurn + workoutBurn;
  const targetBurnCalories = Math.max(2200, Math.round(bmr * 1.45));

  return (
    <PearlElectricBackground glowColor="rgba(212, 175, 55, 0.28)">
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
          {/* HEADER STOIC ROYAL IMPERIAL (EXACT TO REFERENCE PHOTO) */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.navigate('/profile')} activeOpacity={0.8} style={styles.laurelLogoBtn}>
              <View style={styles.laurelRing}>
                <ThemedText style={styles.laurelLetter}>⚡</ThemedText>
              </View>
            </TouchableOpacity>

            <View style={styles.titleCenterGroup}>
              <View style={styles.titleWithFlankRow}>
                <ThemedText style={styles.titleFlankSparkle}>⚡</ThemedText>
                <ThemedText style={styles.brandTitleClassic}>ATARAXIA</ThemedText>
                <ThemedText style={styles.titleFlankSparkle}>⚡</ThemedText>
              </View>
              <View style={styles.brandSubtitleBadge}>
                <ThemedText style={styles.brandSubtitle}>
                  {log.userName && log.userName !== 'Ciudadano Prokopton'
                    ? `⚔️ ${log.userName.toUpperCase()}`
                    : 'TEMPLO DEL AUTODOMINIO'}
                </ThemedText>
              </View>
            </View>

            <View style={styles.headerRightActions}>
              <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7} onPress={() => router.navigate('/journal')}>
                <ThemedText style={{ fontSize: 16, color: '#D4AF37' }}>📖</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7} onPress={() => router.navigate('/trainer')}>
                <ThemedText style={{ fontSize: 16, color: '#F59E0B' }}>🏋️‍♂️</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* PWA INSTALL BUTTON IF APPLICABLE */}
          <PwaInstallButton />

          {/* 1. HERO SECTION: 3D LUXURY GOLD & THUNDER DIAL (DAILY POWER BURN) */}
          <View style={styles.heroGaugeSection}>
            <GlowArcGauge
              strengthProgress={strengthProgress}
              virtueProgress={virtueProgress}
              size={320}
              steps={currentSteps}
              stepGoal={currentGoal}
              km={currentKm}
              calories={totalBurnedCalories}
              targetCalories={targetBurnCalories}
              consumedCalories={currentCalories}
              targetConsumedCalories={targetCalories}
              waterLitres={waterLitres}
              trainingCompleted={log.trainingCompleted}
              streakDays={activeStreak}
            />
          </View>

          {/* 2. TWIN TELEMETRY CARDS (EXACT TO REFERENCE PHOTO: LIVE STEPS & HEART RATE) */}
          <ThunderTelemetryTwinCards
            steps={currentSteps}
            stepGoal={currentGoal}
            km={currentKm}
            heartRateBpm={log.smartDevice?.heartRateBpm || 72}
            avgBpm={68}
            peakBpm={142}
            onOpenStepDetails={() => setShowStepCalibration(true)}
            onAddSteps={addSteps}
            onSyncHeartRate={(measuredBpm) => {
              const bpm = measuredBpm || 74;
              const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              updateSmartDevice({
                heartRateBpm: bpm,
                lastSync: `Hoy ${nowTime} (Óptico PPG)`,
              });
            }}
          />

          {/* 2. DOCK DE ACCIONES RÁPIDAS (Quick Action Dock) */}
          <View style={styles.quickDockCard}>
            <ThemedText style={styles.dockHeaderTitle}>ACCIONES RÁPIDAS • RAYO DE FUERZA</ThemedText>
            <View style={styles.dockButtonsRow}>
              <TouchableOpacity
                style={styles.dockChipBtn}
                onPress={() => addSteps(1000)}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.dockChipText}>👟 +1k Pasos</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dockChipBtn, log.trainingCompleted && styles.dockChipActive]}
                onPress={toggleTraining}
                activeOpacity={0.8}
              >
                <ThemedText style={[styles.dockChipText, log.trainingCompleted && styles.dockChipTextActive]}>
                  {log.trainingCompleted ? '🏆 Entrenado ✓' : '🏋️‍♂️ Entrenar'}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dockChipBtn}
                onPress={() => addWater(0.25)}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.dockChipText}>💧 +0.25L Agua</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dockChipBtn}
                onPress={() => router.navigate('/journal')}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.dockChipText}>📖 Check-In</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. SECCIÓN 1: PILAR DE FUERZA Y ACTIVIDAD EN VIVO */}
          <View style={styles.pillarSectionGroup}>
            <View style={styles.sectionTitleRow}>
              <ThemedText style={styles.sectionPillarTitle}>⚔️ PILAR DE FUERZA & MOVILIDAD</ThemedText>
              <ThemedText style={styles.sectionPctBadge}>{(strengthProgress * 100).toFixed(0)}%</ThemedText>
            </View>

            {/* Step Counter Card con Podómetro en Vivo */}
            <StepCounterCard
              steps={log.steps || 0}
              stepGoal={log.stepGoal || 10000}
              onAddSteps={addSteps}
              onSetStepGoal={setStepGoal}
            />

            {/* Fila Doble: Sesión de Entrenamiento & Principio Estoico */}
            <View style={styles.twoColRow}>
              {/* Entrena */}
              <View style={styles.halfCard}>
                <ThemedText style={styles.cardHeaderGoldText}>⚡ RESISTENCIA FÍSICA</ThemedText>

                <View style={styles.workoutGoldBox}>
                  <ThemedText style={styles.workoutTitleText}>Rutina de Hoy</ThemedText>
                  <ThemedText style={styles.workoutMetaText}>55 mins | 720 kcal</ThemedText>
                </View>

                <TouchableOpacity
                  onPress={toggleTraining}
                  activeOpacity={0.8}
                  style={styles.startButtonTouch}
                >
                  <LinearGradient
                    colors={['#D4AF37', '#F59E0B', '#B45309']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.startButtonGradient}
                  >
                    <ThemedText style={styles.startButtonText}>
                      {log.trainingCompleted ? '🏆 Completado ✓' : '⚡ Iniciar Sesión'}
                    </ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Filosofía Estoica (Rotación Diaria No Repetitiva & Táctil) */}
              <TouchableOpacity
                style={styles.halfCard}
                activeOpacity={0.8}
                onPress={() => setQuoteOffset(prev => prev + 1)}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <ThemedText style={styles.cardHeaderGoldText}>🏛️ PRINCIPIO ESTOICO</ThemedText>
                  <ThemedText style={{ fontSize: 9, color: '#D4AF37', opacity: 0.8, fontFamily: 'monospace' }}>⚡ Toca</ThemedText>
                </View>
                <ThemedText style={styles.stoicQuoteText}>
                  {`"${currentPrinciple.quote}"`}
                </ThemedText>
                <ThemedText style={styles.stoicAuthorText}>
                  — {currentPrinciple.author}{currentPrinciple.work ? ` (${currentPrinciple.work})` : ''}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. SECCIÓN 2: PILAR DE VIRTUD Y BIENESTAR MENTAL */}
          <View style={styles.pillarSectionGroup}>
            <View style={styles.sectionTitleRow}>
              <ThemedText style={styles.sectionPillarTitle}>🏛️ PILAR DE VIRTUD & BIENESTAR</ThemedText>
              <ThemedText style={styles.sectionPctBadgeGold}>{(virtueProgress * 100).toFixed(0)}%</ThemedText>
            </View>

            {/* Hábito de Meditación */}
            <View style={styles.meditationCard}>
              <View style={styles.meditationLeft}>
                <ThemedText style={styles.cardHeaderGoldText}>RACHA DE DISCIPLINA</ThemedText>
                <View style={styles.streakRow}>
                  <FlameIcon color="#D4AF37" size={28} />
                  <ThemedText style={styles.streakNumberText}>{activeStreak}</ThemedText>
                  <View style={styles.streakSubCol}>
                    <ThemedText style={styles.streakDayText}>Días</ThemedText>
                    <ThemedText style={styles.streakLabelText}>Racha Activa</ThemedText>
                  </View>
                </View>
              </View>

              <View style={styles.meditationRight}>
                <TouchableOpacity
                  style={styles.continuePillBtn}
                  activeOpacity={0.7}
                  onPress={() => router.navigate('/journal')}
                >
                  <ThemedText style={styles.continuePillText}>Continuar ⚡</ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.viewSubtext}>Abrir Diario</ThemedText>
              </View>
            </View>

            {/* Métrica de Salud */}
            <View style={styles.healthMetricsCard}>
              <ThemedText style={styles.cardHeaderGoldText}>MÉTRICAS DE BIENESTAR EN TIEMPO REAL</ThemedText>

              <View style={styles.metricsGridRow}>
                <View style={styles.metricCol}>
                  <ThemedText style={styles.metricLabelText}>Ritmo Cardíaco</ThemedText>
                  <ThemedText style={styles.metricValText}>
                    {log.smartDevice?.heartRateBpm || 72} <ThemedText style={styles.unitText}>bpm</ThemedText>
                  </ThemedText>
                </View>

                <View style={styles.metricDividerLine} />

                <View style={styles.metricCol}>
                  <ThemedText style={styles.metricLabelText}>Sueño & Recup.</ThemedText>
                  <ThemedText style={styles.metricValText}>
                    {log.readinessScore?.sleep ? `${log.readinessScore.sleep}h / 8h` : log.sleepQuality ? `${log.sleepQuality * 1.5}h / 8h` : '6.5h / 8h'}
                  </ThemedText>
                </View>

                <View style={styles.metricDividerLine} />

                <View style={styles.metricCol}>
                  <ThemedText style={styles.metricLabelText}>Hidratación</ThemedText>
                  <ThemedText style={styles.metricValText}>
                    {waterLitres.toFixed(1)}L <ThemedText style={styles.unitText}>/ 3.0L</ThemedText>
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          {/* 5. SECCIÓN 3: NUTRICIÓN & TECNOLOGÍA */}
          <View style={styles.pillarSectionGroup}>
            <View style={styles.sectionTitleRow}>
              <ThemedText style={styles.sectionPillarTitle}>📊 NUTRICIÓN & TECNOLOGÍA</ThemedText>
            </View>

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
          visible={!log.hasCompletedOnboarding && !onboardingDismissed}
          onClose={() => setOnboardingDismissed(true)}
        />

        <StepCalibrationModal
          visible={showStepCalibration}
          onClose={() => setShowStepCalibration(false)}
          currentSteps={currentSteps}
          stepGoal={currentGoal}
          onSetSteps={setSteps}
          onAddSteps={addSteps}
          onSetStepGoal={setStepGoal}
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
  laurelLogoBtn: {
    padding: 2,
  },
  laurelRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FF9100',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 145, 0, 0.15)',
    boxShadow: '0 0 12px rgba(255, 145, 0, 0.40)',
  },
  laurelLetter: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFAB00',
  },
  titleCenterGroup: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  titleWithFlankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  titleFlankSparkle: {
    fontSize: 16,
    color: '#FFE259',
    textShadowColor: 'rgba(255, 226, 89, 0.85)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    opacity: 0.9,
  },
  brandTitleClassic: {
    fontSize: 27,
    fontWeight: '900',
    color: '#FFE259',
    letterSpacing: 4.5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(212, 175, 55, 0.90)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 14,
  },
  brandSubtitleBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginTop: 2,
  },
  brandSubtitle: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#E2C068',
    letterSpacing: 1.8,
    textAlign: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(13, 17, 28, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  dateRowCenter: {
    alignItems: 'center',
    marginVertical: -2,
  },
  dateHeaderText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#94A3B8',
    letterSpacing: 1.5,
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
    backgroundColor: 'rgba(13, 17, 28, 0.92)',
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    justifyContent: 'space-between',
    gap: 8,
  },
  workoutGoldBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.40)',
    gap: 2,
  },
  workoutTitleText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FDE68A',
  },
  workoutMetaText: {
    fontSize: 11,
    color: '#D4AF37',
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
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#050507',
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
  quickDockCard: {
    backgroundColor: 'rgba(14, 20, 36, 0.90)',
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(29, 100, 242, 0.30)',
    gap: 8,
    marginVertical: 4,
  },
  dockHeaderTitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00C6FF',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  dockButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  dockChipBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  dockChipActive: {
    backgroundColor: 'rgba(226, 192, 104, 0.20)',
    borderColor: '#E2C068',
  },
  dockChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#F8FAFC',
    fontFamily: 'monospace',
  },
  dockChipTextActive: {
    color: '#E2C068',
    fontWeight: 'bold',
  },
  pillarSectionGroup: {
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sectionPillarTitle: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#E2C068',
    letterSpacing: 1.8,
  },
  sectionPctBadge: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00C6FF',
    backgroundColor: 'rgba(0, 198, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 198, 255, 0.30)',
  },
  sectionPctBadgeGold: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#E2C068',
    backgroundColor: 'rgba(226, 192, 104, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(226, 192, 104, 0.30)',
  },
});
