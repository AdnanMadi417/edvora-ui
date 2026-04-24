"use client";
import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import api from "lib/useApi";
import Loading from "components/loading/Loading";

type AuthState = "loading" | "authorized" | "unauthorized";

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    let cancelled = false;

    const verifyRole = async () => {
      try {
        const res = await api.get("/auth/me");
        const role = res.data.role.toLowerCase();

        if (cancelled) return;

        if (allowedRoles.includes(role)) {
          setAuthState("authorized");
        } else {
          setAuthState("unauthorized");
          router.replace("/unauthorized");
        }
      } catch {
        if (!cancelled) {
          setAuthState("unauthorized");
          router.replace("/auth/sign-in");
        }
      }
    };

    verifyRole();
    return () => { cancelled = true; };
  }, [allowedRoles, router]);

  if (authState === "loading" || authState === "unauthorized") return <Loading />;
  return <>{children}</>;
}
