import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, Modal } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
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
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(0, 82, 255, 0.15)',
    gap: Spacing.two,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 82, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitleText: {
    fontSize: 11,
    color: '#64748B',
  },
  goalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 82, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 82, 255, 0.15)',
  },
  goalButtonText: {
    fontSize: 11,
    color: '#0052FF',
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0F172A',
    lineHeight: 36,
    fontFamily: 'monospace',
  },
  stepsTargetSub: {
    fontSize: 11,
    color: '#64748B',
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
    backgroundColor: 'rgba(0, 82, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 82, 255, 0.12)',
  },
  metricBadgeValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
    fontFamily: 'monospace',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(0, 82, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0052FF',
    borderRadius: 4,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  addStepChip: {
    flex: 1,
    backgroundColor: 'rgba(0, 82, 255, 0.04)',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 82, 255, 0.10)',
  },
  addStepChipAccent: {
    backgroundColor: 'rgba(0, 82, 255, 0.12)',
    borderWidth: 1,
    borderColor: '#0052FF',
  },
  chipText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748B',
    fontFamily: 'monospace',
  },
  chipTextAccent: {
    color: '#0052FF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.60)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(0, 82, 255, 0.20)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: Spacing.three,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: 'rgba(0, 82, 255, 0.20)',
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
    backgroundColor: '#0052FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
