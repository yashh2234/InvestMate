// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const {getPool} = require("../db");
const { verifyToken, adminCheck } = require("../middleware/authMiddleware");

// GET aggregated platform stats (Admins only)
router.get("/platform-stats", verifyToken, adminCheck, async (req, res) => {
  const pool = getPool();
  try {
    const [userRows] = await pool.query("SELECT COUNT(*) as totalUsers FROM users");
    const [investRows] = await pool.query(
      "SELECT COALESCE(SUM(amount),0) as totalInvested FROM investments"
    );
    const [productRows] = await pool.query(
      "SELECT COUNT(*) as activeProducts FROM investment_products"
    );

    res.json({
      totalUsers: userRows[0]?.totalUsers || 0,
      totalInvested: investRows[0]?.totalInvested || 0,
      activeProducts: productRows[0]?.activeProducts || 0,
    });
  } catch (err) {
    console.error("Failed to fetch platform stats:", err);
    res.status(500).json({ message: "Failed to fetch platform stats" });
  }
});


module.exports = router;
