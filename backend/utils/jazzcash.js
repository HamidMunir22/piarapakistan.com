/**
 * JazzCash Hosted Checkout (Page Redirection) integration helper.
 *
 * Real JazzCash integration needs a registered merchant account. You'll get:
 *   - Merchant ID
 *   - Password
 *   - Integrity Salt (secret hash key)
 *   - Sandbox URL (for testing) + Production URL (for going live)
 *
 * Put these in backend/.env as JAZZCASH_MERCHANT_ID, JAZZCASH_PASSWORD,
 * JAZZCASH_INTEGRITY_SALT, JAZZCASH_MODE (sandbox|live).
 *
 * Until those are filled in, isConfigured() returns false and the app falls
 * back to Mock Payment mode (see controllers/paymentController.js) so the
 * full checkout flow can still be demoed/tested end-to-end.
 *
 * IMPORTANT: JazzCash's exact required fields/endpoints can change over time.
 * Before going live, verify this against JazzCash's current merchant
 * documentation (available after merchant signup) and test thoroughly in
 * their sandbox first.
 */
const crypto = require("crypto");

const SANDBOX_URL = "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";
const LIVE_URL = "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";

const isConfigured = () =>
  Boolean(process.env.JAZZCASH_MERCHANT_ID && process.env.JAZZCASH_PASSWORD && process.env.JAZZCASH_INTEGRITY_SALT);

// JazzCash requires: sort all pp_ fields alphabetically by key, join their
// VALUES with "&", prepend the Integrity Salt, then HMAC-SHA256 the result
// (using the Integrity Salt as the HMAC key too) -> pp_SecureHash.
const generateSecureHash = (fields, integritySalt) => {
  const sortedKeys = Object.keys(fields).sort();
  const valueString = sortedKeys.map((k) => fields[k]).join("&");
  const hashInput = `${integritySalt}&${valueString}`;
  return crypto.createHmac("sha256", integritySalt).update(hashInput).digest("hex");
};

const pad = (n) => String(n).padStart(2, "0");
const formatDateTime = (d) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

/**
 * Build the hosted-checkout form fields for a PaymentIntent.
 * Returns { actionUrl, fields } - the frontend auto-submits an HTML form
 * with these fields (method=POST) to actionUrl, which redirects the
 * customer to JazzCash's payment page.
 */
const buildCheckoutForm = ({ txnRefNo, amountPKR, returnUrl, description }) => {
  const now = new Date();
  const expiry = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour expiry

  const fields = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: process.env.JAZZCASH_MERCHANT_ID,
    pp_Password: process.env.JAZZCASH_PASSWORD,
    pp_TxnRefNo: txnRefNo,
    pp_Amount: String(Math.round(amountPKR * 100)), // JazzCash expects amount in paisas (x100)
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: formatDateTime(now),
    pp_TxnExpiryDateTime: formatDateTime(expiry),
    pp_BillReference: txnRefNo,
    pp_Description: description || "PiaraPakistan Order Payment",
    pp_ReturnURL: returnUrl,
  };

  fields.pp_SecureHash = generateSecureHash(fields, process.env.JAZZCASH_INTEGRITY_SALT);

  const actionUrl = process.env.JAZZCASH_MODE === "live" ? LIVE_URL : SANDBOX_URL;
  return { actionUrl, fields };
};

/**
 * Verify a callback/return payload actually came from JazzCash by
 * recomputing the secure hash and comparing.
 */
const verifyCallback = (body) => {
  const { pp_SecureHash, ...rest } = body;
  const expected = generateSecureHash(rest, process.env.JAZZCASH_INTEGRITY_SALT);
  return expected === pp_SecureHash;
};

module.exports = { isConfigured, buildCheckoutForm, verifyCallback };
