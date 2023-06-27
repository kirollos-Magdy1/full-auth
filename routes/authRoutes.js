const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authentication");
const { verifyNoTokens } = require("../middleware/verifyNoTokens");

const {
  registerValidator,
  verifyEmailValidator,
  loginValidator,
  completeVerificationValidator,
} = require("../validators/authValidators");

const {
  register,
  completeVerification,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
} = require("../controllers/authController");

router.post("/register", registerValidator, register);
router.post("/verify-email", verifyEmailValidator, verifyEmail);
router.post(
  "/complete-verification-email",
  completeVerificationValidator,
  completeVerification
);

router.post("/login", loginValidator, login);
router.post("/logout", authenticate, logout);

router.post("/forgot-password", verifyNoTokens, forgotPassword);
router.post("/verify-reset-password", verifyNoTokens, verifyPassResetCode);
router.post("/reset-password", verifyNoTokens, resetPassword);

module.exports = router;
