import React from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, ScrollView, Platform, Share, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { LegendaryPath, LEGENDARY_PATHS, CycleTier, CoachArchetype, COACH_ARCHETYPES } from '@/types/onboarding';

interface HonorDiplomaModalProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  path: LegendaryPath;
  scoreAverage: number;
  adherencePct: number;
  tier: CycleTier | string;
  completionDate?: string;
  coachArchetype?: CoachArchetype;
  observations?: string[];
  recommendations?: string[];
  coachVerdict?: string;
}

export function HonorDiplomaModal({
  visible,
  onClose,
  userName,
  path,
  scoreAverage,
  adherencePct,
  tier,
  completionDate,
  coachArchetype = 'stoic_mentor',
  observations,
  recommendations,
  coachVerdict,
}: HonorDiplomaModalProps) {
  const pathInfo = LEGENDARY_PATHS[path] || LEGENDARY_PATHS.spartan;
  const coachInfo = COACH_ARCHETYPES[coachArchetype] || COACH_ARCHETYPES.stoic_mentor;
  const formattedDate = completionDate || new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Observaciones predeterminadas de élite si no vienen del motor
  const defaultObservations: string[] = [
    `🏆 **Dominio de la Voluntad**: Conquistaste el ${adherencePct}% de los días con rango de honor, superando con creces la barrera del 80% exigida por el Templo.`,
    `⚔️ **Consistencia Marcial**: Mantuviste la adhesión a la Senda del ${pathInfo.name} con un promedio de excelencia del ${scoreAverage}/100 puntos.`,
    `🛡️ **Resiliencia & Temple**: Demostraste capacidad de autocontrol y soberanía sobre los impulsos durante los 30 días ininterrumpidos del Juicio.`,
  ];

  // Recomendaciones tácticas del Coach según la Senda
  const defaultRecommendations: string[] = path === 'spartan' ? [
    '1. **Sobrecarga Progresiva Fase II**: Incrementa un 5% las cargas base en ejercicios multiarticulares (sentadilla y banca olímpica).',
    '2. **Optimización Proteica**: Asegura 2.0g a 2.2g de proteína por kg de peso corporal para consolidar la densidad miofibrilar.',
    '3. **Higiene de Sueño Innegociable**: Mantén un mínimo de 7.5 horas de descanso profundo para evitar el catabolismo del SNC.',
  ] : path === 'apollo' ? [
    '1. **Escultura Estética & V-Taper**: Mantén el enfoque en elevaciones laterales y dorsal ancho con cadencia excéntrica controlada (3-1-1).',
    '2. **Movilidad NeAT Constante**: No bajes de 10,000 pasos diarios para mantener la definición muscular sin elevar el cortisol.',
    '3. **Nutrición de Precisión**: Mantén el balance calórico ajustado a tus macros calculados para preservar masa magra.',
  ] : path === 'hoplite' ? [
    '1. **Capacidad Mitocondrial Superior**: Introduce 3 sesiones semanales de Cardio Zona 2 de 40 minutos en ayunas o post-pesas.',
    '2. **Circuitos Tácticos & Potencia**: Realiza transiciones con pausas de 45 segundos para forjar una resistencia inagotable.',
    '3. **Recuperación Activa**: Dedica 15 minutos diarios a movilidad articular de cadera y tobillos.',
  ] : [
    '1. **Calistenia Estricta & Anillas**: Perfecciona el control de palancas y dominadas con peso corporal antes de añadir lastre.',
    '2. **Examen de Conciencia Nocturno**: Dedica 5 minutos antes de dormir a vaciar el juicio en tu diario estoico.',
    '3. **Ayuno Intermitente 16/8**: Mantén la claridad mental entrenando en la ventana de mayor lucidez matutina.',
  ];

  const finalObservations = (observations && observations.length > 0) ? observations : defaultObservations;
  const finalRecommendations = (recommendations && recommendations.length > 0) ? recommendations : defaultRecommendations;
  const finalVerdict = coachVerdict || `«${userName.toUpperCase()}, has demostrado que la mente es el amo supremo del cuerpo. Tu consagración en el Día 30 es un testimonio vivo de virtud y templanza. La Fase II te espera.»`;

  const handleShareOrPrint = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    const shareText = `🏛️ DIPLOMA DE HONOR ESTOICO • SANTUARIO DE ATARAXIA\n\nPor el presente decreto del Tribunal del Olimpo, se consagra a ${userName.toUpperCase()} con el rango de ${tier.toUpperCase()} en la Senda del ${pathInfo.name.toUpperCase()}.\n\n📊 Evaluación Final del Día 30: ${scoreAverage}% de Excelencia (${adherencePct}% de Días Gobernados).\n\n🏛️ Veredicto del ${coachInfo.name}:\n${finalVerdict}\n\n⚡ Desbloqueado: Fase II - La Forja de los Titanes.\n\n«No expliques tu filosofía; encárnala en tus actos.»\nVerificado en Ataraxia: https://ataraxia-stoic.vercel.app`;

    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(shareText);
        Alert.alert('📜 Diploma Copiado', 'El texto sagrado de tu Diploma y Evaluación del Coach ha sido copiado para compartirlo.');
      }
      if (typeof window !== 'undefined' && window.print) {
        window.print();
      }
    } else {
      try {
        await Share.share({
          title: 'Diploma de Honor Estoico - Ataraxia',
          message: shareText,
        });
      } catch {}
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.diplomaContainer}>
          <ScrollView contentContainerStyle={styles.diplomaScrollContent} showsVerticalScrollIndicator={false}>
            
            {/* Marco Imperial Griego / Dorado */}
            <LinearGradient
              colors={['#1E1B18', '#0F172A', '#1A1813']}
              style={styles.diplomaParchment}
            >
              {/* Borde ornamental exterior */}
              <View style={styles.diplomaOuterBorder}>
                <View style={styles.diplomaInnerBorder}>
                  
                  {/* Esquinas ornamentadas con laureles */}
                  <ThemedText style={[styles.cornerLaurel, styles.topLeft]}>🌿</ThemedText>
                  <ThemedText style={[styles.cornerLaurel, styles.topRight]}>🌿</ThemedText>
                  <ThemedText style={[styles.cornerLaurel, styles.bottomLeft]}>🌿</ThemedText>
                  <ThemedText style={[styles.cornerLaurel, styles.bottomRight]}>🌿</ThemedText>

                  {/* Emblema & Encabezado */}
                  <View style={styles.emblemRow}>
                    <ThemedText style={styles.crownEmblem}>👑</ThemedText>
                    <ThemedText style={styles.greekMeanderHeader}>✦ 🏛️ ✦</ThemedText>
                  </View>

                  <ThemedText style={styles.diplomaSubTitle}>ACADEMIA & SANTUARIO DE ATARAXIA</ThemedText>
                  <ThemedText style={styles.diplomaMainTitle}>DIPLOMA DE HONOR ESTOICO</ThemedText>
                  <ThemedText style={styles.confermentTag}>CONSAGRACIÓN OFICIAL DEL TRIBUNAL DEL OLIMPO</ThemedText>

                  <View style={styles.goldenDivider} />

                  {/* Cuerpo del Certificado */}
                  <ThemedText style={styles.certBodyIntro}>
                    Por cuanto ha demostrado temple inquebrantable, dominio corporal y disciplina militar durante los 30 Días de la Evaluación, alcanzando el <ThemedText style={{ color: '#FFE259', fontWeight: 'bold' }}>{adherencePct}% de Días Gobernados</ThemedText> exigido por el Santuario, se confiere el presente título con honores a:
                  </ThemedText>

                  {/* Nombre del Prokopton Consagrado */}
                  <View style={styles.studentNameBox}>
                    <ThemedText style={styles.studentNameText}>{userName.toUpperCase()}</ThemedText>
                  </View>

                  {/* Rango y Senda */}
                  <View style={styles.rankBadgeBox}>
                    <ThemedText style={styles.pathLabel}>SENDA CONSAGRADA: {pathInfo.name.toUpperCase()}</ThemedText>
                    <LinearGradient
                      colors={['#D4AF37', '#FFE259', '#B45309']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.tierPillGradient}
                    >
                      <ThemedText style={styles.tierPillText}>
                        🎖️ {tier.toUpperCase()} 🎖️
                      </ThemedText>
                    </LinearGradient>
                  </View>

                  {/* Métricas de Virtud de los 30 Días */}
                  <View style={styles.metricsRow}>
                    <View style={styles.metricItem}>
                      <ThemedText style={styles.metricVal}>30 / 30</ThemedText>
                      <ThemedText style={styles.metricLbl}>Días Evaluados</ThemedText>
                    </View>
                    <View style={styles.metricItem}>
                      <ThemedText style={styles.metricVal}>{adherencePct}%</ThemedText>
                      <ThemedText style={styles.metricLbl}>Días Gobernados (80%+)</ThemedText>
                    </View>
                    <View style={styles.metricItem}>
                      <ThemedText style={styles.metricVal}>{scoreAverage}%</ThemedText>
                      <ThemedText style={styles.metricLbl}>Excelencia Media</ThemedText>
                    </View>
                  </View>

                  {/* ───────────────────────────────────────────────────────────── */}
                  {/* SECCIÓN DEDICADA: EVALUACIÓN FINAL DEL COACH (DÍA 30) */}
                  {/* ───────────────────────────────────────────────────────────── */}
                  <View style={styles.coachEvaluationCard}>
                    <View style={styles.coachEvalHeader}>
                      <ThemedText style={{ fontSize: 20 }}>{coachInfo.icon}</ThemedText>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={styles.coachEvalTag}>EVALUACIÓN FINAL DEL DÍA 30</ThemedText>
                        <ThemedText style={styles.coachEvalTitle}>{coachInfo.name.toUpperCase()}</ThemedText>
                      </View>
                      <View style={styles.coachEvalBadge}>
                        <ThemedText style={styles.coachEvalBadgeText}>APROBADO</ThemedText>
                      </View>
                    </View>

                    {/* Veredicto del Coach */}
                    <View style={styles.verdictQuoteBox}>
                      <ThemedText style={styles.verdictQuoteText}>{finalVerdict}</ThemedText>
                    </View>

                    {/* Observaciones del Coach */}
                    <View style={styles.evalSectionBox}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Ionicons name="clipboard-outline" size={14} color="#10B981" />
                        <ThemedText style={styles.evalSectionTitle}>OBSERVACIONES DEL DESEMPEÑO:</ThemedText>
                      </View>
                      {finalObservations.map((obs, idx) => (
                        <View key={idx} style={styles.obsItemRow}>
                          <ThemedText style={styles.obsBullet}>•</ThemedText>
                          <ThemedText style={styles.obsText}>{obs.replace(/\*\*/g, '')}</ThemedText>
                        </View>
                      ))}
                    </View>

                    {/* Recomendaciones Tácticas para la Siguiente Etapa */}
                    <View style={styles.evalSectionBox}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Ionicons name="bulb-outline" size={14} color="#38BDF8" />
                        <ThemedText style={[styles.evalSectionTitle, { color: '#38BDF8' }]}>
                          RECOMENDACIONES PARA LA FASE SIGUIENTE:
                        </ThemedText>
                      </View>
                      {finalRecommendations.map((rec, idx) => (
                        <View key={idx} style={styles.recItemRow}>
                          <ThemedText style={styles.recText}>{rec.replace(/\*\*/g, '')}</ThemedText>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Sello de Cera Dorado */}
                  <View style={styles.waxSealContainer}>
                    <LinearGradient
                      colors={['#FFE259', '#D4AF37', '#92400E']}
                      style={styles.waxSealCircle}
                    >
                      <ThemedText style={styles.waxSealIcon}>⚡</ThemedText>
                      <ThemedText style={styles.waxSealText}>SELLO SAGRADO</ThemedText>
                    </LinearGradient>
                  </View>

                  {/* Distinción del Próximo Nivel (Fase II) */}
                  <View style={styles.nextLevelTeaserBox}>
                    <ThemedText style={styles.nextLevelBadge}>⚡ DISTINCIÓN PERMANENTE OTORGADA</ThemedText>
                    <ThemedText style={styles.nextLevelTitle}>FASE II: LA FORJA DE LOS TITANES</ThemedText>
                    <ThemedText style={styles.nextLevelStatus}>🔒 ACCESO PRIORITARIO • (COMING SOON)</ThemedText>
                    <ThemedText style={styles.nextLevelDesc}>
                      Has demostrado estar por encima del promedio mortal al superar el 80% de días gobernados en los 30 días. Tu perfil ha sido consagrado para recibir la próxima gran actualización del Templo.
                    </ThemedText>
                  </View>

                  {/* Firmas de los Maestros */}
                  <View style={styles.signaturesRow}>
                    <View style={styles.sigCol}>
                      <ThemedText style={styles.sigScript}>Marcus Aurelius</ThemedText>
                      <View style={styles.sigLine} />
                      <ThemedText style={styles.sigRole}>Emperador Filósofo</ThemedText>
                    </View>
                    <View style={styles.sigCol}>
                      <ThemedText style={styles.sigScript}>Epictetus Hierapolis</ThemedText>
                      <View style={styles.sigLine} />
                      <ThemedText style={styles.sigRole}>Maestro de la Virtud</ThemedText>
                    </View>
                    <View style={styles.sigCol}>
                      <ThemedText style={styles.sigScript}>L. Annaeus Seneca</ThemedText>
                      <View style={styles.sigLine} />
                      <ThemedText style={styles.sigRole}>Consejero de Sabiduría</ThemedText>
                    </View>
                  </View>

                  <ThemedText style={styles.dateStamp}>
                    Consagrado oficialmente en el Santuario el {formattedDate}
                  </ThemedText>
                </View>
              </View>
            </LinearGradient>

            {/* Botones de Acción */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={handleShareOrPrint}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#D4AF37', '#FFE259', '#B45309']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.shareBtnGradient}
                >
                  <Ionicons name="share-social" size={16} color="#050507" />
                  <ThemedText style={styles.shareBtnText}>COMPARTIR / IMPRIMIR DIPLOMA</ThemedText>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <ThemedText style={styles.closeBtnText}>CERRAR DIPLOMA</ThemedText>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 4, 8, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  diplomaContainer: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '96%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  diplomaScrollContent: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  diplomaParchment: {
    width: '100%',
    borderRadius: 20,
    padding: 10,
    borderWidth: 2,
    borderColor: '#FFE259',
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  diplomaOuterBorder: {
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.6)',
    borderRadius: 16,
    padding: 6,
    borderStyle: 'dashed',
  },
  diplomaInnerBorder: {
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    backgroundColor: 'rgba(5, 5, 8, 0.85)',
    position: 'relative',
  },
  cornerLaurel: {
    position: 'absolute',
    fontSize: 20,
    opacity: 0.8,
  },
  topLeft: { top: 6, left: 8 },
  topRight: { top: 6, right: 8 },
  bottomLeft: { bottom: 6, left: 8 },
  bottomRight: { bottom: 6, right: 8 },
  emblemRow: {
    alignItems: 'center',
    marginBottom: 4,
  },
  crownEmblem: {
    fontSize: 34,
  },
  greekMeanderHeader: {
    color: '#FFE259',
    fontSize: 12,
    letterSpacing: 4,
    marginTop: 2,
  },
  diplomaSubTitle: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#D4AF37',
    letterSpacing: 2,
    fontWeight: 'bold',
    marginTop: 6,
    textAlign: 'center',
  },
  diplomaMainTitle: {
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'serif',
    color: '#FFE259',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginVertical: 4,
  },
  confermentTag: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    color: '#94A3B8',
    letterSpacing: 1,
    textAlign: 'center',
  },
  goldenDivider: {
    width: '75%',
    height: 1.5,
    backgroundColor: '#D4AF37',
    marginVertical: 12,
    opacity: 0.6,
  },
  certBodyIntro: {
    fontSize: 11,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 17,
    fontStyle: 'italic',
    paddingHorizontal: 12,
  },
  studentNameBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderBottomWidth: 2,
    borderBottomColor: '#FFE259',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 12,
    width: '90%',
    alignItems: 'center',
  },
  studentNameText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'serif',
    letterSpacing: 2,
    textAlign: 'center',
  },
  rankBadgeBox: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  pathLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  tierPillGradient: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  tierPillText: {
    color: '#050507',
    fontWeight: '900',
    fontSize: 12,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    marginVertical: 8,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'monospace',
  },
  metricLbl: {
    fontSize: 8.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  waxSealContainer: {
    marginVertical: 8,
    alignItems: 'center',
  },
  waxSealCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  waxSealIcon: {
    fontSize: 18,
    color: '#050507',
  },
  waxSealText: {
    fontSize: 6.5,
    fontWeight: '900',
    color: '#050507',
    fontFamily: 'monospace',
  },
  nextLevelTeaserBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  nextLevelBadge: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#38BDF8',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  nextLevelTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'serif',
  },
  nextLevelStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F59E0B',
    fontFamily: 'monospace',
  },
  nextLevelDesc: {
    fontSize: 9.5,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 2,
  },
  signaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
  },
  sigCol: {
    alignItems: 'center',
    flex: 1,
  },
  sigScript: {
    fontSize: 10,
    fontFamily: 'serif',
    fontStyle: 'italic',
    color: '#FFE259',
  },
  sigLine: {
    width: 60,
    height: 1,
    backgroundColor: '#D4AF37',
    marginVertical: 3,
  },
  sigRole: {
    fontSize: 7.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  dateStamp: {
    fontSize: 9,
    color: '#64748B',
    fontFamily: 'monospace',
    marginTop: 12,
  },
  actionsRow: {
    width: '100%',
    gap: 8,
    marginTop: 14,
  },
  shareBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  shareBtnGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  shareBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#050507',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  closeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  coachEvaluationCard: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    padding: 12,
    marginVertical: 10,
    gap: 8,
  },
  coachEvalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 6,
  },
  coachEvalTag: {
    fontSize: 8,
    fontFamily: 'monospace',
    color: '#D4AF37',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  coachEvalTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'serif',
  },
  coachEvalBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  coachEvalBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#34D399',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  verdictQuoteBox: {
    backgroundColor: 'rgba(5, 5, 8, 0.7)',
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FFE259',
    marginVertical: 2,
  },
  verdictQuoteText: {
    fontSize: 10,
    color: '#FFE259',
    fontStyle: 'italic',
    lineHeight: 14,
  },
  evalSectionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  evalSectionTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#10B981',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  obsItemRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 2,
  },
  obsBullet: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: 'bold',
  },
  obsText: {
    fontSize: 9.5,
    color: '#E2E8F0',
    lineHeight: 14,
    flex: 1,
  },
  recItemRow: {
    marginVertical: 3,
  },
  recText: {
    fontSize: 9.5,
    color: '#E2E8F0',
    lineHeight: 14,
  },
});
