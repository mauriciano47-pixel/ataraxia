import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, Modal } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { estimateStepMetrics } from '@/lib/fitnessCalculator';
import { FootstepsIcon, SettingsIcon, MapIcon, FlameIcon } from '@/components/ModuleSvgIcons';

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
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconBadge}>
            <FootstepsIcon color="#FFD54F" size={20} />
          </View>
          <View>
            <ThemedText style={styles.titleText}>Contador de Pasos</ThemedText>
            <ThemedText style={styles.subtitleText}>Actividad NeAT & Movilidad</ThemedText>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.goalButton} 
          onPress={() => {
            setCustomGoalInput(stepGoal.toString());
            setModalVisible(true);
          }}
        >
          <SettingsIcon color="#A0AEC0" size={14} />
          <ThemedText style={styles.goalButtonText}>Meta: {stepGoal.toLocaleString()}</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Main Step Stats */}
      <View style={styles.statsMainRow}>
        <View>
          <ThemedText style={styles.bigStepsCount}>{steps.toLocaleString()}</ThemedText>
          <ThemedText style={styles.stepsTargetSub}>de {stepGoal.toLocaleString()} pasos ({progressPct}%)</ThemedText>
        </View>

        <View style={styles.metricsBadgeColumn}>
          <View style={styles.metricBadge}>
            <MapIcon color="#38BDF8" size={14} />
            <ThemedText style={styles.metricBadgeValue}>{km} km</ThemedText>
          </View>
          <View style={styles.metricBadge}>
            <FlameIcon color="#FF6F00" size={14} />
            <ThemedText style={styles.metricBadgeValue}>{caloriesBurned} kcal</ThemedText>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
      </View>

      {/* Quick Add Buttons */}
      <View style={styles.quickAddRow}>
        <TouchableOpacity style={styles.addStepChip} onPress={() => onAddSteps(500)}>
          <ThemedText style={styles.chipText}>+500</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addStepChip} onPress={() => onAddSteps(1000)}>
          <ThemedText style={styles.chipText}>+1.000</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addStepChip} onPress={() => onAddSteps(2500)}>
          <ThemedText style={styles.chipText}>+2.500</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.addStepChip, styles.addStepChipAccent]} onPress={() => onAddSteps(5000)}>
          <ThemedText style={[styles.chipText, styles.chipTextAccent]}>+5.000</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Goal Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Ajustar Meta Diaria de Pasos</ThemedText>
            <ThemedText style={styles.modalSub}>Selecciona tu objetivo diario de movilidad activa:</ThemedText>

            <TextInput
              style={styles.modalInput}
              value={customGoalInput}
              onChangeText={setCustomGoalInput}
              keyboardType="number-pad"
              placeholder="Ej: 10000"
              placeholderTextColor="#666"
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <ThemedText style={{ color: '#AAA' }}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveGoal}>
                <ThemedText style={{ color: '#FFF', fontWeight: 'bold' }}>Guardar Meta</ThemedText>
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
    backgroundColor: 'rgba(16, 16, 22, 0.88)',
    borderRadius: 8,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)', // Oro Imperial
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  titleText: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 10.5,
    color: '#A0A4B0',
    fontFamily: 'monospace',
  },
  goalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(30, 30, 38, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  goalButtonText: {
    fontSize: 10.5,
    color: '#D4AF37',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  statsMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.two,
  },
  bigStepsCount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#D4AF37', // Oro Imperial
    lineHeight: 36,
    fontFamily: 'monospace',
  },
  stepsTargetSub: {
    fontSize: 11,
    color: '#A0A4B0',
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
    gap: 4,
    backgroundColor: 'rgba(25, 25, 32, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricBadgeValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#E2E8F0',
    fontFamily: 'monospace',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 4,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  addStepChip: {
    flex: 1,
    backgroundColor: 'rgba(25, 25, 32, 0.8)',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  addStepChipAccent: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  chipText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#D1D5DB',
    fontFamily: 'monospace',
  },
  chipTextAccent: {
    color: '#D4AF37',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: '#374151',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: Spacing.three,
  },
  modalInput: {
    backgroundColor: '#111827',
    color: '#FFF',
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: Spacing.three,
    textAlign: 'center',
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
    backgroundColor: '#FF6F00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
