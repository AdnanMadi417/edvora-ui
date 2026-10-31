"use client";

import reviewerRoutes from "../../routes/reviewerRoutes";
import RoleGuard from "components/guard/RoleGuard";
import { ToastProvider } from "components/ub/feedback/ToastContext";
import AppShell from "components/ub/navigation/AppShell";

const REVIEWER_ROLES = ["admin", "reviewer"];

export default function ReviewerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={REVIEWER_ROLES}>
      <ToastProvider>
        <AppShell routes={reviewerRoutes}>{children}</AppShell>
      </ToastProvider>
    </RoleGuard>
  );
}
