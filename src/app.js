// src/app.js
import express from 'express';
import cors from 'cors';
import paymentsRouter from './routes/payments.js';
import { registerStripeWebhookRoute } from './routes/webhook.js';

const app = express();

/**
 * 1) Webhook Stripe d'abord (NE PAS mettre express.json() avant)
 *    -> registerStripeWebhookRoute doit utiliser bodyParser.raw({ type: 'application/json' })
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

// 6) Routes API
app.use('/api/payments', paymentsRouter);

export default app;

