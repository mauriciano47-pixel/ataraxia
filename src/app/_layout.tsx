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

class GlobalErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; errorText: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, errorText: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorText: error?.message || 'Ajuste de renderizado detectado' };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Centinela capturó error:', error, errorInfo);
  }

  handleCleanRecover = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Purgar únicamente claves temporales conservando acceso de Arconte y credenciales maestras
        const preservedKeys = [
          'ataraxia_temple_access_granted_v2',
          'ataraxia_is_archon_master',
          'ataraxia_archon_auth_v1',
          'ataraxia_pact_accepted_v2',
          'ataraxia_onboarding_completed_v2',
          'ataraxia_path_chosen_v2',
          'ataraxia_user_profile_v2',
          'ataraxia_user_profile_core_v1',
        ];
        const backup: Record<string, string> = {};
        preservedKeys.forEach((k) => {
          const val = window.localStorage.getItem(k);
          if (val) backup[k] = val;
        });

        // Limpiar logs temporales
        Object.keys(window.localStorage).forEach((k) => {
          if (k.startsWith('ataraxia_log_') || k.startsWith('ataraxia_pedometer_')) {
            window.localStorage.removeItem(k);
          }
        });

        // Restaurar credenciales maestras intactas
        Object.entries(backup).forEach(([k, v]) => {
          window.localStorage.setItem(k, v);
        });

        window.location.reload();
        return;
      }
    } catch {}
    this.setState({ hasError: false, errorText: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#040406', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 26, fontWeight: '900', color: '#D4AF37', marginBottom: 12, letterSpacing: 1.5, fontFamily: 'serif' }}>
            🏛️ TEMPLO DE ATARAXIA
          </Text>
          <Text style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
            Centinela ha protegido el Templo ante un ajuste de renderizado del dispositivo.
          </Text>

          <View style={{ width: '100%', maxWidth: 320, gap: 12 }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#D4AF37',
                paddingVertical: 14,
                paddingHorizontal: 24,
                borderRadius: 12,
                alignItems: 'center',
                shadowColor: '#FFE259',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
              onPress={() => {
                this.setState({ hasError: false, errorText: '' });
                if (typeof window !== 'undefined') window.location.reload();
              }}
              activeOpacity={0.85}
            >
              <Text style={{ color: '#05070D', fontWeight: '900', fontSize: 13, letterSpacing: 0.8, fontFamily: 'monospace' }}>
                ⚡ REINICIAR TEMPLO
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                borderWidth: 1,
                borderColor: 'rgba(212, 175, 55, 0.4)',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: 'center',
              }}
              onPress={this.handleCleanRecover}
              activeOpacity={0.85}
            >
              <Text style={{ color: '#E2E8F0', fontWeight: 'bold', fontSize: 11, fontFamily: 'monospace' }}>
                🛡️ PURGAR CACHÉ Y RESTAURAR
              </Text>
            </TouchableOpacity>
          </View>

          {this.state.errorText ? (
            <Text style={{ fontSize: 9.5, color: '#64748B', marginTop: 24, textAlign: 'center', fontFamily: 'monospace' }}>
              Código de Diagnóstico: {this.state.errorText}
            </Text>
          ) : null}
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
