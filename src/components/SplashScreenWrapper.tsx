import React, { useEffect, useState, useRef } from 'react';
import { View, Image, Text, StyleSheet, Platform, Animated, TouchableWithoutFeedback } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const DISPLAY_DURATION = 900; // Duración inicial elegante
const FADE_DURATION = 400; // Transición de desvanecimiento suave

export default function SplashScreenWrapper({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: FADE_DURATION,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setVisible(false);
      SplashScreen.hideAsync().catch(() => {});
    });
  };

  useEffect(() => {
    // Asegurar que el splash nativo de Expo se oculte tan pronto como nuestro componente se monte
    SplashScreen.hideAsync().catch(() => {});

    timerRef.current = setTimeout(() => {
      startDismiss();
    }, DISPLAY_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <View style={styles.rootContainer}>
      {/* La app se monta inmediatamente por debajo */}
      {children}

      {/* Overlay de Bienvenida con Fade Out suave */}
      {visible && (
        <Animated.View
          style={[styles.splashOverlay, { opacity: fadeAnim }]}
          pointerEvents={fadeAnim ? 'auto' : 'none'}
        >
          <TouchableWithoutFeedback onPress={startDismiss}>
            <View style={styles.touchableArea}>
              <View style={styles.contentContainer}>
                <View style={styles.logoFrame}>
                  <Image
                    source={require('../../assets/images/icon.png')}
                    style={styles.logoImage}
                    resizeMode="cover"
                  />
                </View>
                <Text style={styles.title}>ATARAXIA</Text>
                <Text style={styles.motto}>&quot;Visto desde arriba, todo pesa menos&quot;</Text>
                <Text style={styles.subMotto}>🏛️ MEMENTO MORI • IMPERIUM ESTOICO 🏛️</Text>

                <View style={styles.tapPromptBox}>
                  <Text style={styles.tapPromptText}>Toca para continuar ⚡</Text>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#050507',
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    ...(Platform.OS === 'web' ? ({ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 } as any) : {}),
    backgroundColor: '#050507',
    zIndex: 99999,
  },
  touchableArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
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
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 2,
    borderColor: '#10B981', // Esmeralda Fit
    marginBottom: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  logoImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 8,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  motto: {
    fontSize: 15,
    color: '#34D399',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subMotto: {
    fontSize: 10.5,
    color: '#10B981',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  tapPromptBox: {
    marginTop: 28,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  tapPromptText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
});
