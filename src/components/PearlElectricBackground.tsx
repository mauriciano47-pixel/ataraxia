import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PearlElectricBackgroundProps {
  glowColor?: string;
  children?: React.ReactNode;
}

export function PearlElectricBackground({
  glowColor = 'rgba(0, 82, 255, 0.08)',
  children,
}: PearlElectricBackgroundProps) {
  return (
    <View style={styles.container}>
      {/* Fondo Blanco Perla Suave Base */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F8FAFC' }]} />

      {/* Degradado Superior Ambiental en Azul Eléctrico Flotante */}
      <LinearGradient
        colors={[glowColor, 'rgba(0, 198, 255, 0.03)', 'transparent']}
        style={styles.topGlow}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Aura Radial Zafiro/Cian en la Esquina Superior Derecha */}
      <LinearGradient
        colors={['rgba(0, 198, 255, 0.09)', 'rgba(0, 82, 255, 0.02)', 'transparent']}
        style={styles.cyanGlow}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0.8 }}
      />

      {/* Aura Lateral Izquierda de Luz Nácar Azul */}
      <LinearGradient
        colors={['rgba(0, 82, 255, 0.05)', 'transparent']}
        style={styles.leftGlow}
        start={{ x: 0, y: 0.4 }}
        end={{ x: 1, y: 0.8 }}
      />

      {/* Viñeta Inferior Cristal Perlada */}
      <LinearGradient
        colors={['transparent', 'rgba(241, 245, 249, 0.70)']}
        style={styles.bottomGlow}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Línea de Acento Superior Ultra Fina Azul Eléctrico a Zafiro */}
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={['transparent', '#0052FF', '#00C6FF', 'transparent']}
        style={styles.topLine}
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 380,
    pointerEvents: 'none',
  },
  cyanGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 320,
    height: 320,
    pointerEvents: 'none',
  },
  leftGlow: {
    position: 'absolute',
    top: 180,
    left: 0,
    width: 250,
    height: 400,
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
