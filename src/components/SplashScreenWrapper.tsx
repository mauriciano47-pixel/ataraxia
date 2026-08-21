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
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const emblemScale = useRef(new Animated.Value(0.9)).current;
  const emblemPulse = useRef(new Animated.Value(1)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const containerScale = useRef(new Animated.Value(1)).current;

  const dismissSplash = () => {
    Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(containerScale, {
        toValue: 1.03,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSplash(false);
    });
  };

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

    // Entrada suave y majestuosa
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(emblemScale, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    // Respiración del Rayo de Zeus
    Animated.loop(
      Animated.sequence([
        Animated.timing(emblemPulse, {
          toValue: 1.03,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(emblemPulse, {
          toValue: 0.98,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulsación suave del Botón
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
  }, []);

  // Dimensiones dinámicas del emblema para máxima presencia y proporción áurea
  const emblemSize = Platform.OS === 'web' 
    ? Math.min(SCREEN_WIDTH * 0.72, SCREEN_HEIGHT * 0.38, 330)
    : Math.min(SCREEN_WIDTH * 0.75, SCREEN_HEIGHT * 0.36, 290);

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
            {/* AMBIENTE AURORA CELESTIAL */}
            <View style={styles.ambientGlowBackground}>
              <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={StyleSheet.absoluteFill}>
                <Defs>
                  <RadialGradient id="cosmicDawn" cx="50%" cy="36%" r="60%">
                    <Stop offset="0%" stopColor="#FFE259" stopOpacity="0.25" />
                    <Stop offset="35%" stopColor="#D4AF37" stopOpacity="0.12" />
                    <Stop offset="70%" stopColor="#F59E0B" stopOpacity="0.04" />
                    <Stop offset="100%" stopColor="#040406" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx={SCREEN_WIDTH / 2} cy={SCREEN_HEIGHT * 0.36} r={SCREEN_WIDTH * 0.75} fill="url(#cosmicDawn)" />
              </Svg>
            </View>

            {/* CONTENEDOR PRINCIPAL */}
            <Animated.View style={[styles.mainContentBlock, { opacity: contentOpacity }]}>
              
              {/* EL GRAN RAYO Y MEDALLÓN DE ZEUS MAJESTUOSO (1:1 SIN APLASTAR) */}
              <Animated.View
                style={[
                  styles.emblemWrapper,
                  {
                    width: emblemSize,
                    height: emblemSize,
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

              {/* SECCIÓN DE TÍTULO, MENCIONES Y SABIDURÍA ESTOICA */}
              <View style={styles.titleSection}>
                {/* TÍTULO MONUMENTAL */}
                <View style={styles.titleWingsRow}>
                  <ThemedText style={styles.divineSparkleWing}>⚡</ThemedText>
                  <ThemedText style={styles.divineMainTitle}>ATARAXIA</ThemedText>
                  <ThemedText style={styles.divineSparkleWing}>⚡</ThemedText>
                </View>

                {/* INSIGNIA CELESTIAL */}
                <View style={styles.divineBadgeContainer}>
                  <ThemedText style={styles.divineBadgeText}>
                    TEMPLO DEL AUTODOMINIO
                  </ThemedText>
                </View>

                {/* TRÍADA DE VIRTUDES (MENCIONES EN CHIPS DORADOS) */}
                <View style={styles.triadRow}>
                  <View style={styles.triadChip}>
                    <ThemedText style={styles.triadChipText}>⚔️ FUERZA</ThemedText>
                  </View>
                  <ThemedText style={styles.triadDivider}>•</ThemedText>
                  <View style={styles.triadChip}>
                    <ThemedText style={styles.triadChipText}>🏛️ DISCIPLINA</ThemedText>
                  </View>
                  <ThemedText style={styles.triadDivider}>•</ThemedText>
                  <View style={styles.triadChip}>
                    <ThemedText style={styles.triadChipText}>⚡ SERENIDAD</ThemedText>
                  </View>
                </View>

                {/* LEMA ORACULAR DE MARCO AURELIO */}
                <View style={styles.quoteCardContainer}>
                  <ThemedText style={styles.stoicQuoteText}>
                    &ldquo;Visto desde arriba, todo pesa menos.&rdquo;
                  </ThemedText>
                  <ThemedText style={styles.stoicAuthorText}>
                    — Marco Aurelio (Emperador Estoico)
                  </ThemedText>
                </View>
              </View>
            </Animated.View>

            {/* BOTÓN INFERIOR TÁCTIL */}
            <Animated.View
              style={[
                styles.bottomActionsBlock,
                {
                  opacity: contentOpacity,
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
    paddingTop: Platform.OS === 'web' ? 20 : 40,
    paddingBottom: Platform.OS === 'web' ? 20 : 32,
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
    backgroundColor: 'transparent',
    marginBottom: 6,
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
    width: '100%',
    maxWidth: 480,
  },
  titleWingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  divineSparkleWing: {
    fontSize: 20,
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
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 226, 89, 0.55)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 3.5,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  divineBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFE259',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  triadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 2,
  },
  triadChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
  },
  triadChipText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FDE047',
    fontFamily: 'monospace',
    letterSpacing: 1.1,
  },
  triadDivider: {
    color: 'rgba(212, 175, 55, 0.6)',
    fontSize: 12,
  },
  quoteCardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
    gap: 2,
    backgroundColor: 'rgba(9, 12, 22, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 14,
    paddingVertical: 8,
    width: '92%',
  },
  stoicQuoteText: {
    fontSize: 13.5,
    fontStyle: 'italic',
    fontWeight: '700',
    fontFamily: 'serif',
    color: '#FFFDE0',
    textAlign: 'center',
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowRadius: 6,
    lineHeight: 18,
  },
  stoicAuthorText: {
    fontSize: 10.5,
    fontFamily: 'monospace',
    color: '#FFE259',
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 1,
  },
  bottomActionsBlock: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    gap: 4,
  },
  enterButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderWidth: 1.4,
    borderColor: '#FFE259',
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 10,
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
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
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  touchHintText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    color: 'rgba(212, 175, 55, 0.75)',
    letterSpacing: 1.2,
  },
});
