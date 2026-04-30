import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

let loggingOut = false;
export const setLoggingOut = (value: boolean) => { loggingOut = value; };

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) config.headers = { Authorization: `Bearer ${token}` };
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !loggingOut) {
      Cookies.remove("token");
      window.location.replace("/auth/sign-in");
    }
    return Promise.reject(err);
  }
);

export default api;
