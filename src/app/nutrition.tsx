import { StyleSheet, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';
import { useDailyLog } from '@/hooks/useDailyLog';

export default function NutritionScreen() {
  const { log, loading, addCalories } = useDailyLog();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  if (loading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <ThemedText style={{ marginTop: Spacing.three }}>Cargando datos...</ThemedText>
      </ThemedView>
    );
  }

  const goal = 2000;
  const currentCalories = log.totalCalories || 0;
  const percentage = Math.min((currentCalories / goal) * 100, 100);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Nutrición
        </ThemedText>

        {/* Resumen de Calorías */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle">Calorías de Hoy</ThemedText>
          <ThemedText type="title">{currentCalories} / {goal} kcal</ThemedText>
          
          <ThemedView style={[styles.progressContainer, { backgroundColor: colors.backgroundSelected }]}>
            <ThemedView style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: colors.accent }]} />
          </ThemedView>
        </ThemedView>

        {/* Registro Rápido */}
        <ThemedText type="subtitle" style={{ marginTop: Spacing.four }}>Registro Rápido</ThemedText>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.backgroundElement, borderWidth: 1, borderColor: colors.backgroundSelected }]} onPress={() => addCalories(400)}>
          <ThemedText style={[styles.buttonText, { color: colors.text }]}>+ Desayuno (400 kcal)</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.backgroundElement, borderWidth: 1, borderColor: colors.backgroundSelected }]} onPress={() => addCalories(600)}>
          <ThemedText style={[styles.buttonText, { color: colors.text }]}>+ Almuerzo (600 kcal)</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.backgroundElement, borderWidth: 1, borderColor: colors.backgroundSelected }]} onPress={() => addCalories(500)}>
          <ThemedText style={[styles.buttonText, { color: colors.text }]}>+ Cena (500 kcal)</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.backgroundElement, borderWidth: 1, borderColor: colors.backgroundSelected }]} onPress={() => addCalories(200)}>
          <ThemedText style={[styles.buttonText, { color: colors.text }]}>+ Snack (200 kcal)</ThemedText>
        </TouchableOpacity>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle">Tip del Día</ThemedText>
          <ThemedText>Recuerda consumir proteínas dentro de la hora posterior a tu entrenamiento de fuerza para maximizar la recuperación muscular.</ThemedText>
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
    borderRadius: Spacing.one,
    gap: Spacing.two,
  },
  progressContainer: {
    height: 10,
    borderRadius: 0, // Recto y estoico
    marginTop: Spacing.two,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 0,
  },
  actionButton: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.half, // Recto
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
