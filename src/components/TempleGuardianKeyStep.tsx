import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import Svg, { Rect, Defs, RadialGradient, Stop } from 'react-native-svg';
import { ThemedText } from './themed-text';
import { LegendaryPath, LEGENDARY_PATHS } from '@/types/onboarding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  selectedPath: LegendaryPath;
  onCompleteKey: (data: {
    email: string;
    userName: string;
    weightKg: number;
    heightCm: number;
    age: number;
  }) => void;
}

export function TempleGuardianKeyStep({ selectedPath, onCompleteKey }: Props) {
  const pathInfo = LEGENDARY_PATHS[selectedPath] || LEGENDARY_PATHS.spartan;

  const [email, setEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('Guerrero');
  const [weightKg, setWeightKg] = useState<string>('78');
  const [heightCm, setHeightCm] = useState<string>('176');
  const [age, setAge] = useState<string>('28');
  const [errorMessage, setErrorMessage] = useState<string>('');

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
        {/* GRECAS Y ADORNOS DE ESQUINAS */}
        <View style={styles.cornerTL}><ThemedText style={styles.greekCornerSymbol}>╔═</ThemedText></View>
        <View style={styles.cornerTR}><ThemedText style={styles.greekCornerSymbol}>═╗</ThemedText></View>
        <View style={styles.cornerBL}><ThemedText style={styles.greekCornerSymbol}>╚═</ThemedText></View>
        <View style={styles.cornerBR}><ThemedText style={styles.greekCornerSymbol}>═╝</ThemedText></View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* SELLO DE LA LLAVE & RAYO */}
          <View style={styles.sealContainer}>
            <View style={styles.sealRing}>
              <ThemedText style={styles.sealEmblem}>🗝️</ThemedText>
            </View>
            <ThemedText style={styles.subHeaderGreek}>— CONSAGRACIÓN DEL GUARDIÁN —</ThemedText>
            <ThemedText style={styles.parchmentTitle}>LA LLAVE SAGRADA DEL TEMPLO</ThemedText>
            <View style={styles.goldDividerLine} />
          </View>

          <ThemedText style={styles.instructionText}>
            Para cruzar el umbral y sellar tus victorias ante los Dioses, adjunta tu correo electrónico. <ThemedText style={{ color: '#FFE259', fontWeight: 'bold' }}>Será tu Llave Sagrada</ThemedText> para respaldar tu progreso y sincronizar tu destino.
          </ThemedText>

          {/* TARJETA RESUMEN DE LA SENDA SELECCIONADA */}
          <View style={styles.pathSummaryCard}>
            <ThemedText style={styles.pathSummaryIcon}>{pathInfo.icon}</ThemedText>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.pathSummaryTitle}>{pathInfo.name}</ThemedText>
              <ThemedText style={styles.pathSummaryMotto}>{pathInfo.motto}</ThemedText>
            </View>
          </View>

          {/* FORMULARIO DE INGRESO */}
          <View style={styles.formContainer}>
            {/* 1. CORREO ELECTRÓNICO (LLAVE SAGRADA) */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>
                📧 CORREO ELECTRÓNICO (LLAVE DE INGRESO) *
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

            {/* 2. NOMBRE O PSEUDÓNIMO */}
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

            {/* 3. FILA DE BIOMETRÍA */}
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

            {/* MENSAJE DE ERROR SI FALTA EL CORREO */}
            {!!errorMessage && (
              <View style={styles.errorBanner}>
                <ThemedText style={styles.errorText}>⚠️ {errorMessage}</ThemedText>
              </View>
            )}

            {/* BOTÓN DE CONSAGRACIÓN FINAL */}
            <View style={styles.actionWrapper}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={validateAndSubmit}
                activeOpacity={0.85}
              >
                <View style={styles.btnInner}>
                  <ThemedText style={{ fontSize: 16 }}>⚡</ThemedText>
                  <ThemedText style={styles.btnText}>
                    CONSAGRAR LLAVE Y ENTRAR AL TEMPLO
                  </ThemedText>
                  <ThemedText style={{ fontSize: 16 }}>⚡</ThemedText>
                </View>
              </TouchableOpacity>
              <ThemedText style={styles.footerHint}>
                Tu plan de 30 días se calibrará en milisegundos según tus datos
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#020204',
    zIndex: 100002,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
    paddingVertical: Platform.OS === 'web' ? 24 : 36,
  },
  mainCard: {
    width: '100%',
    maxWidth: 520,
    height: '100%',
    maxHeight: 760,
    backgroundColor: 'rgba(9, 12, 22, 0.98)',
    borderRadius: 20,
    borderWidth: 1.8,
    borderColor: 'rgba(212, 175, 55, 0.65)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  cornerTL: { position: 'absolute', top: 6, left: 8, zIndex: 10 },
  cornerTR: { position: 'absolute', top: 6, right: 8, zIndex: 10 },
  cornerBL: { position: 'absolute', bottom: 6, left: 8, zIndex: 10 },
  cornerBR: { position: 'absolute', bottom: 6, right: 8, zIndex: 10 },
  greekCornerSymbol: {
    fontSize: 16,
    color: '#FFE259',
    fontWeight: '900',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    alignItems: 'center',
  },
  sealContainer: {
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  sealRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(212, 175, 55, 0.20)',
    borderWidth: 2,
    borderColor: '#FFE259',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  sealEmblem: {
    fontSize: 24,
  },
  subHeaderGreek: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    color: '#D4AF37',
    letterSpacing: 2.2,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  parchmentTitle: {
    fontSize: Platform.OS === 'web' ? 21 : 18,
    fontWeight: '900',
    color: '#FFFDE0',
    letterSpacing: 2,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Cinzel' : 'serif',
    textShadowColor: 'rgba(212, 175, 55, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  goldDividerLine: {
    width: 140,
    height: 2,
    backgroundColor: '#D4AF37',
    marginTop: 8,
    borderRadius: 1,
  },
  instructionText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 6,
  },
  pathSummaryCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 226, 89, 0.40)',
    borderRadius: 12,
    padding: 10,
    gap: 10,
    marginBottom: 16,
  },
  pathSummaryIcon: {
    fontSize: 24,
  },
  pathSummaryTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFE259',
    fontFamily: 'serif',
  },
  pathSummaryMotto: {
    fontSize: 10.5,
    fontStyle: 'italic',
    color: '#E2E8F0',
    marginTop: 1,
  },
  formContainer: {
    width: '100%',
    gap: 12,
  },
  inputGroup: {
    width: '100%',
    gap: 5,
  },
  inputLabel: {
    fontSize: 9.5,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#D4AF37',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  inputField: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'web' ? 10 : 9,
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  inputHighlight: {
    borderColor: '#FFE259',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricColumn: {
    flex: 1,
    gap: 5,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.45)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 2,
  },
  errorText: {
    fontSize: 11,
    color: '#FCA5A5',
    fontWeight: '600',
    textAlign: 'center',
  },
  actionWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.75,
    shadowRadius: 14,
    elevation: 8,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#050507',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1.1,
    textAlign: 'center',
  },
  footerHint: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    color: 'rgba(212, 175, 55, 0.65)',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});
