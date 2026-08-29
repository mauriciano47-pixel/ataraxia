import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
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
            <CalculatorIcon color="#D4AF37" size={20} />
          </View>
          <View>
            <ThemedText style={styles.titleText}>Índice Calórico & TDEE</ThemedText>
            <ThemedText style={styles.subtitleText}>{getGoalLabel(userMetrics.goal)}</ThemedText>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.calcButton} 
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <SettingsIcon color="#D4AF37" size={14} />
          <ThemedText style={styles.calcButtonText}>⚡ Calcular TDEE</ThemedText>
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
          <ThemedText style={styles.remainingLabel}>restantes</ThemedText>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${consumedPct}%` }]} />
      </View>

      {/* Fitness Index Badges */}
      <View style={styles.indexBadgesRow}>
        <View style={styles.indexItem}>
          <ThemedText style={styles.indexItemLabel}>BMR (Basal)</ThemedText>
          <ThemedText style={styles.indexItemVal}>{fitnessCalc.bmr} kcal</ThemedText>
        </View>
        <View style={styles.indexDivider} />
        <View style={styles.indexItem}>
          <ThemedText style={styles.indexItemLabel}>TDEE (Mantenimiento)</ThemedText>
          <ThemedText style={styles.indexItemVal}>{fitnessCalc.tdee} kcal</ThemedText>
        </View>
        <View style={styles.indexDivider} />
        <View style={styles.indexItem}>
          <ThemedText style={styles.indexItemLabel}>Puntuación Estoica</ThemedText>
          <ThemedText style={[styles.indexItemVal, { color: '#D4AF37' }]}>{fitnessCalc.stoicScore}/100</ThemedText>
        </View>
      </View>

      {/* Macros Split */}
      <View style={styles.macroSplitRow}>
        <View style={styles.macroItem}>
          <ThemedText style={styles.macroLabel}>Proteína</ThemedText>
          <ThemedText style={[styles.macroValue, { color: '#FDE68A' }]}>{consumedMacros.protein}g / {fitnessCalc.macros.protein}g</ThemedText>
        </View>
        <View style={styles.macroItem}>
          <ThemedText style={styles.macroLabel}>Carbohidratos</ThemedText>
          <ThemedText style={[styles.macroValue, { color: '#FCD34D' }]}>{consumedMacros.carbs}g / {fitnessCalc.macros.carbs}g</ThemedText>
        </View>
        <View style={styles.macroItem}>
          <ThemedText style={styles.macroLabel}>Grasas</ThemedText>
          <ThemedText style={[styles.macroValue, { color: '#D4AF37' }]}>{consumedMacros.fats}g / {fitnessCalc.macros.fats}g</ThemedText>
        </View>
      </View>

      {/* TDEE Calculator Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Calculadora de Métricas TDEE</ThemedText>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <ThemedText style={{ color: '#94A3B8', fontSize: 16, fontWeight: 'bold' }}>✕</ThemedText>
                </TouchableOpacity>
              </View>

              <ThemedText style={styles.sectionLabel}>Datos Biométricos</ThemedText>
              <View style={styles.inputsGridRow}>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Peso (kg)</ThemedText>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Altura (cm)</ThemedText>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={height}
                    onChangeText={setHeight}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Edad</ThemedText>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={age}
                    onChangeText={setAge}
                  />
                </View>
              </View>

              <ThemedText style={styles.sectionLabel}>Biológico</ThemedText>
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
                  { id: 'sedentary', label: 'Sedentario (Oficina / Poco ejercicio)' },
                  { id: 'light', label: 'Ligero (1-3 días entreno/sem)' },
                  { id: 'moderate', label: 'Moderado (3-5 días entreno/sem)' },
                  { id: 'active', label: 'Activo (6-7 días entreno/sem)' },
                  { id: 'athlete', label: 'Atleta / Alto Rendimiento (Doble sesión)' },
                ].map(opt => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.selectOption, activity === opt.id && styles.selectOptionActive]}
                    onPress={() => setActivity(opt.id as any)}
                  >
                    <ThemedText style={[styles.selectOptionText, activity === opt.id && styles.selectOptionTextActive]}>
                      {opt.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <ThemedText style={styles.sectionLabel}>Objetivo Nutricional</ThemedText>
              <View style={styles.selectColumn}>
                {[
                  { id: 'deficit', label: 'Pérdida de Grasa (Déficit -15%)' },
                  { id: 'maintenance', label: 'Mantenimiento Calórico (Salud)' },
                  { id: 'surplus', label: 'Ganancia Muscular (Superávit +10%)' },
                ].map(opt => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.selectOption, goal === opt.id && styles.selectOptionActive]}
                    onPress={() => setGoal(opt.id as any)}
                  >
                    <ThemedText style={[styles.selectOptionText, goal === opt.id && styles.selectOptionTextActive]}>
                      {opt.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Realtime Calculated preview */}
              <View style={styles.calcResultBox}>
                <ThemedText style={styles.calcResultTitle}>Resultado TDEE Estimado</ThemedText>
                <ThemedText style={styles.calcResultRow}>BMR (Metabolismo Basal): {fitnessCalc.bmr} kcal</ThemedText>
                <ThemedText style={styles.calcResultRow}>TDEE (Mantenimiento): {fitnessCalc.tdee} kcal</ThemedText>
                <ThemedText style={[styles.calcResultRow, { color: '#0052FF', fontWeight: 'bold' }]}>Meta Objetivo: {fitnessCalc.targetCalories} kcal</ThemedText>
              </View>

              <TouchableOpacity style={styles.saveCalcBtn} onPress={handleSaveCalculator}>
                <ThemedText style={styles.saveCalcBtnText}>GUARDAR Y APLICAR METAS</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'rgba(13, 17, 28, 0.94)',
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    marginBottom: Spacing.three,
    gap: 8,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.two,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
    flexShrink: 1,
    minWidth: 160,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  titleText: {
    fontSize: 14.5,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#F8FAFC',
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  subtitleText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
    flexShrink: 1,
  },
  calcButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    alignSelf: 'flex-start',
  },
  calcButtonText: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#FFE259',
    fontFamily: 'monospace',
  },
  caloriesOverviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.two,
  },
  consumedCalsNumber: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFE259',
    lineHeight: 34,
    fontFamily: 'monospace',
  },
  calsTargetSub: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  remainingBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.10)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  remainingValue: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#D4AF37',
    fontFamily: 'monospace',
  },
  remainingLabel: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 4,
  },
  indexBadgesRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    borderRadius: 10,
    padding: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.20)',
  },
  indexItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 80,
  },
  indexItemLabel: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  indexItemVal: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#FFE259',
    fontFamily: 'monospace',
  },
  indexDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.20)',
  },
  macroSplitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  macroItem: {
    flex: 1,
    minWidth: 90,
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.18)',
  },
  macroLabel: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  macroValue: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#FDE68A',
    fontFamily: 'monospace',
    flexShrink: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 7, 0.90)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0A0D16',
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
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
    color: '#FFE259',
    fontFamily: 'serif',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginTop: Spacing.two,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
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
    color: '#94A3B8',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  textInput: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    color: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    fontFamily: 'monospace',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  toggleChip: {
    flex: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.20)',
  },
  toggleChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  toggleText: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  toggleTextActive: {
    color: '#050507',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  selectColumn: {
    gap: 6,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
  },
  selectOptionActive: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.20)',
  },
  selectOptionText: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  selectOptionTextActive: {
    color: '#FFE259',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  calcResultBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.10)',
    borderRadius: 10,
    padding: 12,
    marginTop: Spacing.two,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
  },
  calcResultTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  calcResultRow: {
    fontSize: 12,
    color: '#CBD5E1',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  saveCalcBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  saveCalcBtnText: {
    color: '#050507',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});
