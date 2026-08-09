/**
 * SMS utility. Uses Twilio by default.
 * NOTE: For Pakistan, you may prefer a local SMS gateway (e.g. Telenor, Jazz, or
 * a reseller like "Route Mobile" / "eSMS.pk") since Twilio's Pakistan coverage
 * and pricing can be limited. Swap the implementation below with your provider's
 * API without changing how the rest of the app calls sendSMS().
 */
require("dotenv").config();

let client = null;
const sid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// Only initialize the real Twilio client if valid-looking credentials are present
// (a Twilio Account SID always starts with "AC"). Otherwise fall back to dev-mode
// logging so the app doesn't crash when these are left as placeholders.
if (sid && authToken && sid.startsWith("AC")) {
  const twilio = require("twilio");
  client = twilio(sid, authToken);
}

/**
 * Send an SMS.
 * @param {string} to - recipient phone number in E.164 format e.g. +923001234567
 * @param {string} message
 */
const sendSMS = async (to, message) => {
  if (!client) {
    // Fallback for local development when no SMS credentials configured yet
    console.log(`[SMS - DEV MODE] To: ${to} | Message: ${message}`);
    return true;
  }
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    return true;
  } catch (err) {
    console.error("SMS send error:", err.message);
    return false;
  }
};

module.exports = sendSMS;
