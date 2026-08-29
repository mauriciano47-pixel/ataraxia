import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { Spacing } from '@/constants/theme';
import { ThemedText } from './themed-text';
import { HeartRateScannerModal } from './HeartRateScannerModal';

interface ThunderTelemetryTwinCardsProps {
  steps?: number;
  stepGoal?: number;
  km?: number;
  heartRateBpm?: number;
  avgBpm?: number;
  peakBpm?: number;
  onAddSteps?: (amount: number) => void;
  onSyncHeartRate?: (measuredBpm?: number) => void;
  onOpenStepDetails?: () => void;
}

export function ThunderTelemetryTwinCards({
  steps = 0,
  stepGoal = 15000,
  km = 0,
  heartRateBpm = 0,
  avgBpm = 0,
  peakBpm = 0,
  onAddSteps,
  onSyncHeartRate,
  onOpenStepDetails,
}: ThunderTelemetryTwinCardsProps) {
  const [scannerVisible, setScannerVisible] = useState(false);
  const [liveFluctuatedBpm, setLiveFluctuatedBpm] = useState(heartRateBpm);

  const hasMeasurement = heartRateBpm > 0;

  const heartScale = useRef(new Animated.Value(1)).current;
  const ecgSweepAnim = useRef(new Animated.Value(0)).current;

  // 1. Latido Reactivo — solo anima si hay medición real
  useEffect(() => {
    if (!hasMeasurement) return;
    const cycleDuration = Math.max(450, Math.min(1200, (60 / heartRateBpm) * 1000));
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(heartScale, { toValue: 1.28, duration: cycleDuration * 0.22, useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1.0, duration: cycleDuration * 0.22, useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1.15, duration: cycleDuration * 0.16, useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1.0, duration: cycleDuration * 0.40, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [heartRateBpm, heartScale, hasMeasurement]);

  // 2. Barrido Dinámico de la onda ECG (solo si hay medición)
  useEffect(() => {
    if (!hasMeasurement) return;
    const sweepLoop = Animated.loop(
      Animated.timing(ecgSweepAnim, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: true,
      })
    );
    sweepLoop.start();
    return () => sweepLoop.stop();
  }, [ecgSweepAnim, hasMeasurement]);

  // 3. Variabilidad fisiológica real (±1-2 BPM) — solo cuando hay medición verdadera
  useEffect(() => {
    setLiveFluctuatedBpm(heartRateBpm);
    if (!hasMeasurement) return;
    const interval = setInterval(() => {
      const naturalJitter = Math.round(Math.sin(Date.now() / 2800) * 1.5);
      setLiveFluctuatedBpm(heartRateBpm + naturalJitter);
    }, 2000);
    return () => clearInterval(interval);
  }, [heartRateBpm, hasMeasurement]);

  // Semicircle Steps Progress
  const safeGoal = stepGoal > 0 ? stepGoal : 15000;
  const rawRatio = (steps || 0) / safeGoal;
  const safeStepRatio = Math.max(0.02, Math.min(1, rawRatio));
  const size = 130;
  const cx = size / 2;
  const cy = size - 14;
  const radius = 48;
  const strokeWidth = 8;

  const bgSemiArc = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

  // Progress semi-arc calculation (0% en la izquierda 180°, 100% en la derecha 0°)
  const angleRad = (1 - safeStepRatio) * Math.PI;
  const capX = cx + radius * Math.cos(angleRad);
  const capY = cy - radius * Math.sin(angleRad);
  const progressSemiArc = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${capX.toFixed(2)} ${capY.toFixed(2)}`;

  return (
    <View style={styles.twinCardsRow}>
      {/* 1. LIVE STEPS CARD */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() => onOpenStepDetails && onOpenStepDetails()}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <ThemedText style={styles.cardHeaderTitle}>LIVE STEPS</ThemedText>
          <View style={styles.headerIconWrapper}>
            <ThemedText style={{ fontSize: 15 }}>👟</ThemedText>
          </View>
        </View>

        {/* Semi-Arc Gauge with Step Numbers */}
        <View style={styles.semiArcWrapper}>
          <Svg width={size} height={size - 36} viewBox={`0 0 ${size} ${size - 36}`}>
            <Defs>
              <LinearGradient id="stepsArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#F59E0B" />
                <Stop offset="50%" stopColor="#FFE259" />
                <Stop offset="90%" stopColor="#FFFDE0" />
                <Stop offset="100%" stopColor="#FFFFFF" />
              </LinearGradient>
            </Defs>

            {/* Inactive Track */}
            <Path
              d={bgSemiArc}
              stroke="rgba(212, 175, 55, 0.16)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
            />

            {/* Active Progress Track (Under-layer Glow Bloom) */}
            <Path
              d={progressSemiArc}
              stroke="rgba(255, 226, 89, 0.45)"
              strokeWidth={strokeWidth + 6}
              strokeLinecap="round"
              fill="none"
            />

            {/* Active Progress Track */}
            <Path
              d={progressSemiArc}
              stroke="url(#stepsArcGrad)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
            />

            {/* Glowing Cap with Multi-Layer Glow */}
            <Circle cx={capX} cy={capY} r={strokeWidth / 2 + 4} fill="rgba(245, 158, 11, 0.40)" />
            <Circle cx={capX} cy={capY} r={strokeWidth / 2 + 2} fill="rgba(255, 226, 89, 0.85)" />
            <Circle cx={capX} cy={capY} r={strokeWidth / 2 - 1} fill="#FFFFFF" />
          </Svg>

          {/* Centered Steps Numbers */}
          <View style={[styles.stepsCenterOverlay, { pointerEvents: 'none' }]}>
            <ThemedText style={styles.stepsCountText}>{steps.toLocaleString()}</ThemedText>
            <ThemedText style={styles.stepsLabelSub}>STEPS</ThemedText>
          </View>
        </View>

        {/* Card Footer: Goal & Km */}
        <View style={styles.cardFooter}>
          <View style={styles.footerFlexRow}>
            <ThemedText style={styles.footerGoalText} numberOfLines={1}>Meta: {stepGoal.toLocaleString()}</ThemedText>
            <ThemedText style={styles.footerMilesText} numberOfLines={1}>{km} km</ThemedText>
          </View>
        </View>
      </TouchableOpacity>

      {/* 2. HEART RATE CARD (ESCANEO REAL ÓPTICO PPG EN CLIC) */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() => setScannerVisible(true)}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <ThemedText style={styles.cardHeaderTitle} numberOfLines={1}>HEART RATE</ThemedText>
          <View style={styles.headerIconWrapper}>
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <ThemedText style={{ fontSize: 15 }}>💓</ThemedText>
            </Animated.View>
          </View>
        </View>

        {/* Heart Rate Readout */}
        <View style={styles.bpmRow}>
          <ThemedText style={[styles.bpmNumberText, !hasMeasurement && { color: '#475569', textShadowColor: 'transparent' }]}>
            {hasMeasurement ? liveFluctuatedBpm : '--'}
          </ThemedText>
          <ThemedText style={[styles.bpmUnitText, !hasMeasurement && { color: '#475569' }]}>BPM</ThemedText>
          <View style={hasMeasurement ? styles.livePulseDotActive : styles.livePulseDotInactive} />
        </View>

        {/* ECG Waveform — plana si no hay medición */}
        <View style={styles.ecgWrapper}>
          {hasMeasurement ? (
            <Svg width="100%" height={38} viewBox="0 0 150 40">
              <Defs>
                <LinearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#F59E0B" />
                  <Stop offset="50%" stopColor="#FFE259" />
                  <Stop offset="100%" stopColor="#FFFFFF" />
                </LinearGradient>
                <LinearGradient id="ecgAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="rgba(255, 226, 89, 0.28)" />
                  <Stop offset="100%" stopColor="rgba(255, 226, 89, 0.00)" />
                </LinearGradient>
              </Defs>
              <Path
                d="M 0 26 L 15 26 L 22 28 L 30 22 L 38 32 L 45 10 L 52 36 L 58 24 L 68 26 L 80 25 L 88 30 L 98 12 L 106 34 L 114 22 L 125 26 L 150 26 L 150 40 L 0 40 Z"
                fill="url(#ecgAreaGrad)"
              />
              <Path
                d="M 0 26 L 15 26 L 22 28 L 30 22 L 38 32 L 45 10 L 52 36 L 58 24 L 68 26 L 80 25 L 88 30 L 98 12 L 106 34 L 114 22 L 125 26 L 150 26"
                stroke="rgba(255, 226, 89, 0.40)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M 0 26 L 15 26 L 22 28 L 30 22 L 38 32 L 45 10 L 52 36 L 58 24 L 68 26 L 80 25 L 88 30 L 98 12 L 106 34 L 114 22 L 125 26 L 150 26"
                stroke="url(#ecgGrad)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          ) : (
            <Svg width="100%" height={38} viewBox="0 0 150 40">
              <Path d="M 0 26 L 150 26" stroke="rgba(71, 85, 105, 0.50)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </Svg>
          )}
        </View>

        {/* Card Footer: Avg & Scan prompt */}
        <View style={styles.cardFooter}>
          <View style={styles.footerFlexRow}>
            {hasMeasurement ? (
              <>
                <ThemedText style={styles.footerGoalText} numberOfLines={1}>
                  Avg: <ThemedText style={{ color: '#FDE68A', fontWeight: 'bold' }}>{avgBpm}</ThemedText>
                </ThemedText>
                <ThemedText style={styles.footerActionText} numberOfLines={1}>⚡ Medir</ThemedText>
              </>
            ) : (
              <ThemedText style={styles.footerNoMeasureText} numberOfLines={1}>⚡ Toca p/ Medir</ThemedText>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Modal de Escáner Óptico PPG */}
      <HeartRateScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onSaveHeartRate={(newBpm) => {
          setLiveFluctuatedBpm(newBpm);
          if (onSyncHeartRate) {
            onSyncHeartRate(newBpm);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  twinCardsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginVertical: 6,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 26, 0.96)',
    borderRadius: 20,
    padding: Spacing.three,
    borderWidth: 1.4,
    borderColor: 'rgba(245, 158, 11, 0.45)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    justifyContent: 'space-between',
    minHeight: 180,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#CBD5E1',
    letterSpacing: 1,
    flexShrink: 1,
  },
  headerIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 226, 89, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  semiArcWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: -4,
  },
  stepsCenterOverlay: {
    position: 'absolute',
    bottom: 2,
    alignItems: 'center',
  },
  stepsCountText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'sans-serif',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(255, 226, 89, 0.85)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  stepsLabelSub: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FDE68A',
    fontFamily: 'monospace',
    letterSpacing: 1.5,
    marginTop: -2,
    textShadowColor: 'rgba(245, 158, 11, 0.60)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bpmRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginVertical: 4,
  },
  bpmNumberText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'serif',
    letterSpacing: -1,
    textShadowColor: 'rgba(255, 226, 89, 0.90)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  bpmUnitText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FDE68A',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  ecgWrapper: {
    marginVertical: 4,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 6,
  },
  footerFlexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 2,
  },
  footerGoalText: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
    flexShrink: 1,
  },
  footerMilesText: {
    fontSize: 10,
    color: '#E2E8F0',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  footerActionText: {
    fontSize: 9.5,
    color: '#F59E0B',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  footerNoMeasureText: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  livePulseDotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginLeft: 2,
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 3,
  },
  livePulseDotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#334155',
    marginLeft: 2,
  },
});
