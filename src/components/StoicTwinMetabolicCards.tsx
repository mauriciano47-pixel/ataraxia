import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { SafeStorage } from '@/utils/safeStorage';
import { LegendaryPath } from '@/types/onboarding';

interface StoicTwinMetabolicCardsProps {
  totalBurnedCalories: number;
  consumedCalories: number;
  legendaryPath?: LegendaryPath;
}

const FASTING_START_KEY = 'ataraxia_fasting_start_time_v1';
const FASTING_IS_ACTIVE_KEY = 'ataraxia_fasting_is_active_v1';

export function StoicTwinMetabolicCards({
  totalBurnedCalories,
  consumedCalories,
  legendaryPath = 'spartan',
}: StoicTwinMetabolicCardsProps) {
  // 1. Balanza Energética Neta
  const netCalories = consumedCalories - totalBurnedCalories;
  const isDeficit = netCalories < 0;

  // 2. Cronómetro de Ayuno Intermitente / Ventana Metabólica
  const [isFasting, setIsFasting] = useState<boolean>(true);
  const [fastingSeconds, setFastingSeconds] = useState<number>(14 * 3600 + 15 * 60); // Default 14h 15m

  useEffect(() => {
    const rawActive = SafeStorage.getItem(FASTING_IS_ACTIVE_KEY);
    const rawStart = SafeStorage.getItem(FASTING_START_KEY);

    if (rawActive === 'false') {
      setIsFasting(false);
    } else {
      setIsFasting(true);
      if (rawStart) {
        const startTime = parseInt(rawStart, 10);
        const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
        setFastingSeconds(elapsed);
      } else {
        // Inicializar inicio de ayuno si no existe
        const defaultStart = Date.now() - (14 * 3600 * 1000);
        SafeStorage.setItem(FASTING_START_KEY, String(defaultStart));
        setFastingSeconds(14 * 3600);
      }
    }
  }, []);

  useEffect(() => {
    if (!isFasting) return;
    const interval = setInterval(() => {
      setFastingSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFasting]);

  const toggleFasting = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (isFasting) {
      // Romper ayuno -> Ventana de alimentación
      setIsFasting(false);
      SafeStorage.setItem(FASTING_IS_ACTIVE_KEY, 'false');
    } else {
      // Iniciar nuevo ayuno
      setIsFasting(true);
      SafeStorage.setItem(FASTING_IS_ACTIVE_KEY, 'true');
      const nowMs = Date.now();
      SafeStorage.setItem(FASTING_START_KEY, String(nowMs));
      setFastingSeconds(0);
    }
  };

  const hoursFasting = Math.floor(fastingSeconds / 3600);
  const minutesFasting = Math.floor((fastingSeconds % 3600) / 60);

  // Estado Metabólico Celular según horas de ayuno
  let metabolicState = 'Digestión & Asimilación';
  let metabolicColor = '#38BDF8';
  if (isFasting) {
    if (hoursFasting >= 16) {
      metabolicState = '⚡ Autofagia & Renovación';
      metabolicColor = '#10B981';
    } else if (hoursFasting >= 12) {
      metabolicState = '🔥 Quema de Grasas (Beta)';
      metabolicColor = '#F59E0B';
    } else {
      metabolicState = '⏳ Vaciado de Glucógeno';
      metabolicColor = '#D4AF37';
    }
  } else {
    metabolicState = '🥗 Ventana de Nutrición';
    metabolicColor = '#38BDF8';
  }

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

      {/* 2. Tarjeta: Cronómetro de Ventana Metabólica & Ayuno */}
      <View style={styles.halfCard}>
        <View style={styles.cardHeaderRow}>
          <ThemedText style={styles.cardHeaderGoldText}>⏳ AYUNO CELULAR</ThemedText>
          <ThemedText style={[styles.statusBadgeText, { color: metabolicColor }]}>
            {isFasting ? 'EN AYUNO' : 'NUTRICIÓN'}
          </ThemedText>
        </View>

        <View style={styles.balanceDataBox}>
          <ThemedText style={styles.fastingTimerNumber}>
            {isFasting ? `${hoursFasting}h ${minutesFasting}m` : 'Comiendo'}
          </ThemedText>
          <ThemedText style={[styles.metabolicPhaseText, { color: metabolicColor }]}>
            {metabolicState}
          </ThemedText>
        </View>

        <TouchableOpacity
          style={styles.fastingActionTouch}
          activeOpacity={0.8}
          onPress={toggleFasting}
        >
          <LinearGradient
            colors={isFasting ? ['rgba(212, 175, 55, 0.25)', 'rgba(212, 175, 55, 0.08)'] : ['#059669', '#10B981']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fastingActionGradient}
          >
            <ThemedText style={styles.fastingBtnText}>
              {isFasting ? '🍽️ Romper Ayuno' : '⏳ Iniciar Ayuno'}
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCard: {
    flex: 1,
    backgroundColor: 'rgba(13, 17, 28, 0.92)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    justifyContent: 'space-between',
    gap: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderGoldText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#C5A869',
    letterSpacing: 1,
  },
  statusBadgeText: {
    fontSize: 8.5,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  balanceDataBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 10,
    padding: 8,
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
  fastingTimerNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  metabolicPhaseText: {
    fontSize: 9.5,
    fontWeight: 'bold',
    textAlign: 'center',
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
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#FDE68A',
    fontFamily: 'monospace',
  },
});
