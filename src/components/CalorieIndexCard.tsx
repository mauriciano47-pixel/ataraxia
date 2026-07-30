import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { UserMetrics } from '@/hooks/useDailyLog';
import { calculateFitnessIndex } from '@/lib/fitnessCalculator';
import { CalculatorIcon, SettingsIcon } from '@/components/ModuleSvgIcons';

interface CalorieIndexCardProps {
  consumedCalories: number;
  targetCalories?: number;
  userMetrics?: UserMetrics;
  consumedMacros?: { protein: number; carbs: number; fats: number };
  onUpdateMetrics: (metrics: Partial<UserMetrics>, targetCals?: number) => void;
}

export function CalorieIndexCard({
  consumedCalories = 0,
  targetCalories = 2200,
  userMetrics = {
    weightKg: 75,
    heightCm: 175,
    age: 28,
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintenance',
  },
  consumedMacros = { protein: 0, carbs: 0, fats: 0 },
  onUpdateMetrics,
}: CalorieIndexCardProps) {
  const [modalVisible, setModalVisible] = useState(false);

  // Form states for calculator
  const [weight, setWeight] = useState(userMetrics.weightKg.toString());
  const [height, setHeight] = useState(userMetrics.heightCm.toString());
  const [age, setAge] = useState(userMetrics.age.toString());
  const [gender, setGender] = useState<UserMetrics['gender']>(userMetrics.gender || 'male');
  const [activity, setActivity] = useState<UserMetrics['activityLevel']>(userMetrics.activityLevel || 'moderate');
  const [goal, setGoal] = useState<UserMetrics['goal']>(userMetrics.goal || 'maintenance');

  const fitnessCalc = calculateFitnessIndex({
    weightKg: parseFloat(weight) || 75,
    heightCm: parseFloat(height) || 175,
    age: parseInt(age, 10) || 28,
    gender,
    activityLevel: activity,
    goal,
  });

  const effectiveTarget = targetCalories || fitnessCalc.targetCalories;
  const remainingCals = Math.max(0, effectiveTarget - consumedCalories);
  const consumedPct = Math.min(100, Math.round((consumedCalories / effectiveTarget) * 100));

  const handleSaveCalculator = () => {
    const updated: UserMetrics = {
      weightKg: parseFloat(weight) || 75,
      heightCm: parseFloat(height) || 175,
      age: parseInt(age, 10) || 28,
      gender,
      activityLevel: activity,
      goal,
    };
    const newCalc = calculateFitnessIndex(updated);
    onUpdateMetrics(updated, newCalc.targetCalories);
    setModalVisible(false);
  };

  const getGoalLabel = (g: UserMetrics['goal']) => {
    if (g === 'deficit') return 'Pérdida de Grasa (Déficit)';
    if (g === 'surplus') return 'Ganancia Muscular (Superávit)';
    return 'Mantenimiento & Salud';
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconBadge}>
            <CalculatorIcon color="#FF6F00" size={20} />
          </View>
          <View>
            <ThemedText style={styles.titleText}>Índice Calórico & TDEE</ThemedText>
            <ThemedText style={styles.subtitleText}>{getGoalLabel(userMetrics.goal)}</ThemedText>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.calcButton} 
          onPress={() => setModalVisible(true)}
        >
          <SettingsIcon color="#FF6F00" size={14} />
          <ThemedText style={styles.calcButtonText}>Calcular TDEE</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Main Calorie Overview */}
      <View style={styles.caloriesOverviewRow}>
        <View>
          <ThemedText style={styles.consumedCalsNumber}>{consumedCalories.toLocaleString()}</ThemedText>
          <ThemedText style={styles.calsTargetSub}>de {effectiveTarget.toLocaleString()} kcal ({consumedPct}%)</ThemedText>
        </View>

        <View style={styles.remainingBadge}>
          <ThemedText style={styles.remainingValue}>{remainingCals.toLocaleString()} kcal</ThemedText>
          <ThemedText style={styles.remainingLabel}>Restantes</ThemedText>
        </View>
      </View>

      {/* Calorie Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${consumedPct}%` }]} />
      </View>

      {/* BMR / TDEE Quick Index badges */}
      <View style={styles.indexBadgesRow}>
        <View style={styles.indexItem}>
          <ThemedText style={styles.indexItemLabel}>BMR (Basal)</ThemedText>
          <ThemedText style={styles.indexItemVal}>{fitnessCalc.bmr} kcal</ThemedText>
        </View>
        <View style={styles.indexDivider} />
        <View style={styles.indexItem}>
          <ThemedText style={styles.indexItemLabel}>TDEE (Diario)</ThemedText>
          <ThemedText style={styles.indexItemVal}>{fitnessCalc.tdee} kcal</ThemedText>
        </View>
        <View style={styles.indexDivider} />
        <View style={styles.indexItem}>
          <ThemedText style={styles.indexItemLabel}>Meta Diario</ThemedText>
          <ThemedText style={[styles.indexItemVal, { color: '#FF6F00' }]}>{effectiveTarget} kcal</ThemedText>
        </View>
      </View>

      {/* Macro Split Guidance */}
      <View style={styles.macroSplitRow}>
        <View style={styles.macroItem}>
          <ThemedText style={styles.macroLabel}>Proteínas</ThemedText>
          <ThemedText style={styles.macroValue}>{consumedMacros.protein}g / {fitnessCalc.macros.protein}g</ThemedText>
        </View>
        <View style={styles.macroItem}>
          <ThemedText style={styles.macroLabel}>Carbohidratos</ThemedText>
          <ThemedText style={styles.macroValue}>{consumedMacros.carbs}g / {fitnessCalc.macros.carbs}g</ThemedText>
        </View>
        <View style={styles.macroItem}>
          <ThemedText style={styles.macroLabel}>Grasas</ThemedText>
          <ThemedText style={styles.macroValue}>{consumedMacros.fats}g / {fitnessCalc.macros.fats}g</ThemedText>
        </View>
      </View>

      {/* Calculator Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Calculadora de Índice Calórico</ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <ThemedText style={{ color: '#9CA3AF', fontSize: 18, fontWeight: 'bold' }}>✕</ThemedText>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <ThemedText style={styles.sectionLabel}>Parámetros Biométricos</ThemedText>

              <View style={styles.inputsGridRow}>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Peso (kg)</ThemedText>
                  <TextInput style={styles.textInput} value={weight} onChangeText={setWeight} keyboardType="numeric" />
                </View>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Altura (cm)</ThemedText>
                  <TextInput style={styles.textInput} value={height} onChangeText={setHeight} keyboardType="numeric" />
                </View>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Edad</ThemedText>
                  <TextInput style={styles.textInput} value={age} onChangeText={setAge} keyboardType="numeric" />
                </View>
              </View>

              <ThemedText style={styles.sectionLabel}>Sexo</ThemedText>
              <View style={styles.toggleRow}>
                <TouchableOpacity 
                  style={[styles.toggleChip, gender === 'male' && styles.toggleChipActive]} 
                  onPress={() => setGender('male')}
                >
                  <ThemedText style={[styles.toggleText, gender === 'male' && styles.toggleTextActive]}>Hombre</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toggleChip, gender === 'female' && styles.toggleChipActive]} 
                  onPress={() => setGender('female')}
                >
                  <ThemedText style={[styles.toggleText, gender === 'female' && styles.toggleTextActive]}>Mujer</ThemedText>
                </TouchableOpacity>
              </View>

              <ThemedText style={styles.sectionLabel}>Nivel de Actividad Física</ThemedText>
              <View style={styles.selectColumn}>
                {[
                  { key: 'sedentary', label: 'Sedentario (Oficina / Poco ejercicio)' },
                  { key: 'light', label: 'Ligero (1-3 días/semana)' },
                  { key: 'moderate', label: 'Moderado (3-5 días/semana)' },
                  { key: 'active', label: 'Activo (6-7 días/semana)' },
                  { key: 'athlete', label: 'Atleta (Doble sesión / Trabajo pesado)' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.selectOption, activity === item.key && styles.selectOptionActive]}
                    onPress={() => setActivity(item.key as any)}
                  >
                    <ThemedText style={{ color: activity === item.key ? "#FF6F00" : "#6B7280" }}>{activity === item.key ? "●" : "○"}</ThemedText>
                    <ThemedText style={[styles.selectOptionText, activity === item.key && styles.selectOptionTextActive]}>{item.label}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <ThemedText style={styles.sectionLabel}>Objetivo Fitness</ThemedText>
              <View style={styles.toggleRow}>
                <TouchableOpacity 
                  style={[styles.toggleChip, goal === 'deficit' && styles.toggleChipActive]} 
                  onPress={() => setGoal('deficit')}
                >
                  <ThemedText style={[styles.toggleText, goal === 'deficit' && styles.toggleTextActive]}>Perder Grasa</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toggleChip, goal === 'maintenance' && styles.toggleChipActive]} 
                  onPress={() => setGoal('maintenance')}
                >
                  <ThemedText style={[styles.toggleText, goal === 'maintenance' && styles.toggleTextActive]}>Mantener</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toggleChip, goal === 'surplus' && styles.toggleChipActive]} 
                  onPress={() => setGoal('surplus')}
                >
                  <ThemedText style={[styles.toggleText, goal === 'surplus' && styles.toggleTextActive]}>Ganar Músculo</ThemedText>
                </TouchableOpacity>
              </View>

              {/* Calculated Results Live Preview */}
              <View style={styles.calcResultBox}>
                <ThemedText style={styles.calcResultTitle}>Resultado Calculado:</ThemedText>
                <ThemedText style={styles.calcResultRow}>• BMR (Gasto Basal): <ThemedText style={{ fontWeight: 'bold', color: '#FFF' }}>{fitnessCalc.bmr} kcal</ThemedText></ThemedText>
                <ThemedText style={styles.calcResultRow}>• TDEE (Gasto Total): <ThemedText style={{ fontWeight: 'bold', color: '#FFF' }}>{fitnessCalc.tdee} kcal</ThemedText></ThemedText>
                <ThemedText style={styles.calcResultRow}>• Meta Recomendada: <ThemedText style={{ fontWeight: 'bold', color: '#FF6F00' }}>{fitnessCalc.targetCalories} kcal/día</ThemedText></ThemedText>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.saveCalcBtn} onPress={handleSaveCalculator}>
              <ThemedText style={styles.saveCalcBtnText}>Aplicar Meta y Macros</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'rgba(16, 16, 22, 0.88)',
    borderRadius: 8,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)', // Oro Imperial
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  titleText: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 10.5,
    color: '#A0A4B0',
    fontFamily: 'monospace',
  },
  calcButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(30, 30, 38, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  calcButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF6F00',
  },
  caloriesOverviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.two,
  },
  consumedCalsNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FF6F00',
    lineHeight: 36,
  },
  calsTargetSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  remainingBadge: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'flex-end',
  },
  remainingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  remainingLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: '#1F2937',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6F00',
    borderRadius: 5,
  },
  indexBadgesRow: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  indexItem: {
    alignItems: 'center',
  },
  indexItemLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  indexItemVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E5E7EB',
  },
  indexDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#374151',
  },
  macroSplitRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  macroItem: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F3F4F6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6F00',
    marginTop: Spacing.two,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputsGridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#1F2937',
    color: '#FFF',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  toggleChip: {
    flex: 1,
    backgroundColor: '#1F2937',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  toggleChipActive: {
    backgroundColor: '#FF6F00',
    borderColor: '#FF6F00',
  },
  toggleText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  toggleTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  selectColumn: {
    gap: 6,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1F2937',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  selectOptionActive: {
    borderColor: '#FF6F00',
    backgroundColor: 'rgba(255, 111, 0, 0.1)',
  },
  selectOptionText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  selectOptionTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  calcResultBox: {
    backgroundColor: '#1F2937',
    borderRadius: 10,
    padding: 12,
    marginTop: Spacing.two,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6F00',
  },
  calcResultTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  calcResultRow: {
    fontSize: 12,
    color: '#D1D5DB',
    marginBottom: 2,
  },
  saveCalcBtn: {
    backgroundColor: '#FF6F00',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  saveCalcBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
