"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import AuthLayout from "components/auth/AuthLayout";
import SignInForm from "components/auth/SignInForm";
import api from "lib/useApi";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSignIn = async (email: string, password: string) => {
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {

      const loginRes = await api.post("/auth/login", { email, password });
      const token = loginRes.data.access_token;

      Cookies.set("token", token, { expires: 1, path: "/" });

      const userRes = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = userRes.data;
      const role = user.role?.toLowerCase();

      localStorage.setItem("userRole", role);
      localStorage.setItem("userId", user.id);


      if (role === "partner") {
        localStorage.setItem("partnerId", user.partner_id ? user.partner_id : user.id);
        setTimeout(() => {
          router.replace("/partner/applications");
        }, 100);

      } else if (role === "account_manager") {
        localStorage.setItem("managerId", user.manager_id || user.id);
        setTimeout(() => {
          router.replace("/account-manager/applications");
        }, 100);

      } else if ( role === "admin") {
        localStorage.setItem("adminId", user.admin_id || user.id);
        setTimeout(() => {
          router.replace("/admin/applications");
        }, 100);

      } else {
        setError("Unauthorized role");
      }
    } catch (err: any) {
      console.error(" Login Error:", err);
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    }
  };

  return (
    <AuthLayout>
      <SignInForm onSubmit={handleSignIn} />
      {error && <div className="text-red-500 mt-2 text-center">{error}</div>}
    </AuthLayout>
  );
}
