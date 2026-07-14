import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const QUOTES = [
  "Eres mortal y este día es un privilegio. ¿Cómo usarás tu cuerpo hoy?",
  "El impedimento a la acción avanza la acción. Lo que se interpone se convierte en el camino.",
  "No nos afecta lo que nos sucede, sino lo que nos decimos acerca de lo que nos sucede.",
  "Tienes poder sobre tu mente, no sobre los eventos externos. Date cuenta de esto y encontrarás fuerza."
];

async function scheduleMorningNotification() {
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
}

export default function TabLayout() {
  const [loaded, error] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    scheduleMorningNotification();
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}

