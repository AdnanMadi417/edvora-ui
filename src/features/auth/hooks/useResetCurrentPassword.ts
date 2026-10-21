import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../services/auth.api";
import { parseApiError } from "utils/parseApiError";

// Keep in sync with roleHomePaths in src/middleware.ts and the per-role
// redirects in useSignIn.ts.
const ROLE_HOME_PATHS: Record<string, string> = {
  admin: "/admin/applications",
  partner: "/partner/applications",
  account_manager: "/account-manager/applications",
  reviewer: "/reviewer/partners",
  data_entry: "/data-entry/knowledge-hub",
};

// Universal "I have a temp password, set a real one" flow -- every role
// lands here after login when password_reset_required is true, not just
// partners (see resetCurrentPassword in auth.api.ts for why one endpoint
// can serve all of them).
export function useResetCurrentPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const resetPassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    setError("");
    try {
      await authService.resetCurrentPassword(currentPassword, newPassword);
      setSuccess(true);
      const role = localStorage.getItem("userRole") ?? "";
      setTimeout(() => router.replace(ROLE_HOME_PATHS[role] ?? "/auth/sign-in"), 1500);
    } catch (err) {
      setError(parseApiError(err, "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, loading, error, success };
}
