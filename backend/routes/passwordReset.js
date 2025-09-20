// backend/routes/passwordreset.js
const express = require("express");
const router = express.Router();
const { sendOTPEmail } = require("../utils/mailer");
const {getPool} = require("../db"); // MySQL connection

// OTP storage (in-memory for project demo)
const otpStore = {};

router.post("/request-reset", async (req, res) => {
  const pool = getPool();
  const { email } = req.body;

  // Check if user exists
  const [user] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
  if (!user.length) return res.status(404).json({ message: "User not found" });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

  // Send OTP email
  await sendOTPEmail(email, otp);

  res.json({ message: "OTP sent to your email" });
});

module.exports = router;
