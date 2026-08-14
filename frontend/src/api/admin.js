import api from "./client";

// ---- Public reference data ----
export const fetchBanks = () => api.get("/banks").then((res) => res.data.banks);

// ---- Dashboard ----
export const fetchAdminStats = () => api.get("/admin/stats").then((res) => res.data.stats);

// ---- KYC ----
export const fetchPendingKyc = () => api.get("/admin/pending-kyc").then((res) => res.data.users);
export const approveKyc = (userId) => api.put(`/admin/kyc/${userId}/approve`).then((res) => res.data);
export const rejectKyc = (userId) => api.put(`/admin/kyc/${userId}/reject`).then((res) => res.data);

// ---- Users ----
export const fetchUsers = (params) => api.get("/admin/users", { params }).then((res) => res.data);
export const suspendUser = (userId, reason) =>
  api.put(`/admin/users/${userId}/suspend`, { reason }).then((res) => res.data);
export const unsuspendUser = (userId) => api.put(`/admin/users/${userId}/unsuspend`).then((res) => res.data);
export const updateUserCommission = (userId, payload) =>
  // payload: { commissionType: "percent"|"fixed"|null, commissionPercent?, commissionFixedAmount? }
  api.put(`/admin/users/${userId}/commission`, payload).then((res) => res.data);

// ---- Listings (moderation) ----
export const fetchAdminListings = (params) => api.get("/admin/listings", { params }).then((res) => res.data);
export const toggleListingAdmin = (id, payload) => api.put(`/admin/listings/${id}/toggle`, payload).then((res) => res.data);
export const deleteListingAdmin = (id) => api.delete(`/admin/listings/${id}`).then((res) => res.data);

// ---- Orders (oversight) ----
export const fetchAdminOrders = (params) => api.get("/admin/orders", { params }).then((res) => res.data);

// ---- Commission (global default) ----
export const fetchCommission = () => api.get("/admin/commission").then((res) => res.data);
export const updateCommission = (payload) =>
  // payload: { commissionType: "percent"|"fixed", commissionPercent?, commissionFixedAmount? }
  api.put("/admin/commission", payload).then((res) => res.data);

// ---- Complaints (Help Center) ----
export const fetchAllComplaints = (params) => api.get("/admin/complaints", { params }).then((res) => res.data.complaints);
export const respondToComplaint = (id, payload) => api.put(`/admin/complaints/${id}`, payload).then((res) => res.data);

export const fileComplaint = (payload) => api.post("/complaints", payload).then((res) => res.data);
export const fetchMyComplaints = () => api.get("/complaints/mine").then((res) => res.data.complaints);
