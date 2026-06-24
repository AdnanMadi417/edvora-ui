import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const SIGN_IN_URL = `${BASE_PATH}/auth/sign-in`;
export const LOGOUT_URL = `${BASE_PATH}/api/auth/logout`;

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

let loggingOut = false;
export const setLoggingOut = (value: boolean) => { loggingOut = value; };

let authRedirectScheduled = false;

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) config.headers = { Authorization: `Bearer ${token}` } as any;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !loggingOut && !authRedirectScheduled) {
      authRedirectScheduled = true;
      Cookies.remove("token");
      window.location.replace(SIGN_IN_URL);
    }
    return Promise.reject(err);
  }
);

export default api;
