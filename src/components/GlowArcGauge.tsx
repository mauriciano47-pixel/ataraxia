import React from 'react';
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
  virtueProgress = 0.85,
  overallProgress = 0.85,
  size = 320,
}: GlowArcGaugeProps) {

  const strengthPct = Math.round(Math.min(1, Math.max(0, strengthProgress)) * 100);
  const virtuePct = Math.round(Math.min(1, Math.max(0, virtueProgress)) * 100);
  const overallPct = Math.round(Math.min(1, Math.max(0, overallProgress)) * 100);

  // Geometry calculations
  const cx = size / 2;
  const cy = size / 2;

  // Outer Arc (Strength - Cyan Blue)
  const outerStrokeWidth = 10;
  const outerRadius = (size - outerStrokeWidth - 12) / 2;

  // Inner Arc (Virtue - Imperial Gold)
  const innerStrokeWidth = 8;
  const innerRadius = outerRadius - 26;

  // Arc Angle: 135 deg to 405 deg (270 deg total arc)
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

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.95} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={styles.svgAbsolute}>
          <Defs>
            {/* Strength Neon Blue Gradient */}
            <LinearGradient id="strengthGlowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#0052FF" />
              <Stop offset="50%" stopColor="#0099FF" />
              <Stop offset="100%" stopColor="#00C6FF" />
            </LinearGradient>

            {/* Virtue Imperial Gold Gradient */}
            <LinearGradient id="virtueGlowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#B8860B" />
              <Stop offset="50%" stopColor="#E2C068" />
              <Stop offset="100%" stopColor="#F5D77F" />
            </LinearGradient>

            {/* Marble Dark Disc Gradient */}
            <LinearGradient id="marbleDiscGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#1A181B" />
              <Stop offset="40%" stopColor="#0E0D10" />
              <Stop offset="80%" stopColor="#151418" />
              <Stop offset="100%" stopColor="#080709" />
            </LinearGradient>

            {/* Background Track */}
            <LinearGradient id="bgTrackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.07)" />
              <Stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
            </LinearGradient>
          </Defs>

          {/* Central Marble Core Disc */}
          <Circle
            cx={cx}
            cy={cy}
            r={innerRadius - 16}
            fill="url(#marbleDiscGrad)"
            stroke="rgba(226, 192, 104, 0.35)"
            strokeWidth={1}
          />

          {/* Outer Arc Background Track */}
          <Path
            d={backgroundArcOuter}
            fill="none"
            stroke="url(#bgTrackGrad)"
            strokeWidth={outerStrokeWidth}
            strokeLinecap="round"
          />

          {/* Outer Arc Active Strength Progress */}
          <Path
            d={progressArcOuter}
            fill="none"
            stroke="url(#strengthGlowGrad)"
            strokeWidth={outerStrokeWidth}
            strokeLinecap="round"
          />

          {/* Inner Arc Background Track */}
          <Path
            d={backgroundArcInner}
            fill="none"
            stroke="url(#bgTrackGrad)"
            strokeWidth={innerStrokeWidth}
            strokeLinecap="round"
          />

          {/* Inner Arc Active Virtue Progress */}
          <Path
            d={progressArcInner}
            fill="none"
            stroke="url(#virtueGlowGrad)"
            strokeWidth={innerStrokeWidth}
            strokeLinecap="round"
          />
        </Svg>

        {/* OVERLAY TEXT ELEMENTS EXACTLY AS PROPOSAL 1 */}
        <View style={styles.centerOverlayContent}>

          {/* 1. STRENGTH LABEL & PERCENT AT TOP OF OUTER ARC */}
          <View style={styles.strengthTopGroup}>
            <ThemedText style={styles.strengthLabelText}>STRENGTH</ThemedText>
            <ThemedText style={styles.strengthPctText}>{strengthPct}%</ThemedText>
          </View>

          {/* 2. VIRTUE LABEL & PERCENT AT TOP OF INNER ARC */}
          <View style={styles.virtueTopGroup}>
            <ThemedText style={styles.virtueLabelText}>VIRTUE</ThemedText>
            <ThemedText style={styles.virtuePctText}>{virtuePct}%</ThemedText>
          </View>

          {/* 3. BIG CENTRAL PERCENTAGE & OVERALL BALANCE */}
          <View style={styles.centerScoreBox}>
            <ThemedText style={styles.mainScoreNumber}>{overallPct}%</ThemedText>
            <ThemedText style={styles.overallBalanceLabel}>OVERALL BALANCE</ThemedText>
            <ThemedText style={styles.virilitySublabel}>ATARAXIA</ThemedText>
          </View>

          {/* 4. BOTTOM CYAN PERCENTAGE */}
          <View style={styles.bottomPercentGroup}>
            <ThemedText style={styles.bottomCyanPctText}>{strengthPct}%</ThemedText>
          </View>

        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  svgAbsolute: {
    position: 'absolute',
    top: 0,
  },
  centerOverlayContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  strengthTopGroup: {
    alignItems: 'center',
    marginTop: 2,
  },
  strengthLabelText: {
    fontSize: 13,
    fontFamily: 'serif',
    fontWeight: '800',
    color: '#E2C068',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  strengthPctText: {
    fontSize: 16,
    fontFamily: 'sans-serif',
    fontWeight: '900',
    color: '#00C6FF',
    marginTop: -2,
  },
  virtueTopGroup: {
    alignItems: 'center',
    marginTop: -10,
  },
  virtueLabelText: {
    fontSize: 11.5,
    fontFamily: 'serif',
    fontWeight: '800',
    color: '#E2C068',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  virtuePctText: {
    fontSize: 14.5,
    fontFamily: 'sans-serif',
    fontWeight: '900',
    color: '#E2C068',
    marginTop: -2,
  },
  centerScoreBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -6,
  },
  mainScoreNumber: {
    fontSize: 58,
    fontWeight: '900',
    color: '#F5D77F',
    fontFamily: 'serif',
    letterSpacing: -2,
    textShadowColor: 'rgba(226, 192, 104, 0.40)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  overallBalanceLabel: {
    fontSize: 9.5,
    fontFamily: 'serif',
    fontWeight: '700',
    color: '#E2C068',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginTop: -6,
  },
  virilitySublabel: {
    fontSize: 10,
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    color: '#00C6FF',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  bottomPercentGroup: {
    marginBottom: 10,
  },
  bottomCyanPctText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#00C6FF',
    fontFamily: 'serif',
  },
});
