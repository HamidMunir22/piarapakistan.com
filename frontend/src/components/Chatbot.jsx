import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { getBotReply } from "../utils/chatbot.js";
import { useLanguage } from "../context/LanguageContext.jsx";

// Site-wide floating FAQ chatbot bubble. Rendered once in App.jsx so it's
// available on every page. Uses the existing keyword-matched FAQ util
// (utils/chatbot.js) — no external AI API, so it's free to run.
const Chatbot = () => {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  // The greeting bubble is marked instead of storing fixed text, so it keeps
  // showing in whichever language is active even if the user switches
  // language after the chat has already opened.
  const [messages, setMessages] = useState([{ from: "bot", greeting: true }]);
  const [input, setInput] = useState("");
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const reply = getBotReply(text, language);
    setMessages((prev) => [...prev, { from: "user", text }, { from: "bot", text: reply }]);
    setInput("");
  };

  return (
    <div className="chatbot-root">
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <span>{t("chat.assistantTitle")}</span>
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label={t("chat.closeChat")}>
              <X size={18} />
            </button>
          </div>
          <div className="chatbot-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-bubble ${m.from}`}>
                {m.greeting ? t("chat.greeting") : m.text}
              </div>
            ))}
          </div>
          <form className="chatbot-input-row" onSubmit={send}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chat.inputPlaceholder")}
            />
            <button type="submit" className="icon-btn" aria-label={t("chat.send")}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
      <button className="chatbot-fab" onClick={() => setOpen((o) => !o)} aria-label={t("chat.openAssistant")}>
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
};

export default Chatbot;
