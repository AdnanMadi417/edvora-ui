import axios from "axios";
import api from "lib/useApi";

// Separate instance — wrong-password 401 must NOT trigger the global redirect interceptor
const loginApi = axios.create({ baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api` });

export const authService = {
  login: (email: string, password: string) =>
    loginApi.post<{ access_token: string; password_reset_required: boolean; has_completed_onboarding: boolean }>(
      "/auth/login",
      { email, password },
    ),

  me: (token: string) =>
    api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } }),

  // The URL still says "partners" since that's the real backend route, but
  // the handler has no role check -- it just operates on whoever the token
  // belongs to. Used as the universal "I have a temp password, set a real
  // one" flow for every role, not just partners.
  resetCurrentPassword: (currentPassword: string, newPassword: string) =>
    api.post("/partners/reset-password", {
      current_password: currentPassword,
      new_password: newPassword,
    }),

  forgotPassword: (email: string) =>
    loginApi.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    loginApi.post("/auth/reset-password", { token, new_password: newPassword }),
};
