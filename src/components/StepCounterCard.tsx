import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

interface StepCounterCardProps {
  currentSteps?: number;
  goal?: number;
  steps?: number;
  stepGoal?: number;
  onOpenCalibration?: () => void;
  onAddSteps?: (amount: number) => void;
  onSetStepGoal?: (goal: number) => void;
  isLiveTracking?: boolean;
  isTransitMode?: boolean;
  isVehicleDetected?: boolean;
  onToggleTransitMode?: () => void;
  onForceSync?: () => void;
}

export function StepCounterCard({
  currentSteps,
  goal,
  steps,
  stepGoal,
  onOpenCalibration,
  onAddSteps,
  onSetStepGoal,
  isLiveTracking = true,
  isTransitMode = false,
  isVehicleDetected = false,
  onToggleTransitMode,
  onForceSync,
}: StepCounterCardProps) {
  const [justSynced, setJustSynced] = useState(false);

  const actualSteps = currentSteps ?? steps ?? 0;
  const actualGoal = goal ?? stepGoal ?? 10000;
  const progressRatio = actualGoal > 0 ? Math.min(1, actualSteps / actualGoal) : 0;
  const km = (actualSteps * 0.00075).toFixed(2);
  const kcalBurned = Math.round(actualSteps * 0.045);
  const activeMinutes = Math.round(actualSteps / 110);

  const isPaused = isTransitMode || isVehicleDetected;

  const handleSyncPress = () => {
    if (onForceSync) {
      onForceSync();
    }
    setJustSynced(true);
    setTimeout(() => setJustSynced(false), 1600);
  };

  return (
    <View style={[styles.card, isPaused && styles.cardPaused]}>
      {/* CABECERA & BADGE DE ESTADO BIOMECÁNICO */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <ThemedText style={styles.headerGoldText}>👟 PODÓMETRO BIOMECÁNICO 24/7</ThemedText>
          <View style={styles.liveSensorRow}>
            <View style={[styles.liveDot, isPaused ? styles.liveDotAmber : styles.liveDotGreen]} />
            <ThemedText style={[styles.liveSensorText, isPaused && styles.liveSensorTextAmber]}>
              {isVehicleDetected
                ? '🚗 MODO VEHÍCULO DETECTADO (>20 km/h)'
                : isTransitMode
                ? '🚗 MODO TRÁNSITO ACTIVO (PAUSADO)'
                : '🟢 SENSOR DINÁMICO ACTIVO (ZERO-LAG)'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.headerActions}>
          {onToggleTransitMode && (
            <TouchableOpacity
              style={[styles.transitBtn, isTransitMode && styles.transitBtnActive]}
              activeOpacity={0.75}
              onPress={onToggleTransitMode}
            >
              <ThemedText style={[styles.transitBtnText, isTransitMode && styles.transitBtnTextActive]}>
                {isTransitMode ? '🚗 En Viaje' : '🚶‍♂️ A Pie'}
              </ThemedText>
            </TouchableOpacity>
          )}

          {onOpenCalibration && (
            <TouchableOpacity
              style={styles.calibrationBtn}
              activeOpacity={0.7}
              onPress={onOpenCalibration}
            >
              <ThemedText style={styles.calibrationBtnText}>⚙️ Calibrar</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* CONTADOR PRINCIPAL REAL */}
      <View style={styles.stepsMainRow}>
        <ThemedText style={styles.stepsCountText}>
          {actualSteps.toLocaleString()}
          <ThemedText style={styles.stepsGoalSub}> / {actualGoal.toLocaleString()} pasos</ThemedText>
        </ThemedText>
        <ThemedText style={styles.pctBadgeText}>
          {(progressRatio * 100).toFixed(0)}%
        </ThemedText>
      </View>

      {/* BARRA DE PROGRESO DE ALTA TENSIÓN */}
      <View style={styles.progressBarTrack}>
        <LinearGradient
          colors={progressRatio >= 1 ? ['#059669', '#10B981'] : isPaused ? ['#B45309', '#F59E0B'] : ['#D4AF37', '#F59E0B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBarFill, { width: `${Math.max(4, progressRatio * 100)}%` }]}
        />
      </View>

      {/* TELEMETRÍA BIOMECÁNICA (SOLO DATOS REALES) */}
      <View style={styles.telemetryGrid}>
        <View style={styles.telemetryCol}>
          <ThemedText style={styles.telemetryLabel}>Distancia Real</ThemedText>
          <ThemedText style={styles.telemetryVal}>{km} <ThemedText style={styles.unitText}>km</ThemedText></ThemedText>
        </View>

        <View style={styles.telemetryDivider} />

        <View style={styles.telemetryCol}>
          <ThemedText style={styles.telemetryLabel}>Calorías de Marcha</ThemedText>
          <ThemedText style={styles.telemetryVal}>{kcalBurned} <ThemedText style={styles.unitText}>kcal</ThemedText></ThemedText>
        </View>

        <View style={styles.telemetryDivider} />

        <View style={styles.telemetryCol}>
          <ThemedText style={styles.telemetryLabel}>Tiempo Activo</ThemedText>
          <ThemedText style={styles.telemetryVal}>{activeMinutes} <ThemedText style={styles.unitText}>min</ThemedText></ThemedText>
        </View>
      </View>

      {/* BOTÓN DE SINCRONIZACIÓN INMEDIATA & AVISO ANTI-VEHÍCULO */}
      <TouchableOpacity
        style={[styles.syncButtonRow, justSynced && styles.syncButtonRowActive]}
        activeOpacity={0.8}
        onPress={handleSyncPress}
      >
        <ThemedText style={styles.syncButtonSparkle}>⚡</ThemedText>
        <ThemedText style={[styles.syncButtonText, justSynced && { color: '#FFE259' }]}>
          {justSynced
            ? '¡Lectura de Sensor Sincronizada al Instante!'
            : isPaused
            ? 'Pausado: Baches y velocidad vehicular filtrados. Toca para sincronizar.'
            : 'Filtro Dinámico Anti-Vehículo Activo • Toca para forzar sincronización'}
        </ThemedText>
        <ThemedText style={styles.syncButtonSparkle}>⚡</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(14, 20, 36, 0.94)',
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.38)',
    gap: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardPaused: {
    borderColor: 'rgba(245, 158, 11, 0.45)',
    backgroundColor: 'rgba(20, 16, 28, 0.94)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleGroup: {
    gap: 2,
    flex: 1,
  },
  headerGoldText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#D4AF37',
    letterSpacing: 1.5,
  },
  liveSensorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveDotGreen: {
    backgroundColor: '#10B981',
  },
  liveDotAmber: {
    backgroundColor: '#F59E0B',
  },
  liveSensorText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  liveSensorTextAmber: {
    color: '#FBBF24',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  transitBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  transitBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#F59E0B',
  },
  transitBtnText: {
    fontSize: 9.5,
    color: '#CBD5E1',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  transitBtnTextActive: {
    color: '#FDE68A',
  },
  calibrationBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  calibrationBtnText: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  stepsMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  stepsCountText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  stepsGoalSub: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: 'normal',
  },
  pctBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#D4AF37',
    fontFamily: 'monospace',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  telemetryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.12)',
  },
  telemetryCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  telemetryDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  telemetryLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  telemetryVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  unitText: {
    fontSize: 9.5,
    color: '#94A3B8',
  },
  syncButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    gap: 6,
  },
  syncButtonRowActive: {
    backgroundColor: 'rgba(255, 226, 89, 0.2)',
    borderColor: '#FFE259',
  },
  syncButtonSparkle: {
    fontSize: 12,
    color: '#FFE259',
  },
  syncButtonText: {
    fontSize: 9.5,
    color: '#E2E8F0',
    fontFamily: 'monospace',
    textAlign: 'center',
    flex: 1,
  },
});
