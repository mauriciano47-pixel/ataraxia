import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import Svg, { RadialGradient, Defs, Stop, Circle } from 'react-native-svg';
import * as SplashScreen from 'expo-splash-screen';
import { ThemedText } from './themed-text';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SplashScreenWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Animaciones
  const emblemScale = useRef(new Animated.Value(0.75)).current;
  const emblemOpacity = useRef(new Animated.Value(0)).current;
  const emblemPulse = useRef(new Animated.Value(1)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(12)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const quoteOpacity = useRef(new Animated.Value(0)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const containerScale = useRef(new Animated.Value(1)).current;

  const dismissSplash = () => {
    Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(containerScale, {
        toValue: 1.03,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSplash(false);
    });
  };

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

    // Entrada del Medallón Circular de Zeus
    Animated.parallel([
      Animated.spring(emblemScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(emblemOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Respiración continua del Medallón y Rayo
    Animated.loop(
      Animated.sequence([
        Animated.timing(emblemPulse, {
          toValue: 1.04,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(emblemPulse, {
          toValue: 0.98,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Revelación del Título Monumental
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(titleTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);

    // Revelación de Insignia y Cita
    setTimeout(() => {
      Animated.timing(badgeOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 650);

    setTimeout(() => {
      Animated.timing(quoteOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 900);

    // Revelación del Botón Inferior
    setTimeout(() => {
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonPulse, {
            toValue: 1.04,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(buttonPulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 1100);
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
              transform: [{ scale: containerScale }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.96}
            onPress={dismissSplash}
            style={styles.touchContainer}
          >
            {/* AMBIENTE AURORA CELESTIAL DE FONDO */}
            <View style={styles.ambientGlowBackground}>
              <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={StyleSheet.absoluteFill}>
                <Defs>
                  <RadialGradient id="cosmicDawn" cx="50%" cy="38%" r="60%">
                    <Stop offset="0%" stopColor="#FFE259" stopOpacity="0.22" />
                    <Stop offset="35%" stopColor="#D4AF37" stopOpacity="0.10" />
                    <Stop offset="70%" stopColor="#F59E0B" stopOpacity="0.03" />
                    <Stop offset="100%" stopColor="#040406" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx={SCREEN_WIDTH / 2} cy={SCREEN_HEIGHT * 0.38} r={SCREEN_WIDTH * 0.75} fill="url(#cosmicDawn)" />
              </Svg>
            </View>

            {/* SECCIÓN PRINCIPAL: MEDALLÓN CIRCULAR TRANSPARENTE DE ZEUS + TEXTOS */}
            <View style={styles.mainContentBlock}>
              <Animated.View
                style={[
                  styles.emblemWrapper,
                  {
                    opacity: emblemOpacity,
                    transform: [
                      { scale: emblemScale },
                      { scale: emblemPulse }
                    ],
                  },
                ]}
              >
                <Image
                  source={require('../../assets/images/zeus_master_emblem_transparent.png')}
                  style={styles.masterEmblemImage}
                  resizeMode="contain"
                />
              </Animated.View>

              {/* TÍTULO MONUMENTAL Y CITA ESTOICA (TEXTO NATIVO Y NÍTIDO) */}
              <Animated.View
                style={[
                  styles.titleSection,
                  {
                    opacity: titleOpacity,
                    transform: [{ translateY: titleTranslateY }],
                  },
                ]}
              >
                <View style={styles.titleWingsRow}>
                  <ThemedText style={styles.divineSparkleWing}>⚡</ThemedText>
                  <ThemedText style={styles.divineMainTitle}>ATARAXIA</ThemedText>
                  <ThemedText style={styles.divineSparkleWing}>⚡</ThemedText>
                </View>

                {/* INSIGNIA CELESTIAL */}
                <Animated.View style={[styles.divineBadgeContainer, { opacity: badgeOpacity }]}>
                  <ThemedText style={styles.divineBadgeText}>
                    TEMPLO DEL AUTODOMINIO
                  </ThemedText>
                </Animated.View>

                {/* LEMA ORACULAR DE MARCO AURELIO */}
                <Animated.View style={[styles.quoteContainer, { opacity: quoteOpacity }]}>
                  <ThemedText style={styles.stoicMottoText}>
                    &ldquo;Visto desde arriba, todo pesa menos.&rdquo;
                  </ThemedText>
                  <ThemedText style={styles.stoicAuthorText}>
                    — Marco Aurelio (Emperador Estoico)
                  </ThemedText>
                </Animated.View>
              </Animated.View>
            </View>

            {/* BOTÓN DE ACCESO TÁCTIL INFERIOR (SIN SUPERPOSICIONES) */}
            <Animated.View
              style={[
                styles.bottomActionsBlock,
                {
                  opacity: buttonOpacity,
                  transform: [{ scale: buttonPulse }],
                },
              ]}
            >
              <View style={styles.enterButtonPill}>
                <ThemedText style={styles.enterButtonSparkle}>⚡</ThemedText>
                <ThemedText style={styles.enterButtonText}>TOCA PARA INGRESAR</ThemedText>
                <ThemedText style={styles.enterButtonSparkle}>⚡</ThemedText>
              </View>
              <ThemedText style={styles.touchHintText}>Toca en cualquier lugar para comenzar</ThemedText>
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
    backgroundColor: '#040406',
  },
  splashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#040406',
    zIndex: 99999,
  },
  touchContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 24 : 44,
    paddingBottom: Platform.OS === 'web' ? 24 : 36,
  },
  ambientGlowBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContentBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flex: 1,
  },
  emblemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: Platform.OS === 'web' ? 260 : 230,
    height: Platform.OS === 'web' ? 260 : 230,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  masterEmblemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  titleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
  },
  titleWingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  divineSparkleWing: {
    fontSize: 22,
    color: '#FFE259',
    textShadowColor: 'rgba(255, 226, 89, 0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  divineMainTitle: {
    fontSize: Platform.OS === 'web' ? 42 : 36,
    fontWeight: '900',
    color: '#FFFDE0',
    letterSpacing: Platform.OS === 'web' ? 8 : 6,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(255, 226, 89, 0.95)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 22,
    fontFamily: Platform.OS === 'ios' ? 'Cinzel' : 'serif',
  },
  divineBadgeContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.14)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 226, 89, 0.45)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 3,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  divineBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFE259',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  quoteContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
    gap: 2,
  },
  stoicMottoText: {
    fontSize: 12.5,
    fontStyle: 'italic',
    fontFamily: 'serif',
    color: '#E2E8F0',
    textAlign: 'center',
    textShadowColor: 'rgba(212, 175, 55, 0.35)',
    textShadowRadius: 5,
    lineHeight: 17,
  },
  stoicAuthorText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    color: '#D4AF37',
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  bottomActionsBlock: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    gap: 5,
    marginTop: 6,
  },
  enterButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.20)',
    borderWidth: 1.4,
    borderColor: '#FFE259',
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 10,
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.75,
    shadowRadius: 14,
  },
  enterButtonSparkle: {
    fontSize: 14,
    color: '#FFE259',
  },
  enterButtonText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFDE0',
    letterSpacing: 1.8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  touchHintText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    color: 'rgba(212, 175, 55, 0.65)',
    letterSpacing: 1.2,
  },
});
