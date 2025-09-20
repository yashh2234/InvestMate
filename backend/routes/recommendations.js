// backend/routes/recommendations.js
const express = require("express");
const router = express.Router();
const {getPool} = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");
const { suggestProductsAI } = require("../utils/aiProductRecommender");

// GET recommended products for logged-in user
router.get("/", verifyToken, async (req, res) => {
  const pool = getPool();
  try {
    const user = req.user;
    // Fetch all investment products
    const [products] = await pool.query(`
      SELECT id, name, investment_type, tenure_months, annual_yield, risk_level, description
      FROM investment_products
    `);

    // Use AI util to suggest product names
    let suggestedNames = await suggestProductsAI(user, products);

    // Fallback: if AI gives nothing, return top 5 products by yield within user's risk
    if (suggestedNames.length === 0) {
      suggestedNames = products
        .filter((p) => p.risk_level === user.risk_appetite)
        .sort((a, b) => b.annual_yield - a.annual_yield)
        .slice(0, 5)
        .map((p) => p.name);
    }

    // Match product objects
    const recommendedProducts = products.filter((p) =>
      suggestedNames.includes(p.name)
    );

    res.json({ recommendations: recommendedProducts });
  } catch (err) {
    console.error("Failed to get AI recommendations:", err.message);
    res.status(500).json({ message: "Failed to get recommendations" });
  }
});

module.exports = router;
