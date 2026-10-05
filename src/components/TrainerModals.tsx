// Ataraxia Trainer Modals — AI Protocol: 8000ms timeout compliant
import React from 'react';
import { View, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { CustomExercise } from '@/types/onboarding';
import { SUGGESTED_EXERCISES, SUGGESTED_SETS, MUSCLE_GROUPS, PRESET_ROUTINES } from '@/constants/trainerPresets';

interface ExerciseEditorModalProps {
  visible: boolean;
  editingExerciseId: string | null;
  exerciseNameInput: string;
  setExerciseNameInput: (v: string) => void;
  exerciseSetsInput: string;
  setExerciseSetsInput: (v: string) => void;
  exerciseMuscleInput: string;
  setExerciseMuscleInput: (v: string) => void;
  handleSaveExercise: () => void;
  onClose: () => void;
  triggerHaptic: () => void;
  styles: any;
}

export function ExerciseEditorModal({
  visible,
  editingExerciseId,
  exerciseNameInput,
  setExerciseNameInput,
  exerciseSetsInput,
  setExerciseSetsInput,
  exerciseMuscleInput,
  setExerciseMuscleInput,
  handleSaveExercise,
  onClose,
  triggerHaptic,
  styles,
}: ExerciseEditorModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <ThemedText style={styles.modalTitle}>
            {editingExerciseId ? '✏️ Editar Ejercicio' : '➕ Añadir Ejercicio'}
          </ThemedText>
          <ThemedText style={styles.modalSub}>
            Configura los detalles del movimiento para tu rutina personalizada:
          </ThemedText>

          <View style={styles.formGroup}>
            <ThemedText style={styles.formLabel}>Nombre del Ejercicio:</ThemedText>
            <TextInput
              style={styles.formInput}
              value={exerciseNameInput}
              onChangeText={setExerciseNameInput}
              placeholder="Ej: Press Francés, Sentadilla Búlgara..."
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.quickChipsSection}>
            <ThemedText style={styles.quickChipsLabel}>Sugerencias Rápidas:</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {SUGGESTED_EXERCISES.map((sug, i) => (
                <TouchableOpacity
                  key={`sug_${i}`}
                  style={styles.sugChip}
                  onPress={() => {
                    triggerHaptic();
                    setExerciseNameInput(sug);
                  }}
                >
                  <ThemedText style={styles.sugChipText}>{sug}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.formLabel}>Series y Repeticiones:</ThemedText>
            <TextInput
              style={styles.formInput}
              value={exerciseSetsInput}
              onChangeText={setExerciseSetsInput}
              placeholder="Ej: 4x8 (RIR 2), 3x12, 4 al fallo..."
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.quickChipsSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {SUGGESTED_SETS.map((sugSet, i) => (
                <TouchableOpacity
                  key={`set_${i}`}
                  style={styles.sugChip}
                  onPress={() => {
                    triggerHaptic();
                    setExerciseSetsInput(sugSet);
                  }}
                >
                  <ThemedText style={styles.sugChipText}>{sugSet}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.formLabel}>Grupo Muscular:</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {MUSCLE_GROUPS.map((m) => (
                <TouchableOpacity
                  key={`mg_${m}`}
                  style={[styles.muscleChip, exerciseMuscleInput === m && styles.muscleChipActive]}
                  onPress={() => {
                    triggerHaptic();
                    setExerciseMuscleInput(m);
                  }}
                >
                  <ThemedText style={[styles.muscleChipText, exerciseMuscleInput === m && styles.muscleChipTextActive]}>
                    {m}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={styles.saveExerciseModalBtn}
            onPress={handleSaveExercise}
            activeOpacity={0.85}
          >
            <ThemedText style={styles.saveExerciseModalBtnText}>
              {editingExerciseId ? 'Guardar Cambios ✓' : 'Añadir a la Rutina ✓'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeModalBtn}
            onPress={onClose}
          >
            <ThemedText style={{ color: '#94A3B8', fontFamily: 'monospace' }}>Cancelar</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

interface PresetsModalProps {
  visible: boolean;
  onApplyPreset: (preset: any) => void;
  onClose: () => void;
  styles: any;
}

export function PresetsModal({
  visible,
  onApplyPreset,
  onClose,
  styles,
}: PresetsModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <ThemedText style={styles.modalTitle}>📂 Plantillas de Rutinas Rápidas</ThemedText>
          <ThemedText style={styles.modalSub}>Selecciona una estructura probada para cargarla al instante:</ThemedText>

          <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
            <View style={{ gap: 10, paddingVertical: 4 }}>
              {PRESET_ROUTINES.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={styles.presetCard}
                  onPress={() => onApplyPreset(preset)}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <ThemedText style={{ fontSize: 24 }}>{preset.icon}</ThemedText>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.presetTitle}>{preset.title}</ThemedText>
                      <ThemedText style={styles.presetSubtitle}>{preset.subtitle}</ThemedText>
                    </View>
                    <ThemedText style={{ color: '#D4AF37', fontWeight: 'bold' }}>Cargar →</ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.closeModalBtn}
            onPress={onClose}
          >
            <ThemedText style={{ color: '#94A3B8', fontFamily: 'monospace' }}>Cerrar</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

interface GeneratorModalProps {
  visible: boolean;
  selectedTime: number;
  setSelectedTime: (t: number) => void;
  selectedEquip: string;
  setSelectedEquip: (eq: string) => void;
  selectedFocus: string;
  setSelectedFocus: (f: string) => void;
  handleGenerateAI: () => void;
  isGenerating: boolean;
  generatedRoutine: any;
  handleApplyAIRoutine: () => void;
  onClose: () => void;
  triggerHaptic: () => void;
  styles: any;
}

export function GeneratorModal({
  visible,
  selectedTime,
  setSelectedTime,
  selectedEquip,
  setSelectedEquip,
  selectedFocus,
  setSelectedFocus,
  handleGenerateAI,
  isGenerating,
  generatedRoutine,
  handleApplyAIRoutine,
  onClose,
  triggerHaptic,
  styles,
}: GeneratorModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <ThemedText style={styles.modalTitle}>⚡ Oráculo de Entrenamientos IA</ThemedText>
          <ThemedText style={styles.modalSub}>Configura los parámetros para crear tu sesión perfecta con Gemini:</ThemedText>

          <View style={styles.paramSection}>
            <ThemedText style={styles.paramLabel}>⏱️ Tiempo Disponible:</ThemedText>
            <View style={styles.chipRow}>
              {[15, 30, 45, 60].map((t) => (
                <TouchableOpacity
                  key={`t_${t}`}
                  style={[styles.paramChip, selectedTime === t && styles.paramChipActive]}
                  onPress={() => {
                    triggerHaptic();
                    setSelectedTime(t);
                  }}
                >
                  <ThemedText style={[styles.paramChipText, selectedTime === t && styles.paramChipTextActive]}>
                    {t} min
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.paramSection}>
            <ThemedText style={styles.paramLabel}>🏋️‍♂️ Equipo Disponible:</ThemedText>
            <View style={styles.chipRow}>
              {['Gimnasio', 'Mancuernas en Casa', 'Peso Corporal'].map((eq) => (
                <TouchableOpacity
                  key={`eq_${eq}`}
                  style={[styles.paramChip, selectedEquip === eq && styles.paramChipActive]}
                  onPress={() => {
                    triggerHaptic();
                    setSelectedEquip(eq);
                  }}
                >
                  <ThemedText style={[styles.paramChipText, selectedEquip === eq && styles.paramChipTextActive]}>
                    {eq}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.paramSection}>
            <ThemedText style={styles.paramLabel}>⚔️ Enfoque Principal:</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {['Full Body / Fuerza', 'Empuje (Pecho/Hombro)', 'Tracción (Espalda/Bíceps)', 'Pierna & Core'].map((f) => (
                <TouchableOpacity
                  key={`f_${f}`}
                  style={[styles.paramChip, selectedFocus === f && styles.paramChipActive]}
                  onPress={() => {
                    triggerHaptic();
                    setSelectedFocus(f);
                  }}
                >
                  <ThemedText style={[styles.paramChipText, selectedFocus === f && styles.paramChipTextActive]}>
                    {f}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={styles.generateActionBtn}
            onPress={handleGenerateAI}
            disabled={isGenerating}
            activeOpacity={0.85}
          >
            {isGenerating ? (
              <ActivityIndicator color="#070B14" />
            ) : (
              <ThemedText style={styles.generateActionBtnText}>Diseñar Rutina con Gemini IA 🚀</ThemedText>
            )}
          </TouchableOpacity>

          {generatedRoutine && (
            <View style={styles.generatedPreviewBox}>
              <ThemedText style={styles.genTitle}>{generatedRoutine.title}</ThemedText>
              <View style={styles.genList}>
                {generatedRoutine.exercises.map((ex: any, i: number) => (
                  <ThemedText key={`gen_${i}`} style={styles.genExerciseItem}>
                    • {ex.n} ({ex.s})
                  </ThemedText>
                ))}
              </View>
              <TouchableOpacity
                style={styles.loadRoutineBtn}
                onPress={handleApplyAIRoutine}
                activeOpacity={0.85}
              >
                <ThemedText style={styles.loadRoutineBtnText}>Cargar Rutina en la Sesión de Hoy ✓</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.closeModalBtn}
            onPress={onClose}
          >
            <ThemedText style={{ color: '#94A3B8', fontFamily: 'monospace' }}>Cerrar</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
