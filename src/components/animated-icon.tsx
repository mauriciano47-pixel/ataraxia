import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const DURATION = 3000;

export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: { opacity: 1 },
    80: { opacity: 1 }, // Stay visible for most of the duration
    100: { opacity: 0, easing: Easing.out(Easing.ease) },
  });

  const content = (
    <View style={styles.contentContainer}>
      <Text style={styles.title}>ATARAXIA</Text>
      <Text style={styles.credits}>Desarrollado por Mauricio</Text>
    </View>
  );

  return animate ? (
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
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }}
      style={styles.splashOverlay}>
      {content}
    </View>
  );
}

// We still export AnimatedIcon for compatibility if it's used elsewhere
export function AnimatedIcon() {
  return null;
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#080808', // Deep Space Black
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#C5832B', // Stoic Bronze
    letterSpacing: 8,
    textAlign: 'center',
  },
  credits: {
    position: 'absolute',
    bottom: 50,
    fontSize: 12,
    color: '#60646C',
    textTransform: 'uppercase',
    letterSpacing: 2,
  }
});
