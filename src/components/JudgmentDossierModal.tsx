import React from 'react';
import { View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

interface JudgmentDossierModalProps {
  visible: boolean;
  onClose: () => void;
  judgmentResult: any;
  activeResolutionTab: 'verdict' | 'feedback' | 'audit';
  setActiveResolutionTab: (tab: 'verdict' | 'feedback' | 'audit') => void;
  cycle: any;
  handleCopyDecree: () => void;
  copiedDecree: boolean;
  adherencePercent: number;
  onOpenDiploma: () => void;
  onResetCycle: () => void;
  styles: any;
}

export function JudgmentDossierModal({
  visible,
  onClose,
  judgmentResult,
  activeResolutionTab,
  setActiveResolutionTab,
  cycle,
  handleCopyDecree,
  copiedDecree,
  adherencePercent,
  onOpenDiploma,
  onResetCycle,
  styles,
}: JudgmentDossierModalProps) {
  const res = judgmentResult?.resolution || judgmentResult;
  const isPromoted = Boolean(judgmentResult?.promoted || res?.promoted);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={[
          styles.dossierModalCard,
          isPromoted ? styles.modalCardSuccess : styles.modalCardScold
        ]}>
          {/* Cabecera del Juicio */}
          <View style={styles.dossierHeaderRow}>
            <ThemedText style={styles.modalEmblem}>
              {isPromoted ? '👑' : '💀'}
            </ThemedText>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.dossierHeaderTag}>TRIBUNAL DEL OLIMPO • RESOLUCIÓN DE 30 DÍAS</ThemedText>
              <ThemedText style={[
                styles.dossierMainTitle,
                isPromoted ? { color: '#FFE259' } : { color: '#EF4444' }
              ]}>
                {judgmentResult?.title || res?.title || 'Juicio del Consejo'}
              </ThemedText>
            </View>
          </View>

          {/* Selector de Pestañas de la Resolución */}
          <View style={styles.dossierTabsRow}>
            <TouchableOpacity
              style={[styles.dossierTabBtn, activeResolutionTab === 'verdict' && styles.dossierTabBtnActive]}
              onPress={() => setActiveResolutionTab('verdict')}
            >
              <ThemedText style={[styles.dossierTabBtnText, activeResolutionTab === 'verdict' && styles.dossierTabBtnTextActive]}>
                📜 Veredicto
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dossierTabBtn, activeResolutionTab === 'feedback' && styles.dossierTabBtnActive]}
              onPress={() => setActiveResolutionTab('feedback')}
            >
              <ThemedText style={[styles.dossierTabBtnText, activeResolutionTab === 'feedback' && styles.dossierTabBtnTextActive]}>
                🎖️ Elogios & Reprensión
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dossierTabBtn, activeResolutionTab === 'audit' && styles.dossierTabBtnActive]}
              onPress={() => setActiveResolutionTab('audit')}
            >
              <ThemedText style={[styles.dossierTabBtnText, activeResolutionTab === 'audit' && styles.dossierTabBtnTextActive]}>
                📊 30 Días (Auditoría)
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Contenido según Pestaña Activa con Scroll */}
          <ScrollView
            style={styles.dossierContentScroll}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
            overScrollMode="never"
          >
            {activeResolutionTab === 'verdict' && (
              <View style={styles.dossierTabContent}>
                <View style={styles.rankAuditCard}>
                  <ThemedText style={styles.rankAuditSub}>RANGO SAGRADO OTORGADO</ThemedText>
                  <ThemedText style={styles.rankAuditTitle}>
                    {res?.tierAwarded || cycle.tier}
                  </ThemedText>
                  <View style={styles.rankStatsGrid}>
                    <View style={styles.rankStatBox}>
                      <ThemedText style={styles.rankStatVal}>{res?.totalScoreAverage ?? cycle.averageScore}/100</ThemedText>
                      <ThemedText style={styles.rankStatLbl}>Promedio Disciplina</ThemedText>
                    </View>
                    <View style={styles.rankStatBox}>
                      <ThemedText style={[styles.rankStatVal, { color: '#10B981' }]}>{res?.victoriousDaysCount ?? 0}</ThemedText>
                      <ThemedText style={styles.rankStatLbl}>Días Dignos</ThemedText>
                    </View>
                    <View style={styles.rankStatBox}>
                      <ThemedText style={[styles.rankStatVal, { color: '#EF4444' }]}>{res?.failedDaysCount ?? 0}</ThemedText>
                      <ThemedText style={styles.rankStatLbl}>Días en Deuda</ThemedText>
                    </View>
                  </View>
                </View>

                <View style={styles.directivesSection}>
                  <ThemedText style={styles.directivesTitle}>🔮 DIRECTIVAS DEL MENTOR (PRÓXIMO CICLO)</ThemedText>
                  {res?.nextCycleDirectives?.map((d: string, i: number) => (
                    <View key={i} style={styles.directiveCard}>
                      <ThemedText style={styles.directiveText}>{d}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {activeResolutionTab === 'feedback' && (
              <View style={styles.dossierTabContent}>
                <ThemedText style={styles.feedbackSectionHeader}>🎖️ FELICITACIONES & MÉRITOS REALES</ThemedText>
                {res?.praises?.map((p: string, i: number) => (
                  <View key={i} style={styles.praiseCard}>
                    <ThemedText style={styles.praiseText}>{p}</ThemedText>
                  </View>
                ))}

                <ThemedText style={[styles.feedbackSectionHeader, { color: '#EF4444', marginTop: Spacing.four }]}>
                  💀 LLAMADAS DE ATENCIÓN & MEDIOCRIDAD
                </ThemedText>
                {res?.scoldings?.map((s: string, i: number) => (
                  <View key={i} style={styles.scoldCard}>
                    <ThemedText style={styles.scoldText}>{s}</ThemedText>
                  </View>
                ))}

                {res?.pillarAdherence && (
                  <View style={styles.pillarAdherenceCard}>
                    <ThemedText style={styles.pillarAdherenceTitle}>📊 BALANCE DE PILARES (30 DÍAS)</ThemedText>
                    <ThemedText style={styles.pillarAdherenceLine}>⚔️ Entrenamiento: {res.pillarAdherence.trainingPct}%</ThemedText>
                    <ThemedText style={styles.pillarAdherenceLine}>👟 Pasos & Movilidad: {res.pillarAdherence.stepsPct}%</ThemedText>
                    <ThemedText style={styles.pillarAdherenceLine}>🍽️ Nutrición & Macros: {res.pillarAdherence.nutritionPct}%</ThemedText>
                    <ThemedText style={styles.pillarAdherenceLine}>🌙 Calidad de Sueño: {res.pillarAdherence.sleepPct}%</ThemedText>
                    <ThemedText style={styles.pillarAdherenceLine}>📜 Lectura Estoica: {res.pillarAdherence.stoicReadingPct}%</ThemedText>
                    <ThemedText style={styles.pillarAdherenceLine}>🫀 Frecuencia Cardíaca: {res.pillarAdherence.heartRatePct}%</ThemedText>
                    <ThemedText style={styles.pillarAdherenceLine}>🏛️ Reporte al Coach: {res.pillarAdherence.coachCheckInPct}%</ThemedText>
                  </View>
                )}
              </View>
            )}

            {activeResolutionTab === 'audit' && (
              <View style={styles.dossierTabContent}>
                <ThemedText style={styles.auditIntroText}>
                  Registro sagrado e inmutable de los 30 días de tu Senda:
                </ThemedText>
                {res?.dayAudits?.map((audit: any) => (
                  <View
                    key={audit.day}
                    style={[
                      styles.dayAuditRow,
                      audit.score >= 75 ? styles.dayAuditRowSuccess : styles.dayAuditRowFailed
                    ]}
                  >
                    <View style={styles.dayAuditTop}>
                      <ThemedText style={styles.dayAuditDayTitle}>DÍA {audit.day} • {audit.date}</ThemedText>
                      <ThemedText style={[
                        styles.dayAuditScoreBadge,
                        audit.score >= 90 ? { color: '#FFE259' } : audit.score >= 75 ? { color: '#10B981' } : { color: '#EF4444' }
                      ]}>
                        {audit.score >= 90 ? '👑' : audit.score >= 75 ? '⚔️' : '💀'} {audit.score}/100
                      </ThemedText>
                    </View>

                    <View style={styles.dayAuditPillarsRow}>
                      <ThemedText style={[styles.dayAuditPillarTag, audit.pillars?.training && styles.dayAuditPillarTagActive]}>⚔️</ThemedText>
                      <ThemedText style={[styles.dayAuditPillarTag, audit.pillars?.steps && styles.dayAuditPillarTagActive]}>👟</ThemedText>
                      <ThemedText style={[styles.dayAuditPillarTag, audit.pillars?.nutrition && styles.dayAuditPillarTagActive]}>🍽️</ThemedText>
                      <ThemedText style={[styles.dayAuditPillarTag, audit.pillars?.sleep && styles.dayAuditPillarTagActive]}>🌙</ThemedText>
                      <ThemedText style={[styles.dayAuditPillarTag, audit.pillars?.stoicChallenge && styles.dayAuditPillarTagActive]}>📜</ThemedText>
                      <ThemedText style={[styles.dayAuditPillarTag, audit.pillars?.heartRate && styles.dayAuditPillarTagActive]}>🫀</ThemedText>
                      <ThemedText style={[styles.dayAuditPillarTag, audit.pillars?.coachCheckIn && styles.dayAuditPillarTagActive]}>🏛️</ThemedText>
                      <ThemedText style={styles.dayAuditPassedCount}>({audit.passedPillarsCount || 0}/7)</ThemedText>
                    </View>

                    <ThemedText style={styles.dayAuditVerdictText}>{audit.verdict}</ThemedText>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Acciones del Modal */}
          <View style={styles.dossierActionsRow}>
            <TouchableOpacity
              style={styles.copyDecreeBtn}
              onPress={handleCopyDecree}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.copyDecreeBtnText}>
                {copiedDecree ? '✅ COPIADO AL PORTAPAPELES' : '📋 COPIAR RESOLUCIÓN COMPLETA'}
              </ThemedText>
            </TouchableOpacity>

            {(isPromoted || (res?.adherencePct ?? 0) >= 80 || adherencePercent >= 80) && (
              <TouchableOpacity
                style={styles.claimDiplomaBtn}
                onPress={onOpenDiploma}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#D4AF37', '#FFE259', '#B45309']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.claimDiplomaGradient}
                >
                  <Ionicons name="ribbon" size={16} color="#050507" />
                  <ThemedText style={styles.claimDiplomaText}>
                    RECLAMAR DIPLOMA
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.closeDossierBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.closeDossierBtnText}>CERRAR</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
