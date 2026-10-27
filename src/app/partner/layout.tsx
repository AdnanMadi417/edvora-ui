"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { getActiveNavbar, getActiveRoute } from "utils/navigation";
import Navbar from "components/navbar";
import Sidebar from "components/sidebar";
import Footer from "components/footer/Footer";
import partnerRoutes from '../../routes/partnerRoutes';
import RoleGuard from "components/guard/RoleGuard";
import { ToastProvider } from "components/context/ToastContext";
import PartnerOnboardingTour from "components/onboarding/PartnerOnboardingTour";
import { usePartnerProfile } from "features/partners/hooks";

const PARTNER_ROLES = ["partner"];

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={PARTNER_ROLES}>
      <PartnerShell>{children}</PartnerShell>
    </RoleGuard>
  );
}

// Rendered inside RoleGuard so the partner profile comes from the shared
// session (one /partners/profile per page) rather than a separate fetch.
function PartnerShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { partner } = usePartnerProfile();

  // Per-route visibility rules live on the route itself (routes/partnerRoutes.ts,
  // `hiddenWhen`) — this just resolves the flags they reference from the
  // signed-in partner's profile. `agency` defaults to true while `partner`
  // is still loading, matching the previous behavior: "My Public Profile"
  // (individual-only) was the one hidden by default pre-load, not "Agency
  // Scaler" (agency-only).
  const visibilityFlags: Record<string, boolean> = {
    agency: !partner || partner.type === "agency",
    individual: !!partner && partner.type !== "agency",
    agencyMember: partner?.agency_role === "member",
  };
  const visibleRoutes = partnerRoutes.filter(
    (route) => !route.hiddenWhen?.some((flag) => visibilityFlags[flag])
  );

  return (
    <ToastProvider>
      <PartnerOnboardingTour />
      <div className="relative flex min-h-screen w-full bg-slate-50">
        <Sidebar
          routes={visibleRoutes}
          open={open}
          setOpen={setOpen}
          variant="admin"
        />

        <div className="relative h-full w-full dark:bg-navy-900">
          <main className="mx-2.5 flex-none transition-all md:pr-2 xl:ml-[300px]">
            <Navbar
              onOpenSidenav={() => setOpen(!open)}
              brandText={getActiveRoute(visibleRoutes, pathname)}
              secondary={getActiveNavbar(visibleRoutes, pathname)}
            />
            <div className="mx-auto min-h-screen p-2 !pt-[10px] md:p-2">
              {children}
            </div>
            <div className="p-3">
              <Footer />
            </div>
          </main>

        </div>
      </div>
    </ToastProvider>
  );
}
