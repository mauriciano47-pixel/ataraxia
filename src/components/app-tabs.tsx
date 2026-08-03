import { Tabs } from 'expo-router';

import { HomeTabIcon, BarbellTabIcon, NutritionTabIcon, JournalTabIcon, ProgressTabIcon } from '@/components/TabSvgIcons';

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0052FF', // Azul Eléctrico
        tabBarInactiveTintColor: '#64748B', // Gris Plata
        tabBarLabelStyle: {
          fontFamily: 'monospace',
          fontSize: 10,
          fontWeight: 'bold',
          letterSpacing: 0.5,
        },
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0, 82, 255, 0.15)',
          paddingBottom: 6,
          paddingTop: 6,
          height: 64,
          elevation: 8,
          shadowColor: '#0052FF',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hoy',
          tabBarIcon: ({ color, focused }) => <HomeTabIcon color={focused ? '#0052FF' : color} size={24} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="trainer"
        options={{
          title: 'Entreno',
          tabBarIcon: ({ color, focused }) => <BarbellTabIcon color={focused ? '#0052FF' : color} size={24} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrición',
          tabBarIcon: ({ color, focused }) => <NutritionTabIcon color={focused ? '#0052FF' : color} size={24} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Diario',
          tabBarIcon: ({ color, focused }) => <JournalTabIcon color={focused ? '#00C6FF' : color} size={24} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, focused }) => <ProgressTabIcon color={focused ? '#0052FF' : color} size={24} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
