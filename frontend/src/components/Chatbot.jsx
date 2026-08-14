import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { getBotReply } from "../utils/chatbot.js";

// Site-wide floating FAQ chatbot bubble. Rendered once in App.jsx so it's
// available on every page. Uses the existing keyword-matched FAQ util
// (utils/chatbot.js) — no external AI API, so it's free to run.
const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm the PiaraPakistan assistant. Ask me about orders, becoming a seller, payments, or verification." },
  ]);
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
    const reply = getBotReply(text);
    setMessages((prev) => [...prev, { from: "user", text }, { from: "bot", text: reply }]);
    setInput("");
  };

  return (
    <div className="chatbot-root">
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <span>PiaraPakistan Assistant</span>
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} />
            </button>
          </div>
          <div className="chatbot-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-bubble ${m.from}`}>
                {m.text}
              </div>
            ))}
          </div>
          <form className="chatbot-input-row" onSubmit={send}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
            />
            <button type="submit" className="icon-btn" aria-label="Send">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
      <button className="chatbot-fab" onClick={() => setOpen((o) => !o)} aria-label="Open chat assistant">
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
};

export default Chatbot;
