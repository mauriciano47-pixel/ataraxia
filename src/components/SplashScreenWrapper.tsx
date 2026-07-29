// SplashScreenWrapper.tsx
import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Duración exacta de la pantalla de bienvenida (3 segundos)
const DURATION = 3000;

export default function SplashScreenWrapper({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Evitar que el splash nativo se oculte automáticamente (solo móvil)
    if (Platform.OS !== 'web') {
      SplashScreen.preventAutoHideAsync().catch(() => {});
    }
    const timer = setTimeout(() => {
      setVisible(false);
      if (Platform.OS !== 'web') {
        SplashScreen.hideAsync().catch(() => {});
      }
    }, DURATION);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) {
    return <>{children}</>;
  }

  return (
    <View style={styles.splashOverlay}>
      <View style={styles.contentContainer}>
        <Image source={require('../../assets/images/icon.png')} style={styles.logoImage} resizeMode="cover" />
        <Text style={styles.title}>ATARAXIA</Text>
        <Text style={styles.motto}>"Visto desde arriba, todo pesa menos"</Text>
        <Text style={styles.subMotto}>Controla tu percepción • Acepta tu destino</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    ...(Platform.OS === 'web' ? ({ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 } as any) : {}),
    backgroundColor: '#050505',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
    maxWidth: 400,
  },
  logoImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#D32F2F',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 10,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  motto: {
    fontSize: 16,
    color: '#D32F2F',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: 1,
    fontFamily: 'serif',
  },
  subMotto: {
    fontSize: 11,
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 6,
    fontFamily: 'monospace',
  },
});
