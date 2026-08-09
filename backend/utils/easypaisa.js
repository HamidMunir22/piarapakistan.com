/**
 * Easypaisa Mobile Account (MA) REST API integration helper.
 *
 * Real integration needs a registered Easypaisa merchant/partner account.
 * You'll get: Store ID, a username/password (sent as HTTP Basic Auth,
 * base64-encoded), and staging + production base URLs.
 *
 * Put these in backend/.env as EASYPAISA_STORE_ID, EASYPAISA_USERNAME,
 * EASYPAISA_PASSWORD, EASYPAISA_MODE (sandbox|live).
 *
 * Until those are filled in, isConfigured() returns false and the app falls
 * back to Mock Payment mode (see controllers/paymentController.js).
 *
 * IMPORTANT: verify field names/endpoints against Easypaisa's current
 * merchant integration guide (provided after signup) before going live.
 */
const axios = require("axios");

const SANDBOX_BASE = "https://easypaystg.easypaisa.com.pk/easypay-service/rest/v4";
const LIVE_BASE = "https://easypay.easypaisa.com.pk/easypay-service/rest/v4";

const isConfigured = () =>
  Boolean(process.env.EASYPAISA_STORE_ID && process.env.EASYPAISA_USERNAME && process.env.EASYPAISA_PASSWORD);

const authHeader = () => {
  const token = Buffer.from(`${process.env.EASYPAISA_USERNAME}:${process.env.EASYPAISA_PASSWORD}`).toString("base64");
  return `Basic ${token}`;
};

/**
 * Initiates a Mobile Account transaction. The customer's Easypaisa mobile
 * number is required upfront (unlike JazzCash's hosted checkout, Easypaisa's
 * MA flow sends an OTP/payment request straight to the customer's phone).
 */
const initiateMATransaction = async ({ orderId, amountPKR, mobileNumber }) => {
  const base = process.env.EASYPAISA_MODE === "live" ? LIVE_BASE : SANDBOX_BASE;
  const payload = {
    orderId,
    storeId: process.env.EASYPAISA_STORE_ID,
    transactionAmount: amountPKR,
    transactionType: "MA",
    mobileAccountNo: mobileNumber,
  };

  const { data } = await axios.post(`${base}/initiate-ma-transaction`, payload, {
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
  });
  return data; // { responseCode, responseDesc, transactionId, ... }
};

module.exports = { isConfigured, initiateMATransaction };
