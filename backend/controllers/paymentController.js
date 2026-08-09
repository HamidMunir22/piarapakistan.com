const crypto = require("crypto");
const Order = require("../models/Order");
const PaymentIntent = require("../models/PaymentIntent");
const jazzcash = require("../utils/jazzcash");
const easypaisa = require("../utils/easypaisa");
const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS");

const generateTxnRef = () => `PP${Date.now()}${Math.floor(Math.random() * 1000)}`;

// ---------------------------------------------------------------------------
// POST /api/payments/initiate - start online payment for one or more orders
// body: { orderIds: [...], provider: "jazzcash" | "easypaisa", mobileNumber? }
// ---------------------------------------------------------------------------
const initiatePayment = async (req, res) => {
  try {
    const { orderIds, provider, mobileNumber } = req.body;
    if (!orderIds?.length || !provider) {
      return res.status(400).json({ success: false, message: "Order IDs aur provider zaroori hain" });
    }

    const orders = await Order.find({ _id: { $in: orderIds }, buyer: req.user._id });
    if (orders.length !== orderIds.length) {
      return res.status(404).json({ success: false, message: "Kuch orders nahi milay ya aapke nahi hain" });
    }
    if (orders.some((o) => o.paymentStatus === "paid")) {
      return res.status(400).json({ success: false, message: "Kuch orders pehle hi paid hain" });
    }

    const amount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const txnRefNo = generateTxnRef();

    // ---- Decide real gateway vs mock (sandbox demo) mode ----
    const gatewayReady =
      (provider === "jazzcash" && jazzcash.isConfigured()) ||
      (provider === "easypaisa" && easypaisa.isConfigured());

    const intent = await PaymentIntent.create({
      buyer: req.user._id,
      orders: orders.map((o) => o._id),
      txnRefNo,
      provider: gatewayReady ? provider : "mock",
      amount,
    });

    await Order.updateMany({ _id: { $in: orderIds } }, { paymentStatus: "pending_online" });

    if (!gatewayReady) {
      // ---- MOCK MODE: no real merchant credentials configured yet ----
      return res.json({
        success: true,
        mode: "mock",
        intentId: intent._id,
        amount,
        message: "Payment gateway credentials abhi configure nahi hain — test/mock mode mein chal raha hai.",
      });
    }

    if (provider === "jazzcash") {
      const returnUrl = `${process.env.SERVER_URL || "http://localhost:5000"}/api/payments/jazzcash/callback`;
      const { actionUrl, fields } = jazzcash.buildCheckoutForm({
        txnRefNo,
        amountPKR: amount,
        returnUrl,
        description: `PiaraPakistan Order Payment (${orders.length} order(s))`,
      });
      return res.json({ success: true, mode: "redirect", actionUrl, fields, intentId: intent._id });
    }

    if (provider === "easypaisa") {
      if (!mobileNumber) {
        return res.status(400).json({ success: false, message: "Easypaisa ke liye mobile number zaroori hai" });
      }
      const result = await easypaisa.initiateMATransaction({
        orderId: txnRefNo,
        amountPKR: amount,
        mobileNumber,
      });
      return res.json({ success: true, mode: "easypaisa_ma", intentId: intent._id, gatewayResponse: result });
    }

    return res.status(400).json({ success: false, message: "Unsupported payment provider" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Payment initiate karne mein masla hua", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// POST /api/payments/mock/:intentId/confirm - simulate a successful payment
// (only reachable in mock mode - i.e. when no real gateway is configured)
// ---------------------------------------------------------------------------
const confirmMockPayment = async (req, res) => {
  const intent = await PaymentIntent.findById(req.params.intentId);
  if (!intent) return res.status(404).json({ success: false, message: "Payment intent not found" });
  if (String(intent.buyer) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }
  if (intent.provider !== "mock") {
    return res.status(400).json({ success: false, message: "Ye asal gateway se guzar raha hai, mock confirm nahi ho sakta" });
  }

  intent.status = "paid";
  await intent.save();
  await Order.updateMany({ _id: { $in: intent.orders } }, { paymentStatus: "paid" });

  const orders = await Order.find({ _id: { $in: intent.orders } });
  sendSMS(req.user.phone, `PiaraPakistan: Rs. ${intent.amount} ka payment mukammal ho gaya (Test Mode). Shukriya!`);

  return res.json({ success: true, message: "Payment confirm ho gaya (mock)", orders });
};

// ---------------------------------------------------------------------------
// POST /api/payments/jazzcash/callback - JazzCash redirects the browser here
// with pp_ResponseCode etc. after the customer completes/cancels payment.
// ---------------------------------------------------------------------------
const jazzcashCallback = async (req, res) => {
  try {
    const body = req.body;
    const validHash = jazzcash.verifyCallback(body);
    const intent = await PaymentIntent.findOne({ txnRefNo: body.pp_TxnRefNo });

    if (!intent || !validHash) {
      return res.redirect(`${process.env.CLIENT_URL}/payment-result?status=invalid`);
    }

    intent.gatewayResponse = body;

    if (body.pp_ResponseCode === "000") {
      intent.status = "paid";
      await Order.updateMany({ _id: { $in: intent.orders } }, { paymentStatus: "paid" });
    } else {
      intent.status = "failed";
    }
    await intent.save();

    return res.redirect(
      `${process.env.CLIENT_URL}/payment-result?status=${intent.status}&ref=${intent.txnRefNo}`
    );
  } catch (error) {
    console.error(error);
    return res.redirect(`${process.env.CLIENT_URL}/payment-result?status=error`);
  }
};

// ---------------------------------------------------------------------------
// GET /api/payments/status/:intentId - poll payment status (used by frontend
// return page for whichever provider was used)
// ---------------------------------------------------------------------------
const getPaymentStatus = async (req, res) => {
  const intent = await PaymentIntent.findById(req.params.intentId);
  if (!intent) return res.status(404).json({ success: false, message: "Not found" });
  return res.json({ success: true, status: intent.status, amount: intent.amount, provider: intent.provider });
};

module.exports = { initiatePayment, confirmMockPayment, jazzcashCallback, getPaymentStatus };
