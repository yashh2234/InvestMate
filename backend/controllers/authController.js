const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getPool } = require("../db");
const nodemailer = require("nodemailer");
const { checkPasswordStrength } = require("../utils/passwordStrength");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();
const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

// ------------------ Nodemailer Setup ------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

// ------------------ Signup ------------------
exports.signup = async (req, res) => {
  const { first_name, last_name, email, password, risk_appetite } = req.body;

  if (!first_name || !email || !password)
    return res.status(400).json({ message: "Missing required fields" });

  try {
    const pool = getPool();
    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0)
      return res.status(400).json({ message: "User already exists" });

    // Password strength check
    const suggestions = checkPasswordStrength({ password });
    if (suggestions.length)
      return res.status(400).json({ message: "Weak password", suggestions });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (first_name, last_name, email, password_hash, risk_appetite, role) VALUES (?, ?, ?, ?, ?, ?)",
      [
        first_name,
        last_name || null,
        email,
        hashedPassword,
        risk_appetite || "moderate",
        "user",
      ]
    );

    const [userRows] = await pool.query(
      "SELECT id, email FROM users WHERE email = ?",
      [email]
    );
    const token = jwt.sign(
      { id: userRows[0].id, email: userRows[0].email},
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Signup error:", err);
    res
      .status(500)
      .json({ message: "Signup failed", error: err.sqlMessage || err.message });
  }
};

// ------------------ Login ------------------
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing email or password" });

  try {
    const pool = getPool();
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0)
      return res.status(400).json({ message: "Invalid credentials" });

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        risk_appetite: user.risk_appetite,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ message: "Login failed", error: err.sqlMessage || err.message });
  }
};

// ------------------ Get Current User ------------------
exports.getCurrentUser = async (req, res) => {
  try {
    const pool = getPool();
    const [users] = await pool.query(
      "SELECT id, first_name, last_name, email, risk_appetite, role FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!users.length)
      return res.status(404).json({ message: "User not found" });
    res.json({ user: users[0] });
  } catch (err) {
    console.error("Auth/me error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: err.message });
  }
};

// ------------------ Reset Password ------------------
exports.resetPassword = async (req, res) => {
  console.log("Reset request payload:", req.body);
  const { email, otp, token, new_password } = req.body;
  try {
    const pool = getPool();
    let user;

    if (otp) {
      const [rows] = await pool.query(
        "SELECT * FROM users WHERE email=? AND otp=?",
        [email, otp]
      );
      if (!rows.length) return res.status(400).json({ message: "Invalid OTP" });
      user = rows[0];
      if (new Date() > new Date(user.otp_expiry))
        return res.status(400).json({ message: "OTP expired" });
    } else if (token) {
      const [rows] = await pool.query(
        "SELECT * FROM users WHERE email=? AND reset_token=?",
        [email, token]
      );
      if (!rows.length)
        return res.status(400).json({ message: "Invalid or expired token" });
      user = rows[0];
      if (new Date() > new Date(user.reset_expiry))
        return res.status(400).json({ message: "Token expired" });
    } else {
      return res.status(400).json({ message: "OTP or token required" });
    }

    // Password strength check
    const suggestions = checkPasswordStrength({ password: new_password });
    if (suggestions.length)
      return res.status(400).json({ message: "Weak password", suggestions });

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.query(
      "UPDATE users SET password_hash=?, otp=NULL, otp_expiry=NULL, reset_token=NULL, reset_expiry=NULL WHERE email=?",
      [hashedPassword, email]
    );

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res
      .status(500)
      .json({ message: "Failed to reset password", error: err.message });
  }
};

// ------------------ Request Password Reset ------------------
exports.requestPasswordReset = async (req, res) => {
  const { email, mode = "otp" } = req.body;
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!rows.length)
      return res.status(400).json({ message: "Email not found" });

    if (mode === "otp") {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 10 * 60000);
      await pool.query(
        "UPDATE users SET otp=?, otp_expiry=?, reset_token=NULL, reset_expiry=NULL WHERE email=?",
        [otp, expiry, email]
      );

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is: ${otp} (valid for 10 minutes)`,
      });
    } else {
      const token = uuidv4();
      const expiry = new Date(Date.now() + 60 * 60000); // 1h expiry
      await pool.query(
        "UPDATE users SET reset_token=?, reset_expiry=?, otp=NULL, otp_expiry=NULL WHERE email=?",
        [token, expiry, email]
      );

      const resetLink = `${
        process.env.CLIENT_URL
      }/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Password Reset Link",
        text: `Click this link to reset your password:\n\n${resetLink}\n\nValid for 1 hour.`,
      });
    }

    res.json({ message: "Password reset instructions sent" });
  } catch (err) {
    console.error("Request password reset error:", err);
    res
      .status(500)
      .json({ message: "Failed to send reset", error: err.message });
  }
};

// ------------------ Update Profile ------------------
exports.updateProfile = async (req, res) => {
  const { risk_appetite } = req.body;
  try {
    const pool = getPool();
    if (!["low", "moderate", "high"].includes(risk_appetite)) {
      return res.status(400).json({ message: "Invalid risk appetite value" });
    }

    await pool.query("UPDATE users SET risk_appetite=? WHERE id=?", [
      risk_appetite,
      req.user.id,
    ]);

    const [users] = await pool.query(
      "SELECT id, first_name, last_name, email, risk_appetite, role FROM users WHERE id=?",
      [req.user.id]
    );

    res.json(users[0]);
  } catch (err) {
    console.error("Update profile error:", err);
    res
      .status(500)
      .json({ message: "Failed to update profile", error: err.message });
  }
};
