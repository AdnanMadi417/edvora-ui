import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../services/auth.api";
import { parseApiError } from "utils/parseApiError";

export function useResetPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetPassword = async (token: string, newPassword: string) => {
    setLoading(true);
    setError("");
    setTokenInvalid(false);
    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => router.replace("/auth/sign-in"), 2000);
    } catch (err: unknown) {
      const isInvalidToken =
        (err as { response?: { data?: { code?: string } } })?.response?.data?.code ===
        "reset_token_invalid";
      if (isInvalidToken) {
        setTokenInvalid(true);
      } else {
        setError(parseApiError(err, "Something went wrong. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, loading, error, tokenInvalid, success };
}
