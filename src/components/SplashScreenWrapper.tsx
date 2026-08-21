import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
  ImageBackground,
  Image,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { ThemedText } from './themed-text';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SplashScreenWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Animaciones de entrada y pulsación
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.96)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  const dismissSplash = () => {
    Animated.timing(containerOpacity, {
      toValue: 0,
      duration: 450,
      useNativeDriver: true,
    }).start(() => {
      setShowSplash(false);
    });
  };

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

    // Aparición suave y gloriosa de la pantalla completa
    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(contentScale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsación sutil del botón inferior
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulse, {
          toValue: 1.04,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.rootContainer}>
      {children}

      {showSplash && (
        <Animated.View
          style={[
            styles.splashOverlay,
            {
              opacity: containerOpacity,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.98}
            onPress={dismissSplash}
            style={styles.touchArea}
          >
            {/* CONTENEDOR CENTRAL DE LA PANTALLA CANÓNICA DE ZEUS */}
            <Animated.View
              style={[
                styles.artFrame,
                {
                  opacity: contentFade,
                  transform: [{ scale: contentScale }],
                },
              ]}
            >
              <ImageBackground
                source={require('../../assets/images/zeus_canon_splash.jpg')}
                style={styles.fullArtworkBackground}
                resizeMode="cover"
              >
                {/* GRADIENTE INFERIOR SUTIL PARA DESTACAR EL BOTÓN DE ACCESO */}
                <View style={styles.bottomOverlayArea}>
                  <Animated.View
                    style={[
                      styles.enterButtonPill,
                      {
                        transform: [{ scale: buttonPulse }],
                      },
                    ]}
                  >
                    <ThemedText style={styles.enterButtonSparkle}>⚡</ThemedText>
                    <ThemedText style={styles.enterButtonText}>TOCA PARA INGRESAR</ThemedText>
                    <ThemedText style={styles.enterButtonSparkle}>⚡</ThemedText>
                  </Animated.View>
                  <ThemedText style={styles.touchHintText}>
                    Toca en cualquier lugar para entrar al templo
                  </ThemedText>
                </View>
              </ImageBackground>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  splashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  artFrame: {
    width: '100%',
    maxWidth: 480,
    height: '100%',
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  fullArtworkBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomOverlayArea: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'web' ? 36 : 48,
    paddingHorizontal: 20,
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingTop: 20,
  },
  enterButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(18, 14, 8, 0.85)',
    borderWidth: 1.5,
    borderColor: '#EAB308',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 12,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
  },
  enterButtonSparkle: {
    fontSize: 14,
    color: '#FDE047',
  },
  enterButtonText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#FFFDE0',
    letterSpacing: 2.2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  touchHintText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: 'rgba(253, 224, 71, 0.75)',
    letterSpacing: 1.1,
    textAlign: 'center',
  },
});
