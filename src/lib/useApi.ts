import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const SIGN_IN_URL = `${BASE_PATH}/auth/sign-in`;
export const LOGOUT_URL = `${BASE_PATH}/api/auth/logout`;
export const UNAUTHORIZED_URL = `${BASE_PATH}/unauthorized`;

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
    } else if (err.response?.status === 403 && !loggingOut && !authRedirectScheduled) {
      // Authenticated but forbidden — a stale role/session mismatch that
      // slipped past route middleware. Don't clear the token (still valid),
      // just get the user out of a page they shouldn't be looking at.
      authRedirectScheduled = true;
      window.location.replace(UNAUTHORIZED_URL);
    }
    return Promise.reject(err);
  }
);

export default api;

// No interceptors — safe for public endpoints where a logged-in user's token must NOT be sent
export const publicApi = axios.create({
  baseURL: `${API_URL}/api`,
});
