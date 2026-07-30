import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { HomeTabIcon, BarbellTabIcon, NutritionTabIcon, JournalTabIcon, ProgressTabIcon } from '@/components/TabSvgIcons';

export default function AppTabs() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#D4AF37', // Oro Imperial
        tabBarInactiveTintColor: '#777C88',
        tabBarLabelStyle: {
          fontFamily: 'monospace',
          fontSize: 10,
          fontWeight: 'bold',
          letterSpacing: 0.5,
        },
        tabBarStyle: {
          backgroundColor: 'rgba(6, 6, 9, 0.96)',
          borderTopWidth: 1.5,
          borderTopColor: 'rgba(212, 175, 55, 0.35)', // Borde Oro Cepillado
          paddingBottom: 6,
          paddingTop: 6,
          height: 64,
          elevation: 10,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hoy',
          tabBarIcon: ({ color, focused }) => <HomeTabIcon color={focused ? '#D4AF37' : color} size={24} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="trainer"
        options={{
          title: 'Entreno',
          tabBarIcon: ({ color, focused }) => <BarbellTabIcon color={focused ? '#D4AF37' : color} size={24} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrición',
          tabBarIcon: ({ color, focused }) => <NutritionTabIcon color={focused ? '#D4AF37' : color} size={24} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Diario',
          tabBarIcon: ({ color, focused }) => <JournalTabIcon color={focused ? '#D4AF37' : color} size={24} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, focused }) => <ProgressTabIcon color={focused ? '#D4AF37' : color} size={24} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
