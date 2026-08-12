import { ClipboardList, BookOpen, Bell, Truck, UserPlus } from "lucide-react";

import type { IRoute } from "../types/navigation";

const partnerRoutes: IRoute[] = [
  {
    name: "Applications",
    layout: "/partner",
    path: "/applications",
    icon: ClipboardList,
  },

  {
    name: "Knowledge Hub",
    layout: "/partner",
    path: "/knowledge-hub",
    icon: BookOpen,
  },

  {
    // Kept in the sidebar (unlike admin/account-manager) — the mandatory partner
    // onboarding tour (PartnerOnboardingTour.tsx) spotlights this exact nav item
    // via data-tour-id="notifications" as one of its fixed steps.
    name: "Notifications",
    layout: "/partner",
    path: "/notifications",
    icon: Bell,
  },

  {
    name: "Logistics Marketplace",
    layout: "/partner",
    path: "/logistics-marketplace",
    icon: Truck,
  },

  {
    name: "Team Members",
    layout: "/partner",
    path: "/team-members",
    icon: UserPlus,
  },
];

export default partnerRoutes;
