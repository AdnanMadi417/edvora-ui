import { ClipboardList, BookOpen, Bell, Truck, UserPlus, Globe2 } from "lucide-react";

import type { IRoute } from "../types/navigation";

const partnerRoutes: IRoute[] = [
  {
    // The mandatory partner onboarding tour (PartnerOnboardingTour.tsx) spotlights
    // this exact nav item via data-tour-id="notifications" as one of its fixed steps.
    name: "Notifications",
    layout: "/partner",
    path: "/notifications",
    icon: Bell,
  },

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
    name: "Logistics Marketplace",
    layout: "/partner",
    path: "/logistics-marketplace",
    icon: Truck,
  },

  {
    name: "Agency Scaler",
    layout: "/partner",
    path: "/team-members",
    icon: UserPlus,
  },

  {
    // Individual advisors only — public profiles are individual-only in V1
    // (see partner_public_profiles). Filtered out for agency partners in
    // app/partner/layout.tsx, mirroring how "Agency Scaler" is filtered out
    // for individual partners.
    name: "My Public Profile",
    layout: "/partner",
    path: "/public-profile",
    icon: Globe2,
  },
];

export default partnerRoutes;
