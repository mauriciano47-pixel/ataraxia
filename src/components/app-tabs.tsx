import { Tabs } from 'expo-router';

import { HomeTabIcon, BarbellTabIcon, NutritionTabIcon, JournalTabIcon, ProgressTabIcon } from '@/components/TabSvgIcons';

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#D4AF37', // Oro Imperial Cepillado
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontFamily: 'monospace',
          fontSize: 10,
          fontWeight: 'bold',
          letterSpacing: 0.5,
        },
        tabBarStyle: {
          backgroundColor: 'rgba(8, 10, 16, 0.98)',
          borderTopWidth: 1.5,
          borderTopColor: 'rgba(212, 175, 55, 0.35)',
          paddingBottom: 6,
          paddingTop: 6,
          height: 64,
          elevation: 12,
          shadowColor: '#D4AF37',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
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
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="+not-found"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
