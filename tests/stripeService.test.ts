import test, { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { SafeStorage } from '../src/utils/safeStorage.ts';
import {
  STRIPE_MEMBERSHIP_PLANS,
  getSubscriptionStatus,
  activateSubscription,
  cancelSubscription,
} from '../src/utils/stripeService.ts';

describe('Ataraxia — Monetización M&A & Suscripciones (stripeService)', () => {
  beforeEach(() => {
    SafeStorage.clearAll();
  });

  it('1. Debe retornar estado gratuito por defecto cuando no hay suscripción', () => {
    const status = getSubscriptionStatus();
    assert.equal(status.tier, 'free');
    assert.equal(status.active, false);
    assert.equal(status.planId, STRIPE_MEMBERSHIP_PLANS.FREE.id);
  });

  it('2. Debe contener planes válidos con precios y características formales', () => {
    const plans = Object.values(STRIPE_MEMBERSHIP_PLANS);
    assert.ok(plans.length >= 3);

    const proMonthly = STRIPE_MEMBERSHIP_PLANS.LEGIONARIO_MONTHLY;
    assert.equal(proMonthly.monthlyUsd, 9.99);
    assert.equal(proMonthly.period, 'monthly');
    assert.ok(proMonthly.stripeCheckoutUrl.includes('stripe.com'));

    const imperialAnnual = STRIPE_MEMBERSHIP_PLANS.IMPERIAL_ANNUAL;
    assert.equal(imperialAnnual.annualUsd, 59.00);
    assert.equal(imperialAnnual.period, 'annual');
    assert.ok(imperialAnnual.stripeCheckoutUrl.includes('stripe.com'));
  });

  it('3. Debe activar suscripción Legionario Pro y persistir en SafeStorage', () => {
    const activated = activateSubscription('legionario_pro', 'stripe');
    assert.equal(activated.tier, 'legionario_pro');
    assert.equal(activated.active, true);
    assert.ok(activated.renewsAt.length > 0);

    const stored = getSubscriptionStatus();
    assert.equal(stored.tier, 'legionario_pro');
    assert.equal(stored.active, true);
  });

  it('4. Debe activar suscripción Imperial Gold con periodo anual y prueba', () => {
    const activated = activateSubscription('imperial_gold', 'trial');
    assert.equal(activated.tier, 'imperial_gold');
    assert.equal(activated.source, 'trial');
    assert.equal(activated.active, true);

    const stored = getSubscriptionStatus();
    assert.equal(stored.tier, 'imperial_gold');
    assert.equal(stored.source, 'trial');
  });

  it('5. Debe cancelar suscripción y retornar a estado gratuito Prokopton', () => {
    activateSubscription('imperial_gold');
    const cancelled = cancelSubscription();
    assert.equal(cancelled.tier, 'free');
    assert.equal(cancelled.active, false);

    const stored = getSubscriptionStatus();
    assert.equal(stored.tier, 'free');
    assert.equal(stored.active, false);
  });
});
