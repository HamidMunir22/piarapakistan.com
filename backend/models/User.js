const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // ---- Basic Info (required from BOTH buyer & seller/shop) ----
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 6 },

    // ---- Role ----
    role: {
      type: String,
      enum: ["buyer", "seller", "shop", "admin"],
      required: true,
      default: "buyer",
    },

    // ---- KYC / Verification (required for seller & shop, for fraud prevention) ----
    cnicNumber: { type: String, trim: true }, // ID Card number
    idCardFrontImage: { type: String }, // file path
    idCardBackImage: { type: String }, // file path
    profilePicture: { type: String },

    // ---- Address / Location (used for map + nearby search) ----
    address: { type: String },
    city: { type: String },
    area: { type: String }, // neighbourhood / sector, used for "nearby first" search
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },

    // ---- Seller / Shop specific ----
    businessName: { type: String, trim: true }, // shop / service brand name
    category: { type: String }, // e.g. Electrician, AC Repair, Plumber, Electronics Shop
    subCategories: [{ type: String }],
    bio: { type: String, maxlength: 1000 },
    bankAccountTitle: { type: String },
    bankAccountNumber: { type: String },
    bankName: { type: String },

    // ---- Ratings ----
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    // ---- Verification & Trust / Safety flags ----
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    // Admin must approve seller/shop KYC documents before they can list services/products
    kycStatus: {
      type: String,
      enum: ["not_submitted", "pending", "approved", "rejected"],
      default: "not_submitted",
    },
    isSuspended: { type: Boolean, default: false }, // fraud / complaint action
    suspensionReason: { type: String },

    // ---- Commission (admin-controlled, can override the platform default per seller) ----
    commissionType: { type: String, enum: ["percent", "fixed", null], default: null }, // null = use global default
    commissionPercent: { type: Number, default: null }, // null = use global default
    commissionFixedAmount: { type: Number, default: null }, // PKR flat amount, used when commissionType = "fixed"

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Geo index for "nearby" search
userSchema.index({ location: "2dsphere" });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Never send password / sensitive fields back to client
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.cnicNumber;
  delete obj.bankAccountNumber;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
