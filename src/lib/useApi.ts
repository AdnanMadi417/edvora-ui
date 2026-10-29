import axios from "axios";
import { mockAdapter } from "mocks/adapter";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// UI-only mode: no auth token and no sign-in redirects. Requests are answered
// by the in-browser mock API (src/mocks) unless NEXT_PUBLIC_USE_MOCKS=false,
// in which case they go to NEXT_PUBLIC_API_URL.
const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";
const adapter = useMocks ? mockAdapter : undefined;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  adapter,
});

export default api;

export const publicApi = axios.create({
  baseURL: `${API_URL}/api`,
  adapter,
});
