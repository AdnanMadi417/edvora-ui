import { useState } from "react";
import { authService } from "../services/auth.api";

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      await authService.forgotPassword(email);
    } catch {
      // Always show the same message regardless of outcome (204 or error)
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return { forgotPassword, loading, submitted };
}
