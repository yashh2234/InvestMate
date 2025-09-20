// backend/routes/products.js
const express = require("express");
const router = express.Router();
const { getPool } = require("../db");
const { v4: uuidv4 } = require("uuid");
const { verifyToken, adminCheck } = require("../middleware/authMiddleware");

// CREATE product → admin only
router.post("/", verifyToken, adminCheck, async (req, res) => {
  const pool = getPool();
  const {
    name,
    investment_type,
    tenure_months,
    annual_yield,
    risk_level,
    min_investment,
    max_investment,
    description,
  } = req.body;
  const id = uuidv4();

  try {
    await pool.query(
      `INSERT INTO investment_products (id, name, investment_type, tenure_months, annual_yield, risk_level, min_investment, max_investment, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        investment_type,
        tenure_months,
        annual_yield,
        risk_level,
        min_investment,
        max_investment,
        description,
      ]
    );
    res.status(201).json({ message: "Product created", productId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE product → admin only
router.put("/:id", verifyToken, adminCheck, async (req, res) => {
  const pool = getPool();
  const { id } = req.params;
  const {
    name,
    investment_type,
    tenure_months,
    annual_yield,
    risk_level,
    min_investment,
    max_investment,
    description,
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE investment_products
       SET name=?, investment_type=?, tenure_months=?, annual_yield=?, risk_level=?, min_investment=?, max_investment=?, description=?, updated_at=NOW()
       WHERE id=?`,
      [
        name,
        investment_type,
        tenure_months,
        annual_yield,
        risk_level,
        min_investment,
        max_investment,
        description,
        id,
      ]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE product → admin only
router.delete("/:id", verifyToken, adminCheck, async (req, res) => {
  const pool = getPool();
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      `DELETE FROM investment_products WHERE id=?`,
      [id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET all products → anyone
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [products] = await pool.query(`SELECT * FROM investment_products`);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// backend/routes/products.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/generate-description", async (req, res) => {
  const {
    name,
    investment_type,
    tenure_months,
    annual_yield,
    risk_level,
    min_investment,
    max_investment,
  } = req.body;

  try {
    const prompt = `
Write a professional, clear, and engaging investment product description.
Product Name: ${name}
Type: ${investment_type}
Tenure: ${tenure_months} months
Annual Yield: ${annual_yield}%
Risk Level: ${risk_level}
Minimum Investment: ₹${min_investment}
Maximum Investment: ${max_investment || "Not specified"}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const description = result.response.text();

    res.json({ description });
  } catch (err) {
    console.error("Gemini description error:", err);
    res.status(500).json({
      message: "Failed to generate description",
      error: err.message,
    });
  }
});

// GET recommended products based on user risk appetite
router.get("/recommended", verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const [products] = await pool.query(
      "SELECT * FROM investment_products ORDER BY annual_yield DESC"
    );

    const userRisk = req.user.risk_appetite || "moderate";
    const recommended = products.filter(p => p.risk_level === userRisk);

    res.json(recommended); // returns array directly
  } catch (err) {
    console.error("Failed to fetch recommended products:", err.message);
    res.status(500).json({ message: "Failed to fetch recommended products" });
  }
});


module.exports = router;
