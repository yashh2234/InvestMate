// backend/routes/transactionLogs.js
const express = require("express");
const router = express.Router();
const {getPool} = require("../db");
const { summarizeErrorsWithAI } = require("../utils/aiSummarizer");
const { verifyToken } = require("../middleware/authMiddleware");

// GET /transaction-logs?email=someone@example.com   (admins only)
router.get("/", verifyToken, async (req, res) => {
  const pool = getPool();
  try {
    let logs;
    const { email } = req.query;
    if (req.user.role === "admin") {
      if (email) {
        [logs] = await pool.query(
          `SELECT tl.* 
       FROM transaction_logs tl
       JOIN users u ON tl.user_id = u.id
       WHERE u.email = ?
       ORDER BY tl.created_at DESC`,
          [email]
        );
      } else {
        [logs] = await pool.query(
          "SELECT * FROM transaction_logs ORDER BY created_at DESC"
        );
      }
    } else {
      [logs] = await pool.query(
        "SELECT * FROM transaction_logs WHERE user_id = ? ORDER BY created_at DESC",
        [req.user.id]
      );
    }

    // Summarize only failed logs
    let aiSummary = "No errors found.";
    if (logs.some((log) => log.status_code >= 400)) {
      const failedLogs = logs.filter((log) => log.status_code >= 400);
      aiSummary = await summarizeErrorsWithAI(
        failedLogs,
        email || req.user.email
      );
    }

    res.json({ logs, ai_summary: aiSummary });
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

module.exports = router;
