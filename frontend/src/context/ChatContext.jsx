import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";
import { fetchConversations } from "../api/chat.js";

const ChatContext = createContext(null);

// In production the API and app are usually on different subdomains, so the
// socket connects straight to the backend URL. In dev it falls back to same-origin.
const SOCKET_URL = import.meta.env.VITE_API_URL || undefined;

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const socketRef = useRef(null);

  const loadConversations = () => {
    if (user) fetchConversations().then(setConversations).catch(() => {});
  };

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      setSocket(null);
      setConversations([]);
      return;
    }

    const token = localStorage.getItem("pp_token");
    const s = io(SOCKET_URL, { auth: { token } });
    socketRef.current = s;
    setSocket(s);

    loadConversations();

    s.on("conversation_updated", () => loadConversations());

    return () => s.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <ChatContext.Provider value={{ socket, conversations, loadConversations, totalUnread }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
