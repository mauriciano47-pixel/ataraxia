import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { ThemedText } from './themed-text';

export interface GlowArcGaugeProps {
  strengthProgress?: number; // 0.0 to 1.0 (Physical: Training, Steps, Calories)
  virtueProgress?: number;   // 0.0 to 1.0 (Stoic: Water, Meditation, Check-in)
  overallProgress?: number;  // 0.0 to 1.0 (Combined Ataraxia Score)
  size?: number;
  steps?: number;
  stepGoal?: number;
  km?: number;
  calories?: number;
  waterLitres?: number;
  trainingCompleted?: boolean;
  streakDays?: number;
}

export function GlowArcGauge({
  strengthProgress = 0.82,
  virtueProgress = 0.74,
  overallProgress,
  size = 280,
  steps = 8450,
  stepGoal = 10000,
  km = 6.2,
  calories = 340,
  waterLitres = 2.4,
  trainingCompleted = true,
  streakDays = 14,
}: GlowArcGaugeProps) {
  // Mode selector: 'combined' | 'strength' | 'virtue'
  const [activeMode, setActiveMode] = useState<'combined' | 'strength' | 'virtue'>('combined');

  const computedOverall = overallProgress ?? Math.round(((strengthProgress + virtueProgress) / 2) * 100) / 100;

  const strengthPct = Math.round(Math.min(1, Math.max(0, strengthProgress)) * 100);
  const virtuePct = Math.round(Math.min(1, Math.max(0, virtueProgress)) * 100);
  const overallPct = Math.round(Math.min(1, Math.max(0, computedOverall)) * 100);

  // Outer Arc Parameters (Fuerza - Cobalt Blue)
  const outerStrokeWidth = 14;
  const outerRadius = (size - outerStrokeWidth - 8) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Inner Arc Parameters (Virtud - Imperial Gold)
  const innerStrokeWidth = 10;
  const innerRadius = outerRadius - 18;

  // Arc Angle: 135 deg to 405 deg (270 deg total)
  const startAngle = 135;
  const endAngle = 405;
  const totalAngle = endAngle - startAngle;

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(x, y, r, endA);
    const end = polarToCartesian(x, y, r, startA);
    const largeArcFlag = endA - startA <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const backgroundArcOuter = describeArc(cx, cy, outerRadius, startAngle, endAngle);
  const backgroundArcInner = describeArc(cx, cy, innerRadius, startAngle, endAngle);

  const strengthAngle = startAngle + totalAngle * Math.min(1, Math.max(0, strengthProgress));
  const virtueAngle = startAngle + totalAngle * Math.min(1, Math.max(0, virtueProgress));

  const progressArcOuter = describeArc(cx, cy, outerRadius, startAngle, strengthAngle);
  const progressArcInner = describeArc(cx, cy, innerRadius, startAngle, virtueAngle);

  // Endpoint indicator dots
  const outerCapPos = polarToCartesian(cx, cy, outerRadius, strengthAngle);
  const innerCapPos = polarToCartesian(cx, cy, innerRadius, virtueAngle);

  const displayPercent =
    activeMode === 'strength' ? strengthPct : activeMode === 'virtue' ? virtuePct : overallPct;

  const displayLabel =
    activeMode === 'strength'
      ? 'FUERZA ESPARTANA'
      : activeMode === 'virtue'
      ? 'VIRTUD ESTOICA'
      : 'FUERZA & VIRTUD';

  const displayColor =
    activeMode === 'strength' ? '#00C6FF' : activeMode === 'virtue' ? '#E2C068' : '#FFFFFF';

  return (
    <View style={styles.container}>
      {/* MODE TABS ABOVE SPHERE */}
      <View style={styles.modeTabsRow}>
        <TouchableOpacity
          style={[styles.tabChip, activeMode === 'strength' && styles.tabChipStrengthActive]}
          onPress={() => setActiveMode(activeMode === 'strength' ? 'combined' : 'strength')}
          activeOpacity={0.75}
        >
          <ThemedText style={[styles.tabChipText, activeMode === 'strength' && styles.tabTextBlue]}>
            ⚔️ Fuerza: {strengthPct}%
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabChip, activeMode === 'combined' && styles.tabChipCombinedActive]}
          onPress={() => setActiveMode('combined')}
          activeOpacity={0.75}
        >
          <ThemedText style={[styles.tabChipText, activeMode === 'combined' && styles.tabTextGold]}>
            ⚖️ Ataraxia: {overallPct}%
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabChip, activeMode === 'virtue' && styles.tabChipVirtueActive]}
          onPress={() => setActiveMode(activeMode === 'virtue' ? 'combined' : 'virtue')}
          activeOpacity={0.75}
        >
          <ThemedText style={[styles.tabChipText, activeMode === 'virtue' && styles.tabTextGold]}>
            🏛️ Virtud: {virtuePct}%
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* DUAL GLOWING SPHERE */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          setActiveMode((prev) => (prev === 'combined' ? 'strength' : prev === 'strength' ? 'virtue' : 'combined'))
        }
        style={{ width: size, height: size - 20, alignItems: 'center', justifyContent: 'center' }}
      >
        <Svg width={size} height={size} style={styles.svgAbsolute}>
          <Defs>
            {/* Fuerza Gradient: Cobalt Blue (#1D64F2) to Cyan (#00C6FF) */}
            <LinearGradient id="strengthGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#1D64F2" />
              <Stop offset="50%" stopColor="#2563EB" />
              <Stop offset="100%" stopColor="#00C6FF" />
            </LinearGradient>

            {/* Virtud Gradient: Imperial Gold (#E2C068) to Warm Amber (#F5D77F) */}
            <LinearGradient id="virtueGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#B8860B" />
              <Stop offset="50%" stopColor="#E2C068" />
              <Stop offset="100%" stopColor="#F5D77F" />
            </LinearGradient>

            {/* Track Background */}
            <LinearGradient id="bgTrackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.08)" />
              <Stop offset="100%" stopColor="rgba(255, 255, 255, 0.03)" />
            </LinearGradient>
          </Defs>

          {/* Inner Glass Disc Background */}
          <Circle
            cx={cx}
            cy={cy}
            r={innerRadius - 12}
            fill="rgba(14, 20, 36, 0.75)"
            stroke="rgba(226, 192, 104, 0.22)"
            strokeWidth={1}
          />

          {/* Outer Background Track (Fuerza) */}
          <Path
            d={backgroundArcOuter}
            fill="none"
            stroke="url(#bgTrackGradient)"
            strokeWidth={outerStrokeWidth}
            strokeLinecap="round"
            opacity={activeMode === 'virtue' ? 0.35 : 1}
          />

          {/* Outer Active Progress Arc (Fuerza) */}
          <Path
            d={progressArcOuter}
            fill="none"
            stroke="url(#strengthGradient)"
            strokeWidth={outerStrokeWidth}
            strokeLinecap="round"
            opacity={activeMode === 'virtue' ? 0.4 : 1}
          />

          {/* Outer Cap Glow Dot */}
          {strengthProgress > 0 && activeMode !== 'virtue' && (
            <Circle cx={outerCapPos.x} cy={outerCapPos.y} r={outerStrokeWidth / 2 + 2} fill="#00C6FF" />
          )}

          {/* Inner Background Track (Virtud) */}
          <Path
            d={backgroundArcInner}
            fill="none"
            stroke="url(#bgTrackGradient)"
            strokeWidth={innerStrokeWidth}
            strokeLinecap="round"
            opacity={activeMode === 'strength' ? 0.35 : 1}
          />

          {/* Inner Active Progress Arc (Virtud) */}
          <Path
            d={progressArcInner}
            fill="none"
            stroke="url(#virtueGradient)"
            strokeWidth={innerStrokeWidth}
            strokeLinecap="round"
            opacity={activeMode === 'strength' ? 0.4 : 1}
          />

          {/* Inner Cap Glow Dot */}
          {virtueProgress > 0 && activeMode !== 'strength' && (
            <Circle cx={innerCapPos.x} cy={innerCapPos.y} r={innerStrokeWidth / 2 + 2} fill="#F5D77F" />
          )}
        </Svg>

        {/* CENTER CONTENTS */}
        <View style={styles.centerContent}>
          <ThemedText style={styles.badgeCategoryText}>{displayLabel}</ThemedText>

          <View style={styles.percentGlowWrapper}>
            <ThemedText style={[styles.percentText, { color: displayColor }]}>
              {displayPercent}%
            </ThemedText>
          </View>

          {/* PILL BADGES ROW IN SPHERE */}
          <View style={styles.pillBadgesRow}>
            <View style={styles.glassPill}>
              <ThemedText style={styles.pillText}>🔥 {calories} kcal</ThemedText>
            </View>
            <View style={styles.glassPill}>
              <ThemedText style={styles.pillText}>👟 {steps.toLocaleString()}</ThemedText>
            </View>
            <View style={styles.glassPill}>
              <ThemedText style={styles.pillText}>💧 {waterLitres.toFixed(1)}L</ThemedText>
            </View>
          </View>

          {activeMode === 'strength' && (
            <ThemedText style={styles.subDetailText}>
              🏋️‍♂️ {trainingCompleted ? 'Entrenamiento Completado ✓' : 'Sesión Pendiente'} | 📍 {km.toFixed(1)} km
            </ThemedText>
          )}

          {activeMode === 'virtue' && (
            <ThemedText style={styles.subDetailText}>
              🔥 Racha: {streakDays} Días | 📖 Diario Estoico Activo
            </ThemedText>
          )}

          {activeMode === 'combined' && (
            <ThemedText style={styles.subDetailText}>
              ⚔️ Fuerza: {strengthPct}% • 🏛️ Virtud: {virtuePct}%
            </ThemedText>
          )}

          <ThemedText style={styles.goalSubtext}>Toca la esfera para alternar vista</ThemedText>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  modeTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  tabChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(14, 20, 36, 0.90)',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 192, 104, 0.25)',
  },
  tabChipStrengthActive: {
    borderColor: '#00C6FF',
    backgroundColor: 'rgba(0, 198, 255, 0.18)',
  },
  tabChipVirtueActive: {
    borderColor: '#E2C068',
    backgroundColor: 'rgba(226, 192, 104, 0.18)',
  },
  tabChipCombinedActive: {
    borderColor: '#F8FAFC',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  tabChipText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  tabTextBlue: {
    color: '#00C6FF',
    fontWeight: 'bold',
  },
  tabTextGold: {
    color: '#E2C068',
    fontWeight: 'bold',
  },
  svgAbsolute: {
    position: 'absolute',
    top: 0,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  badgeCategoryText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#E2C068',
    letterSpacing: 2.5,
    fontWeight: 'bold',
    marginBottom: -4,
  },
  percentGlowWrapper: {
    marginVertical: 2,
  },
  percentText: {
    fontSize: 54,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'serif',
    letterSpacing: -1.5,
  },
  pillBadgesRow: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 4,
  },
  glassPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  pillText: {
    fontSize: 10,
    color: '#E2E8F0',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  subDetailText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  goalSubtext: {
    fontSize: 9,
    color: '#94A3B8',
    fontFamily: 'monospace',
    marginTop: 4,
    opacity: 0.8,
  },
});
