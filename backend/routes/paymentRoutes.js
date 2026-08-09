const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  initiatePayment,
  confirmMockPayment,
  jazzcashCallback,
  getPaymentStatus,
} = require("../controllers/paymentController");

router.post("/initiate", protect, initiatePayment);
router.post("/mock/:intentId/confirm", protect, confirmMockPayment);
router.get("/status/:intentId", protect, getPaymentStatus);

// JazzCash posts back to this URL directly (not through our frontend), so no auth middleware here
router.post("/jazzcash/callback", jazzcashCallback);

module.exports = router;
