/**
 * One-time script to create the first admin account, since there is no
 * public "register as admin" option (for security). Run with:
 *
 *   node seedAdmin.js
 *
 * Reads credentials from .env (ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD) or
 * falls back to the defaults below - change these before running in production!
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");

const run = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || "admin@piarapakistan.com";
  const phone = process.env.ADMIN_PHONE || "+923000000000";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("ℹ️  Admin already exists:", email);
    process.exit(0);
  }

  await User.create({
    firstName: "Piara",
    lastName: "Admin",
    email,
    phone,
    password,
    role: "admin",
    cnicNumber: "00000-0000000-0",
    address: "Head Office",
    city: "Islamabad",
    isPhoneVerified: true,
    isEmailVerified: true,
    kycStatus: "approved",
  });

  console.log("✅ Admin account created:");
  console.log("   Email:", email);
  console.log("   Password:", password);
  console.log("   ⚠️  Please log in and change this password immediately.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
