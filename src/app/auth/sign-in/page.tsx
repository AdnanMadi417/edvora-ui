
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
      console.log("Attempting login with:", { email });

      const loginRes = await api.post("/auth/login", { email, password });
      console.log("Login response:", loginRes);

      // Handle bearer token from login response if provided
      const accessToken: string | undefined = loginRes?.data?.access_token;
      const tokenType: string | undefined = loginRes?.data?.token_type;
      if (accessToken) {
        const bearerPrefix = tokenType && tokenType.toLowerCase() === "bearer" ? "Bearer " : "";
        const authorizationHeader = `${bearerPrefix}${accessToken}`;

        // Persist for subsequent requests and middleware
        if (typeof window !== "undefined") {
          localStorage.setItem("token", authorizationHeader);
          // Store raw JWT (without Bearer) for middleware verification
          document.cookie = `token=${accessToken}; Path=/; SameSite=Lax`;
        }
        api.defaults.headers.common["Authorization"] = authorizationHeader;
      }

      const res = await api.get("/auth/me");
      const user = res.data;
      console.log("Current user:", user);

      if (user.role === "account_manager") {
        router.push("/account-manager/applications");
      } else if (user.role === "partner") {
        router.push("/partner/applications");
      } else {
        console.warn("Unknown user role:", user.role);
        setError("Unauthorized role");
      }
    } catch (err: any) {
      console.error("Login failed:", err);

      const msg = err.response?.data?.detail || err.message || "Login failed. Please try again.";
      setError(msg);
    }
  };

  return (
    <AuthLayout>
      <SignInForm onSubmit={handleSignIn} />

      {error && (
        <div className="mt-4 rounded-md border border-danger bg-alert-danger px-4 py-2 text-center text-sm text-text-error">
          {error}
        </div>
      )}
    </AuthLayout>
  );
}
