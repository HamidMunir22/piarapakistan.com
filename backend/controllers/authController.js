const User = require("../models/User");
const Otp = require("../models/Otp");
const generateToken = require("../utils/generateToken");
const generateOtp = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS");
const validator = require("validator");

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
      bankAccountTitle,
      bankAccountNumber,
      bankName,
    } = req.body;

    // ---- Basic validation ----
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
    // CNIC + ID card images + address required for EVERYONE (fraud prevention)
    if (!cnicNumber || !address || !city) {
      return res
        .status(400)
        .json({ success: false, message: "CNIC number, address and city are required for verification" });
    }
    if (["seller", "shop"].includes(role) && !category) {
      return res.status(400).json({ success: false, message: "Category is required for sellers and shops" });
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
    const profilePicture = req.files?.profilePicture?.[0]
      ? `/uploads/profiles/${req.files.profilePicture[0].filename}`
      : null;

    if (!idCardFrontImage || !idCardBackImage) {
      return res
        .status(400)
        .json({ success: false, message: "ID Card front and back images are required" });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      cnicNumber,
      address,
      city,
      area,
      location:
        latitude && longitude
          ? { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] }
          : undefined,
      idCardFrontImage,
      idCardBackImage,
      profilePicture,
      businessName,
      category,
      bankAccountTitle,
      bankAccountNumber,
      bankName,
      kycStatus: role === "buyer" ? "not_submitted" : "pending", // seller/shop KYC needs admin approval
    });

    // ---- Send OTP to phone for verification ----
    const otpCode = generateOtp(6);
    await Otp.create({
      identifier: user.phone,
      otp: otpCode,
      purpose: "register",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    await sendSMS(user.phone, `PiaraPakistan: Your verification code is ${otpCode}. It expires in 10 minutes.`);

    // Also send a welcome email (non-blocking)
    sendEmail(
      user.email,
      "Welcome to PiaraPakistan",
      `<h2>Assalam-o-Alaikum ${user.firstName},</h2>
       <p>Your account has been created. Please verify your phone number using the code sent via SMS.</p>
       ${role !== "buyer" ? "<p>Your seller/shop documents are under review by our team. You will be notified once approved.</p>" : ""}
       <p>— Team PiaraPakistan</p>`
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your phone number with the OTP sent via SMS.",
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
    await sendSMS(phone, `PiaraPakistan: Your verification code is ${otpCode}. It expires in 10 minutes.`);

    return res.status(200).json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error resending OTP" });
  }
};

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
const loginUser = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      return res.status(400).json({ success: false, message: "Email/phone and password are required" });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: "Account suspended. Contact support." });
    }

    if (!user.isPhoneVerified) {
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
