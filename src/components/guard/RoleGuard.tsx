"use client";
import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import api from "lib/useApi";

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const verifyRole = async () => {
      try {
        const res = await api.get("/auth/me");
        const role = res.data.role.toLowerCase();

        if (allowedRoles.includes(role)) {
          setAuthorized(true);
        } else {
          router.replace("/unauthorized");
        }
      } catch {
        router.replace("/auth/sign-in");
      }
    };
    verifyRole();
  }, [allowedRoles, router]);

  if (!authorized) return null;
  return <>{children}</>;
}
