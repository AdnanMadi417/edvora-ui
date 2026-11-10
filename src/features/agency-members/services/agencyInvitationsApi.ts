import { publicApi } from "lib/useApi";

export const agencyInvitationsApi = {
  resendOtp: (email: string) =>
    publicApi.post<{ message: string }>("/agency-invitations/resend-otp", { email }),
};
