/**
 * ============================================================================
 * Ataraxia — Servicio de Monetización, Membresía Imperial & Checkout (Stripe SaaS)
 * Versión: 2.9.2
 * Protocolo de IA Gemini bajo estándar Anti-Timeout (8000ms) y AbortSignal
 * ============================================================================
 * Arquitectura de cobro recurrente y contratos comerciales para M&A / Acquire.com
 */
let PlatformOS = 'web';
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  if (RN && RN.Platform) {
    PlatformOS = RN.Platform.OS;
  }
} catch {
  PlatformOS = typeof window !== 'undefined' ? 'web' : 'node';
}
const Platform = { OS: PlatformOS };

const getRNLinking = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RN = require('react-native');
    return RN?.Linking || null;
  } catch {
    return null;
  }
};

import { SafeStorage } from './safeStorage.ts';
import { logger } from '../lib/logger.ts';

export interface MembershipPlan {
  id: string;
  priceId: string;
  name: string;
  tagline: string;
  monthlyUsd: number;
  annualUsd?: number;
  period: 'free' | 'monthly' | 'annual';
  badge?: string;
  features: string[];
  stripeCheckoutUrl: string;
  popular?: boolean;
}

export const STRIPE_MEMBERSHIP_PLANS: Record<string, MembershipPlan> = {
  FREE: {
    id: 'plan_prokopton_free',
    priceId: 'free',
    name: 'Ciudadano Prokopton',
    tagline: 'Autodominio Fundamental & Entrada al Templo',
    monthlyUsd: 0,
    period: 'free',
    features: [
      'Acceso a Podómetro Biomecánico NEAT 24/7',
      'Matriz de Calistenia & Pesas Básicas',
      'Registro Diario de Calorías & Pasos',
      'Filosofía & Citas Estoicas Diarias'
    ],
    stripeCheckoutUrl: ''
  },
  LEGIONARIO_MONTHLY: {
    id: 'prod_ataraxia_legionario_monthly',
    priceId: 'price_legionario_monthly_999',
    name: 'Legionario Pro (Mensual)',
    tagline: 'Fuerza Imperial & Biometría de Vanguardia',
    monthlyUsd: 9.99,
    period: 'monthly',
    popular: true,
    badge: 'MÁS POPULAR',
    features: [
      'Todos los beneficios de Ciudadano',
      'Coach IA Gemini Multiarquetipo Ilimitado (24/7)',
      'Escáner PPG Fotopletismográfico Vascular en Tiempo Real',
      'Escáner Nutricional Multimodal con Visión IA',
      'Diplomas de Honor y Títulos Sagrados Ilimitados',
      'Filtro Anti-Vehículo Avanzado y Telemetría Twin Cards'
    ],
    stripeCheckoutUrl: 'https://buy.stripe.com/test_ataraxia_legionario_monthly'
  },
  IMPERIAL_ANNUAL: {
    id: 'prod_ataraxia_imperial_annual',
    priceId: 'price_imperial_annual_5900',
    name: 'Senda Imperial Gold (Anual)',
    tagline: 'Maestría Vitalicia & Máximo Ahorro (50% OFF)',
    monthlyUsd: 4.92,
    annualUsd: 59.00,
    period: 'annual',
    badge: '50% AHORRO',
    features: [
      'Todo lo incluido en Legionario Pro',
      'Acceso Prioritario a Nuevos Arquetipos Biohackers',
      'Respaldo Multi-Dispositivo & Sincronización Cloud',
      'Insignia Dorada en el Salón de los 3 Guardianes',
      '7 Días de Prueba Gratuita sin Compromiso'
    ],
    stripeCheckoutUrl: 'https://buy.stripe.com/test_ataraxia_imperial_annual'
  }
};

export interface SubscriptionStatus {
  tier: 'free' | 'legionario_pro' | 'imperial_gold';
  planId: string;
  active: boolean;
  renewsAt: string;
  source: 'stripe' | 'manual' | 'trial';
}

const STORAGE_KEY_SUBSCRIPTION = 'ataraxia_subscription_status_v1';

export function getSubscriptionStatus(): SubscriptionStatus {
  try {
    const raw = SafeStorage.getItem(STORAGE_KEY_SUBSCRIPTION);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.tier === 'string') {
        return parsed;
      }
    }
  } catch (err) {
    logger.warn('[stripeService] Error leyendo estado de suscripción:', err);
  }

  return {
    tier: 'free',
    planId: STRIPE_MEMBERSHIP_PLANS.FREE.id,
    active: false,
    renewsAt: '',
    source: 'stripe'
  };
}

export function activateSubscription(
  tier: 'legionario_pro' | 'imperial_gold',
  source: 'stripe' | 'manual' | 'trial' = 'stripe'
): SubscriptionStatus {
  const plan = tier === 'imperial_gold' 
    ? STRIPE_MEMBERSHIP_PLANS.IMPERIAL_ANNUAL 
    : STRIPE_MEMBERSHIP_PLANS.LEGIONARIO_MONTHLY;

  const expiration = new Date();
  if (tier === 'imperial_gold') {
    expiration.setFullYear(expiration.getFullYear() + 1);
  } else {
    expiration.setMonth(expiration.getMonth() + 1);
  }

  const updated: SubscriptionStatus = {
    tier,
    planId: plan.id,
    active: true,
    renewsAt: expiration.toISOString().split('T')[0],
    source
  };

  try {
    SafeStorage.setItem(STORAGE_KEY_SUBSCRIPTION, JSON.stringify(updated));
  } catch (err) {
    logger.warn('[stripeService] Error guardando suscripción:', err);
  }

  return updated;
}

export function cancelSubscription(): SubscriptionStatus {
  const updated: SubscriptionStatus = {
    tier: 'free',
    planId: STRIPE_MEMBERSHIP_PLANS.FREE.id,
    active: false,
    renewsAt: '',
    source: 'stripe'
  };

  try {
    SafeStorage.setItem(STORAGE_KEY_SUBSCRIPTION, JSON.stringify(updated));
  } catch (err) {
    logger.warn('[stripeService] Error cancelando suscripción:', err);
  }

  return updated;
}

export async function openStripeCheckout(planId: string): Promise<boolean> {
  const plan = Object.values(STRIPE_MEMBERSHIP_PLANS).find(p => p.id === planId);
  if (!plan || !plan.stripeCheckoutUrl) {
    return false;
  }

  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(plan.stripeCheckoutUrl, '_blank');
      return true;
    }
    const RNLinking = getRNLinking();
    if (RNLinking) {
      const supported = await RNLinking.canOpenURL(plan.stripeCheckoutUrl);
      if (supported) {
        await RNLinking.openURL(plan.stripeCheckoutUrl);
        return true;
      }
    }
  } catch (err) {
    logger.warn('[stripeService] Error abriendo sesión de Stripe Checkout:', err);
  }

  return false;
}


/* ============================================================================
   SaaS Entitlements, Cuotas & Límite de Uso para Plan Gratuito (Paywall Guard)
   ============================================================================ */
export const SAAS_LIMITS = {
  MAX_FREE_AI_WORKOUTS: 3,
  MAX_FREE_PPG_SCANS: 5,
};

const STORAGE_KEY_AI_USAGE = 'ataraxia_saas_ai_workout_usage_v1';

export interface QuotaCheckResult {
  allowed: boolean;
  remaining: number;
  totalUsed: number;
  isPro: boolean;
}

export function checkAiWorkoutQuota(): QuotaCheckResult {
  const sub = getSubscriptionStatus();
  if (sub.active) {
    return {
      allowed: true,
      remaining: 999999,
      totalUsed: 0,
      isPro: true,
    };
  }

  try {
    const raw = SafeStorage.getItem(STORAGE_KEY_AI_USAGE);
    const used = raw ? parseInt(raw, 10) : 0;
    const remaining = Math.max(0, SAAS_LIMITS.MAX_FREE_AI_WORKOUTS - used);
    return {
      allowed: used < SAAS_LIMITS.MAX_FREE_AI_WORKOUTS,
      remaining,
      totalUsed: used,
      isPro: false,
    };
  } catch {
    return {
      allowed: true,
      remaining: SAAS_LIMITS.MAX_FREE_AI_WORKOUTS,
      totalUsed: 0,
      isPro: false,
    };
  }
}

export function incrementAiWorkoutUsage(): number {
  const sub = getSubscriptionStatus();
  if (sub.active) return 0; // Pro users have unlimited quota

  try {
    const raw = SafeStorage.getItem(STORAGE_KEY_AI_USAGE);
    const used = raw ? parseInt(raw, 10) : 0;
    const next = used + 1;
    SafeStorage.setItem(STORAGE_KEY_AI_USAGE, String(next));
    return next;
  } catch {
    return 1;
  }
}

export function resetUsageQuota(): void {
  try {
    SafeStorage.removeItem(STORAGE_KEY_AI_USAGE);
  } catch (err) {
    logger.warn('[stripeService] Error reseteando cuotas:', err);
  }
}
