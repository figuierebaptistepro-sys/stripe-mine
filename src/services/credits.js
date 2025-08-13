// src/services/credits.js
import fs from 'fs';
import path from 'path';

// 📂 Fichier de stockage (persistant tant que l’instance vit)
const BALANCES_FILE = path.resolve('src/data/balances.json');

// ——— Utils lecture/écriture ———
function ensureDir() {
  const dir = path.dirname(BALANCES_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readBalances() {
  try {
    if (!fs.existsSync(BALANCES_FILE)) return {};
    const raw = fs.readFileSync(BALANCES_FILE, 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('[credits] readBalances error:', err);
    return {};
  }
}

function writeBalances(balances) {
  try {
    ensureDir();
    fs.writeFileSync(BALANCES_FILE, JSON.stringify(balances, null, 2), 'utf8');
  } catch (err) {
    console.error('[credits] writeBalances error:', err);
  }
}

// ——— API ———
export async function creditUser(tgUserId, credits) {
  const id = String(tgUserId || '');
  const add = Number(credits) || 0;
  if (!id || add <= 0) return;

  const balances = readBalances();
  const before = Number(balances[id] || 0);
  const after = before + add;
  balances[id] = after;

  writeBalances(balances);
  console.log(`✅ Crédité ${add} crédits au joueur ${id}. Nouveau solde: ${after}`);
}

export async function getUserBalance(tgUserId) {
  const id = String(tgUserId || '');
  if (!id) return 0;
  const balances = readBalances();
  return Number(balances[id] || 0);
}

// Alias pour rester compatible avec les imports `getBalance(...)`
export const getBalance = getUserBalance;
