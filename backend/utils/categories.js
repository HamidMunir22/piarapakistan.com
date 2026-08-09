// Central category list - shared "source of truth" reference for the platform.
// Each category has an id (used in DB/filters), a display label, an icon key
// (matched to a lucide-react icon on the frontend) and which listing types
// (service / product) it applies to.

const CATEGORIES = [
  { id: "electrician", label: "Electrician", icon: "Zap", types: ["service"] },
  { id: "ac-repair", label: "AC Sale/Purchase & Repair", icon: "Wind", types: ["service", "product"] },
  { id: "plumber", label: "Plumber", icon: "Wrench", types: ["service"] },
  { id: "carpenter", label: "Carpenter", icon: "Hammer", types: ["service"] },
  { id: "painter", label: "Painter", icon: "PaintRoller", types: ["service"] },
  { id: "home-shifting", label: "Home Shifting", icon: "Truck", types: ["service"] },
  { id: "electronics", label: "Electronics Shop", icon: "Tv", types: ["product"] },
  { id: "mobile-repair", label: "Mobile Repair", icon: "Smartphone", types: ["service", "product"] },
  { id: "tailor", label: "Tailor / Boutique", icon: "Shirt", types: ["service", "product"] },
  { id: "grocery", label: "Grocery / General Store", icon: "ShoppingBasket", types: ["product"] },
  { id: "other", label: "Other", icon: "MoreHorizontal", types: ["service", "product"] },
];

const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

module.exports = { CATEGORIES, CATEGORY_IDS };
