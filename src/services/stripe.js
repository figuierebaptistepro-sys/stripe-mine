import Stripe from 'stripe';
import { CONFIG } from '../config/env.js';

if (!CONFIG.STRIPE_SECRET_KEY) {
  console.warn('[WARN] STRIPE_SECRET_KEY manquant. Les paiements échoueront.');
}

export const stripe = new Stripe(CONFIG.STRIPE_SECRET_KEY || 'sk_test_XXXXXXXXXXXXXXXXXXXX');
