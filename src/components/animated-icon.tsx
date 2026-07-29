// animated-icon.tsx
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

// Duración exacta de la pantalla de bienvenida
const DURATION = 3000; // 3 000 ms

export function AnimatedSplashOverlay() {
  // Estado de visibilidad del overlay
  const [visible, setVisible] = useState(true);

  // Valor animado para la barra de progreso
  const progress = useSharedValue(0);

  // Duración del retardo antes de ocultar el splash nativo de Expo
  const SPLASH_NATIVE_DELAY = 500; // 0.5 s

  // Estilo animado de la barra de progreso
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  // Cuando el componente se monta, iniciamos la animación y ocultamos el splash nativo
  useEffect(() => {
    // Aseguramos que el splash nativo de Expo no desaparezca automáticamente
    // (ya se llamó a preventAutoHideAsync en _layout.tsx)
    const start = async () => {
      // Retraso antes de ocultar el splash nativo de Expo
      setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, SPLASH_NATIVE_DELAY);
      // Iniciamos la barra de progreso con duración exacta de 3 s
      progress.value = withTiming(100, { duration: DURATION, easing: Easing.linear });
      // Después de DURATION ms, removemos el overlay
      setTimeout(() => setVisible(false), DURATION);
    };
    start();
  }, []);

  if (!visible) return null;

  return (
    <View style={styles.splashOverlay}>
      <View style={styles.contentContainer}>
        {/* Ícono Estoico HD */}
        <View style={styles.iconContainer}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>
        {/* Título de la App */}
        <Text style={styles.title}>ATARAXIA</Text>
        {/* Lema */}
        <Text style={styles.motto}>“Visto desde arriba, todo pesa menos”</Text>
        <Text style={styles.subMotto}>Controla tu percepción • Acepta tu destino</Text>
        {/* Barra de progreso */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, progressStyle]} />
        </View>
      </View>
    </View>
  );
}

// Exportado para mantener compatibilidad con importaciones existentes
export function AnimatedIcon() {
  return null;
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    ...(Platform.OS === 'web' ? ({ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 } as any) : {}),
    backgroundColor: '#050505',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
    maxWidth: 400,
  },
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D32F2F',
    marginBottom: 20,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 10,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  motto: {
    fontSize: 16,
    color: '#D32F2F',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: 1,
    fontFamily: 'serif',
  },
  subMotto: {
    fontSize: 11,
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 6,
    fontFamily: 'monospace',
  },
  progressTrack: {
    width: 140,
    height: 3,
    backgroundColor: '#222222',
    marginTop: 32,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#D32F2F',
  },
});
