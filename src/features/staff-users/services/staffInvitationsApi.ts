import api, { publicApi } from "lib/useApi";
import Cookies from "js-cookie";

const authHeader = () => {
  const token = Cookies.get("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface InviteStaffUserPayload {
  name: string;
  email: string;
  role: "admin" | "reviewer" | "data_entry";
}

export const staffInvitationsApi = {
  invite: (payload: InviteStaffUserPayload) =>
    api.post<{ message: string }>("/admin/staff-invitations", payload, {
      headers: authHeader(),
    }),

  resendOtp: (email: string) =>
    api.post<{ message: string }>(
      "/admin/staff-invitations/resend-otp",
      { email },
      { headers: authHeader() }
    ),

  // Public endpoint — use publicApi so a logged-in user's token is never sent
  verifyOtp: (email: string, otp: string) =>
    publicApi.post<{ message: string; email: string; role: string }>(
      "/staff-invitations/verify-otp",
      { email, otp }
    ),
};
