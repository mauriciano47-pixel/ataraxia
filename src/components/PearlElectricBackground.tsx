import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PearlElectricBackgroundProps {
  glowColor?: string;
  children?: React.ReactNode;
}

export function PearlElectricBackground({
  glowColor = 'rgba(0, 82, 255, 0.16)',
  children,
}: PearlElectricBackgroundProps) {
  return (
    <View style={styles.container}>
      {/* Fondo Azul Noche Obsidiana Profundo */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#070B19' }]} />

      {/* Degradado Superior Ambiental en Azul Cobalto */}
      <LinearGradient
        colors={[glowColor, 'rgba(0, 82, 255, 0.04)', 'transparent']}
        style={styles.topGlow}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Aura Radial Zafiro Neón en la Esquina Superior Derecha */}
      <LinearGradient
        colors={['rgba(0, 198, 255, 0.12)', 'rgba(0, 82, 255, 0.03)', 'transparent']}
        style={styles.cyanGlow}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0.8 }}
      />

      {/* Resplandor Dorado Champán Superior sutil */}
      <LinearGradient
        colors={['rgba(212, 175, 55, 0.08)', 'transparent']}
        style={styles.goldGlow}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 0.5 }}
      />

      {/* Viñeta Inferior Noche */}
      <LinearGradient
        colors={['transparent', 'rgba(4, 7, 15, 0.90)']}
        style={styles.bottomGlow}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Micro Línea de Acento Superior Azul Cobalto a Dorado Champán */}
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={['transparent', '#0052FF', '#D4AF37', '#00C6FF', 'transparent']}
        style={styles.topLine}
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B19',
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    pointerEvents: 'none',
  },
  cyanGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 340,
    height: 340,
    pointerEvents: 'none',
  },
  goldGlow: {
    position: 'absolute',
    top: 0,
    left: 40,
    right: 40,
    height: 220,
    pointerEvents: 'none',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    pointerEvents: 'none',
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.85,
    pointerEvents: 'none',
  },
});
