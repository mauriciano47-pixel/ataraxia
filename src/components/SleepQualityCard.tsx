import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TextInput, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from './themed-text';
import { Spacing } from '@/constants/theme';
import { SafeStorage } from '@/utils/safeStorage';

interface SleepQualityCardProps {
  onUpdateSleepHours?: (hours: number, qualityScore: number) => void;
  initialHours?: number;
}

export interface SleepRecord {
  totalHours: number;
  deepHours: number;
  remHours: number;
  lightHours: number;
  efficiencyPct: number;
  restingBpm: number;
  hrvMs: number;
  bedTime: string;
  wakeTime: string;
  source: 'google_health' | 'smartwatch' | 'manual';
  updatedAt: string;
}

const SLEEP_STORAGE_KEY = 'ataraxia_sleep_record_v1';

export const DEFAULT_SLEEP_RECORD: SleepRecord = {
  totalHours: 7.5,
  deepHours: 1.8,
  remHours: 1.9,
  lightHours: 3.8,
  efficiencyPct: 92,
  restingBpm: 54,
  hrvMs: 65,
  bedTime: '23:15',
  wakeTime: '06:45',
  source: 'manual',
  updatedAt: 'Hoy',
};

export const SleepQualityCard = React.memo(function SleepQualityCard({ onUpdateSleepHours }: SleepQualityCardProps) {
  const [sleepRecord, setSleepRecord] = useState<SleepRecord>(() => {
    try {
      const saved = SafeStorage.getItem(SLEEP_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SLEEP_RECORD;
    } catch {
      return DEFAULT_SLEEP_RECORD;
    }
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [inputHours, setInputHours] = useState(sleepRecord.totalHours.toString());
  const [inputBedTime, setInputBedTime] = useState(sleepRecord.bedTime);
  const [inputWakeTime, setInputWakeTime] = useState(sleepRecord.wakeTime);
  const [perceivedQuality, setPerceivedQuality] = useState(8);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = SafeStorage.getItem(SLEEP_STORAGE_KEY);
        if (saved) {
          setSleepRecord(JSON.parse(saved));
        }
      } catch {}
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const handleSaveManualSleep = () => {
    const hours = parseFloat(inputHours);
    if (isNaN(hours) || hours <= 0 || hours > 18) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Por favor ingresa un número de horas de sueño válido (ej: 7.5).');
      }
      return;
    }

    const deep = parseFloat((hours * 0.23).toFixed(1));
    const rem = parseFloat((hours * 0.25).toFixed(1));
    const light = parseFloat((hours - deep - rem).toFixed(1));
    const efficiency = Math.min(98, Math.max(70, Math.round(82 + (perceivedQuality * 1.5))));

    const updated: SleepRecord = {
      ...sleepRecord,
      totalHours: hours,
      deepHours: deep,
      remHours: rem,
      lightHours: light,
      efficiencyPct: efficiency,
      bedTime: inputBedTime || '23:00',
      wakeTime: inputWakeTime || '07:00',
      source: 'manual',
      updatedAt: 'Hoy (Manual)',
    };

    setSleepRecord(updated);
    try {
      SafeStorage.setItem(SLEEP_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    if (onUpdateSleepHours) {
      onUpdateSleepHours(hours, perceivedQuality);
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    setModalVisible(false);
  };

  const isOptimal = sleepRecord.totalHours >= 7.0 && sleepRecord.totalHours <= 9.0;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <ThemedText style={styles.badgeText}>🌙 RECUPERACIÓN & SUEÑO ANABÓLICO</ThemedText>
          <ThemedText style={styles.titleText}>Arquitectura del Descanso</ThemedText>
        </View>

        <View style={[styles.statusTag, isOptimal ? styles.statusTagOptimal : styles.statusTagWarning]}>
          <ThemedText style={[styles.statusTagText, isOptimal ? styles.statusTagTextOptimal : styles.statusTagTextWarning]}>
            {isOptimal ? '👑 ÓPTIMO' : '⚠️ ADAPTACIÓN'}
          </ThemedText>
        </View>
      </View>

      {/* Main Sleep Duration Display */}
      <View style={styles.mainDisplayRow}>
        <View style={styles.durationCol}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
            <ThemedText style={styles.hoursNumber}>{sleepRecord.totalHours.toFixed(1)}</ThemedText>
            <ThemedText style={styles.hoursUnit}>horas</ThemedText>
          </View>
          <ThemedText style={styles.goalSubtext}>
            Meta estoica: 8.0h ({sleepRecord.bedTime} → {sleepRecord.wakeTime})
          </ThemedText>
        </View>

        <View style={styles.efficiencyBadgeBox}>
          <ThemedText style={styles.efficiencyVal}>{sleepRecord.efficiencyPct}%</ThemedText>
          <ThemedText style={styles.efficiencyLabel}>EFICIENCIA</ThemedText>
        </View>
      </View>

      {/* Progress Bar de Fases de Sueño */}
      <View style={styles.phaseTrackContainer}>
        <View style={styles.phaseBarTrack}>
          {/* Sueño Profundo */}
          <View style={[styles.phaseSegment, { flex: Math.max(0.1, sleepRecord.deepHours), backgroundColor: '#818CF8' }]} />
          {/* Sueño REM */}
          <View style={[styles.phaseSegment, { flex: Math.max(0.1, sleepRecord.remHours), backgroundColor: '#38BDF8' }]} />
          {/* Sueño Ligero */}
          <View style={[styles.phaseSegment, { flex: Math.max(0.1, sleepRecord.lightHours), backgroundColor: '#64748B' }]} />
        </View>

        <View style={styles.phaseLegendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#818CF8' }]} />
            <ThemedText style={styles.legendText}>Profundo: {sleepRecord.deepHours}h</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#38BDF8' }]} />
            <ThemedText style={styles.legendText}>REM: {sleepRecord.remHours}h</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#64748B' }]} />
            <ThemedText style={styles.legendText}>Ligero: {sleepRecord.lightHours}h</ThemedText>
          </View>
        </View>
      </View>

      {/* Métricas Fisiológicas Nocturnas */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <ThemedText style={styles.metricLabel}>FC MÍNIMA</ThemedText>
          <ThemedText style={styles.metricValue}>{sleepRecord.restingBpm} bpm</ThemedText>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <ThemedText style={styles.metricLabel}>VFC / HRV</ThemedText>
          <ThemedText style={[styles.metricValue, { color: '#34D399' }]}>{sleepRecord.hrvMs} ms</ThemedText>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <ThemedText style={styles.metricLabel}>ORIGEN</ThemedText>
          <ThemedText style={[styles.metricValue, { fontSize: 11 }]}>
            {sleepRecord.source === 'google_health' ? '💚 Google Health' : sleepRecord.source === 'smartwatch' ? '⌚ Smartwatch' : '✍️ Manual'}
          </ThemedText>
        </View>
      </View>

      {/* Botones de Acción */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.calibrateBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.calibrateBtnText}>
            ⚙️ CALIBRAR / REGISTRAR SUEÑO
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Modal de Calibración de Sueño */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <ThemedText style={styles.badgeText}>⚡ CALIBRACIÓN BIOMÉTRICA</ThemedText>
                <ThemedText style={styles.modalTitle}>Registro de Sueño Diario</ThemedText>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <ThemedText style={styles.closeBtnText}>✕</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>HORAS TOTALES DE SUEÑO:</ThemedText>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={inputHours}
                onChangeText={setInputHours}
                placeholder="Ej: 7.5"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.timesRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.inputLabel}>HORA DE ACOSTARSE:</ThemedText>
                <TextInput
                  style={styles.textInput}
                  value={inputBedTime}
                  onChangeText={setInputBedTime}
                  placeholder="23:15"
                  placeholderTextColor="#64748B"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.inputLabel}>HORA DE DESPERTAR:</ThemedText>
                <TextInput
                  style={styles.textInput}
                  value={inputWakeTime}
                  onChangeText={setInputWakeTime}
                  placeholder="06:45"
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>CALIDAD PERCIBIDA AL DESPERTAR (1-10):</ThemedText>
              <View style={styles.qualityChipsRow}>
                {[5, 6, 7, 8, 9, 10].map((score) => (
                  <TouchableOpacity
                    key={score}
                    style={[styles.qualityChip, perceivedQuality === score && styles.qualityChipActive]}
                    onPress={() => setPerceivedQuality(score)}
                    activeOpacity={0.8}
                  >
                    <ThemedText style={[styles.qualityChipText, perceivedQuality === score && styles.qualityChipTextActive]}>
                      {score}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.saveSubmitBtn} onPress={handleSaveManualSleep} activeOpacity={0.85}>
              <ThemedText style={styles.saveSubmitBtnText}>GUARDAR TELEMETRÍA DE SUEÑO</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(13, 17, 28, 0.94)',
    borderRadius: 16,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    borderWidth: 1.5,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    shadowColor: '#818CF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 8,
  },
  titleGroup: {
    flex: 1,
    flexShrink: 1,
    minWidth: 160,
    gap: 2,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#818CF8',
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  titleText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#FFFFFF',
    marginTop: 1,
    flexShrink: 1,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusTagOptimal: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusTagWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusTagText: {
    fontSize: 8.5,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  statusTagTextOptimal: {
    color: '#34D399',
  },
  statusTagTextWarning: {
    color: '#FDE68A',
  },
  mainDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: Spacing.two,
  },
  durationCol: {
    gap: 2,
    flex: 1,
    flexShrink: 1,
    minWidth: 140,
  },
  hoursNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'serif',
  },
  hoursUnit: {
    fontSize: 13,
    color: '#818CF8',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  goalSubtext: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
    flexShrink: 1,
  },
  efficiencyBadgeBox: {
    backgroundColor: 'rgba(129, 140, 248, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.30)',
    alignItems: 'center',
  },
  efficiencyVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#818CF8',
    fontFamily: 'monospace',
  },
  efficiencyLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#CBD5E1',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  phaseTrackContainer: {
    marginVertical: Spacing.two,
    gap: 6,
  },
  phaseBarTrack: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 2,
  },
  phaseSegment: {
    height: '100%',
    borderRadius: 3,
  },
  phaseLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: Spacing.two,
    marginVertical: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'center',
  },
  metricLabel: {
    fontSize: 8.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F8FAFC',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  actionsRow: {
    marginTop: Spacing.one,
  },
  calibrateBtn: {
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.40)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  calibrateBtnText: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 7, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0A0D16',
    padding: Spacing.four,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(129, 140, 248, 0.45)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.three,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: Spacing.three,
    gap: 4,
  },
  timesRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  inputLabel: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#818CF8',
    fontFamily: 'monospace',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  qualityChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  qualityChip: {
    width: 44,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qualityChipActive: {
    backgroundColor: '#818CF8',
    borderColor: '#818CF8',
  },
  qualityChipText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#CBD5E1',
    fontFamily: 'monospace',
  },
  qualityChipTextActive: {
    color: '#050507',
  },
  saveSubmitBtn: {
    backgroundColor: '#818CF8',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  saveSubmitBtnText: {
    color: '#050507',
    fontSize: 11.5,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
});
