import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PearlElectricBackgroundProps {
  glowColor?: string;
  children?: React.ReactNode;
}

export function PearlElectricBackground({
  glowColor = 'rgba(29, 100, 242, 0.24)',
  children,
}: PearlElectricBackgroundProps) {
  return (
    <View style={styles.container}>
      {/* Fondo Azul Noche Obsidiana Ultra Profundo */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#070B14' }]} />

      {/* Aura 1: Brillo Ambiental Detrás del Arco Hero (Centro Superior) */}
      <LinearGradient
        colors={[glowColor, 'rgba(29, 100, 242, 0.05)', 'transparent']}
        style={styles.heroArcGlow}
        start={{ x: 0.5, y: 0.1 }}
        end={{ x: 0.5, y: 0.9 }}
      />

      {/* Aura 2: Resplandor Lateral Izquierdo Detrás de Tarjetas */}
      <LinearGradient
        colors={['rgba(29, 100, 242, 0.18)', 'transparent']}
        style={styles.leftCardGlow}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 0.8, y: 0.8 }}
      />

      {/* Aura 3: Resplandor Derecha Superior */}
      <LinearGradient
        colors={['rgba(29, 100, 242, 0.12)', 'transparent']}
        style={styles.rightHeaderGlow}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.3, y: 0.4 }}
      />

      {/* Viñeta Inferior */}
      <LinearGradient
        colors={['transparent', 'rgba(4, 7, 15, 0.95)']}
        style={styles.bottomGlow}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B14',
  },
  heroArcGlow: {
    position: 'absolute',
    top: 60,
    left: '10%',
    right: '10%',
    height: 320,
    borderRadius: 160,
    pointerEvents: 'none',
  },
  leftCardGlow: {
    position: 'absolute',
    top: 380,
    left: 0,
    width: 260,
    height: 380,
    borderRadius: 130,
    pointerEvents: 'none',
  },
  rightHeaderGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: 200,
    pointerEvents: 'none',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    pointerEvents: 'none',
  },
});
