import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

interface PearlElectricBackgroundProps {
  glowColor?: string;
  children?: React.ReactNode;
}

export function PearlElectricBackground({
  glowColor = 'rgba(212, 175, 55, 0.28)',
  children,
}: PearlElectricBackgroundProps) {
  return (
    <View style={styles.container}>
      {/* Fondo Negro Ónix OLED Profundo */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#050507' }]} pointerEvents="none" />

      {/* Rayos Eléctricos Dorados de Fondo */}
      <View style={[styles.lightningLayer, { pointerEvents: 'none' }]} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 400 800" style={StyleSheet.absoluteFill}>
          <Defs>
            <SvgGradient id="goldBoltGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FFF3B0" stopOpacity="0.8" />
              <Stop offset="40%" stopColor="#D4AF37" stopOpacity="0.6" />
              <Stop offset="80%" stopColor="#F59E0B" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </SvgGradient>
            <SvgGradient id="goldBoltGradLeft" x1="0" y1="0" x2="0.8" y2="1">
              <Stop offset="0%" stopColor="#FFE066" stopOpacity="0.5" />
              <Stop offset="50%" stopColor="#D4AF37" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </SvgGradient>
          </Defs>

          <Path
            d="M360 0 L325 70 L345 85 L310 160 L330 175 L285 280 L300 295 L260 410 L275 425 L230 540"
            stroke="url(#goldBoltGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path
            d="M325 70 L280 110 L295 125 L260 190"
            stroke="url(#goldBoltGrad)"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M310 160 L370 210 L355 240 L390 290"
            stroke="url(#goldBoltGrad)"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
          />

          <Path
            d="M20 180 L55 230 L40 245 L70 310 L50 325 L85 400 L65 420 L95 490"
            stroke="url(#goldBoltGradLeft)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path
            d="M55 230 L10 270 L20 285 L0 340"
            stroke="url(#goldBoltGradLeft)"
            strokeWidth="0.9"
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      </View>

      {/* Auras con pointerEvents="none" explícito */}
      <LinearGradient
        colors={[glowColor, 'rgba(245, 158, 11, 0.10)', 'transparent']}
        style={styles.heroArcGlow}
        start={{ x: 0.5, y: 0.05 }}
        end={{ x: 0.5, y: 0.95 }}
        pointerEvents="none"
      />

      <LinearGradient
        colors={['rgba(212, 175, 55, 0.14)', 'transparent']}
        style={styles.leftCardGlow}
        start={{ x: 0, y: 0.4 }}
        end={{ x: 0.8, y: 0.8 }}
        pointerEvents="none"
      />

      <LinearGradient
        colors={['rgba(245, 158, 11, 0.18)', 'transparent']}
        style={styles.rightHeaderGlow}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.2, y: 0.5 }}
        pointerEvents="none"
      />

      <LinearGradient
        colors={['transparent', 'rgba(5, 5, 7, 0.98)']}
        style={styles.bottomGlow}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />

      <View style={styles.contentLayer}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050507',
  },
  contentLayer: {
    flex: 1,
    zIndex: 10,
  },
  lightningLayer: {
    ...StyleSheet.absoluteFill,
    opacity: 0.85,
  },
  heroArcGlow: {
    position: 'absolute',
    top: 30,
    left: '8%',
    right: '8%',
    height: 360,
    borderRadius: 180,
  },
  leftCardGlow: {
    position: 'absolute',
    top: 380,
    left: 0,
    width: 260,
    height: 380,
    borderRadius: 130,
  },
  rightHeaderGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 220,
    height: 240,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
  },
});
