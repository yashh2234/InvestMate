// frontend/src/api/client.js
import axios from "axios";

const client = axios.create({
  baseURL:
    typeof import.meta !== "undefined"
      ? import.meta.env.VITE_API_BASE_URL
      : globalThis.importMeta?.env?.VITE_API_BASE_URL,
  timeout: 30000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // Only attach Authorization if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Optional: skip logging for auth requests
  if (!config.url.includes("/auth")) {
    console.log("Interceptor running, token:", token, "URL:", config.url);
  }

  return config;
});

export default client;
