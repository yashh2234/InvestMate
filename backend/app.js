// app.js
const express = require("express");
const app = express();
const { initDB, getPool } = require("./db");

// Initialize DB
initDB().then(() => console.log("DB ready")).catch(console.error);

app.use(express.json());
app.get("/health", async (req, res) => {
  try {
    const pool = getPool();
    const [result] = await pool.query("SELECT 1 AS db_check");
    res.json({ status: "ok", db: result[0].db_check === 1 ? "Connected" : "Error" });
  } catch (err) {
    res.status(503).json({ status: "FAIL", db: "Disconnected", error: err.message });
  }
});

module.exports = app;