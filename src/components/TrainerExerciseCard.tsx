import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { CustomExercise } from '@/types/onboarding';

interface TrainerExerciseCardProps {
  exercise: CustomExercise;
  index: number;
  totalExercises: number;
  onToggleDone: (id: string) => void;
  onSelectGuide: (guide: any) => void;
  onEdit: (exercise: CustomExercise) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onDelete: (id: string, name: string) => void;
  onSetRpe: (id: string, rpe: number) => void;
  triggerHaptic: () => void;
  styles?: any;
}

export function TrainerExerciseCard({
  exercise: e,
  index,
  totalExercises,
  onToggleDone,
  onSelectGuide,
  onEdit,
  onMove,
  onDelete,
  onSetRpe,
  triggerHaptic,
  styles,
}: TrainerExerciseCardProps) {
  const hasRpe = e.rpe !== null && e.rpe !== undefined;
  let progressionTip = "";
  if (hasRpe) {
    if (e.rpe! <= 7) {
      progressionTip = "💡 Progresión sugerida: Incrementar peso +2.5% a +5% en la siguiente sesión.";
    } else if (e.rpe! >= 9.5) {
      progressionTip = "⚠️ Límite de fallo alcanzado. Consolidar técnica con misma carga antes de subir.";
    } else {
      progressionTip = "🎯 Zona óptima de hipertrofia y estímulo (RPE 8-9).";
    }
  }

  return (
    <View key={e.id} style={styles.card}>
      <TouchableOpacity 
        style={styles.cardHeaderTouch}
        onPress={() => onToggleDone(e.id)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.checkbox,
          e.done ? styles.checkboxDone : styles.checkboxPending
        ]}>
          {e.done && <ThemedText style={styles.checkboxCheck}>✓</ThemedText>}
        </View>

        <View style={{ flex: 1, flexShrink: 1 }}>
          <ThemedText style={[styles.exerciseName, e.done && styles.exerciseNameDone]}>
            {e.n}
          </ThemedText>
        </View>
      </TouchableOpacity>

      <View style={styles.cardMetaAndControlsRow}>
        <View style={styles.exerciseBadgesRow}>
          <View style={styles.setsBadge}>
            <ThemedText style={styles.setsBadgeText}>{e.s}</ThemedText>
          </View>
          {e.muscleGroup && (
            <View style={styles.muscleBadge}>
              <ThemedText style={styles.muscleBadgeText}>{e.muscleGroup}</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.exerciseControlsRow}>
          <TouchableOpacity
            style={[styles.iconCtrlBtn, { backgroundColor: 'rgba(255, 226, 89, 0.15)', borderColor: '#FFE259' }]}
            onPress={() => onSelectGuide({
              id: e.id,
              name: e.n,
              setsReps: e.s,
              muscleGroup: e.muscleGroup || 'General',
              cue: 'Mantén la técnica estricta y el control en cada repetición.',
            })}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.iconCtrlText}>💡</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconCtrlBtn}
            onPress={() => onEdit(e)}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.iconCtrlText}>✏️</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconCtrlBtn}
            onPress={() => onMove(index, 'up')}
            disabled={index === 0}
            activeOpacity={0.7}
          >
            <ThemedText style={[styles.iconCtrlText, index === 0 && { opacity: 0.3 }]}>⬆️</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconCtrlBtn}
            onPress={() => onMove(index, 'down')}
            disabled={index === totalExercises - 1}
            activeOpacity={0.7}
          >
            <ThemedText style={[styles.iconCtrlText, index === totalExercises - 1 && { opacity: 0.3 }]}>⬇️</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconCtrlBtn, styles.iconCtrlDelete]}
            onPress={() => onDelete(e.id, e.n)}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.iconCtrlText}>🗑️</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.rpeContainer}>
        <ThemedText style={styles.rpeSectionLabel}>RPE (Esfuerzo Percibido 1-10):</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 5 }}>
          {[...Array(10)].map((_, i) => {
            const rpeValue = i + 1;
            const isSelected = e.rpe === rpeValue;
            return (
              <TouchableOpacity 
                key={rpeValue} 
                style={[styles.rpeBadge, isSelected && styles.rpeBadgeActive]}
                onPress={() => {
                  triggerHaptic();
                  onSetRpe(e.id, rpeValue);
                }}
                activeOpacity={0.7}
              >
                <ThemedText style={[styles.rpeText, isSelected && styles.rpeTextActive]}>
                  {rpeValue}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {hasRpe && (
        <View style={styles.progressionBanner}>
          <ThemedText style={styles.progressionTipText}>
            {progressionTip}
          </ThemedText>
        </View>
      )}
    </View>
  );
}
