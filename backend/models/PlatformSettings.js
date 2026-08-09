const mongoose = require("mongoose");

const platformSettingsSchema = new mongoose.Schema(
  {
    // There should only ever be ONE document in this collection (singleton).
    commissionType: { type: String, enum: ["percent", "fixed"], default: "percent" },
    commissionPercent: { type: Number, default: 10, min: 0, max: 100 },
    commissionFixedAmount: { type: Number, default: 50, min: 0 }, // PKR, used when commissionType = "fixed"
  },
  { timestamps: true }
);

platformSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model("PlatformSettings", platformSettingsSchema);
