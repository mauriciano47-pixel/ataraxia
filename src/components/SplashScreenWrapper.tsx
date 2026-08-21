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
  const boltScale = useRef(new Animated.Value(0.4)).current;
  const boltOpacity = useRef(new Animated.Value(0)).current;
  const boltGlowPulse = useRef(new Animated.Value(0.9)).current;
  const haloRotate = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
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
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(containerScale, {
        toValue: 1.04,
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

    // 1. Entrada Majestuosa del Rayo
    Animated.parallel([
      Animated.spring(boltScale, {
        toValue: 1,
        friction: 6,
        tension: 45,
        useNativeDriver: true,
      }),
      Animated.timing(boltOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Pulso de Resplandor Neón Divino
    Animated.loop(
      Animated.sequence([
        Animated.timing(boltGlowPulse, {
          toValue: 1.22,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(boltGlowPulse, {
          toValue: 0.88,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Rotación Lenta del Halo Sagrado
    Animated.loop(
      Animated.timing(haloRotate, {
        toValue: 1,
        duration: 30000,
        useNativeDriver: true,
      })
    ).start();

    // 4. Revelación del Título Monumental
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
    }, 450);

    // 5. Revelación de la Insignia y Cita
    setTimeout(() => {
      Animated.timing(badgeOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 750);

    setTimeout(() => {
      Animated.timing(quoteOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 1050);

    // 6. Revelación y Pulsación del Botón
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
    }, 1350);
  }, []);

  const haloSpin = haloRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
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
            activeOpacity={0.95}
            onPress={dismissSplash}
            style={styles.touchContainer}
          >
            {/* AMBIENTE AURORA CELESTIAL */}
            <View style={styles.ambientGlowBackground}>
              <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={StyleSheet.absoluteFill}>
                <Defs>
                  <RadialGradient id="cosmicDawn" cx="50%" cy="38%" r="60%">
                    <Stop offset="0%" stopColor="#FFE259" stopOpacity="0.32" />
                    <Stop offset="30%" stopColor="#D4AF37" stopOpacity="0.18" />
                    <Stop offset="65%" stopColor="#F59E0B" stopOpacity="0.07" />
                    <Stop offset="100%" stopColor="#040406" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx={SCREEN_WIDTH / 2} cy={SCREEN_HEIGHT * 0.38} r={SCREEN_WIDTH * 0.75} fill="url(#cosmicDawn)" />
              </Svg>
            </View>

            {/* SECCIÓN SUPERIOR Y CENTRAL: EL RAYO ICÓNICO CLÁSICO Y EL TÍTULO */}
            <View style={styles.mainContentBlock}>
              {/* CONTENEDOR DEL RAYO 3D DE ORO PURO */}
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

                {/* HALO SAGRADO ROTATIVO */}
                <Animated.View
                  style={[
                    styles.rotatingHaloWrapper,
                    {
                      transform: [{ rotate: haloSpin }],
                    },
                  ]}
                >
                  <Svg width={250} height={250} viewBox="0 0 250 250">
                    <Defs>
                      <LinearGradient id="haloRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor="#FFFDE0" stopOpacity="0.8" />
                        <Stop offset="30%" stopColor="#FFE259" stopOpacity="0.5" />
                        <Stop offset="70%" stopColor="#D4AF37" stopOpacity="0.3" />
                        <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0.7" />
                      </LinearGradient>
                    </Defs>
                    {/* Anillos Celestiales */}
                    <Circle cx={125} cy={125} r={112} stroke="url(#haloRingGrad)" strokeWidth={2} fill="none" />
                    <Circle cx={125} cy={125} r={118} stroke="rgba(255, 226, 89, 0.3)" strokeWidth={1.2} strokeDasharray="6, 5" fill="none" />
                    <Circle cx={125} cy={125} r={104} stroke="rgba(212, 175, 55, 0.2)" strokeWidth={1} fill="none" />

                    {/* 4 Chispas en los Puntos Cardinales */}
                    <Circle cx={125} cy={13} r={2.8} fill="#FFFFFF" />
                    <Circle cx={237} cy={125} r={2.8} fill="#FFE259" />
                    <Circle cx={125} cy={237} r={2.8} fill="#FFFFFF" />
                    <Circle cx={13} cy={125} r={2.8} fill="#FFE259" />
                  </Svg>
                </Animated.View>

                {/* EL RAYO ICÓNICO DE ORO 3D (FORMA CLÁSICA AFILADA IMPECABLE) */}
                <Svg width={250} height={250} viewBox="0 0 250 250">
                  <Defs>
                    {/* Gradiente Faceta Izquierda: Oro Diamante Incandescente */}
                    <LinearGradient id="pureGoldFacetLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="#FFFFFF" />
                      <Stop offset="25%" stopColor="#FFFDE0" />
                      <Stop offset="55%" stopColor="#FFE259" />
                      <Stop offset="85%" stopColor="#D4AF37" />
                      <Stop offset="100%" stopColor="#F59E0B" />
                    </LinearGradient>

                    {/* Gradiente Faceta Derecha: Oro Profundo / Sombra Biselada */}
                    <LinearGradient id="pureGoldFacetRight" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="#FFE259" />
                      <Stop offset="30%" stopColor="#D4AF37" />
                      <Stop offset="65%" stopColor="#B45309" />
                      <Stop offset="90%" stopColor="#78350F" />
                      <Stop offset="100%" stopColor="#451A03" />
                    </LinearGradient>

                    {/* Columna Vertebral de Plasma Blanco */}
                    <LinearGradient id="plasmaSpine" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                      <Stop offset="50%" stopColor="#FFFDE0" stopOpacity="0.9" />
                      <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                    </LinearGradient>

                    {/* Resplandor Aureo Trasero */}
                    <RadialGradient id="backBloom" cx="50%" cy="50%" r="50%">
                      <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                      <Stop offset="30%" stopColor="#FFE259" stopOpacity="0.6" />
                      <Stop offset="65%" stopColor="#F59E0B" stopOpacity="0.25" />
                      <Stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                    </RadialGradient>
                  </Defs>

                  {/* 1. Resplandor Trasero */}
                  <Circle cx={125} cy={125} r={75} fill="url(#backBloom)" />

                  {/* 2. Sombra de Relieve 3D en Bronce */}
                  <Polygon
                    points="148,18 78,136 124,136 88,238 174,116 132,116"
                    fill="rgba(120, 53, 15, 0.9)"
                    transform="translate(3, 4)"
                  />

                  {/* 3. Borde Neón Brillante Exterior */}
                  <Polygon
                    points="148,18 78,136 124,136 88,238 174,116 132,116"
                    fill="rgba(245, 158, 11, 0.35)"
                    stroke="rgba(255, 226, 89, 0.95)"
                    strokeWidth={5}
                    strokeLinejoin="round"
                  />

                  {/* 4. Faceta Derecha (Sombra de Oro 3D) */}
                  <Polygon
                    points="148,18 130,136 88,238 174,116 132,116"
                    fill="url(#pureGoldFacetRight)"
                    stroke="#D4AF37"
                    strokeWidth={0.8}
                    strokeLinejoin="round"
                  />

                  {/* 5. Faceta Izquierda (Luz Incandescente de Oro Diamante) */}
                  <Polygon
                    points="148,18 78,136 124,136 88,238 130,136"
                    fill="url(#pureGoldFacetLeft)"
                    stroke="#FFFFFF"
                    strokeWidth={1.2}
                    strokeLinejoin="round"
                  />

                  {/* 6. Línea Divisoria de la Columna Vertebral 3D */}
                  <Path
                    d="M 148 18 L 130 136 L 88 238"
                    stroke="url(#plasmaSpine)"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />

                  {/* 7. Destello Especular en el Vértice Superior */}
                  <Circle cx={148} cy={18} r={3} fill="#FFFFFF" />
                  {/* Destello Especular en la Punta Inferior */}
                  <Circle cx={88} cy={238} r={3.5} fill="#FFFFFF" />
                </Svg>
              </Animated.View>

              {/* SECCIÓN DEL TÍTULO ATARAXIA */}
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
                    TEMPLO DEL AUTODOMINIO
                  </ThemedText>
                </Animated.View>

                {/* LEMA ORACULAR ESTOICO */}
                <Animated.View style={[styles.quoteContainer, { opacity: quoteOpacity }]}>
                  <ThemedText style={styles.stoicMottoText}>
                    &ldquo;Visto desde arriba, todo pesa menos.&rdquo;
                  </ThemedText>
                  <ThemedText style={styles.stoicAuthorText}>
                    — Marco Aurelio
                  </ThemedText>
                </Animated.View>
              </Animated.View>
            </View>

            {/* SECCIÓN INFERIOR: BOTÓN DE ACCESO TÁCTIL (SIN SUPERPOSICIÓN) */}
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
              <ThemedText style={styles.touchHintText}>Toca en cualquier lugar de la pantalla</ThemedText>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 40 : 50,
    paddingBottom: Platform.OS === 'web' ? 30 : 40,
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
  boltCenterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 250,
    height: 250,
    marginBottom: 8,
  },
  pulsingHalo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 226, 89, 0.18)',
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 40,
  },
  rotatingHaloWrapper: {
    position: 'absolute',
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
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
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 24,
    fontFamily: Platform.OS === 'ios' ? 'Cinzel' : 'serif',
  },
  divineBadgeContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.14)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 226, 89, 0.45)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
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
    paddingHorizontal: 24,
    gap: 3,
  },
  stoicMottoText: {
    fontSize: 13,
    fontStyle: 'italic',
    fontFamily: 'serif',
    color: '#E2E8F0',
    textAlign: 'center',
    textShadowColor: 'rgba(212, 175, 55, 0.35)',
    textShadowRadius: 5,
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
    marginTop: 12,
  },
  enterButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderWidth: 1.4,
    borderColor: '#FFE259',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
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
