"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { getActiveNavbar, getActiveRoute } from "utils/navigation";
import Navbar from "components/ub/navigation/NavbarTop";
import Sidebar from "components/ub/navigation/Sidebar";
import Footer from "components/ub/navigation/Footer";
import partnerRoutes, { type PartnerVisibilityFlag } from '../../routes/partnerRoutes';
import RoleGuard from "components/guard/RoleGuard";
import { ToastProvider } from "components/ub/feedback/ToastContext";
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
// (mock) session rather than a separate fetch.
function PartnerShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { partner } = usePartnerProfile();

  // Per-route visibility rules live on the route itself (routes/partnerRoutes.ts,
  // `hiddenWhen`, built through its typed `hideFor()` helper so a typo or a
  // renamed flag is a compile error there, not a route that silently never
  // hides or never shows) — this just resolves those flags from the
  // signed-in partner's profile.
  //
  // Any gated route (one with a `hiddenWhen` at all) stays hidden until
  // `partner` has actually loaded, rather than guessing from a default and
  // correcting once the real profile arrives — showing a restricted item
  // and then yanking it away is worse than a brief, uniform "not there
  // yet". This is structural: a new gated route gets this for free, with
  // nothing to remember to add to its own `hiddenWhen` list.
  const visibilityFlags: Record<PartnerVisibilityFlag, boolean> = {
    agency: partner?.type === "agency",
    individual: !!partner && partner.type !== "agency",
    agencyMember: partner?.agency_role === "member",
  };
  const visibleRoutes = partnerRoutes.filter((route) => {
    if (!route.hiddenWhen) return true;
    if (!partner) return false;
    return !route.hiddenWhen.some((flag) => visibilityFlags[flag as PartnerVisibilityFlag]);
  });

  return (
    <ToastProvider>
      <PartnerOnboardingTour />
      <div className="ub-canvas-light relative flex min-h-screen w-full text-ub-text-primary">
        <Sidebar
          routes={visibleRoutes}
          open={open}
          setOpen={setOpen}
          variant="admin"
        />

        <div className="relative flex min-h-screen w-full min-w-0 flex-col xl:ms-64">
          <Navbar
            onOpenSidenav={() => setOpen(!open)}
            brandText={getActiveRoute(visibleRoutes, pathname)}
            secondary={getActiveNavbar(visibleRoutes, pathname)}
          />
          <main className="w-full flex-1 p-4 md:p-6 lg:p-8">{children}</main>
          <div className="px-4 md:px-6 lg:px-8">
            <Footer />
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
