import { useState } from "react";
import { agencyInvitationsApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useResendAgencyInvitationOtp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [maxResendsReached, setMaxResendsReached] = useState(false);

  const resendOtp = async (email: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await agencyInvitationsApi.resendOtp(email);
      setMaxResendsReached(false);
      return res.data;
    } catch (err) {
      const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
      if (code === "otp_max_resends") {
        setMaxResendsReached(true);
      }
      const msg = parseApiError(err, "Failed to resend OTP. Please try again.");
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { resendOtp, loading, error, maxResendsReached };
}
