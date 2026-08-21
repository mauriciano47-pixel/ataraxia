import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
  ImageBackground,
} from 'react-native';
import Svg, { RadialGradient, Defs, Stop, Rect } from 'react-native-svg';
import * as SplashScreen from 'expo-splash-screen';
import { ThemedText } from './themed-text';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SplashScreenWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Animaciones de entrada cinematográfica
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.97)).current;
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

    // Entrada cinematográfica suave
    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(contentScale, {
        toValue: 1,
        friction: 8,
        tension: 35,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsación suave del botón
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulse, {
          toValue: 1.035,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulse, {
          toValue: 1,
          duration: 1100,
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
            {/* FONDO OSCURO CON VIGNETTE RADIAL PARA INTEGRACIÓN TOTAL */}
            <View style={StyleSheet.absoluteFill}>
              <Svg width="100%" height="100%">
                <Defs>
                  <RadialGradient id="bgVignette" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#0B0905" stopOpacity="1" />
                    <Stop offset="65%" stopColor="#020203" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#000000" stopOpacity="1" />
                  </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#bgVignette)" />
              </Svg>
            </View>

            {/* CONTENEDOR CENTRAL FLUIDO SIN BORDES VISIBLES */}
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
                source={require('../../assets/images/zeus_canon_splash.png')}
                style={styles.fullArtworkBackground}
                resizeMode="contain"
              >
                {/* ZONA INFERIOR DESPEJADA PARA EL BOTÓN TÁCTIL */}
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
    maxWidth: 520,
    height: '100%',
    maxHeight: 920,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullArtworkBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomOverlayArea: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'web' ? 40 : 54,
    paddingHorizontal: 20,
    gap: 8,
  },
  enterButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(18, 14, 8, 0.88)',
    borderWidth: 1.5,
    borderColor: '#EAB308',
    borderRadius: 26,
    paddingHorizontal: 30,
    paddingVertical: 13,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
  },
  enterButtonSparkle: {
    fontSize: 14,
    color: '#FDE047',
  },
  enterButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFDE0',
    letterSpacing: 2.2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  touchHintText: {
    fontSize: 10.5,
    fontFamily: 'monospace',
    color: 'rgba(253, 224, 71, 0.75)',
    letterSpacing: 1.1,
    textAlign: 'center',
    marginTop: 2,
  },
});
