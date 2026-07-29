import * as SplashScreen from 'expo-splash-screen';
import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, Platform } from 'react-native';
import Animated, { Easing, Keyframe, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const DURATION = 3000; // 3 segundos exactos

export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    // Inicialización garantizada tanto en Web como en Mobile
    const timer = setTimeout(() => {
      setAnimate(true);
      SplashScreen.hideAsync().catch(() => {});
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (animate) {
      progressWidth.value = withTiming(100, { duration: DURATION, easing: Easing.linear });
    }
  }, [animate, progressWidth]);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: { opacity: 1 },
    85: { opacity: 1 }, // Mantener visible durante los 3 segundos
    100: { opacity: 0, easing: Easing.out(Easing.ease) },
  });

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const content = (
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

      {/* Lema Estoico Principal */}
      <Text style={styles.motto}>&ldquo;Visto desde arriba, todo pesa menos&rdquo;</Text>
      <Text style={styles.subMotto}>Controla tu percepción • Acepta tu destino</Text>

      {/* Barra de progreso de 3 segundos */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, progressStyle]} />
      </View>
    </View>
  );

  return (
    <Animated.View
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.splashOverlay}>
      {content}
    </Animated.View>
  );
}

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
  }
});
