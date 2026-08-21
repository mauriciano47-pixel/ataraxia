import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Circle,
  G,
  Polygon,
} from 'react-native-svg';
import * as SplashScreen from 'expo-splash-screen';
import { ThemedText } from './themed-text';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SplashScreenWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Valores animados
  const boltScale = useRef(new Animated.Value(0.3)).current;
  const boltOpacity = useRef(new Animated.Value(0)).current;
  const boltGlowPulse = useRef(new Animated.Value(0.8)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const quoteOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const containerScale = useRef(new Animated.Value(1)).current;

  const dismissSplash = () => {
    Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(containerScale, {
        toValue: 1.06,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSplash(false);
    });
  };

  useEffect(() => {
    // Ocultar splash screen nativo de Expo
    SplashScreen.hideAsync().catch(() => {});

    // 1. Entrada del Rayo Divino (0 a 0.7s)
    Animated.parallel([
      Animated.spring(boltScale, {
        toValue: 1,
        friction: 6,
        tension: 45,
        useNativeDriver: true,
      }),
      Animated.timing(boltOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Pulso de Resplandor Neón Divino (Loop suave)
    Animated.loop(
      Animated.sequence([
        Animated.timing(boltGlowPulse, {
          toValue: 1.25,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(boltGlowPulse, {
          toValue: 0.85,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Revelación del Título Monumental ATARAXIA (0.6s a 1.4s)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(titleTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, 550);

    // 4. Revelación de la Insignia y Lema de los Dioses (1.1s a 1.8s)
    setTimeout(() => {
      Animated.timing(badgeOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 1000);

    setTimeout(() => {
      Animated.timing(quoteOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 1300);

    // 5. Barra de Carga Divina (0 a 2.8s)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2700,
      useNativeDriver: false,
    }).start();

    // 6. Transición Cinemática y Fade-Out a los 3 segundos
    const timer = setTimeout(() => {
      dismissSplash();
    }, 3100);

    return () => clearTimeout(timer);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

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
            activeOpacity={1}
            onPress={dismissSplash}
            style={styles.touchContainer}
          >
            {/* AMBIENTE AURORA CELESTIAL DE FONDO */}
            <View style={styles.ambientGlowBackground}>
              <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={StyleSheet.absoluteFill}>
                <Defs>
                  <RadialGradient id="cosmicDawn" cx="50%" cy="45%" r="60%">
                    <Stop offset="0%" stopColor="#FFE259" stopOpacity="0.32" />
                    <Stop offset="35%" stopColor="#D4AF37" stopOpacity="0.18" />
                    <Stop offset="65%" stopColor="#F59E0B" stopOpacity="0.08" />
                    <Stop offset="100%" stopColor="#040406" stopOpacity="0" />
                  </RadialGradient>
                  <LinearGradient id="divineLightBeam" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#FFFDE0" stopOpacity="0.25" />
                    <Stop offset="40%" stopColor="#D4AF37" stopOpacity="0.10" />
                    <Stop offset="100%" stopColor="#040406" stopOpacity="0" />
                  </LinearGradient>
                </Defs>
                <Circle cx={SCREEN_WIDTH / 2} cy={SCREEN_HEIGHT * 0.42} r={SCREEN_WIDTH * 0.75} fill="url(#cosmicDawn)" />
              </Svg>
            </View>

            {/* CENTRO: EL RAYO EN SU ESPLENDOR MÁXIMO */}
            <Animated.View
              style={[
                styles.boltCenterWrapper,
                {
                  opacity: boltOpacity,
                  transform: [{ scale: boltScale }],
                },
              ]}
            >
              {/* HALO DE RESPLANDOR NEÓN PULSANTE */}
              <Animated.View
                style={[
                  styles.pulsingHalo,
                  {
                    transform: [{ scale: boltGlowPulse }],
                  },
                ]}
              />

              <Svg width={220} height={240} viewBox="0 0 220 240">
                <Defs>
                  {/* Gradiente 3D Oro Celestial */}
                  <LinearGradient id="godBolt3D" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#FFFFFF" />
                    <Stop offset="15%" stopColor="#FFFDE0" />
                    <Stop offset="40%" stopColor="#FFE259" />
                    <Stop offset="70%" stopColor="#D4AF37" />
                    <Stop offset="90%" stopColor="#F59E0B" />
                    <Stop offset="100%" stopColor="#92400E" />
                  </LinearGradient>

                  {/* Resplandor del Bisel Izquierdo */}
                  <LinearGradient id="godChiselHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                    <Stop offset="50%" stopColor="#FFE259" stopOpacity="0.85" />
                    <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0.25" />
                  </LinearGradient>

                  {/* Halo Aureo */}
                  <RadialGradient id="godAuraBloom" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                    <Stop offset="30%" stopColor="#FFE259" stopOpacity="0.65" />
                    <Stop offset="70%" stopColor="#F59E0B" stopOpacity="0.25" />
                    <Stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                  </RadialGradient>

                  {/* Anillo de Poder */}
                  <LinearGradient id="bezelRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#FFFDE0" />
                    <Stop offset="25%" stopColor="#FFE259" />
                    <Stop offset="50%" stopColor="#D4AF37" />
                    <Stop offset="75%" stopColor="#8A6615" />
                    <Stop offset="100%" stopColor="#FFFDE0" />
                  </LinearGradient>
                </Defs>

                {/* 1. ANILLO IMPERIAL DE LOS DIOSES */}
                <Circle
                  cx={110}
                  cy={115}
                  r={88}
                  stroke="url(#bezelRingGrad)"
                  strokeWidth={3}
                  fill="none"
                  opacity={0.7}
                />
                <Circle
                  cx={110}
                  cy={115}
                  r={94}
                  stroke="rgba(255, 226, 89, 0.35)"
                  strokeWidth={1.5}
                  strokeDasharray="6, 4"
                  fill="none"
                />
                <Circle
                  cx={110}
                  cy={115}
                  r={80}
                  stroke="rgba(212, 175, 55, 0.25)"
                  strokeWidth={1}
                  fill="none"
                />

                {/* 2. CHISPAS Y RELÁMPAGOS ORBITALES */}
                <Circle cx={42} cy={70} r={2.5} fill="#FFFFFF" opacity={0.9} />
                <Circle cx={178} cy={65} r={2.8} fill="#FFE259" opacity={0.95} />
                <Circle cx={188} cy={140} r={2} fill="#FFFFFF" opacity={0.85} />
                <Circle cx={32} cy={155} r={2.2} fill="#FFE259" opacity={0.9} />
                <Circle cx={110} cy={218} r={3} fill="#FFFFFF" opacity={0.95} />

                {/* Micro-rayos celestiales de acompañamiento */}
                <Path
                  d="M 50 85 L 42 98 L 48 100 L 40 115"
                  stroke="#FFE259"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.85}
                />
                <Path
                  d="M 170 85 L 178 98 L 172 100 L 180 115"
                  stroke="#FFE259"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.85}
                />

                {/* 3. EL GRAN RAYO MONUMENTAL 3D ESCULPIDO */}
                <G transform="translate(68, 40) scale(1.65)">
                  {/* Aura Flare trasera */}
                  <Circle cx={26} cy={36} r={46} fill="url(#godAuraBloom)" />

                  {/* Resplandor exterior Neón */}
                  <Polygon
                    points="28,0 8,36 24,36 12,68 44,26 28,26"
                    fill="rgba(245, 158, 11, 0.45)"
                    stroke="rgba(255, 226, 89, 0.90)"
                    strokeWidth={6}
                    strokeLinejoin="round"
                  />

                  {/* Sombra de relieve ámbar profundo */}
                  <Polygon
                    points="28,0 8,36 24,36 12,68 44,26 28,26"
                    fill="rgba(146, 64, 14, 0.85)"
                    transform="translate(2.5, 3)"
                  />

                  {/* Cuerpo 3D Dorado */}
                  <Polygon
                    points="28,0 8,36 24,36 12,68 44,26 28,26"
                    fill="url(#godBolt3D)"
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                  />

                  {/* Bisel de luz especular tallada */}
                  <Polygon
                    points="28,2 10,34 23,34 14,64 24,34 16,34 28,6"
                    fill="url(#godChiselHighlight)"
                  />
                </G>
              </Svg>
            </Animated.View>

            {/* TITULO MONUMENTAL DIGNO DE LOS DIOSES: ATARAXIA */}
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
              <Animated.View style={[styles.divineBadgeContainer, { opacity: badgeOpacity }]}>
                <ThemedText style={styles.divineBadgeText}>
                  TEMPLO DEL AUTODOMINIO • FUERZA & VIRTUD
                </ThemedText>
              </Animated.View>

              {/* LEMA ORACULAR ESTOICO */}
              <Animated.View style={[styles.quoteContainer, { opacity: quoteOpacity }]}>
                <ThemedText style={styles.stoicMottoText}>
                  &ldquo;Visto desde arriba, todo pesa menos.&rdquo;
                </ThemedText>
                <ThemedText style={styles.stoicAuthorText}>
                  — Marco Aurelio (Emperador Estoico)
                </ThemedText>
              </Animated.View>
            </Animated.View>

            {/* BARRA DE PROGRESO / INVOCACIÓN DIVINA */}
            <View style={styles.progressTrackWrapper}>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressWidth,
                    },
                  ]}
                />
              </View>
              <ThemedText style={styles.touchHintText}>Toca para ingresar ⚡</ThemedText>
            </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
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
  boltCenterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  pulsingHalo: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255, 226, 89, 0.16)',
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
  },
  titleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    gap: 8,
  },
  titleWingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  divineSparkleWing: {
    fontSize: 24,
    color: '#FFE259',
    textShadowColor: 'rgba(255, 226, 89, 0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  divineMainTitle: {
    fontSize: Platform.OS === 'web' ? 44 : 38,
    fontWeight: '900',
    color: '#FFFDE0',
    letterSpacing: Platform.OS === 'web' ? 9 : 7,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(255, 226, 89, 0.95)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 28,
    fontFamily: Platform.OS === 'ios' ? 'Cinzel' : 'serif',
  },
  divineBadgeContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.14)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 226, 89, 0.45)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginTop: 4,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  divineBadgeText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#FFE259',
    letterSpacing: 2.6,
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  quoteContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingHorizontal: 20,
    gap: 4,
  },
  stoicMottoText: {
    fontSize: 14,
    fontStyle: 'italic',
    fontFamily: 'serif',
    color: '#E2E8F0',
    textAlign: 'center',
    textShadowColor: 'rgba(212, 175, 55, 0.40)',
    textShadowRadius: 6,
    lineHeight: 20,
  },
  stoicAuthorText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#D4AF37',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  progressTrackWrapper: {
    position: 'absolute',
    bottom: 48,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
    gap: 10,
  },
  progressTrack: {
    width: '100%',
    maxWidth: 240,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFE259',
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  touchHintText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: 'rgba(212, 175, 55, 0.65)',
    letterSpacing: 1.5,
  },
});
