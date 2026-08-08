import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

export default function SplashScreenWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Asegurar que el splash screen nativo de Expo se oculte de inmediato al montar React
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return <View style={styles.rootContainer}>{children}</View>;
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#050507',
  },
});
