// src/app.js
import express from 'express';
import cors from 'cors';
import paymentsRouter from './routes/payments.js';
import { registerStripeWebhookRoute } from './routes/webhook.js';
import { getUserBalance, creditUser } from './services/credits.js';

const app = express();

/**
 * 1) Webhook Stripe d'abord (NE PAS mettre express.json() avant)
 *    -> registerStripeWebhookRoute utilise express.raw({ type: 'application/json' })
 */
registerStripeWebhookRoute(app);

/**
 * 2) CORS pour le reste de l'API (POST /api/payments/create-session, etc.)
 *    - Pour aller vite : origin: '*' (pas de credentials)
 *    - Si tu veux restreindre, remplace '*' par un tableau d’origines autorisées
 */
app.use(
  cors({
    origin: '*', // ex: ['https://aivario.com','https://web.telegram.org']
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3) Preflight global (OPTIONS) -> évite les erreurs CORS sur les requêtes cross-origin
app.options('*', cors());

/**
 * 4) JSON parser pour toutes les autres routes (après webhook)
 */
app.use(express.json());

// 5) Healthcheck
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

/**
 * 6) Petite API solde (utile pour ton jeu/bot)
 */

// Lire le solde d'un joueur
// GET /api/user/balance?tgUserId=1856211732
app.get('/api/user/balance', async (req, res) => {
  const tgUserId = String(req.query.tgUserId || '');
  if (!tgUserId) return res.status(400).json({ error: 'tgUserId manquant' });
  try {
    const balance = await getUserBalance(tgUserId);
    return res.json({ tgUserId, balance });
  } catch (e) {
    console.error('[GET /api/user/balance] error:', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// (Optionnel) Crédit manuel pour tests locaux/post-payement
// Active seulement si tu définis ADMIN_TOKEN dans Render
// POST /api/user/balance/add  { tgUserId: "1856...", credits: 500, adminToken: "..." }
app.post('/api/user/balance/add', async (req, res) => {
  const { tgUserId, credits, adminToken } = req.body || {};
  const needToken = process.env.ADMIN_TOKEN; // si non défini => on laisse quand même passer pour faciliter les tests
  if (needToken && adminToken !== needToken) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const id = String(tgUserId || '');
  const add = Number(credits) || 0;
  if (!id || add <= 0) {
    return res.status(400).json({ error: 'bad_params' });
  }
  try {
    await creditUser(id, add);
    const balance = await getUserBalance(id);
    return res.json({ ok: true, tgUserId: id, credited: add, balance });
  } catch (e) {
    console.error('[POST /api/user/balance/add] error:', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

/**
 * 7) Routes API paiement (création de session Stripe, etc.)
 */
app.use('/api/payments', paymentsRouter);

export default app;
