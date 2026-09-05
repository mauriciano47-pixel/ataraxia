import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { SafeStorage } from '@/utils/safeStorage';

// LLAVES DE ACCESO AUTORIZADAS (Compatibilidad con enlaces)
export const ARCHON_MASTER_KEYS = ['742091', 'MAURO-ARCHON'];

export const AUTHORIZED_KEYS = [
  '742091',           // PIN Maestro Numérico (Mauro)
  'MAURO-ARCHON',     // Clave Maestra de Mauro
  'ZEUS777',          // Clave Guardián 1
  'GUARDIAN-1',       // Alias Guardián 1
  'ATARAXIA',         // Clave Guardián 2
  'GUARDIAN-2',       // Alias Guardián 2
  'ATARAXIA-ROYAL',   // Clave Guardián 3
  'GUARDIAN-3',       // Alias Guardián 3
];

const STORAGE_KEY = 'ataraxia_temple_access_granted_v2';

// Inicialización síncrona a nivel de módulo
SafeStorage.setItem(STORAGE_KEY, 'true');
SafeStorage.setItem('ataraxia_is_archon_master', 'true');
SafeStorage.setItem('ataraxia_archon_auth_v1', 'true');
SafeStorage.setItem('ataraxia_pact_accepted_v2', 'true');
SafeStorage.setItem('ataraxia_onboarding_completed_v2', 'true');
SafeStorage.setItem('ataraxia_current_logged_key', '742091');

export function TempleAccessGate({ children }: { children: React.ReactNode }) {
  // Asegurar consistencia en render inicial
  SafeStorage.setItem(STORAGE_KEY, 'true');
  SafeStorage.setItem('ataraxia_is_archon_master', 'true');
  SafeStorage.setItem('ataraxia_archon_auth_v1', 'true');
  SafeStorage.setItem('ataraxia_pact_accepted_v2', 'true');
  SafeStorage.setItem('ataraxia_onboarding_completed_v2', 'true');
  SafeStorage.setItem('ataraxia_current_logged_key', '742091');

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return <>{children}</>;
}

// Función auxiliar de compatibilidad (No-op para evitar bloqueos)
export function lockTempleAccess(): void {
  // En el modelo unificado, el acceso siempre permanece libre y directo
}
