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

  // "Agency Scaler" (agency invitations) only applies to agency/company
  // partners — individual advisors have no team to manage. "My Public
  // Profile" is the mirror image — public profiles are individual-only
  // in V1, so agency partners don't get that item. "Commission Tracker" is
  // the agency admin's payout view -- agency members don't manage commissions.
  // Agency Scaler itself is admin-only too -- its backend endpoints
  // (GET /partners/agency/members, .../invitations) 403 for a member, and
  // that page has no fallback for that, so it must stay hidden for them.
  const isAgencyMember = partner?.agency_role === "member";
  const visibleRoutes = (
    partner && partner.type !== "agency"
      ? partnerRoutes.filter((route) => route.name !== "Agency Scaler")
      : partnerRoutes.filter((route) => route.name !== "My Public Profile")
  ).filter((route) => !isAgencyMember || (route.name !== "Commission Tracker" && route.name !== "Agency Scaler"));

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
