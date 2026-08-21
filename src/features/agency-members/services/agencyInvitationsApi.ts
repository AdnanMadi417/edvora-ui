import { publicApi } from "lib/useApi";
import type { SubmitAgencyMemberProfilePayload } from "../types";

export const agencyInvitationsApi = {
  resendOtp: (email: string) =>
    publicApi.post<{ message: string }>("/agency-invitations/resend-otp", { email }),

  verifyOtp: (email: string, otp: string) =>
    publicApi.post<{ message: string }>("/agency-invitations/verify-otp", { email, otp }),

  submit: (payload: SubmitAgencyMemberProfilePayload) =>
    publicApi.post<{ message: string; reference_id: string }>(
      "/agency-invitations/submit",
      payload
    ),
};
