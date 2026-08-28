import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PearlElectricBackground } from '@/components/PearlElectricBackground';
import { GreekParchmentPact } from '@/components/GreekParchmentPact';
import { lockTempleAccess } from '@/components/TempleAccessGate';
import { Spacing, MaxContentWidth } from '@/constants/theme';

type SectionTab = 'faq' | 'privacy' | 'manifesto' | 'terms' | 'contact';

interface FaqItem {
  q: string;
  a: string;
  category: string;
}

const FAQ_LIST: FaqItem[] = [
  {
    category: 'SISTEMA Y SENDAS',
    q: '¿Cómo funciona el Ciclo de 30 Días y las 4 Sendas Legendarias?',
    a: 'Ataraxia estructura tu transformación en ciclos de 30 días inmutables. Puedes elegir entre 4 Sendas: Espartano (Hipertrofia y Fuerza), Hoplita (Resistencia y Cardio Zona 2), Apolo (Calistenia y Fuerza Relativa) o Filósofo Guerrero (Equilibrio Híbrido). Cada día registra tu cumplimiento en 4 pilares: Entrenamiento, Nutrición, Hidratación y Mente.',
  },
  {
    category: 'TELEMETRÍA Y SENSORES',
    q: '¿Cómo funciona el Podómetro 24/7 y la medición de Ritmo Cardíaco?',
    a: 'El podómetro se conecta a los acelerómetros del dispositivo con filtros de gravedad y protección anti-vehículo para registrar únicamente pasos biomecánicos reales. La medición de ritmo cardíaco (BPM) utiliza fotopletismografía óptica (PPG) mediante el sensor de cámara trasera y flash para detectar micro-pulsaciones vasculares.',
  },
  {
    category: 'DISCIPLINA ESTOICA',
    q: '¿Qué es el Protocolo Legionario de 3 Avisos con el Mentor IA?',
    a: 'El Mentor de Ataraxia sigue la máxima militar romana: «Semel nefas, bis stultitia, ter poena». El primer desvío o pregunta banal recibe una advertencia (Monitio); el segundo, una censura severa (Castigatio); el tercer desacato consecutivo (Supplicium) resulta en la expulsión y purga de cuenta por falta de temple.',
  },
  {
    category: 'ACCESO Y SEGURIDAD',
    q: '¿Por qué la app tiene acceso restringido mediante Llave Maestra?',
    a: 'Esta instancia de Ataraxia es un templo privado diseñado para un círculo cerrado de guardianes. Solo quienes posean la Llave Maestra (PIN o enlace autorizado) pueden ingresar, evitando accesos públicos no autorizados.',
  },
  {
    category: 'INSTALACIÓN',
    q: '¿Cómo instalo Ataraxia en la pantalla de inicio de mi móvil?',
    a: 'En Android (Chrome): pulsa el menú de 3 puntos ⋮ y selecciona "Instalar aplicación" o "Añadir a la pantalla principal". En iPhone (Safari): pulsa el botón Compartir 📤 y elige "Añadir a la pantalla de inicio". Se instalará con su icono dorado oficial en alta resolución.',
  },
];

export default function AboutScreen() {
  const [activeTab, setActiveTab] = useState<SectionTab>('manifesto');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [showParchmentModal, setShowParchmentModal] = useState<boolean>(false);

  const toggleFaq = (index: number) => {
    setExpandedFaq((prev) => (prev === index ? null : index));
  };

  const handleOpenEmail = () => {
    const subject = encodeURIComponent('Consulta sobre Templo Ataraxia');
    const body = encodeURIComponent('Saludos Guardianes de Ataraxia,\n\n');
    Linking.openURL(`mailto:soporte.ataraxia@gmail.com?subject=${subject}&body=${body}`).catch(() => {
      Alert.alert('Contacto Oficial', 'Puedes escribirnos directamente a: soporte.ataraxia@gmail.com');
    });
  };

  return (
    <PearlElectricBackground glowColor="rgba(212, 175, 55, 0.22)">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. HERO HEADER MONUMENTAL */}
          <View style={styles.heroCard}>
            <View style={styles.emblemContainer}>
              {Platform.OS === 'web' ? (
                <img
                  src="/zeus_emblem.png"
                  alt="Emblema de Zeus"
                  width={110}
                  height={110}
                  style={{
                    width: '110px',
                    height: '110px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 16px rgba(255, 226, 89, 0.50))',
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                />
              ) : (
                <View style={styles.nativeEmblemRing}>
                  <Ionicons name="shield-checkmark" size={48} color="#FFE259" />
                </View>
              )}
            </View>

            <View style={styles.heroTextGroup}>
              <View style={styles.versionBadge}>
                <ThemedText style={styles.versionBadgeText}>EDICIÓN OFICIAL • v2.4.0 (2026)</ThemedText>
              </View>
              <View style={{ marginVertical: 6, alignItems: 'center' }}>
                {Platform.OS === 'web' ? (
                  <img
                    src="/ataraxia_gold_title_banner.png"
                    alt="ATARAXIA"
                    width={230}
                    height={56}
                    style={{
                      width: '230px',
                      height: '56px',
                      maxWidth: '85vw',
                      objectFit: 'contain',
                      display: 'block',
                      filter: 'drop-shadow(0 0 16px rgba(255, 226, 89, 0.65))',
                      userSelect: 'none',
                    }}
                  />
                ) : (
                  <Image
                    source={require('../../assets/images/ataraxia_gold_title_banner.png')}
                    style={{ width: 230, height: 56 }}
                    resizeMode="contain"
                  />
                )}
              </View>
              <ThemedText style={styles.heroSubtitle}>TEMPLO DEL AUTODOMINIO & FITNESS ESTOICO</ThemedText>
              <ThemedText style={styles.heroMotto}>
                &ldquo;Visto desde arriba, todo pesa menos.&rdquo;
              </ThemedText>
            </View>
          </View>

          {/* 2. BARRA SELECTORA DE SECCIONES (TABS) */}
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
              <TouchableOpacity
                style={[styles.tabChip, activeTab === 'manifesto' && styles.tabChipActive]}
                onPress={() => setActiveTab('manifesto')}
                activeOpacity={0.8}
              >
                <Ionicons name="book-outline" size={14} color={activeTab === 'manifesto' ? '#050507' : '#FFE259'} />
                <ThemedText style={[styles.tabChipText, activeTab === 'manifesto' && styles.tabChipTextActive]}>
                  Filosofía
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabChip, activeTab === 'faq' && styles.tabChipActive]}
                onPress={() => setActiveTab('faq')}
                activeOpacity={0.8}
              >
                <Ionicons name="help-circle-outline" size={14} color={activeTab === 'faq' ? '#050507' : '#FFE259'} />
                <ThemedText style={[styles.tabChipText, activeTab === 'faq' && styles.tabChipTextActive]}>
                  Preguntas FAQ
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabChip, activeTab === 'privacy' && styles.tabChipActive]}
                onPress={() => setActiveTab('privacy')}
                activeOpacity={0.8}
              >
                <Ionicons name="shield-checkmark-outline" size={14} color={activeTab === 'privacy' ? '#050507' : '#FFE259'} />
                <ThemedText style={[styles.tabChipText, activeTab === 'privacy' && styles.tabChipTextActive]}>
                  Privacidad
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabChip, activeTab === 'terms' && styles.tabChipActive]}
                onPress={() => setActiveTab('terms')}
                activeOpacity={0.8}
              >
                <Ionicons name="document-text-outline" size={14} color={activeTab === 'terms' ? '#050507' : '#FFE259'} />
                <ThemedText style={[styles.tabChipText, activeTab === 'terms' && styles.tabChipTextActive]}>
                  Términos
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabChip, activeTab === 'contact' && styles.tabChipActive]}
                onPress={() => setActiveTab('contact')}
                activeOpacity={0.8}
              >
                <Ionicons name="mail-outline" size={14} color={activeTab === 'contact' ? '#050507' : '#FFE259'} />
                <ThemedText style={[styles.tabChipText, activeTab === 'contact' && styles.tabChipTextActive]}>
                  Contacto
                </ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* 3. CONTENIDO SEGÚN LA PESTAÑA SELECCIONADA */}

          {/* A. MANIFIESTO & FILOSOFÍA */}
          {activeTab === 'manifesto' && (
            <ThemedView style={styles.sectionCard}>
              <View style={styles.sectionCardHeader}>
                <Ionicons name="flame-outline" size={18} color="#FFE259" />
                <ThemedText style={styles.sectionCardTitle}>MANIFIESTO DEL TEMPLO</ThemedText>
              </View>

              <ThemedText style={styles.paragraph}>
                <ThemedText style={styles.boldText}>Ataraxia</ThemedText> (del griego <ThemedText style={styles.italicText}>ἀταραξία</ThemedText>, &ldquo;imperturbabilidad&rdquo;) no es una simple aplicación de registro deportivo; es un santuario digital concebido para forjar la unidad indivisible entre el vigor físico y la serenidad del alma.
              </ThemedText>

              <ThemedText style={styles.paragraph}>
                Inspirada en las enseñanzas inmortales de <ThemedText style={styles.goldText}>Marco Aurelio</ThemedText>, <ThemedText style={styles.goldText}>Séneca</ThemedText> y <ThemedText style={styles.goldText}>Epicteto</ThemedText>, Ataraxia rechaza la vanidad efímera del fitness comercial. Aquí el entrenamiento de fuerza es una herramienta de autodominio y el sufrimiento físico es el crisol donde se templa la voluntad.
              </ThemedText>

              {/* Los 4 Pilares Inquebrantables */}
              <View style={styles.pillarsBox}>
                <ThemedText style={styles.pillarsBoxTitle}>LOS 4 PILARES SAGRADOS:</ThemedText>
                <View style={styles.pillarItem}>
                  <ThemedText style={styles.pillarBullet}>⚔️</ThemedText>
                  <ThemedText style={styles.pillarText}><ThemedText style={styles.boldText}>Fuerza Implacable:</ThemedText> Sobrecarga progresiva, disciplina en el gimnasio y resistencia al dolor.</ThemedText>
                </View>
                <View style={styles.pillarItem}>
                  <ThemedText style={styles.pillarBullet}>🥗</ThemedText>
                  <ThemedText style={styles.pillarText}><ThemedText style={styles.boldText}>Nutrición Consciente:</ThemedText> Alimentación limpia para el rendimiento, sin gula ni excesos.</ThemedText>
                </View>
                <View style={styles.pillarItem}>
                  <ThemedText style={styles.pillarBullet}>💧</ThemedText>
                  <ThemedText style={styles.pillarText}><ThemedText style={styles.boldText}>Pureza & Hidratación:</ThemedText> Hidratación celular constante y desintoxicación.</ThemedText>
                </View>
                <View style={styles.pillarItem}>
                  <ThemedText style={styles.pillarBullet}>🧘‍♂️</ThemedText>
                  <ThemedText style={styles.pillarText}><ThemedText style={styles.boldText}>Ataraxia Mental:</ThemedText> Memento Mori, examen de conciencia nocturno y juicio imperturbable.</ThemedText>
                </View>
              </View>

              <TouchableOpacity
                style={styles.actionPillButton}
                onPress={() => setShowParchmentModal(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="document-text-outline" size={16} color="#050507" />
                <ThemedText style={styles.actionPillButtonText}>RELEER PACTO DEL JURAMENTO</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}

          {/* B. PREGUNTAS FRECUENTES (FAQ) */}
          {activeTab === 'faq' && (
            <View style={{ gap: 10 }}>
              {FAQ_LIST.map((item, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <ThemedView key={idx} style={styles.faqCard}>
                    <TouchableOpacity
                      style={styles.faqHeaderRow}
                      onPress={() => toggleFaq(idx)}
                      activeOpacity={0.8}
                    >
                      <View style={{ flex: 1, gap: 4 }}>
                        <ThemedText style={styles.faqCategory}>{item.category}</ThemedText>
                        <ThemedText style={styles.faqQuestion}>{item.q}</ThemedText>
                      </View>
                      <Ionicons
                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color="#FFE259"
                      />
                    </TouchableOpacity>

                    {isOpen && (
                      <View style={styles.faqAnswerBox}>
                        <ThemedText style={styles.faqAnswerText}>{item.a}</ThemedText>
                      </View>
                    )}
                  </ThemedView>
                );
              })}
            </View>
          )}

          {/* C. POLÍTICA DE PRIVACIDAD & SEGURIDAD ZERO-LEAKAGE */}
          {activeTab === 'privacy' && (
            <ThemedView style={styles.sectionCard}>
              <View style={styles.sectionCardHeader}>
                <Ionicons name="lock-closed-outline" size={18} color="#10B981" />
                <ThemedText style={[styles.sectionCardTitle, { color: '#34D399' }]}>
                  POLÍTICA DE PRIVACIDAD & ZERO-LEAKAGE
                </ThemedText>
              </View>

              <ThemedText style={styles.paragraph}>
                En Ataraxia nos tomamos la privacidad como un principio estoico sagrado de honor y respeto.
              </ThemedText>

              <View style={styles.privacyFeatureRow}>
                <Ionicons name="shield-outline" size={20} color="#FFE259" />
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.featureTitle}>Arquitectura Offline-First</ThemedText>
                  <ThemedText style={styles.featureDesc}>
                    Tus métricas de pasos, calorías, entrenamientos y diario se almacenan localmente en tu dispositivo mediante SafeStorage. La app funciona al 100% sin conexión a internet.
                  </ThemedText>
                </View>
              </View>

              <View style={styles.privacyFeatureRow}>
                <Ionicons name="eye-off-outline" size={20} color="#FFE259" />
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.featureTitle}>Cero Venta o Rastreo de Datos</ThemedText>
                  <ThemedText style={styles.featureDesc}>
                    No vendemos, compartimos ni comercializamos tus datos biométricos, peso, fotos o registros con anunciantes ni terceros.
                  </ThemedText>
                </View>
              </View>

              <View style={styles.privacyFeatureRow}>
                <Ionicons name="finger-print-outline" size={20} color="#FFE259" />
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.featureTitle}>Fotografía de Escultura Privada</ThemedText>
                  <ThemedText style={styles.featureDesc}>
                    Tus fotografías de progreso corporal se procesan y comparan exclusivamente en tu propio dispositivo para calcular tu evolución física.
                  </ThemedText>
                </View>
              </View>
            </ThemedView>
          )}

          {/* D. TÉRMINOS & SALUD */}
          {activeTab === 'terms' && (
            <ThemedView style={styles.sectionCard}>
              <View style={styles.sectionCardHeader}>
                <Ionicons name="fitness-outline" size={18} color="#F59E0B" />
                <ThemedText style={[styles.sectionCardTitle, { color: '#FBBF24' }]}>
                  TÉRMINOS DE SERVICIO & DESCARGO MÉDICO
                </ThemedText>
              </View>

              <ThemedText style={styles.paragraph}>
                <ThemedText style={styles.boldText}>Descargo de Responsabilidad Médica:</ThemedText> Ataraxia proporciona programas de entrenamiento, guías nutricionales y cálculos de rendimiento con fines educativos y de acondicionamiento físico. No constituye asesoramiento médico ni sustituye el diagnóstico de profesionales de la salud.
              </ThemedText>

              <ThemedText style={styles.paragraph}>
                <ThemedText style={styles.boldText}>Responsabilidad Personal:</ThemedText> Como filósofo guerrero, eres el único responsable de conocer tus límites físicos, ejecutar la técnica correcta en cada levantamiento y consultar a un médico antes de iniciar regímenes de alta intensidad.
              </ThemedText>

              <ThemedText style={styles.paragraph}>
                <ThemedText style={styles.boldText}>Propiedad Intelectual:</ThemedText> Toda la iconografía sagrada de Zeus, los algoritmos de mentoría estoica y la identidad gráfica están protegidos como activos exclusivos del ecosistema.
              </ThemedText>
            </ThemedView>
          )}

          {/* E. CONTACTO & SOPORTE */}
          {activeTab === 'contact' && (
            <ThemedView style={styles.sectionCard}>
              <View style={styles.sectionCardHeader}>
                <Ionicons name="chatbubbles-outline" size={18} color="#60A5FA" />
                <ThemedText style={[styles.sectionCardTitle, { color: '#93C5FD' }]}>
                  CONTACTO & SOPORTE DE GUARDIANES
                </ThemedText>
              </View>

              <ThemedText style={styles.paragraph}>
                ¿Tienes alguna sugerencia de mejora, reporte técnico o consulta sobre tu senda? Escríbenos directamente:
              </ThemedText>

              <TouchableOpacity
                style={styles.contactEmailCard}
                onPress={handleOpenEmail}
                activeOpacity={0.8}
              >
                <Ionicons name="mail" size={24} color="#FFE259" />
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.contactEmailLabel}>Correo Oficial de Soporte</ThemedText>
                  <ThemedText style={styles.contactEmailText}>soporte.ataraxia@gmail.com</ThemedText>
                </View>
                <Ionicons name="open-outline" size={18} color="#D4AF37" />
              </TouchableOpacity>

              <View style={styles.infoRow}>
                <Ionicons name="globe-outline" size={16} color="#94A3B8" />
                <ThemedText style={styles.infoRowText}>Instancia de Producción: ataraxia-stoic.vercel.app</ThemedText>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="code-slash-outline" size={16} color="#94A3B8" />
                <ThemedText style={styles.infoRowText}>Desarrollado con Expo, React Native & IA Multimodal</ThemedText>
              </View>
            </ThemedView>
          )}

          {/* 4. BOTÓN DE SEGURIDAD DEL GUARDIÁN */}
          <ThemedView style={[styles.sectionCard, { borderColor: 'rgba(212, 175, 55, 0.3)', marginTop: 6 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.securityTitle}>SESIÓN DE SEGURIDAD</ThemedText>
                <ThemedText style={styles.securitySub}>Bloquea el santuario en este dispositivo si lo deseas.</ThemedText>
              </View>

              <TouchableOpacity
                style={styles.lockButtonSmall}
                onPress={() => {
                  Alert.alert(
                    "🔒 Bloquear Templo",
                    "¿Deseas cerrar el acceso en este dispositivo? Se requerirá la Llave Maestra para volver a entrar.",
                    [
                      { text: "Cancelar", style: "cancel" },
                      { text: "Bloquear", style: "destructive", onPress: lockTempleAccess }
                    ]
                  );
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="lock-closed-outline" size={14} color="#FFE259" />
                <ThemedText style={styles.lockButtonSmallText}>Bloquear</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>

          {/* 5. FOOTER DE CIERRE ESTOICO */}
          <View style={styles.footerBlock}>
            <ThemedText style={styles.footerQuote}>
              &ldquo;No expliques tu filosofía; encárnala en tus actos de cada día.&rdquo;
            </ThemedText>
            <ThemedText style={styles.footerAuthor}>— Epicteto</ThemedText>
          </View>
        </ScrollView>

        {/* Modal de Relectura del Papiro del Juramento */}
        {showParchmentModal && (
          <View style={StyleSheet.absoluteFill}>
            <GreekParchmentPact onAcceptPact={() => setShowParchmentModal(false)} />
          </View>
        )}
      </SafeAreaView>
    </PearlElectricBackground>
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
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    gap: Spacing.three,
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(12, 16, 28, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
  },
  emblemContainer: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  nativeEmblemRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 2,
    borderColor: '#FFE259',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextGroup: {
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  versionBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 226, 89, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2.5,
    marginBottom: 2,
  },
  versionBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFE259',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFDE0',
    letterSpacing: 4,
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'Cinzel' : 'serif',
    textShadowColor: 'rgba(255, 226, 89, 0.8)',
    textShadowRadius: 14,
  },
  heroSubtitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 1.4,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  heroMotto: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#CBD5E1',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'serif',
  },
  tabsContainer: {
    marginVertical: 4,
  },
  tabsScroll: {
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 20, 32, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tabChipActive: {
    backgroundColor: '#FFE259',
    borderColor: '#FFE259',
  },
  tabChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E2E8F0',
    fontFamily: 'monospace',
  },
  tabChipTextActive: {
    color: '#050507',
  },
  sectionCard: {
    backgroundColor: 'rgba(12, 16, 28, 0.9)',
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.15)',
    paddingBottom: 8,
  },
  sectionCardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFE259',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  paragraph: {
    fontSize: 12.5,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '800',
    color: '#FFF',
  },
  italicText: {
    fontStyle: 'italic',
    color: '#FFE259',
  },
  goldText: {
    color: '#FFE259',
    fontWeight: '800',
  },
  pillarsBox: {
    backgroundColor: 'rgba(5, 7, 13, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  pillarsBoxTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFE259',
    letterSpacing: 1.2,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  pillarItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  pillarBullet: {
    fontSize: 14,
  },
  pillarText: {
    flex: 1,
    fontSize: 11.5,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  actionPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  actionPillButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#050507',
    letterSpacing: 1.2,
    fontFamily: 'monospace',
  },
  faqCard: {
    backgroundColor: 'rgba(12, 16, 28, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.22)',
    borderRadius: 14,
    padding: 14,
  },
  faqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  faqCategory: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 1.2,
    fontFamily: 'monospace',
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFDE0',
    lineHeight: 17,
  },
  faqAnswerBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.12)',
  },
  faqAnswerText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
  },
  privacyFeatureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(5, 7, 13, 0.6)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
  contactEmailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1.2,
    borderColor: '#D4AF37',
    borderRadius: 12,
    padding: 12,
  },
  contactEmailLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#CBD5E1',
  },
  contactEmailText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'monospace',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  infoRowText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  securityTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#E2E8F0',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  securitySub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  lockButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: '#FFE259',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  lockButtonSmallText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFE259',
  },
  footerBlock: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 10,
    gap: 4,
  },
  footerQuote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: 'rgba(212, 175, 55, 0.8)',
    textAlign: 'center',
    fontFamily: 'serif',
  },
  footerAuthor: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 1,
  },
});
