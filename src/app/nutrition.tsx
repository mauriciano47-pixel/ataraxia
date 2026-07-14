import { View, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { GoogleGenAI } from '@google/genai';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';
import { useDailyLog } from '@/hooks/useDailyLog';

const GEMINI_API_KEY = "AQ.Ab8RN6IVqmi2Ws_xpnDTS-Hc4T7VaVnpQr0NsTRKW_LKfSz54Q";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export default function NutritionScreen() {
  const { log, addCalories, addMacros } = useDailyLog();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const macros = {
    protein: { current: log.macros?.protein || 0, goal: 160 },
    carbs: { current: log.macros?.carbs || 0, goal: 200 },
    fats: { current: log.macros?.fats || 0, goal: 60 }
  };
  const currentCalories = log.totalCalories || 0;
  const goalCalories = 2100;
  const calPercent = Math.min((currentCalories / goalCalories) * 100, 100);

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permiso denegado", "Necesitas dar permiso a la cámara.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0].base64) {
        analyzeImage(result.assets[0].base64);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo abrir la cámara.");
    }
  };

  const analyzeImage = async (base64String: string) => {
    setIsAnalyzing(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { inlineData: { data: base64String, mimeType: 'image/jpeg' } },
          "Estima los macros de esta comida. Responde SOLAMENTE con un objeto JSON (sin markdown) con estas claves exactas: protein, carbs, fats, calories. Usa números enteros.",
        ]
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanJson);

      addMacros(data.protein || 0, data.carbs || 0, data.fats || 0);
      addCalories(data.calories || 0);
      Alert.alert("Análisis Completado", `Calorías: ${data.calories}\nProteínas: ${data.protein}g\nCarbs: ${data.carbs}g\nGrasas: ${data.fats}g`);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo analizar la foto.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        <View style={styles.header}>
          <ThemedText style={styles.label}>COMBUSTIBLE</ThemedText>
          <ThemedText style={styles.title}>Nutrición</ThemedText>
        </View>

        {/* Calorías totales */}
        <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>Calorías ingeridas</ThemedText>
              <ThemedText style={{ fontSize: 24, fontFamily: 'serif' }}>{currentCalories} <ThemedText style={{ fontSize: 14, color: colors.textSecondary }}>/ {goalCalories}</ThemedText></ThemedText>
            </View>
            <ThemedText style={{ fontSize: 12, color: colors.accent }}>Restan {Math.max(goalCalories - currentCalories, 0)}</ThemedText>
          </View>
          <View style={[styles.progressContainer, { backgroundColor: colors.backgroundSelected }]}>
            <View style={[styles.progressBar, { width: `${calPercent}%`, backgroundColor: colors.accent }]} />
          </View>
        </View>

        {/* Macros */}
        <View style={styles.macrosContainer}>
          <View style={[styles.macroCard, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
            <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>Proteína</ThemedText>
            <ThemedText style={{ fontSize: 16, marginTop: 4 }}>{macros.protein.current}g</ThemedText>
            <View style={[styles.progressContainer, { backgroundColor: colors.backgroundSelected, height: 8 }]}>
              <View style={[styles.progressBar, { width: `${(macros.protein.current/macros.protein.goal)*100}%`, backgroundColor: '#FFFFFF' }]} />
            </View>
          </View>
          
          <View style={[styles.macroCard, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
            <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>Carbs</ThemedText>
            <ThemedText style={{ fontSize: 16, marginTop: 4 }}>{macros.carbs.current}g</ThemedText>
            <View style={[styles.progressContainer, { backgroundColor: colors.backgroundSelected, height: 8 }]}>
              <View style={[styles.progressBar, { width: `${(macros.carbs.current/macros.carbs.goal)*100}%`, backgroundColor: '#AAAAAA' }]} />
            </View>
          </View>
          
          <View style={[styles.macroCard, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
            <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>Grasas</ThemedText>
            <ThemedText style={{ fontSize: 16, marginTop: 4 }}>{macros.fats.current}g</ThemedText>
            <View style={[styles.progressContainer, { backgroundColor: colors.backgroundSelected, height: 8 }]}>
              <View style={[styles.progressBar, { width: `${(macros.fats.current/macros.fats.goal)*100}%`, backgroundColor: '#555555' }]} />
            </View>
          </View>
        </View>

        {/* Micronutrientes Clave */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Micronutrientes Clave</ThemedText>
          <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
            <ThemedText style={{ fontSize: 13, marginBottom: 8 }}>Fibra: <ThemedText style={{ color: colors.accent }}>18g / 30g</ThemedText></ThemedText>
            <ThemedText style={{ fontSize: 13, marginBottom: 8 }}>Azúcares Añadidos: <ThemedText style={{ color: colors.textSecondary }}>12g (Óptimo)</ThemedText></ThemedText>
            <ThemedText style={{ fontSize: 13 }}>Sodio: <ThemedText style={{ color: colors.textSecondary }}>1500mg</ThemedText></ThemedText>
          </View>
        </View>

        {/* Registro Rápido */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Registro (Claude Vision)</ThemedText>
          <View style={{ flexDirection: 'row', gap: Spacing.three }}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }, isAnalyzing && { opacity: 0.5 }]} 
              onPress={handleTakePhoto}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator color={colors.text} size="small" />
              ) : (
                <ThemedText style={styles.buttonText}>📷 Tomar Foto</ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.accent, borderColor: colors.accent }]} 
              onPress={() => {
                addCalories(400);
                addMacros(35, 40, 12);
              }}
            >
              <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>Escribir Texto</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
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
    marginTop: Spacing.three,
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
    fontSize: 14,
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
    borderWidth: 2,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'uppercase',
    fontFamily: 'monospace',
  }
});
