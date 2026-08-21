import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { Analytics } from '@vercel/analytics/react';

import SplashScreenWrapper from '@/components/SplashScreenWrapper';
import AppTabs from '@/components/app-tabs';

import { DailyLogProvider } from '@/context/DailyLogContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {
  // Ignorar en entornos que no soporten notificaciones
}

const QUOTES = [
  "Eres mortal y este día es un privilegio. ¿Cómo usarás tu cuerpo hoy?",
  "El impedimento a la acción avanza la acción. Lo que se interpone se convierte en el camino.",
  "No nos afecta lo que nos sucede, sino lo que nos decimos acerca de lo que nos sucede.",
  "Tienes poder sobre tu mente, no sobre los eventos externos. Date cuenta de esto y encontrarás fuerza."
];

async function scheduleMorningNotification() {
  if (Platform.OS === 'web') return;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Memento Mori 💀',
        body: randomQuote,
      },
      // @ts-ignore
      trigger: {
        hour: 7,
        minute: 0,
        repeats: true,
      },
    });
  } catch (err) {
    console.warn('[Notifications] No se pudo programar:', err);
  }
}

export default function TabLayout() {
  const [loaded, error] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  useEffect(() => {
    scheduleMorningNotification();
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <DailyLogProvider>
      <ThemeProvider value={DarkTheme}>
        <SplashScreenWrapper>
          <AppTabs />
          {Platform.OS === 'web' && <Analytics />}
        </SplashScreenWrapper>
      </ThemeProvider>
    </DailyLogProvider>
  );
}
