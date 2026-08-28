import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import Svg, { Rect, Defs, RadialGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { ThemedText } from './themed-text';
import {
  LegendaryPath,
  LEGENDARY_PATHS,
  EquipmentType,
  SessionDurationMinutes,
  ExperienceLevel,
  InjuryCare,
} from '@/types/onboarding';

interface Props {
  selectedPath: LegendaryPath;
  onCompleteKey: (data: {
    email: string;
    userName: string;
    weightKg: number;
    heightCm: number;
    age: number;
    equipment: EquipmentType;
    sessionDurationMinutes: SessionDurationMinutes;
    experienceLevel: ExperienceLevel;
    injuryCare: InjuryCare;
  }) => void;
}

export function TempleGuardianKeyStep({ selectedPath, onCompleteKey }: Props) {
  const pathInfo = LEGENDARY_PATHS[selectedPath] || LEGENDARY_PATHS.spartan;

  const [email, setEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('Guerrero');
  const [weightKg, setWeightKg] = useState<string>('78');
  const [heightCm, setHeightCm] = useState<string>('176');
  const [age, setAge] = useState<string>('28');

  // Calibración táctica de entrenamiento
  const [equipment, setEquipment] = useState<EquipmentType>(pathInfo.equipment || 'gym');
  const [duration, setDuration] = useState<SessionDurationMinutes>(45);
  const [experience, setExperience] = useState<ExperienceLevel>('intermediate');
  const [injury, setInjury] = useState<InjuryCare>('none');

  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSelectOption = (callback: () => void) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    callback();
  };

  const validateAndSubmit = () => {
    setErrorMessage('');
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      setErrorMessage('Debes adjuntar tu correo electrónico como llave sagrada de ingreso.');
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Ingresa un formato de correo electrónico válido (ej. tu@correo.com).');
      return;
    }

    const weightNum = parseFloat(weightKg) || 75;
    const heightNum = parseFloat(heightCm) || 175;
    const ageNum = parseInt(age, 10) || 28;
    const finalName = userName.trim() || 'Guerrero Prokopton';

    onCompleteKey({
      email: trimmedEmail,
      userName: finalName,
      weightKg: weightNum,
      heightCm: heightNum,
      age: ageNum,
      equipment,
      sessionDurationMinutes: duration,
      experienceLevel: experience,
      injuryCare: injury,
    });
  };

  return (
    <View style={styles.container}>
      {/* FONDO AURORA DORADA */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="keyGlow" cx="50%" cy="30%" r="65%">
              <Stop offset="0%" stopColor="#FFE259" stopOpacity="0.22" />
              <Stop offset="40%" stopColor="#D4AF37" stopOpacity="0.10" />
              <Stop offset="85%" stopColor="#040406" stopOpacity="0.95" />
              <Stop offset="100%" stopColor="#020204" stopOpacity="1" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#keyGlow)" />
        </Svg>
      </View>

      {/* TARJETA PAPIRO DE CONSAGRACIÓN */}
      <View style={styles.mainCard}>
        {/* GRECAS DE ESQUINA */}
        <View style={styles.cornerTL}><ThemedText style={styles.greekCornerSymbol}>╔═</ThemedText></View>
        <View style={styles.cornerTR}><ThemedText style={styles.greekCornerSymbol}>═╗</ThemedText></View>
        <View style={styles.cornerBL}><ThemedText style={styles.greekCornerSymbol}>╚═</ThemedText></View>
        <View style={styles.cornerBR}><ThemedText style={styles.greekCornerSymbol}>═╝</ThemedText></View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* SELLO DE LA LLAVE */}
          <View style={styles.sealContainer}>
            <View style={styles.sealRing}>
              <ThemedText style={styles.sealEmblem}>🗝️</ThemedText>
            </View>
            <ThemedText style={styles.subHeaderGreek}>— CONSAGRACIÓN DEL GUARDIÁN —</ThemedText>
            <ThemedText style={styles.parchmentTitle}>LA LLAVE SAGRADA DEL TEMPLO</ThemedText>
            <View style={styles.goldDividerLine} />
          </View>

          <ThemedText style={styles.instructionText}>
            Adjunta tu correo y calibra tu entorno. Tu <ThemedText style={{ color: '#FFE259', fontWeight: 'bold' }}>Programa de 30 Días</ThemedText> se forjará con exactitud según tu equipamiento y disponibilidad.
          </ThemedText>

          {/* RESUMEN DE LA SENDA */}
          <View style={styles.pathSummaryCard}>
            <ThemedText style={styles.pathSummaryIcon}>{pathInfo.icon}</ThemedText>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.pathSummaryTitle}>{pathInfo.name}</ThemedText>
              <ThemedText style={styles.pathSummaryMotto}>{pathInfo.motto}</ThemedText>
            </View>
          </View>

          {/* FORMULARIO DE INGRESO */}
          <View style={styles.formContainer}>
            {/* 1. CORREO ELECTRÓNICO */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>
                📧 CORREO ELECTRÓNICO (LLAVE SAGRADA) *
              </ThemedText>
              <TextInput
                style={[styles.inputField, styles.inputHighlight]}
                value={email}
                onChangeText={(text) => { setEmail(text); setErrorMessage(''); }}
                placeholder="tu.correo@ejemplo.com"
                placeholderTextColor="rgba(212, 175, 55, 0.40)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* 2. NOMBRE */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>
                👤 NOMBRE O PSEUDÓNIMO ESTOICO
              </ThemedText>
              <TextInput
                style={styles.inputField}
                value={userName}
                onChangeText={setUserName}
                placeholder="ej. Alejandro, Héctor, Leonor..."
                placeholderTextColor="rgba(212, 175, 55, 0.40)"
                autoCapitalize="words"
              />
            </View>

            {/* 3. BIOMETRÍA */}
            <View style={styles.metricsRow}>
              <View style={styles.metricColumn}>
                <ThemedText style={styles.inputLabel}>⚖️ PESO (KG)</ThemedText>
                <TextInput
                  style={styles.inputField}
                  value={weightKg}
                  onChangeText={setWeightKg}
                  keyboardType="numeric"
                  placeholder="78"
                  placeholderTextColor="rgba(212, 175, 55, 0.40)"
                />
              </View>

              <View style={styles.metricColumn}>
                <ThemedText style={styles.inputLabel}>📏 ALTURA (CM)</ThemedText>
                <TextInput
                  style={styles.inputField}
                  value={heightCm}
                  onChangeText={setHeightCm}
                  keyboardType="numeric"
                  placeholder="176"
                  placeholderTextColor="rgba(212, 175, 55, 0.40)"
                />
              </View>

              <View style={styles.metricColumn}>
                <ThemedText style={styles.inputLabel}>🎂 EDAD</ThemedText>
                <TextInput
                  style={styles.inputField}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  placeholder="28"
                  placeholderTextColor="rgba(212, 175, 55, 0.40)"
                />
              </View>
            </View>

            {/* 4. PREGUNTA 1: EQUIPAMIENTO DISPONIBLE */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>
                🏟️ EQUIPAMIENTO PARA TU PROGRAMA DE 30 DÍAS
              </ThemedText>
              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={[styles.chipBtn, equipment === 'gym' && styles.chipBtnActive]}
                  onPress={() => handleSelectOption(() => setEquipment('gym'))}
                >
                  <ThemedText style={[styles.chipText, equipment === 'gym' && styles.chipTextActive]}>
                    🏋️ Gimnasio
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.chipBtn, equipment === 'home_dumbbell' && styles.chipBtnActive]}
                  onPress={() => handleSelectOption(() => setEquipment('home_dumbbell'))}
                >
                  <ThemedText style={[styles.chipText, equipment === 'home_dumbbell' && styles.chipTextActive]}>
                    🏠 Mancuernas
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.chipBtn, equipment === 'calisthenics' && styles.chipBtnActive]}
                  onPress={() => handleSelectOption(() => setEquipment('calisthenics'))}
                >
                  <ThemedText style={[styles.chipText, equipment === 'calisthenics' && styles.chipTextActive]}>
                    🤸‍♂️ Peso Corporal
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* 5. PREGUNTA 2: TIEMPO DISPONIBLE */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>
                ⏱️ DURACIÓN DE TU SESIÓN DIARIA
              </ThemedText>
              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={[styles.chipBtn, duration === 30 && styles.chipBtnActive]}
                  onPress={() => handleSelectOption(() => setDuration(30))}
                >
                  <ThemedText style={[styles.chipText, duration === 30 && styles.chipTextActive]}>
                    ⚡ 30 min (Express)
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.chipBtn, duration === 45 && styles.chipBtnActive]}
                  onPress={() => handleSelectOption(() => setDuration(45))}
                >
                  <ThemedText style={[styles.chipText, duration === 45 && styles.chipTextActive]}>
                    🏛️ 45 min (Óptimo)
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.chipBtn, duration === 60 && styles.chipBtnActive]}
                  onPress={() => handleSelectOption(() => setDuration(60))}
                >
                  <ThemedText style={[styles.chipText, duration === 60 && styles.chipTextActive]}>
                    ⚔️ 60 min (Intenso)
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* 6. PREGUNTA 3: EXPERIENCIA */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>
                🎯 NIVEL DE EXPERIENCIA FÍSICA
              </ThemedText>
              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={[styles.chipBtn, experience === 'beginner' && styles.chipBtnActive]}
                  onPress={() => handleSelectOption(() => setExperience('beginner'))}
                >
                  <ThemedText style={[styles.chipText, experience === 'beginner' && styles.chipTextActive]}>
                    🌿 Principiante
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.chipBtn, experience === 'intermediate' && styles.chipBtnActive]}
                  onPress={() => handleSelectOption(() => setExperience('intermediate'))}
                >
                  <ThemedText style={[styles.chipText, experience === 'intermediate' && styles.chipTextActive]}>
                    ⚔️ Intermedio
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.chipBtn, experience === 'advanced' && styles.chipBtnActive]}
                  onPress={() => handleSelectOption(() => setExperience('advanced'))}
                >
                  <ThemedText style={[styles.chipText, experience === 'advanced' && styles.chipTextActive]}>
                    👑 Avanzado
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* 7. PREGUNTA 4: ZONAS A CUIDAR */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>
                🛡️ ARTICULACIÓN O ZONA A PROTEGER
              </ThemedText>
              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={[styles.chipBtn, injury === 'none' && styles.chipBtnActive]}
                  onPress={() => handleSelectOption(() => setInjury('none'))}
                >
                  <ThemedText style={[styles.chipText, injury === 'none' && styles.chipTextActive]}>
                    ✅ 100% Sano
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.chipBtn, injury === 'back' && styles.chipBtnActive]}
                  onPress={() => handleSelectOption(() => setInjury('back'))}
                >
                  <ThemedText style={[styles.chipText, injury === 'back' && styles.chipTextActive]}>
                    ⚠️ Lumbar
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.chipBtn, injury === 'knees' && styles.chipBtnActive]}
                  onPress={() => handleSelectOption(() => setInjury('knees'))}
                >
                  <ThemedText style={[styles.chipText, injury === 'knees' && styles.chipTextActive]}>
                    ⚠️ Rodillas
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.chipBtn, injury === 'shoulders' && styles.chipBtnActive]}
                  onPress={() => handleSelectOption(() => setInjury('shoulders'))}
                >
                  <ThemedText style={[styles.chipText, injury === 'shoulders' && styles.chipTextActive]}>
                    ⚠️ Hombros
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* MENSAJE DE ERROR */}
            {!!errorMessage && (
              <View style={styles.errorBanner}>
                <ThemedText style={styles.errorText}>⚠️ {errorMessage}</ThemedText>
              </View>
            )}

            {/* BOTÓN CONSAGRAR */}
            <TouchableOpacity
              style={styles.submitButton}
              activeOpacity={0.85}
              onPress={validateAndSubmit}
            >
              <View style={styles.submitButtonInner}>
                <ThemedText style={styles.submitButtonText}>
                  ⚡ CONSAGRAR LLAVE Y ENTRAR AL TEMPLO 🏛️
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040406',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  mainCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '94%',
    backgroundColor: 'rgba(11, 15, 25, 0.96)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D4AF37',
    padding: 18,
    position: 'relative',
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  cornerTL: { position: 'absolute', top: 6, left: 8, zIndex: 10 },
  cornerTR: { position: 'absolute', top: 6, right: 8, zIndex: 10 },
  cornerBL: { position: 'absolute', bottom: 6, left: 8, zIndex: 10 },
  cornerBR: { position: 'absolute', bottom: 6, right: 8, zIndex: 10 },
  greekCornerSymbol: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sealContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  sealRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1.5,
    borderColor: '#FFE259',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  sealEmblem: {
    fontSize: 22,
  },
  subHeaderGreek: {
    color: '#D4AF37',
    fontSize: 9.5,
    letterSpacing: 2,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  parchmentTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'serif',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  goldDividerLine: {
    width: 60,
    height: 2,
    backgroundColor: '#D4AF37',
    marginTop: 6,
  },
  instructionText: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  pathSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  pathSummaryIcon: {
    fontSize: 24,
  },
  pathSummaryTitle: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#FFE259',
    fontFamily: 'serif',
  },
  pathSummaryMotto: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 2,
  },
  formContainer: {
    gap: 10,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    color: '#D4AF37',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  inputField: {
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.30)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  inputHighlight: {
    borderColor: '#FFE259',
    backgroundColor: 'rgba(255, 226, 89, 0.05)',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricColumn: {
    flex: 1,
    gap: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipBtn: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.20)',
    borderColor: '#FFE259',
  },
  chipText: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  chipTextActive: {
    color: '#FFE259',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#040406',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
});
