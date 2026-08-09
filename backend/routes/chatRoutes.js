const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { startConversation, getConversations, getMessages } = require("../controllers/chatController");

router.use(protect);
router.post("/conversations", startConversation);
router.get("/conversations", getConversations);
router.get("/conversations/:id/messages", getMessages);

module.exports = router;
