import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Image, Text, StyleSheet, Platform, Animated, TouchableOpacity, Pressable } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import Svg, { Circle, Path, G, Defs, RadialGradient, Stop, LinearGradient } from 'react-native-svg';

const AUTO_DISMISS_DELAY = 1000; // 1 segundo para visualización limpia
const FADE_OUT_DURATION = 250; // Fade out rápido

// Emblema Vectorial Oficial de Ataraxia (Laurel Estoico + Rayo de Fuerza + Monograma A)
function AtaraxiaEmblem({ size = 110 }: { size?: number }) {
  const [imageError, setImageError] = useState(false);

  return (
    <View style={[styles.emblemWrapper, { width: size, height: size, borderRadius: size / 2 }]}>
      {/* Halo de Resplandor Esmeralda/Dorado */}
      <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
            <Stop offset="70%" stopColor="#059669" stopOpacity="0.15" />
            <Stop offset="100%" stopColor="#050507" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F59E0B" />
            <Stop offset="50%" stopColor="#10B981" />
            <Stop offset="100%" stopColor="#059669" />
          </LinearGradient>
        </Defs>

        <Circle cx="50" cy="50" r="48" fill="url(#glowGrad)" />
        <Circle cx="50" cy="50" r="44" stroke="url(#goldGrad)" strokeWidth="2.5" fill="rgba(10, 15, 29, 0.95)" />

        {/* Corona de Laureles Estoica */}
        <G stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" fill="none">
          {/* Rama Izquierda */}
          <Path d="M 28 66 C 24 55 24 40 33 28 C 34 32 32 37 28 40" />
          <Path d="M 27 52 C 23 46 25 38 31 34" />
          <Path d="M 31 62 C 26 58 27 50 32 46" />

          {/* Rama Derecha */}
          <Path d="M 72 66 C 76 55 76 40 67 28 C 66 32 68 37 72 40" />
          <Path d="M 73 52 C 77 46 75 38 69 34" />
          <Path d="M 69 62 C 74 58 73 50 68 46" />
        </G>

        {/* Rayo de Poder / Columna de Resistencia Central */}
        <Path
          d="M 52 24 L 43 45 L 49 45 L 47 68 L 58 43 L 51 43 Z"
          fill="#10B981"
          stroke="#34D399"
          strokeWidth="0.8"
        />
      </Svg>

      {/* Si existe imagen PNG personalizada, se renderiza con fallback suave */}
      {!imageError && (
        <Image
          source={require('../../assets/images/icon.png')}
          style={[styles.logoImageOverlay, { width: size * 0.75, height: size * 0.75, borderRadius: (size * 0.75) / 2 }]}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      )}
    </View>
  );
}

export default function SplashScreenWrapper({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const isDismissed = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const dismissNow = useCallback(() => {
    if (isDismissed.current) return;
    isDismissed.current = true;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Ocultar SplashScreen nativo de Expo de inmediato
    SplashScreen.hideAsync().catch(() => {});

    // Iniciar animación suave de Fade Out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: FADE_OUT_DURATION,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setVisible(false);
    });

    // Fallback de seguridad por si el callback de Animated no dispara en Web
    setTimeout(() => {
      setVisible(false);
    }, FADE_OUT_DURATION + 50);
  }, [fadeAnim]);

  useEffect(() => {
    // Liberar el splash nativo del SO tan pronto como React monte
    SplashScreen.hideAsync().catch(() => {});

    // Temporizador de auto-cierre
    timerRef.current = setTimeout(() => {
      dismissNow();
    }, AUTO_DISMISS_DELAY);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dismissNow]);

  return (
    <View style={styles.rootContainer}>
      {/* La app se monta inmediatamente por debajo */}
      {children}

      {/* Overlay de Bienvenida */}
      {visible && (
        <Animated.View
          style={[
            styles.splashOverlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Pressable style={styles.touchableArea} onPress={dismissNow}>
            <View style={styles.contentContainer}>
              {/* Emblema Vectorial / Icono Garantizado */}
              <AtaraxiaEmblem size={110} />

              <Text style={styles.title}>ATARAXIA</Text>
              <Text style={styles.motto}>&quot;Visto desde arriba, todo pesa menos&quot;</Text>
              <Text style={styles.subMotto}>🏛️ MEMENTO MORI • IMPERIUM ESTOICO 🏛️</Text>

              {/* Botón táctil activo con respuesta inmediata */}
              <TouchableOpacity
                style={styles.tapPromptButton}
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation();
                  dismissNow();
                }}
              >
                <Text style={styles.tapPromptText}>Toca para continuar ⚡</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
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
    width: '88%',
    maxWidth: 400,
  },
  emblemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  logoImageOverlay: {
    position: 'absolute',
    opacity: 0.95,
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
  tapPromptButton: {
    marginTop: 32,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1.5,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tapPromptText: {
    fontSize: 12.5,
    color: '#34D399',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
