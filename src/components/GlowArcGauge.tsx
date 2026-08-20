import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, RadialGradient, G, Polygon } from 'react-native-svg';
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
  targetCalories?: number;
  waterLitres?: number;
  trainingCompleted?: boolean;
  streakDays?: number;
}

export function GlowArcGauge({
  strengthProgress = 0.82,
  virtueProgress = 0.80,
  overallProgress = 0.82,
  size = 320,
  calories = 2840,
  targetCalories = 3500,
  steps = 14892,
  trainingCompleted = true,
}: GlowArcGaugeProps) {
  const [activeMetric, setActiveMetric] = useState<'calories' | 'strength' | 'virtue'>('calories');

  const burnPct = Math.round((calories / targetCalories) * 100);
  const strengthPct = Math.round(Math.min(1, Math.max(0, strengthProgress)) * 100);
  const virtuePct = Math.round(Math.min(1, Math.max(0, virtueProgress)) * 100);

  const displayPct = activeMetric === 'calories' ? burnPct : activeMetric === 'strength' ? strengthPct : virtuePct;
  const currentRatio = Math.min(1, Math.max(0, displayPct / 100));

  const cx = size / 2;
  const cy = size / 2;

  // Outer 3D Gold Bezel
  const bezelRadius = (size - 18) / 2;
  
  // Power Progress Arc
  const arcStrokeWidth = 14;
  const arcRadius = bezelRadius - 20;

  // Angles: 135deg (bottom-left) to 405deg (bottom-right) => 270deg sweep
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

  const currentAngle = startAngle + totalAngle * currentRatio;
  const bgArc = describeArc(cx, cy, arcRadius, startAngle, endAngle);
  const progressArc = describeArc(cx, cy, arcRadius, startAngle, currentAngle);

  const capPos = polarToCartesian(cx, cy, arcRadius, currentAngle);
  const pctBadgePos = polarToCartesian(cx, cy, arcRadius + 22, Math.min(endAngle - 15, currentAngle + 12));

  return (
    <View style={styles.container}>
      {/* 3D LUXURY GOLD & THUNDER DIAL */}
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() =>
          setActiveMetric((prev) => (prev === 'calories' ? 'strength' : prev === 'strength' ? 'virtue' : 'calories'))
        }
        style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      >
        <Svg width={size} height={size} style={styles.svgAbsolute}>
          <Defs>
            {/* Ambient Electric Atmosphere Halo */}
            <RadialGradient id="ambientBackglow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="rgba(245, 158, 11, 0.45)" />
              <Stop offset="50%" stopColor="rgba(255, 226, 89, 0.20)" />
              <Stop offset="85%" stopColor="rgba(212, 175, 55, 0.06)" />
              <Stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </RadialGradient>

            {/* 3D Metallic Gold Bezel Gradient */}
            <LinearGradient id="metallicBezel3D" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FFFDE0" />
              <Stop offset="20%" stopColor="#FFE259" />
              <Stop offset="45%" stopColor="#D4AF37" />
              <Stop offset="70%" stopColor="#8A6615" />
              <Stop offset="88%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#FFFBEB" />
            </LinearGradient>

            {/* Hyper-Luminous Thunder Gold Arc Gradient */}
            <LinearGradient id="thunderGlowArc" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#F59E0B" />
              <Stop offset="30%" stopColor="#D4AF37" />
              <Stop offset="65%" stopColor="#FFE259" />
              <Stop offset="90%" stopColor="#FFFBEB" />
              <Stop offset="100%" stopColor="#FFFFFF" />
            </LinearGradient>

            {/* Central Bolt Corona Flare */}
            <RadialGradient id="boltBloomGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
              <Stop offset="25%" stopColor="rgba(255, 226, 89, 0.75)" />
              <Stop offset="65%" stopColor="rgba(245, 158, 11, 0.35)" />
              <Stop offset="100%" stopColor="rgba(245, 158, 11, 0.00)" />
            </RadialGradient>

            {/* 3D Central Bolt Gradient */}
            <LinearGradient id="bolt3DGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="20%" stopColor="#FFFDE0" />
              <Stop offset="45%" stopColor="#FFE259" />
              <Stop offset="75%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#B45309" />
            </LinearGradient>

            {/* Inner Chisel Highlight for 3D Bolt */}
            <LinearGradient id="boltChiselGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <Stop offset="60%" stopColor="#FFE259" stopOpacity="0.80" />
              <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0.30" />
            </LinearGradient>

            {/* Onyx Disc Background */}
            <RadialGradient id="onyxPlate" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#1E2333" />
              <Stop offset="55%" stopColor="#0F131E" />
              <Stop offset="85%" stopColor="#080A10" />
              <Stop offset="100%" stopColor="#040406" />
            </RadialGradient>

            {/* Sparkle Gold Mini Bolts */}
            <LinearGradient id="sparkleBoltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="40%" stopColor="#FFF3B0" />
              <Stop offset="100%" stopColor="#F59E0B" />
            </LinearGradient>
          </Defs>

          {/* 0. AMBIENT ELECTRIC ATMOSPHERE GLOW */}
          <Circle
            cx={cx}
            cy={cy}
            r={bezelRadius + 14}
            fill="url(#ambientBackglow)"
          />

          {/* 1. OUTER 3D METALLIC GOLD RIM */}
          <Circle
            cx={cx}
            cy={cy}
            r={bezelRadius}
            stroke="url(#metallicBezel3D)"
            strokeWidth={11}
            fill="none"
          />
          {/* Inner Golden Rim Line */}
          <Circle
            cx={cx}
            cy={cy}
            r={bezelRadius - 6}
            stroke="rgba(255, 253, 224, 0.65)"
            strokeWidth={1.8}
            fill="none"
          />
          {/* Outer Specular Highlight */}
          <Circle
            cx={cx}
            cy={cy}
            r={bezelRadius + 6}
            stroke="rgba(255, 226, 89, 0.40)"
            strokeWidth={1.2}
            fill="none"
          />

          {/* 2. INNER ONYX DISK */}
          <Circle
            cx={cx}
            cy={cy}
            r={bezelRadius - 8}
            fill="url(#onyxPlate)"
          />

          {/* 3. TRACK BACKGROUND (INACTIVE ARC) */}
          <Path
            d={bgArc}
            stroke="rgba(212, 175, 55, 0.16)"
            strokeWidth={arcStrokeWidth}
            strokeLinecap="round"
            fill="none"
          />

          {/* 4. ACTIVE POWER ARC GLOW BLOOM (LAYER 1: WIDE DIFFUSE) */}
          <Path
            d={progressArc}
            stroke="rgba(245, 158, 11, 0.28)"
            strokeWidth={arcStrokeWidth + 16}
            strokeLinecap="round"
            fill="none"
          />

          {/* 4. ACTIVE POWER ARC GLOW BLOOM (LAYER 2: INTENSE NEON) */}
          <Path
            d={progressArc}
            stroke="rgba(255, 226, 89, 0.55)"
            strokeWidth={arcStrokeWidth + 8}
            strokeLinecap="round"
            fill="none"
          />

          {/* 4. ACTIVE POWER ARC (CORE HYPER-BRIGHT GOLD & WHITE) */}
          <Path
            d={progressArc}
            stroke="url(#thunderGlowArc)"
            strokeWidth={arcStrokeWidth}
            strokeLinecap="round"
            fill="none"
          />

          {/* 5. MULTI-LAYER GLOWING CAP AT PROGRESS TIP */}
          {/* Outer Bloom */}
          <Circle
            cx={capPos.x}
            cy={capPos.y}
            r={arcStrokeWidth / 2 + 10}
            fill="rgba(245, 158, 11, 0.35)"
          />
          {/* Mid Intense Bloom */}
          <Circle
            cx={capPos.x}
            cy={capPos.y}
            r={arcStrokeWidth / 2 + 5}
            fill="rgba(255, 226, 89, 0.80)"
          />
          {/* White-Hot Core Spark */}
          <Circle
            cx={capPos.x}
            cy={capPos.y}
            r={arcStrokeWidth / 2 + 1}
            fill="#FFFFFF"
          />

          {/* 6. FLOATING MINI LIGHTNING BOLTS INSIDE ARC */}
          <Path
            d="M86 120 L78 132 L84 133 L76 145"
            stroke="url(#sparkleBoltGrad)"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path
            d="M60 178 L52 190 L58 191 L50 203"
            stroke="url(#sparkleBoltGrad)"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path
            d="M234 116 L242 128 L236 129 L244 141"
            stroke="url(#sparkleBoltGrad)"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Extra Electric Sparkles */}
          <Circle cx={88} cy={122} r={1.5} fill="#FFFFFF" />
          <Circle cx={58} cy={180} r={1.8} fill="#FFFFFF" />
          <Circle cx={232} cy={118} r={1.5} fill="#FFFFFF" />

          {/* 7. CENTRAL 3D GOLD MONUMENTAL THUNDERBOLT (HIGH GLOW) */}
          <G transform={`translate(${cx - 24}, ${cy - 86})`}>
            {/* Back Corona Flare */}
            <Circle cx={26} cy={34} r={42} fill="url(#boltBloomGrad)" />

            {/* Ambient Bolt Glow Outline */}
            <Polygon
              points="28,0 8,36 24,36 12,68 44,26 28,26"
              fill="rgba(245, 158, 11, 0.40)"
              stroke="rgba(255, 226, 89, 0.70)"
              strokeWidth={5}
            />

            {/* Deep Warm Amber Drop Shadow */}
            <Polygon
              points="28,0 8,36 24,36 12,68 44,26 28,26"
              fill="rgba(180, 83, 9, 0.65)"
              transform="translate(2, 2.5)"
            />

            {/* 3D Faceted Body */}
            <Polygon
              points="28,0 8,36 24,36 12,68 44,26 28,26"
              fill="url(#bolt3DGrad)"
              stroke="#FFFFFF"
              strokeWidth={1.4}
            />

            {/* Specular Inner Chisel Highlight (Left Facet) */}
            <Polygon
              points="28,2 10,34 23,34 14,64 24,34 16,34 28,6"
              fill="url(#boltChiselGrad)"
            />
          </G>
        </Svg>

        {/* 8. CENTER TEXT OVERLAY */}
        <View style={[styles.centerContent, { pointerEvents: 'none' }]}>
          <View style={styles.calsNumberRow}>
            <ThemedText style={styles.mainCountText}>
              {calories.toLocaleString()}
            </ThemedText>
            <ThemedText style={styles.targetDividerText}> / {targetCalories.toLocaleString()}</ThemedText>
            <View style={styles.unitBadgeCol}>
              <ThemedText style={styles.kcalUnitText}>Kcal</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.dailyPowerTitle}>DAILY POWER</ThemedText>
          <ThemedText style={styles.dailyBurnTitle}>BURN</ThemedText>
        </View>

        {/* 9. PERCENT BADGE */}
        <View style={[styles.percentFloatingBadge, { top: pctBadgePos.y - 12, left: pctBadgePos.x - 18 }]}>
          <ThemedText style={styles.percentFloatingText}>{displayPct}%</ThemedText>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  svgAbsolute: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
  },
  calsNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 4,
  },
  mainCountText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'serif',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(255, 226, 89, 0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  targetDividerText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#E2E8F0',
    fontFamily: 'serif',
    letterSpacing: -0.5,
  },
  unitBadgeCol: {
    marginLeft: 6,
  },
  kcalUnitText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FDE68A',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(245, 158, 11, 0.60)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  dailyPowerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'sans-serif',
    letterSpacing: 3.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 20,
    textShadowColor: 'rgba(245, 158, 11, 0.70)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  dailyBurnTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFBEB',
    fontFamily: 'sans-serif',
    letterSpacing: 4.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 20,
    textShadowColor: 'rgba(245, 158, 11, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  percentFloatingBadge: {
    position: 'absolute',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(8, 10, 16, 0.95)',
    borderWidth: 1.5,
    borderColor: '#FFE259',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 10,
    elevation: 6,
  },
  percentFloatingText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFDE0',
    fontFamily: 'monospace',
    textShadowColor: 'rgba(245, 158, 11, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
