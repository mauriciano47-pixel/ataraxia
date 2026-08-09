import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { ThemedText } from './themed-text';
import { Spacing } from '@/constants/theme';
import { SmartDeviceState } from '@/hooks/useDailyLog';
import { HeartIcon, SettingsIcon } from '@/components/ModuleSvgIcons';

interface SmartDeviceCardProps {
  deviceState?: SmartDeviceState;
  onUpdateDevice: (updates: Partial<SmartDeviceState>) => void;
  onSyncSteps: (syncedSteps: number) => void;
}

const AVAILABLE_DEVICES = [
  { id: 'apple_watch', name: 'Apple Watch Series 9 / Ultra 2', brand: 'Apple Health' },
  { id: 'garmin_fenix', name: 'Garmin Fēnix 7 / Forerunner', brand: 'Garmin Connect' },
  { id: 'fitbit_charge', name: 'Fitbit Charge 6 / Sense', brand: 'Fitbit OS' },
  { id: 'galaxy_watch', name: 'Galaxy Watch 6 / Pro', brand: 'Samsung Health' },
  { id: 'health_connect', name: 'Google Health Connect API', brand: 'Android Health' },
];

export function SmartDeviceCard({ deviceState, onUpdateDevice, onSyncSteps }: SmartDeviceCardProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const device = deviceState || {
    connected: false,
    deviceName: 'Ninguno (Desconectado)',
    heartRateBpm: 72,
    lastSync: 'Nunca',
    batteryLevel: 90,
  };

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      // Simulate reading live sensor data from device
      const randomStepsAdded = Math.floor(Math.random() * 850) + 350;
      const currentBpm = Math.floor(Math.random() * 25) + 65; // 65 - 90 BPM
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      onSyncSteps(randomStepsAdded);
      onUpdateDevice({
        heartRateBpm: currentBpm,
        lastSync: `Hoy ${nowTime}`,
        batteryLevel: Math.max(10, (device.batteryLevel || 90) - 1),
      });
      setIsSyncing(false);
    }, 1200);
  };

  const handleSelectDevice = (dev: typeof AVAILABLE_DEVICES[0]) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onUpdateDevice({
        connected: true,
        deviceName: dev.name,
        heartRateBpm: 74,
        lastSync: `Ahora (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
        batteryLevel: 95,
      });
      setModalVisible(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    onUpdateDevice({
      connected: false,
      deviceName: 'Ninguno (Desconectado)',
      lastSync: 'Desconectado',
    });
  };

  return (
    <View style={styles.card}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
          <SettingsIcon color={device.connected ? '#D4AF37' : '#94A3B8'} size={20} />
          <View>
            <ThemedText style={styles.badge}>⚡ TELEMETRÍA SMART</ThemedText>
            <ThemedText style={styles.deviceName} numberOfLines={1}>
              {device.deviceName}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.statusTag, { backgroundColor: device.connected ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.05)' }]}>
          <View style={[styles.dot, { backgroundColor: device.connected ? '#D4AF37' : '#64748B' }]} />
          <ThemedText style={[styles.statusText, { color: device.connected ? '#FDE68A' : '#94A3B8' }]}>
            {device.connected ? '⚡ VINCULADO' : 'OFFLINE'}
          </ThemedText>
        </View>
      </View>

      {/* Sensor Data Display if Connected */}
      {device.connected ? (
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <HeartIcon color="#D4AF37" size={16} />
            <View>
              <ThemedText style={styles.metricLabel}>RITMO CARDÍACO</ThemedText>
              <ThemedText style={styles.metricValue}>{device.heartRateBpm || 72} BPM</ThemedText>
            </View>
          </View>

          <View style={styles.metricItem}>
            <View>
              <ThemedText style={styles.metricLabel}>BATERÍA</ThemedText>
              <ThemedText style={styles.metricValue}>{device.batteryLevel || 90}%</ThemedText>
            </View>
          </View>

          <View style={styles.metricItem}>
            <View>
              <ThemedText style={styles.metricLabel}>ÚLTIMA SYNC</ThemedText>
              <ThemedText style={[styles.metricValue, { fontSize: 11 }]}>{device.lastSync}</ThemedText>
            </View>
          </View>
        </View>
      ) : (
        <ThemedText style={styles.promptText}>
          Sincroniza tu reloj inteligente o Google Health Connect para medir ritmo cardíaco y pasos automáticamente con la telemetría imperial.
        </ThemedText>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        {device.connected && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#D4AF37', borderColor: '#D4AF37', flex: 2 }]}
            onPress={handleSyncNow}
            disabled={isSyncing}
            activeOpacity={0.8}
          >
            {isSyncing ? (
              <ActivityIndicator color="#050507" size="small" />
            ) : (
              <ThemedText style={[styles.btnText, { color: '#050507', fontWeight: '900' }]}>⚡ SINCRONIZAR AHORA</ThemedText>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: 'rgba(212, 175, 55, 0.10)', borderColor: 'rgba(212, 175, 55, 0.30)', flex: 1 }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <ThemedText style={[styles.btnText, { color: '#FDE68A' }]}>
            {device.connected ? 'GESTIONAR' : 'CONECTAR'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Select Device Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: '#0F172A', borderColor: 'rgba(0, 82, 255, 0.25)' }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>VINCULAR SMARTWATCH / HEALTH API</ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <ThemedText style={{ color: '#94A3B8', fontSize: 16, fontWeight: 'bold' }}>✕</ThemedText>
              </TouchableOpacity>
            </View>

            {isScanning ? (
              <View style={styles.scanningBox}>
                <ActivityIndicator color="#0052FF" size="large" />
                <ThemedText style={{ marginTop: Spacing.three, fontFamily: 'monospace', color: '#0052FF', fontSize: 12 }}>
                  ESTABLECIENDO CONEXIÓN SEGURA...
                </ThemedText>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 320 }}>
                {AVAILABLE_DEVICES.map(dev => (
                  <TouchableOpacity
                    key={dev.id}
                    style={[styles.deviceOption, { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.08)' }]}
                    onPress={() => handleSelectDevice(dev)}
                  >
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.devOptionName}>{dev.name}</ThemedText>
                      <ThemedText style={styles.devOptionBrand}>{dev.brand}</ThemedText>
                    </View>
                    <ThemedText style={{ color: '#0052FF', fontWeight: 'bold', fontSize: 12 }}>VINCULAR</ThemedText>
                  </TouchableOpacity>
                ))}

                {device.connected && (
                  <TouchableOpacity
                    style={[styles.disconnectBtn, { borderColor: 'rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
                    onPress={handleDisconnect}
                  >
                    <ThemedText style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 11, fontFamily: 'monospace' }}>
                      DESCONECTAR DISPOSITIVO
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    borderRadius: 16,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(0, 82, 255, 0.20)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#0052FF',
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
    color: '#94A3B8',
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
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    color: '#F8FAFC',
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
    backgroundColor: 'rgba(7, 11, 25, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    padding: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
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
  }
});
