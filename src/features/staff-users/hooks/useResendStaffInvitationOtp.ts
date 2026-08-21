import { useState } from "react";
import { staffInvitationsApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useResendStaffInvitationOtp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resendStaffInvitationOtp = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await staffInvitationsApi.resendOtp(email);
      return res.data;
    } catch (err) {
      setError(parseApiError(err, "Failed to resend verification code"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { resendStaffInvitationOtp, loading, error };
}
