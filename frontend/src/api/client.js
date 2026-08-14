import axios from "axios";

// In dev, Vite proxies /api to http://localhost:5000 (see vite.config.js).
// In production, the frontend (Hostinger) and backend (Railway/VPS) are
// usually on different domains, so VITE_API_URL must be set at build time —
// falls back to same-origin "/api" only if it's left blank.
const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pp_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
