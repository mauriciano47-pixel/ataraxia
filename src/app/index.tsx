import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { useDailyLog } from '@/hooks/useDailyLog';

export default function HoyScreen() {
  const { log, loading, addWater, toggleTraining, addMeal } = useDailyLog();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  if (loading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <ThemedText style={{ marginTop: Spacing.three }}>Cargando progreso...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Hoy
        </ThemedText>

        {/* Entrenamiento */}
        <ThemedView type="backgroundElement" style={[styles.card, log.trainingCompleted ? { borderColor: colors.accent, borderWidth: 1 } : null]}>
          <ThemedText type="subtitle">Entrenamiento</ThemedText>
          <ThemedText>{log.trainingCompleted ? '¡Victoria! Rutina completada. 💪' : 'Rutina de Fuerza - 45 min'}</ThemedText>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: log.trainingCompleted ? colors.backgroundSelected : colors.accent }]}
            onPress={toggleTraining}
          >
            <ThemedText style={[styles.buttonText, { color: log.trainingCompleted ? colors.text : '#1A1A1A' }]}>
              {log.trainingCompleted ? 'Desmarcar' : 'Comenzar Disciplina'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Agua */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle">Hidratación</ThemedText>
          <ThemedText>{log.waterLitres.toFixed(2)}L consumidos</ThemedText>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.accent }]}
            onPress={() => addWater(0.25)}
          >
            <ThemedText style={[styles.buttonText, { color: '#1A1A1A' }]}>+ Tomar Vaso (250ml)</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Comidas */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle">Comidas</ThemedText>
          <ThemedText>{log.mealsLogged} registradas</ThemedText>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.backgroundSelected }]}
            onPress={addMeal}
          >
            <ThemedText style={[styles.buttonText, { color: colors.text }]}>+ Añadir Registro</ThemedText>
          </TouchableOpacity>
        </ThemedView>

      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    marginVertical: Spacing.three,
  },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.one, // Menos redondeado para estilo estoico/rígido
    gap: Spacing.two,
  },
  actionButton: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.half, // Bordes casi rectos
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
