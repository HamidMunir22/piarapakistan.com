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

    // ---- KYC / Verification ----
    // Buyers: identity docs are NOT required (profilePicture optional too).
    // Sellers/Shops: cnicNumber + ID card front/back + a selfie holding the ID
    // card are mandatory (fraud prevention) — enforced in authController, not
    // here, so buyers can register without touching these fields at all.
    cnicNumber: { type: String, trim: true }, // ID Card number
    idCardFrontImage: { type: String }, // file path
    idCardBackImage: { type: String }, // file path
    idCardSelfieImage: { type: String }, // selfie of the person holding their ID card
    profilePicture: { type: String },
    termsAcceptedAt: { type: Date }, // when the user accepted Terms & Conditions

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
    customCategoryName: { type: String, trim: true }, // used when category === "other"
    subCategories: [{ type: String }],
    bio: { type: String, maxlength: 1000 },
    bankAccountTitle: { type: String },
    bankAccountNumber: { type: String },
    bankName: { type: String }, // one of utils/banks.js BANKS (incl. JazzCash/Easypaisa)

    // ---- Ratings ----
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    // ---- Verification & Trust / Safety flags ----
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    // Which channel the user chose at registration to receive their OTP —
    // remembered so "Resend" (and any future re-send) uses the same channel
    // without the frontend having to keep re-sending it every time.
    preferredOtpMethod: { type: String, enum: ["email", "sms"], default: "email" },
    // Admin must approve seller/shop KYC documents before they can list services/products
    kycStatus: {
      type: String,
      enum: ["not_submitted", "pending", "approved", "rejected"],
      default: "not_submitted",
    },
    isSuspended: { type: Boolean, default: false }, // fraud / complaint action
    suspensionReason: { type: String },
    // Seller/shop accounts are held (kycStatus "pending") for up to 24 hours
    // while an admin manually reviews their ID documents. This is when the
    // hold started, purely for display ("usually verified within 24 hours").
    verificationRequestedAt: { type: Date },
    kycDecisionAt: { type: Date }, // when admin approved/rejected — used to fire the instant notification

    // ---- Login security: brute-force lockout ----
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },

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

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > new Date());
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
