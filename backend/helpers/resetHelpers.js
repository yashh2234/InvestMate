const bcrypt = require("bcrypt");
const pool = require("../db");

const TOKEN_EXPIRY = { token: 60, otp: 10 }; // minutes

async function createResetRecord(userId, plainToken, type = "token") {
  const id = require("uuid").v4();
  const hash = await bcrypt.hash(plainToken, 10);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY[type] * 60 * 1000);
  await pool.query(
    "INSERT INTO password_resets (id, user_id, token_hash, type, expires_at) VALUES (?, ?, ?, ?, ?)",
    [id, userId, hash, type, expiresAt]
  );
  return { id, expiresAt };
}

async function findValidReset(userId, plainToken, type = "token") {
  const [rows] = await pool.query(
    "SELECT * FROM password_resets WHERE user_id=? AND type=? AND used=0 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 5",
    [userId, type]
  );
  for (const row of rows) {
    const ok = await bcrypt.compare(plainToken, row.token_hash);
    if (ok) return row;
  }
  return null;
}

async function markResetUsed(id) {
  await pool.query("UPDATE password_resets SET used=1 WHERE id=?", [id]);
}

module.exports = { createResetRecord, findValidReset, markResetUsed };
