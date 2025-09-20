const express = require("express");
const router = express.Router();
const {getPool} = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

// PUT /profile — update user profile (risk appetite)
router.put("/", verifyToken, async (req, res) => {
  const pool = getPool();
  const userId = req.user?.id;
  const { risk_appetite } = req.body;

  console.log("PUT /profile payload:", req.body);
  console.log("User ID from token:", userId);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!["low", "moderate", "high"].includes(risk_appetite)) {
    return res.status(400).json({ message: "Invalid risk appetite value" });
  }

  try {
    // Update the user's risk appetite
    const [updateResult] = await pool.query(
      "UPDATE users SET risk_appetite = ? WHERE id = ?",
      [risk_appetite, userId]
    );

    console.log("Update result:", updateResult);

    // Fetch the updated user
    const [updatedRows] = await pool.query(
      "SELECT id, first_name, last_name, email, risk_appetite FROM users WHERE id = ?",
      [userId]
    );

    if (updatedRows.length === 0) {
      return res.status(404).json({ message: "User not found after update" });
    }

    // Return updated user object
    res.json(updatedRows[0]);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

module.exports = router;
