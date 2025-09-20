// server.js
// =======================
// IMPORTS
// =======================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { initDB, getPool } = require("./db"); // ✅ Correct import
const nodemailer = require("nodemailer");
const { checkPasswordStrength } = require("./utils/passwordStrength");
const { verifyToken, adminCheck } = require("./middleware/authMiddleware");
const transactionLogger = require("./middleware/transactionLogger");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());
app.use("/admin", adminRoutes);

// --- Config ---
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

// =======================
// Initialize DB
// =======================
initDB()
  .then(() => console.log("✅ Database initialized"))
  .catch((err) => console.error("❌ DB init failed:", err.message));

// =======================
// HEALTH CHECK
// =======================
app.get("/health", async (req, res) => {
  try {
    const pool = getPool(); // ✅ Get the actual pool object
    const [result] = await pool.query("SELECT 1 AS db_check");

    res.status(200).json({
      status: "OK",
      db: result[0].db_check === 1 ? "Connected" : "Error",
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Health check error:", err.message);
    res.status(500).json({
      status: "FAIL",
      db: "Disconnected",
      error: err.message,
      timestamp: new Date(),
    });
  }
});

// =======================
// Nodemailer Setup
// =======================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

// =======================
// ROUTES
// =======================
app.use("/auth", authRoutes);

const transactionLogsRoutes = require("./routes/transactionLogs");
app.use("/transaction-logs", verifyToken, transactionLogger, transactionLogsRoutes);

const productsRouter = require("./routes/products");
const investmentsRoutes = require("./routes/investments");
const recommendationsRouter = require("./routes/recommendations");
const portfolioRoutes = require("./routes/portfolio");
const profileRoutes = require("./routes/profile");

// Products (protected, admin inside routes)
app.use("/products", verifyToken, transactionLogger, productsRouter);

// Investments (protected)
app.use("/investments", verifyToken, transactionLogger, investmentsRoutes);

// Recommendations (protected)
app.use("/recommendations", recommendationsRouter);

// Portfolio Insights (protected)
app.use("/portfolio", portfolioRoutes);

// User Profile (protected)
app.use("/profile", profileRoutes);

// =======================
// AI Hooks Placeholder
// =======================
const aiUtils = {
  generateProductDescription: (product) =>
    `Invest in ${product.name}, a ${product.investment_type} with ${product.annual_yield}% yield.`,
  recommendProducts: (user, products) => products.slice(0, 3),
  portfolioInsights: (investments) => ({
    total: investments.length,
    highRisk: investments.filter((i) => i.risk_level === "high").length,
  }),
  summarizeErrors: (logs) =>
    logs.map((log) => ({ endpoint: log.endpoint, status: log.status })),
};

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
