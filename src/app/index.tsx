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

export default function HoyScreen() {
  const { log, toggleTraining, addSteps, addWater, setStepGoal, updateUserMetrics, updateSmartDevice } = useDailyLog();
  const router = useRouter();

  const [onboardingVisible, setOnboardingVisible] = useState<boolean>(!log.hasCompletedOnboarding);

  const scrollY = useState(() => new Animated.Value(0))[0];

  // Lectura 100% Real de Fuerza (Physical Power):
  // - Pasos caminados (vs meta): 40%
  // - Entrenamiento completado: 40%
  // - Registro nutricional / comidas: 20%
  const currentSteps = log.steps || 0;
  const currentGoal = log.stepGoal || 10000;
  const stepRatio = Math.min(1, currentSteps / currentGoal);
  const trainingRatio = log.trainingCompleted ? 1 : 0;
  const nutritionRatio = Math.min(1, (log.mealsLogged || 0) / 3);
  const strengthProgress = (trainingRatio * 0.40) + (stepRatio * 0.40) + (nutritionRatio * 0.20);

  // Lectura 100% Real de Virtud (Stoic Discipline):
  // - Hidratación (vs meta 3L): 35%
  // - Meditación / Racha activa: 35%
  // - Check-in diario completado: 30%
  const waterLitres = log.waterLitres || 0;
  const waterRatio = Math.min(1, waterLitres / 3.0);
  const meditationRatio = log.checkInDone ? 1 : 0.5; // Meditación & hábitos estoicos
  const checkInRatio = log.checkInDone ? 1 : 0;
  const virtueProgress = (waterRatio * 0.35) + (meditationRatio * 0.35) + (checkInRatio * 0.30);

  const overallProgress = (strengthProgress + virtueProgress) / 2;

  const currentKm = Number((currentSteps * 0.00075).toFixed(1));
  const currentCalories = log.totalCalories || Math.round(currentSteps * 0.04);

  return (
    <PearlElectricBackground glowColor="rgba(212, 175, 55, 0.25)">
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
          {/* HEADER STOIC ROYAL IMPERIAL GOLD & THUNDER */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.8} style={styles.laurelLogoBtn}>
              <View style={styles.laurelRing}>
                <ThemedText style={styles.laurelLetter}>⚡</ThemedText>
              </View>
            </TouchableOpacity>

            <View style={styles.titleCenterGroup}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ThemedText style={{ fontSize: 20, color: '#D4AF37' }}>🏛️</ThemedText>
                <ThemedText style={styles.brandTitle}>ATARAXIA</ThemedText>
              </View>
              <ThemedText style={styles.brandSubtitle}>IMPERIAL THUNDER • ATHLETIC</ThemedText>
            </View>

            <View style={styles.headerRightActions}>
              <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7} onPress={() => router.push('/journal')}>
                <ThemedText style={{ fontSize: 16, color: '#D4AF37' }}>⚡</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7} onPress={() => router.push('/trainer')}>
                <ThemedText style={{ fontSize: 16, color: '#F59E0B' }}>🏋️‍♂️</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* DATE LINE */}
          <View style={styles.dateRowCenter}>
            <ThemedText style={styles.dateHeaderText}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()} | {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </ThemedText>
          </View>

          {/* PWA INSTALL BUTTON IF APPLICABLE */}
          <PwaInstallButton />

          {/* 1. HERO SECTION: GLOW ARC GAUGE (IMPERIAL GOLD & THUNDER) */}
          <View style={styles.heroGaugeSection}>
            <GlowArcGauge
              strengthProgress={strengthProgress}
              virtueProgress={virtueProgress}
              overallProgress={overallProgress}
              size={320}
              steps={currentSteps}
              stepGoal={currentGoal}
              km={currentKm}
              calories={currentCalories}
              waterLitres={waterLitres}
              trainingCompleted={log.trainingCompleted}
              streakDays={14}
            />
          </View>

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
                onPress={() => router.push('/journal')}
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

              {/* Filosofía Estoica */}
              <View style={styles.halfCard}>
                <ThemedText style={styles.cardHeaderGoldText}>🏛️ PRINCIPIO ESTOICO</ThemedText>
                <ThemedText style={styles.stoicQuoteText}>
                  {'"Enfócate en lo que puedes controlar, forja tu propia fuerza..."'}
                </ThemedText>
                <ThemedText style={styles.stoicAuthorText}>— Marco Aurelio</ThemedText>
              </View>
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
                  <ThemedText style={styles.streakNumberText}>14</ThemedText>
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
                  onPress={() => router.push('/journal')}
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
                  <ThemedText style={styles.metricLabelText}>Sueño Profundo</ThemedText>
                  <ThemedText style={styles.metricValText}>6h 32m</ThemedText>
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
          visible={onboardingVisible && !log.hasCompletedOnboarding}
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
  },
  brandTitle: {
    fontSize: 26,
    fontFamily: 'sans-serif',
    fontWeight: '900',
    color: '#FF9100',
    letterSpacing: 4,
    textShadowColor: 'rgba(255, 145, 0, 0.50)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  brandSubtitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#00C6FF',
    letterSpacing: 2.5,
    marginTop: -2,
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
    backgroundColor: 'rgba(14, 20, 36, 0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 192, 104, 0.35)',
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
