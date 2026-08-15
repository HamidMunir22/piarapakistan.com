const axios = require("axios");

// ---------------------------------------------------------------------------
// WHY THIS FILE USES AN HTTP API INSTEAD OF SMTP:
// We tried both Gmail and Hostinger SMTP (ports 465/587) from Railway and
// every attempt failed with "Connection timeout" — Railway (like many
// budget/free-tier hosts) blocks outbound SMTP ports to prevent the platform
// being used for spam. No SMTP provider will ever work here as a result.
//
// The fix: use an email provider's HTTP API instead. Sending email becomes a
// normal HTTPS request (port 443) — the exact same kind of request the rest
// of the app already makes to MongoDB Atlas, Twilio, etc. — so it is never
// blocked. We use Resend (https://resend.com) here; its free tier is more
// than enough for OTP/notification volume.
//
// Setup required in Railway Variables:
//   RESEND_API_KEY   - from https://resend.com/api-keys
//   EMAIL_FROM       - e.g. "PiaraPakistan <noreply@piarapakistan.com>"
//                      (the sending domain must be verified in Resend first —
//                      see the DNS records step in the Resend dashboard)
// ---------------------------------------------------------------------------

const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Send an email via the Resend HTTP API.
 * @param {string} to - recipient email
 * @param {string} subject
 * @param {string} html
 */
const sendEmail = async (to, subject, html) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM;

  if (!apiKey) {
    console.warn(`[Email - DEV MODE] No RESEND_API_KEY configured — email to ${to} ("${subject}") was not sent.`);
    return false;
  }

  try {
    await axios.post(
      RESEND_API_URL,
      { from, to, subject, html },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // fail fast rather than hang the request that triggered this email
      }
    );
    return true;
  } catch (err) {
    const detail = err.response?.data?.message || err.message;
    console.error(`Email send error (Resend): ${detail}`);
    return false;
  }
};

module.exports = sendEmail;
