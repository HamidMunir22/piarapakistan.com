const mongoose = require("mongoose");
const { CATEGORY_IDS } = require("../utils/categories");

const listingSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // "service" = e.g. electrician, plumber (seller role) | "product" = shop item (shop role)
    listingType: { type: String, enum: ["service", "product"], required: true },

    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 3000 },
    category: { type: String, enum: CATEGORY_IDS, required: true },

    // Price in PKR. For services, priceType can be "fixed" or "hourly" or "starting_at".
    price: { type: Number, required: true, min: 0 },
    priceType: {
      type: String,
      enum: ["fixed", "hourly", "starting_at"],
      default: "fixed",
    },

    // Only relevant for listingType = "product" (shop inventory)
    stock: { type: Number, default: null },

    images: [{ type: String }], // /uploads/listings/xxxx.jpg

    // Location copied from seller at creation time (so listing can be searched
    // even if the seller later updates their profile address). Also supports
    // per-listing override for shops with multiple branches (future use).
    city: { type: String, required: true },
    area: { type: String },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },

    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true }, // seller can pause a listing
    isApproved: { type: Boolean, default: true }, // reserved for future admin moderation
  },
  { timestamps: true }
);

listingSchema.index({ location: "2dsphere" });
listingSchema.index({ title: "text", description: "text" });
listingSchema.index({ category: 1, city: 1 });

module.exports = mongoose.model("Listing", listingSchema);
