require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const chatRoutes = require("./routes/chatRoutes");
const { getCategories } = require("./controllers/listingController");
const { BANKS } = require("./utils/banks");

const app = express();
const server = http.createServer(app);

// Railway (and most PaaS hosts) put the app behind a reverse proxy, so
// Express sees an internal proxy IP instead of the visitor's real IP unless
// told to trust the proxy's X-Forwarded-For header. Without this, the
// express-rate-limit / login-lockout logic can't reliably tell users apart
// by IP (and logs a "trust proxy" warning on every request).
app.set("trust proxy", 1);

// ---- Database ----
connectDB();

// ---- Security middleware ----
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

// Rate limiting to prevent brute-force / abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter limit on auth endpoints (register/login/otp)
  message: { success: false, message: "Too many attempts, please try again later." },
});
app.use("/api/auth", authLimiter);

// ---- Body parsers ----
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ---- Static files (uploaded ID cards / profile pictures) ----
// NOTE: idcards should ideally be served privately (only to admin) rather than
// publicly - see README "Security Notes" section.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---- Routes ----
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chat", chatRoutes);
app.get("/api/categories", getCategories);
app.get("/api/banks", (req, res) => res.json({ success: true, banks: BANKS })); // public, used by registration form

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "PiaraPakistan API is running" });
});

// ---- 404 handler ----
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ---- Global error handler ----
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ---- Socket.io (Live Chat) ----
const Conversation = require("./models/Conversation");
const Message = require("./models/Message");
const jwt = require("jsonwebtoken");

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "*" },
});

// Authenticate the socket connection using the same JWT used for the REST API
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  // Every user gets a personal room (their userId) so we can notify them of
  // new messages even before they've opened a specific conversation.
  socket.join(String(socket.userId));

  socket.on("join_conversation", (conversationId) => {
    socket.join(`conv:${conversationId}`);
  });

  socket.on("leave_conversation", (conversationId) => {
    socket.leave(`conv:${conversationId}`);
  });

  socket.on("send_message", async ({ conversationId, text }, callback) => {
    try {
      if (!text?.trim()) return;
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.some((p) => String(p) === String(socket.userId))) {
        return callback?.({ success: false, message: "Not authorized" });
      }

      const message = await Message.create({ conversation: conversationId, sender: socket.userId, text: text.trim() });

      const otherParticipant = conversation.participants.find((p) => String(p) !== String(socket.userId));
      const unread = conversation.unreadCounts || {};
      unread[String(otherParticipant)] = (unread[String(otherParticipant)] || 0) + 1;

      conversation.lastMessage = text.trim();
      conversation.lastMessageAt = new Date();
      conversation.lastSender = socket.userId;
      conversation.unreadCounts = unread;
      await conversation.save();

      const payload = {
        _id: message._id,
        conversation: conversationId,
        sender: socket.userId,
        text: message.text,
        createdAt: message.createdAt,
      };

      io.to(`conv:${conversationId}`).emit("receive_message", payload);
      io.to(String(otherParticipant)).emit("conversation_updated", { conversationId, lastMessage: text.trim() });
      callback?.({ success: true, message: payload });
    } catch (err) {
      console.error("send_message error:", err.message);
      callback?.({ success: false, message: "Message bhejne mein masla hua" });
    }
  });

  socket.on("typing", ({ conversationId }) => {
    socket.to(`conv:${conversationId}`).emit("user_typing", { conversationId, userId: socket.userId });
  });

  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 PiaraPakistan API running on port ${PORT} [${process.env.NODE_ENV}]`);
});
