import axios from "axios";

const api = axios.create({
  baseURL: "/api", // proxied to backend in dev; same-domain in production behind Nginx/Apache
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pp_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
