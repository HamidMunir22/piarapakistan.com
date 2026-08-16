// Lightweight keyword-matched FAQ bot. No external AI API required — this
// keeps the "help chatbot" fast and free to run. If you later want a
// smarter bot, this is the single place to swap in a real API call.
//
// Keyword matching stays in English regardless of UI language (it matches
// against whatever the user actually types), but the reply shown is picked
// in the currently selected site language.
const FAQ = [
  {
    keywords: ["order", "booking", "book"],
    reply: {
      en: "To place an order, open any listing and tap 'Book Now' or 'Add to Cart'. Choose your address and payment method at checkout.",
      ur: "آرڈر دینے کے لیے، کوئی بھی لسٹنگ کھولیں اور 'Book Now' یا 'Add to Cart' پر ٹیپ کریں۔ چیک آؤٹ پر اپنا پتہ اور ادائیگی کا طریقہ منتخب کریں۔",
    },
  },
  {
    keywords: ["seller", "become a seller", "sell", "shop owner"],
    reply: {
      en: "To become a Seller or Shop Owner, go to Register and select 'Service Seller' or 'Shop Owner'. After your ID is verified by our admin team (usually within 24 hours), you can start adding listings.",
      ur: "سیلر یا شاپ اونر بننے کے لیے، Register پر جائیں اور 'Service Seller' یا 'Shop Owner' منتخب کریں۔ ہماری ایڈمن ٹیم کی جانب سے آپ کی شناخت کی تصدیق ہونے کے بعد (عام طور پر 24 گھنٹوں میں)، آپ لسٹنگز شامل کرنا شروع کر سکتے ہیں۔",
    },
  },
  {
    keywords: ["commission", "fee", "charges"],
    reply: {
      en: "The platform takes a small commission on each order, which is set by the admin and shown on the order receipt.",
      ur: "پلیٹ فارم ہر آرڈر پر ایک معمولی کمیشن لیتا ہے، جو ایڈمن کی طرف سے مقرر کیا جاتا ہے اور آرڈر کی رسید پر دکھایا جاتا ہے۔",
    },
  },
  {
    keywords: ["payment", "jazzcash", "easypaisa", "cod", "cash", "bank"],
    reply: {
      en: "You can pay with Cash on Delivery or Online Payment (JazzCash, Easypaisa, or bank transfer) — choose at checkout.",
      ur: "آپ Cash on Delivery یا آن لائن ادائیگی (JazzCash، Easypaisa، یا بینک ٹرانسفر) سے ادائیگی کر سکتے ہیں — چیک آؤٹ پر منتخب کریں۔",
    },
  },
  {
    keywords: ["complaint", "fraud", "scam", "report"],
    reply: {
      en: "Please file a complaint from the Help Center page (in the navbar) — our team will respond as soon as possible.",
      ur: "براہ کرم Help Center صفحے (نیو بار میں) سے شکایت درج کریں — ہماری ٹیم جلد از جلد جواب دے گی۔",
    },
  },
  {
    keywords: ["kyc", "id card", "verify", "verification", "selfie"],
    reply: {
      en: "Sellers/shops must upload their CNIC front & back plus a selfie holding their ID card during registration. Once our admin approves it (usually within 24 hours), you can start listing.",
      ur: "سیلرز/دکانوں کو رجسٹریشن کے دوران اپنے CNIC کا اگلا اور پچھلا حصہ، اور شناختی کارڈ کے ساتھ ایک سیلفی اپ لوڈ کرنا ضروری ہے۔ ہمارے ایڈمن کی منظوری کے بعد (عام طور پر 24 گھنٹوں میں)، آپ لسٹنگ شروع کر سکتے ہیں۔",
    },
  },
  {
    keywords: ["otp", "code", "sms"],
    reply: {
      en: "Your verification code is sent by both SMS and email — if the SMS is delayed, check your email inbox (and spam folder) for the same code.",
      ur: "آپ کا تصدیقی کوڈ SMS اور ای میل دونوں کے ذریعے بھیجا جاتا ہے — اگر SMS میں تاخیر ہو تو وہی کوڈ اپنے ای میل ان باکس (اور اسپیم فولڈر) میں چیک کریں۔",
    },
  },
  {
    keywords: ["password", "locked", "login"],
    reply: {
      en: "For security, an account is temporarily locked for 30 minutes after 3 incorrect password attempts. Please try again later or reset your password.",
      ur: "سیکیورٹی کی وجہ سے، 3 غلط پاسورڈ کوششوں کے بعد اکاؤنٹ 30 منٹ کے لیے عارضی طور پر بلاک ہو جاتا ہے۔ براہ کرم بعد میں دوبارہ کوشش کریں یا اپنا پاسورڈ ری سیٹ کریں۔",
    },
  },
];

const DEFAULT_REPLY = {
  en: "Sorry, I don't have an answer for that yet. Please file a complaint via the Help Center, or message the seller directly.",
  ur: "معذرت، ابھی میرے پاس اس کا جواب نہیں ہے۔ براہ کرم Help Center کے ذریعے شکایت درج کریں، یا سیلر کو براہ راست پیغام بھیجیں۔",
};

export const getBotReply = (message, language = "en") => {
  const lower = message.toLowerCase();
  const match = FAQ.find((f) => f.keywords.some((k) => lower.includes(k)));
  const reply = match?.reply || DEFAULT_REPLY;
  return reply[language] || reply.en;
};
