import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PearlElectricBackgroundProps {
  glowColor?: string;
  children?: React.ReactNode;
}

export function PearlElectricBackground({
  glowColor = 'rgba(255, 145, 0, 0.22)',
  children,
}: PearlElectricBackgroundProps) {
  return (
    <View style={styles.container}>
      {/* Fondo Grafito Oscuro Deportivo (Hypertrophy Power Grid) */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0B0F19' }]} />

      {/* Aura 1: Brillo Ámbar Eléctrico Superior */}
      <LinearGradient
        colors={[glowColor, 'rgba(255, 145, 0, 0.04)', 'transparent']}
        style={styles.heroArcGlow}
        start={{ x: 0.5, y: 0.1 }}
        end={{ x: 0.5, y: 0.9 }}
      />

      {/* Aura 2: Resplandor Azul Atletismo Izquierda */}
      <LinearGradient
        colors={['rgba(0, 198, 255, 0.15)', 'transparent']}
        style={styles.leftCardGlow}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 0.8, y: 0.8 }}
      />

      {/* Aura 3: Resplandor Derecha Superior Ámbar */}
      <LinearGradient
        colors={['rgba(255, 145, 0, 0.12)', 'transparent']}
        style={styles.rightHeaderGlow}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.3, y: 0.4 }}
      />

      {/* Viñeta Inferior */}
      <LinearGradient
        colors={['transparent', 'rgba(5, 8, 14, 0.95)']}
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
    backgroundColor: '#0B0F19',
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
