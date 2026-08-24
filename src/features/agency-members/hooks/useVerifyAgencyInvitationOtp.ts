import { useState } from "react";
import { agencyInvitationsApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useVerifyAgencyInvitationOtp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verifyOtp = async (email: string, otp: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await agencyInvitationsApi.verifyOtp(email, otp);
      return res.data;
    } catch (err) {
      const msg = parseApiError(err, "Invalid or expired OTP.");
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { verifyOtp, loading, error };
}
