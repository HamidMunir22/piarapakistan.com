const User = require("../models/User");
const Otp = require("../models/Otp");
const generateToken = require("../utils/generateToken");
const generateOtp = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS");
const verifyRecaptcha = require("../utils/verifyRecaptcha");
const validator = require("validator");

const LOCK_MINUTES = 30; // how long an account is locked after 3 failed attempts
const MAX_LOGIN_ATTEMPTS = 3;

// ---------------------------------------------------------------------------
// Helper: send an OTP over SMS, and ALWAYS mirror it to email too.
// Why: on Railway/Hostinger without a paid, Pakistan-capable SMS provider
// configured, sendSMS() silently falls back to "dev mode" (just a console.log)
// so the user never actually receives a code on their phone — this was the
// reported "OTP code nahi aata mobile pr" bug. Mirroring every OTP to email
// guarantees the user can always complete verification even if SMS fails or
// isn't configured yet, without changing anything else in the flow.
// ---------------------------------------------------------------------------
const dispatchOtp = async (user, otpCode) => {
  const smsOk = await sendSMS(
    user.phone,
    `PiaraPakistan: Your verification code is ${otpCode}. It expires in 10 minutes.`
  );
  if (!smsOk) {
    console.warn(`[OTP] SMS delivery failed/unconfigured for ${user.phone} — falling back to email only.`);
  }
  await sendEmail(
    user.email,
    "Your PiaraPakistan verification code",
    `<h2>Your verification code</h2>
     <p style="font-size:28px;font-weight:bold;letter-spacing:4px;">${otpCode}</p>
     <p>This code expires in 10 minutes. If the SMS to your phone hasn't arrived yet, you can use this email code instead.</p>`
  );
};

// ---------------------------------------------------------------------------
// STEP 1: Register - creates an "unverified" account and sends OTP to phone
// ---------------------------------------------------------------------------
const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role, // buyer | seller | shop
      cnicNumber,
      address,
      city,
      area,
      latitude,
      longitude,
      businessName,
      category,
      customCategoryName,
      bankAccountTitle,
      bankAccountNumber,
      bankName,
      termsAccepted,
      recaptchaToken,
    } = req.body;

    // ---- reCAPTCHA (bot protection) ----
    const captcha = await verifyRecaptcha(recaptchaToken);
    if (!captcha.success) {
      return res.status(400).json({ success: false, message: captcha.message || "reCAPTCHA verification failed" });
    }

    // ---- Basic validation (applies to everyone) ----
    if (!firstName || !lastName || !email || !phone || !password || !role) {
      return res.status(400).json({ success: false, message: "Please fill all required fields" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }
    if (!["buyer", "seller", "shop"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
    if (!address || !city) {
      return res.status(400).json({ success: false, message: "Address and city are required" });
    }

    const isSellerOrShop = ["seller", "shop"].includes(role);

    // ---- Role-based requirements ----
    // Buyers: no CNIC/ID card required, profile picture is optional.
    // Sellers/Shops: CNIC + ID card front/back + a selfie holding the ID card
    // are mandatory, and they must have accepted Terms & Conditions (the
    // "hold the ID in your hand" selfie step is only ever shown to them on
    // the frontend, and only after they tick Terms & Conditions).
    if (isSellerOrShop) {
      if (!category) {
        return res.status(400).json({ success: false, message: "Category is required for sellers and shops" });
      }
      if (category === "other" && !customCategoryName?.trim()) {
        return res.status(400).json({ success: false, message: "Please type your service/product category" });
      }
      if (!cnicNumber) {
        return res.status(400).json({ success: false, message: "CNIC number is required for sellers and shops" });
      }
      if (termsAccepted !== "true" && termsAccepted !== true) {
        return res.status(400).json({ success: false, message: "You must accept the Terms & Conditions" });
      }
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email or phone number already registered" });
    }

    // ---- Handle uploaded files (multer) ----
    const idCardFrontImage = req.files?.idCardFrontImage?.[0]
      ? `/uploads/idcards/${req.files.idCardFrontImage[0].filename}`
      : null;
    const idCardBackImage = req.files?.idCardBackImage?.[0]
      ? `/uploads/idcards/${req.files.idCardBackImage[0].filename}`
      : null;
    const idCardSelfieImage = req.files?.idCardSelfieImage?.[0]
      ? `/uploads/idcards/${req.files.idCardSelfieImage[0].filename}`
      : null;
    const profilePicture = req.files?.profilePicture?.[0]
      ? `/uploads/profiles/${req.files.profilePicture[0].filename}`
      : null;

    if (isSellerOrShop && (!idCardFrontImage || !idCardBackImage || !idCardSelfieImage)) {
      return res.status(400).json({
        success: false,
        message: "ID card (front + back) and a selfie holding your ID card are required for sellers/shops",
      });
    }

    const now = new Date();

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      cnicNumber: isSellerOrShop ? cnicNumber : undefined,
      address,
      city,
      area,
      location:
        latitude && longitude
          ? { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] }
          : undefined,
      idCardFrontImage: isSellerOrShop ? idCardFrontImage : undefined,
      idCardBackImage: isSellerOrShop ? idCardBackImage : undefined,
      idCardSelfieImage: isSellerOrShop ? idCardSelfieImage : undefined,
      profilePicture, // optional for everyone, including buyers
      businessName,
      category: isSellerOrShop ? category : undefined,
      customCategoryName: isSellerOrShop && category === "other" ? customCategoryName?.trim() : undefined,
      bankAccountTitle: isSellerOrShop ? bankAccountTitle : undefined,
      bankAccountNumber: isSellerOrShop ? bankAccountNumber : undefined,
      bankName: isSellerOrShop ? bankName : undefined,
      termsAcceptedAt: isSellerOrShop ? now : undefined,
      // Buyers never need KYC. Sellers/shops go into "pending" and their
      // account is held while an admin reviews their documents — usually
      // resolved well within 24 hours, and the moment an admin decides
      // (approve/reject) they get notified instantly by email + SMS.
      kycStatus: isSellerOrShop ? "pending" : "not_submitted",
      verificationRequestedAt: isSellerOrShop ? now : undefined,
    });

    // ---- Send OTP to phone (mirrored to email as a reliable fallback) ----
    const otpCode = generateOtp(6);
    await Otp.create({
      identifier: user.phone,
      otp: otpCode,
      purpose: "register",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    await dispatchOtp(user, otpCode);

    // ---- Welcome email (always in English, non-blocking) ----
    sendEmail(
      user.email,
      "Welcome to PiaraPakistan!",
      `<h2>Welcome to PiaraPakistan, ${user.firstName}!</h2>
       <p>Your account has been created successfully. Please verify your phone number using the code we just sent you (by SMS and email).</p>
       ${
         isSellerOrShop
           ? `<p>Your seller/shop documents are now under review by our team. This is usually completed within 24 hours — you'll get an email and SMS the moment your account is verified, even if it happens sooner.</p>`
           : ""
       }
       <p>Thanks for joining Pakistan's trusted marketplace.<br/>— Team PiaraPakistan</p>`
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your phone number with the OTP sent via SMS and email.",
      userId: user._id,
      phone: user.phone,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error during registration", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// STEP 2: Verify OTP (phone verification)
// ---------------------------------------------------------------------------
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: "Phone and OTP are required" });
    }

    const record = await Otp.findOne({ identifier: phone, otp, verified: false }).sort({ createdAt: -1 });
    if (!record) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
    if (record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    record.verified = true;
    await record.save();

    const user = await User.findOneAndUpdate(
      { phone },
      { isPhoneVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const token = generateToken(user._id, user.role);
    return res.status(200).json({
      success: true,
      message: "Phone verified successfully",
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error verifying OTP" });
  }
};

// ---------------------------------------------------------------------------
// Resend OTP
// ---------------------------------------------------------------------------
const resendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otpCode = generateOtp(6);
    await Otp.create({
      identifier: phone,
      otp: otpCode,
      purpose: "register",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await dispatchOtp(user, otpCode);

    return res.status(200).json({ success: true, message: "OTP resent via SMS and email" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error resending OTP" });
  }
};

// ---------------------------------------------------------------------------
// Login (with reCAPTCHA + 3-attempt lockout)
// ---------------------------------------------------------------------------
const loginUser = async (req, res) => {
  try {
    const { emailOrPhone, password, recaptchaToken } = req.body;
    if (!emailOrPhone || !password) {
      return res.status(400).json({ success: false, message: "Email/phone and password are required" });
    }

    const captcha = await verifyRecaptcha(recaptchaToken);
    if (!captcha.success) {
      return res.status(400).json({ success: false, message: captcha.message || "reCAPTCHA verification failed" });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
    });

    // Generic message for unknown accounts to avoid leaking which one is wrong
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.isLocked()) {
      const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Too many failed attempts. Your account is temporarily locked. Try again in ${minutesLeft} minute(s).`,
      });
    }

    const passwordMatches = await user.comparePassword(password);
    if (!passwordMatches) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        user.loginAttempts = 0;
        await user.save();
        return res.status(423).json({
          success: false,
          message: `Too many failed attempts. Your account is locked for ${LOCK_MINUTES} minutes for security.`,
        });
      }
      await user.save();
      return res.status(401).json({
        success: false,
        message: `Invalid credentials. ${MAX_LOGIN_ATTEMPTS - user.loginAttempts} attempt(s) remaining before your account is temporarily locked.`,
      });
    }

    // Successful password check — reset lockout counters
    if (user.loginAttempts || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = null;
    }

    if (user.isSuspended) {
      await user.save();
      return res.status(403).json({ success: false, message: "Account suspended. Contact support." });
    }

    if (!user.isPhoneVerified) {
      await user.save();
      return res.status(403).json({
        success: false,
        message: "Please verify your phone number first",
        requiresOtp: true,
        phone: user.phone,
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error during login" });
  }
};

// ---------------------------------------------------------------------------
// Get logged-in user's profile
// ---------------------------------------------------------------------------
const getMe = async (req, res) => {
  return res.status(200).json({ success: true, user: req.user.toSafeObject ? req.user.toSafeObject() : req.user });
};

module.exports = { registerUser, verifyOtp, resendOtp, loginUser, getMe };
