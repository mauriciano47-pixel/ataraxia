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
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: '#0A0A0C',
          borderTopWidth: 1.5,
          borderTopColor: 'rgba(211, 47, 47, 0.3)',
          paddingBottom: 6,
          paddingTop: 6,
          height: 62,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hoy',
          tabBarIcon: ({ color, focused }) => <HomeTabIcon color={color} size={24} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="trainer"
        options={{
          title: 'Entreno',
          tabBarIcon: ({ color, focused }) => <BarbellTabIcon color={color} size={24} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrición',
          tabBarIcon: ({ color, focused }) => <NutritionTabIcon color={color} size={24} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Diario',
          tabBarIcon: ({ color, focused }) => <JournalTabIcon color={color} size={24} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, focused }) => <ProgressTabIcon color={color} size={24} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
