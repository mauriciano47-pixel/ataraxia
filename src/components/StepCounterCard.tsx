import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

interface StepCounterCardProps {
  currentSteps: number;
  goal: number;
  onOpenCalibration?: () => void;
}

export function StepCounterCard({
  currentSteps,
  goal,
  onOpenCalibration,
}: StepCounterCardProps) {
  const progressRatio = goal > 0 ? Math.min(1, currentSteps / goal) : 0;
  const km = (currentSteps * 0.00075).toFixed(2);
  const kcalBurned = Math.round(currentSteps * 0.045);
  const activeMinutes = Math.round(currentSteps / 110);

  return (
    <View style={styles.card}>
      {/* CABECERA */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <ThemedText style={styles.headerGoldText}>👟 PODÓMETRO BIOMECÁNICO 24/7</ThemedText>
          <View style={styles.liveSensorRow}>
            <View style={styles.liveGreenDot} />
            <ThemedText style={styles.liveSensorText}>SENSOR DE MOVIMIENTO ACTIVO</ThemedText>
          </View>
        </View>

        {onOpenCalibration && (
          <TouchableOpacity
            style={styles.calibrationBtn}
            activeOpacity={0.7}
            onPress={onOpenCalibration}
          >
            <ThemedText style={styles.calibrationBtnText}>⚙️ Calibrar Sensor</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* CONTADOR PRINCIPAL REAL */}
      <View style={styles.stepsMainRow}>
        <ThemedText style={styles.stepsCountText}>
          {currentSteps.toLocaleString()}
          <ThemedText style={styles.stepsGoalSub}> / {goal.toLocaleString()} pasos</ThemedText>
        </ThemedText>
        <ThemedText style={styles.pctBadgeText}>
          {(progressRatio * 100).toFixed(0)}%
        </ThemedText>
      </View>

      {/* BARRA DE PROGRESO DE ALTA TENSIÓN */}
      <View style={styles.progressBarTrack}>
        <LinearGradient
          colors={progressRatio >= 1 ? ['#059669', '#10B981'] : ['#D4AF37', '#F59E0B']}
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

      {/* AVISO DE HONOR ESTOICO */}
      <View style={styles.honorNoticeBox}>
        <ThemedText style={styles.honorNoticeText}>
          ⚔️ "Los pasos se ganan con los pies en la tierra; el templo no admite atajos ni trampas."
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(14, 20, 36, 0.92)',
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    gap: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleGroup: {
    gap: 2,
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
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveSensorText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  calibrationBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  calibrationBtnText: {
    fontSize: 10,
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
  honorNoticeBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  honorNoticeText: {
    fontSize: 10,
    color: '#CBD5E1',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
