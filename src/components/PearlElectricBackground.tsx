import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PearlElectricBackgroundProps {
  glowColor?: string;
  children?: React.ReactNode;
}

export function PearlElectricBackground({
  glowColor = 'rgba(212, 175, 55, 0.25)',
  children,
}: PearlElectricBackgroundProps) {
  return (
    <View style={styles.container}>
      {/* Fondo Negro Ónix OLED Profundo */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#050507' }]} />

      {/* Aura 1: Halo de Rayo Dorado Central */}
      <LinearGradient
        colors={[glowColor, 'rgba(245, 158, 11, 0.08)', 'transparent']}
        style={styles.heroArcGlow}
        start={{ x: 0.5, y: 0.05 }}
        end={{ x: 0.5, y: 0.95 }}
      />

      {/* Aura 2: Resplandor Oro Imperial Izquierda */}
      <LinearGradient
        colors={['rgba(212, 175, 55, 0.12)', 'transparent']}
        style={styles.leftCardGlow}
        start={{ x: 0, y: 0.4 }}
        end={{ x: 0.8, y: 0.8 }}
      />

      {/* Aura 3: Resplandor Rayo Ámbar Superior Derecha */}
      <LinearGradient
        colors={['rgba(245, 158, 11, 0.15)', 'transparent']}
        style={styles.rightHeaderGlow}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.2, y: 0.5 }}
      />

      {/* Viñeta Inferior Negro Ónix */}
      <LinearGradient
        colors={['transparent', 'rgba(5, 5, 7, 0.98)']}
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
    backgroundColor: '#050507',
  },
  heroArcGlow: {
    position: 'absolute',
    top: 40,
    left: '10%',
    right: '10%',
    height: 340,
    borderRadius: 170,
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
