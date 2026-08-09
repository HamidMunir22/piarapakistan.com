const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createListing,
  getListings,
  getMyListings,
  getListingById,
  updateListing,
  deleteListing,
} = require("../controllers/listingController");

const listingImages = upload.uploadListingImages.array("images", 5);

// ---- Public ----
router.get("/", getListings);

// ---- Protected (must come before "/:id" to avoid route collision) ----
router.get("/mine", protect, authorize("seller", "shop"), getMyListings);
router.post("/", protect, authorize("seller", "shop"), listingImages, createListing);
router.put("/:id", protect, authorize("seller", "shop", "admin"), listingImages, updateListing);
router.delete("/:id", protect, authorize("seller", "shop", "admin"), deleteListing);

// ---- Public detail (after the more specific routes above) ----
router.get("/:id", getListingById);

module.exports = router;
