import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

interface StoicAuditModalProps {
  visible: boolean;
  onClose: () => void;
  exerciseName: string;
  declaredRpe: number;
  recordedBpm?: number;
  onConfirmRpe: (calibratedRpe: number) => void;
  onOpenHeartRateScanner?: () => void;
}

export function StoicAuditModal({
  visible,
  onClose,
  exerciseName,
  declaredRpe,
  recordedBpm = 0,
  onConfirmRpe,
  onOpenHeartRateScanner,
}: StoicAuditModalProps) {
  const isSuspiciousLowBpm = recordedBpm > 0 && recordedBpm < 115;
  const isHighBpm = recordedBpm >= 115;

  const handleSelect = (rpe: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onConfirmRpe(rpe);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#161922', '#0A0C10']}
            style={styles.cardGradient}
          >
            {/* Encabezado */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <ThemedText style={styles.headerIcon}>🏛️</ThemedText>
              </View>
              <ThemedText style={styles.title}>Auditoría Estoica</ThemedText>
              <ThemedText style={styles.subtitle}>
                «Vencer el autoengaño es la primera victoria»
              </ThemedText>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              {/* Badge del Ejercicio */}
              <View style={styles.exerciseBadge}>
                <ThemedText style={styles.exerciseNameText} numberOfLines={1}>
                  {exerciseName}
                </ThemedText>
                <View style={styles.rpeTag}>
                  <ThemedText style={styles.rpeTagText}>
                    RPE {declaredRpe} — Fallo Absoluto
                  </ThemedText>
                </View>
              </View>

              {/* Texto de Confrontación Socrática */}
              <View style={styles.reflectionBox}>
                <ThemedText style={styles.reflectionText}>
                  Has declarado un <ThemedText style={styles.boldGold}>RPE {declaredRpe}</ThemedText> (incapacidad miofibrilar total). En Ataraxia buscamos la <ThemedText style={styles.boldGold}>verdad biológica sin autoengaño</ThemedText>.
                </ThemedText>
                <ThemedText style={styles.socraticQuote}>
                  «¿Fue verdaderamente un fallo mecánico de las fibras musculares, o cedió la mente antes que el cuerpo?» — Epicteto.
                </ThemedText>
              </View>

              {/* Cruce con Telemetría / BPM */}
              <View style={styles.telemetryCard}>
                <View style={styles.telemetryRow}>
                  <ThemedText style={styles.telemetryIcon}>🫀</ThemedText>
                  <View style={styles.telemetryTexts}>
                    <ThemedText style={styles.telemetryTitle}>
                      Telemetría Cardíaca
                    </ThemedText>
                    <ThemedText style={styles.telemetryBpm}>
                      {recordedBpm > 0 ? `${recordedBpm} BPM en reposo/serie` : 'Sin lectura reciente'}
                    </ThemedText>
                  </View>
                </View>

                {isSuspiciousLowBpm && (
                  <View style={styles.warningBox}>
                    <ThemedText style={styles.warningText}>
                      ⚠️ **Alerta de Incongruencia**: Tus pulsaciones ({recordedBpm} BPM) están inusualmente bajas para un fallo extremo. Recuerda que no necesitas exagerar la fatiga para justificar tu valor.
                    </ThemedText>
                  </View>
                )}

                {isHighBpm && (
                  <View style={styles.verifiedBox}>
                    <ThemedText style={styles.verifiedText}>
                      ✅ **Estrés Fisiológico Elevado**: Ritmo cardíaco coherente con un esfuerzo de alta demanda.
                    </ThemedText>
                  </View>
                )}

                {onOpenHeartRateScanner && (
                  <TouchableOpacity
                    style={styles.ppgButton}
                    onPress={() => {
                      onClose();
                      onOpenHeartRateScanner();
                    }}
                    activeOpacity={0.8}
                  >
                    <ThemedText style={styles.ppgButtonText}>
                      📸 Validar Pulso Instantáneo con Cámara (PPG)
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>

              {/* Opciones de Calibración Honesta */}
              <ThemedText style={styles.optionsTitle}>
                Calibra tu Esfuerzo con Honestidad Estoica:
              </ThemedText>

              <TouchableOpacity
                style={[styles.choiceButton, styles.choiceButtonRpe10]}
                onPress={() => handleSelect(10)}
                activeOpacity={0.85}
              >
                <ThemedText style={styles.choiceTitle}>
                  🔥 Reafirmar RPE 10 (Con Honor Estoico)
                </ThemedText>
                <ThemedText style={styles.choiceDesc}>
                  Incapacidad total. Ni con una espada al cuello salía media repetición más.
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.choiceButton, styles.choiceButtonRpe9]}
                onPress={() => handleSelect(9)}
                activeOpacity={0.85}
              >
                <ThemedText style={styles.choiceTitle}>
                  🎯 Calibrar a RPE 9 (RIR 1)
                </ThemedText>
                <ThemedText style={styles.choiceDesc}>
                  Esfuerzo colosal, pero reconozco con madurez que quedaba 1 repetición en reserva.
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.choiceButton, styles.choiceButtonRpe8]}
                onPress={() => handleSelect(8)}
                activeOpacity={0.85}
              >
                <ThemedText style={styles.choiceTitle}>
                  ⚖️ Calibrar a RPE 8 (RIR 2)
                </ThemedText>
                <ThemedText style={styles.choiceDesc}>
                  Excelente intensidad técnica sin rozar el colapso del sistema nervioso.
                </ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  container: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#D4AF37', // Acento Dorado Real
  },
  cardGradient: {
    flex: 1,
    padding: Spacing.four,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  headerIcon: {
    fontSize: 26,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#A0AEC0',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 2,
  },
  content: {
    paddingBottom: Spacing.three,
  },
  exerciseBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: Spacing.three,
    alignItems: 'center',
  },
  exerciseNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F7FAFC',
    textAlign: 'center',
  },
  rpeTag: {
    marginTop: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  rpeTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FCA5A5',
    textTransform: 'uppercase',
  },
  reflectionBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    padding: Spacing.three,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
    marginBottom: Spacing.three,
  },
  reflectionText: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
    marginBottom: 6,
  },
  boldGold: {
    color: '#D4AF37',
    fontWeight: '700',
  },
  socraticQuote: {
    fontSize: 12,
    color: '#CBD5E0',
    fontStyle: 'italic',
    lineHeight: 17,
  },
  telemetryCard: {
    backgroundColor: 'rgba(10, 15, 25, 0.7)',
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: Spacing.three,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  telemetryIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  telemetryTexts: {
    flex: 1,
  },
  telemetryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F7FAFC',
  },
  telemetryBpm: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 1,
  },
  warningBox: {
    marginTop: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    padding: Spacing.two,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningText: {
    fontSize: 12,
    color: '#FDE68A',
    lineHeight: 16,
  },
  verifiedBox: {
    marginTop: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: Spacing.two,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  verifiedText: {
    fontSize: 12,
    color: '#A7F3D0',
    lineHeight: 16,
  },
  ppgButton: {
    marginTop: 10,
    backgroundColor: 'rgba(0, 195, 255, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00C3FF',
    alignItems: 'center',
  },
  ppgButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
  optionsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: Spacing.two,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  choiceButton: {
    padding: Spacing.three,
    borderRadius: 12,
    marginBottom: Spacing.two,
    borderWidth: 1,
  },
  choiceButtonRpe10: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  choiceButtonRpe9: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  choiceButtonRpe8: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  choiceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  choiceDesc: {
    fontSize: 11,
    color: '#CBD5E0',
    lineHeight: 15,
  },
});
