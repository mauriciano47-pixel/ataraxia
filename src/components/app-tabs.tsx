import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.background, borderTopWidth: 2, borderTopColor: colors.backgroundSelected, paddingBottom: 5, height: 60 },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hoy',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trainer"
        options={{
          title: 'Entreno',
          tabBarIcon: ({ color }) => <Ionicons name="barbell" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrición',
          tabBarIcon: ({ color }) => <Ionicons name="nutrition" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Diario',
          tabBarIcon: ({ color }) => <Ionicons name="book" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color }) => <Ionicons name="trending-up" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
