import { useState } from "react";
import { staffInvitationsApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useVerifyStaffInvitationOtp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verifyStaffInvitationOtp = async (email: string, otp: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await staffInvitationsApi.verifyOtp(email, otp);
      return res.data;
    } catch (err) {
      const msg = parseApiError(err, "Invalid or expired code.");
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { verifyStaffInvitationOtp, loading, error };
}
