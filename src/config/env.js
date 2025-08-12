import dotenv from 'dotenv';
dotenv.config();

const num = (v, fallback) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};

export const CONFIG = {
  PORT: process.env.PORT || 3000, // Render définit PORT; 3000 pour local
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  TELEGRAM_BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME || 'TON_BOT_TELEGRAM',
  PRICE_PER_CREDIT: num(process.env.PRICE_PER_CREDIT, 0.10),
};
