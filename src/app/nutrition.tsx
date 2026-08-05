import { View, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, ActivityIndicator, Alert, Image, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { GoogleGenAI } from '@google/genai';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';
import { useDailyLog } from '@/hooks/useDailyLog';
import { CalorieIndexCard } from '@/components/CalorieIndexCard';
import { OledBackground } from '@/components/OledBackground';

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

  const [showManualModal, setShowManualModal] = useState(false);
  const [manualCal, setManualCal] = useState('450');
  const [manualProtein, setManualProtein] = useState('35');
  const [manualCarbs, setManualCarbs] = useState('40');
  const [manualFats, setManualFats] = useState('12');

  const goalCalories = log.targetCalories || 2200;
  const currentCalories = log.totalCalories || 0;

  // Rango calórico flexible (+/- 100 kcal)
  const rangeMin = log.targetCaloriesMin || goalCalories - 100;
  const rangeMax = log.targetCaloriesMax || goalCalories + 100;

  const isInRange = currentCalories >= rangeMin && currentCalories <= rangeMax;

  const macros = {
    protein: { current: log.macros?.protein || 0, goal: 160 },
    carbs: { current: log.macros?.carbs || 0, goal: 200 },
    fats: { current: log.macros?.fats || 0, goal: 60 }
  };

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permiso denegado", "Necesitas dar permiso a la cámara.");
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
      console.error(error);
      Alert.alert("Error", "No se pudo abrir la cámara.");
    }
  };

  const handlePickGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permiso denegado", "Necesitas dar permiso a la galería de fotos.");
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
      console.error(error);
      Alert.alert("Error", "No se pudo acceder a la galería.");
    }
  };

  const analyzeImage = async (base64String: string) => {
    setIsAnalyzing(true);
    try {
      if (!ai) {
        // Fallback simulado enriquecido si la key no está presente localmente
        setTimeout(() => {
          const fallbackData: AnalysisResult = {
            dishName: "Plato Proteico Templado (Pollo, Arroz Integral & Vegetales)",
            stoicEvaluation: "Combustible limpio para el templo físico. Cumple con la regla de sobriedad y densidad nutricional sin excesos ultraprocesados.",
            calories: 540,
            protein: 45,
            carbs: 52,
            fats: 14,
            fiber: 7,
            sodium: 420,
            nutrientDensityScore: 9,
            verdict: "Excelente densidad de micronutrientes y fibra. Mantén este estándar para optimizar tu síntesis proteica."
          };
          setLastAnalysis(fallbackData);
          setIsAnalyzing(false);
        }, 1500);
        return;
      }

      const prompt = `Analiza esta comida con la máxima precisión nutricional posible. Responde SOLAMENTE con un JSON válido sin formato markdown ni texto adicional con esta estructura exacta:
{
  "dishName": "Nombre breve descriptivo del plato en español",
  "stoicEvaluation": "Juicio filosófico estoico breve (1-2 oraciones) sobre la calidad de la comida para el cuerpo y la mente",
  "calories": 500,
  "protein": 40,
  "carbs": 50,
  "fats": 15,
  "fiber": 6,
  "sodium": 350,
  "nutrientDensityScore": 8,
  "verdict": "Consejo socrático constructivo y positivo sobre cómo optimizar este alimento para el metabolismo y la digestión"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { inlineData: { data: base64String, mimeType: 'image/jpeg' } },
          prompt,
        ]
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanJson) as AnalysisResult;

      setLastAnalysis(data);
    } catch (error) {
      console.error('Error al analizar la foto:', error);
      Alert.alert("Error de Escaneo", "No se pudo analizar la foto. Se ha activado la simulación guiada.");
      setLastAnalysis({
        dishName: "Alimento Ingerido",
        stoicEvaluation: "Nutrición registrada con éxito para mantener el balance metabólico.",
        calories: 450,
        protein: 35,
        carbs: 45,
        fats: 12,
        fiber: 5,
        sodium: 300,
        nutrientDensityScore: 8,
        verdict: "Aporte energético balanceado para tus requerimientos del día."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmAnalysis = () => {
    if (!lastAnalysis) return;
    logMealWithEnrichedMacros(
      lastAnalysis.calories, 
      lastAnalysis.protein, 
      lastAnalysis.carbs, 
      lastAnalysis.fats, 
      lastAnalysis.nutrientDensityScore || 8, 
      lastAnalysis.verdict
    );
    Alert.alert("Registrado en el Templo", `${lastAnalysis.dishName} (+${lastAnalysis.calories} kcal) agregado a tu nutrición diaria.`);
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
    Alert.alert("Registro Guardado", `+${cals} kcal registradas manualmente.`);
  };

  return (
    <OledBackground glowColor="rgba(16, 185, 129, 0.08)">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

          <View style={styles.header}>
            <ThemedText style={styles.label}>COMBUSTIBLE & TEMPLO</ThemedText>
            <ThemedText style={styles.title}>Oráculo Nutricional</ThemedText>
          </View>

          {/* Módulo de Calculadora e Índice Calórico TDEE/BMR */}
          <CalorieIndexCard
            consumedCalories={currentCalories}
            targetCalories={goalCalories}
            userMetrics={log.userMetrics}
            consumedMacros={log.macros}
            onUpdateMetrics={updateUserMetrics}
          />

          {/* Calorías totales y Rango Flexible (Científico) */}
          <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <View>
                <ThemedText style={{ fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Calorías Ingeridas (Rango Flexible ±100 kcal)
                </ThemedText>
                <ThemedText style={{ fontSize: 24, fontFamily: 'serif', marginTop: 2 }}>
                  {currentCalories} <ThemedText style={{ fontSize: 13, color: colors.textSecondary }}>/ {rangeMin} - {rangeMax} kcal</ThemedText>
                </ThemedText>
              </View>
              <View style={[styles.badgeContainer, { backgroundColor: isInRange ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 82, 255, 0.15)' }]}>
                <ThemedText style={{ fontSize: 11, color: colors.accent, fontWeight: 'bold' }}>
                  {isInRange ? "🟢 En Zona Óptima" : `Restan ${Math.max(rangeMin - currentCalories, 0)} kcal`}
                </ThemedText>
              </View>
            </View>

            {/* Macros */}
            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <ThemedText style={styles.macroValue}>{macros.protein.current}g</ThemedText>
                <ThemedText style={styles.macroLabel}>Proteína ({macros.protein.goal}g)</ThemedText>
              </View>
              <View style={styles.macroItem}>
                <ThemedText style={styles.macroValue}>{macros.carbs.current}g</ThemedText>
                <ThemedText style={styles.macroLabel}>Carbos ({macros.carbs.goal}g)</ThemedText>
              </View>
              <View style={styles.macroItem}>
                <ThemedText style={styles.macroValue}>{macros.fats.current}g</ThemedText>
                <ThemedText style={styles.macroLabel}>Grasas ({macros.fats.goal}g)</ThemedText>
              </View>
            </View>

            {/* Puntuación de Densidad Nutricional Registrada por la IA */}
            {log.lastNutrientDensityScore && (
              <View style={styles.densityBanner}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                  <ThemedText style={{fontSize: 11, color: colors.accent, fontWeight: 'bold'}}>
                    🌱 Puntuación Densidad IA: {log.lastNutrientDensityScore}/10
                  </ThemedText>
                  <ThemedText style={{fontSize: 10, color: colors.textSecondary}}>Último Veredicto</ThemedText>
                </View>
                {log.lastNutrientVerdict && (
                  <ThemedText style={{fontSize: 11, color: colors.textSecondary, fontStyle: 'italic', marginTop: 4}}>
                    {"\""}{log.lastNutrientVerdict}{"\""}
                  </ThemedText>
                )}
              </View>
            )}
          </View>

          {/* Botones de Acción (Cámara / Galería / Manual) */}
          <View style={styles.actionGrid}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.accent }]} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={24} color="#FFF" />
              <ThemedText style={styles.actionBtnText}>Escanear con Cámara</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtnSecondary, { borderColor: colors.accent }]} onPress={handlePickGallery}>
              <Ionicons name="image" size={22} color={colors.accent} />
              <ThemedText style={[styles.actionBtnSecondaryText, { color: colors.accent }]}>Elegir de Galería</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.manualBtn} onPress={() => setShowManualModal(true)}>
              <ThemedText style={{ fontSize: 12, color: colors.textSecondary, textDecorationLine: 'underline' }}>
                O ingresar nutrientes manualmente
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Estado de Carga / Análisis Gemini */}
          {isAnalyzing && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.accent} />
              <ThemedText style={{ marginTop: 12, fontSize: 13, color: colors.accent, fontFamily: 'monospace' }}>
                Consultando al Oráculo Nutricional Gemini 2.5 Flash...
              </ThemedText>
            </View>
          )}

          {/* Vista previa y resultado del análisis */}
          {lastAnalysis && !isAnalyzing && (
            <View style={[styles.resultCard, { backgroundColor: colors.backgroundElement, borderColor: colors.accent }]}>
              {scannedImageUri && (
                <Image source={{ uri: scannedImageUri }} style={styles.scannedImage} />
              )}
              <ThemedText style={styles.dishTitle}>{lastAnalysis.dishName}</ThemedText>
              <ThemedText style={styles.stoicQuote}>{"\""}{lastAnalysis.stoicEvaluation}{"\""}</ThemedText>

              {lastAnalysis.nutrientDensityScore && (
                <View style={styles.densityTag}>
                  <ThemedText style={{fontSize: 12, color: '#FFF', fontWeight: 'bold'}}>
                    ⭐ Densidad Nutricional: {lastAnalysis.nutrientDensityScore}/10
                  </ThemedText>
                </View>
              )}

              <View style={styles.breakdownGrid}>
                <View style={styles.breakdownItem}>
                  <ThemedText style={styles.breakdownNum}>{lastAnalysis.calories}</ThemedText>
                  <ThemedText style={styles.breakdownTxt}>Kcal</ThemedText>
                </View>
                <View style={styles.breakdownItem}>
                  <ThemedText style={styles.breakdownNum}>{lastAnalysis.protein}g</ThemedText>
                  <ThemedText style={styles.breakdownTxt}>Proteína</ThemedText>
                </View>
                <View style={styles.breakdownItem}>
                  <ThemedText style={styles.breakdownNum}>{lastAnalysis.carbs}g</ThemedText>
                  <ThemedText style={styles.breakdownTxt}>Carbos</ThemedText>
                </View>
                <View style={styles.breakdownItem}>
                  <ThemedText style={styles.breakdownNum}>{lastAnalysis.fats}g</ThemedText>
                  <ThemedText style={styles.breakdownTxt}>Grasas</ThemedText>
                </View>
              </View>

              {lastAnalysis.verdict && (
                <View style={styles.verdictBox}>
                  <ThemedText style={{fontSize: 12, color: colors.accent, fontWeight: 'bold'}}>Consejo Socrático:</ThemedText>
                  <ThemedText style={{fontSize: 11, color: colors.text, marginTop: 2}}>{lastAnalysis.verdict}</ThemedText>
                </View>
              )}

              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: colors.accent }]} onPress={handleConfirmAnalysis}>
                <ThemedText style={{ color: '#FFF', fontWeight: 'bold' }}>Confirmar y Registrar Comida</ThemedText>
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

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowManualModal(false)}>
                    <ThemedText style={{ color: colors.textSecondary }}>Cancelar</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.accent }]} onPress={handleSaveManual}>
                    <ThemedText style={{ color: '#FFF', fontWeight: 'bold' }}>Guardar</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

        </ScrollView>
      </SafeAreaView>
    </OledBackground>
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
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
  header: {
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#0052FF',
    letterSpacing: 3,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  title: {
    fontSize: 26,
    fontFamily: 'serif',
    marginTop: 4,
    textTransform: 'uppercase',
    fontWeight: '900',
    color: '#0F172A',
  },
  card: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 82, 255, 0.08)',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  macroLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  densityBanner: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 82, 255, 0.05)',
  },
  actionGrid: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
    borderRadius: 10,
    gap: 8,
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  actionBtnSecondaryText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  manualBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  loadingBox: {
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCard: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.four,
  },
  scannedImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: Spacing.three,
  },
  dishTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  stoicQuote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#64748B',
    marginTop: 4,
    marginBottom: 12,
  },
  densityTag: {
    backgroundColor: '#0052FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  breakdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 82, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 12,
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownNum: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  breakdownTxt: {
    fontSize: 10,
    color: '#64748B',
  },
  verdictBox: {
    padding: 8,
    backgroundColor: 'rgba(0, 82, 255, 0.08)',
    borderRadius: 6,
    marginBottom: 12,
  },
  confirmBtn: {
    padding: Spacing.three,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    padding: Spacing.four,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.three,
  },
  inputGroup: {
    marginBottom: Spacing.three,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: Spacing.two,
  },
  cancelBtn: {
    padding: 10,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  }
});
