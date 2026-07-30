import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const DURATION = 3000;

export default function SplashScreenWrapper({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
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
        <View style={styles.logoFrame}>
          <Image source={require('../../assets/images/icon.png')} style={styles.logoImage} resizeMode="cover" />
        </View>
        <Text style={styles.title}>ATARAXIA</Text>
        <Text style={styles.motto}>"Visto desde arriba, todo pesa menos"</Text>
        <Text style={styles.subMotto}>🏛️ MEMENTO MORI • IMPERIUM ESTOICO 🏛️</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    ...(Platform.OS === 'web' ? ({ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 } as any) : {}),
    backgroundColor: '#050507',
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
  logoFrame: {
    borderRadius: 65,
    padding: 3,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 2,
    borderColor: '#D4AF37', // Oro Imperial
    marginBottom: 20,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  logoImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
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
    fontSize: 10.5,
    color: '#D4AF37', // Oro Imperial
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});
