"use client";
import RoleGuard from "components/guard/RoleGuard";
import AppShell from "components/ub/navigation/layout/AppShell";
import { ToastProvider } from "components/ub/feedback/notifications/ToastContext";
import CentreAccessBoundary from "features/language-centre-admin/components/CentreAccessBoundary";
import routes from "routes/languageCentreAdminRoutes";
/** The centre-admin portal shell; layout.tsx only renders it while the feature is on. */
export default function LanguageCentreAdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["language_centre_admin"]}>
      <ToastProvider>
        <CentreAccessBoundary>
          <AppShell routes={routes}>{children}</AppShell>
        </CentreAccessBoundary>
      </ToastProvider>
    </RoleGuard>
  );
}
