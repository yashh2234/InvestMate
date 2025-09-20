// middleware/transactionLogger.js
const {getPool} = require("../db");

async function transactionLogger(req, res, next) {
  const originalSend = res.send;

  res.send = async function (body) {
    const statusCode = res.statusCode;
    const endpoint = req.originalUrl;
    const method = req.method;

    let parsedBody;
    try {
      parsedBody = typeof body === "string" ? JSON.parse(body) : body;
    } catch {
      parsedBody = {};
    }

    const errorMessage = parsedBody.error || null;
    const userId = req.user?.id || null;
    const email = req.user?.email || null; // ✅ capture email

    try {
      const pool = getPool();
      await pool.query(
        `INSERT INTO transaction_logs 
           (user_id, email, endpoint, http_method, status_code, error_message, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [userId, email, endpoint, method, statusCode, errorMessage]
      );
    } catch (err) {
      console.error("Failed to log transaction:", err);
    }

    return originalSend.apply(res, arguments);
  };

  next();
}

module.exports = transactionLogger;
