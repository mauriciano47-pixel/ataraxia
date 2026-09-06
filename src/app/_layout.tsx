import { Tabs } from 'expo-router';
import React, { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import {
  HoyIcon,
  JournalIcon,
  TrainerIcon,
  ProgressIcon,
  NutritionIcon,
  ProfileIcon,
  ArchonCrownIcon,
  SculptureCameraIcon,
  InfoTabIcon,
} from '@/components/TabSvgIcons';

class GlobalErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[Centinela Ataraxia] Interceptado:', error?.message, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#050507', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: '#D4AF37', fontSize: 32, marginBottom: 12 }}>🏛️</Text>
          <Text style={{ color: '#FFE259', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, letterSpacing: 1 }}>
            ATARAXIA • MODO RECUPERACIÓN
          </Text>
          <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', marginBottom: 24, lineHeight: 18, maxWidth: 360 }}>
            Se interceptó una anomalía no crítica de interfaz. Tus datos biométricos y pacto estoico permanecen 100% seguros.
          </Text>
          <TouchableOpacity
            onPress={this.handleReset}
            style={{ backgroundColor: '#D4AF37', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 }}
          >
            <Text style={{ color: '#050507', fontWeight: 'bold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Reanudar Templo
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

import { DailyLogProvider } from '@/context/DailyLogContext';
import { TempleAccessGate } from '@/components/TempleAccessGate';
import { GlobalPedometerRootTracker } from '@/components/GlobalPedometerRootTracker';

export default function TabLayout() {
  useEffect(() => {
    // Desactivar y ocultar el splash nativo de Android/iOS al montar la interfaz
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <GlobalErrorBoundary>
      <DailyLogProvider>
        <GlobalPedometerRootTracker />
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
          name="about"
          options={{
            title: 'Info',
            tabBarLabel: 'ℹ️ Info',
            tabBarIcon: ({ color, focused }) => <InfoTabIcon color={focused ? '#D4AF37' : color} size={22} />,
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
