// backend/routes/investments.js
const express = require("express");
const router = express.Router();
const {getPool} = require("../db");
const { v4: uuidv4 } = require("uuid");
const { verifyToken } = require("../middleware/authMiddleware");
const transactionLogger = require("../middleware/transactionLogger");

// POST invest in a product
router.post("/", verifyToken, transactionLogger, async (req, res) => {
  const pool = getPool();
  const { product_id, amount } = req.body;
  const user_id = req.user.id;

  try {
    const [[user]] = await pool.query(`SELECT * FROM users WHERE id=?`, [user_id]);
    if (!user) return res.status(404).json({ message: "User not found" });

    const [[product]] = await pool.query(`SELECT * FROM investment_products WHERE id=?`, [product_id]);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const riskLevels = { low: 1, moderate: 2, high: 3 };
    if (riskLevels[product.risk_level] > riskLevels[user.risk_appetite])
      return res.status(400).json({ message: "Product risk exceeds your risk appetite" });

    const expected_return = amount + (amount * (product.annual_yield / 100) * (product.tenure_months / 12));
    const maturity_date = new Date();
    maturity_date.setMonth(maturity_date.getMonth() + product.tenure_months);

    const id = uuidv4();
    await pool.query(
      `INSERT INTO investments (id, user_id, product_id, amount, expected_return, maturity_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, user_id, product_id, amount, expected_return, maturity_date]
    );

    res.status(201).json({ message: "Investment successful", investmentId: id, expected_return, maturity_date });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET user's portfolio
router.get("/", verifyToken, transactionLogger, async (req, res) => {
  const user_id = req.user.id;
  try {
    const pool = getPool();
    const [investments] = await pool.query(`
      SELECT i.*, p.name, p.investment_type, p.risk_level
      FROM investments i
      JOIN investment_products p ON i.product_id = p.id
      WHERE i.user_id=?
    `, [user_id]);
    res.json(investments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
