import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, RadialGradient } from 'react-native-svg';
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

  // Outer Arc (Power & Strength - Imperial Gold Thunder)
  const outerStrokeWidth = 12;
  const outerRadius = (size - outerStrokeWidth - 10) / 2;

  // Inner Arc (Virtue & Recovery - Warm Amber Gold)
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
      ? '⚡ FUERZA & SOBRECARGA'
      : activeMode === 'virtue'
      ? '🏛️ DISCIPLINA & VIRTUD'
      : '⚡ TRUENO ESTOICO INDEX';

  const displayColor = '#D4AF37'; // Oro Imperial Primario

  return (
    <View style={styles.container}>
      {/* MODE CHIPS (IMPERIAL GOLD ATHLETIC STYLE) */}
      <View style={styles.modeTabsRow}>
        <TouchableOpacity
          style={[styles.tabChip, activeMode === 'strength' && styles.tabChipActive]}
          onPress={() => setActiveMode(activeMode === 'strength' ? 'combined' : 'strength')}
          activeOpacity={0.8}
        >
          <ThemedText style={[styles.tabChipText, activeMode === 'strength' && styles.tabTextGold]}>
            ⚡ Fuerza: {strengthPct}%
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabChip, activeMode === 'combined' && styles.tabChipActive]}
          onPress={() => setActiveMode('combined')}
          activeOpacity={0.8}
        >
          <ThemedText style={[styles.tabChipText, activeMode === 'combined' && styles.tabTextGoldVivid]}>
            🏛️ Trueno: {overallPct}%
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabChip, activeMode === 'virtue' && styles.tabChipActive]}
          onPress={() => setActiveMode(activeMode === 'virtue' ? 'combined' : 'virtue')}
          activeOpacity={0.8}
        >
          <ThemedText style={[styles.tabChipText, activeMode === 'virtue' && styles.tabTextGold]}>
            🧘 Virtud: {virtuePct}%
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* DUAL GOLD THUNDER SPHERE */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          setActiveMode((prev) => (prev === 'combined' ? 'strength' : prev === 'strength' ? 'virtue' : 'combined'))
        }
        style={{ width: size, height: size - 10, alignItems: 'center', justifyContent: 'center' }}
      >
        <Svg width={size} height={size} style={styles.svgAbsolute}>
          <Defs>
            {/* Imperial Gold Thunder Gradient */}
            <LinearGradient id="goldPowerGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#B45309" />
              <Stop offset="40%" stopColor="#D4AF37" />
              <Stop offset="70%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#FFE066" />
            </LinearGradient>

            {/* Warm Amber Gold Gradient */}
            <LinearGradient id="amberVirtueGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#78350F" />
              <Stop offset="50%" stopColor="#D4AF37" />
              <Stop offset="100%" stopColor="#FDE68A" />
            </LinearGradient>

            {/* Deep Onyx Black Disc */}
            <LinearGradient id="onyxDiscGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#131722" />
              <Stop offset="50%" stopColor="#0A0D15" />
              <Stop offset="100%" stopColor="#050507" />
            </LinearGradient>

            {/* Track Background */}
            <LinearGradient id="bgTrackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="rgba(212, 175, 55, 0.12)" />
              <Stop offset="100%" stopColor="rgba(212, 175, 55, 0.03)" />
            </LinearGradient>

            {/* Radial Glow */}
            <RadialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="rgba(212, 175, 55, 0.15)" />
              <Stop offset="100%" stopColor="transparent" />
            </RadialGradient>
          </Defs>

          {/* Central Onyx Disc */}
          <Circle
            cx={cx}
            cy={cy}
            r={innerRadius - 14}
            fill="url(#onyxDiscGrad)"
            stroke="rgba(212, 175, 55, 0.40)"
            strokeWidth={1.8}
          />
          <Circle
            cx={cx}
            cy={cy}
            r={innerRadius - 16}
            fill="url(#centerGlow)"
          />

          {/* Outer Arc Background Track */}
          <Path
            d={backgroundArcOuter}
            fill="none"
            stroke="url(#bgTrackGrad)"
            strokeWidth={outerStrokeWidth}
            strokeLinecap="round"
          />

          {/* Outer Arc Progress (Imperial Gold) */}
          <Path
            d={progressArcOuter}
            fill="none"
            stroke="url(#goldPowerGrad)"
            strokeWidth={outerStrokeWidth}
            strokeLinecap="round"
          />

          {/* Outer Cap Glow Dot */}
          {strengthProgress > 0 && (
            <Circle cx={outerCapPos.x} cy={outerCapPos.y} r={outerStrokeWidth / 2 + 2} fill="#FFE066" />
          )}

          {/* Inner Arc Background Track */}
          <Path
            d={backgroundArcInner}
            fill="none"
            stroke="url(#bgTrackGrad)"
            strokeWidth={innerStrokeWidth}
            strokeLinecap="round"
          />

          {/* Inner Arc Progress (Warm Amber Gold) */}
          <Path
            d={progressArcInner}
            fill="none"
            stroke="url(#amberVirtueGrad)"
            strokeWidth={innerStrokeWidth}
            strokeLinecap="round"
          />

          {/* Inner Cap Glow Dot */}
          {virtueProgress > 0 && (
            <Circle cx={innerCapPos.x} cy={innerCapPos.y} r={innerStrokeWidth / 2 + 2} fill="#FDE68A" />
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

          {/* ATHLETIC GOLD PILL BADGES */}
          <View style={styles.pillBadgesRow}>
            <View style={styles.goldPill}>
              <ThemedText style={styles.goldPillText}>⚡ {calories} kcal</ThemedText>
            </View>
            <View style={styles.goldPill}>
              <ThemedText style={styles.goldPillText}>👟 {steps.toLocaleString()}</ThemedText>
            </View>
            <View style={styles.goldPill}>
              <ThemedText style={styles.goldPillText}>💧 {waterLitres.toFixed(1)}L</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.subDetailText}>
            {trainingCompleted ? '🏆 Entreno Completado (RPE 8.5)' : '⏳ Sesión de Fuerza Pendiente'}
          </ThemedText>

          <ThemedText style={styles.goalSubtext}>⚡ IMPERIUM THUNDER • ATARAXIA GRID ⚡</ThemedText>
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
    gap: 8,
    marginBottom: 8,
  },
  tabChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(13, 17, 28, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.20)',
  },
  tabChipActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  tabChipText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  tabTextGold: {
    color: '#FCD34D',
  },
  tabTextGoldVivid: {
    color: '#D4AF37',
    fontWeight: '900',
  },
  svgAbsolute: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  badgeCategoryText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 2,
    fontFamily: 'monospace',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  percentGlowWrapper: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  percentText: {
    fontSize: 52,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: -1,
    lineHeight: 56,
  },
  pillBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: 8,
  },
  goldPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  goldPillText: {
    fontSize: 10.5,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#FDE68A',
  },
  subDetailText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  goalSubtext: {
    fontSize: 8.5,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#D4AF37',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
