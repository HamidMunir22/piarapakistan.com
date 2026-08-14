const axios = require("axios");

/**
 * Verifies a Google reCAPTCHA v2/v3 token server-side.
 *
 * If RECAPTCHA_SECRET_KEY is not configured (e.g. local dev, or before the
 * owner has created their own Google reCAPTCHA keys), verification is
 * skipped automatically so the app doesn't get blocked — this mirrors the
 * same "mock mode" pattern used for JazzCash/Easypaisa in this project.
 * Once you create keys at https://www.google.com/recaptcha/admin and put
 * RECAPTCHA_SECRET_KEY in backend/.env, verification becomes mandatory.
 *
 * @param {string} token - the g-recaptcha-response token from the frontend
 * @returns {Promise<{success: boolean, message?: string}>}
 */
const verifyRecaptcha = async (token) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    console.log("[reCAPTCHA - DEV MODE] No RECAPTCHA_SECRET_KEY configured, skipping verification.");
    return { success: true };
  }

  if (!token) {
    return { success: false, message: "reCAPTCHA verification is required" };
  }

  try {
    const { data } = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      { params: { secret, response: token } }
    );

    if (!data.success) {
      return { success: false, message: "reCAPTCHA verification failed. Please try again." };
    }
    // For v3 (score-based) tokens, reject obviously bot-like scores.
    if (typeof data.score === "number" && data.score < 0.3) {
      return { success: false, message: "reCAPTCHA verification failed. Please try again." };
    }
    return { success: true };
  } catch (err) {
    console.error("reCAPTCHA verify error:", err.message);
    // Fail-open on network errors so a Google outage never blocks signups —
    // but log loudly so the admin notices.
    return { success: true, degraded: true };
  }
};

module.exports = verifyRecaptcha;
