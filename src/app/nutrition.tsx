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
}

export default function NutritionScreen() {
  const { log, logMealWithMacros, updateUserMetrics } = useDailyLog();
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
  const calPercent = Math.min((currentCalories / goalCalories) * 100, 100);

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
        // Fallback simulated detailed analysis if Gemini key not set locally
        setTimeout(() => {
          const fallbackData: AnalysisResult = {
            dishName: "Plato Proteico Templado (Pollo, Arroz Integral & Vegetales)",
            stoicEvaluation: "Combustible limpio para el templo físico. Cumple con la regla de sobriedad y densidad nutricional sin excesos ultraprocesados.",
            calories: 540,
            protein: 45,
            carbs: 52,
            fats: 14,
            fiber: 7,
            sodium: 420
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
  "sodium": 350
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
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
        sodium: 300
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmAnalysis = () => {
    if (!lastAnalysis) return;
    logMealWithMacros(lastAnalysis.calories, lastAnalysis.protein, lastAnalysis.carbs, lastAnalysis.fats);
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

        {/* Calorías totales */}
        <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>Calorías ingeridas hoy</ThemedText>
              <ThemedText style={{ fontSize: 24, fontFamily: 'serif' }}>{currentCalories} <ThemedText style={{ fontSize: 14, color: colors.textSecondary }}>/ {goalCalories} kcal</ThemedText></ThemedText>
            </View>
            <ThemedText style={{ fontSize: 12, color: colors.accent, fontWeight: 'bold' }}>Restan {Math.max(goalCalories - currentCalories, 0)} kcal</ThemedText>
          </View>
          <View style={[styles.progressContainer, { backgroundColor: colors.backgroundSelected }]}>
            <View style={[styles.progressBar, { width: `${calPercent}%`, backgroundColor: colors.accent }]} />
          </View>
        </View>

        {/* Macros */}
        <View style={styles.macrosContainer}>
          <View style={[styles.macroCard, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
            <ThemedText style={{ fontSize: 11, color: colors.textSecondary, fontFamily: 'monospace' }}>PROTEÍNA</ThemedText>
            <ThemedText style={{ fontSize: 18, marginTop: 4, fontWeight: 'bold' }}>{macros.protein.current}g</ThemedText>
            <ThemedText style={{ fontSize: 10, color: '#888' }}>Meta: {macros.protein.goal}g</ThemedText>
            <View style={[styles.progressContainer, { backgroundColor: colors.backgroundSelected, height: 6 }]}>
              <View style={[styles.progressBar, { width: `${Math.min((macros.protein.current/macros.protein.goal)*100, 100)}%`, backgroundColor: '#FFFFFF' }]} />
            </View>
          </View>
          
          <View style={[styles.macroCard, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
            <ThemedText style={{ fontSize: 11, color: colors.textSecondary, fontFamily: 'monospace' }}>CARBS</ThemedText>
            <ThemedText style={{ fontSize: 18, marginTop: 4, fontWeight: 'bold' }}>{macros.carbs.current}g</ThemedText>
            <ThemedText style={{ fontSize: 10, color: '#888' }}>Meta: {macros.carbs.goal}g</ThemedText>
            <View style={[styles.progressContainer, { backgroundColor: colors.backgroundSelected, height: 6 }]}>
              <View style={[styles.progressBar, { width: `${Math.min((macros.carbs.current/macros.carbs.goal)*100, 100)}%`, backgroundColor: '#AAAAAA' }]} />
            </View>
          </View>
          
          <View style={[styles.macroCard, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
            <ThemedText style={{ fontSize: 11, color: colors.textSecondary, fontFamily: 'monospace' }}>GRASAS</ThemedText>
            <ThemedText style={{ fontSize: 18, marginTop: 4, fontWeight: 'bold' }}>{macros.fats.current}g</ThemedText>
            <ThemedText style={{ fontSize: 10, color: '#888' }}>Meta: {macros.fats.goal}g</ThemedText>
            <View style={[styles.progressContainer, { backgroundColor: colors.backgroundSelected, height: 6 }]}>
              <View style={[styles.progressBar, { width: `${Math.min((macros.fats.current/macros.fats.goal)*100, 100)}%`, backgroundColor: '#555555' }]} />
            </View>
          </View>
        </View>

        {/* Sección de Registro por Foto / Oráculo */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>ESCANEAR ALIMENTO (GEMINI VISION HD)</ThemedText>
          
          <View style={{ flexDirection: 'row', gap: Spacing.three }}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }, isAnalyzing && { opacity: 0.5 }]} 
              onPress={handleTakePhoto}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator color={colors.text} size="small" />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={20} color={colors.text} />
                  <ThemedText style={styles.buttonText}>Cámara</ThemedText>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }, isAnalyzing && { opacity: 0.5 }]} 
              onPress={handlePickGallery}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator color={colors.text} size="small" />
              ) : (
                <>
                  <Ionicons name="images-outline" size={20} color={colors.text} />
                  <ThemedText style={styles.buttonText}>Galería</ThemedText>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.accent, borderColor: colors.accent }]} 
              onPress={() => setShowManualModal(true)}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
              <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>Manual</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* TARJETA DE ANÁLISIS DETALLADO DE COMIDA ESCANEADA */}
        {isAnalyzing && (
          <View style={[styles.analysisCard, { borderColor: colors.accent }]}>
            <ActivityIndicator size="large" color={colors.accent} />
            <ThemedText style={{ marginTop: Spacing.three, fontFamily: 'monospace', textAlign: 'center' }}>
              El Oráculo está juzgando la densidad nutricional y desglosando los macros de tu plato...
            </ThemedText>
          </View>
        )}

        {lastAnalysis && !isAnalyzing && (
          <View style={[styles.analysisCard, { borderColor: colors.accent, backgroundColor: colors.backgroundElement }]}>
            <View style={styles.analysisHeader}>
              <Ionicons name="checkmark-circle-outline" size={22} color={colors.accent} />
              <ThemedText style={styles.analysisTitle}>ANÁLISIS DEL ORÁCULO COMPLETADO</ThemedText>
            </View>

            {scannedImageUri && (
              <Image source={{ uri: scannedImageUri }} style={styles.scannedPreviewImage} resizeMode="cover" />
            )}

            <ThemedText style={styles.dishNameText}>{lastAnalysis.dishName}</ThemedText>
            <ThemedText style={styles.evaluationText}>&ldquo;{lastAnalysis.stoicEvaluation}&rdquo;</ThemedText>

            {/* Desglose de Macronutrientes y Micronutrientes */}
            <View style={styles.detailGrid}>
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>CALORÍAS</ThemedText>
                <ThemedText style={[styles.detailVal, { color: colors.accent }]}>{lastAnalysis.calories} kcal</ThemedText>
              </View>
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>PROTEÍNA</ThemedText>
                <ThemedText style={styles.detailVal}>{lastAnalysis.protein} g</ThemedText>
              </View>
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>CARBOHIDRATOS</ThemedText>
                <ThemedText style={styles.detailVal}>{lastAnalysis.carbs} g</ThemedText>
              </View>
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>GRASAS</ThemedText>
                <ThemedText style={styles.detailVal}>{lastAnalysis.fats} g</ThemedText>
              </View>
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>FIBRA ESTIMADA</ThemedText>
                <ThemedText style={styles.detailVal}>{lastAnalysis.fiber} g</ThemedText>
              </View>
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>SODIO ESTIMADO</ThemedText>
                <ThemedText style={styles.detailVal}>{lastAnalysis.sodium} mg</ThemedText>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.four }}>
              <TouchableOpacity 
                style={[styles.confirmBtn, { backgroundColor: colors.accent }]}
                onPress={handleConfirmAnalysis}
              >
                <ThemedText style={styles.confirmBtnText}>CONFIRMAR Y AGREGAR AL TEMPLO</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.discardBtn, { borderColor: colors.backgroundSelected }]}
                onPress={() => {
                  setLastAnalysis(null);
                  setScannedImageUri(null);
                }}
              >
                <ThemedText style={{ color: colors.textSecondary, fontFamily: 'monospace' }}>Descartar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Modal de Registro Manual */}
      <Modal visible={showManualModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.backgroundSelected }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>REGISTRAR COMIDA MANUAL</ThemedText>
              <TouchableOpacity onPress={() => setShowManualModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ThemedText style={styles.inputLabel}>Calorías Totales (kcal)</ThemedText>
            <TextInput 
              style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
              value={manualCal}
              onChangeText={setManualCal}
              keyboardType="numeric"
            />

            <View style={{ flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three }}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.inputLabel}>Proteína (g)</ThemedText>
                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
                  value={manualProtein}
                  onChangeText={setManualProtein}
                  keyboardType="numeric"
                />
              </View>

              <View style={{ flex: 1 }}>
                <ThemedText style={styles.inputLabel}>Carbs (g)</ThemedText>
                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
                  value={manualCarbs}
                  onChangeText={setManualCarbs}
                  keyboardType="numeric"
                />
              </View>

              <View style={{ flex: 1 }}>
                <ThemedText style={styles.inputLabel}>Grasas (g)</ThemedText>
                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
                  value={manualFats}
                  onChangeText={setManualFats}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.confirmBtn, { backgroundColor: colors.accent, marginTop: Spacing.four }]}
              onPress={handleSaveManual}
            >
              <ThemedText style={styles.confirmBtnText}>GUARDAR REGISTRO</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
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
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#D32F2F',
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
  },
  card: {
    padding: Spacing.four,
    borderRadius: 0,
    borderWidth: 2,
    marginBottom: Spacing.three,
  },
  progressContainer: {
    height: 12,
    borderRadius: 0,
    marginTop: Spacing.three,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333333',
  },
  progressBar: {
    height: '100%',
    borderRadius: 0,
  },
  macrosContainer: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  macroCard: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: 0,
    borderWidth: 2,
  },
  section: {
    marginTop: Spacing.four,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: Spacing.three,
    textTransform: 'uppercase',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    flexDirection: 'row',
    gap: 6,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
    fontFamily: 'monospace',
  },
  analysisCard: {
    marginTop: Spacing.four,
    padding: Spacing.four,
    borderWidth: 2,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.three,
  },
  analysisTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  scannedPreviewImage: {
    width: '100%',
    height: 180,
    marginVertical: Spacing.two,
    borderWidth: 1,
    borderColor: '#444',
  },
  dishNameText: {
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: 'bold',
    marginVertical: 4,
  },
  evaluationText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#888',
    lineHeight: 20,
    marginBottom: Spacing.three,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
  },
  detailItem: {
    width: '48%',
    padding: Spacing.two,
  },
  detailLabel: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#888',
  },
  detailVal: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  discardBtn: {
    flex: 1,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: Spacing.four,
    borderWidth: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  inputLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 4,
    color: '#888',
  },
  input: {
    borderWidth: 1,
    padding: Spacing.two,
    fontFamily: 'monospace',
    fontSize: 14,
  }
});
