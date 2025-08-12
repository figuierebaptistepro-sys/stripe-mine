import { Router } from 'express';
import { stripe } from '../services/stripe.js';
import { CONFIG } from '../config/env.js';

const router = Router();

// POST /api/payments/create-session
router.post('/create-session', async (req, res) => {
  try {
    const { credits, tgUserId } = req.body || {};

    const c = Number.parseInt(credits, 10);
    if (!Number.isFinite(c) || c < 1 || c > 1000000) {
      return res.status(400).json({ error: 'Quantité de crédits invalide' });
    }
    if (!tgUserId) {
      return res.status(400).json({ error: 'tgUserId requis' });
    }

    const unitAmountCents = Math.round(CONFIG.PRICE_PER_CREDIT * 100);
    const totalAmountCents = c * unitAmountCents;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: `${c} crédits de jeu` },
          unit_amount: totalAmountCents,
        },
        quantity: 1,
      }],
      success_url: `https://t.me/${CONFIG.TELEGRAM_BOT_USERNAME}?start=success`,
      cancel_url: `https://t.me/${CONFIG.TELEGRAM_BOT_USERNAME}?start=cancel`,
      metadata: { tgUserId, credits: String(c) }
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('[Stripe create-session] Error:', err);
    return res.status(500).json({ error: 'Erreur lors de la création de la session' });
  }
});

export default router;
