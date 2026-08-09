const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },

    // Snapshots at the time of order, so later edits to the listing/seller
    // don't change historical order records.
    listingTitleSnapshot: { type: String, required: true },
    listingType: { type: String, enum: ["service", "product"], required: true },

    quantity: { type: Number, default: 1, min: 1 },
    unitPrice: { type: Number, required: true }, // PKR
    totalAmount: { type: Number, required: true }, // PKR = unitPrice * quantity

    // ---- Commission (admin-controlled) - snapshot of what applied to THIS order ----
    commissionType: { type: String, enum: ["percent", "fixed"], required: true, default: "percent" },
    commissionPercent: { type: Number }, // only meaningful when commissionType = "percent"
    commissionAmount: { type: Number, required: true }, // platform's cut, PKR (always populated regardless of type)
    sellerPayout: { type: Number, required: true }, // totalAmount - commissionAmount

    paymentMethod: { type: String, enum: ["cod", "online"], default: "cod" },
    paymentStatus: { type: String, enum: ["pending", "paid", "refunded"], default: "pending" },

    status: {
      type: String,
      enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    cancelReason: { type: String },

    deliveryAddress: { type: String, required: true },
    city: { type: String, required: true },
    notes: { type: String, maxlength: 500 },

    reviewed: { type: Boolean, default: false },

    // Human-friendly, sequential-looking order number for receipts/SMS (e.g. PP-000123)
    orderNumber: { type: String, unique: true },
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `PP-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
