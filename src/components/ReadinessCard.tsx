import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface ReadinessCardProps {
  log: any;
  showReadinessModal: boolean;
  setShowReadinessModal: (v: boolean) => void;
  sleepScore: number;
  setSleepScore: (v: number) => void;
  stressScore: number;
  setStressScore: (v: number) => void;
  sorenessScore: number;
  setSorenessScore: (v: number) => void;
  handleSaveReadiness: () => void;
  triggerHaptic: () => void;
  styles: any;
}

export function ReadinessCard({
  log,
  showReadinessModal,
  setShowReadinessModal,
  sleepScore,
  setSleepScore,
  stressScore,
  setStressScore,
  sorenessScore,
  setSorenessScore,
  handleSaveReadiness,
  triggerHaptic,
  styles,
}: ReadinessCardProps) {
  return (
    <View style={styles.readinessCard}>
      <View style={styles.readinessHeaderRow}>
        <ThemedText style={styles.cardSectionTitle}>⚡ Disposición Fisiológica (Readiness)</ThemedText>
        <TouchableOpacity onPress={() => setShowReadinessModal(!showReadinessModal)}>
          <ThemedText style={styles.readinessToggleBtnText}>
            {showReadinessModal ? "Ocultar" : "Ajustar"}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {log.readinessScore && !showReadinessModal ? (
        <View style={styles.readinessSummary}>
          <View style={styles.scoreBadge}>
            <ThemedText style={styles.scoreNumber}>{log.readinessScore.total}</ThemedText>
            <ThemedText style={styles.scoreLabel}>/ 10</ThemedText>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ThemedText style={styles.readinessMetricsText}>
              Sueño: <ThemedText style={{ fontWeight: 'bold', color: '#FFE259' }}>{log.readinessScore.sleep}/10</ThemedText> | Estrés: <ThemedText style={{ fontWeight: 'bold', color: '#FFE259' }}>{log.readinessScore.stress}/10</ThemedText>
            </ThemedText>
            <ThemedText style={styles.readinessVerdictText}>
              {log.readinessScore.total >= 7 ? "🟢 Estado Óptimo para Alta Carga" : log.readinessScore.total >= 5 ? "🟡 Estado Moderado (Ajusta RPE a 7-8)" : "🔴 Alta Fatiga: Sugerido Amor Fati / Calistenia"}
            </ThemedText>
            {log.readinessScore.total < 5 && (
              <View style={{ marginTop: 6, backgroundColor: 'rgba(239, 68, 68, 0.12)', padding: 6, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                <ThemedText style={{ fontSize: 10.5, color: '#FCA5A5', fontStyle: 'italic', lineHeight: 14 }}>
                  🏛️ Epicteto: «El verdadero autodominio a veces es saber descansar. Forzar una hipertrofia desmedida con el SNC fatigado no es valentía, es necedad.»
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.readinessSliders}>
          <View style={styles.sliderRow}>
            <ThemedText style={styles.sliderLabel}>Calidad de Sueño (1-10): {sleepScore}</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
              {[1, 3, 5, 7, 8, 9, 10].map(v => (
                <TouchableOpacity
                  key={`sl_${v}`}
                  style={[styles.miniBtn, sleepScore === v && styles.miniBtnActive]}
                  onPress={() => {
                    triggerHaptic();
                    setSleepScore(v);
                  }}
                >
                  <ThemedText style={sleepScore === v ? styles.miniBtnTextActive : styles.miniBtnTextInactive}>{v}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.sliderRow}>
            <ThemedText style={styles.sliderLabel}>Estrés / Carga Mental (1-10): {stressScore}</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
              {[1, 3, 5, 7, 8, 9, 10].map(v => (
                <TouchableOpacity
                  key={`st_${v}`}
                  style={[styles.miniBtn, stressScore === v && styles.miniBtnActive]}
                  onPress={() => {
                    triggerHaptic();
                    setStressScore(v);
                  }}
                >
                  <ThemedText style={stressScore === v ? styles.miniBtnTextActive : styles.miniBtnTextInactive}>{v}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.sliderRow}>
            <ThemedText style={styles.sliderLabel}>Fatiga / Dolor Muscular (1-10): {sorenessScore}</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
              {[1, 3, 5, 7, 8, 9, 10].map(v => (
                <TouchableOpacity
                  key={`sr_${v}`}
                  style={[styles.miniBtn, sorenessScore === v && styles.miniBtnActive]}
                  onPress={() => {
                    triggerHaptic();
                    setSorenessScore(v);
                  }}
                >
                  <ThemedText style={sorenessScore === v ? styles.miniBtnTextActive : styles.miniBtnTextInactive}>{v}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.saveReadinessBtn} onPress={handleSaveReadiness}>
            <ThemedText style={styles.saveReadinessBtnText}>Guardar Evaluación de Disposición</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
