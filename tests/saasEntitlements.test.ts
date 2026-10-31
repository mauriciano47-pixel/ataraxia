import test, { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { SafeStorage } from '../src/utils/safeStorage.ts';
import {
  STRIPE_MEMBERSHIP_PLANS,
  getSubscriptionStatus,
  activateSubscription,
  cancelSubscription,
  checkAiWorkoutQuota,
  incrementAiWorkoutUsage,
  resetUsageQuota,
  SAAS_LIMITS,
} from '../src/utils/stripeService.ts';

describe('Ataraxia — SaaS Entitlement Engine & Paywall Quota Guard', () => {
  beforeEach(() => {
    SafeStorage.clearAll();
  });

  it('1. Usuario gratuito debe iniciar con cuota completa de 3 rutinas IA', () => {
    const quota = checkAiWorkoutQuota();
    assert.equal(quota.isPro, false);
    assert.equal(quota.allowed, true);
    assert.equal(quota.remaining, SAAS_LIMITS.MAX_FREE_AI_WORKOUTS);
    assert.equal(quota.totalUsed, 0);
  });

  it('2. El contador debe descontar cuota correctamente en plan gratuito', () => {
    incrementAiWorkoutUsage();
    let quota = checkAiWorkoutQuota();
    assert.equal(quota.allowed, true);
    assert.equal(quota.remaining, 2);
    assert.equal(quota.totalUsed, 1);

    incrementAiWorkoutUsage();
    incrementAiWorkoutUsage();
    quota = checkAiWorkoutQuota();
    assert.equal(quota.allowed, false);
    assert.equal(quota.remaining, 0);
    assert.equal(quota.totalUsed, 3);
  });

  it('3. Al superar la cuota en plan gratuito, el Paywall Guard debe bloquear acceso', () => {
    // Gastar los 3 usos
    incrementAiWorkoutUsage();
    incrementAiWorkoutUsage();
    incrementAiWorkoutUsage();

    const quota = checkAiWorkoutQuota();
    assert.equal(quota.allowed, false);
    assert.equal(quota.remaining, 0);
  });

  it('4. Usuario con Membresía Legionario Pro o Imperial Gold tiene acceso ilimitado (bypass de cuota)', () => {
    // Gastar 3 usos en modo gratuito
    incrementAiWorkoutUsage();
    incrementAiWorkoutUsage();
    incrementAiWorkoutUsage();
    assert.equal(checkAiWorkoutQuota().allowed, false);

    // Activar suscripción Pro
    activateSubscription('legionario_pro', 'stripe');

    const proQuota = checkAiWorkoutQuota();
    assert.equal(proQuota.isPro, true);
    assert.equal(proQuota.allowed, true);
    assert.ok(proQuota.remaining > 1000);
  });

  it('5. Al cancelar suscripción, vuelve al estado gratuito y respeta cuota consumida', () => {
    activateSubscription('imperial_gold', 'trial');
    assert.equal(checkAiWorkoutQuota().isPro, true);

    cancelSubscription();
    const freeQuota = checkAiWorkoutQuota();
    assert.equal(freeQuota.isPro, false);
    assert.equal(freeQuota.allowed, true);
  });

  it('6. Debe resetear cuotas correctamente mediante resetUsageQuota', () => {
    incrementAiWorkoutUsage();
    incrementAiWorkoutUsage();
    resetUsageQuota();

    const quota = checkAiWorkoutQuota();
    assert.equal(quota.totalUsed, 0);
    assert.equal(quota.remaining, SAAS_LIMITS.MAX_FREE_AI_WORKOUTS);
  });
});
