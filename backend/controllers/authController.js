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
const OTP_TTL_MS = 2 * 60 * 1000; // 2 minutes — short window so a leaked/guessed code can't be reused later

// ---------------------------------------------------------------------------
// Password strength: require at least 8 characters, one uppercase, one
// lowercase, one number, and one special character. This mirrors the same
// rule enforced on the frontend's live strength meter (red/yellow/green) so
// a user can never bypass it by disabling JavaScript or calling the API
// directly — the server is always the final authority on what's "strong".
// ---------------------------------------------------------------------------
const isStrongPassword = (password) => {
  if (typeof password !== "string" || password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]/\\;']/.test(password);
  return hasUpper && hasLower && hasNumber && hasSpecial;
};
const PASSWORD_RULE_MESSAGE =
  "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character (e.g. @#$%&*).";

// ---------------------------------------------------------------------------
// Helper: send an OTP over SMS, and ALWAYS mirror it to email too.
// Why: on Railway/Hostinger without a paid, Pakistan-capable SMS provider
// configured, sendSMS() silently falls back to "dev mode" (just a console.log)
// so the user never actually receives a code on their phone — this was the
// reported "OTP code nahi aata mobile pr" bug. Mirroring every OTP to email
// guarantees the user can always complete verification even if SMS fails or
// isn't configured yet, without changing anything else in the flow.
// ---------------------------------------------------------------------------
// method: "email" (default) or "sms" — which channel the user picked on the
// register/verify screen. We only send through the chosen channel instead of
// always blasting both, so the user isn't left staring at a channel they
// never asked for (and that may not even be configured, e.g. SMS without a
// working Twilio/local gateway).
const dispatchOtp = async (user, otpCode, method = "email") => {
  if (method === "sms") {
    const smsOk = await sendSMS(
      user.phone,
      `PiaraPakistan: Your verification code is ${otpCode}. It expires in 2 minutes.`
    );
    if (!smsOk) {
      console.warn(`[OTP] SMS delivery failed/unconfigured for ${user.phone}.`);
    }
    return;
  }

  // IMPORTANT: intentionally NOT awaited. If SMTP is slow/unreachable (e.g.
  // the host's network blocks outbound email), awaiting this used to freeze
  // the whole register/login/resend-OTP request for up to 2 minutes,
  // causing the browser to show "Server error" and tempting the user to
  // resubmit — which then raced with the still-pending first request and
  // crashed with a duplicate-key error. Firing it without awaiting means the
  // API always responds immediately regardless of email deliverability.
  sendEmail(
    user.email,
    "Your PiaraPakistan verification code",
    `<h2>Your verification code</h2>
     <p style="font-size:28px;font-weight:bold;letter-spacing:4px;">${otpCode}</p>
     <p>This code expires in 2 minutes.</p>`
  ).catch((err) => console.error(`[OTP] Email dispatch failed for ${user.email}:`, err.message));
};

// ---------------------------------------------------------------------------
// Notify every admin account by email the moment a new user finishes
// registration (OTP verified — a real, confirmed signup, not an abandoned
// attempt). Looked up dynamically (User.find({ role: "admin" })) instead of
// a fixed env var so it automatically reaches whichever admin account(s)
// exist — no extra configuration needed when a new admin is added later via
// seedAdmin.js or promoted manually. Intentionally not awaited by the
// caller, same reasoning as dispatchOtp above: a slow/unreachable email
// provider should never delay the user's own verification response.
// ---------------------------------------------------------------------------
const notifyAdminsOfNewRegistration = async (user) => {
  try {
    const admins = await User.find({ role: "admin" }).select("email");
    const adminEmails = admins.map((a) => a.email).filter(Boolean);
    if (adminEmails.length === 0) return; // no admin account exists yet (e.g. before seedAdmin.js has run)

    const isSellerOrShop = ["seller", "shop"].includes(user.role);
    const roleLabel = { buyer: "Buyer", seller: "Seller", shop: "Shop" }[user.role] || user.role;

    await sendEmail(
      adminEmails,
      `New ${roleLabel} registered on PiaraPakistan: ${user.firstName} ${user.lastName}`,
      `<h2>New registration</h2>
       <p><strong>${user.firstName} ${user.lastName}</strong> just registered as a <strong>${roleLabel}</strong>.</p>
       <ul>
         <li>Email: ${user.email}</li>
         <li>Phone: ${user.phone}</li>
         <li>City: ${user.city}${user.area ? `, ${user.area}` : ""}</li>
         ${user.businessName ? `<li>Business name: ${user.businessName}</li>` : ""}
         ${user.category ? `<li>Category: ${user.category === "other" ? user.customCategoryName : user.category}</li>` : ""}
       </ul>
       ${
         isSellerOrShop
           ? `<p><strong>⚠️ This account needs KYC review before they can list anything.</strong> Go to the Admin Panel → KYC Approvals to verify their ID documents.</p>`
           : `<p>This is a buyer account — no KYC review needed.</p>`
       }
       <p>— PiaraPakistan system</p>`
    );
  } catch (err) {
    // Never let a notification failure affect the user's own registration flow.
    console.error("[Admin notify] Failed to send new-registration email:", err.message);
  }
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
      gender,
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
      otpMethod,
    } = req.body;

    // Default to email — it's the more reliable channel when SMS gateway
    // credentials aren't set up yet.
    const chosenOtpMethod = otpMethod === "sms" ? "sms" : "email";

    // ---- reCAPTCHA (bot protection) ----
    const captcha = await verifyRecaptcha(recaptchaToken);
    if (!captcha.success) {
      return res.status(400).json({ success: false, message: captcha.message || "reCAPTCHA verification failed" });
    }

    // ---- Basic validation (applies to everyone) ----
    if (!firstName || !lastName || !email || !phone || !password || !role || !gender) {
      return res.status(400).json({ success: false, message: "Please fill all required fields" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address" });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ success: false, message: PASSWORD_RULE_MESSAGE });
    }
    if (!["male", "female", "other"].includes(gender)) {
      return res.status(400).json({ success: false, message: "Invalid gender" });
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
      if (existingUser.isPhoneVerified) {
        // Real, completed account — genuinely already registered.
        return res.status(409).json({ success: false, message: "Email or phone number already registered" });
      }
      // Stale/abandoned signup: the account was created but the OTP step was
      // never completed (e.g. because OTP delivery wasn't working yet, or
      // the user simply gave up). Blocking a fresh attempt forever with
      // "already registered" — for an account that was never actually
      // usable — is a dead end for the user. Clear it out and let them
      // register again from scratch.
      await Otp.deleteMany({ identifier: { $in: [existingUser.phone, existingUser.email] } });
      await existingUser.deleteOne();
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
      gender,
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
      preferredOtpMethod: chosenOtpMethod,
    });

    // ---- Send OTP via whichever channel the user picked ----
    const otpCode = generateOtp(6);
    await Otp.create({
      identifier: user.phone,
      otp: otpCode,
      purpose: "register",
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });
    await dispatchOtp(user, otpCode, chosenOtpMethod);

    // NOTE: We used to also send a "Welcome to PiaraPakistan!" email right
    // here, at the same moment as the OTP. That meant every new user got two
    // emails at once and had to figure out which one had the actual code —
    // confusing, and not how normal sites behave. The welcome email is now
    // sent from verifyOtp() instead, only after the account is actually
    // verified, so registration only ever sends the ONE email with the code.

    return res.status(201).json({
      success: true,
      message: `Registration successful. Please verify with the OTP sent via ${chosenOtpMethod === "sms" ? "SMS" : "email"}.`,
      userId: user._id,
      phone: user.phone,
    });
  } catch (error) {
    console.error(error);
    // A duplicate-key error here means two registration attempts for the
    // same email/phone landed at almost the same moment (e.g. the user
    // double-clicked "Register", or resubmitted while an earlier attempt was
    // still processing) and both passed the "does this exist yet?" check
    // before either finished writing to the database. This is a normal race
    // condition, not a real server fault — tell the user to simply retry
    // instead of showing a scary generic error.
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "That email or phone number is already being registered — please wait a few seconds and try again.",
      });
    }
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

    // ---- Welcome email — only sent now, once the account is ACTUALLY
    // verified, instead of at registration time (non-blocking). ----
    sendEmail(
      user.email,
      "Welcome to PiaraPakistan!",
      `<h2>Welcome to PiaraPakistan, ${user.firstName}!</h2>
       <p>Your account is now verified and ready to use.</p>
       ${
         user.kycStatus === "pending"
           ? `<p>Your seller/shop documents are now under review by our team. This is usually completed within 24 hours — you'll get an email and SMS the moment your account is verified, even if it happens sooner.</p>`
           : ""
       }
       <p>Thanks for joining Pakistan's trusted marketplace.<br/>— Team PiaraPakistan</p>`
    );

    // ---- Notify the website owner/admin(s) that a new user just completed
    // registration (non-blocking, same as the welcome email above). We fire
    // this here — at OTP-verified time — rather than in registerUser(),
    // because an unverified signup can still be abandoned/cleaned up (see
    // the "stale signup" handling in registerUser) and isn't a real
    // registration yet. Looked up dynamically instead of a fixed env var so
    // it automatically reaches every admin account, not just one hardcoded
    // address. ----
    notifyAdminsOfNewRegistration(user);

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
    const { phone, otpMethod } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Use whichever method the frontend passes for this resend request; fall
    // back to whatever the user originally chose at registration.
    const method = otpMethod === "sms" || otpMethod === "email" ? otpMethod : user.preferredOtpMethod || "email";

    const otpCode = generateOtp(6);
    await Otp.create({
      identifier: phone,
      otp: otpCode,
      purpose: "register",
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });
    await dispatchOtp(user, otpCode, method);

    return res.status(200).json({ success: true, message: `OTP resent via ${method === "sms" ? "SMS" : "email"}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error resending OTP" });
  }
};

// ---------------------------------------------------------------------------
// Forgot / Reset password
// The user picks Email or Mobile Number to identify their account, we look
// them up by whichever they typed, and send a reset code through THAT SAME
// channel (email chosen -> code emailed; phone chosen -> code texted). This
// mirrors the register/verify flow so it feels consistent across the app.
// ---------------------------------------------------------------------------
const sendResetCode = async (user, otpCode, method) => {
  if (method === "sms") {
    const smsOk = await sendSMS(
      user.phone,
      `PiaraPakistan: Your password reset code is ${otpCode}. It expires in 2 minutes. If you didn't request this, ignore this message.`
    );
    if (!smsOk) console.warn(`[Reset] SMS delivery failed/unconfigured for ${user.phone}.`);
    return;
  }
  sendEmail(
    user.email,
    "Reset your PiaraPakistan password",
    `<h2>Password reset code</h2>
     <p style="font-size:28px;font-weight:bold;letter-spacing:4px;">${otpCode}</p>
     <p>This code expires in 2 minutes. If you didn't request a password reset, you can safely ignore this email.</p>`
  ).catch((err) => console.error(`[Reset] Email dispatch failed for ${user.email}:`, err.message));
};

const forgotPassword = async (req, res) => {
  try {
    const { emailOrPhone, method } = req.body;
    if (!emailOrPhone || !method || !["email", "sms"].includes(method)) {
      return res.status(400).json({ success: false, message: "Please provide your email/phone and choose a method" });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
    });

    // Don't reveal whether the account exists — always respond the same way,
    // but only actually send a code (and only create the OTP record) if a
    // matching account was found.
    if (user) {
      const identifier = method === "sms" ? user.phone : user.email;
      const otpCode = generateOtp(6);
      await Otp.create({
        identifier,
        otp: otpCode,
        purpose: "reset_password",
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      });
      await sendResetCode(user, otpCode, method);
    }

    return res.status(200).json({
      success: true,
      message: `If an account matches, a reset code has been sent via ${method === "sms" ? "SMS" : "email"}.`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error requesting password reset" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { emailOrPhone, method, otp, newPassword } = req.body;
    if (!emailOrPhone || !method || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ success: false, message: PASSWORD_RULE_MESSAGE });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found" });
    }

    const identifier = method === "sms" ? user.phone : user.email;
    const record = await Otp.findOne({
      identifier,
      otp,
      purpose: "reset_password",
      verified: false,
    }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({ success: false, message: "Invalid or expired code" });
    }
    if (record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "Code has expired. Please request a new one." });
    }

    record.verified = true;
    await record.save();

    user.password = newPassword; // pre("save") hook re-hashes it
    // A password reset is also a good moment to clear any brute-force lockout.
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    return res.status(200).json({ success: true, message: "Password has been reset. You can now log in." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error resetting password" });
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

    // ---------------------------------------------------------------------
    // Extra verification step for ADMIN accounts only. The admin has full
    // access to the entire website, so a leaked or guessed password alone
    // must never be enough to get in — a 6-digit code is emailed to the
    // admin's own address (always email, never SMS, since SMS delivery in
    // Pakistan is unreliable here and this is the inbox the admin
    // specifically set up for this account) and must be entered correctly
    // before a token is issued. Every other role skips this and logs in
    // normally below.
    // ---------------------------------------------------------------------
    if (user.role === "admin") {
      await user.save();
      const otpCode = generateOtp(6);
      await Otp.create({
        identifier: user.email,
        otp: otpCode,
        purpose: "login",
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      });
      await dispatchOtp(user, otpCode, "email");
      return res.status(403).json({
        success: false,
        message: "Verification code sent to your admin email",
        requiresAdminOtp: true,
        email: user.email,
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    // ---- Welcome-back email on every successful login (non-blocking) ----
    sendEmail(
      user.email,
      "Welcome back to PiaraPakistan!",
      `<h2>Welcome back, ${user.firstName}!</h2>
       <p>You just logged in to your PiaraPakistan account.</p>
       <p style="color:#888;font-size:13px;">If this wasn't you, please reset your password immediately and contact support.</p>
       <p>— Team PiaraPakistan</p>`
    );

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
// Admin login — step 2: verify the emailed 6-digit code, then issue the token
// ---------------------------------------------------------------------------
const verifyAdminOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and code are required" });
    }

    const record = await Otp.findOne({
      identifier: email.toLowerCase(),
      otp,
      purpose: "login",
      verified: false,
    }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({ success: false, message: "Invalid or expired code" });
    }
    if (record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "Code has expired. Please request a new one." });
    }

    // Re-check the role here too (not just at the login step) so this
    // endpoint can never be used to complete a login for a non-admin account.
    const user = await User.findOne({ email: email.toLowerCase(), role: "admin" });
    if (!user) {
      return res.status(404).json({ success: false, message: "Admin account not found" });
    }

    record.verified = true;
    await record.save();

    user.lastLoginAt = new Date();
    await user.save();

    // Every successful admin login gets an alert email — since this account
    // has full access to the site, the real admin should always know when it
    // was used, and can immediately tell if it wasn't them.
    sendEmail(
      user.email,
      "Admin login to PiaraPakistan",
      `<h2>Admin panel access</h2>
       <p>Your admin account just logged in successfully.</p>
       <p style="color:#888;font-size:13px;">If this wasn't you, log in and change your admin password immediately.</p>
       <p>— PiaraPakistan system</p>`
    );

    const token = generateToken(user._id, user.role);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error verifying admin code" });
  }
};

// ---------------------------------------------------------------------------
// Admin login — resend the 6-digit code (e.g. it expired or got lost)
// ---------------------------------------------------------------------------
const resendAdminOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const user = await User.findOne({ email: email.toLowerCase(), role: "admin" });
    if (!user) {
      return res.status(404).json({ success: false, message: "Admin account not found" });
    }

    const otpCode = generateOtp(6);
    await Otp.create({
      identifier: user.email,
      otp: otpCode,
      purpose: "login",
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });
    await dispatchOtp(user, otpCode, "email");

    return res.status(200).json({ success: true, message: "Verification code resent to your email" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error resending code" });
  }
};

// ---------------------------------------------------------------------------
// Get logged-in user's profile
// ---------------------------------------------------------------------------
const getMe = async (req, res) => {
  return res.status(200).json({ success: true, user: req.user.toSafeObject ? req.user.toSafeObject() : req.user });
};

module.exports = {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  verifyAdminOtp,
  resendAdminOtp,
  getMe,
  forgotPassword,
  resetPassword,
};
