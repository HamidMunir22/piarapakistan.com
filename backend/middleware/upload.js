const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
["uploads/idcards", "uploads/profiles"].forEach((dir) => {
  const fullPath = path.join(__dirname, "..", dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "profilePicture") {
      cb(null, path.join(__dirname, "..", "uploads/profiles"));
    } else {
      // idCardFrontImage / idCardBackImage
      cb(null, path.join(__dirname, "..", "uploads/idcards"));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, jpeg, png, webp) are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024 },
});

// ---- Separate config for listing (service/product) photos ----
const listingsDir = path.join(__dirname, "..", "uploads/listings");
if (!fs.existsSync(listingsDir)) fs.mkdirSync(listingsDir, { recursive: true });

const listingStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, listingsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `listing-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const uploadListingImages = multer({
  storage: listingStorage,
  fileFilter,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024 },
});

module.exports = upload;
module.exports.uploadListingImages = uploadListingImages;
