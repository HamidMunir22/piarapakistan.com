const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true }, // email or phone
    otp: { type: String, required: true },
    purpose: {
      type: String,
      enum: ["register", "login", "reset_password"],
      default: "register",
    },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-delete expired OTP documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", otpSchema);
