import express from 'express';
import { stripe } from '../services/stripe.js';
import { CONFIG } from '../config/env.js';
import { sendTelegramMessage } from '../services/telegram.js';

export function registerStripeWebhookRoute(app) {
  // Route webhook AVANT express.json()
  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
    if (!CONFIG.STRIPE_WEBHOOK_SECRET) {
      console.warn('[WARN] STRIPE_WEBHOOK_SECRET manquant. Webhook ignoré.');
      return res.status(200).json({ ignored: true });
    }

    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, CONFIG.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('[Webhook] Signature invalide:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const tgUserId = session.metadata?.tgUserId;
      const credits = parseInt(session.metadata?.credits || '0', 10);

      console.log(`✅ Paiement confirmé. Créditer ${credits} crédits à l'utilisateur ${tgUserId}`);

      // TODO: Incrémenter le solde en base ici (transaction atomique).

      if (tgUserId && credits > 0) {
        sendTelegramMessage(tgUserId, `✅ Paiement reçu — +${credits} crédits ajoutés à ton compte !`);
      }
    }

    return res.json({ received: true });
  });
}
