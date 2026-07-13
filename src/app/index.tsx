import { useState } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, useColorScheme, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';
import { useDailyLog } from '@/hooks/useDailyLog';

function Constellation({ points, size = 140 }: { points: boolean[], size?: number }) {
  const coords = [
    [30, 100], [70, 40], [110, 60], [95, 110], [50, 125],
  ].slice(0, points.length);

  return (
    <Svg width={size} height={size}>
      {coords.map((c, i) =>
        i < coords.length - 1 && points[i] && points[i + 1] ? (
          <Line key={`l-${i}`} x1={c[0]} y1={c[1]} x2={coords[i + 1][0]} y2={coords[i + 1][1]} stroke="#3D6BFF" strokeWidth="1.5" opacity="0.6" />
        ) : null
      )}
      {coords.map((c, i) => (
        <Circle
          key={i}
          cx={c[0]}
          cy={c[1]}
          r={points[i] ? 5 : 3}
          fill={points[i] ? "#3D6BFF" : "#1E2A3F"}
        />
      ))}
    </Svg>
  );
}

export default function HoyScreen() {
  const { log, loading, addWater, toggleTraining, addMeal, saveCheckIn } = useDailyLog();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const [energy, setEnergy] = useState<number | null>(null);
  const [sleep, setSleep] = useState<number | null>(null);

  if (loading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <ThemedText style={{ marginTop: Spacing.three }}>Cargando progreso...</ThemedText>
      </ThemedView>
    );
  }

  // Map habits to constellation points
  const habitos = [
    log.trainingCompleted,
    log.waterLitres >= 2,
    log.mealsLogged >= 3,
    log.checkInDone || false,
    false
  ];

  const habitsDone = habitos.filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <ThemedText style={styles.label}>ATARAXIA</ThemedText>
            <ThemedText style={styles.title}>
              Visto desde arriba, todo pesa menos
            </ThemedText>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileBtn}>
            <Ionicons name="person-circle-outline" size={32} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.constellationContainer}>
          <Constellation points={habitos} />
          <ThemedText style={styles.constellationText}>
            {habitsDone} de 5 hábitos encendidos hoy
          </ThemedText>
        </View>

        {!log.checkInDone ? (
          <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
            <ThemedText style={{ fontSize: 16, fontFamily: 'serif', marginBottom: 12 }}>Señal de Recuperación</ThemedText>

            <ThemedText style={styles.checkInLabel}>Energía (1-5)</ThemedText>
            <View style={styles.checkInRow}>
              {[1, 2, 3, 4, 5].map(v => (
                <TouchableOpacity
                  key={`e-${v}`}
                  style={[styles.checkInBtn, { borderColor: colors.backgroundSelected }, energy === v && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                  onPress={() => setEnergy(v)}
                >
                  <ThemedText style={energy === v ? { color: '#FFF' } : {}}>{v}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText style={[styles.checkInLabel, { marginTop: 12 }]}>Calidad de Sueño (1-5)</ThemedText>
            <View style={styles.checkInRow}>
              {[1, 2, 3, 4, 5].map(v => (
                <TouchableOpacity
                  key={`s-${v}`}
                  style={[styles.checkInBtn, { borderColor: colors.backgroundSelected }, sleep === v && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                  onPress={() => setSleep(v)}
                >
                  <ThemedText style={sleep === v ? { color: '#FFF' } : {}}>{v}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.accent, marginTop: 16 }, (!energy || !sleep) && { opacity: 0.5 }]}
              onPress={() => {
                if (energy && sleep) {
                  saveCheckIn(energy, sleep);
                }
              }}
              disabled={!energy || !sleep}
            >
              <ThemedText style={{ color: '#FFF', fontWeight: 'bold' }}>Guardar Check-in</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
            <ThemedText style={styles.quoteText}>
              {'"Contempla a menudo el conjunto del tiempo y de la sustancia, y verás qué pequeño es cada cosa."'}
            </ThemedText>
            <ThemedText style={styles.quoteAuthor}>— Marco Aurelio</ThemedText>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
            <ThemedText style={styles.statLabel}>ENTRENO</ThemedText>
            <TouchableOpacity onPress={toggleTraining}>
              <ThemedText style={[styles.statValue, { color: log.trainingCompleted ? colors.accent : colors.text }]}>
                {log.trainingCompleted ? 'Completado' : 'Pendiente'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
            <ThemedText style={styles.statLabel}>AGUA</ThemedText>
            <TouchableOpacity onPress={() => addWater(0.25)}>
              <ThemedText style={[styles.statValue, { color: log.waterLitres >= 2 ? colors.accent : colors.text }]}>
                {log.waterLitres.toFixed(1)} L
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
            <ThemedText style={styles.statLabel}>COMIDAS</ThemedText>
            <TouchableOpacity onPress={addMeal}>
              <ThemedText style={[styles.statValue, { color: log.mealsLogged >= 3 ? colors.accent : colors.text }]}>
                {log.mealsLogged} / 3
              </ThemedText>
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
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: Spacing.two,
  },
  header: {
    flex: 1,
  },
  profileBtn: {
    padding: Spacing.one,
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
  constellationContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  constellationText: {
    fontSize: 12,
    color: '#6B7690',
    marginTop: -8,
  },
  card: {
    padding: Spacing.four,
    borderRadius: 8,
    borderWidth: 1,
  },
  quoteText: {
    fontSize: 14,
    fontFamily: 'serif',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  quoteAuthor: {
    fontSize: 12,
    color: '#3D6BFF',
    marginTop: 8,
  },
  checkInLabel: {
    fontSize: 12,
    color: '#6B7690',
    marginBottom: 6,
  },
  checkInRow: {
    flexDirection: 'row',
    gap: 8,
  },
  checkInBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    padding: Spacing.three,
    borderRadius: 8,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#6B7690',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 16,
    marginTop: 4,
    fontWeight: '500',
  }
});
