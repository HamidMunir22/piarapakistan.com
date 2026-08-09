const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 800 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
