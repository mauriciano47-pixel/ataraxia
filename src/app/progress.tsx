import { StyleSheet, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';
import { useDailyLog } from '@/hooks/useDailyLog';

export default function ProgressScreen() {
  const { log, loading } = useDailyLog();
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

  const calorieGoal = 2000;
  const caloriePercentage = Math.min(((log.totalCalories || 0) / calorieGoal) * 100, 100);
  
  const waterGoal = 2.5;
  const waterPercentage = Math.min((log.waterLitres / waterGoal) * 100, 100);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Progreso de Hoy
        </ThemedText>

        <ThemedView style={styles.grid}>
          {/* Card Calorías */}
          <ThemedView type="backgroundElement" style={styles.statCard}>
            <ThemedText type="subtitle">Calorías</ThemedText>
            <ThemedText style={styles.statValue}>{log.totalCalories || 0}</ThemedText>
            <ThemedText style={styles.statLabel}>/ {calorieGoal} kcal</ThemedText>
            <ThemedView style={[styles.progressContainer, { backgroundColor: colors.backgroundSelected }]}>
              <ThemedView style={[styles.progressBar, { width: `${caloriePercentage}%`, backgroundColor: colors.accent }]} />
            </ThemedView>
          </ThemedView>

          {/* Card Agua */}
          <ThemedView type="backgroundElement" style={styles.statCard}>
            <ThemedText type="subtitle">Agua</ThemedText>
            <ThemedText style={styles.statValue}>{log.waterLitres.toFixed(1)}L</ThemedText>
            <ThemedText style={styles.statLabel}>/ {waterGoal}L</ThemedText>
            <ThemedView style={[styles.progressContainer, { backgroundColor: colors.backgroundSelected }]}>
              <ThemedView style={[styles.progressBar, { width: `${waterPercentage}%`, backgroundColor: colors.accent }]} />
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Card Entrenamiento */}
        <ThemedView type="backgroundElement" style={[styles.card, log.trainingCompleted ? { borderColor: colors.accent, borderWidth: 1 } : null]}>
          <ThemedText type="subtitle">Entrenamiento Físico</ThemedText>
          <ThemedText style={{ marginTop: Spacing.one, fontWeight: 'bold', color: log.trainingCompleted ? colors.accent : colors.textSecondary }}>
            {log.trainingCompleted ? 'Disciplina cumplida.' : 'Aún pendiente.'}
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle">Resumen Semanal</ThemedText>
          <ThemedText style={{ marginTop: Spacing.two }}>
            Aquí mostraremos un gráfico con el resumen de los últimos 7 días. Por ahora, este es tu estado actual. ¡Sigue así!
          </ThemedText>
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
    marginBottom: Spacing.three,
  },
  grid: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  statCard: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Spacing.one,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: Spacing.one,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: Spacing.two,
  },
  progressContainer: {
    height: 6,
    width: '100%',
    borderRadius: 0,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 0,
  },
});
