import { StyleSheet, ActivityIndicator, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';
import { useDailyLog, useHistoryLog } from '@/hooks/useDailyLog';
import { PearlElectricBackground } from '@/components/PearlElectricBackground';

export default function ProgressScreen() {
  const { log, loading } = useDailyLog();
  const { historyMap, loadingHistory } = useHistoryLog();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  
  if (loading || loadingHistory) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#050507' }]}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <ThemedText style={{ marginTop: Spacing.three, color: '#D4AF37', fontFamily: 'monospace' }}>Conectando con el Oráculo...</ThemedText>
      </ThemedView>
    );
  }

  // El día 30 es HOY. Sobrescribimos el último día de la base de datos con el estado en tiempo real.
  const isTodaySuccess = log.checkInDone || log.trainingCompleted;
  const fullMap = [...historyMap];
  if (fullMap.length > 0) {
    fullMap[fullMap.length - 1] = isTodaySuccess;
  }

  return (
    <PearlElectricBackground glowColor="rgba(212, 175, 55, 0.28)">
      <SafeAreaView style={styles.safeArea}>
        
        <View style={styles.header}>
          <ThemedText style={styles.label}>⚡ CONSTELACIÓN DE FUERZA</ThemedText>
          <ThemedText style={styles.title}>Historial Estelar</ThemedText>
        </View>

        <ThemedText style={styles.description}>
          Cada día de disciplina enciende un rayo estelar de oro. Un día perdido es espacio vacío en tu cosmos. Este es tu mapa de los últimos 30 días.
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
                    backgroundColor: '#FFE259',
                    shadowColor: '#D4AF37',
                    shadowOpacity: 1,
                    shadowRadius: 10,
                    elevation: 6,
                  } : {
                    backgroundColor: 'rgba(212, 175, 55, 0.12)',
                    borderColor: 'rgba(212, 175, 55, 0.20)',
                    borderWidth: 1,
                  },
                  isToday && { borderWidth: 1.5, borderColor: '#FFE259' }
                ]} />
              </View>
            );
          })}
        </View>

        <ThemedView style={styles.card}>
          <ThemedText style={{ fontFamily: 'serif', fontSize: 15, color: '#FDE68A', fontStyle: 'italic', lineHeight: 22 }}>
            &quot;No te lamentes por el espacio vacío. Alégrate por los rayos de oro que lograste encender hoy en tu templo.&quot;
          </ThemedText>
        </ThemedView>

      </SafeAreaView>
    </PearlElectricBackground>
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
    marginBottom: Spacing.two,
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#D4AF37',
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
    color: '#FFE259',
  },
  description: {
    fontSize: 13.5,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: Spacing.three,
    color: '#CBD5E1',
  },
  starMap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'center',
    marginBottom: Spacing.four,
    paddingVertical: Spacing.four,
    backgroundColor: 'rgba(13, 17, 28, 0.75)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  starContainer: {
    width: '14%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayContainer: {
    borderWidth: 1.5,
    borderColor: '#FFE259',
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  star: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  card: {
    padding: Spacing.four,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: 'rgba(13, 17, 28, 0.94)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
});
