import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, useColorScheme, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { ThemedText } from './themed-text';
import { Colors, Spacing } from '@/constants/theme';
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
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

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
    <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
          <SettingsIcon color={device.connected ? colors.accent : colors.textSecondary} size={20} />
          <View>
            <ThemedText style={styles.badge}>TELEMETRÍA SMART</ThemedText>
            <ThemedText style={styles.deviceName} numberOfLines={1}>
              {device.deviceName}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.statusTag, { backgroundColor: device.connected ? 'rgba(211,47,47,0.15)' : 'rgba(128,128,128,0.15)' }]}>
          <View style={[styles.dot, { backgroundColor: device.connected ? '#10B981' : '#4A5568' }]} />
          <ThemedText style={[styles.statusText, { color: device.connected ? '#10B981' : '#4A5568' }]}>
            {device.connected ? 'VINCULADO' : 'OFFLINE'}
          </ThemedText>
        </View>
      </View>

      {/* Connection Info / Metrics */}
      {device.connected ? (
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <HeartIcon color="#FF453A" size={16} />
            <View>
              <ThemedText style={styles.metricLabel}>PULSO LIVE</ThemedText>
              <ThemedText style={styles.metricValue}>{device.heartRateBpm} <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>BPM</ThemedText></ThemedText>
            </View>
          </View>

          <View style={styles.metricItem}>
            <View>
              <ThemedText style={styles.metricLabel}>BATERÍA</ThemedText>
              <ThemedText style={styles.metricValue}>{device.batteryLevel}%</ThemedText>
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
          Enlaza tu Smartwatch o pulsera estoica para sincronizar pasos, ritmo cardíaco y calidad de sueño en tiempo real.
        </ThemedText>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        {device.connected ? (
          <>
            <TouchableOpacity 
              style={[styles.btn, { backgroundColor: colors.accent, borderColor: colors.accent, flex: 2 }]}
              onPress={handleSyncNow}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <ThemedText style={[styles.btnText, { color: '#FFF' }]}>Sincronizar Datos</ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btn, { backgroundColor: 'transparent', borderColor: colors.backgroundSelected, flex: 1 }]}
              onPress={() => setModalVisible(true)}
            >
              <ThemedText style={[styles.btnText, { color: colors.textSecondary }]}>Cambiar</ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: colors.accent, borderColor: colors.accent, flex: 1 }]}
            onPress={() => setModalVisible(true)}
          >
            <ThemedText style={[styles.btnText, { color: '#FFF' }]}>VINCULAR SMARTWATCH</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Device Pair Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.backgroundSelected }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>SELECCIONAR DISPOSITIVO SMART</ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <ThemedText style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>✕</ThemedText>
              </TouchableOpacity>
            </View>

            {isScanning ? (
              <View style={styles.scanningBox}>
                <ActivityIndicator size="large" color={colors.accent} />
                <ThemedText style={{ marginTop: Spacing.three, fontFamily: 'monospace' }}>
                  Escaneando pulso y sensores Bluetooth LE...
                </ThemedText>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 320 }}>
                {AVAILABLE_DEVICES.map((dev) => (
                  <TouchableOpacity
                    key={dev.id}
                    style={[styles.deviceOption, { borderColor: colors.backgroundSelected }]}
                    onPress={() => handleSelectDevice(dev)}
                  >
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.devOptionName}>{dev.name}</ThemedText>
                      <ThemedText style={styles.devOptionBrand}>{dev.brand}</ThemedText>
                    </View>
                    <ThemedText style={{ color: colors.textSecondary }}>→</ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {device.connected && (
              <TouchableOpacity 
                style={[styles.disconnectBtn, { borderColor: '#FF453A' }]}
                onPress={() => {
                  handleDisconnect();
                  setModalVisible(false);
                }}
              >
                <ThemedText style={{ color: '#FF453A', fontWeight: 'bold', fontFamily: 'monospace' }}>
                  DESCONECTAR DISPOSITIVO ACTUAL
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.four,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)', // Oro Imperial
    backgroundColor: 'rgba(16, 16, 22, 0.88)',
    marginBottom: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  badge: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 2,
    color: '#10B981',
    fontWeight: 'bold',
  },
  deviceName: {
    fontSize: 15,
    fontFamily: 'serif',
    fontWeight: 'bold',
    marginTop: 2,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
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
    color: '#888',
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
    borderColor: 'rgba(128,128,128,0.15)',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricLabel: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#888',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'monospace',
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
    borderWidth: 1.5,
    gap: 6,
  },
  btnText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    padding: Spacing.four,
    borderWidth: 2,
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
  },
  scanningBox: {
    padding: Spacing.five,
    alignItems: 'center',
  },
  deviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderWidth: 1,
    marginBottom: Spacing.two,
    gap: Spacing.three,
  },
  devOptionName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  devOptionBrand: {
    fontSize: 11,
    color: '#888',
    fontFamily: 'monospace',
  },
  disconnectBtn: {
    marginTop: Spacing.four,
    padding: Spacing.three,
    borderWidth: 1,
    alignItems: 'center',
  }
});
