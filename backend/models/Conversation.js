const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" }, // optional context

    lastMessage: { type: String, maxlength: 500 },
    lastMessageAt: { type: Date, default: Date.now },
    lastSender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Per-participant unread counts, keyed by userId string (simpler than a subdocument array)
    unreadCounts: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);
