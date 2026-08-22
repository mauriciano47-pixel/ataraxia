import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import Svg, { RadialGradient, Defs, Stop, Rect } from 'react-native-svg';
import * as SplashScreen from 'expo-splash-screen';
import { ThemedText } from './themed-text';
import { GreekParchmentPact } from './GreekParchmentPact';
import { LegendaryPathSelector } from './LegendaryPathSelector';
import { TempleGuardianKeyStep } from './TempleGuardianKeyStep';
import { useDailyLog } from '@/context/DailyLogContext';
import { LegendaryPath } from '@/types/onboarding';
import { SafeStorage } from '@/utils/safeStorage';

type SplashStage = 'parchment' | 'lightning' | 'path_selection' | 'guardian_key' | 'none';

export default function SplashScreenWrapper({ children }: { children: React.ReactNode }) {
  const { selectLegendaryPath, saveGuardianKey, log } = useDailyLog();
  const [chosenPath, setChosenPath] = useState<LegendaryPath>(log.legendaryPath || 'spartan');

  // Evaluamos el estado inicial de forma infalible:
  const [stage, setStage] = useState<SplashStage>(() => {
    const pactAccepted = SafeStorage.getItem('ataraxia_pact_accepted_v1') === 'true' || !!log.hasCompletedOnboarding;
    const pathChosen = SafeStorage.getItem('ataraxia_path_chosen_v1') === 'true' || !!log.legendaryPath;
    const keyConfigured = SafeStorage.getItem('ataraxia_guardian_key_v1') === 'true' || !!log.userEmail;

    // Si ya completó todo el rito (pacto, senda y llave de correo), solo mostrar el Rayo
    if (pactAccepted && pathChosen && keyConfigured) {
      return 'lightning';
    }
    if (pactAccepted && pathChosen && !keyConfigured) {
      return 'guardian_key';
    }
    if (pactAccepted && !pathChosen) {
      return 'path_selection';
    }
    if (typeof window !== 'undefined') {
      const isPactDone = SafeStorage.getItem('ataraxia_pact_accepted_v1') === 'true';
      if (!isPactDone) {
        return 'parchment';
      }
    }
    return 'lightning';
  });

  const [isDismissing, setIsDismissing] = useState<boolean>(false);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

    // Validación post-hidratación precisa en cliente:
    const pactAccepted = SafeStorage.getItem('ataraxia_pact_accepted_v1') === 'true' || !!log.hasCompletedOnboarding;
    const pathChosen = SafeStorage.getItem('ataraxia_path_chosen_v1') === 'true' || !!log.legendaryPath;
    const keyConfigured = SafeStorage.getItem('ataraxia_guardian_key_v1') === 'true' || !!log.userEmail;

    if (!pactAccepted) {
      setStage('parchment');
    } else if (!pathChosen) {
      setStage('path_selection');
    } else if (!keyConfigured) {
      setStage('guardian_key');
    } else {
      // Usuario ya consagrado con llave: asegurar que no aparezca el papiro
      setStage((prev) => (prev === 'parchment' || prev === 'path_selection' || prev === 'guardian_key' ? 'lightning' : prev));
    }
  }, [log.hasCompletedOnboarding, log.legendaryPath, log.userEmail]);

  const handleAcceptPact = () => {
    SafeStorage.setItem('ataraxia_pact_accepted_v1', 'true');
    setStage('lightning');
  };

  const handleEnterFromLightning = () => {
    const pathChosen = SafeStorage.getItem('ataraxia_path_chosen_v1') === 'true' || !!log.legendaryPath;
    const keyConfigured = SafeStorage.getItem('ataraxia_guardian_key_v1') === 'true' || !!log.userEmail;

    if (pathChosen && keyConfigured) {
      // Usuario recurrente: entra DIRECTAMENTE al Templo sin repetir flujo
      setIsDismissing(true);
      setTimeout(() => {
        setStage('none');
      }, 200);
    } else if (!pathChosen) {
      // Nuevo usuario: pasa a elegir su senda legendaria
      setStage('path_selection');
    } else {
      // Falta adjuntar la llave del correo
      setStage('guardian_key');
    }
  };

  const handleSelectPath = (path: LegendaryPath) => {
    setChosenPath(path);
    selectLegendaryPath(path);
    SafeStorage.setItem('ataraxia_path_chosen_v1', 'true');
    SafeStorage.setItem('ataraxia_pact_accepted_v1', 'true');
    // Pasa al paso solemne de adjuntar la llave de correo y biometría
    setStage('guardian_key');
  };

  const handleCompleteGuardianKey = (data: {
    email: string;
    userName: string;
    weightKg: number;
    heightCm: number;
    age: number;
  }) => {
    saveGuardianKey({
      email: data.email,
      userName: data.userName,
      weightKg: data.weightKg,
      heightCm: data.heightCm,
      age: data.age,
      path: chosenPath,
    });

    SafeStorage.setItem('ataraxia_guardian_key_v1', 'true');
    SafeStorage.setItem('ataraxia_path_chosen_v1', 'true');
    SafeStorage.setItem('ataraxia_pact_accepted_v1', 'true');
    SafeStorage.setItem('ataraxia_user_email_v1', data.email);

    setIsDismissing(true);
    setTimeout(() => {
      setStage('none');
    }, 250);
  };

  return (
    <View style={styles.rootContainer}>
      {children}

      {/* 1. ETAPA PAPIRO GRIEGO DEL JURAMENTO (SOLO PRIMER INICIO) */}
      {stage === 'parchment' && (
        <GreekParchmentPact onAcceptPact={handleAcceptPact} />
      )}

      {/* 2. ETAPA BIENVENIDA CON EL RAYO GLORIOSO DE ZEUS */}
      {stage === 'lightning' && (
        <View
          style={[
            styles.splashOverlay,
            isDismissing && styles.splashOverlayFadeOut,
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.96}
            onPress={handleEnterFromLightning}
            style={styles.touchContainer}
          >
            {/* AMBIENTE AURORA CELESTIAL */}
            <View style={StyleSheet.absoluteFill}>
              <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                <Defs>
                  <RadialGradient id="cosmicDawn" cx="50%" cy="34%" r="60%">
                    <Stop offset="0%" stopColor="#FFE259" stopOpacity="0.25" />
                    <Stop offset="35%" stopColor="#D4AF37" stopOpacity="0.12" />
                    <Stop offset="70%" stopColor="#F59E0B" stopOpacity="0.04" />
                    <Stop offset="100%" stopColor="#040406" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#cosmicDawn)" />
              </Svg>
            </View>

            {/* CONTENEDOR PRINCIPAL */}
            <View style={styles.mainContentBlock}>
              
              {/* EL GRAN RAYO Y MEDALLÓN DE ZEUS MAJESTUOSO */}
              <View style={styles.emblemWrapper}>
                {Platform.OS === 'web' ? (
                  <img
                    src="/zeus_emblem.png"
                    alt="El Gran Rayo de Zeus"
                    width={260}
                    height={260}
                    style={{
                      width: '260px',
                      height: '260px',
                      objectFit: 'contain',
                      display: 'block',
                      filter: 'drop-shadow(0 0 24px rgba(255, 226, 89, 0.45))',
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  />
                ) : (
                  <Image
                    source={require('../../assets/images/zeus_master_emblem_transparent.png')}
                    style={{ width: 260, height: 260 }}
                    resizeMode="contain"
                  />
                )}
              </View>

              {/* SECCIÓN DE TÍTULO, MENCIONES Y SABIDURÍA ESTOICA */}
              <View style={styles.titleSection}>
                {/* TÍTULO MONUMENTAL */}
                <View style={styles.titleWingsRow}>
                  <ThemedText style={styles.divineSparkleWing}>⚡</ThemedText>
                  <ThemedText style={styles.divineMainTitle}>ATARAXIA</ThemedText>
                  <ThemedText style={styles.divineSparkleWing}>⚡</ThemedText>
                </View>

                {/* INSIGNIA CELESTIAL */}
                <View style={styles.divineBadgeContainer}>
                  <ThemedText style={styles.divineBadgeText}>
                    TEMPLO DEL AUTODOMINIO
                  </ThemedText>
                </View>

                {/* TRÍADA DE VIRTUDES */}
                <View style={styles.triadRow}>
                  <View style={styles.triadChip}>
                    <ThemedText style={styles.triadChipText}>⚔️ FUERZA</ThemedText>
                  </View>
                  <ThemedText style={styles.triadDivider}>•</ThemedText>
                  <View style={styles.triadChip}>
                    <ThemedText style={styles.triadChipText}>🏛️ DISCIPLINA</ThemedText>
                  </View>
                  <ThemedText style={styles.triadDivider}>•</ThemedText>
                  <View style={styles.triadChip}>
                    <ThemedText style={styles.triadChipText}>⚡ SERENIDAD</ThemedText>
                  </View>
                </View>

                {/* LEMA ORACULAR DE MARCO AURELIO */}
                <View style={styles.quoteCardContainer}>
                  <ThemedText style={styles.stoicQuoteText}>
                    &ldquo;Visto desde arriba, todo pesa menos.&rdquo;
                  </ThemedText>
                  <ThemedText style={styles.stoicAuthorText}>
                    — Marco Aurelio (Emperador Estoico)
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* BOTÓN INFERIOR TÁCTIL */}
            <View style={styles.bottomActionsBlock}>
              <View style={styles.enterButtonPill}>
                <ThemedText style={styles.enterButtonSparkle}>⚡</ThemedText>
                <ThemedText style={styles.enterButtonText}>TOCA PARA CONTINUAR</ThemedText>
                <ThemedText style={styles.enterButtonSparkle}>⚡</ThemedText>
              </View>
              <ThemedText style={styles.touchHintText}>Toca en cualquier parte para ingresar al Templo</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. ETAPA SELECTOR DE LAS 4 SENDAS LEGENDARIAS (SOLO PRIMER INICIO) */}
      {stage === 'path_selection' && (
        <LegendaryPathSelector onSelectPath={handleSelectPath} />
      )}

      {/* 4. ETAPA LLAVE SAGRADA DEL GUARDIÁN: CORREO Y BIOMETRÍA */}
      {stage === 'guardian_key' && (
        <TempleGuardianKeyStep
          selectedPath={chosenPath}
          onCompleteKey={handleCompleteGuardianKey}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#040406',
  },
  splashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#040406',
    zIndex: 99999,
    opacity: 1,
  },
  splashOverlayFadeOut: {
    opacity: 0,
  },
  touchContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 20 : 40,
    paddingBottom: Platform.OS === 'web' ? 20 : 32,
  },
  mainContentBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flex: 1,
  },
  emblemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 6,
    width: 260,
    height: 260,
  },
  titleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    maxWidth: 480,
  },
  titleWingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  divineSparkleWing: {
    fontSize: 20,
    color: '#FFE259',
    textShadowColor: 'rgba(255, 226, 89, 0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  divineMainTitle: {
    fontSize: Platform.OS === 'web' ? 42 : 36,
    fontWeight: '900',
    color: '#FFFDE0',
    letterSpacing: Platform.OS === 'web' ? 8 : 6,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(255, 226, 89, 0.95)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 22,
    fontFamily: Platform.OS === 'ios' ? 'Cinzel' : 'serif',
  },
  divineBadgeContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.14)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 226, 89, 0.45)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 3,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  divineBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFE259',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  triadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 2,
  },
  triadChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  triadChipText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    color: '#FDE68A',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  triadDivider: {
    fontSize: 10,
    color: '#D4AF37',
  },
  quoteCardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
    gap: 2,
  },
  stoicQuoteText: {
    fontSize: 12.5,
    fontStyle: 'italic',
    fontFamily: 'serif',
    color: '#E2E8F0',
    textAlign: 'center',
    textShadowColor: 'rgba(212, 175, 55, 0.35)',
    textShadowRadius: 5,
    lineHeight: 17,
  },
  stoicAuthorText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    color: '#D4AF37',
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  bottomActionsBlock: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    gap: 5,
  },
  enterButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.20)',
    borderWidth: 1.4,
    borderColor: '#FFE259',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 10,
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.75,
    shadowRadius: 14,
  },
  enterButtonSparkle: {
    fontSize: 14,
    color: '#FFE259',
  },
  enterButtonText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFDE0',
    letterSpacing: 1.8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  touchHintText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    color: 'rgba(212, 175, 55, 0.65)',
    letterSpacing: 1.2,
  },
});
