const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
  createReview,
} = require("../controllers/orderController");

router.use(protect);

router.post("/", createOrder);
router.get("/mine", getMyOrders);
router.get("/seller", authorize("seller", "shop"), getSellerOrders);
router.put("/:id/status", authorize("seller", "shop", "admin"), updateOrderStatus);
router.post("/:id/review", createReview);

module.exports = router;
