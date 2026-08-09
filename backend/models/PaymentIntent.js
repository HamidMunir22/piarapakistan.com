const mongoose = require("mongoose");

const paymentIntentSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true }],

    txnRefNo: { type: String, required: true, unique: true }, // sent to gateway as pp_TxnRefNo
    provider: { type: String, enum: ["jazzcash", "easypaisa", "mock"], required: true },
    amount: { type: Number, required: true }, // PKR, sum of all orders in this intent

    status: {
      type: String,
      enum: ["initiated", "paid", "failed", "cancelled"],
      default: "initiated",
    },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed }, // raw callback payload, for audit/reconciliation
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentIntent", paymentIntentSchema);
