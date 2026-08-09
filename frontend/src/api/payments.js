import api from "./client";

export const initiatePayment = (payload) => api.post("/payments/initiate", payload).then((res) => res.data);

export const confirmMockPayment = (intentId) =>
  api.post(`/payments/mock/${intentId}/confirm`).then((res) => res.data);

export const fetchPaymentStatus = (intentId) => api.get(`/payments/status/${intentId}`).then((res) => res.data);
