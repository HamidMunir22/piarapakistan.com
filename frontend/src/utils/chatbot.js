// Lightweight keyword-matched FAQ bot. No external AI API required — this
// keeps the "help chatbot" fast and free to run. If you later want a
// smarter bot, this is the single place to swap in a real API call.
const FAQ = [
  {
    keywords: ["order", "booking", "book"],
    reply:
      "To place an order, open any listing and tap 'Book Now' or 'Add to Cart'. Choose your address and payment method at checkout.",
  },
  {
    keywords: ["seller", "become a seller", "sell", "shop owner"],
    reply:
      "To become a Seller or Shop Owner, go to Register and select 'Service Seller' or 'Shop Owner'. After your ID is verified by our admin team (usually within 24 hours), you can start adding listings.",
  },
  {
    keywords: ["commission", "fee", "charges"],
    reply: "The platform takes a small commission on each order, which is set by the admin and shown on the order receipt.",
  },
  {
    keywords: ["payment", "jazzcash", "easypaisa", "cod", "cash", "bank"],
    reply: "You can pay with Cash on Delivery or Online Payment (JazzCash, Easypaisa, or bank transfer) — choose at checkout.",
  },
  {
    keywords: ["complaint", "fraud", "scam", "report"],
    reply: "Please file a complaint from the Help Center page (in the navbar) — our team will respond as soon as possible.",
  },
  {
    keywords: ["kyc", "id card", "verify", "verification", "selfie"],
    reply:
      "Sellers/shops must upload their CNIC front & back plus a selfie holding their ID card during registration. Once our admin approves it (usually within 24 hours), you can start listing.",
  },
  {
    keywords: ["otp", "code", "sms"],
    reply:
      "Your verification code is sent by both SMS and email — if the SMS is delayed, check your email inbox (and spam folder) for the same code.",
  },
  {
    keywords: ["password", "locked", "login"],
    reply:
      "For security, an account is temporarily locked for 30 minutes after 3 incorrect password attempts. Please try again later or reset your password.",
  },
];

const DEFAULT_REPLY =
  "Sorry, I don't have an answer for that yet. Please file a complaint via the Help Center, or message the seller directly.";

export const getBotReply = (message) => {
  const lower = message.toLowerCase();
  const match = FAQ.find((f) => f.keywords.some((k) => lower.includes(k)));
  return match?.reply || DEFAULT_REPLY;
};
