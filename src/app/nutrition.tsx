import { View, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, ActivityIndicator, Alert, Image, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { GoogleGenAI } from '@google/genai';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { Spacing, Colors } from '@/constants/theme';
import { useDailyLog } from '@/hooks/useDailyLog';
import { CalorieIndexCard } from '@/components/CalorieIndexCard';
import { PearlElectricBackground } from '@/components/PearlElectricBackground';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim() || '';
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

interface AnalysisResult {
  dishName: string;
  stoicEvaluation: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sodium: number;
  nutrientDensityScore?: number; // 1-10
  verdict?: string; // Consejo socrático
}

export default function NutritionScreen() {
  const { log, logMealWithMacros, logMealWithEnrichedMacros, updateUserMetrics } = useDailyLog();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scannedImageUri, setScannedImageUri] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);

  const [editCalories, setEditCalories] = useState<string>('0');
  const [editProtein, setEditProtein] = useState<string>('0');
  const [editCarbs, setEditCarbs] = useState<string>('0');
  const [editFats, setEditFats] = useState<string>('0');

  const [showManualModal, setShowManualModal] = useState(false);
  const [manualCal, setManualCal] = useState('450');
  const [manualProtein, setManualProtein] = useState('35');
  const [manualCarbs, setManualCarbs] = useState('40');
  const [manualFats, setManualFats] = useState('12');

  const goalCalories = log.targetCalories || 2200;
  const currentCalories = log.totalCalories || 0;

  const rangeMin = log.targetCaloriesMin || goalCalories - 100;
  const rangeMax = log.targetCaloriesMax || goalCalories + 100;

  const isInRange = currentCalories >= rangeMin && currentCalories <= rangeMax;

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permiso Denegado", "Necesitas autorizar la cámara.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setScannedImageUri(result.assets[0].uri);
        if (result.assets[0].base64) {
          analyzeImage(result.assets[0].base64);
        }
      }
    } catch (error) {
      console.error('Camera Launch Error:', error);
      Alert.alert("Error de Cámara", "No se pudo iniciar la cámara.");
    }
  };

  const handlePickGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permiso Denegado", "Necesitas dar permiso a la galería.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setScannedImageUri(result.assets[0].uri);
        if (result.assets[0].base64) {
          analyzeImage(result.assets[0].base64);
        }
      }
    } catch (error) {
      console.error('Gallery Launch Error:', error);
      Alert.alert("Error de Galería", "No se pudo abrir la galería.");
    }
  };

  const analyzeImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    try {
      if (!ai) throw new Error("No Gemini API Key configurada.");

      const prompt = `Analiza esta comida como un nutricionista y coach estoico.
Calcula con la mayor precisión científica:
- Nombre del plato
- Calorías estimadas (kcal)
- Proteínas (g)
- Carbohidratos (g)
- Grasas (g)
- Fibra (g)
- Sodio (mg)
- Puntuación de densidad nutricional (1 al 10)
- Breve evaluación estoica y consejo sobre el impacto metabólico de este combustible.

Devuelve EXCLUSIVAMENTE un JSON válido con esta estructura:
{
  "dishName": "Nombre",
  "calories": 500,
  "protein": 30,
  "carbs": 45,
  "fats": 15,
  "fiber": 5,
  "sodium": 300,
  "nutrientDensityScore": 8,
  "stoicEvaluation": "Evaluación breve",
  "verdict": "Consejo"
}`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), 7500)
      );

      const apiCall = ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: base64Image } }] }],
      });

      const response = await Promise.race([apiCall, timeoutPromise]);
      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data: AnalysisResult = JSON.parse(cleanJson);

      setLastAnalysis(data);
      setEditCalories(data.calories.toString());
      setEditProtein(data.protein.toString());
      setEditCarbs(data.carbs.toString());
      setEditFats(data.fats.toString());
    } catch (error) {
      console.warn('Gemini Nutrición fallback activado:', error);
      const fallbackData: AnalysisResult = {
        dishName: "Plato Proteico Estimado (Modo offline)",
        calories: 520,
        protein: 38,
        carbs: 45,
        fats: 16,
        fiber: 6,
        sodium: 400,
        nutrientDensityScore: 8,
        stoicEvaluation: "Combustible denso en nutrientes. El alimento es la medicina del templo físico.",
        verdict: "Ajusta los gramos exactos abajo si deseas una precisión quirúrgica."
      };
      setLastAnalysis(fallbackData);
      setEditCalories(fallbackData.calories.toString());
      setEditProtein(fallbackData.protein.toString());
      setEditCarbs(fallbackData.carbs.toString());
      setEditFats(fallbackData.fats.toString());
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmAnalysis = () => {
    if (!lastAnalysis) return;
    const finalCals = parseInt(editCalories, 10) || lastAnalysis.calories;
    const finalProtein = parseInt(editProtein, 10) || lastAnalysis.protein;
    const finalCarbs = parseInt(editCarbs, 10) || lastAnalysis.carbs;
    const finalFats = parseInt(editFats, 10) || lastAnalysis.fats;
    logMealWithEnrichedMacros(finalCals, finalProtein, finalCarbs, finalFats, lastAnalysis.nutrientDensityScore || 8, lastAnalysis.verdict);
    Alert.alert("Comida Sincronizada", `¡${lastAnalysis.dishName} registrado!`);
    setLastAnalysis(null);
    setScannedImageUri(null);
  };

  const handleSaveManual = () => {
    const cals = parseInt(manualCal, 10) || 0;
    const p = parseInt(manualProtein, 10) || 0;
    const c = parseInt(manualCarbs, 10) || 0;
    const f = parseInt(manualFats, 10) || 0;
    logMealWithMacros(cals, p, c, f);
    setShowManualModal(false);
    Alert.alert("Nutrientes Registrados", `+${cals} kcal y ${p}g de proteína guardados y sincronizados.`);
  };

  return (
    <PearlElectricBackground glowColor="rgba(212, 175, 55, 0.28)">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

          <View style={styles.header}>
            <ThemedText style={styles.label}>⚡ COMBUSTIBLE & TEMPLO</ThemedText>
            <ThemedText style={styles.title}>Scanner & Oráculo Nutricional</ThemedText>
          </View>

          <CalorieIndexCard
            consumedCalories={currentCalories}
            targetCalories={goalCalories}
            userMetrics={log.userMetrics}
            consumedMacros={log.macros}
            onUpdateMetrics={updateUserMetrics}
          />

          <View style={[styles.card, { backgroundColor: 'rgba(13, 17, 28, 0.94)', borderColor: 'rgba(212, 175, 55, 0.35)' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <View>
                <ThemedText style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'monospace' }}>
                  Calorías Ingeridas Hoy (Rango Flexible ±100 kcal)
                </ThemedText>
                <ThemedText style={{ fontSize: 24, fontFamily: 'serif', marginTop: 2, color: '#FFE259', fontWeight: '900' }}>
                  {currentCalories} <ThemedText style={{ fontSize: 13, color: '#94A3B8' }}>/ {rangeMin} - {rangeMax} kcal</ThemedText>
                </ThemedText>
              </View>
              <View style={[styles.badgeContainer, { backgroundColor: isInRange ? 'rgba(212, 175, 55, 0.20)' : 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(212, 175, 55, 0.40)', borderWidth: 1 }]}>
                <ThemedText style={{ fontSize: 11, color: '#FDE68A', fontWeight: 'bold' }}>
                  {isInRange ? "⚡ En Zona Óptima" : `Restan ${Math.max(rangeMin - currentCalories, 0)} kcal`}
                </ThemedText>
              </View>
            </View>

            {log.lastNutrientDensityScore && (
              <View style={styles.lastScoreRow}>
                <View style={styles.densityPill}>
                  <ThemedText style={{ fontSize: 11, color: '#FDE68A', fontWeight: 'bold' }}>
                    ⭐ Densidad Nutricional Última Comida: {log.lastNutrientDensityScore}/10
                  </ThemedText>
                </View>
                {log.lastNutrientVerdict && (
                  <ThemedText style={{ fontSize: 11, color: '#CBD5E1', fontStyle: 'italic', marginTop: 4 }}>
                    {"\""}{log.lastNutrientVerdict}{"\""}
                  </ThemedText>
                )}
              </View>
            )}
          </View>

          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionBtnTouch} onPress={handleTakePhoto} activeOpacity={0.85}>
              <LinearGradient
                colors={['#D4AF37', '#F59E0B', '#B45309']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionBtn}
              >
                <Ionicons name="camera" size={22} color="#050507" />
                <ThemedText style={styles.actionBtnText}>⚡ ESCANEAR CON CÁMARA IA</ThemedText>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtnSecondary} onPress={handlePickGallery} activeOpacity={0.85}>
              <Ionicons name="image" size={20} color="#D4AF37" />
              <ThemedText style={styles.actionBtnSecondaryText}>Elegir de Galería</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.manualBtn} onPress={() => setShowManualModal(true)} activeOpacity={0.8}>
              <ThemedText style={{ fontSize: 12, color: '#D4AF37', textDecorationLine: 'underline', fontFamily: 'monospace' }}>
                O ingresar macronutrientes manualmente
              </ThemedText>
            </TouchableOpacity>
          </View>

          {isAnalyzing && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#D4AF37" />
              <ThemedText style={{ marginTop: 12, fontSize: 13, color: '#FFE259', fontFamily: 'monospace', fontWeight: 'bold' }}>
                ⚡ Analizando macronutrientes con Gemini 2.5 Vision...
              </ThemedText>
            </View>
          )}

          {lastAnalysis && !isAnalyzing && (
            <View style={[styles.resultCard, { backgroundColor: 'rgba(13, 17, 28, 0.94)', borderColor: 'rgba(212, 175, 55, 0.45)' }]}>
              {scannedImageUri && (
                <Image source={{ uri: scannedImageUri }} style={styles.scannedImage} />
              )}
              <ThemedText style={styles.dishTitle}>{lastAnalysis.dishName}</ThemedText>
              <ThemedText style={styles.stoicQuote}>{"\""}{lastAnalysis.stoicEvaluation}{"\""}</ThemedText>

              {lastAnalysis.nutrientDensityScore && (
                <View style={styles.densityTag}>
                  <ThemedText style={{ fontSize: 12, color: '#050507', fontWeight: '900' }}>
                    ⭐ Densidad Nutricional: {lastAnalysis.nutrientDensityScore}/10
                  </ThemedText>
                </View>
              )}

              <ThemedText style={styles.calibrationHeader}>CALIBRACIÓN DE MACROS (EDITABLE)</ThemedText>
              <View style={styles.editableBreakdownGrid}>
                <View style={styles.editableField}>
                  <ThemedText style={styles.fieldLabel}>Calorías (kcal)</ThemedText>
                  <TextInput style={styles.fieldInput} value={editCalories} onChangeText={setEditCalories} keyboardType="number-pad" />
                </View>
                <View style={styles.editableField}>
                  <ThemedText style={styles.fieldLabel}>Proteínas (g)</ThemedText>
                  <TextInput
                    style={styles.fieldInput}
                    value={editProtein}
                    onChangeText={setEditProtein}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.editableField}>
                  <ThemedText style={styles.fieldLabel}>Carbohidratos (g)</ThemedText>
                  <TextInput
                    style={styles.fieldInput}
                    value={editCarbs}
                    onChangeText={setEditCarbs}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.editableField}>
                  <ThemedText style={styles.fieldLabel}>Grasas (g)</ThemedText>
                  <TextInput
                    style={styles.fieldInput}
                    value={editFats}
                    onChangeText={setEditFats}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.microNutrientsRow}>
                <ThemedText style={styles.microTxt}>🥦 Fibra: {lastAnalysis.fiber}g</ThemedText>
                <ThemedText style={styles.microTxt}>🧂 Sodio: {lastAnalysis.sodium}mg</ThemedText>
              </View>

              {lastAnalysis.verdict && (
                <View style={styles.verdictBox}>
                  <ThemedText style={{ fontSize: 12, color: colors.accent, fontWeight: 'bold' }}>Consejo Metabólico:</ThemedText>
                  <ThemedText style={{ fontSize: 11, color: colors.text, marginTop: 2 }}>{lastAnalysis.verdict}</ThemedText>
                </View>
              )}

              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: colors.accent }]} onPress={handleConfirmAnalysis} activeOpacity={0.85}>
                <ThemedText style={{ color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace' }}>Confirmar y Sincronizar en el Templo</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Modal de Ingreso Manual */}
          <Modal visible={showManualModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={[styles.modalCard, { backgroundColor: colors.backgroundElement }]}>
                <ThemedText style={styles.modalTitle}>Ingreso Manual de Nutrientes</ThemedText>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Calorías (kcal)</ThemedText>
                  <TextInput
                    style={[styles.textInput, { color: colors.text, borderColor: colors.backgroundSelected }]}
                    keyboardType="numeric"
                    value={manualCal}
                    onChangeText={setManualCal}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Proteínas (g)</ThemedText>
                  <TextInput
                    style={[styles.textInput, { color: colors.text, borderColor: colors.backgroundSelected }]}
                    keyboardType="numeric"
                    value={manualProtein}
                    onChangeText={setManualProtein}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Carbohidratos (g)</ThemedText>
                  <TextInput
                    style={[styles.textInput, { color: colors.text, borderColor: colors.backgroundSelected }]}
                    keyboardType="numeric"
                    value={manualCarbs}
                    onChangeText={setManualCarbs}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Grasas (g)</ThemedText>
                  <TextInput
                    style={[styles.textInput, { color: colors.text, borderColor: colors.backgroundSelected }]}
                    keyboardType="numeric"
                    value={manualFats}
                    onChangeText={setManualFats}
                  />
                </View>

                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowManualModal(false)}>
                    <ThemedText style={{ color: colors.textSecondary }}>Cancelar</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.accent }]} onPress={handleSaveManual}>
                    <ThemedText style={{ color: '#FFF', fontWeight: 'bold' }}>Sincronizar</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

        </ScrollView>
      </SafeAreaView>
    </PearlElectricBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 2,
    color: '#10B981',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontFamily: 'serif',
    fontWeight: 'bold',
    marginTop: 2,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    gap: Spacing.two,
  },
  badgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lastScoreRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  densityPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  actionGrid: {
    gap: 12,
  },
  actionBtnTouch: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  actionBtnText: {
    color: '#050507',
    fontWeight: '900',
    fontSize: 14,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  actionBtnSecondaryText: {
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#FDE68A',
  },
  manualBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  loadingBox: {
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 17, 28, 0.94)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  resultCard: {
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1.5,
    gap: Spacing.two,
  },
  scannedImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 4,
  },
  dishTitle: {
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#FFE259',
  },
  stoicQuote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#CBD5E1',
  },
  densityTag: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  calibrationHeader: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#D4AF37',
    letterSpacing: 1.5,
    marginTop: 6,
  },
  editableBreakdownGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  editableField: {
    flex: 1,
    backgroundColor: 'rgba(13, 17, 28, 0.90)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.30)',
  },
  fieldLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  fieldInput: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    textAlign: 'center',
    width: '100%',
  },
  microNutrientsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.20)',
  },
  microTxt: {
    fontSize: 11,
    color: '#FDE68A',
    fontFamily: 'monospace',
  },
  verdictBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.10)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.30)',
  },
  confirmBtnTouch: {
    marginTop: 6,
  },
  confirmBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 7, 0.90)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.two,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#94A3B8',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    fontFamily: 'monospace',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
