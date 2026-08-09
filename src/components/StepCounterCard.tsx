import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { estimateStepMetrics } from '@/lib/fitnessCalculator';
import { FootstepsIcon, SettingsIcon, MapIcon, FlameIcon } from '@/components/ModuleSvgIcons';
import { usePedometerSensor } from '@/hooks/usePedometerSensor';

interface StepCounterCardProps {
  steps: number;
  stepGoal: number;
  onAddSteps: (amount: number) => void;
  onSetStepGoal: (goal: number) => void;
}

export function StepCounterCard({
  steps = 0,
  stepGoal = 10000,
  onAddSteps,
  onSetStepGoal,
}: StepCounterCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState(stepGoal.toString());

  // Sensor for real step detection and live tracking
  const { isLiveTracking, toggleLiveTracking, liveSessionSteps } = usePedometerSensor((addedSteps) => {
    onAddSteps(addedSteps);
  });

  const progressPct = Math.min(100, Math.round((steps / stepGoal) * 100));
  const { km, caloriesBurned } = estimateStepMetrics(steps);

  const handleSaveGoal = () => {
    const parsed = parseInt(customGoalInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onSetStepGoal(parsed);
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.cardContainer}>
      {/* HEADER ROW */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.iconBadge, isLiveTracking && styles.iconBadgeActive]}>
            <FootstepsIcon color={isLiveTracking ? '#00C6FF' : '#E2C068'} size={20} />
          </View>
          <View>
            <ThemedText style={styles.titleText}>CONTADOR DE PASOS EN VIVO</ThemedText>
            <ThemedText style={styles.subtitleText}>Podómetro Real & Acelerómetro NeAT</ThemedText>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.goalButton} 
          onPress={() => {
            setCustomGoalInput(stepGoal.toString());
            setModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <SettingsIcon color="#C5A869" size={13} />
          <ThemedText style={styles.goalButtonText}>Meta: {stepGoal.toLocaleString()}</ThemedText>
        </TouchableOpacity>
      </View>

      {/* MAIN STEP STATS */}
      <View style={styles.statsMainRow}>
        <View>
          <ThemedText style={styles.bigStepsCount}>{steps.toLocaleString()}</ThemedText>
          <ThemedText style={styles.stepsTargetSub}>
            de {stepGoal.toLocaleString()} pasos ({progressPct}%)
          </ThemedText>
        </View>

        <View style={styles.metricsBadgeColumn}>
          <View style={styles.metricBadge}>
            <MapIcon color="#D4AF37" size={14} />
            <ThemedText style={styles.metricBadgeValue}>{km} km</ThemedText>
          </View>
          <View style={styles.metricBadge}>
            <FlameIcon color="#F59E0B" size={14} />
            <ThemedText style={styles.metricBadgeValue}>{caloriesBurned} kcal</ThemedText>
          </View>
        </View>
      </View>

      {/* PROGRESS BAR WITH IMPERIAL GOLD THUNDER GRADIENT */}
      <View style={styles.progressBarTrack}>
        <LinearGradient
          colors={['#B45309', '#D4AF37', '#F59E0B', '#FFE066']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBarFill, { width: `${progressPct}%` }]}
        />
      </View>

      {/* LIVE PEDOMETER TOGGLE BUTTON */}
      <TouchableOpacity
        style={[styles.livePedometerBtn, isLiveTracking && styles.livePedometerBtnActive]}
        onPress={toggleLiveTracking}
        activeOpacity={0.85}
      >
        <View style={styles.liveIndicatorDotRow}>
          <View style={[styles.pulseDot, isLiveTracking ? styles.pulseDotActive : styles.pulseDotInactive]} />
          <ThemedText style={[styles.liveBtnText, isLiveTracking && styles.liveBtnTextActive]}>
            {isLiveTracking ? 'Podómetro en Vivo: ACTIVO 🟢' : '⚡ Activar Podómetro en Vivo ⚪'}
          </ThemedText>
        </View>
        {isLiveTracking && (
          <ThemedText style={styles.liveSessionSubtext}>
            +{liveSessionSteps} pasos detectados en tiempo real
          </ThemedText>
        )}
      </TouchableOpacity>

      {/* QUICK ADD STEP CHIPS */}
      <View style={styles.quickAddRow}>
        <TouchableOpacity style={styles.addStepChip} onPress={() => onAddSteps(500)} activeOpacity={0.8}>
          <ThemedText style={styles.chipText}>+500</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addStepChip} onPress={() => onAddSteps(1000)} activeOpacity={0.8}>
          <ThemedText style={styles.chipText}>+1.000</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addStepChip} onPress={() => onAddSteps(2500)} activeOpacity={0.8}>
          <ThemedText style={styles.chipText}>+2.500</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.addStepChip, styles.addStepChipAccent]} onPress={() => onAddSteps(5000)} activeOpacity={0.8}>
          <ThemedText style={[styles.chipText, styles.chipTextAccent]}>+5.000</ThemedText>
        </TouchableOpacity>
      </View>

      {/* GOAL ADJUSTMENT MODAL (IMPERIAL GOLD & ONYX STYLE) */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>⚡ Ajustar Meta Diaria de Pasos</ThemedText>
            <ThemedText style={styles.modalSub}>Define tu objetivo personal de movilidad estoica:</ThemedText>

            <TextInput
              style={styles.modalInput}
              value={customGoalInput}
              onChangeText={setCustomGoalInput}
              keyboardType="number-pad"
              placeholder="Ej: 10000"
              placeholderTextColor="#64748B"
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)} activeOpacity={0.8}>
                <ThemedText style={{ color: '#94A3B8', fontFamily: 'monospace' }}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveGoal} activeOpacity={0.8}>
                <ThemedText style={{ color: '#050507', fontWeight: 'bold', fontFamily: 'monospace' }}>Guardar Meta</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 145, 0, 0.40)',
    gap: Spacing.two,
    shadowColor: '#FF9100',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 145, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 145, 0, 0.35)',
  },
  iconBadgeActive: {
    backgroundColor: 'rgba(0, 198, 255, 0.15)',
    borderColor: '#00C6FF',
  },
  titleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF9100',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  subtitleText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  goalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.40)',
  },
  goalButtonText: {
    fontSize: 11,
    color: '#FDE68A',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  statsMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  bigStepsCount: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 38,
    fontFamily: 'serif',
  },
  stepsTargetSub: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  metricsBadgeColumn: {
    gap: 6,
    alignItems: 'flex-end',
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(13, 17, 28, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  metricBadgeValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F8FAFC',
    fontFamily: 'monospace',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  livePedometerBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.80)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  livePedometerBtnActive: {
    backgroundColor: 'rgba(0, 198, 255, 0.15)',
    borderColor: '#00C6FF',
  },
  liveIndicatorDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pulseDotActive: {
    backgroundColor: '#00E676',
  },
  pulseDotInactive: {
    backgroundColor: '#94A3B8',
  },
  liveBtnText: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#CBD5E1',
    fontFamily: 'monospace',
  },
  liveBtnTextActive: {
    color: '#00C6FF',
  },
  liveSessionSubtext: {
    fontSize: 10,
    color: '#00C6FF',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  addStepChip: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  addStepChipAccent: {
    backgroundColor: 'rgba(226, 192, 104, 0.15)',
    borderColor: '#E2C068',
  },
  chipText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  chipTextAccent: {
    color: '#E2C068',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 11, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0E1424',
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 192, 104, 0.40)',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#E2C068',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  modalSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: Spacing.three,
    fontFamily: 'sans-serif',
  },
  modalInput: {
    backgroundColor: '#161F33',
    color: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: 'rgba(226, 192, 104, 0.30)',
    marginBottom: Spacing.three,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  saveBtn: {
    backgroundColor: '#E2C068',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
