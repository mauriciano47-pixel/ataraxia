import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { ThemedText } from './themed-text';
import { Spacing } from '@/constants/theme';
import { SmartDeviceState } from '@/hooks/useDailyLog';
import { HeartIcon, SettingsIcon } from '@/components/ModuleSvgIcons';
import { HeartRateScannerModal } from './HeartRateScannerModal';

interface SmartDeviceCardProps {
  deviceState?: SmartDeviceState;
  onUpdateDevice: (updates: Partial<SmartDeviceState>) => void;
  onSyncSteps?: (syncedSteps: number) => void;
}

export function SmartDeviceCard({ deviceState, onUpdateDevice }: SmartDeviceCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);

  const device = deviceState || {
    connected: false,
    deviceName: 'Ninguno (Desconectado)',
    heartRateBpm: 0,
    lastSync: 'Nunca',
    batteryLevel: 0,
  };

  const isConnected = !!device.connected;
  const hasHeartRate = typeof device.heartRateBpm === 'number' && device.heartRateBpm > 0;

  const handleDisconnect = () => {
    onUpdateDevice({
      connected: false,
      deviceName: 'Ninguno (Desconectado)',
      heartRateBpm: 0,
      lastSync: 'Desconectado',
      batteryLevel: 0,
    });
    setModalVisible(false);
  };

  const handleSaveCameraHeartRate = (newBpm: number) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    onUpdateDevice({
      heartRateBpm: newBpm,
      lastSync: `Hoy ${nowTime} (Cámara PPG)`,
    });
    setScannerVisible(false);
  };

  return (
    <View style={styles.card}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
          <SettingsIcon color={isConnected ? '#D4AF37' : '#94A3B8'} size={20} />
          <View>
            <ThemedText style={styles.badge}>⚡ TELEMETRÍA SMART</ThemedText>
            <ThemedText style={styles.deviceName} numberOfLines={1}>
              {isConnected ? device.deviceName : 'Sin Dispositivo Vinculado'}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.statusTag, { backgroundColor: isConnected ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.05)' }]}>
          <View style={[styles.dot, { backgroundColor: isConnected ? '#D4AF37' : '#64748B' }]} />
          <ThemedText style={[styles.statusText, { color: isConnected ? '#FDE68A' : '#94A3B8' }]}>
            {isConnected ? '⚡ VINCULADO' : '🔌 DESCONECTADO'}
          </ThemedText>
        </View>
      </View>

      {/* Sensor Data Display */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <HeartIcon color="#D4AF37" size={16} />
          <View>
            <ThemedText style={styles.metricLabel}>RITMO CARDÍACO</ThemedText>
            <ThemedText style={styles.metricValue}>
              {hasHeartRate ? `${device.heartRateBpm} BPM` : '-- BPM'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.metricItem}>
          <View>
            <ThemedText style={styles.metricLabel}>BATERÍA</ThemedText>
            <ThemedText style={styles.metricValue}>
              {(device.batteryLevel && device.batteryLevel > 0) ? `${device.batteryLevel}%` : '--%'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.metricItem}>
          <View>
            <ThemedText style={styles.metricLabel}>ÚLTIMA SYNC</ThemedText>
            <ThemedText style={[styles.metricValue, { fontSize: 11 }]}>
              {device.lastSync || 'Nunca'}
            </ThemedText>
          </View>
        </View>
      </View>

      <ThemedText style={styles.promptText}>
        {isConnected
          ? `Dispositivo: ${device.deviceName}. Sincronización activa con puente de telemetría.`
          : 'No hay smartwatch vinculado. Puedes medir tu ritmo cardíaco en tiempo real usando el Escáner Óptico de Cámara (PPG) de tu dispositivo.'
        }
      </ThemedText>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#D4AF37', borderColor: '#D4AF37', flex: 2 }]}
          onPress={() => setScannerVisible(true)}
          activeOpacity={0.8}
        >
          <ThemedText style={[styles.btnText, { color: '#050507', fontWeight: '900' }]}>
            📷 MEDIR CON CÁMARA
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: 'rgba(212, 175, 55, 0.10)', borderColor: 'rgba(212, 175, 55, 0.30)', flex: 1.2 }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <ThemedText style={[styles.btnText, { color: '#FDE68A' }]}>
            {isConnected ? 'GESTIONAR' : 'ℹ️ SMARTWATCH'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Select Device Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: '#0A0D16', borderColor: 'rgba(212, 175, 55, 0.45)' }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: '#FFE259' }]}>⚡ TELEMETRÍA EXTERNA</ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <ThemedText style={{ color: '#94A3B8', fontSize: 16, fontWeight: 'bold' }}>✕</ThemedText>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 360 }}>
              <View style={styles.infoBox}>
                <ThemedText style={styles.infoTitle}>📱 Integración con Smartwatches Físicos</ThemedText>
                <ThemedText style={styles.infoDesc}>
                  La sincronización en tiempo real con Apple Watch, Garmin, Fitbit o Galaxy Watch requiere la app móvil nativa de Ataraxia ejecutándose con permisos de:
                </ThemedText>
                <View style={styles.apiBullet}>
                  <ThemedText style={styles.apiBulletText}>• Google Health Connect (Android 14+)</ThemedText>
                  <ThemedText style={styles.apiBulletText}>• Apple HealthKit (iOS / watchOS)</ThemedText>
                  <ThemedText style={styles.apiBulletText}>• Sensor de Hardware Nativo (Podómetro Coprocessor)</ThemedText>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.cameraActionBtn, { backgroundColor: 'rgba(212, 175, 55, 0.18)', borderColor: '#D4AF37' }]}
                onPress={() => {
                  setModalVisible(false);
                  setScannerVisible(true);
                }}
              >
                <ThemedText style={{ color: '#FFE259', fontWeight: 'bold', fontSize: 12, fontFamily: 'monospace' }}>
                  📷 USAR ESCÁNER ÓPTICO PPG (CÁMARA)
                </ThemedText>
              </TouchableOpacity>

              {isConnected && (
                <TouchableOpacity
                  style={[styles.disconnectBtn, { borderColor: 'rgba(239, 68, 68, 0.45)', backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}
                  onPress={handleDisconnect}
                >
                  <ThemedText style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 12, fontFamily: 'monospace' }}>
                    🔌 DESCONECTAR DISPOSITIVO
                  </ThemedText>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Real Optical PPG Camera Scanner */}
      <HeartRateScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onSaveHeartRate={handleSaveCameraHeartRate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(13, 17, 28, 0.94)',
    borderRadius: 16,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#D4AF37',
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  deviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#F8FAFC',
    marginTop: 1,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  promptText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
    marginVertical: Spacing.two,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    marginVertical: Spacing.two,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.18)',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricLabel: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#94A3B8',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#FFE259',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  btnText: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 7, 0.90)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    padding: Spacing.four,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1,
    color: '#F8FAFC',
  },
  scanningBox: {
    padding: Spacing.five,
    alignItems: 'center',
  },
  deviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: Spacing.two,
    gap: Spacing.three,
  },
  devOptionName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  devOptionBrand: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  disconnectBtn: {
    marginTop: Spacing.four,
    padding: Spacing.three,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: Spacing.three,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFE259',
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  infoDesc: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
    marginBottom: 8,
  },
  apiBullet: {
    gap: 4,
    paddingLeft: 4,
  },
  apiBulletText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  cameraActionBtn: {
    padding: Spacing.three,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.two,
  },
});
