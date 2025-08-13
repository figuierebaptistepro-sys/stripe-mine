import express from 'express';
import { stripe } from '../services/stripe.js';
import { CONFIG } from '../config/env.js';
import { sendTelegramMessage } from '../services/telegram.js';
import { creditUser } from '../services/credits.js'; // ✅ ajout

export function registerStripeWebhookRoute(app) {
  // ⚠️ Webhook AVANT express.json() (Stripe exige le raw body)
  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
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

    // On traite uniquement le succès de Checkout
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const tgUserId = session.metadata?.tgUserId;
      const credits = parseInt(session.metadata?.credits || '0', 10);

      console.log(`✅ Paiement confirmé. Créditer ${credits} crédits à l'utilisateur ${tgUserId}`);

      if (tgUserId && credits > 0) {
        try {
          // ✅ Créditer l'utilisateur (à implémenter dans services/credits.js)
          await creditUser(tgUserId, credits);
          // ✅ Notifier l'utilisateur sur Telegram (optionnel)
          sendTelegramMessage(tgUserId, `✅ Paiement reçu — +${credits} crédits ajoutés à ton compte !`);
        } catch (e) {
          console.error('❌ Erreur lors du crédit des crédits:', e);
        }
      } else {
        console.warn('[Webhook] metadata manquante ou invalide:', session.metadata);
      }
    }

    // Toujours répondre 200 pour indiquer à Stripe que l’event est reçu
    return res.json({ received: true });
  });
}
