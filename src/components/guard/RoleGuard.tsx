"use client";

import { ReactNode } from "react";
import { SessionProvider } from "components/context/SessionContext";

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
}

/**
 * UI-only mode: no gate. Provides a mock session as the layout's primary
 * role (the first of `allowedRoles`) so role-aware UI still renders.
 */
export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  return <SessionProvider role={allowedRoles[0]}>{children}</SessionProvider>;
}
