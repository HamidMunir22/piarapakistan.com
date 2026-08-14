const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getPendingKyc,
  approveKyc,
  rejectKyc,
  getCommission,
  updateCommission,
  updateUserCommission,
  getStats,
  getAllUsers,
  suspendUser,
  unsuspendUser,
  getAllListingsAdmin,
  toggleListingAdmin,
  deleteListingAdmin,
  getAllOrdersAdmin,
  getAllComplaints,
  respondToComplaint,
  getBanks,
} = require("../controllers/adminController");

router.use(protect, authorize("admin"));

router.get("/stats", getStats);

router.get("/pending-kyc", getPendingKyc);
router.put("/kyc/:userId/approve", approveKyc);
router.put("/kyc/:userId/reject", rejectKyc);

router.get("/users", getAllUsers);
router.put("/users/:userId/suspend", suspendUser);
router.put("/users/:userId/unsuspend", unsuspendUser);
router.put("/users/:userId/commission", updateUserCommission);

router.get("/listings", getAllListingsAdmin);
router.put("/listings/:id/toggle", toggleListingAdmin);
router.delete("/listings/:id", deleteListingAdmin);

router.get("/orders", getAllOrdersAdmin);

router.get("/commission", getCommission);
router.put("/commission", updateCommission);

router.get("/complaints", getAllComplaints);
router.put("/complaints/:id", respondToComplaint);

router.get("/banks", getBanks);

module.exports = router;
