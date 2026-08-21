import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
  Image,
  ImageBackground,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { ThemedText } from './themed-text';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SplashScreenWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Animaciones de entrada y respiración
  const emblemScale = useRef(new Animated.Value(0.85)).current;
  const emblemOpacity = useRef(new Animated.Value(0)).current;
  const emblemGlowPulse = useRef(new Animated.Value(1)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(10)).current;
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

    // Entrada del Emblema Maestro de Zeus
    Animated.parallel([
      Animated.spring(emblemScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(emblemOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Respiración del Rayo y Medallón
    Animated.loop(
      Animated.sequence([
        Animated.timing(emblemGlowPulse, {
          toValue: 1.035,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(emblemGlowPulse, {
          toValue: 0.98,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Entrada del Título y Lema
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
    }, 500);

    setTimeout(() => {
      Animated.timing(quoteOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 800);

    // Entrada del Botón de Ingreso
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
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(buttonPulse, {
            toValue: 1,
            duration: 900,
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
            {/* AMBIENTE DE FONDO OSCURO CON RESPLANDOR CENTRAL */}
            <View style={styles.ambientBackgroundGlow} />

            {/* SECCIÓN PRINCIPAL: EL EMBLEMA MAESTRO DE ZEUS & ATARAXIA */}
            <View style={styles.mainContentBlock}>
              <Animated.View
                style={[
                  styles.masterEmblemWrapper,
                  {
                    opacity: emblemOpacity,
                    transform: [
                      { scale: emblemScale },
                      { scale: emblemGlowPulse },
                    ],
                  },
                ]}
              >
                <Image
                  source={require('../../assets/images/gods_lightning_master.png')}
                  style={styles.masterEmblemImage}
                  resizeMode="contain"
                />
              </Animated.View>

              {/* TÍTULO MONUMENTAL Y LEMA ESTOICO */}
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

                {/* INSIGNIA CELESTIAL DORADA */}
                <View style={styles.divineBadgeContainer}>
                  <ThemedText style={styles.divineBadgeText}>
                    TEMPLO DEL AUTODOMINIO
                  </ThemedText>
                </View>

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

            {/* BOTÓN DE ACCESO TÁCTIL (TOTALMENTE DESPEJADO) */}
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
    paddingTop: Platform.OS === 'web' ? 32 : 48,
    paddingBottom: Platform.OS === 'web' ? 28 : 40,
  },
  ambientBackgroundGlow: {
    position: 'absolute',
    top: '25%',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    borderRadius: (SCREEN_WIDTH * 0.9) / 2,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 60,
  },
  mainContentBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flex: 1,
  },
  masterEmblemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: Platform.OS === 'web' ? 330 : 280,
    height: Platform.OS === 'web' ? 330 : 280,
    marginBottom: 8,
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 30,
  },
  masterEmblemImage: {
    width: '100%',
    height: '100%',
  },
  titleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  titleWingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  divineSparkleWing: {
    fontSize: 22,
    color: '#FFE259',
    textShadowColor: 'rgba(255, 226, 89, 0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  divineMainTitle: {
    fontSize: Platform.OS === 'web' ? 44 : 38,
    fontWeight: '900',
    color: '#FFFDE0',
    letterSpacing: Platform.OS === 'web' ? 9 : 7,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(255, 226, 89, 0.95)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 24,
    fontFamily: Platform.OS === 'ios' ? 'Cinzel' : 'serif',
  },
  divineBadgeContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 226, 89, 0.50)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 3.5,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
  divineBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFE259',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  quoteContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
    gap: 2,
  },
  stoicMottoText: {
    fontSize: 13,
    fontStyle: 'italic',
    fontFamily: 'serif',
    color: '#E2E8F0',
    textAlign: 'center',
    textShadowColor: 'rgba(212, 175, 55, 0.4)',
    textShadowRadius: 6,
    lineHeight: 18,
  },
  stoicAuthorText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#D4AF37',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  bottomActionsBlock: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    gap: 6,
  },
  enterButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderWidth: 1.5,
    borderColor: '#FFE259',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 11,
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
  },
  enterButtonSparkle: {
    fontSize: 14,
    color: '#FFE259',
  },
  enterButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFDE0',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  touchHintText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: 'rgba(212, 175, 55, 0.7)',
    letterSpacing: 1.2,
  },
});
