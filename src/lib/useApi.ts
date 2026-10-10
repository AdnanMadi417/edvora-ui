import axios from "axios";
import Cookies from "js-cookie";
import { classifyRequestError } from "./authFailure";
import {
  redirectToSignIn,
  redirectToUnauthorized,
  setLoggingOut,
  SIGN_IN_URL,
  LOGOUT_URL,
  UNAUTHORIZED_URL,
} from "./authRedirect";

export { setLoggingOut, SIGN_IN_URL, LOGOUT_URL, UNAUTHORIZED_URL };

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) config.headers = { Authorization: `Bearer ${token}` } as any;
  return config;
});

// Session redirects go through lib/authRedirect, which guarantees one
// navigation per page load and stops if the app is looping (UBX-423). Only a
// definite answer from our backend navigates: a 401 clears the token and goes
// to sign-in; a JSON 403 keeps the token (still valid, just not allowed here)
// and goes to /unauthorized. Edge responses (Cloudflare block, challenge,
// rate limit) and network errors never navigate.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const kind = classifyRequestError(err);
    if (kind === "unauthenticated") redirectToSignIn("api:401");
    else if (kind === "forbidden") redirectToUnauthorized("api:403");
    return Promise.reject(err);
  }
);

export default api;

// No interceptors — safe for public endpoints where a logged-in user's token must NOT be sent
export const publicApi = axios.create({
  baseURL: `${API_URL}/api`,
});
