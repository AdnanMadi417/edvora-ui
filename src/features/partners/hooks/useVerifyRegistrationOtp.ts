import { useState } from "react";
import { partnersApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useVerifyRegistrationOtp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verifyOtp = async (email: string, otp: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await partnersApi.registerVerifyOtp(email, otp);
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
