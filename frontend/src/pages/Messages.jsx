import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useChat } from "../context/ChatContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { fetchMessages, startConversation } from "../api/chat.js";
import { getBotReply } from "../utils/chatbot.js";
import { Send, Bot } from "lucide-react";

const ASSISTANT_ID = "assistant";

const Messages = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { socket, conversations, loadConversations } = useChat();
  const [searchParams] = useSearchParams();
  const [activeId, setActiveId] = useState(searchParams.get("with") || ASSISTANT_ID);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);

  // If arriving via "?sellerId=...&listingId=..." (from a listing page), start/open that conversation
  useEffect(() => {
    const sellerId = searchParams.get("sellerId");
    const listingId = searchParams.get("listingId");
    if (sellerId) {
      startConversation(sellerId, listingId).then((conv) => {
        setActiveId(conv._id);
        loadConversations();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeId === ASSISTANT_ID) {
      setMessages([{ _id: "greet", sender: ASSISTANT_ID, text: t("chat.assistantGreeting") }]);
      return;
    }
    fetchMessages(activeId).then(setMessages);
    socket?.emit("join_conversation", activeId);
    return () => socket?.emit("leave_conversation", activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, socket]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (msg.conversation === activeId) setMessages((prev) => [...prev, msg]);
    };
    socket.on("receive_message", handler);
    return () => socket.off("receive_message", handler);
  }, [socket, activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;

    if (activeId === ASSISTANT_ID) {
      const userMsg = { _id: Date.now(), sender: user._id, text: draft };
      const botMsg = { _id: Date.now() + 1, sender: ASSISTANT_ID, text: getBotReply(draft) };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      setDraft("");
      return;
    }

    socket?.emit("send_message", { conversationId: activeId, text: draft }, (res) => {
      if (res?.success) loadConversations();
    });
    setDraft("");
  };

  const activeConversation = conversations.find((c) => c._id === activeId);
  const activeName =
    activeId === ASSISTANT_ID
      ? t("chat.assistant")
      : activeConversation?.otherUser?.businessName ||
        `${activeConversation?.otherUser?.firstName || ""} ${activeConversation?.otherUser?.lastName || ""}`;

  return (
    <div className="container" style={{ padding: "24px 20px 40px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, height: "70vh", minHeight: 500 }}>
        {/* ---- Conversation list ---- */}
        <div style={{ background: "var(--pp-white)", border: "1px solid var(--pp-border)", borderRadius: "var(--pp-radius)", overflow: "auto" }}>
          <div
            onClick={() => setActiveId(ASSISTANT_ID)}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              padding: 14,
              cursor: "pointer",
              background: activeId === ASSISTANT_ID ? "var(--pp-orange-soft)" : "transparent",
              borderBottom: "1px solid var(--pp-border)",
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--pp-green-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={18} color="var(--pp-green-dark)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t("chat.assistant")}</div>
              <div style={{ fontSize: 11.5, color: "var(--pp-muted)" }}>Quick Help</div>
            </div>
          </div>

          {conversations.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "var(--pp-muted)", fontSize: 13 }}>
              {t("chat.noConversations")}
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c._id}
                onClick={() => setActiveId(c._id)}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: 14,
                  cursor: "pointer",
                  background: activeId === c._id ? "var(--pp-orange-soft)" : "transparent",
                  borderBottom: "1px solid var(--pp-border)",
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--pp-cream)", flexShrink: 0 }} />
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.otherUser?.businessName || `${c.otherUser?.firstName || ""} ${c.otherUser?.lastName || ""}`}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--pp-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.lastMessage || "..."}
                  </div>
                </div>
                {c.unreadCount > 0 && <span className="navbar-badge" style={{ position: "static", marginLeft: "auto" }}>{c.unreadCount}</span>}
              </div>
            ))
          )}
        </div>

        {/* ---- Chat window ---- */}
        <div style={{ background: "var(--pp-white)", border: "1px solid var(--pp-border)", borderRadius: "var(--pp-radius)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 14, borderBottom: "1px solid var(--pp-border)", fontWeight: 700 }}>{activeName}</div>

          <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m) => {
              const isMine = m.sender === user._id || m.sender?._id === user._id;
              return (
                <div
                  key={m._id}
                  style={{
                    alignSelf: isMine ? "flex-end" : "flex-start",
                    background: isMine ? "var(--pp-orange-dark)" : "var(--pp-cream)",
                    color: isMine ? "white" : "var(--pp-ink)",
                    padding: "8px 13px",
                    borderRadius: 14,
                    maxWidth: "70%",
                    fontSize: 13.5,
                  }}
                >
                  {m.text}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid var(--pp-border)" }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("chat.typeMessage")}
              style={{ flex: 1, padding: "10px 14px", borderRadius: 999, border: "1.5px solid var(--pp-border)" }}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: "50%", width: 42, height: 42, padding: 0 }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Messages;
