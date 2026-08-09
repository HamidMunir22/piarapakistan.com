import api from "./client";

export const placeOrder = (payload) => api.post("/orders", payload).then((res) => res.data.order);

export const fetchMyOrders = () => api.get("/orders/mine").then((res) => res.data.orders);

export const fetchSellerOrders = () => api.get("/orders/seller").then((res) => res.data.orders);

export const updateOrderStatus = (id, status, cancelReason) =>
  api.put(`/orders/${id}/status`, { status, cancelReason }).then((res) => res.data.order);

export const submitReview = (orderId, rating, comment) =>
  api.post(`/orders/${orderId}/review`, { rating, comment }).then((res) => res.data.review);
