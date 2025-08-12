import fetch from 'node-fetch';
import { CONFIG } from '../config/env.js';

export async function sendTelegramMessage(chatId, text) {
  if (!CONFIG.TELEGRAM_BOT_TOKEN) {
    console.warn('[WARN] TELEGRAM_BOT_TOKEN manquant. Message non envoyé.');
    return;
  }
  try {
    const resp = await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    });
    if (!resp.ok) {
      const t = await resp.text();
      console.error('[Telegram] HTTP', resp.status, t);
    }
  } catch (e) {
    console.error('[Telegram] Error:', e.message);
  }
}
