"use client";
import type { ReactNode } from "react";
import { SessionProvider } from "components/context/SessionContext";
interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
}

/** Each role area runs in its own demo session; the root preview picker is the role switch. */
export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  return <SessionProvider role={allowedRoles[0]}>{children}</SessionProvider>;
}
