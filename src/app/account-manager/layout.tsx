"use client";

import accountManagerRoutes from "../../routes/accountManagerRoutes";
import RoleGuard from "components/guard/RoleGuard";
import { ToastProvider } from "components/ub/feedback/notifications/ToastContext";
import AppShell from "components/ub/navigation/layout/AppShell";

const ACCOUNT_MANAGER_ROLES = ["account_manager", "admin"];

export default function AccountManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={ACCOUNT_MANAGER_ROLES}>
      <ToastProvider>
        <AppShell routes={accountManagerRoutes}>{children}</AppShell>
      </ToastProvider>
    </RoleGuard>
  );
}
