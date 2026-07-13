import { StyleSheet, ActivityIndicator, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';
import { useDailyLog } from '@/hooks/useDailyLog';

// Helper: Generar mock de últimos 29 días
const generateHistoryMock = () => {
  const days = [];
  for (let i = 0; i < 29; i++) {
    // 70% chance de éxito para la visualización del mapa estelar
    days.push(Math.random() > 0.3);
  }
  return days;
};
export default function ProgressScreen() {
  const { log, loading } = useDailyLog();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  
  const [history] = useState<boolean[]>(() => generateHistoryMock());

  if (loading || history.length === 0) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <ThemedText style={{ marginTop: Spacing.three }}>Conectando con el Oráculo...</ThemedText>
      </ThemedView>
    );
  }

  // El día 30 es HOY. Brilla si el check-in diario o el entrenamiento están hechos.
  const isTodaySuccess = log.checkInDone || log.trainingCompleted;
  const fullMap = [...history, isTodaySuccess];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <View style={styles.header}>
          <ThemedText style={styles.label}>CONSTELACIÓN</ThemedText>
          <ThemedText style={styles.title}>Historial</ThemedText>
        </View>

        <ThemedText style={styles.description}>
          Cada día de disciplina enciende una estrella. Un día perdido es espacio vacío en tu cosmos. Este es tu mapa estelar de los últimos 30 días.
        </ThemedText>

        <View style={styles.starMap}>
          {fullMap.map((success, index) => {
            const isToday = index === 29;
            return (
              <View 
                key={index} 
                style={[
                  styles.starContainer,
                  isToday && styles.todayContainer
                ]}
              >
                <View style={[
                  styles.star,
                  success ? {
                    backgroundColor: colors.accent,
                    shadowColor: colors.accent,
                    shadowOpacity: 1,
                    shadowRadius: 10,
                    elevation: 5,
                  } : {
                    backgroundColor: colors.backgroundSelected,
                  },
                  isToday && { borderWidth: 1, borderColor: '#FFF' }
                ]} />
              </View>
            );
          })}
        </View>

        <ThemedView style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
          <ThemedText style={{ fontFamily: 'serif', fontSize: 16 }}>&quot;No te lamentes por el espacio vacío. Alégrate por las estrellas que lograste encender hoy.&quot;</ThemedText>
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
  header: {
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#3D6BFF',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontFamily: 'serif',
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: Spacing.five,
  },
  starMap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'center',
    marginBottom: Spacing.five,
    paddingVertical: Spacing.four,
  },
  starContainer: {
    width: '14%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayContainer: {
    borderWidth: 1,
    borderColor: 'rgba(61, 107, 255, 0.3)',
    borderRadius: 8,
  },
  star: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  card: {
    padding: Spacing.four,
    borderRadius: 8,
    borderWidth: 1,
  },
});
