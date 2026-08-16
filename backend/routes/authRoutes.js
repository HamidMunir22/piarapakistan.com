const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect } = require("../middleware/auth");
const {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  verifyAdminOtp,
  resendAdminOtp,
  getMe,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

// Accept 3 possible image fields during registration
const registerUpload = upload.fields([
  { name: "idCardFrontImage", maxCount: 1 },
  { name: "idCardBackImage", maxCount: 1 },
  { name: "idCardSelfieImage", maxCount: 1 },
  { name: "profilePicture", maxCount: 1 },
]);

router.post("/register", registerUpload, registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", loginUser);
router.post("/verify-admin-otp", verifyAdminOtp);
router.post("/resend-admin-otp", resendAdminOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);

module.exports = router;
