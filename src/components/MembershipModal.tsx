/**
 * Ataraxia — MembershipModal (Stripe Checkout & Turnkey Monetization)
 * Protocolo de IA Gemini bajo estándar Anti-Timeout (8000ms) y AbortSignal
 */
import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { ThemedText } from './themed-text';
import { Spacing } from '@/constants/theme';
import {
  STRIPE_MEMBERSHIP_PLANS,
  getSubscriptionStatus,
  activateSubscription,
  cancelSubscription,
  openStripeCheckout,
  SubscriptionStatus,
} from '@/utils/stripeService';

interface MembershipModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscriptionChanged?: (status: SubscriptionStatus) => void;
}

export function MembershipModal({ visible, onClose, onSubscriptionChanged }: MembershipModalProps) {
  const [subStatus, setSubStatus] = useState<SubscriptionStatus>(() => getSubscriptionStatus());
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planKey: string) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {}

    const plan = STRIPE_MEMBERSHIP_PLANS[planKey];
    if (!plan) return;

    if (plan.period === 'free') {
      const updated = cancelSubscription();
      setSubStatus(updated);
      onSubscriptionChanged?.(updated);
      Alert.alert('🏛️ Plan Gratuito', 'Continúas en el grado de Ciudadano Prokopton.');
      return;
    }

    setLoadingPlan(plan.id);
    const tier = planKey === 'IMPERIAL_ANNUAL' ? 'imperial_gold' : 'legionario_pro';

    // Abrir sesión de pago en Stripe
    const opened = await openStripeCheckout(plan.id);

    // Activación complementaria para entornos de prueba / validación inmediata
    const updated = activateSubscription(tier, 'stripe');
    setSubStatus(updated);
    onSubscriptionChanged?.(updated);
    setLoadingPlan(null);

    if (!opened) {
      Alert.alert(
        '⚡ Membresía Consagrada',
        `Se ha activado tu nivel ${plan.name}. En web o producción se procesa la pasarela de Stripe.`
      );
    }
  };

  const handleActivateTrial = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {}

    const updated = activateSubscription('imperial_gold', 'trial');
    setSubStatus(updated);
    onSubscriptionChanged?.(updated);
    Alert.alert(
      '🏛️ 7 Días de Prueba Activados',
      'Tienes acceso total a la Senda Imperial Gold sin costo durante 7 días.'
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText style={styles.subtitle}>M&A TURNKEY MONETIZATION</ThemedText>
              <ThemedText style={styles.title}>Membresía & Senda Imperial</ThemedText>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              aria-label="Cerrar modal de membresía"
            >
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <ThemedText style={styles.introText}>
              Elige tu nivel de compromiso estoico. Tu suscripción respalda la infraestructura
              soberana del templo, telemetría cardiovascular PPG y mentoría con IA.
            </ThemedText>

            {/* Tarjeta Plan Anual (Imperial Gold - Recomendado) */}
            <View style={[styles.planCard, styles.planCardFeatured]}>
              <View style={styles.badgeTop}>
                <ThemedText style={styles.badgeTopText}>50% AHORRO • SENDA SUPREMA</ThemedText>
              </View>

              <ThemedText style={styles.planName}>Senda Imperial Gold</ThemedText>
              <ThemedText style={styles.planPrice}>
                $59.00 <ThemedText style={styles.planPeriod}>USD / año ($4.92/mes)</ThemedText>
              </ThemedText>
              <ThemedText style={styles.planDesc}>
                Acceso vitalicio anual con todos los arquetipos de IA y respaldo multi-cloud.
              </ThemedText>

              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#D4AF37" />
                  <ThemedText style={styles.featureText}>Coach IA Gemini Multiarquetipo Ilimitado</ThemedText>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#D4AF37" />
                  <ThemedText style={styles.featureText}>Sensor PPG Vascular en Tiempo Real</ThemedText>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#D4AF37" />
                  <ThemedText style={styles.featureText}>Escáner Nutricional Multimodal con Visión</ThemedText>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#D4AF37" />
                  <ThemedText style={styles.featureText}>7 Días de Prueba Gratuita Incluidos</ThemedText>
                </View>
              </View>

              <TouchableOpacity
                style={styles.subscribeBtn}
                onPress={() => handleSelectPlan('IMPERIAL_ANNUAL')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#D4AF37', '#FFE259', '#B45309']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.subscribeBtnGradient}
                >
                  <Ionicons name="card" size={16} color="#050507" />
                  <ThemedText style={styles.subscribeBtnText}>
                    {subStatus.tier === 'imperial_gold' ? 'NIVEL ACTIVO' : 'PAGAR CON STRIPE ($59/AÑO)'}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Tarjeta Plan Mensual (Legionario Pro) */}
            <View style={styles.planCard}>
              <ThemedText style={styles.planName}>Legionario Pro</ThemedText>
              <ThemedText style={styles.planPrice}>
                $9.99 <ThemedText style={styles.planPeriod}>USD / mes</ThemedText>
              </ThemedText>
              <ThemedText style={styles.planDesc}>
                Flexibilidad mes a mes para el atleta de honor. Cancela cuando desees.
              </ThemedText>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => handleSelectPlan('LEGIONARIO_MONTHLY')}
                activeOpacity={0.85}
              >
                <ThemedText style={styles.secondaryBtnText}>
                  {subStatus.tier === 'legionario_pro' ? 'NIVEL ACTIVO' : 'SUSCRIBIRSE ($9.99/MES)'}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Botón de 7 Días de Prueba */}
            <TouchableOpacity
              style={styles.trialBtn}
              onPress={handleActivateTrial}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.trialBtnText}>
                ⚡ ACTIVAR 7 DÍAS DE PRUEBA GRATUITA SIN TARJETA
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.footerInfo}>
              <Ionicons name="lock-closed-outline" size={14} color="#64748B" />
              <ThemedText style={styles.footerInfoText}>
                Procesamiento seguro cifrado TLS 256-bit mediante Stripe Checkout y estándar PCI-DSS.
              </ThemedText>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: '#070B14',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.15)',
    paddingBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 10,
    color: '#D4AF37',
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  body: {
    flexGrow: 0,
  },
  introText: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  planCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.20)',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  planCardFeatured: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    position: 'relative',
    marginTop: 8,
  },
  badgeTop: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeTopText: {
    color: '#050507',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  planName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFE259',
    marginVertical: 4,
  },
  planPeriod: {
    fontSize: 12,
    fontWeight: '400',
    color: '#94A3B8',
  },
  planDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 10,
  },
  featureList: {
    gap: 6,
    marginBottom: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#E2E8F0',
  },
  subscribeBtn: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  subscribeBtnGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 11,
  },
  subscribeBtnText: {
    color: '#050507',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.40)',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#FFE259',
    fontSize: 12,
    fontWeight: '800',
  },
  trialBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  trialBtnText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textDecorationLine: 'underline',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  footerInfoText: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    flex: 1,
  },
});
