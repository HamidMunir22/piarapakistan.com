const mongoose = require("mongoose");
const Order = require("../models/Order");
const Listing = require("../models/Listing");
const User = require("../models/User");
const Review = require("../models/Review");
const PlatformSettings = require("../models/PlatformSettings");
const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS");
const { calculateCommission } = require("../utils/commission");

const formatPKR = (n) => `Rs. ${Number(n).toLocaleString("en-PK")}`;

// Commission (%, amount, and seller payout) is business-sensitive — only the
// seller who earns it and the platform admin should ever see it. Buyers only
// ever need to know the total they're paying, so we strip these three fields
// out of every response that goes back to a buyer.
const hideCommissionFromBuyer = (orderDoc) => {
  const obj = orderDoc.toObject ? orderDoc.toObject() : { ...orderDoc };
  delete obj.commissionType;
  delete obj.commissionPercent;
  delete obj.commissionAmount;
  delete obj.sellerPayout;
  return obj;
};

// ---------------------------------------------------------------------------
// POST /api/orders - buyer checks out ONE listing (frontend calls this once
// per cart line item / per seller so each order keeps a clean commission trail)
// ---------------------------------------------------------------------------
const createOrder = async (req, res) => {
  try {
    const { listingId, quantity = 1, paymentMethod = "cod", deliveryAddress, city, notes } = req.body;

    if (!listingId || !deliveryAddress || !city) {
      return res.status(400).json({ success: false, message: "Listing, delivery address aur city required hain" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing || !listing.isActive) {
      return res.status(404).json({ success: false, message: "Listing available nahi hai" });
    }

    if (String(listing.seller) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: "Aap apni hi listing order nahi kar sakte" });
    }

    if (listing.listingType === "product") {
      if (listing.stock === null || listing.stock < quantity) {
        return res.status(400).json({ success: false, message: "Kafi stock available nahi hai" });
      }
    }

    const seller = await User.findById(listing.seller);
    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });

    const settings = await PlatformSettings.getSettings();
    const unitPrice = listing.price;
    const totalAmount = unitPrice * quantity;
    const { commissionType, commissionPercent, commissionAmount, sellerPayout } = calculateCommission(
      seller,
      settings,
      totalAmount
    );

    const order = await Order.create({
      buyer: req.user._id,
      seller: seller._id,
      listing: listing._id,
      listingTitleSnapshot: listing.title,
      listingType: listing.listingType,
      quantity,
      unitPrice,
      totalAmount,
      commissionType,
      commissionPercent,
      commissionAmount,
      sellerPayout,
      paymentMethod,
      deliveryAddress,
      city,
      notes,
    });

    // Decrement stock for products, bump order counter on the listing
    if (listing.listingType === "product") {
      listing.stock -= quantity;
    }
    listing.orderCount += quantity;
    await listing.save();

    // ---- Receipt: email + SMS to buyer (per platform requirement) ----
    const receiptHtml = `
      <h2>Order Confirm ho gaya — ${order.orderNumber}</h2>
      <p>Assalam-o-Alaikum ${req.user.firstName},</p>
      <p>Aapka order successfully place ho gaya hai:</p>
      <table style="border-collapse:collapse;width:100%;max-width:420px">
        <tr><td style="padding:6px 0">Item</td><td style="padding:6px 0"><b>${order.listingTitleSnapshot}</b></td></tr>
        <tr><td style="padding:6px 0">Quantity</td><td style="padding:6px 0">${order.quantity}</td></tr>
        <tr><td style="padding:6px 0">Total Amount</td><td style="padding:6px 0"><b>${formatPKR(order.totalAmount)}</b></td></tr>
        <tr><td style="padding:6px 0">Payment</td><td style="padding:6px 0">${paymentMethod === "cod" ? "Cash on Delivery" : "Online"}</td></tr>
        <tr><td style="padding:6px 0">Delivery Address</td><td style="padding:6px 0">${deliveryAddress}, ${city}</td></tr>
      </table>
      <p>Order status track karne ke liye apne "My Orders" page par jayein.</p>
      <p>— Team PiaraPakistan</p>
    `;
    sendEmail(req.user.email, `Order Confirmed — ${order.orderNumber}`, receiptHtml);
    sendSMS(
      req.user.phone,
      `PiaraPakistan: Aapka order ${order.orderNumber} (${order.listingTitleSnapshot}) confirm ho gaya. Total: ${formatPKR(order.totalAmount)}. Shukriya!`
    );

    // ---- Notify the seller too: a new order needs their attention ----
    const sellerNoticeHtml = `
      <h2>New Order Received — ${order.orderNumber}</h2>
      <p>Assalam-o-Alaikum ${seller.firstName},</p>
      <p>Aapko ek naya order mila hai:</p>
      <table style="border-collapse:collapse;width:100%;max-width:420px">
        <tr><td style="padding:6px 0">Item</td><td style="padding:6px 0"><b>${order.listingTitleSnapshot}</b></td></tr>
        <tr><td style="padding:6px 0">Quantity</td><td style="padding:6px 0">${order.quantity}</td></tr>
        <tr><td style="padding:6px 0">Total Amount</td><td style="padding:6px 0"><b>${formatPKR(order.totalAmount)}</b></td></tr>
        <tr><td style="padding:6px 0">Payment</td><td style="padding:6px 0">${paymentMethod === "cod" ? "Cash on Delivery" : "Online"}</td></tr>
        <tr><td style="padding:6px 0">Delivery Address</td><td style="padding:6px 0">${deliveryAddress}, ${city}</td></tr>
      </table>
      <p>Order confirm/process karne ke liye apne "Orders" dashboard par jayein.</p>
      <p>— Team PiaraPakistan</p>
    `;
    sendEmail(seller.email, `New Order Received — ${order.orderNumber}`, sellerNoticeHtml);
    sendSMS(
      seller.phone,
      `PiaraPakistan: Naya order ${order.orderNumber} (${order.listingTitleSnapshot}) mila hai. Total: ${formatPKR(order.totalAmount)}. Dashboard check karein.`
    );

    return res.status(201).json({
      success: true,
      message: "Order place ho gaya",
      order: hideCommissionFromBuyer(order),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error placing order", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/orders/mine - buyer's own order history
// ---------------------------------------------------------------------------
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id })
    .sort({ createdAt: -1 })
    .populate("listing", "images")
    .populate("seller", "firstName lastName businessName phone");
  return res.json({ success: true, count: orders.length, orders: orders.map(hideCommissionFromBuyer) });
};

// ---------------------------------------------------------------------------
// GET /api/orders/seller - seller/shop's incoming orders
// ---------------------------------------------------------------------------
const getSellerOrders = async (req, res) => {
  const orders = await Order.find({ seller: req.user._id })
    .sort({ createdAt: -1 })
    .populate("listing", "images")
    .populate("buyer", "firstName lastName phone address city area");
  return res.json({ success: true, count: orders.length, orders });
};

// ---------------------------------------------------------------------------
// PUT /api/orders/:id/status - seller advances/cancels an order
// ---------------------------------------------------------------------------
const VALID_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const isOwner = String(order.seller) === String(req.user._id);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Sirf order ka seller ya admin status update kar sakta hai" });
    }

    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Order "${order.status}" se "${status}" mein move nahi ho sakta`,
      });
    }

    order.status = status;
    if (status === "cancelled") {
      order.cancelReason = cancelReason || "No reason provided";
      // Restock products if the order is cancelled
      if (order.listingType === "product") {
        await Listing.findByIdAndUpdate(order.listing, { $inc: { stock: order.quantity, orderCount: -order.quantity } });
      }
    }
    if (status === "completed" && order.paymentMethod === "cod") {
      order.paymentStatus = "paid"; // COD is settled on completion
    }

    await order.save();

    // Notify buyer of status change — SMS + email so it's never missed
    const buyer = await User.findById(order.buyer);
    if (buyer) {
      sendSMS(buyer.phone, `PiaraPakistan: Order ${order.orderNumber} ka status ab "${status}" hai.`);
      const statusLabels = {
        confirmed: "Confirmed",
        in_progress: "In Progress",
        completed: "Completed",
        cancelled: "Cancelled",
      };
      sendEmail(
        buyer.email,
        `Order ${order.orderNumber} — Status Update: ${statusLabels[status] || status}`,
        `<h2>Order Update — ${order.orderNumber}</h2>
         <p>Assalam-o-Alaikum ${buyer.firstName},</p>
         <p>Aapke order <b>${order.listingTitleSnapshot}</b> ka status ab <b>${statusLabels[status] || status}</b> hai.</p>
         ${status === "cancelled" ? `<p>Reason: ${order.cancelReason}</p>` : ""}
         <p>Details "My Orders" page par dekhi ja sakti hain.</p>
         <p>— Team PiaraPakistan</p>`
      );
    }

    return res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error updating order" });
  }
};

// ---------------------------------------------------------------------------
// POST /api/orders/:id/review - buyer reviews a completed order
// ---------------------------------------------------------------------------
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating 1 se 5 ke darmiyan honi chahiye" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (String(order.buyer) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Sirf order ka buyer review de sakta hai" });
    }
    if (order.status !== "completed") {
      return res.status(400).json({ success: false, message: "Sirf completed orders par review diya ja sakta hai" });
    }
    if (order.reviewed) {
      return res.status(400).json({ success: false, message: "Is order par pehle hi review diya ja chuka hai" });
    }

    const review = await Review.create({
      order: order._id,
      listing: order.listing,
      seller: order.seller,
      buyer: order.buyer,
      rating,
      comment,
    });

    order.reviewed = true;
    await order.save();

    // Recalculate listing rating
    const listing = await Listing.findById(order.listing);
    if (listing) {
      const newCount = listing.ratingCount + 1;
      listing.ratingAverage = (listing.ratingAverage * listing.ratingCount + rating) / newCount;
      listing.ratingCount = newCount;
      await listing.save();
    }

    // Recalculate seller's overall rating
    const seller = await User.findById(order.seller);
    if (seller) {
      const newCount = seller.ratingCount + 1;
      seller.ratingAverage = (seller.ratingAverage * seller.ratingCount + rating) / newCount;
      seller.ratingCount = newCount;
      await seller.save();
    }

    return res.status(201).json({ success: true, message: "Review submit ho gaya", review });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error submitting review" });
  }
};

module.exports = { createOrder, getMyOrders, getSellerOrders, updateOrderStatus, createReview };
