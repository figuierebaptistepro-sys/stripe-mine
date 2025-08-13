import fs from 'fs';
import path from 'path';

// 📂 Fichier où on stocke les soldes
const BALANCES_FILE = path.resolve('src/data/balances.json');

// 📌 Fonction utilitaire pour lire le fichier
function readBalances() {
  try {
    if (!fs.existsSync(BALANCES_FILE)) return {};
    const data = fs.readFileSync(BALANCES_FILE, 'utf-8');
    return JSON.parse(data || '{}');
  } catch (err) {
    console.error('[creditUser] Erreur lecture balances.json:', err);
    return {};
  }
}

// 📌 Fonction utilitaire pour écrire dans le fichier
function writeBalances(balances) {
  try {
    fs.writeFileSync(BALANCES_FILE, JSON.stringify(balances, null, 2), 'utf-8');
  } catch (err) {
    console.error('[creditUser] Erreur écriture balances.json:', err);
  }
}

// ✅ Fonction pour créditer un joueur
export async function creditUser(tgUserId, credits) {
  console.log(`✅ Crédité ${credits} crédits au joueur ${tgUserId}`);

  // Lire les soldes actuels
  const balances = readBalances();

  // Ajouter les crédits
  if (!balances[tgUserId]) {
    balances[tgUserId] = 0;
  }
  balances[tgUserId] += credits;

  // Sauvegarder
  writeBalances(balances);
}

// 📌 Fonction pour lire le solde d’un joueur
export async function getUserBalance(tgUserId) {
  const balances = readBalances();
  return balances[tgUserId] || 0;
}
