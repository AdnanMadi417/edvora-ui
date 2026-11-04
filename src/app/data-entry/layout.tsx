"use client";

import dataEntryRoutes from "../../routes/dataEntryRoutes";
import RoleGuard from "components/guard/RoleGuard";
import { ToastProvider } from "components/ub/feedback/notifications/ToastContext";
import AppShell from "components/ub/navigation/layout/AppShell";

const DATA_ENTRY_ROLES = ["data_entry", "admin"];

export default function DataEntryLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={DATA_ENTRY_ROLES}>
      <ToastProvider>
        <AppShell routes={dataEntryRoutes}>{children}</AppShell>
      </ToastProvider>
    </RoleGuard>
  );
}
