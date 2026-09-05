import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { LegendaryPath } from '@/types/onboarding';

interface StoicTwinMetabolicCardsProps {
  totalBurnedCalories: number;
  consumedCalories: number;
  legendaryPath?: LegendaryPath;
  trainingCompleted?: boolean;
  effectiveSets?: number;
  sleepHours?: number;
  waterLitres?: number;
}

export const StoicTwinMetabolicCards = React.memo(function StoicTwinMetabolicCards({
  totalBurnedCalories,
  consumedCalories,
  legendaryPath = 'spartan',
  trainingCompleted = false,
  effectiveSets = 0,
  sleepHours = 7.5,
  waterLitres = 2.5,
}: StoicTwinMetabolicCardsProps) {
  // 1. Balanza Energética Neta
  const netCalories = consumedCalories - totalBurnedCalories;
  const isDeficit = netCalories < 0;

  // 2. Módulo de Recuperación Muscular & Regeneración Fisiológica
  const [showRecoveryModal, setShowRecoveryModal] = useState<boolean>(false);

  // Cálculo de recuperación científica basada en entreno, sueño e hidratación
  let recoveryScore = 95;
  if (trainingCompleted) {
    recoveryScore = 72; // En fase de reparación celular activa tras el entreno
  } else {
    if (sleepHours >= 7.5) recoveryScore += 5;
    if (waterLitres >= 2.5) recoveryScore += 0;
  }
  recoveryScore = Math.min(100, Math.max(50, recoveryScore));

  const isOptimal = recoveryScore >= 90;
  const recoveryColor = isOptimal ? '#10B981' : '#F59E0B';

  const muscleTargetByPath = {
    spartan: 'Piernas / Empuje',
    hoplite: 'Cadena Posterior & Core',
    apollo: 'Pecho Superior & Hombros',
    philosopher: 'Dorsales & Autodominio',
  }[legendaryPath] || 'Full Body';

  const handleOpenRecovery = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setShowRecoveryModal(true);
  };

  return (
    <View style={styles.twoColRow}>
      {/* 1. Tarjeta: Balanza Energética Neta */}
      <View style={styles.halfCard}>
        <View style={styles.cardHeaderRow}>
          <ThemedText style={styles.cardHeaderGoldText}>⚖️ BALANCE NETO</ThemedText>
          <ThemedText style={[styles.statusBadgeText, { color: isDeficit ? '#38BDF8' : '#10B981' }]}>
            {isDeficit ? 'DÉFICIT' : 'SUPERÁVIT'}
          </ThemedText>
        </View>

        <View style={styles.balanceDataBox}>
          <ThemedText style={styles.netKcalNumber}>
            {netCalories > 0 ? `+${netCalories}` : `${netCalories}`}
            <ThemedText style={styles.unitText}> kcal</ThemedText>
          </ThemedText>

          <View style={styles.miniSplitRow}>
            <ThemedText style={styles.splitSubText}>⚡ Quemadas: {totalBurnedCalories}</ThemedText>
            <ThemedText style={styles.splitSubText}>🥗 Ingeridas: {consumedCalories}</ThemedText>
          </View>
        </View>

        <ThemedText style={styles.feedbackText}>
          {legendaryPath === 'apollo'
            ? (isDeficit ? '🔥 En rango óptimo de definición V-Taper.' : '⚠️ Superávit: cuida las porciones.')
            : (netCalories >= 0 ? '🥩 En zona anabólica de fuerza.' : '⚡ Gasto alto: asegura tu proteína.')}
        </ThemedText>
      </View>

      {/* 2. Tarjeta: Regeneración Muscular & Estado del SNC */}
      <View style={styles.halfCard}>
        <View style={styles.cardHeaderRow}>
          <ThemedText style={styles.cardHeaderGoldText}>🧬 REGENERACIÓN</ThemedText>
          <ThemedText style={[styles.statusBadgeText, { color: recoveryColor }]}>
            {trainingCompleted ? 'REPARANDO' : '100% ÓPTIMO'}
          </ThemedText>
        </View>

        <View style={styles.balanceDataBox}>
          <ThemedText style={[styles.recoveryPctNumber, { color: recoveryColor }]}>
            {recoveryScore}%
          </ThemedText>
          <ThemedText style={[styles.metabolicPhaseText, { color: recoveryColor }]}>
            {trainingCompleted ? 'Síntesis Proteica Activa' : 'Músculos Listos para Entrenar'}
          </ThemedText>
          <ThemedText style={styles.subDetailText}>
            🎯 {muscleTargetByPath}: {trainingCompleted ? 'Reparación 24h' : 'Máxima Potencia'}
          </ThemedText>
        </View>

        <TouchableOpacity
          style={styles.fastingActionTouch}
          activeOpacity={0.8}
          onPress={handleOpenRecovery}
        >
          <LinearGradient
            colors={isOptimal ? ['#059669', '#10B981'] : ['#B45309', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fastingActionGradient}
          >
            <ThemedText style={styles.fastingBtnText} numberOfLines={1}>
              {trainingCompleted ? '🧬 Protocolo' : '⚡ Ver Estado'}
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Modal: Protocolo Científico de Recuperación y Fisiología */}
      <Modal visible={showRecoveryModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>🧬 Regeneración Muscular & SNC</ThemedText>
            <ThemedText style={styles.modalSub}>
              {trainingCompleted
                ? 'Tus fibras musculares están en plena fase anabólica de supercompensación:'
                : 'Tu cuerpo se encuentra en estado óptimo de preparación física:'}
            </ThemedText>

            <View style={styles.protocolList}>
              <View style={styles.protocolItem}>
                <ThemedText style={styles.protocolIcon}>🥩</ThemedText>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.protocolItemTitle}>Síntesis Proteica (2.0g/kg)</ThemedText>
                  <ThemedText style={styles.protocolItemDesc}>
                    Asegura tu meta de proteína para reconstruir las micro-roturas miofibrilares.
                  </ThemedText>
                </View>
              </View>

              <View style={styles.protocolItem}>
                <ThemedText style={styles.protocolIcon}>😴</ThemedText>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.protocolItemTitle}>Sueño Profundo (Fase 4 & GH)</ThemedText>
                  <ThemedText style={styles.protocolItemDesc}>
                    El 80% de la hormona del crecimiento se libera durante el sueño no-REM profundo.
                  </ThemedText>
                </View>
              </View>

              <View style={styles.protocolItem}>
                <ThemedText style={styles.protocolIcon}>💧</ThemedText>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.protocolItemTitle}>Hidratación & Electrolitos</ThemedText>
                  <ThemedText style={styles.protocolItemDesc}>
                    El músculo hidratado rinde un 15% más y reduce calambres y fatiga del SNC.
                  </ThemedText>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowRecoveryModal(false)}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.closeBtnText}>Entendido • Volver al Santuario</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfCard: {
    flex: 1,
    backgroundColor: 'rgba(13, 17, 28, 0.92)',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    justifyContent: 'space-between',
    gap: 6,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  cardHeaderGoldText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#C5A869',
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  statusBadgeText: {
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  balanceDataBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 10,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
    alignItems: 'center',
    gap: 2,
  },
  netKcalNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  recoveryPctNumber: {
    fontSize: 19,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  unitText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  miniSplitRow: {
    alignItems: 'center',
    gap: 1,
    marginTop: 2,
  },
  splitSubText: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  feedbackText: {
    fontSize: 9.5,
    color: '#CBD5E1',
    lineHeight: 13,
  },
  metabolicPhaseText: {
    fontSize: 9.5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subDetailText: {
    fontSize: 8.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 2,
  },
  fastingActionTouch: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  fastingActionGradient: {
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  fastingBtnText: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#FDE68A',
    fontFamily: 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 4, 8, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    gap: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFE259',
    textAlign: 'center',
    fontFamily: 'serif',
  },
  modalSub: {
    fontSize: 12,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 16,
  },
  protocolList: {
    gap: 10,
  },
  protocolItem: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
  },
  protocolIcon: {
    fontSize: 20,
  },
  protocolItemTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FDE68A',
  },
  protocolItemDesc: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 14,
  },
  closeBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  closeBtnText: {
    color: '#050507',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    fontSize: 12,
  },
});
