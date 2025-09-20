// db.js
const mysql = require("mysql2/promise");

let pool = null;

async function createPoolWithRetry(retries = 10, delay = 5000) {
  const host = process.env.DB_HOST || "localhost";
  const port = process.env.DB_PORT || 3306;

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting MySQL connection to ${host}:${port}...`);
      const newPool = mysql.createPool({
        host,
        port,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "root",
        database: process.env.DB_NAME || "investment_db",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      await newPool.query("SELECT 1");
      console.log(`✅ Connected to MySQL at ${host}:${port}!`);
      return newPool;
    } catch (err) {
      console.log(
        `⚠️ DB not ready at ${host}:${port}, retrying in ${delay / 1000}s... (${i + 1}/${
          retries
        })`
      );
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  throw new Error(`❌ Could not connect to MySQL at ${host}:${port} after multiple retries.`);
}

async function initDB() {
  pool = await createPoolWithRetry();
  return pool;
}

function getPool() {
  if (!pool) throw new Error("Database pool not initialized yet.");
  return pool;
}

module.exports = { initDB, getPool };
