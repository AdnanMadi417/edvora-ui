"use client";

import adminRoutes from "../../routes/adminRoutes";
import RoleGuard from "components/guard/RoleGuard";
import { ToastProvider } from "components/ub/feedback/ToastContext";
import AppShell from "components/ub/navigation/AppShell";

const ADMIN_ROLES = ["admin"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={ADMIN_ROLES}>
      <ToastProvider>
        <AppShell routes={adminRoutes}>{children}</AppShell>
      </ToastProvider>
    </RoleGuard>
  );
}
