"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import axios, { isAxiosError } from "axios";
import { AuthLayout, SignInForm } from "features/auth";
import api from "lib/useApi";

const authApi = axios.create({ baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api` });

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSignIn = async (email: string, password: string, keepLoggedIn: boolean) => {
    setError("");

    try {
      const loginRes = await authApi.post("/auth/login", { email, password });
      const token = loginRes.data.access_token;

      Cookies.set("token", token, { expires: keepLoggedIn ? 30 : 1, path: "/" });

      const userRes = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = userRes.data;
      const role = user.role?.toLowerCase();

      localStorage.setItem("userRole", role);
      localStorage.setItem("userId", user.id);
      Cookies.set("userRole", role, { expires: keepLoggedIn ? 30 : 1, path: "/" });

      if (role === "partner") {
        localStorage.setItem("partnerId", user.partner_id ?? user.id);
        router.replace("/partner/applications");
      } else if (role === "account_manager") {
        localStorage.setItem("managerId", user.manager_id ?? user.id);
        router.replace("/account-manager/applications");
      } else if (role === "admin") {
        localStorage.setItem("adminId", user.admin_id ?? user.id);
        router.replace("/admin/applications");
      } else {
        setError("Unauthorized role");
      }
    } catch (err) {
      const message = isAxiosError(err)
        ? err.response?.data?.detail ?? "Login failed. Please try again."
        : "An unexpected error occurred.";
      setError(message);
    }
  };

  return (
    <AuthLayout>
      <SignInForm onSubmit={handleSignIn} />
      {error && <div className="mt-2 text-center text-red-500">{error}</div>}
    </AuthLayout>
  );
}
