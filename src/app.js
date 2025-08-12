import express from 'express';
import paymentsRouter from './routes/payments.js';
import { registerStripeWebhookRoute } from './routes/webhook.js';

const app = express();

// IMPORTANT: enregistrer le webhook AVANT express.json()
registerStripeWebhookRoute(app);

// Middleware JSON pour le reste des routes
app.use(express.json());

// Healthcheck
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Routes API
app.use('/api/payments', paymentsRouter);

export default app;
