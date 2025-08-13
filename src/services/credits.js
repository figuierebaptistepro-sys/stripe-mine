export async function creditUser(tgUserId, credits) {
  console.log(`✅ Crédité ${credits} crédits au joueur ${tgUserId}`);
  // Exemple si tu as une BDD :
  // await db.query('UPDATE users SET balance = balance + $1 WHERE tg_id = $2', [credits, tgUserId]);
}