import axios, { AxiosHeaders } from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "https://staging-backend-l9en3.ondigitalocean.app";

const api = axios.create({
  baseURL: `${API}/api`,
  withCredentials: true,
});

// Attach Authorization header from localStorage if available (client-side only)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      if (config.headers instanceof AxiosHeaders) {
        config.headers.set("Authorization", storedToken);
      } else if (config.headers) {
        (config.headers as Record<string, string>)["Authorization"] = storedToken;
      } else {
        config.headers = new AxiosHeaders({ Authorization: storedToken });
      }
    }
  }
  return config;
});

export default api;
