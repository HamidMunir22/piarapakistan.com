// Lightweight keyword-matched FAQ bot. No external AI API required — this
// keeps the "help chatbot" fast and free to run. If you later want a
// smarter bot, this is the single place to swap in a real API call.
const FAQ = [
  {
    keywords: ["order", "booking", "book"],
    reply:
      "Order karne ke liye kisi bhi listing par jayein aur 'Abhi Book Karein' ya 'Cart mein Add Karein' dabayein. Checkout par address aur payment method choose karein.",
  },
  {
    keywords: ["seller", "kaise bane", "become seller", "sell"],
    reply:
      "Seller/Shop banne ke liye Register par jayein aur 'Service Seller' ya 'Shop Owner' select karein. ID card verify hone ke baad (admin approval) aap listing add kar sakte hain.",
  },
  {
    keywords: ["commission", "fee", "charges"],
    reply: "Platform har order par ek chhota sa commission % leta hai jo order ki receipt par dikhta hai.",
  },
  {
    keywords: ["payment", "jazzcash", "easypaisa", "cod", "cash"],
    reply: "Aap Cash on Delivery ya Online Payment (JazzCash/Easypaisa) dono se pay kar sakte hain — checkout par choose karein.",
  },
  {
    keywords: ["complaint", "fraud", "scam", "shikayat"],
    reply: "Help Center page (\"Help\" navbar mein) se apni complaint file karein — hamari team jald jawab degi.",
  },
  {
    keywords: ["kyc", "id card", "verify", "verification"],
    reply: "Seller/shop registration par CNIC aur ID card front-back tasveerein upload karni hoti hain. Admin approve karne ke baad listing add ho sakti hai.",
  },
];

const DEFAULT_REPLY =
  "Maazrat, mujhe iska jawab nahi pata. Behtar hoga aap Help Center se complaint file karein ya seller ko seedha message karein.";

export const getBotReply = (message) => {
  const lower = message.toLowerCase();
  const match = FAQ.find((f) => f.keywords.some((k) => lower.includes(k)));
  return match?.reply || DEFAULT_REPLY;
};
