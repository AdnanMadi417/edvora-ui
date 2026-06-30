import { useState } from "react";
import { partnersApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useResendRegistrationOtp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resendOtp = async (email: string) => {
    setLoading(true);
    setError("");
    try {
      await partnersApi.registerResendOtp(email);
    } catch (err) {
      const msg = parseApiError(err, "Failed to resend OTP. Please try again.");
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { resendOtp, loading, error };
}
