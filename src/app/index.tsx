import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated, Platform, Image } from 'react-native';
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
import { BoxBreathingModal } from '@/components/BoxBreathingModal';
import { DailyStoicChallengeCard } from '@/components/DailyStoicChallengeCard';
import { StoicTwinMetabolicCards } from '@/components/StoicTwinMetabolicCards';
import { SleepQualityCard } from '@/components/SleepQualityCard';
import { getDailyStoicPrinciple } from '@/constants/stoicPrinciples';
import { getLocalTodayDateString } from '@/utils/dateUtils';
import { SafeStorage } from '@/utils/safeStorage';
import { usePedometerSensor } from '@/hooks/usePedometerSensor';

export default function HoyScreen() {
  const { log, toggleTraining, addSteps, setSteps, addWater, setStepGoal, updateUserMetrics, updateSmartDevice, saveReadinessScore, syncExternalHealthData, calculateTodayGrade } = useDailyLog();
  const router = useRouter();

  // Podómetro Biomecánico & Filtro Anti-Vehículo Always-On 24/7 (Gestionado a nivel raíz por GlobalPedometerRootTracker)
  const {
    isLiveTracking,
    isTransitMode,
    isVehicleDetected,
    sensitivity,
    setSensitivity,
    toggleTransitMode,
    forceSyncSteps,
  } = usePedometerSensor(undefined, undefined, log.steps ?? 0);

  const isRegisteredUser = Boolean(
    log.hasCompletedOnboarding ||
    log.legendaryPath ||
    SafeStorage.getItem('ataraxia_pact_accepted_v1') === 'true' ||
    SafeStorage.getItem('ataraxia_path_chosen_v1') === 'true' ||
    SafeStorage.getItem('ataraxia_onboarding_completed') === 'true'
  );

  const [onboardingDismissed, setOnboardingDismissed] = useState<boolean>(false);
  const [showStepCalibration, setShowStepCalibration] = useState<boolean>(false);
  const [showBoxBreathing, setShowBoxBreathing] = useState<boolean>(false);
  const [quoteOffset, setQuoteOffset] = useState<number>(0);

  const todayStr = getLocalTodayDateString();
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

  // 4. Variables de la Senda Activa & Pilares del Pacto de 30 Días
  const currentPath = log.legendaryPath || 'spartan';
  const pathMeta = {
    spartan: { title: '⚔️ SENDA ESPARTANA', focus: 'Fuerza & Sobrecarga', target: '4-5 Series • RIR 2' },
    hoplite: { title: '🛡️ SENDA DEL HOPLITA', focus: 'Motor 24h & Resistencia', target: 'Cardio Zona 2 & Mitocondrial' },
    apollo: { title: '⚡ SENDA DE APOLO', focus: 'Definición & V-Taper', target: 'Déficit & Densidad Magra' },
    philosopher: { title: '🧘‍♂️ SENDA FILOSÓFICA', focus: 'Calistenia & Claridad', target: 'Dominio Corporal & Ayuno' },
  }[currentPath] || { title: '⚔️ SENDA ESPARTANA', focus: 'Fuerza & Sobrecarga', target: '4-5 Series • RIR 2' };

  const todayGrade = calculateTodayGrade();
  const pillars = todayGrade.pillars;
  const completedPillarsCount = Object.values(pillars).filter(Boolean).length;
  const readinessScore = Math.min(100, Math.round(65 + (waterRatio * 15) + (log.trainingCompleted ? 10 : 0) + (log.checkInDone ? 10 : 0)));

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
          {/* HEADER STOIC ROYAL IMPERIAL (EXACT TO USER REFERENCE PHOTO) */}
          <View style={styles.headerContainerMaster}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity
                onPress={() => router.navigate('/profile')}
                activeOpacity={0.8}
                style={styles.laurelLogoBtn}
              >
                <View style={styles.laurelRing}>
                  <ThemedText style={styles.laurelLetter}>⚡</ThemedText>
                </View>
              </TouchableOpacity>

              <View style={styles.titleCenterMaster}>
                {Platform.OS === 'web' ? (
                  <img
                    src="/ataraxia_gold_title_banner.png"
                    alt="ATARAXIA"
                    width={320}
                    height={80}
                    style={{
                      width: '320px',
                      height: '80px',
                      maxWidth: '82vw',
                      objectFit: 'contain',
                      display: 'block',
                      filter: 'drop-shadow(0 4px 18px rgba(212, 175, 55, 0.45))',
                      userSelect: 'none',
                    }}
                  />
                ) : (
                  <Image
                    source={require('../../assets/images/ataraxia_gold_title_banner.png')}
                    style={{ width: 320, height: 80, maxWidth: '82%' }}
                    resizeMode="contain"
                  />
                )}
              </View>

              {/* Espacio de balance simétrico */}
              <View style={{ width: 44, height: 44 }} />
            </View>

            {/* Insignia con el nombre del usuario */}
            <View style={styles.brandSubtitleBadge}>
              <ThemedText style={styles.brandSubtitle}>
                {log.userName && log.userName !== 'Ciudadano Prokopton'
                  ? `⚔️ ${log.userName.toUpperCase()}`
                  : '⚔️ MAURO'}
              </ThemedText>
            </View>

            {/* Muelle flotante con los 3 accesos rápidos exactos de la foto */}
            <View style={styles.actionDockPill}>
              <TouchableOpacity
                style={styles.actionDockBtn}
                activeOpacity={0.7}
                onPress={() => router.navigate('/transformation' as any)}
              >
                <ThemedText style={{ fontSize: 18 }}>📸</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionDockBtn}
                activeOpacity={0.7}
                onPress={() => router.navigate('/journal')}
              >
                <ThemedText style={{ fontSize: 18 }}>📖</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionDockBtn}
                activeOpacity={0.7}
                onPress={() => router.navigate('/trainer')}
              >
                <ThemedText style={{ fontSize: 18 }}>🏋️‍♂️</ThemedText>
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
            heartRateBpm={log.smartDevice?.heartRateBpm ?? 0}
            avgBpm={log.smartDevice?.heartRateBpm ? Math.round(log.smartDevice.heartRateBpm * 0.95) : 0}
            peakBpm={log.smartDevice?.heartRateBpm ? Math.round(log.smartDevice.heartRateBpm * 1.3) : 0}
            onOpenStepDetails={() => setShowStepCalibration(true)}
            onAddSteps={addSteps}
            onSyncHeartRate={(measuredBpm) => {
              const bpm = measuredBpm || 0;
              if (bpm <= 0) return;
              const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              updateSmartDevice({
                heartRateBpm: bpm,
                lastSync: `Hoy ${nowTime} (Cámara PPG)`,
              });
            }}
          />

          

          {/* 3. SECCIÓN 1: PILAR DE FUERZA Y ACTIVIDAD EN VIVO */}
          <View style={styles.pillarSectionGroup}>
            <View style={styles.sectionTitleRow}>
              <ThemedText style={styles.sectionPillarTitle}>⚔️ PILAR DE FUERZA & MOVILIDAD</ThemedText>
              <ThemedText style={styles.sectionPctBadge}>{(strengthProgress * 100).toFixed(0)}%</ThemedText>
            </View>

            {/* Step Counter Card con Podómetro Biomecánico & Filtro Anti-Vehículo */}
            <StepCounterCard
              steps={log.steps || 0}
              stepGoal={log.stepGoal || 10000}
              deviceName={log.smartDevice?.deviceName}
              onOpenCalibration={() => setShowStepCalibration(true)}
              onAddSteps={addSteps}
              onSetStepGoal={setStepGoal}
              isLiveTracking={isLiveTracking}
              isTransitMode={isTransitMode}
              isVehicleDetected={isVehicleDetected}
              onToggleTransitMode={toggleTransitMode}
              onForceSync={forceSyncSteps}
            />

            {/* Fila Doble: Misión Táctica de la Senda & Principio Estoico */}
            <View style={styles.twoColRow}>
              {/* Misión Táctica de la Senda */}
              <View style={styles.halfCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <ThemedText style={styles.cardHeaderGoldText}>
                    {pathMeta.title}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 9, color: log.trainingCompleted ? '#10B981' : '#F59E0B', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {log.trainingCompleted ? 'LISTO ✓' : 'HOY'}
                  </ThemedText>
                </View>

                <View style={[styles.workoutGoldBox, log.trainingCompleted && { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)' }]}>
                  <ThemedText style={[styles.workoutTitleText, log.trainingCompleted && { color: '#6EE7B7' }]}>
                    {pathMeta.focus}
                  </ThemedText>
                  <ThemedText style={[styles.workoutMetaText, log.trainingCompleted && { color: '#10B981' }]}>
                    {log.trainingCompleted ? '🏆 Sesión Cumplida' : pathMeta.target}
                  </ThemedText>
                </View>

                <TouchableOpacity
                  onPress={() => router.navigate('/progress')}
                  activeOpacity={0.8}
                  style={styles.startButtonTouch}
                >
                  <LinearGradient
                    colors={log.trainingCompleted ? ['#059669', '#10B981', '#047857'] : ['#D4AF37', '#F59E0B', '#B45309']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.startButtonGradient}
                  >
                    <ThemedText style={styles.startButtonText} numberOfLines={1}>
                      {log.trainingCompleted ? 'Programa Listo ✓' : '🏛️ Ir al Programa'}
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
              <ThemedText style={styles.sectionPillarTitle}>🏛️ PILAR DE VIRTUD & PACTO DE 30 DÍAS</ThemedText>
              <ThemedText style={styles.sectionPctBadgeGold}>{(virtueProgress * 100).toFixed(0)}%</ThemedText>
            </View>

            {/* Módulo: Termómetro del Pacto de 30 Días & Calificación en Vivo */}
            <View style={styles.pactStatusCard}>
              <View style={styles.pactHeaderRow}>
                <View style={styles.pactTitleCol}>
                  <ThemedText style={styles.cardHeaderGoldText}>🏛️ ESTADO DEL PACTO • 30 DÍAS</ThemedText>
                  <View style={styles.dayBadgeRow}>
                    <ThemedText style={styles.pactDayNumber}>DÍA {log.monthlyCycle?.currentDay || 1}</ThemedText>
                    <ThemedText style={styles.pactDayTotal}>/ 30</ThemedText>
                  </View>
                </View>

                <View style={styles.gradeBadgeContainer}>
                  <LinearGradient
                    colors={
                      todayGrade.status === 'divine' ? ['#D4AF37', '#FFE259'] :
                      todayGrade.status === 'worthy' ? ['#059669', '#10B981'] :
                      todayGrade.status === 'mediocre' ? ['#B45309', '#F59E0B'] : ['#7F1D1D', '#EF4444']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradeBadgeGradient}
                  >
                    <ThemedText style={styles.gradeBadgeText}>
                      {todayGrade.status === 'divine' ? '👑 SEMIDIÓS' :
                       todayGrade.status === 'worthy' ? '⚔️ DIGNO' :
                       todayGrade.status === 'mediocre' ? '⚠️ AL LÍMITE' : '💀 INDIGNO'}
                    </ThemedText>
                  </LinearGradient>
                </View>
              </View>

              {/* Pilares Clave del Día */}
              <View style={styles.pillarsGridRow}>
                <View style={[styles.pillarPill, pillars.training && styles.pillarPillActive]}>
                  <ThemedText style={styles.pillarIconText}>{pillars.training ? '⚔️ ✓' : '⚔️ ⏳'}</ThemedText>
                  <ThemedText style={[styles.pillarLabel, pillars.training && styles.pillarLabelActive]}>Entreno</ThemedText>
                </View>

                <View style={[styles.pillarPill, pillars.steps && styles.pillarPillActive]}>
                  <ThemedText style={styles.pillarIconText}>{pillars.steps ? '👟 ✓' : '👟 ⏳'}</ThemedText>
                  <ThemedText style={[styles.pillarLabel, pillars.steps && styles.pillarLabelActive]}>Pasos</ThemedText>
                </View>

                <View style={[styles.pillarPill, pillars.nutrition && styles.pillarPillActive]}>
                  <ThemedText style={styles.pillarIconText}>{pillars.nutrition ? '🍽️ ✓' : '🍽️ ⏳'}</ThemedText>
                  <ThemedText style={[styles.pillarLabel, pillars.nutrition && styles.pillarLabelActive]}>Nutrición</ThemedText>
                </View>

                <View style={[styles.pillarPill, pillars.sleep && styles.pillarPillActive]}>
                  <ThemedText style={styles.pillarIconText}>{pillars.sleep ? '🌙 ✓' : '🌙 ⏳'}</ThemedText>
                  <ThemedText style={[styles.pillarLabel, pillars.sleep && styles.pillarLabelActive]}>Sueño</ThemedText>
                </View>
              </View>

              {/* Estado de texto militar y botón al juicio de progreso */}
              <View style={styles.pactFooterRow}>
                <ThemedText style={styles.pactStatusText}>
                  {completedPillarsCount === 7
                    ? '✨ Los 7 pilares sagrados sellados con honor militar.'
                    : `⚔️ ${completedPillarsCount}/7 pilares activos hoy (${7 - completedPillarsCount} pendientes).`}
                </ThemedText>

                <TouchableOpacity
                  style={styles.viewJudgmentBtn}
                  activeOpacity={0.8}
                  onPress={() => router.navigate('/progress')}
                >
                  <ThemedText style={styles.viewJudgmentBtnText}>Ver Programa 🏛️</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Módulo: Prueba Diaria de Temple ("El Obstáculo es el Camino") */}
            <DailyStoicChallengeCard />

            {/* Métricas de Bienestar & Score de Preparación SNC */}
            <View style={styles.healthMetricsCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <ThemedText style={styles.cardHeaderGoldText}>MÉTRICAS & PREPARACIÓN DEL SNC</ThemedText>
                <ThemedText style={{ fontSize: 9, color: '#10B981', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {readinessScore >= 80 ? '⚡ ÓPTIMO' : '⏳ RECUPERANDO'}
                </ThemedText>
              </View>

              <View style={styles.metricsGridRow}>
                <View style={styles.metricCol}>
                  <ThemedText style={styles.metricLabelText}>Ritmo Cardíaco</ThemedText>
                  <ThemedText style={styles.metricValText}>
                    {(log.smartDevice?.heartRateBpm && log.smartDevice.heartRateBpm > 0) ? log.smartDevice.heartRateBpm : '--'} <ThemedText style={styles.unitText}>bpm</ThemedText>
                  </ThemedText>
                </View>

                <View style={styles.metricDividerLine} />

                <View style={styles.metricCol}>
                  <ThemedText style={styles.metricLabelText}>Sueño & Recup.</ThemedText>
                  <ThemedText style={styles.metricValText}>
                    {log.readinessScore?.sleep ? `${log.readinessScore.sleep}h` : log.sleepQuality ? `${(log.sleepQuality * 1.5).toFixed(1)}h` : '7.0h'}
                  </ThemedText>
                </View>

                <View style={styles.metricDividerLine} />

                <View style={styles.metricCol}>
                  <ThemedText style={styles.metricLabelText}>Hidratación</ThemedText>
                  <ThemedText style={styles.metricValText}>
                    {waterLitres.toFixed(1)}L <ThemedText style={styles.unitText}>/ 3.0L</ThemedText>
                  </ThemedText>
                </View>

                <View style={styles.metricDividerLine} />

                <View style={styles.metricCol}>
                  <ThemedText style={styles.metricLabelText}>SNC Readiness</ThemedText>
                  <ThemedText style={[styles.metricValText, { color: '#6EE7B7' }]}>
                    {readinessScore}%
                  </ThemedText>
                </View>
              </View>

              {/* Botón Acceso Rápido Box Breathing */}
              <TouchableOpacity
                style={styles.boxBreathingTriggerBtn}
                activeOpacity={0.8}
                onPress={() => setShowBoxBreathing(true)}
              >
                <ThemedText style={styles.boxBreathingTriggerText}>
                  🌬️ Iniciar Respiración Táctica (Box Breathing 4-4-4-4) ⚡
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Módulo Especializado: Calidad del Sueño & Arquitectura del Descanso */}
            <SleepQualityCard
              initialHours={log.readinessScore?.sleep || 7.5}
              onUpdateSleepHours={(hours) => {
                saveReadinessScore(hours, log.readinessScore?.stress || 3, log.readinessScore?.soreness || 3);
              }}
            />
          </View>

          {/* 5. SECCIÓN 3: BALANCE ENERGÉTICO & NUTRICIÓN */}
          <View style={styles.pillarSectionGroup}>
            <View style={styles.sectionTitleRow}>
              <ThemedText style={styles.sectionPillarTitle}>📊 BALANCE METABÓLICO & NUTRICIÓN</ThemedText>
            </View>

            {/* Módulo Doble: Balanza Energética Neta & Regeneración Muscular */}
            <StoicTwinMetabolicCards
              totalBurnedCalories={totalBurnedCalories}
              consumedCalories={currentCalories}
              legendaryPath={currentPath}
              trainingCompleted={Boolean(log.trainingCompleted)}
              effectiveSets={log.effectiveSets || 0}
              sleepHours={log.readinessScore?.sleep || 7.5}
              waterLitres={waterLitres}
            />

            <SmartDeviceCard
              deviceState={log.smartDevice}
              currentSteps={currentSteps}
              onUpdateDevice={updateSmartDevice}
              onSyncHealthData={syncExternalHealthData}
              onSyncSteps={setSteps}
            />
          </View>

        </Animated.ScrollView>

        {(!isRegisteredUser && !onboardingDismissed) && (
          <StoicOnboardingModal
            visible={true}
            onClose={() => setOnboardingDismissed(true)}
          />
        )}

        {showStepCalibration && (
          <StepCalibrationModal
            visible={true}
            onClose={() => setShowStepCalibration(false)}
            currentSteps={currentSteps}
            stepGoal={currentGoal}
            onSetSteps={setSteps}
            onAddSteps={addSteps}
            onSetStepGoal={setStepGoal}
            isLiveTracking={isLiveTracking}
            onToggleLiveTracking={toggleTransitMode}
            sensitivity={sensitivity}
            onSetSensitivity={setSensitivity}
          />
        )}

        {showBoxBreathing && (
          <BoxBreathingModal
            visible={true}
            onClose={() => setShowBoxBreathing(false)}
          />
        )}
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
  headerContainerMaster: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    gap: 6,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  titleCenterMaster: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandSubtitleBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 3,
  },
  brandSubtitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#FFE259',
    letterSpacing: 2,
    textAlign: 'center',
  },
  actionDockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: 'rgba(13, 17, 28, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginTop: 2,
  },
  actionDockBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
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
  cardHeaderGoldText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#C5A869',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  pactStatusCard: {
    backgroundColor: 'rgba(14, 20, 36, 0.92)',
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.38)',
    gap: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  pactHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pactTitleCol: {
    gap: 2,
  },
  dayBadgeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  pactDayNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  pactDayTotal: {
    fontSize: 13,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  gradeBadgeContainer: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  gradeBadgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  pillarsGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  pillarPill: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    gap: 2,
  },
  pillarPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.45)',
  },
  pillarIconText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  pillarLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  pillarLabelActive: {
    color: '#6EE7B7',
    fontWeight: 'bold',
  },
  pactFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.15)',
  },
  pactStatusText: {
    fontSize: 11,
    color: '#CBD5E1',
    flex: 1,
    marginRight: 8,
  },
  viewJudgmentBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  viewJudgmentBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FDE68A',
    fontFamily: 'monospace',
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
    paddingVertical: 9,
    paddingHorizontal: 8,
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
    fontSize: 11,
    fontWeight: '900',
    color: '#050507',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  stoicQuoteText: {
    fontSize: 12,
    fontFamily: 'serif',
    fontStyle: 'italic',
    color: '#E2E8F0',
    lineHeight: 17,
    flexShrink: 1,
  },
  stoicAuthorText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#C5A869',
    alignSelf: 'flex-end',
    marginTop: 4,
    flexShrink: 1,
  },
  healthMetricsCard: {
    backgroundColor: 'rgba(14, 20, 36, 0.88)',
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(226, 192, 104, 0.35)',
    gap: 8,
    overflow: 'hidden',
  },
  metricsGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  metricCol: {
    flex: 1,
    minWidth: 65,
    alignItems: 'center',
    gap: 2,
  },
  metricLabelText: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  metricValText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  unitText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: 'normal',
  },
  metricDividerLine: {
    width: 1,
    height: 24,
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
  boxBreathingTriggerBtn: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxBreathingTriggerText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#7DD3FC',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
});

