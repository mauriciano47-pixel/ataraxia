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
  Rect,
} from 'react-native-svg';
import * as SplashScreen from 'expo-splash-screen';
import { ThemedText } from './themed-text';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SplashScreenWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Valores animados
  const boltScale = useRef(new Animated.Value(0.35)).current;
  const boltOpacity = useRef(new Animated.Value(0)).current;
  const boltGlowPulse = useRef(new Animated.Value(0.9)).current;
  const sunburstRotate = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(25)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const quoteOpacity = useRef(new Animated.Value(0)).current;
  const triadOpacity = useRef(new Animated.Value(0)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const containerScale = useRef(new Animated.Value(1)).current;

  const dismissSplash = () => {
    Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(containerScale, {
        toValue: 1.05,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSplash(false);
    });
  };

  useEffect(() => {
    // Ocultar splash screen nativo de Expo
    SplashScreen.hideAsync().catch(() => {});

    // 1. Entrada Majestuosa del Rayo Divino
    Animated.parallel([
      Animated.spring(boltScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(boltOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Pulso de Resplandor Neón Divino (Loop continuo)
    Animated.loop(
      Animated.sequence([
        Animated.timing(boltGlowPulse, {
          toValue: 1.28,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(boltGlowPulse, {
          toValue: 0.88,
          duration: 1100,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Rotación Lenta y Celestial del Sol Invicto (40 segundos por vuelta)
    Animated.loop(
      Animated.timing(sunburstRotate, {
        toValue: 1,
        duration: 40000,
        useNativeDriver: true,
      })
    ).start();

    // 4. Revelación del Título Monumental ATARAXIA (0.5s a 1.2s)
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
          tension: 38,
          useNativeDriver: true,
        }),
      ]).start();
    }, 500);

    // 5. Revelación de la Insignia Imperial (0.9s a 1.5s)
    setTimeout(() => {
      Animated.timing(badgeOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 900);

    // 6. Revelación del Lema Oracular Estoico (1.3s a 1.9s)
    setTimeout(() => {
      Animated.timing(quoteOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 1300);

    // 7. Revelación de la Tríada de los Dioses (1.7s a 2.3s)
    setTimeout(() => {
      Animated.timing(triadOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 1700);

    // 8. Revelación y Pulsación del Botón de Entrada (2.0s en adelante)
    setTimeout(() => {
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonPulse, {
            toValue: 1.05,
            duration: 850,
            useNativeDriver: true,
          }),
          Animated.timing(buttonPulse, {
            toValue: 1,
            duration: 850,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 2000);
  }, []);

  const spinInterpolate = sunburstRotate.interpolate({
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
            activeOpacity={0.9}
            onPress={dismissSplash}
            style={styles.touchContainer}
          >
            {/* AMBIENTE AURORA CELESTIAL DE FONDO */}
            <View style={styles.ambientGlowBackground}>
              <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={StyleSheet.absoluteFill}>
                <Defs>
                  <RadialGradient id="cosmicDawn" cx="50%" cy="42%" r="65%">
                    <Stop offset="0%" stopColor="#FFE259" stopOpacity="0.38" />
                    <Stop offset="30%" stopColor="#D4AF37" stopOpacity="0.22" />
                    <Stop offset="60%" stopColor="#F59E0B" stopOpacity="0.10" />
                    <Stop offset="100%" stopColor="#040406" stopOpacity="0" />
                  </RadialGradient>
                  <LinearGradient id="lightningColumn" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#FFFDE0" stopOpacity="0.35" />
                    <Stop offset="30%" stopColor="#FFE259" stopOpacity="0.15" />
                    <Stop offset="80%" stopColor="#F59E0B" stopOpacity="0.05" />
                    <Stop offset="100%" stopColor="#040406" stopOpacity="0" />
                  </LinearGradient>
                </Defs>
                <Circle cx={SCREEN_WIDTH / 2} cy={SCREEN_HEIGHT * 0.38} r={SCREEN_WIDTH * 0.8} fill="url(#cosmicDawn)" />
                <Rect x={SCREEN_WIDTH / 2 - 60} y={0} width={120} height={SCREEN_HEIGHT * 0.7} fill="url(#lightningColumn)" opacity={0.6} />
              </Svg>
            </View>

            {/* CENTRO: EL ESCUDO IMPERIAL Y EL GRAN RAYO 3D DE ZEUS */}
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

              {/* ROTACIÓN DEL SOL INVICTO Y RAYOS RADIALES */}
              <Animated.View
                style={[
                  styles.rotatingSunburst,
                  {
                    transform: [{ rotate: spinInterpolate }],
                  },
                ]}
              >
                <Svg width={320} height={320} viewBox="0 0 320 320">
                  <Defs>
                    <LinearGradient id="sunRayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor="#FFE259" stopOpacity="0.6" />
                      <Stop offset="60%" stopColor="#D4AF37" stopOpacity="0.2" />
                      <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                    </LinearGradient>
                  </Defs>
                  {/* 16 Rayos de Sol Divino Geométricos */}
                  {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((deg, i) => (
                    <G key={i} transform={`rotate(${deg} 160 160)`}>
                      <Polygon
                        points="160,25 163,80 157,80"
                        fill="url(#sunRayGrad)"
                        opacity={i % 2 === 0 ? 0.9 : 0.45}
                      />
                    </G>
                  ))}
                  {/* Anillo de Micro-Marcas de Compás */}
                  <Circle cx={160} cy={160} r={148} stroke="rgba(255, 226, 89, 0.35)" strokeWidth={1} strokeDasharray="3, 7" fill="none" />
                </Svg>
              </Animated.View>

              {/* EL GRAN RAYO MONUMENTAL 3D HYPER-DETALLADO */}
              <Svg width={320} height={320} viewBox="0 0 320 320">
                <Defs>
                  {/* Gradiente Bisel 3D Oro Diamante */}
                  <LinearGradient id="bezel3DGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#FFFDE0" />
                    <Stop offset="20%" stopColor="#FFE259" />
                    <Stop offset="45%" stopColor="#D4AF37" />
                    <Stop offset="70%" stopColor="#8A6615" />
                    <Stop offset="88%" stopColor="#F59E0B" />
                    <Stop offset="100%" stopColor="#FFFBEB" />
                  </LinearGradient>

                  {/* Gradiente Cuerpo Faceta Izquierda (Luz Incandescente) */}
                  <LinearGradient id="boltFacetLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#FFFFFF" />
                    <Stop offset="25%" stopColor="#FFFBEB" />
                    <Stop offset="55%" stopColor="#FFE259" />
                    <Stop offset="85%" stopColor="#F59E0B" />
                    <Stop offset="100%" stopColor="#B45309" />
                  </LinearGradient>

                  {/* Gradiente Cuerpo Faceta Derecha (Sombra Oro Profundo) */}
                  <LinearGradient id="boltFacetRight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#FFE259" />
                    <Stop offset="30%" stopColor="#D4AF37" />
                    <Stop offset="65%" stopColor="#B45309" />
                    <Stop offset="90%" stopColor="#78350F" />
                    <Stop offset="100%" stopColor="#451A03" />
                  </LinearGradient>

                  {/* Gradiente Chisel Specular White Core */}
                  <LinearGradient id="boltSpineCore" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                    <Stop offset="40%" stopColor="#FFFDE0" stopOpacity="0.9" />
                    <Stop offset="80%" stopColor="#FFE259" stopOpacity="0.8" />
                    <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                  </LinearGradient>

                  {/* Halo Aureo Explosivo */}
                  <RadialGradient id="zeusNovaBloom" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                    <Stop offset="25%" stopColor="#FFE259" stopOpacity="0.75" />
                    <Stop offset="60%" stopColor="#F59E0B" stopOpacity="0.30" />
                    <Stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                  </RadialGradient>

                  {/* Disco de Ónix Profundo */}
                  <RadialGradient id="onyxPlateCenter" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#1E2338" />
                    <Stop offset="55%" stopColor="#0F1322" />
                    <Stop offset="85%" stopColor="#080A14" />
                    <Stop offset="100%" stopColor="#030408" />
                  </RadialGradient>

                  {/* Gradiente de Rama Eléctrica */}
                  <LinearGradient id="branchBoltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#FFFFFF" />
                    <Stop offset="50%" stopColor="#FFE259" />
                    <Stop offset="100%" stopColor="#F59E0B" />
                  </LinearGradient>
                </Defs>

                {/* 1. DISCO DE ÓNYX SAGRADO Y BISEL 3D */}
                <Circle cx={160} cy={160} r={142} fill="url(#onyxPlateCenter)" />
                <Circle cx={160} cy={160} r={142} stroke="url(#bezel3DGrad)" strokeWidth={8} fill="none" />
                <Circle cx={160} cy={160} r={136} stroke="rgba(255, 253, 224, 0.75)" strokeWidth={1.5} fill="none" />
                <Circle cx={160} cy={160} r={146} stroke="rgba(255, 226, 89, 0.45)" strokeWidth={1.2} fill="none" />

                {/* Corona Sagrada de Puntos Celestiales */}
                <Circle cx={160} cy={160} r={126} stroke="rgba(212, 175, 55, 0.25)" strokeWidth={1} strokeDasharray="4, 6" fill="none" />

                {/* 2. ARCOS Y RAMIFICACIONES DE RELÁMPAGO SECUNDARIO (TESLA FORKS) */}
                {/* Arco Izquierdo */}
                <Path
                  d="M 125 105 L 95 130 L 105 133 L 75 165 L 85 168 L 55 205"
                  stroke="url(#branchBoltGrad)"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.85}
                />
                {/* Arco Derecho Superior */}
                <Path
                  d="M 195 90 L 230 115 L 220 118 L 255 145 L 245 148 L 275 180"
                  stroke="url(#branchBoltGrad)"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.85}
                />
                {/* Arco Derecho Inferior */}
                <Path
                  d="M 185 190 L 220 220 L 210 223 L 240 255"
                  stroke="url(#branchBoltGrad)"
                  strokeWidth={2.0}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.75}
                />

                {/* 3. ESTRELLAS Y CHISPAS VIVAS DE TRUENO */}
                {/* Starburst Superior */}
                <G transform="translate(160, 48)">
                  <Polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#FFFFFF" opacity={0.95} />
                  <Circle cx={0} cy={0} r={3} fill="#FFE259" />
                </G>
                {/* Starburst Punta Inferior */}
                <G transform="translate(132, 276)">
                  <Polygon points="0,-14 3.5,-3.5 14,0 3.5,3.5 0,14 -3.5,3.5 -14,0 -3.5,-3.5" fill="#FFFFFF" opacity={1} />
                  <Circle cx={0} cy={0} r={4} fill="#FFE259" />
                </G>
                {/* Chispas flotantes */}
                <Circle cx={68} cy={110} r={2.5} fill="#FFFFFF" opacity={0.9} />
                <Circle cx={255} cy={105} r={2.8} fill="#FFE259" opacity={0.95} />
                <Circle cx={268} cy={205} r={2.2} fill="#FFFFFF" opacity={0.85} />
                <Circle cx={52} cy={220} r={2.4} fill="#FFE259" opacity={0.9} />
                <Circle cx={160} cy={285} r={3} fill="#FFFFFF" opacity={0.95} />

                {/* 4. EL GRAN RAYO MONUMENTAL 3D ESCULPIDO DE ZEUS */}
                <G transform="translate(45, 20)">
                  {/* Aura Flare Trasera Gigante */}
                  <Circle cx={115} cy={135} r={95} fill="url(#zeusNovaBloom)" />

                  {/* Resplandor Neón de Impacto Exterior (Borde Grueso Dorado) */}
                  <Polygon
                    points="115,22 75,120 108,120 62,205 102,205 48,272 188,142 142,142 182,75 138,75"
                    fill="rgba(245, 158, 11, 0.45)"
                    stroke="rgba(255, 226, 89, 0.95)"
                    strokeWidth={8}
                    strokeLinejoin="round"
                  />

                  {/* Sombra de Relieve de Titanio / Bronce Profundo */}
                  <Polygon
                    points="115,22 75,120 108,120 62,205 102,205 48,272 188,142 142,142 182,75 138,75"
                    fill="rgba(120, 53, 15, 0.95)"
                    transform="translate(3.5, 4.5)"
                  />

                  {/* Faceta Derecha (Sombra Oro Cepillado) */}
                  <Polygon
                    points="115,22 138,75 182,75 142,142 188,142 48,272 102,205 115,160 115,22"
                    fill="url(#boltFacetRight)"
                    stroke="#D4AF37"
                    strokeWidth={1}
                    strokeLinejoin="round"
                  />

                  {/* Faceta Izquierda (Luz Oro Diamante Incandescente) */}
                  <Polygon
                    points="115,22 75,120 108,120 62,205 102,205 48,272 115,160 115,22"
                    fill="url(#boltFacetLeft)"
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                  />

                  {/* Columna Vertebral Central (Cresta de Plasma Blanco/Oro) */}
                  <Path
                    d="M 115 24 L 98 120 L 105 120 L 84 205 L 102 205 L 48 272"
                    stroke="url(#boltSpineCore)"
                    strokeWidth={3.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />

                  {/* Chisel Specular Flashes en las Puntas */}
                  <Polygon
                    points="115,24 82,118 106,118 68,202 100,202 52,268 96,204 66,204 104,122 78,122 115,28"
                    fill="#FFFFFF"
                    opacity={0.7}
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

              {/* TRÍADA DE LOS DIOSES: VIRTUD • DISCIPLINA • SERENIDAD */}
              <Animated.View style={[styles.triadRow, { opacity: triadOpacity }]}>
                <View style={styles.triadPill}>
                  <ThemedText style={styles.triadText}>⚔️ FUERZA</ThemedText>
                </View>
                <View style={styles.triadPill}>
                  <ThemedText style={styles.triadText}>🏛️ DISCIPLINA</ThemedText>
                </View>
                <View style={styles.triadPill}>
                  <ThemedText style={styles.triadText}>⚡ SERENIDAD</ThemedText>
                </View>
              </Animated.View>
            </Animated.View>

            {/* BOTÓN MAJESTUOSO: TOCA PARA INGRESAR AL TEMPLO */}
            <Animated.View
              style={[
                styles.enterButtonWrapper,
                {
                  opacity: buttonOpacity,
                  transform: [{ scale: buttonPulse }],
                },
              ]}
            >
              <View style={styles.enterButtonPill}>
                <ThemedText style={styles.enterButtonSparkle}>⚡</ThemedText>
                <ThemedText style={styles.enterButtonText}>TOCA PARA INGRESAR AL TEMPLO</ThemedText>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
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
    marginTop: -10,
    width: 320,
    height: 320,
  },
  pulsingHalo: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 226, 89, 0.20)',
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 50,
  },
  rotatingSunburst: {
    position: 'absolute',
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
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
    marginTop: 2,
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
    marginTop: 8,
    paddingHorizontal: 20,
    gap: 3,
  },
  stoicMottoText: {
    fontSize: 13.5,
    fontStyle: 'italic',
    fontFamily: 'serif',
    color: '#E2E8F0',
    textAlign: 'center',
    textShadowColor: 'rgba(212, 175, 55, 0.40)',
    textShadowRadius: 6,
    lineHeight: 19,
  },
  stoicAuthorText: {
    fontSize: 10.5,
    fontFamily: 'monospace',
    color: '#D4AF37',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  triadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  triadPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.30)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  triadText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFE259',
    letterSpacing: 1.2,
  },
  enterButtonWrapper: {
    position: 'absolute',
    bottom: 32,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
    gap: 6,
  },
  enterButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.20)',
    borderWidth: 1.5,
    borderColor: '#FFE259',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 11,
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.75,
    shadowRadius: 16,
  },
  enterButtonSparkle: {
    fontSize: 16,
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
    color: 'rgba(212, 175, 55, 0.65)',
    letterSpacing: 1.5,
  },
});
