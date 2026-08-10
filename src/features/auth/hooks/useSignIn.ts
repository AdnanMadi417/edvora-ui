import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { authService } from "../services/auth.api";
import { parseApiError } from "utils/parseApiError";

export function useSignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError("");
    try {
      const loginRes = await authService.login(email, password);
      const { access_token: token, password_reset_required } = loginRes.data;

      Cookies.set("token", token, { expires: 1, path: "/" });

      const userRes = await authService.me(token);
      const user = userRes.data;
      const role = user.role?.toLowerCase();

      localStorage.setItem("userRole", role);
      localStorage.setItem("userId", user.id);
      Cookies.set("userRole", role, { expires: 1, path: "/" });

      if (role === "partner") {
        localStorage.setItem("partnerId", user.partner_id ?? user.id);
        router.replace(
          password_reset_required ? "/auth/partner-reset-password" : "/partner/applications",
        );
      } else if (role === "account_manager") {
        localStorage.setItem("managerId", user.id);
        router.replace("/account-manager/applications");
      } else if (role === "admin") {
        localStorage.setItem("adminId", user.id);
        router.replace("/admin/applications");
      } else if (role === "reviewer") {
        router.replace("/reviewer/partners");
      } else if (role === "data_entry") {
        router.replace("/data-entry/universities");
      } else {
        setError("Unauthorized role");
      }
    } catch (err) {
      setError(parseApiError(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return { signIn, loading, error };
}
