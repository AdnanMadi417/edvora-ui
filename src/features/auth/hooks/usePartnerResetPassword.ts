import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../services/auth.api";
import { parseApiError } from "utils/parseApiError";

export function usePartnerResetPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const resetPassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    setError("");
    try {
      await authService.partnerResetPassword(currentPassword, newPassword);
      setSuccess(true);
      setTimeout(() => router.replace("/partner/applications"), 1500);
    } catch (err) {
      setError(parseApiError(err, "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, loading, error, success };
}
