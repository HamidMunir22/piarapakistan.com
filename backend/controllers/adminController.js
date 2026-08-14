const User = require("../models/User");
const Listing = require("../models/Listing");
const Order = require("../models/Order");
const Complaint = require("../models/Complaint");
const PlatformSettings = require("../models/PlatformSettings");
const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS");
const { BANKS } = require("../utils/banks");

// GET /api/admin/pending-kyc - sellers/shops waiting for approval
const getPendingKyc = async (req, res) => {
  const users = await User.find({ role: { $in: ["seller", "shop"] }, kycStatus: "pending" }).select(
    "-password"
  );
  return res.json({ success: true, count: users.length, users });
};

// PUT /api/admin/kyc/:userId/approve
// Fires an instant email + SMS notification the moment admin approves —
// even if that happens 5 minutes after signup, not after the full 24 hours.
const approveKyc = async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  user.kycStatus = "approved";
  user.kycDecisionAt = new Date();
  await user.save();

  sendEmail(
    user.email,
    "Your PiaraPakistan account is verified!",
    `<h2>Congratulations, ${user.firstName}!</h2>
     <p>Your account has been verified by our team. You can now start listing your ${
       user.role === "shop" ? "products" : "services"
     } on PiaraPakistan.</p>
     <p>— Team PiaraPakistan</p>`
  );
  sendSMS(user.phone, `PiaraPakistan: Your account has been verified! You can now start listing on the platform.`);

  return res.json({ success: true, message: `${user.firstName}'s KYC approved`, user: user.toSafeObject() });
};

// PUT /api/admin/kyc/:userId/reject
const rejectKyc = async (req, res) => {
  const { reason } = req.body;
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  user.kycStatus = "rejected";
  user.kycDecisionAt = new Date();
  await user.save();

  sendEmail(
    user.email,
    "Your PiaraPakistan verification was not approved",
    `<h2>Hi ${user.firstName},</h2>
     <p>Unfortunately we couldn't verify your account documents.${reason ? ` Reason: ${reason}` : ""}</p>
     <p>Please contact support or re-submit correct documents.</p>
     <p>— Team PiaraPakistan</p>`
  );
  sendSMS(user.phone, `PiaraPakistan: Your account verification was not approved. Please contact support.`);

  return res.json({ success: true, message: `${user.firstName}'s KYC rejected`, user: user.toSafeObject() });
};

// GET /api/admin/banks - list of supported payout banks/wallets (for reference/admin UI)
const getBanks = async (req, res) => {
  return res.json({ success: true, banks: BANKS });
};

// GET /api/admin/commission - global default commission %
const getCommission = async (req, res) => {
  const settings = await PlatformSettings.getSettings();
  return res.json({
    success: true,
    commissionType: settings.commissionType,
    commissionPercent: settings.commissionPercent,
    commissionFixedAmount: settings.commissionFixedAmount,
  });
};

// PUT /api/admin/commission - update global default commission (percent OR fixed PKR)
const updateCommission = async (req, res) => {
  const { commissionType, commissionPercent, commissionFixedAmount } = req.body;

  if (!["percent", "fixed"].includes(commissionType)) {
    return res.status(400).json({ success: false, message: "commissionType 'percent' ya 'fixed' hona chahiye" });
  }
  if (commissionType === "percent" && (commissionPercent === undefined || commissionPercent < 0 || commissionPercent > 100)) {
    return res.status(400).json({ success: false, message: "Commission percentage 0 se 100 ke darmiyan honi chahiye" });
  }
  if (commissionType === "fixed" && (commissionFixedAmount === undefined || commissionFixedAmount < 0)) {
    return res.status(400).json({ success: false, message: "Fixed commission amount 0 ya zyada honi chahiye" });
  }

  const settings = await PlatformSettings.getSettings();
  settings.commissionType = commissionType;
  if (commissionType === "percent") settings.commissionPercent = commissionPercent;
  if (commissionType === "fixed") settings.commissionFixedAmount = commissionFixedAmount;
  await settings.save();

  return res.json({
    success: true,
    message: "Global commission update ho gayi",
    commissionType: settings.commissionType,
    commissionPercent: settings.commissionPercent,
    commissionFixedAmount: settings.commissionFixedAmount,
  });
};

// PUT /api/admin/users/:userId/commission - per-seller override (send commissionType: null to clear override)
const updateUserCommission = async (req, res) => {
  const { commissionType, commissionPercent, commissionFixedAmount } = req.body;
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  if (!["seller", "shop"].includes(user.role)) {
    return res.status(400).json({ success: false, message: "Sirf seller/shop ke liye commission override set ho sakta hai" });
  }

  if (!commissionType) {
    // Clear the override - this seller goes back to using the global default
    user.commissionType = null;
    user.commissionPercent = null;
    user.commissionFixedAmount = null;
  } else {
    if (!["percent", "fixed"].includes(commissionType)) {
      return res.status(400).json({ success: false, message: "commissionType 'percent' ya 'fixed' hona chahiye" });
    }
    user.commissionType = commissionType;
    user.commissionPercent = commissionType === "percent" ? commissionPercent : null;
    user.commissionFixedAmount = commissionType === "fixed" ? commissionFixedAmount : null;
  }

  await user.save();
  return res.json({ success: true, message: "Seller commission override update ho gaya", user: user.toSafeObject() });
};

// ---------------------------------------------------------------------------
// GET /api/admin/stats - dashboard overview numbers
// ---------------------------------------------------------------------------
const getStats = async (req, res) => {
  const [
    totalUsers,
    totalBuyers,
    totalSellers,
    totalShops,
    pendingKyc,
    totalListings,
    activeListings,
    totalOrders,
    completedOrders,
    openComplaints,
  ] = await Promise.all([
    User.countDocuments({ role: { $ne: "admin" } }),
    User.countDocuments({ role: "buyer" }),
    User.countDocuments({ role: "seller" }),
    User.countDocuments({ role: "shop" }),
    User.countDocuments({ role: { $in: ["seller", "shop"] }, kycStatus: "pending" }),
    Listing.countDocuments(),
    Listing.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.countDocuments({ status: "completed" }),
    Complaint.countDocuments({ status: { $in: ["open", "in_progress"] } }),
  ]);

  const revenueAgg = await Order.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, totalCommission: { $sum: "$commissionAmount" }, totalGMV: { $sum: "$totalAmount" } } },
  ]);
  const totalCommission = revenueAgg[0]?.totalCommission || 0;
  const totalGMV = revenueAgg[0]?.totalGMV || 0;

  return res.json({
    success: true,
    stats: {
      totalUsers,
      totalBuyers,
      totalSellers,
      totalShops,
      pendingKyc,
      totalListings,
      activeListings,
      totalOrders,
      completedOrders,
      openComplaints,
      totalCommission,
      totalGMV,
    },
  });
};

// ---------------------------------------------------------------------------
// GET /api/admin/users - list/search all users
// ---------------------------------------------------------------------------
const getAllUsers = async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { firstName: new RegExp(search, "i") },
      { lastName: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
      { phone: new RegExp(search, "i") },
      { businessName: new RegExp(search, "i") },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);
  return res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

// ---------------------------------------------------------------------------
// PUT /api/admin/users/:userId/suspend | /unsuspend - fraud/abuse control
// ---------------------------------------------------------------------------
const suspendUser = async (req, res) => {
  const { reason } = req.body;
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  if (user.role === "admin") {
    return res.status(400).json({ success: false, message: "Admin account suspend nahi ho sakta" });
  }
  user.isSuspended = true;
  user.suspensionReason = reason || "Policy violation";
  await user.save();
  return res.json({ success: true, message: `${user.firstName} suspend kar diya gaya`, user: user.toSafeObject() });
};

const unsuspendUser = async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  user.isSuspended = false;
  user.suspensionReason = undefined;
  await user.save();
  return res.json({ success: true, message: `${user.firstName} unsuspend kar diya gaya`, user: user.toSafeObject() });
};

// ---------------------------------------------------------------------------
// GET /api/admin/listings - moderate all listings
// ---------------------------------------------------------------------------
const getAllListingsAdmin = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const filter = {};
  if (search) filter.title = new RegExp(search, "i");
  const skip = (Number(page) - 1) * Number(limit);
  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .populate("seller", "firstName lastName businessName role kycStatus")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Listing.countDocuments(filter),
  ]);
  return res.json({ success: true, listings, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

// PUT /api/admin/listings/:id/toggle - approve/pause a listing (moderation)
const toggleListingAdmin = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });
  const { isActive, isApproved } = req.body;
  if (isActive !== undefined) listing.isActive = isActive;
  if (isApproved !== undefined) listing.isApproved = isApproved;
  await listing.save();
  return res.json({ success: true, message: "Listing update ho gayi", listing });
};

const deleteListingAdmin = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });
  await listing.deleteOne();
  return res.json({ success: true, message: "Listing delete ho gayi" });
};

// ---------------------------------------------------------------------------
// GET /api/admin/orders - full order oversight
// ---------------------------------------------------------------------------
const getAllOrdersAdmin = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("buyer", "firstName lastName phone")
      .populate("seller", "firstName lastName businessName phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Order.countDocuments(filter),
  ]);
  return res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

// ---------------------------------------------------------------------------
// Complaints (Help Center) — admin side
// ---------------------------------------------------------------------------
const getAllComplaints = async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const complaints = await Complaint.find(filter)
    .populate("user", "firstName lastName email phone role")
    .populate("againstUser", "firstName lastName businessName")
    .populate("order", "orderNumber")
    .sort({ createdAt: -1 });
  return res.json({ success: true, count: complaints.length, complaints });
};

const respondToComplaint = async (req, res) => {
  const { status, adminReply } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

  if (status) complaint.status = status;
  if (adminReply !== undefined) complaint.adminReply = adminReply;
  if (["resolved", "rejected"].includes(status)) complaint.resolvedAt = new Date();

  await complaint.save();
  return res.json({ success: true, message: "Complaint update ho gayi", complaint });
};

module.exports = {
  getPendingKyc,
  approveKyc,
  rejectKyc,
  getBanks,
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
};
