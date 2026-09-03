import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Clipboard,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { ThemedText } from './themed-text';
import { Spacing } from '@/constants/theme';

export interface GuardianSlot {
  id: string;
  guardianNumber: number;
  title: string;
  archetype: string;
  icon: string;
  key: string;
  url: string;
  description: string;
}

const PRODUCTION_BASE_URL = 'https://ataraxia-stoic.vercel.app';

export const GUARDIAN_SLOTS: GuardianSlot[] = [
  {
    id: 'guardian_1',
    guardianNumber: 1,
    title: 'Primer Guardián • Fuerza & Determinación',
    archetype: '⚔️ Senda de Esparta / Ares',
    icon: '🛡️',
    key: 'ZEUS777',
    url: `${PRODUCTION_BASE_URL}/?key=ZEUS777`,
    description: 'Enlace consagrado para tu primer compañero. Iniciará limpio con su propio perfil, biometría y rutina.',
  },
  {
    id: 'guardian_2',
    guardianNumber: 2,
    title: 'Segundo Guardián • Sabiduría & Estrategia',
    archetype: '🏛️ Senda de Atenea / Prokopton',
    icon: '📜',
    key: 'ATARAXIA',
    url: `${PRODUCTION_BASE_URL}/?key=ATARAXIA`,
    description: 'Enlace consagrado para tu segundo compañero. Acceso independiente a todos los módulos y registro.',
  },
  {
    id: 'guardian_3',
    guardianNumber: 3,
    title: 'Tercer Guardián • Virtud & Armonía',
    archetype: '⚡ Senda de Apolo / Fénix',
    icon: '👑',
    key: 'ATARAXIA-ROYAL',
    url: `${PRODUCTION_BASE_URL}/?key=ATARAXIA-ROYAL`,
    description: 'Enlace consagrado para tu tercer compañero. Experiencia completa desde el Día 1 con Coach IA.',
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function GuardianInviteModal({ visible, onClose }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (slot: GuardianSlot) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      navigator.clipboard?.writeText(slot.url).catch(() => {});
    } else {
      Clipboard.setString(slot.url);
    }

    setCopiedId(slot.id);
    setTimeout(() => setCopiedId(null), 2500);

    if (Platform.OS !== 'web') {
      Alert.alert('⚡ Enlace Copiado', `El enlace para el Guardián #${slot.guardianNumber} fue copiado al portapapeles.`);
    }
  };

  const shareInvitation = async (slot: GuardianSlot) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const message = `🏛️ *INVITACIÓN AL TEMPLO DE ATARAXIA*\n\nHas sido convocado como uno de los 3 guardianes autorizados.\n\n⚡ *Tu Enlace de Acceso Sagrado:*\n${slot.url}\n\n🔑 *Tu Llave de Desbloqueo:* \`${slot.key}\`\n\n📌 *Instrucciones:* Abre el enlace en tu navegador o móvil para consagrar tu nombre, ingresar tus datos biométricos y forjar tu Pacto de 30 Días con todos los módulos activos.`;

    if (Platform.OS === 'web') {
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      if (typeof window !== 'undefined') {
        window.open(whatsappUrl, '_blank');
      }
    } else {
      try {
        await Share.share({
          title: 'Convocatoria de Guardián — Ataraxia',
          message,
          url: slot.url,
        });
      } catch (err) {
        console.warn('Error sharing invitation:', err);
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.cardContainer}>
          {/* CABECERA IMPERIAL */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.badgeTop}>🏛️ CONSEJO DE LOS 4 GUARDIANES</ThemedText>
              <ThemedText style={styles.titleMain}>CONVOCATORIA DE GUARDIANES</ThemedText>
              <ThemedText style={styles.subtitleHeader}>
                Solo 4 personas en el mundo tienen acceso a esta instancia. Comparte un enlace único con cada uno de tus 3 guardianes.
              </ThemedText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#D4AF37" />
            </TouchableOpacity>
          </View>

          {/* LISTA DE ENLACES SAGRADOS */}
          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            <View style={styles.slotsContainer}>
              {GUARDIAN_SLOTS.map((slot) => {
                const isCopied = copiedId === slot.id;

                return (
                  <View key={slot.id} style={styles.slotCard}>
                    <View style={styles.slotHeaderRow}>
                      <View style={styles.slotIconBox}>
                        <ThemedText style={{ fontSize: 20 }}>{slot.icon}</ThemedText>
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={styles.slotTitle}>{slot.title}</ThemedText>
                        <ThemedText style={styles.slotArchetype}>{slot.archetype}</ThemedText>
                      </View>
                      <View style={styles.keyBadge}>
                        <ThemedText style={styles.keyBadgeLabel}>LLAVE:</ThemedText>
                        <ThemedText style={styles.keyBadgeValue}>{slot.key}</ThemedText>
                      </View>
                    </View>

                    <ThemedText style={styles.slotDescription}>
                      {slot.description}
                    </ThemedText>

                    {/* URL BOX */}
                    <View style={styles.urlBox}>
                      <Ionicons name="link-outline" size={14} color="#D4AF37" />
                      <ThemedText style={styles.urlText} numberOfLines={1}>
                        {slot.url}
                      </ThemedText>
                    </View>

                    {/* BOTONES DE ACCIÓN */}
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.copyBtn, isCopied && styles.copyBtnSuccess]}
                        onPress={() => copyToClipboard(slot)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={isCopied ? 'checkmark-circle' : 'copy-outline'}
                          size={15}
                          color={isCopied ? '#10B981' : '#FFE259'}
                        />
                        <ThemedText style={[styles.copyBtnText, isCopied && { color: '#10B981' }]}>
                          {isCopied ? 'ENLACE COPIADO ✓' : 'COPIAR ENLACE'}
                        </ThemedText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.shareBtn}
                        onPress={() => shareInvitation(slot)}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={['#D4AF37', '#FFE259', '#B45309']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.shareBtnGradient}
                        >
                          <Ionicons name="logo-whatsapp" size={14} color="#050507" />
                          <ThemedText style={styles.shareBtnText}>ENVIAR POR WHATSAPP ⚡</ThemedText>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* CAJA INFORMATIVA DE FLUJO */}
            <View style={styles.infoBannerBox}>
              <Ionicons name="information-circle-outline" size={20} color="#38BDF8" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.infoBannerTitle}>¿CÓMO VIVIRÁN LA EXPERIENCIA?</ThemedText>
                <ThemedText style={styles.infoBannerBody}>
                  1. Al pulsar su enlace, el Templo se desbloqueará de forma automática.{'\n'}
                  2. La app les abrirá el formulario de Iniciación Estoica para que ingresen su nombre, correo (Llave Sagrada) y biometría.{'\n'}
                  3. Elegirán su Senda y equipamiento (Gimnasio, Mancuernas o Peso Corporal).{'\n'}
                  4. Sus datos quedarán almacenados de forma independiente en su propio dispositivo.
                </ThemedText>
              </View>
            </View>
          </ScrollView>

          {/* PIE DE PÁGINA */}
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85}>
              <ThemedText style={styles.doneBtnText}>CERRAR CONVOCATORIA 🏛️</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 3, 6, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '92%',
    backgroundColor: 'rgba(10, 14, 24, 0.98)',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    padding: Spacing.four,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.20)',
    paddingBottom: Spacing.three,
    marginBottom: Spacing.three,
  },
  badgeTop: {
    fontSize: 9.5,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#D4AF37',
    letterSpacing: 1.5,
  },
  titleMain: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  subtitleHeader: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 15,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  scrollBody: {
    maxHeight: 480,
  },
  slotsContainer: {
    gap: 12,
  },
  slotCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.30)',
    padding: 12,
    gap: 8,
  },
  slotHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slotIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderWidth: 1,
    borderColor: '#FFE259',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFE259',
  },
  slotArchetype: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  keyBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: 'center',
  },
  keyBadgeLabel: {
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  keyBadgeValue: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'monospace',
  },
  slotDescription: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 15,
  },
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 7, 13, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  urlText: {
    fontSize: 10.5,
    color: '#93C5FD',
    fontFamily: 'monospace',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  copyBtnSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  copyBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'monospace',
  },
  shareBtn: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  shareBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 6,
  },
  shareBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#050507',
    fontFamily: 'monospace',
  },
  infoBannerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginTop: 14,
  },
  infoBannerTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#38BDF8',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  infoBannerBody: {
    fontSize: 10.5,
    color: '#CBD5E1',
    lineHeight: 15,
  },
  footerRow: {
    marginTop: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.20)',
  },
  doneBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#050507',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
});
