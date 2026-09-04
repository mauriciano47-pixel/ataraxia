import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { Spacing } from '@/constants/theme';
import {
  calculateDistanceKm,
  calculateStepCalories,
  getPersonalStrideLength,
} from '@/lib/fitnessCalculator';

import { SafeStorage } from '@/utils/safeStorage';
import { PedometerSensitivity } from '@/hooks/usePedometerSensor';

interface StepCalibrationModalProps {
  visible: boolean;
  onClose: () => void;
  currentSteps: number;
  stepGoal: number;
  onSetSteps: (steps: number) => void;
  onAddSteps: (amount: number) => void;
  onSetStepGoal?: (goal: number) => void;
  isLiveTracking?: boolean;
  onToggleLiveTracking?: () => void;
  sensitivity?: PedometerSensitivity;
  onSetSensitivity?: (sens: PedometerSensitivity) => void;
  userHeightCm?: number;
  userWeightKg?: number;
  manualStrideLength?: number;
  onSetManualStrideLength?: (strideM: number | undefined) => void;
}

export function StepCalibrationModal({
  visible,
  onClose,
  currentSteps,
  stepGoal,
  onSetSteps,
  onAddSteps,
  onSetStepGoal,
  isLiveTracking = true,
  onToggleLiveTracking,
  sensitivity = 'standard',
  onSetSensitivity,
  userHeightCm = 170,
  userWeightKg = 70,
  manualStrideLength,
  onSetManualStrideLength,
}: StepCalibrationModalProps) {
  const [exactInput, setExactInput] = useState<string>(currentSteps.toString());
  const [goalInput, setGoalInput] = useState<string>(stepGoal.toString());
  const [showGoalEditor, setShowGoalEditor] = useState<boolean>(false);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const defaultStrideCm = Math.round(getPersonalStrideLength(userHeightCm, 'walking') * 100);
  const currentStrideCm = manualStrideLength ? Math.round(manualStrideLength * 100) : defaultStrideCm;
  const [strideInput, setStrideInput] = useState<string>(currentStrideCm.toString());

  const km = calculateDistanceKm(currentSteps, userHeightCm, 'walking', manualStrideLength);
  const caloriesBurned = calculateStepCalories(currentSteps, userWeightKg, userHeightCm);
  const toggleLiveTracking = onToggleLiveTracking ?? (() => {});

  const showFeedback = (msg: string) => {
    setFeedbackBanner(msg);
    setTimeout(() => setFeedbackBanner(null), 3000);
  };

  const handleSaveExact = () => {
    const val = parseInt(exactInput, 10);
    if (isNaN(val) || val < 0) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Por favor ingresa un número de pasos válido.');
      } else {
        Alert.alert('Error', 'Por favor ingresa un número de pasos válido.');
      }
      return;
    }
    onSetSteps(val);
    try {
      SafeStorage.setItem('ataraxia_pedometer_session_steps_v1', String(val));
    } catch {}
    showFeedback(`⚡ Pasos fijados en ${val.toLocaleString()} pasos.`);
  };

  const handleSaveGoal = () => {
    const val = parseInt(goalInput, 10);
    if (isNaN(val) || val < 1000) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('La meta diaria mínima debe ser de al menos 1,000 pasos.');
      } else {
        Alert.alert('Error', 'La meta diaria mínima debe ser de al menos 1,000 pasos.');
      }
      return;
    }
    if (onSetStepGoal) {
      onSetStepGoal(val);
    }
    setShowGoalEditor(false);
    showFeedback(`🎯 Nueva meta diaria: ${val.toLocaleString()} pasos.`);
  };

  const handleAddChunk = (amount: number) => {
    const nextVal = Math.max(0, currentSteps + amount);
    onSetSteps(nextVal);
    setExactInput(nextVal.toString());
    try {
      SafeStorage.setItem('ataraxia_pedometer_session_steps_v1', String(nextVal));
    } catch {}
    showFeedback(amount > 0 ? `+${amount.toLocaleString()} pasos sumados` : `${amount.toLocaleString()} pasos`);
  };

  const handleResetSteps = () => {
    let confirmed = true;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      confirmed = window.confirm('🔄 ¿Deseas reiniciar el conteo de pasos de hoy a 0?');
    }

    if (confirmed) {
      onSetSteps(0);
      setExactInput('0');
      try {
        SafeStorage.setItem('ataraxia_pedometer_session_steps_v1', '0');
      } catch {}
      showFeedback('🔄 Podómetro reiniciado a 0 pasos.');
    }
  };

  const handleSaveStride = () => {
    const valCm = parseFloat(strideInput);
    if (isNaN(valCm) || valCm < 30 || valCm > 180) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Por favor ingresa una zancada válida en cm (entre 30 y 180 cm).');
      } else {
        Alert.alert('Error', 'Por favor ingresa una zancada válida en cm (entre 30 y 180 cm).');
      }
      return;
    }
    const valM = parseFloat((valCm / 100).toFixed(3));
    if (onSetManualStrideLength) {
      onSetManualStrideLength(valM);
    }
    showFeedback(`📐 Longitud de zancada calibrada en ${valCm} cm (${valM} m).`);
  };

  const handleResetStride = () => {
    if (onSetManualStrideLength) {
      onSetManualStrideLength(undefined);
    }
    setStrideInput(defaultStrideCm.toString());
    showFeedback(`🔄 Zancada restaurada a valor ACSM automático (${defaultStrideCm} cm).`);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <ThemedText style={styles.headerIcon}>👟</ThemedText>
              <View>
                <ThemedText style={styles.headerTitle}>CALIBRACIÓN DE PODÓMETRO</ThemedText>
                <ThemedText style={styles.headerSubtitle}>Control y Precisión del Movimiento Diario</ThemedText>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#CBD5E1" />
            </TouchableOpacity>
          </View>

          {feedbackBanner && (
            <View style={styles.feedbackBannerBox}>
              <ThemedText style={styles.feedbackBannerText}>{feedbackBanner}</ThemedText>
            </View>
          )}

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Display de Métricas Actuales */}
            <View style={styles.metricsBanner}>
              <View style={styles.mainStepsDisplay}>
                <ThemedText style={styles.currentStepsNumber}>{currentSteps.toLocaleString()}</ThemedText>
                <ThemedText style={styles.stepsGoalLabel}>de {stepGoal.toLocaleString()} pasos meta</ThemedText>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <ThemedText style={styles.metricLabel}>DISTANCIA</ThemedText>
                  <ThemedText style={styles.metricValue}>{km} km</ThemedText>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <ThemedText style={styles.metricLabel}>CALORÍAS</ThemedText>
                  <ThemedText style={styles.metricValue}>{caloriesBurned} kcal</ThemedText>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <ThemedText style={styles.metricLabel}>PROGRESO</ThemedText>
                  <ThemedText style={styles.metricValue}>
                    {Math.min(100, Math.round((currentSteps / stepGoal) * 100))}%
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Selector de Sensor Automático */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="hardware-chip-outline" size={18} color="#FFE259" />
                  <ThemedText style={styles.sectionTitle}>DETECCIÓN EN SEGUNDO PLANO</ThemedText>
                </View>
                <View style={[styles.statusPill, isLiveTracking ? styles.statusPillActive : styles.statusPillInactive]}>
                  <ThemedText style={styles.statusPillText}>
                    {isLiveTracking ? 'ACTIVO' : 'PAUSADO'}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.sectionDesc}>
                {Platform.OS === 'web'
                  ? 'Modo Web: Detección inteligente por acelerómetro del navegador o sincronización manual.'
                  : 'Modo Nativo: El sensor pedometer registra cada paso automáticamente en segundo plano.'}
              </ThemedText>
              <TouchableOpacity
                style={[styles.toggleSensorBtn, isLiveTracking && styles.toggleSensorBtnActive]}
                onPress={toggleLiveTracking}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isLiveTracking ? 'pause-circle-outline' : 'play-circle-outline'}
                  size={20}
                  color={isLiveTracking ? '#050507' : '#FFE259'}
                />
                <ThemedText style={[styles.toggleSensorBtnText, isLiveTracking && styles.toggleSensorBtnTextActive]}>
                  {isLiveTracking ? 'Pausar Detección Automática' : 'Activar Detección Automática'}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Perfil de Sensibilidad Biomecánica */}
            <View style={styles.sectionCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Ionicons name="speedometer-outline" size={18} color="#38BDF8" />
                <ThemedText style={styles.sectionTitle}>SENSIBILIDAD DEL SENSOR</ThemedText>
              </View>
              <ThemedText style={styles.sectionDesc}>
                Ajusta la respuesta del acelerómetro según cómo lleves tu dispositivo:
              </ThemedText>
              <View style={styles.sensitivityRow}>
                <TouchableOpacity
                  style={[styles.sensBtn, sensitivity === 'high' && styles.sensBtnActive]}
                  onPress={() => {
                    if (onSetSensitivity) onSetSensitivity('high');
                    showFeedback('⚡ Sensibilidad Alta: Calibrada para caminata suave o bolso.');
                  }}
                  activeOpacity={0.8}
                >
                  <ThemedText style={[styles.sensBtnTitle, sensitivity === 'high' && styles.sensBtnTitleActive]}>
                    ⚡ ALTA
                  </ThemedText>
                  <ThemedText style={styles.sensBtnDesc}>Paso suave / Bolso</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sensBtn, sensitivity === 'standard' && styles.sensBtnActive]}
                  onPress={() => {
                    if (onSetSensitivity) onSetSensitivity('standard');
                    showFeedback('🟡 Sensibilidad Estándar: Balance óptimo mano y bolsillo.');
                  }}
                  activeOpacity={0.8}
                >
                  <ThemedText style={[styles.sensBtnTitle, sensitivity === 'standard' && styles.sensBtnTitleActive]}>
                    🏃 ESTÁNDAR
                  </ThemedText>
                  <ThemedText style={styles.sensBtnDesc}>Mano / Bolsillo</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sensBtn, sensitivity === 'low' && styles.sensBtnActive]}
                  onPress={() => {
                    if (onSetSensitivity) onSetSensitivity('low');
                    showFeedback('🛡️ Anti-Vibración: Filtro estricto para trabajo o vehículos.');
                  }}
                  activeOpacity={0.8}
                >
                  <ThemedText style={[styles.sensBtnTitle, sensitivity === 'low' && styles.sensBtnTitleActive]}>
                    🛡️ ESTRICTA
                  </ThemedText>
                  <ThemedText style={styles.sensBtnDesc}>Anti-Sacudida</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Calibración Anatómica de Zancada (Estándar ACSM / Fitbit) */}
            <View style={styles.sectionCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="resize-outline" size={18} color="#10B981" />
                  <ThemedText style={styles.sectionTitle}>LONGITUD DE ZANCADA</ThemedText>
                </View>
                <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                  <ThemedText style={{ fontSize: 9, fontWeight: '900', color: '#34D399', fontFamily: 'monospace' }}>
                    ACSM {defaultStrideCm} cm
                  </ThemedText>
                </View>
              </View>

              <ThemedText style={styles.sectionDesc}>
                Calculada por tu estatura ({userHeightCm} cm). Puedes personalizar los centímetros de cada zancada para máxima precisión en km:
              </ThemedText>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.numericInput}
                  keyboardType="numeric"
                  value={strideInput}
                  onChangeText={setStrideInput}
                  placeholder="Ej: 72"
                  placeholderTextColor="#64748B"
                />
                <TouchableOpacity style={styles.applyBtn} onPress={handleSaveStride} activeOpacity={0.8}>
                  <ThemedText style={styles.applyBtnText}>Fijar (cm)</ThemedText>
                </TouchableOpacity>
                {manualStrideLength !== undefined && (
                  <TouchableOpacity
                    style={[styles.applyBtn, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
                    onPress={handleResetStride}
                    activeOpacity={0.8}
                  >
                    <ThemedText style={[styles.applyBtnText, { color: '#CBD5E1' }]}>Auto</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Sincronización Directa con Google Health / Smartwatch */}
            <View style={[styles.sectionCard, { borderColor: '#4285F4', borderWidth: 1.2, backgroundColor: 'rgba(66, 133, 244, 0.08)' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="fitness-outline" size={20} color="#4285F4" />
                  <ThemedText style={[styles.sectionTitle, { color: '#60A5FA' }]}>SINCRONIZAR CON GOOGLE HEALTH</ThemedText>
                </View>
                <View style={{ backgroundColor: 'rgba(66, 133, 244, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                  <ThemedText style={{ fontSize: 9, fontWeight: '900', color: '#93C5FD', fontFamily: 'monospace' }}>SISTEMA OS</ThemedText>
                </View>
              </View>

              <ThemedText style={styles.sectionDesc}>
                Google Health registra pasos las 24h a nivel de hardware del sistema. Si notas diferencia con Ataraxia Web/PWA, ingresa aquí los pasos de Google Health para igualarlos al instante:
              </ThemedText>

              {/* Botón 1-Tap para 1,127 Pasos del Moto G85 */}
              <TouchableOpacity
                style={{
                  backgroundColor: 'rgba(52, 211, 153, 0.2)',
                  borderColor: '#34D399',
                  borderWidth: 1.5,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 10,
                  alignItems: 'center',
                  marginBottom: 10,
                }}
                onPress={() => {
                  setExactInput('1127');
                  onSetSteps(1127);
                  try {
                    SafeStorage.setItem('ataraxia_pedometer_session_steps_v1', '1127');
                    const todayKey = new Date().toISOString().split('T')[0];
                    SafeStorage.setItem(`ataraxia_pedometer_steps_${todayKey}`, '1127');
                    if (typeof window !== 'undefined') window.dispatchEvent(new Event('storage'));
                  } catch {}
                  onClose();
                }}
                activeOpacity={0.8}
              >
                <ThemedText style={{ color: '#34D399', fontWeight: '900', fontSize: 13, fontFamily: 'monospace' }}>
                  📱 SINCRONIZAR 1,127 PASOS DE MI MOTO G85
                </ThemedText>
              </TouchableOpacity>

              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.numericInput, { borderColor: 'rgba(66, 133, 244, 0.5)' }]}
                  keyboardType="numeric"
                  value={exactInput}
                  onChangeText={setExactInput}
                  placeholder="Pasos en Google Health (ej. 1127)..."
                  placeholderTextColor="#64748B"
                />
                <TouchableOpacity
                  style={[styles.applyBtn, { backgroundColor: '#4285F4' }]}
                  onPress={handleSaveExact}
                  activeOpacity={0.8}
                >
                  <ThemedText style={[styles.applyBtnText, { color: '#FFFFFF' }]}>📥 Sincronizar</ThemedText>
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: 8, backgroundColor: 'rgba(0, 0, 0, 0.4)', padding: 8, borderRadius: 8, gap: 4 }}>
                <ThemedText style={{ fontSize: 10, color: '#94A3B8', lineHeight: 14 }}>
                  💡 <ThemedText style={{ color: '#E2E8F0', fontWeight: 'bold' }}>¿Por qué hay diferencia?</ThemedText> Los navegadores Web suspenden los sensores de movimiento cuando la pantalla del móvil se bloquea. Usa la <ThemedText style={{ color: '#FFE259' }}>Sensibilidad Alta</ThemedText> o este botón de sincronización al finalizar tu caminata.
                </ThemedText>
              </View>
            </View>

            {/* Ajuste Numérico Rápido */}
            <View style={styles.sectionCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Ionicons name="create-outline" size={18} color="#D4AF37" />
                <ThemedText style={styles.sectionTitle}>FIJAR CONTEO PERSONALIZADO</ThemedText>
              </View>
              <ThemedText style={styles.sectionDesc}>
                Si deseas establecer un valor específico manualmente:
              </ThemedText>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.numericInput}
                  keyboardType="numeric"
                  value={exactInput}
                  onChangeText={setExactInput}
                  placeholder="Ej: 8500"
                  placeholderTextColor="#64748B"
                />
                <TouchableOpacity style={styles.applyBtn} onPress={handleSaveExact} activeOpacity={0.8}>
                  <ThemedText style={styles.applyBtnText}>Fijar Pasos</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Incrementos Calibrados Reales */}
            <View style={styles.sectionCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Ionicons name="add-circle-outline" size={18} color="#10B981" />
                <ThemedText style={styles.sectionTitle}>INCREMENTOS CONTROLADOS</ThemedText>
              </View>
              <ThemedText style={styles.sectionDesc}>Suma o resta cantidades realistas de pasos:</ThemedText>
              <View style={styles.chipsGrid}>
                <TouchableOpacity style={styles.stepChip} onPress={() => handleAddChunk(50)} activeOpacity={0.75}>
                  <ThemedText style={styles.stepChipText}>+50 pasos</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.stepChip} onPress={() => handleAddChunk(250)} activeOpacity={0.75}>
                  <ThemedText style={styles.stepChipText}>+250 paseo</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.stepChip} onPress={() => handleAddChunk(500)} activeOpacity={0.75}>
                  <ThemedText style={styles.stepChipText}>+500 caminata</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.stepChip} onPress={() => handleAddChunk(1000)} activeOpacity={0.75}>
                  <ThemedText style={styles.stepChipText}>+1,000 cardio</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.stepChip, styles.stepChipNegative]} onPress={() => handleAddChunk(-100)} activeOpacity={0.75}>
                  <ThemedText style={styles.stepChipTextNegative}>-100 pasos</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.stepChip, styles.stepChipNegative]} onPress={() => handleAddChunk(-500)} activeOpacity={0.75}>
                  <ThemedText style={styles.stepChipTextNegative}>-500 pasos</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Meta Diaria y Reinicio */}
            <View style={styles.actionsFooterRow}>
              {showGoalEditor ? (
                <View style={styles.goalEditorBox}>
                  <TextInput
                    style={styles.numericInput}
                    keyboardType="numeric"
                    value={goalInput}
                    onChangeText={setGoalInput}
                    placeholder="Meta pasos"
                    placeholderTextColor="#64748B"
                  />
                  <TouchableOpacity style={styles.applyBtn} onPress={handleSaveGoal} activeOpacity={0.8}>
                    <ThemedText style={styles.applyBtnText}>Guardar Meta</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowGoalEditor(true)} activeOpacity={0.8}>
                  <Ionicons name="flag-outline" size={16} color="#FFE259" />
                  <ThemedText style={styles.secondaryBtnText}>Cambiar Meta ({stepGoal.toLocaleString()})</ThemedText>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.resetBtn} onPress={handleResetSteps} activeOpacity={0.8}>
                <Ionicons name="refresh-outline" size={16} color="#EF4444" />
                <ThemedText style={styles.resetBtnText}>Reiniciar a 0</ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 20 : 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: 'rgba(10, 14, 24, 0.98)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.15)',
    backgroundColor: 'rgba(18, 24, 38, 0.7)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFE259',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  feedbackBannerBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.40)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  feedbackBannerText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
  },
  scrollBody: {
    padding: 20,
    gap: 16,
  },
  metricsBanner: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  mainStepsDisplay: {
    alignItems: 'center',
  },
  currentStepsNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFDE0',
    letterSpacing: 1,
    fontFamily: 'monospace',
    textShadowColor: 'rgba(255, 226, 89, 0.5)',
    textShadowRadius: 10,
  },
  stepsGoalLabel: {
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: '700',
    letterSpacing: 1.1,
    fontFamily: 'monospace',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.15)',
    paddingTop: 10,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  metricValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  sectionCard: {
    backgroundColor: 'rgba(15, 20, 32, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#E2E8F0',
    letterSpacing: 1.2,
    fontFamily: 'monospace',
  },
  sectionDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statusPillInactive: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderWidth: 1,
    borderColor: '#64748B',
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFF',
    fontFamily: 'monospace',
  },
  toggleSensorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#FFE259',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 4,
  },
  toggleSensorBtnActive: {
    backgroundColor: '#FFE259',
  },
  toggleSensorBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFE259',
  },
  toggleSensorBtnTextActive: {
    color: '#050507',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  numericInput: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  applyBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#050507',
    letterSpacing: 1,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  stepChip: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stepChipText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#34D399',
    fontFamily: 'monospace',
  },
  stepChipNegative: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  stepChipTextNegative: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#F87171',
    fontFamily: 'monospace',
  },
  actionsFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 6,
  },
  goalEditorBox: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFE259',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resetBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#EF4444',
  },
  sensitivityRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  sensBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensBtnActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.16)',
    borderColor: '#38BDF8',
  },
  sensBtnTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  sensBtnTitleActive: {
    color: '#38BDF8',
  },
  sensBtnDesc: {
    fontSize: 8.5,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
});
