const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who filed it
    againstUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional - who it's about (fraud reports)
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // optional - related order

    subject: { type: String, required: true, maxlength: 150 },
    message: { type: String, required: true, maxlength: 2000 },
    category: {
      type: String,
      enum: ["fraud", "payment", "quality", "delivery", "account", "other"],
      default: "other",
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "rejected"],
      default: "open",
    },
    adminReply: { type: String, maxlength: 2000 },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

complaintSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Complaint", complaintSchema);
