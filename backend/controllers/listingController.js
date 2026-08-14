const Listing = require("../models/Listing");
const User = require("../models/User");
const { CATEGORIES } = require("../utils/categories");

// ---------------------------------------------------------------------------
// GET /api/categories - list of all categories (public)
// ---------------------------------------------------------------------------
const getCategories = async (req, res) => {
  return res.json({ success: true, categories: CATEGORIES });
};

// ---------------------------------------------------------------------------
// POST /api/listings - create a new listing (seller/shop only)
// ---------------------------------------------------------------------------
const createListing = async (req, res) => {
  try {
    const { title, description, category, customCategoryName, price, priceType, stock } = req.body;

    if (!title || !description || !category || price === undefined) {
      return res.status(400).json({ success: false, message: "Title, description, category and price are required" });
    }

    if (category === "other" && !customCategoryName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please type your service/product name for the 'Other' category",
      });
    }

    if (req.user.kycStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your account is still pending verification. Please wait for admin approval before adding listings.",
      });
    }

    const images = (req.files || []).map((f) => `/uploads/listings/${f.filename}`);

    const listing = await Listing.create({
      seller: req.user._id,
      listingType: req.user.role === "shop" ? "product" : "service",
      title,
      description,
      category,
      customCategoryName: category === "other" ? customCategoryName?.trim() : undefined,
      price,
      priceType: priceType || "fixed",
      stock: req.user.role === "shop" ? stock ?? 0 : null,
      images,
      city: req.user.city,
      area: req.user.area,
      location: req.user.location,
    });

    return res.status(201).json({ success: true, message: "Listing created", listing });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error creating listing", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/listings - public search/browse with filters
// Query params: q, category, city, listingType, minPrice, maxPrice, lat, lng, page, limit
// ---------------------------------------------------------------------------
const getListings = async (req, res) => {
  try {
    const {
      q,
      category,
      city,
      listingType,
      minPrice,
      maxPrice,
      lat,
      lng,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { isActive: true, isApproved: true };
    if (category) filter.category = category;
    if (city) filter.city = new RegExp(`^${city}$`, "i");
    if (listingType) filter.listingType = listingType;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let query;
    let usingGeo = false;

    if (lat && lng) {
      // Nearby-first: area -> city -> everywhere else, via distance sort.
      // NOTE: MongoDB can't combine a $near geo query with a $text search in
      // the same query (they rely on different specialized indexes), so when
      // both location and a keyword are given we fall back to a plain regex
      // match on title/description instead of $text.
      usingGeo = true;
      filter.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
        },
      };
      if (q) {
        const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [{ title: new RegExp(safeQ, "i") }, { description: new RegExp(safeQ, "i") }];
      }
      query = Listing.find(filter);
    } else if (q) {
      filter.$text = { $search: q };
      query = Listing.find(filter, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } });
    } else {
      query = Listing.find(filter).sort({ createdAt: -1 });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [listings, total] = await Promise.all([
      query
        .skip(skip)
        .limit(Number(limit))
        .populate("seller", "firstName lastName businessName ratingAverage ratingCount city area profilePicture"),
      Listing.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      count: listings.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      sortedByDistance: usingGeo,
      listings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error fetching listings", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/listings/mine - logged-in seller/shop's own listings (for dashboard)
// ---------------------------------------------------------------------------
const getMyListings = async (req, res) => {
  const listings = await Listing.find({ seller: req.user._id }).sort({ createdAt: -1 });
  return res.json({ success: true, count: listings.length, listings });
};

// ---------------------------------------------------------------------------
// GET /api/listings/:id - single listing detail (public)
// ---------------------------------------------------------------------------
const getListingById = async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate(
    "seller",
    "firstName lastName businessName ratingAverage ratingCount city area profilePicture phone kycStatus"
  );
  if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });
  return res.json({ success: true, listing });
};

// ---------------------------------------------------------------------------
// PUT /api/listings/:id - update own listing
// ---------------------------------------------------------------------------
const updateListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });
  if (String(listing.seller) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "You can only edit your own listings" });
  }

  const editable = ["title", "description", "category", "customCategoryName", "price", "priceType", "stock", "isActive"];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) listing[field] = req.body[field];
  });

  if (req.files && req.files.length > 0) {
    listing.images = [...listing.images, ...req.files.map((f) => `/uploads/listings/${f.filename}`)];
  }

  await listing.save();
  return res.json({ success: true, message: "Listing updated", listing });
};

// ---------------------------------------------------------------------------
// DELETE /api/listings/:id
// ---------------------------------------------------------------------------
const deleteListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });
  if (String(listing.seller) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "You can only delete your own listings" });
  }
  await listing.deleteOne();
  return res.json({ success: true, message: "Listing deleted" });
};

module.exports = {
  getCategories,
  createListing,
  getListings,
  getMyListings,
  getListingById,
  updateListing,
  deleteListing,
};
