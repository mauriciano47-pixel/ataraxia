import { Spacing } from '@/constants/theme';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { ThemedText } from './themed-text';

interface ThunderTelemetryTwinCardsProps {
  steps?: number;
  stepGoal?: number;
  km?: number;
  heartRateBpm?: number;
  avgBpm?: number;
  peakBpm?: number;
  onAddSteps?: (amount: number) => void;
  onSyncHeartRate?: () => void;
}

export function ThunderTelemetryTwinCards({
  steps = 14892,
  stepGoal = 15000,
  km = 7.4,
  heartRateBpm = 78,
  avgBpm = 68,
  peakBpm = 145,
  onAddSteps,
  onSyncHeartRate,
}: ThunderTelemetryTwinCardsProps) {
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
      {/* 1. LIVE STEPS CARD (EXACT TO REFERENCE) */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => onAddSteps && onAddSteps(1000)}
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
          <ThemedText style={styles.footerGoalText}>Goal: {stepGoal.toLocaleString()}</ThemedText>
          <ThemedText style={styles.footerMilesText}>{km} km</ThemedText>
        </View>
      </TouchableOpacity>

      {/* 2. HEART RATE CARD (EXACT TO REFERENCE) */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => onSyncHeartRate && onSyncHeartRate()}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <ThemedText style={styles.cardHeaderTitle}>HEART RATE</ThemedText>
          <View style={styles.headerIconWrapper}>
            <ThemedText style={{ fontSize: 15 }}>💓</ThemedText>
          </View>
        </View>

        {/* Heart Rate Readout */}
        <View style={styles.bpmRow}>
          <ThemedText style={styles.bpmNumberText}>{heartRateBpm}</ThemedText>
          <ThemedText style={styles.bpmUnitText}>BPM</ThemedText>
        </View>

        {/* ECG Waveform SVG Graph */}
        <View style={styles.ecgWrapper}>
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

            {/* Area Fill */}
            <Path
              d="M 0 26 L 15 26 L 22 28 L 30 22 L 38 32 L 45 10 L 52 36 L 58 24 L 68 26 L 80 25 L 88 30 L 98 12 L 106 34 L 114 22 L 125 26 L 150 26 L 150 40 L 0 40 Z"
              fill="url(#ecgAreaGrad)"
            />

            {/* Line Glow Bloom */}
            <Path
              d="M 0 26 L 15 26 L 22 28 L 30 22 L 38 32 L 45 10 L 52 36 L 58 24 L 68 26 L 80 25 L 88 30 L 98 12 L 106 34 L 114 22 L 125 26 L 150 26"
              stroke="rgba(255, 226, 89, 0.40)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Line Stroke */}
            <Path
              d="M 0 26 L 15 26 L 22 28 L 30 22 L 38 32 L 45 10 L 52 36 L 58 24 L 68 26 L 80 25 L 88 30 L 98 12 L 106 34 L 114 22 L 125 26 L 150 26"
              stroke="url(#ecgGrad)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </View>

        {/* Card Footer: Avg & Peak */}
        <View style={styles.cardFooter}>
          <ThemedText style={styles.footerEcgText}>
            Avg: <ThemedText style={{ color: '#FDE68A', fontWeight: 'bold' }}>{avgBpm}</ThemedText> - Peak: <ThemedText style={{ color: '#FDE68A', fontWeight: 'bold' }}>{peakBpm}</ThemedText>
          </ThemedText>
        </View>
      </TouchableOpacity>
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
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderTitle: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#CBD5E1',
    letterSpacing: 1.5,
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
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'serif',
    letterSpacing: -1,
    textShadowColor: 'rgba(255, 226, 89, 0.90)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  bpmUnitText: {
    fontSize: 12,
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
  footerGoalText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  footerMilesText: {
    fontSize: 10.5,
    color: '#E2E8F0',
    fontWeight: '700',
    marginTop: 1,
  },
  footerEcgText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
});
