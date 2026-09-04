import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { SafeStorage } from '@/utils/safeStorage';

// LLAVES DE ACCESO AUTORIZADAS (Tú + Tus 3 personas autorizadas)
// Puedes usar el PIN numérico de 6 dígitos o la clave alfanumérica
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

export function TempleAccessGate({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    // 1. En Entorno Nativo: Auto-desbloquear de inmediato como Arconte Supremo
    if (Platform.OS !== 'web') {
      SafeStorage.setItem(STORAGE_KEY, 'true');
      SafeStorage.setItem('ataraxia_is_archon_master', 'true');
      SafeStorage.setItem('ataraxia_archon_auth_v1', 'true');
      SafeStorage.setItem('ataraxia_pact_accepted_v2', 'true');
      SafeStorage.setItem('ataraxia_onboarding_completed_v2', 'true');
      return true;
    }

    // 2. En Web: Verificar almacenamiento o llave en URL
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlKey = params.get('key')?.trim().toUpperCase();
        if (urlKey && AUTHORIZED_KEYS.includes(urlKey)) {
          SafeStorage.setItem(STORAGE_KEY, 'true');
          SafeStorage.setItem('ataraxia_current_logged_key', urlKey);

          if (ARCHON_MASTER_KEYS.includes(urlKey)) {
            // ACCESO MAESTRO DEL ARCONTE (MAURO)
            SafeStorage.setItem('ataraxia_is_archon_master', 'true');
            SafeStorage.setItem('ataraxia_archon_auth_v1', 'true');
            SafeStorage.setItem('ataraxia_pact_accepted_v2', 'true');
            SafeStorage.setItem('ataraxia_onboarding_completed_v2', 'true');
          } else {
            // ACCESO DE GUARDIÁN INVITADO (ZEUS777, ATARAXIA, ATARAXIA-ROYAL)
            // Purgar inmediatamente cualquier residuo de Arconte en este navegador
            SafeStorage.removeItem('ataraxia_is_archon_master');
            SafeStorage.removeItem('ataraxia_archon_auth_v1');

            const isGuardianRegistered = SafeStorage.getItem(`ataraxia_guardian_registered_${urlKey}`);
            if (isGuardianRegistered !== 'true') {
              // Si no se ha registrado, forzar inicio limpio para el guardián
              SafeStorage.removeItem('ataraxia_onboarding_completed_v2');
              SafeStorage.removeItem('ataraxia_pact_accepted_v2');
              SafeStorage.removeItem('ataraxia_path_chosen_v2');
              SafeStorage.removeItem('ataraxia_user_profile_v5');
            }
          }
          return true;
        }
      } catch {}

      if (SafeStorage.getItem(STORAGE_KEY) === 'true') {
        return true;
      }
    }
    return false;
  });

  const [inputCode, setInputCode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Verificación en cliente post-montaje
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    if (SafeStorage.getItem(STORAGE_KEY) === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  const handleUnlock = () => {
    const cleanCode = inputCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Por favor ingresa tu código de acceso.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    setTimeout(() => {
      if (AUTHORIZED_KEYS.includes(cleanCode)) {
        SafeStorage.setItem(STORAGE_KEY, 'true');
        SafeStorage.setItem('ataraxia_current_logged_key', cleanCode);

        if (ARCHON_MASTER_KEYS.includes(cleanCode)) {
          SafeStorage.setItem('ataraxia_is_archon_master', 'true');
          SafeStorage.setItem('ataraxia_archon_auth_v1', 'true');
          SafeStorage.setItem('ataraxia_pact_accepted_v2', 'true');
          SafeStorage.setItem('ataraxia_onboarding_completed_v2', 'true');
        } else {
          // Purgar credenciales de Arconte para guardianes
          SafeStorage.removeItem('ataraxia_is_archon_master');
          SafeStorage.removeItem('ataraxia_archon_auth_v1');

          const isGuardianRegistered = SafeStorage.getItem(`ataraxia_guardian_registered_${cleanCode}`);
          if (isGuardianRegistered !== 'true') {
            SafeStorage.removeItem('ataraxia_onboarding_completed_v2');
            SafeStorage.removeItem('ataraxia_pact_accepted_v2');
            SafeStorage.removeItem('ataraxia_path_chosen_v2');
            SafeStorage.removeItem('ataraxia_user_profile_v5');
          }
        }
        setIsUnlocked(true);
      } else {
        setErrorMsg('❌ Clave no reconocida. El Santuario de Ataraxia permanece sellado.');
        if (Platform.OS !== 'web') {
          Alert.alert('Acceso Denegado', 'La clave ingresada no pertenece a ninguno de los 4 guardianes autorizados.');
        }
      }
      setIsVerifying(false);
    }, 300);
  };

  // Si ya está desbloqueado, renderizar la app normalmente
  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <View style={styles.gateRoot}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* MEDALLÓN DE ZEUS Y GUARDIÁN */}
          <View style={styles.emblemContainer}>
            {Platform.OS === 'web' ? (
              <img
                src="/zeus_emblem.png"
                alt="Guardián de Ataraxia"
                width={160}
                height={160}
                style={{
                  width: '160px',
                  height: '160px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 20px rgba(255, 226, 89, 0.45))',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
            ) : (
              <Image
                source={require('../../assets/images/zeus_master_emblem_transparent.png')}
                style={{ width: 150, height: 150 }}
                resizeMode="contain"
              />
            )}
          </View>

          {/* TÍTULO Y CONDICIÓN DEL SANTUARIO */}
          <View style={styles.headerBlock}>
            <ThemedText style={styles.subBadge}>SANTUARIO PRIVADO</ThemedText>
            <ThemedText style={styles.mainTitle}>ACCESO RESTRINGIDO</ThemedText>
            <ThemedText style={styles.description}>
              Este templo está consagrado exclusivamente para ti y tus 3 guardianes autorizados. Ingresa tu Llave Maestra para continuar.
            </ThemedText>
          </View>

          {/* FORMULARIO DE DESBLOQUEO */}
          <View style={styles.formCard}>
            <View style={styles.inputWrapper}>
              <Ionicons name="key-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Ingresa PIN o Clave Secreta"
                placeholderTextColor="#64748B"
                value={inputCode}
                onChangeText={(text) => {
                  setInputCode(text);
                  if (errorMsg) setErrorMsg('');
                }}
                onSubmitEditing={handleUnlock}
                secureTextEntry={false}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={20}
              />
            </View>

            {errorMsg ? (
              <View style={styles.errorBanner}>
                <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.unlockButton, isVerifying && styles.unlockButtonDisabled]}
              onPress={handleUnlock}
              activeOpacity={0.85}
              disabled={isVerifying}
            >
              <ThemedText style={styles.unlockButtonText}>
                {isVerifying ? 'VERIFICANDO LLAVE...' : 'DESBLOQUEAR TEMPLO ⚡'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* PIE DE PÁGINA INFORMATIVO */}
          <View style={styles.footerInfo}>
            <ThemedText style={styles.footerNote}>
              🏛️ Solo 4 personas en el mundo tienen autorización para acceder a esta instancia.
            </ThemedText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// Función auxiliar para volver a bloquear el templo desde Perfil si se desea
export function lockTempleAccess(): void {
  SafeStorage.removeItem(STORAGE_KEY);
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

const styles = StyleSheet.create({
  gateRoot: {
    flex: 1,
    backgroundColor: '#040406',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emblemContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  nativeEmblemPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 2,
    borderColor: '#FFE259',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 28,
    maxWidth: 420,
  },
  subBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFE259',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 226, 89, 0.4)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFDE0',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Cinzel' : 'serif',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 226, 89, 0.6)',
    textShadowRadius: 10,
  },
  description: {
    fontSize: 12.5,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  formCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(12, 16, 28, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 18,
    padding: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 7, 13, 0.8)',
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: '#FFFDE0',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 11,
    color: '#F87171',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 15,
  },
  unlockButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderWidth: 1.4,
    borderColor: '#FFE259',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  unlockButtonDisabled: {
    opacity: 0.6,
  },
  unlockButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFDE0',
    letterSpacing: 1.8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  footerInfo: {
    marginTop: 24,
    maxWidth: 340,
    alignItems: 'center',
  },
  footerNote: {
    fontSize: 10.5,
    color: '#64748B',
    textAlign: 'center',
    fontFamily: 'monospace',
    lineHeight: 15,
  },
});
