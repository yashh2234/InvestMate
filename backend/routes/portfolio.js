// backend/routes/portfolio.js
const express = require("express");
const router = express.Router();
const {getPool} = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.get("/insights", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const pool = getPool();
  try {
    const [investments] = await pool.query(
      `SELECT i.amount, i.expected_return, p.risk_level
       FROM investments i
       JOIN investment_products p ON i.product_id = p.id
       WHERE i.user_id = ?`,
      [userId]
    );

    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    const riskDistribution = { low: 0, moderate: 0, high: 0 };
    investments.forEach(inv => {
      const level = inv.risk_level || "moderate";
      riskDistribution[level] += parseFloat(inv.amount);
    });

    // AI prompt
    const prompt = `User investments: ${JSON.stringify(investments)}\nGenerate portfolio insights.`;

    let aiText = "AI insights temporarily unavailable";

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });
      aiText = response.text || aiText;
    } catch (aiErr) {
      console.error("Gemini API error:", aiErr.message || aiErr);
    }

    res.json({ totalInvested, riskDistribution, aiText });

  } catch (err) {
    console.error("Portfolio insights error:", err);
    res.status(500).json({
      totalInvested: 0,
      riskDistribution: { low: 0, moderate: 0, high: 0 },
      aiText: "Failed to generate insights."
    });
  }
});

module.exports = router;
