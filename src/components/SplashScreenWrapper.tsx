import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
  ScrollView,
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
  Ellipse,
} from 'react-native-svg';
import * as SplashScreen from 'expo-splash-screen';
import { ThemedText } from './themed-text';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type BoltOption = 1 | 2 | 3 | 4;

export default function SplashScreenWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [selectedBolt, setSelectedBolt] = useState<BoltOption>(2); // Por defecto Opción 2: Laureles

  // Valores animados
  const boltScale = useRef(new Animated.Value(0.5)).current;
  const boltOpacity = useRef(new Animated.Value(0)).current;
  const boltGlowPulse = useRef(new Animated.Value(0.9)).current;
  const haloRotate = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const containerScale = useRef(new Animated.Value(1)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;

  const dismissSplash = () => {
    Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(containerScale, {
        toValue: 1.04,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSplash(false);
    });
  };

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

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

    Animated.loop(
      Animated.sequence([
        Animated.timing(boltGlowPulse, {
          toValue: 1.2,
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

    Animated.loop(
      Animated.timing(haloRotate, {
        toValue: 1,
        duration: 35000,
        useNativeDriver: true,
      })
    ).start();

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
  }, []);

  const haloSpin = haloRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // RENDERIZADO DEL RAYO SEGÚN LA OPCIÓN SELECCIONADA
  const renderBoltGraphic = () => {
    switch (selectedBolt) {
      // OPCIÓN 1: RAYO CLÁSICO IMPERIAL ORO 3D
      case 1:
        return (
          <Svg width={250} height={250} viewBox="0 0 250 250">
            <Defs>
              <RadialGradient id="g1" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#FFE259" stopOpacity="0.45" />
                <Stop offset="100%" stopColor="#040406" stopOpacity="0" />
              </RadialGradient>
              <LinearGradient id="l1" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#FFFFFF" />
                <Stop offset="25%" stopColor="#FFFDE0" />
                <Stop offset="55%" stopColor="#FFE259" />
                <Stop offset="85%" stopColor="#D4AF37" />
                <Stop offset="100%" stopColor="#F59E0B" />
              </LinearGradient>
              <LinearGradient id="l1_r" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#FFE259" />
                <Stop offset="30%" stopColor="#D4AF37" />
                <Stop offset="70%" stopColor="#B45309" />
                <Stop offset="100%" stopColor="#451A03" />
              </LinearGradient>
              <LinearGradient id="plasma1" x1="0" y1="0" x2="0" y2="100%">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <Stop offset="50%" stopColor="#FFFDE0" stopOpacity="0.9" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Circle cx={125} cy={125} r={115} fill="url(#g1)" />
            <Circle cx={125} cy={125} r={105} stroke="rgba(255,226,89,0.5)" strokeWidth={1.5} strokeDasharray="6,5" fill="none" />
            <Circle cx={125} cy={125} r={95} stroke="rgba(212,175,55,0.25)" strokeWidth={1} fill="none" />
            
            <Polygon points="148,22 80,132 124,132 88,230 172,112 132,112" fill="#451A03" transform="translate(3,4)" />
            <Polygon points="148,22 80,132 124,132 88,230 172,112 132,112" stroke="#FFE259" strokeWidth={5} fill="rgba(245,158,11,0.35)" />
            <Polygon points="148,22 130,132 88,230 172,112 132,112" fill="url(#l1_r)" stroke="#D4AF37" strokeWidth={0.8} />
            <Polygon points="148,22 80,132 124,132 88,230 130,132" fill="url(#l1)" stroke="#FFFFFF" strokeWidth={1.4} />
            <Path d="M 148 22 L 130 132 L 88 230" stroke="url(#plasma1)" strokeWidth={2.5} strokeLinecap="round" fill="none" />
            <Circle cx={148} cy={22} r={3.5} fill="#FFFFFF" />
            <Circle cx={88} cy={230} r={4} fill="#FFFFFF" />
          </Svg>
        );

      // OPCIÓN 2: RAYO DE ZEUS CON CORONA DE LAURELES
      case 2:
        return (
          <Svg width={250} height={250} viewBox="0 0 250 250">
            <Defs>
              <RadialGradient id="g2" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#FFE259" stopOpacity="0.5" />
                <Stop offset="100%" stopColor="#040406" stopOpacity="0" />
              </RadialGradient>
              <LinearGradient id="laurelGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#FFFDE0" />
                <Stop offset="35%" stopColor="#FFE259" />
                <Stop offset="70%" stopColor="#D4AF37" />
                <Stop offset="100%" stopColor="#8A6615" />
              </LinearGradient>
              <LinearGradient id="l2" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#FFFFFF" />
                <Stop offset="40%" stopColor="#FFE259" />
                <Stop offset="100%" stopColor="#D4AF37" />
              </LinearGradient>
            </Defs>
            <Circle cx={125} cy={125} r={115} fill="url(#g2)" />

            {/* Corona de Laureles Izquierda */}
            <G fill="url(#laurelGrad)" stroke="#FFE259" strokeWidth={0.8}>
              <Path d="M 68 62 C 55 58, 46 68, 55 77 C 64 77, 70 71, 68 62 Z" />
              <Path d="M 52 87 C 39 84, 33 96, 42 105 C 51 105, 57 96, 52 87 Z" />
              <Path d="M 48 118 C 35 118, 32 130, 42 139 C 51 139, 54 130, 48 118 Z" />
              <Path d="M 58 152 C 48 155, 48 167, 58 173 C 67 170, 67 161, 58 152 Z" />
              <Path d="M 78 181 C 71 187, 78 199, 87 199 C 93 193, 90 184, 78 181 Z" />
              <Path d="M 104 201 C 100 210, 110 216, 119 213 C 122 204, 113 198, 104 201 Z" />
            </G>

            {/* Corona de Laureles Derecha */}
            <G fill="url(#laurelGrad)" stroke="#FFE259" strokeWidth={0.8}>
              <Path d="M 182 62 C 195 58, 204 68, 195 77 C 186 77, 180 71, 182 62 Z" />
              <Path d="M 198 87 C 211 84, 217 96, 208 105 C 199 105, 193 96, 198 87 Z" />
              <Path d="M 202 118 C 215 118, 218 130, 208 139 C 199 139, 196 130, 202 118 Z" />
              <Path d="M 192 152 C 202 155, 202 167, 192 173 C 183 170, 183 161, 192 152 Z" />
              <Path d="M 172 181 C 179 187, 172 199, 163 199 C 157 193, 160 184, 172 181 Z" />
              <Path d="M 146 201 C 150 210, 140 216, 131 213 C 128 204, 137 198, 146 201 Z" />
            </G>

            {/* Rayo Central de Zeus */}
            <Polygon points="144,30 88,126 126,126 94,212 166,110 130,110" fill="#451A03" transform="translate(2.5,3.5)" />
            <Polygon points="144,30 88,126 126,126 94,212 166,110 130,110" stroke="#FFE259" strokeWidth={4} fill="#D4AF37" />
            <Polygon points="144,30 88,126 126,126 94,212 128,126" fill="url(#l2)" />
            <Circle cx={94} cy={212} r={4.5} fill="#FFFFFF" />
            <Circle cx={144} cy={30} r={4} fill="#FFFFFF" />
          </Svg>
        );

      // OPCIÓN 3: MEDALLÓN DE ÓNIX & ESCUDO ESPARTANO
      case 3:
        return (
          <Svg width={250} height={250} viewBox="0 0 250 250">
            <Defs>
              <RadialGradient id="onyxFull" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#1E2338" />
                <Stop offset="55%" stopColor="#0F1322" />
                <Stop offset="85%" stopColor="#080A14" />
                <Stop offset="100%" stopColor="#030408" />
              </RadialGradient>
              <LinearGradient id="goldBezel" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#FFFDE0" />
                <Stop offset="25%" stopColor="#FFE259" />
                <Stop offset="50%" stopColor="#D4AF37" />
                <Stop offset="75%" stopColor="#8A6615" />
                <Stop offset="100%" stopColor="#FFE259" />
              </LinearGradient>
            </Defs>
            <Circle cx={125} cy={125} r={110} fill="url(#onyxFull)" />
            <Circle cx={125} cy={125} r={110} stroke="url(#goldBezel)" strokeWidth={9} fill="none" />
            <Circle cx={125} cy={125} r={98} stroke="rgba(255,253,224,0.6)" strokeWidth={1.5} fill="none" />
            <Circle cx={125} cy={125} r={88} stroke="rgba(212,175,55,0.3)" strokeWidth={1} strokeDasharray="5,6" fill="none" />

            <Polygon points="144,42 90,130 126,130 100,208 162,118 130,118" fill="#451A03" transform="translate(2.5,3.5)" />
            <Polygon points="144,42 90,130 126,130 100,208 162,118 130,118" stroke="#FFE259" strokeWidth={3.5} fill="#D4AF37" />
            <Polygon points="144,42 90,130 126,130 100,208 128,130" fill="#FFFDE0" />
            <Circle cx={100} cy={208} r={4} fill="#FFFFFF" />
          </Svg>
        );

      // OPCIÓN 4: RAYO DE PLASMA CYBER-OBSIDIAN
      case 4:
        return (
          <Svg width={250} height={250} viewBox="0 0 250 250">
            <Defs>
              <RadialGradient id="plasmaGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#00C6FF" stopOpacity="0.35" />
                <Stop offset="40%" stopColor="#FFE259" stopOpacity="0.4" />
                <Stop offset="100%" stopColor="#040406" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx={125} cy={125} r={115} fill="url(#plasmaGlow)" />

            {/* Arcos Tesla */}
            <Path d="M 85 110 L 60 135 L 70 138 L 45 170" stroke="#00C6FF" strokeWidth={2} strokeLinecap="round" fill="none" opacity="0.9" />
            <Path d="M 165 100 L 190 125 L 180 128 L 205 155" stroke="#FFE259" strokeWidth={2} strokeLinecap="round" fill="none" opacity="0.9" />

            <Polygon points="148,22 80,132 124,132 88,230 172,112 132,112" stroke="#00C6FF" strokeWidth={8} fill="rgba(0,198,255,0.25)" />
            <Polygon points="148,22 80,132 124,132 88,230 172,112 132,112" stroke="#FFE259" strokeWidth={4} fill="#D4AF37" />
            <Polygon points="148,22 80,132 124,132 88,230 130,132" fill="#FFFFFF" />
            <Circle cx={88} cy={230} r={5} fill="#00C6FF" />
            <Circle cx={148} cy={22} r={4.5} fill="#FFFFFF" />
          </Svg>
        );
    }
  };

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
          <View style={styles.touchContainer}>
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

            {/* BARRA SUPERIOR: SELECTOR DE OPCIONES EN VIVO */}
            <View style={styles.optionBar}>
              <ThemedText style={styles.optionBarLabel}>ELIGE TU EMBLEMA:</ThemedText>
              <View style={styles.optionTabsRow}>
                <TouchableOpacity
                  onPress={() => setSelectedBolt(1)}
                  style={[styles.tabButton, selectedBolt === 1 && styles.tabButtonActive]}
                >
                  <ThemedText style={[styles.tabText, selectedBolt === 1 && styles.tabTextActive]}>
                    1. Clásico ⚡
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedBolt(2)}
                  style={[styles.tabButton, selectedBolt === 2 && styles.tabButtonActive]}
                >
                  <ThemedText style={[styles.tabText, selectedBolt === 2 && styles.tabTextActive]}>
                    2. Laureles 🏛️
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedBolt(3)}
                  style={[styles.tabButton, selectedBolt === 3 && styles.tabButtonActive]}
                >
                  <ThemedText style={[styles.tabText, selectedBolt === 3 && styles.tabTextActive]}>
                    3. Escudo 🛡️
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedBolt(4)}
                  style={[styles.tabButton, selectedBolt === 4 && styles.tabButtonActive]}
                >
                  <ThemedText style={[styles.tabText, selectedBolt === 4 && styles.tabTextActive]}>
                    4. Cyber ⚡
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* SECCIÓN CENTRAL: EL GRÁFICO DEL RAYO ACTIVO */}
            <View style={styles.mainContentBlock}>
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

                {/* GRÁFICO EN VIVO */}
                {renderBoltGraphic()}
              </Animated.View>

              {/* SECCIÓN DEL TÍTULO ATARAXIA */}
              <View style={styles.titleSection}>
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

                {/* LEMA ORACULAR ESTOICO */}
                <View style={styles.quoteContainer}>
                  <ThemedText style={styles.stoicMottoText}>
                    &ldquo;Visto desde arriba, todo pesa menos.&rdquo;
                  </ThemedText>
                  <ThemedText style={styles.stoicAuthorText}>
                    — Marco Aurelio (Emperador Estoico)
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* SECCIÓN INFERIOR: BOTÓN DE ACCESO TÁCTIL (SIN SUPERPOSICIÓN) */}
            <Animated.View
              style={[
                styles.bottomActionsBlock,
                {
                  transform: [{ scale: buttonPulse }],
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={dismissSplash}
                style={styles.enterButtonPill}
              >
                <ThemedText style={styles.enterButtonSparkle}>⚡</ThemedText>
                <ThemedText style={styles.enterButtonText}>INGRESAR AL TEMPLO</ThemedText>
                <ThemedText style={styles.enterButtonSparkle}>⚡</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.touchHintText}>Toca para comenzar tu disciplina</ThemedText>
            </Animated.View>
          </View>
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
  optionBar: {
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
    gap: 6,
  },
  optionBarLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#D4AF37',
    letterSpacing: 2,
    fontWeight: '700',
  },
  optionTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  tabButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#FFE259',
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  tabText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#94A3B8',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFE259',
    fontWeight: '900',
  },
  mainContentBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flex: 1,
    marginTop: -8,
  },
  boltCenterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 250,
    height: 230,
  },
  pulsingHalo: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 226, 89, 0.16)',
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 35,
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
    fontSize: Platform.OS === 'web' ? 40 : 34,
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
    marginTop: 8,
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
    paddingHorizontal: 22,
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
