import React, { useState } from 'react';
import { StyleSheet, ActivityIndicator, View, ScrollView, TouchableOpacity, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useDailyLog, useHistoryLog } from '@/hooks/useDailyLog';
import { PearlElectricBackground } from '@/components/PearlElectricBackground';
import { LEGENDARY_PATHS } from '@/types/onboarding';

export default function ProgressScreen() {
  const { log, loading, calculateTodayGrade, executeJudgment, resetMonthlyCycle } = useDailyLog();
  const { historyMap, loadingHistory } = useHistoryLog();
  const [modalVisible, setModalVisible] = useState(false);
  const [judgmentResult, setJudgmentResult] = useState<{ promoted: boolean; title: string; message: string } | null>(null);

  if (loading || loadingHistory) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#050507' }]}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <ThemedText style={{ marginTop: Spacing.three, color: '#D4AF37', fontFamily: 'monospace' }}>Conectando con el Oráculo...</ThemedText>
      </ThemedView>
    );
  }

  const activePathKey = log.legendaryPath || 'spartan';
  const activePathInfo = LEGENDARY_PATHS[activePathKey];
  const cycle = log.monthlyCycle || {
    currentDay: 1,
    startDate: new Date().toISOString(),
    path: activePathKey,
    tier: 'Novicio de Esparta',
    dailyGrades: [],
    passedDaysCount: 0,
    failedDaysCount: 0,
    averageScore: 100,
    isJudgmentReady: false,
  };

  const todayGrade = calculateTodayGrade();

  // El día 30 es HOY. Sobrescribimos el último día de la base de datos con el estado en tiempo real.
  const isTodaySuccess = todayGrade.score >= 75;
  const fullMap = [...historyMap];
  if (fullMap.length > 0) {
    fullMap[fullMap.length - 1] = isTodaySuccess;
  }

  // Contar días victoriosos en el mapa de 30 días
  const victoriousDays = fullMap.filter(Boolean).length;
  const adherencePercent = Math.round((victoriousDays / 30) * 100);
  const isAboveThreshold = adherencePercent >= 80;

  const handleOpenJudgment = () => {
    const res = executeJudgment();
    setJudgmentResult(res);
    setModalVisible(true);
  };

  return (
    <PearlElectricBackground glowColor="rgba(212, 175, 55, 0.28)">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* HEADER PRINCIPAL */}
          <View style={styles.header}>
            <View style={styles.tierBadge}>
              <ThemedText style={styles.tierBadgeText}>
                🏛️ RANGO: {cycle.tier.toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText style={styles.title}>CICLO DE 30 DÍAS</ThemedText>
            <ThemedText style={styles.pathSubheader}>
              {activePathInfo.icon} {activePathInfo.name.toUpperCase()} • DÍA {cycle.currentDay}/30
            </ThemedText>
          </View>

          {/* TARJETA DE CALIFICACIÓN DE HOY */}
          <View style={styles.todayCard}>
            <View style={styles.todayCardHeader}>
              <View style={styles.scorePill}>
                <ThemedText style={styles.scoreText}>{todayGrade.score}</ThemedText>
                <ThemedText style={styles.scoreMax}>/100</ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.todayGradeLabel}>CALIFICACIÓN DE HOY</ThemedText>
                <ThemedText style={[
                  styles.todayGradeStatus,
                  todayGrade.status === 'divine' ? { color: '#FFE259' } :
                  todayGrade.status === 'worthy' ? { color: '#00E676' } :
                  todayGrade.status === 'mediocre' ? { color: '#F59E0B' } : { color: '#EF4444' }
                ]}>
                  {todayGrade.status === 'divine' ? '👑 SEMIDIÓS (IMPECABLE)' :
                   todayGrade.status === 'worthy' ? '⚔️ HOPLITA DIGNO' :
                   todayGrade.status === 'mediocre' ? '⚠️ TIBIO / AL LÍMITE' : '💀 DÍA INDIGNO'}
                </ThemedText>
              </View>
            </View>

            {/* DESGLOSE DE LOS 4 PILARES */}
            <View style={styles.pillarsRow}>
              <View style={styles.pillarItem}>
                <ThemedText style={styles.pillarIcon}>{log.trainingCompleted ? '✅' : '❌'}</ThemedText>
                <ThemedText style={styles.pillarName}>Entreno</ThemedText>
                <ThemedText style={styles.pillarPts}>{log.trainingCompleted ? '40' : '0'}/40</ThemedText>
              </View>
              <View style={styles.pillarItem}>
                <ThemedText style={styles.pillarIcon}>{Math.round(todayGrade.stepsRatio * 30) >= 25 ? '✅' : '⚡'}</ThemedText>
                <ThemedText style={styles.pillarName}>Pasos</ThemedText>
                <ThemedText style={styles.pillarPts}>{Math.round(todayGrade.stepsRatio * 30)}/30</ThemedText>
              </View>
              <View style={styles.pillarItem}>
                <ThemedText style={styles.pillarIcon}>{Math.round(todayGrade.waterRatio * 15) >= 12 ? '✅' : '💧'}</ThemedText>
                <ThemedText style={styles.pillarName}>Agua</ThemedText>
                <ThemedText style={styles.pillarPts}>{Math.round(todayGrade.waterRatio * 15)}/15</ThemedText>
              </View>
              <View style={styles.pillarItem}>
                <ThemedText style={styles.pillarIcon}>{todayGrade.caloriesLogged ? '✅' : '🍽️'}</ThemedText>
                <ThemedText style={styles.pillarName}>Nutrición</ThemedText>
                <ThemedText style={styles.pillarPts}>{todayGrade.caloriesLogged ? '15' : '0'}/15</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.todayVerdictText}>{todayGrade.verdict}</ThemedText>
          </View>

          {/* ADHERENCIA AL PLAN DE 30 DÍAS */}
          <View style={styles.adherenceCard}>
            <View style={styles.adherenceHeaderRow}>
              <ThemedText style={styles.adherenceTitle}>ADHERENCIA AL JUICIO DEL DÍA 30</ThemedText>
              <ThemedText style={[
                styles.adherencePercent,
                isAboveThreshold ? { color: '#00E676' } : { color: '#F59E0B' }
              ]}>
                {adherencePercent}% / 80% min
              </ThemedText>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[
                styles.progressBarFill,
                { width: `${Math.min(100, adherencePercent)}%` },
                isAboveThreshold ? { backgroundColor: '#00E676' } : { backgroundColor: '#F59E0B' }
              ]} />
            </View>
            <ThemedText style={styles.adherenceSub}>
              {victoriousDays} de 30 días cumplidos con honor militar.
            </ThemedText>
          </View>

          {/* CONSTELACIÓN ESTELAR DE LOS 30 DÍAS */}
          <View style={styles.constellationCard}>
            <ThemedText style={styles.constellationTitle}>⚡ CONSTELACIÓN DE FUERZA (30 DÍAS)</ThemedText>
            <ThemedText style={styles.constellationDesc}>
              Cada estrella dorada es un día conquistado. Un espacio vacío representa debilidad.
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
                        shadowRadius: 8,
                        elevation: 5,
                      } : {
                        backgroundColor: 'rgba(239, 68, 68, 0.20)',
                        borderColor: 'rgba(239, 68, 68, 0.40)',
                        borderWidth: 1,
                      },
                      isToday && { borderWidth: 1.5, borderColor: '#FFE259' }
                    ]} />
                    <ThemedText style={styles.starDayLabel}>D{index + 1}</ThemedText>
                  </View>
                );
              })}
            </View>
          </View>

          {/* BOTÓN DEL JUICIO DEL DÍA 30 */}
          <TouchableOpacity
            style={styles.judgmentBtn}
            onPress={handleOpenJudgment}
            activeOpacity={0.85}
          >
            <View style={styles.judgmentBtnInner}>
              <ThemedText style={{ fontSize: 18 }}>⚖️</ThemedText>
              <ThemedText style={styles.judgmentBtnText}>
                CONSULTAR EL JUICIO DEL OLIMPO
              </ThemedText>
              <ThemedText style={{ fontSize: 18 }}>⚖️</ThemedText>
            </View>
          </TouchableOpacity>

          {/* MODAL DEL JUICIO DEL DÍA 30 */}
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={[
                styles.modalCard,
                judgmentResult?.promoted ? styles.modalCardSuccess : styles.modalCardScold
              ]}>
                <ThemedText style={styles.modalEmblem}>
                  {judgmentResult?.promoted ? '👑' : '💀'}
                </ThemedText>
                <ThemedText style={[
                  styles.modalTitle,
                  judgmentResult?.promoted ? { color: '#FFE259' } : { color: '#EF4444' }
                ]}>
                  {judgmentResult?.title}
                </ThemedText>
                <ThemedText style={styles.modalMessage}>
                  {judgmentResult?.message}
                </ThemedText>

                {!judgmentResult?.promoted && (
                  <TouchableOpacity
                    style={styles.resetCycleBtn}
                    onPress={() => {
                      resetMonthlyCycle();
                      setModalVisible(false);
                    }}
                  >
                    <ThemedText style={styles.resetCycleBtnText}>
                      🔄 ACEPTAR REPRENSIÓN Y REINICIAR DÍA 1
                    </ThemedText>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <ThemedText style={styles.closeModalBtnText}>CERRAR JUICIO</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </ScrollView>
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
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  tierBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#FFE259',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginBottom: 6,
  },
  tierBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFE259',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  title: {
    fontSize: 24,
    fontFamily: 'serif',
    textTransform: 'uppercase',
    fontWeight: '900',
    color: '#FFFDE0',
    letterSpacing: 1.5,
  },
  pathSubheader: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#D4AF37',
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  todayCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 16,
    borderWidth: 1.4,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    padding: 16,
    gap: 12,
  },
  todayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderWidth: 1.2,
    borderColor: '#FFE259',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'monospace',
  },
  scoreMax: {
    fontSize: 11,
    color: '#D4AF37',
    fontFamily: 'monospace',
  },
  todayGradeLabel: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  todayGradeStatus: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  pillarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 10,
    padding: 10,
  },
  pillarItem: {
    alignItems: 'center',
    gap: 2,
  },
  pillarIcon: {
    fontSize: 14,
  },
  pillarName: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  pillarPts: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFE259',
    fontFamily: 'monospace',
  },
  todayVerdictText: {
    fontSize: 11.5,
    fontStyle: 'italic',
    color: '#CBD5E1',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
  },
  adherenceCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: 14,
    gap: 8,
  },
  adherenceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adherenceTitle: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#FFE259',
    letterSpacing: 1,
  },
  adherencePercent: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  adherenceSub: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  constellationCard: {
    backgroundColor: 'rgba(13, 17, 28, 0.80)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: 16,
    gap: 8,
  },
  constellationTitle: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#FFE259',
    letterSpacing: 1.5,
  },
  constellationDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
  starMap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginTop: 8,
  },
  starContainer: {
    width: '15%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  todayContainer: {
    borderWidth: 1.2,
    borderColor: '#FFE259',
    borderRadius: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  star: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  starDayLabel: {
    fontSize: 8,
    fontFamily: 'monospace',
    color: '#64748B',
  },
  judgmentBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.70,
    shadowRadius: 12,
    elevation: 6,
  },
  judgmentBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  judgmentBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#050507',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1.2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    gap: 12,
  },
  modalCardSuccess: {
    backgroundColor: 'rgba(15, 23, 42, 0.98)',
    borderWidth: 2,
    borderColor: '#FFE259',
  },
  modalCardScold: {
    backgroundColor: 'rgba(24, 10, 10, 0.98)',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  modalEmblem: {
    fontSize: 44,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
    fontFamily: 'serif',
    letterSpacing: 1,
  },
  modalMessage: {
    fontSize: 13,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 19,
  },
  resetCycleBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 6,
    width: '100%',
    alignItems: 'center',
  },
  resetCycleBtnText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    letterSpacing: 1,
    textAlign: 'center',
  },
  closeModalBtn: {
    paddingVertical: 8,
    marginTop: 4,
  },
  closeModalBtnText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
});
