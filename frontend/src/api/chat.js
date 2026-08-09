import api from "./client";

export const startConversation = (otherUserId, listingId) =>
  api.post("/chat/conversations", { otherUserId, listingId }).then((res) => res.data.conversation);

export const fetchConversations = () => api.get("/chat/conversations").then((res) => res.data.conversations);

export const fetchMessages = (conversationId) =>
  api.get(`/chat/conversations/${conversationId}/messages`).then((res) => res.data.messages);
