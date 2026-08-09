const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");

// ---------------------------------------------------------------------------
// POST /api/chat/conversations - find-or-create a conversation with a seller
// body: { otherUserId, listingId? }
// ---------------------------------------------------------------------------
const startConversation = async (req, res) => {
  try {
    const { otherUserId, listingId } = req.body;
    if (!otherUserId) return res.status(400).json({ success: false, message: "otherUserId zaroori hai" });
    if (otherUserId === String(req.user._id)) {
      return res.status(400).json({ success: false, message: "Aap apne aap ko message nahi kar sakte" });
    }

    const otherUser = await User.findById(otherUserId);
    if (!otherUser) return res.status(404).json({ success: false, message: "User not found" });

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, otherUserId], $size: 2 },
      ...(listingId ? { listing: listingId } : {}),
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, otherUserId],
        listing: listingId || undefined,
        lastMessage: "",
        unreadCounts: {},
      });
    }

    return res.status(201).json({ success: true, conversation });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error starting conversation" });
  }
};

// ---------------------------------------------------------------------------
// GET /api/chat/conversations - inbox list for the logged-in user
// ---------------------------------------------------------------------------
const getConversations = async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "firstName lastName businessName role profilePicture")
    .populate("listing", "title images");

  const withUnread = conversations.map((c) => {
    const obj = c.toObject();
    obj.unreadCount = c.unreadCounts?.[String(req.user._id)] || 0;
    obj.otherUser = c.participants.find((p) => String(p._id) !== String(req.user._id));
    return obj;
  });

  return res.json({ success: true, conversations: withUnread });
};

// ---------------------------------------------------------------------------
// GET /api/chat/conversations/:id/messages - message history + marks read
// ---------------------------------------------------------------------------
const getMessages = async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found" });
  if (!conversation.participants.some((p) => String(p) === String(req.user._id))) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 });

  // Mark as read for this user
  await Message.updateMany(
    { conversation: conversation._id, sender: { $ne: req.user._id }, read: false },
    { read: true }
  );
  conversation.unreadCounts = { ...conversation.unreadCounts, [String(req.user._id)]: 0 };
  await conversation.save();

  return res.json({ success: true, messages });
};

module.exports = { startConversation, getConversations, getMessages };
