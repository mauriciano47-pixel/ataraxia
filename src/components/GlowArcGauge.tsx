import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { ThemedText } from './themed-text';

export interface GlowArcGaugeProps {
  strengthProgress?: number; // 0.0 to 1.0
  virtueProgress?: number;   // 0.0 to 1.0
  overallProgress?: number;  // 0.0 to 1.0
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
  strengthProgress = 0.85,
  virtueProgress = 0.80,
  overallProgress = 0.83,
  size = 310,
  steps = 8450,
  calories = 520,
  waterLitres = 2.4,
  trainingCompleted = true,
}: GlowArcGaugeProps) {
  const [activeMode, setActiveMode] = useState<'combined' | 'strength' | 'virtue'>('combined');

  const strengthPct = Math.round(Math.min(1, Math.max(0, strengthProgress)) * 100);
  const virtuePct = Math.round(Math.min(1, Math.max(0, virtueProgress)) * 100);
  const overallPct = Math.round(Math.min(1, Math.max(0, overallProgress)) * 100);

  const cx = size / 2;
  const cy = size / 2;

  // Outer Arc (Power & Strength - Amber Electric)
  const outerStrokeWidth = 12;
  const outerRadius = (size - outerStrokeWidth - 10) / 2;

  // Inner Arc (Virtue & Recovery - Cyan Blue)
  const innerStrokeWidth = 9;
  const innerRadius = outerRadius - 22;

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

  const outerCapPos = polarToCartesian(cx, cy, outerRadius, strengthAngle);
  const innerCapPos = polarToCartesian(cx, cy, innerRadius, virtueAngle);

  const displayPercent =
    activeMode === 'strength' ? strengthPct : activeMode === 'virtue' ? virtuePct : overallPct;

  const displayLabel =
    activeMode === 'strength'
      ? 'POTENCIA & SOBRECARGA'
      : activeMode === 'virtue'
      ? 'RECUPERACIÓN ESTOICA'
      : 'POWER GRID INDEX';

  const displayColor =
    activeMode === 'strength' ? '#FF9100' : activeMode === 'virtue' ? '#00C6FF' : '#FFAB00';

  return (
    <View style={styles.container}>
      {/* MODE CHIPS (POWER GRID ATHLETIC STYLE) */}
      <View style={styles.modeTabsRow}>
        <TouchableOpacity
          style={[styles.tabChip, activeMode === 'strength' && styles.tabChipStrengthActive]}
          onPress={() => setActiveMode(activeMode === 'strength' ? 'combined' : 'strength')}
          activeOpacity={0.8}
        >
          <ThemedText style={[styles.tabChipText, activeMode === 'strength' && styles.tabTextAmber]}>
            ⚡ Fuerza: {strengthPct}%
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabChip, activeMode === 'combined' && styles.tabChipCombinedActive]}
          onPress={() => setActiveMode('combined')}
          activeOpacity={0.8}
        >
          <ThemedText style={[styles.tabChipText, activeMode === 'combined' && styles.tabTextGold]}>
            🏋️‍♂️ Power Grid: {overallPct}%
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabChip, activeMode === 'virtue' && styles.tabChipVirtueActive]}
          onPress={() => setActiveMode(activeMode === 'virtue' ? 'combined' : 'virtue')}
          activeOpacity={0.8}
        >
          <ThemedText style={[styles.tabChipText, activeMode === 'virtue' && styles.tabTextCyan]}>
            🧘 Virtud: {virtuePct}%
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* DUAL ELECTRIC SPHERE */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          setActiveMode((prev) => (prev === 'combined' ? 'strength' : prev === 'strength' ? 'virtue' : 'combined'))
        }
        style={{ width: size, height: size - 10, alignItems: 'center', justifyContent: 'center' }}
      >
        <Svg width={size} height={size} style={styles.svgAbsolute}>
          <Defs>
            {/* Amber Electric Gradient */}
            <LinearGradient id="amberPowerGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#D97706" />
              <Stop offset="50%" stopColor="#FF9100" />
              <Stop offset="100%" stopColor="#FFC107" />
            </LinearGradient>

            {/* Cyan Athletic Gradient */}
            <LinearGradient id="cyanAthleticGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#1D64F2" />
              <Stop offset="50%" stopColor="#2563EB" />
              <Stop offset="100%" stopColor="#00C6FF" />
            </LinearGradient>

            {/* Dark Graphite Metallic Disc */}
            <LinearGradient id="graphiteDiscGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#1E293B" />
              <Stop offset="50%" stopColor="#0F172A" />
              <Stop offset="100%" stopColor="#0B0F19" />
            </LinearGradient>

            {/* Track Background */}
            <LinearGradient id="bgTrackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.08)" />
              <Stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
            </LinearGradient>
          </Defs>

          {/* Central Graphite Disc */}
          <Circle
            cx={cx}
            cy={cy}
            r={innerRadius - 14}
            fill="url(#graphiteDiscGrad)"
            stroke="rgba(255, 145, 0, 0.35)"
            strokeWidth={1.5}
          />

          {/* Outer Arc Background Track */}
          <Path
            d={backgroundArcOuter}
            fill="none"
            stroke="url(#bgTrackGrad)"
            strokeWidth={outerStrokeWidth}
            strokeLinecap="round"
          />

          {/* Outer Arc Progress (Amber) */}
          <Path
            d={progressArcOuter}
            fill="none"
            stroke="url(#amberPowerGrad)"
            strokeWidth={outerStrokeWidth}
            strokeLinecap="round"
          />

          {/* Outer Cap Glow Dot */}
          {strengthProgress > 0 && (
            <Circle cx={outerCapPos.x} cy={outerCapPos.y} r={outerStrokeWidth / 2 + 2} fill="#FFC107" />
          )}

          {/* Inner Arc Background Track */}
          <Path
            d={backgroundArcInner}
            fill="none"
            stroke="url(#bgTrackGrad)"
            strokeWidth={innerStrokeWidth}
            strokeLinecap="round"
          />

          {/* Inner Arc Progress (Cyan) */}
          <Path
            d={progressArcInner}
            fill="none"
            stroke="url(#cyanAthleticGrad)"
            strokeWidth={innerStrokeWidth}
            strokeLinecap="round"
          />

          {/* Inner Cap Glow Dot */}
          {virtueProgress > 0 && (
            <Circle cx={innerCapPos.x} cy={innerCapPos.y} r={innerStrokeWidth / 2 + 2} fill="#00C6FF" />
          )}
        </Svg>

        {/* CENTER OVERLAY CONTENT */}
        <View style={styles.centerContent}>
          <ThemedText style={styles.badgeCategoryText}>{displayLabel}</ThemedText>

          <View style={styles.percentGlowWrapper}>
            <ThemedText style={[styles.percentText, { color: displayColor }]}>
              {displayPercent}%
            </ThemedText>
          </View>

          {/* ATHLETIC PILL BADGES */}
          <View style={styles.pillBadgesRow}>
            <View style={styles.amberPill}>
              <ThemedText style={styles.amberPillText}>⚡ {calories} kcal</ThemedText>
            </View>
            <View style={styles.cyanPill}>
              <ThemedText style={styles.cyanPillText}>👟 {steps.toLocaleString()}</ThemedText>
            </View>
            <View style={styles.amberPill}>
              <ThemedText style={styles.amberPillText}>💧 {waterLitres.toFixed(1)}L</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.subDetailText}>
            {trainingCompleted ? '🏆 Entreno Completado (RPE 8.5)' : '⏳ Sesión de Fuerza Pendiente'}
          </ThemedText>

          <ThemedText style={styles.goalSubtext}>SOBRECARGA PROGRESIVA • ATHLETIC GRID</ThemedText>
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
    marginBottom: 10,
  },
  tabChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 145, 0, 0.25)',
  },
  tabChipStrengthActive: {
    borderColor: '#FF9100',
    backgroundColor: 'rgba(255, 145, 0, 0.20)',
  },
  tabChipVirtueActive: {
    borderColor: '#00C6FF',
    backgroundColor: 'rgba(0, 198, 255, 0.20)',
  },
  tabChipCombinedActive: {
    borderColor: '#FFAB00',
    backgroundColor: 'rgba(255, 171, 0, 0.15)',
  },
  tabChipText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  tabTextAmber: {
    color: '#FF9100',
  },
  tabTextCyan: {
    color: '#00C6FF',
  },
  tabTextGold: {
    color: '#FFAB00',
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
    color: '#FF9100',
    letterSpacing: 2,
    fontWeight: 'bold',
    marginBottom: -4,
  },
  percentGlowWrapper: {
    marginVertical: 2,
  },
  percentText: {
    fontSize: 54,
    fontWeight: '900',
    fontFamily: 'sans-serif',
    letterSpacing: -1.5,
    textShadowColor: 'rgba(255, 145, 0, 0.50)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  pillBadgesRow: {
    flexDirection: 'row',
    gap: 5,
    marginVertical: 4,
  },
  amberPill: {
    backgroundColor: 'rgba(255, 145, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 145, 0, 0.35)',
  },
  amberPillText: {
    fontSize: 10,
    color: '#FFAB00',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  cyanPill: {
    backgroundColor: 'rgba(0, 198, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 198, 255, 0.35)',
  },
  cyanPillText: {
    fontSize: 10,
    color: '#00C6FF',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  subDetailText: {
    fontSize: 11,
    color: '#F8FAFC',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginTop: 2,
  },
  goalSubtext: {
    fontSize: 9,
    color: '#FF9100',
    fontFamily: 'monospace',
    marginTop: 4,
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
});
