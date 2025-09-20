// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken, adminCheck } = require("../middleware/authMiddleware");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/me", verifyToken, authController.getCurrentUser);
router.post("/request-password-reset", authController.requestPasswordReset);
router.post("/reset-password", authController.resetPassword);
// backend/routes/authRoutes.js
router.get("/profile", verifyToken, authController.getCurrentUser);

router.put("/profile", verifyToken, authController.updateProfile);

module.exports = router;
