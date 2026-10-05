import React from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';

interface LockedDiplomaModalProps {
  visible: boolean;
  onClose: () => void;
  isDay30Reached: boolean;
  currentDay: number;
  isAboveThreshold: boolean;
  adherencePercent: number;
  victoriousDays: number;
  styles: any;
}

export function LockedDiplomaModal({
  visible,
  onClose,
  isDay30Reached,
  currentDay,
  isAboveThreshold,
  adherencePercent,
  victoriousDays,
  styles,
}: LockedDiplomaModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { borderColor: '#F59E0B' }]}>
          <ThemedText style={styles.modalEmblem}>🔒</ThemedText>
          <ThemedText style={[styles.modalTitle, { color: '#FFE259' }]}>
            DIPLOMA EN EVALUACIÓN
          </ThemedText>
          <ThemedText style={{ fontSize: 9.5, color: '#94A3B8', fontFamily: 'monospace', letterSpacing: 1 }}>
            REQUISITO SAGRADO DEL DÍA 30
          </ThemedText>

          <ThemedText style={styles.modalMessage}>
            Para consagrar tu nombre en el <ThemedText style={{ color: '#FFE259', fontWeight: 'bold' }}>Diploma de Honor Estoico</ThemedText> y recibir la <ThemedText style={{ color: '#38BDF8', fontWeight: 'bold' }}>Evaluación Final del Coach</ThemedText>, debes cumplir los dos requisitos inmutables:
          </ThemedText>

          <View style={styles.lockedModalReqsBox}>
            <View style={styles.lockedReqRow}>
              <Ionicons
                name={isDay30Reached ? "checkmark-circle" : "time-outline"}
                size={18}
                color={isDay30Reached ? "#10B981" : "#38BDF8"}
              />
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.lockedReqTitle}>1. Finalizar los 30 Días de la Evaluación</ThemedText>
                <ThemedText style={styles.lockedReqDesc}>
                  Progreso actual: Día {currentDay} de 30 ({30 - currentDay > 0 ? `${30 - currentDay} días restantes` : 'Completado'})
                </ThemedText>
              </View>
            </View>

            <View style={styles.lockedReqRow}>
              <Ionicons
                name={isAboveThreshold ? "checkmark-circle" : "alert-circle-outline"}
                size={18}
                color={isAboveThreshold ? "#10B981" : "#F59E0B"}
              />
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.lockedReqTitle}>2. Alcanzar al menos el 80% de Días Gobernados</ThemedText>
                <ThemedText style={styles.lockedReqDesc}>
                  Actual: {adherencePercent}% ({victoriousDays} de 24 días mínimos requeridos)
                </ThemedText>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.closeLockedModalBtn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <ThemedText style={styles.closeLockedModalBtnText}>ENTENDIDO, SEGUIR ENTRENANDO</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
