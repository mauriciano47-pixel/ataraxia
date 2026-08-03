import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ThemedText } from './themed-text';

interface GlowArcGaugeProps {
  progress?: number; // 0.0 to 1.0 (default 0.78 for 78%)
  size?: number;
  steps?: number;
  km?: number;
  calories?: number;
}

export function GlowArcGauge({
  progress = 0.78,
  size = 260,
  steps = 8450,
  km = 6.2,
  calories = 340,
}: GlowArcGaugeProps) {
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Semicircular Arc from 135 deg to 405 deg (270 degree span)
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

  const backgroundArc = describeArc(cx, cy, radius, startAngle, endAngle);
  const currentAngle = startAngle + totalAngle * Math.min(1, Math.max(0, progress));
  const progressArc = describeArc(cx, cy, radius, startAngle, currentAngle);

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size - 30, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute', top: 0 }}>
          <Defs>
            {/* Exact Bicolor Gradient: Electric Blue (#1D64F2) to Metallic Gold (#E2C068) */}
            <LinearGradient id="arcBicolorGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#1D64F2" />
              <Stop offset="50%" stopColor="#2563EB" />
              <Stop offset="85%" stopColor="#E2C068" />
              <Stop offset="100%" stopColor="#F5D77F" />
            </LinearGradient>

            <LinearGradient id="bgTrackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.06)" />
              <Stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
            </LinearGradient>
          </Defs>

          {/* Background Track Arc */}
          <Path
            d={backgroundArc}
            fill="none"
            stroke="url(#bgTrackGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Progress Arc */}
          <Path
            d={progressArc}
            fill="none"
            stroke="url(#arcBicolorGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>

        {/* Center Contents */}
        <View style={styles.centerContent}>
          <ThemedText style={styles.percentText}>{Math.round(progress * 100)}%</ThemedText>
          <ThemedText style={styles.metricsText}>{steps.toLocaleString()} Steps</ThemedText>
          <ThemedText style={styles.metricsText}>{km.toFixed(1)} km</ThemedText>
          <ThemedText style={styles.metricsText}>{calories} kcal</ThemedText>
          <ThemedText style={styles.goalSubtext}>of Daily Wellness Goal</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  percentText: {
    fontSize: 46,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'serif',
    letterSpacing: -0.5,
  },
  metricsText: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  goalSubtext: {
    fontSize: 11,
    color: '#C5A869',
    fontFamily: 'monospace',
    marginTop: 8,
    opacity: 0.9,
  },
});
