import { Tabs } from 'expo-router';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import {
  HoyIcon,
  JournalIcon,
  TrainerIcon,
  ProgressIcon,
  NutritionIcon,
  ProfileIcon,
  ArchonCrownIcon,
  SculptureCameraIcon,
} from '@/components/TabSvgIcons';

class GlobalErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; errorText: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, errorText: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorText: error.message || 'Error de renderizado' };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error capturado:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#05070D', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#D4AF37', marginBottom: 10 }}>🏛️ TEMPLO DE ATARAXIA</Text>
          <Text style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 20 }}>
            Centinela-1 recuperó la sesión tras un ajuste de renderizado.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#D4AF37', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
            onPress={() => { if (typeof window !== 'undefined') window.location.reload(); }}
          >
            <Text style={{ color: '#05070D', fontWeight: 'bold', fontSize: 12 }}>⚡ REINICIAR TEMPLO</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

import { DailyLogProvider } from '@/context/DailyLogContext';
import { TempleAccessGate } from '@/components/TempleAccessGate';

export default function TabLayout() {
  return (
    <GlobalErrorBoundary>
      <DailyLogProvider>
        <TempleAccessGate>
          <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#D4AF37',
          tabBarInactiveTintColor: '#64748B',
          tabBarStyle: {
            backgroundColor: '#0A0E1A',
            borderTopColor: 'rgba(212, 175, 55, 0.25)',
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 88 : 64,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: 'monospace',
            fontWeight: 'bold',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Hoy',
            tabBarLabel: '⚡ Hoy',
            tabBarIcon: ({ color, focused }) => <HoyIcon color={focused ? '#D4AF37' : color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Programa',
            tabBarLabel: '🏛️ Programa',
            tabBarIcon: ({ color, focused }) => <ProgressIcon color={focused ? '#D4AF37' : color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="transformation"
          options={{
            title: 'Escultura',
            tabBarLabel: '📸 Escultura',
            tabBarIcon: ({ color, focused }) => <SculptureCameraIcon color={focused ? '#D4AF37' : color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="trainer"
          options={{
            title: 'Entreno',
            tabBarLabel: '🏋️‍♂️ Entreno',
            tabBarIcon: ({ color, focused }) => <TrainerIcon color={focused ? '#D4AF37' : color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Diario',
            tabBarLabel: '📖 Diario',
            tabBarIcon: ({ color, focused }) => <JournalIcon color={focused ? '#D4AF37' : color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="nutrition"
          options={{
            title: 'Nutrición',
            tabBarLabel: '🥗 Nutrición',
            tabBarIcon: ({ color, focused }) => <NutritionIcon color={focused ? '#D4AF37' : color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarLabel: '👤 Perfil',
            tabBarIcon: ({ color, focused }) => <ProfileIcon color={focused ? '#D4AF37' : color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="archon"
          options={{
            title: 'Arconte',
            tabBarLabel: '👑 Trono',
            tabBarIcon: ({ color, focused }) => <ArchonCrownIcon color={focused ? '#D4AF37' : color} size={24} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="+not-found"
          options={{
            href: null,
          }}
        />
      </Tabs>
        </TempleAccessGate>
      </DailyLogProvider>
    </GlobalErrorBoundary>
  );
}
