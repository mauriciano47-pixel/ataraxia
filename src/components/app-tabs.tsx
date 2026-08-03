import { Tabs } from 'expo-router';

import { HomeTabIcon, BarbellTabIcon, NutritionTabIcon, JournalTabIcon, ProgressTabIcon } from '@/components/TabSvgIcons';

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0052FF', // Azul Cobalto
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontFamily: 'monospace',
          fontSize: 10,
          fontWeight: 'bold',
          letterSpacing: 0.5,
        },
        tabBarStyle: {
          backgroundColor: 'rgba(11, 17, 33, 0.96)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0, 82, 255, 0.25)',
          paddingBottom: 6,
          paddingTop: 6,
          height: 64,
          elevation: 12,
          shadowColor: '#0052FF',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
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
          tabBarIcon: ({ color, focused }) => <JournalTabIcon color={focused ? '#D4AF37' : color} size={24} focused={focused} />,
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
