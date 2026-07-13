import axios from "axios";
import api from "lib/useApi";

// Separate instance — wrong-password 401 must NOT trigger the global redirect interceptor
const loginApi = axios.create({ baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api` });

export const authService = {
  login: (email: string, password: string) =>
    loginApi.post<{ access_token: string; password_reset_required: boolean }>(
      "/auth/login",
      { email, password },
    ),

  me: (token: string) =>
    api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } }),

  partnerResetPassword: (currentPassword: string, newPassword: string) =>
    api.post("/partners/reset-password", {
      current_password: currentPassword,
      new_password: newPassword,
    }),

  forgotPassword: (email: string) =>
    loginApi.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    loginApi.post("/auth/reset-password", { token, new_password: newPassword }),
};
