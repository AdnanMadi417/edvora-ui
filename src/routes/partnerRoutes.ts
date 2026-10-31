import { ClipboardList, BookOpen, Bell, Truck, UserPlus, Globe2, Landmark, GraduationCap, Receipt, Home } from "lucide-react";

import type { IRoute } from "../types/navigation";
import { FEATURES } from "../config/featureFlags";

// The full set of conditions a partner nav item can be hidden behind,
// resolved from the signed-in partner's profile in app/partner/layout.tsx.
// Setting a route's `hiddenWhen` through this helper (instead of writing
// the array literal directly) means a typo or a renamed flag is a compile
// error here, not a route that silently never hides or never shows.
export type PartnerVisibilityFlag = "agency" | "individual" | "agencyMember";
const hideFor = (...flags: PartnerVisibilityFlag[]): string[] => flags;

const partnerRoutes: IRoute[] = [
  {
    // Advisor home (brief §6): the Advisor's landing page.
    name: "Home",
    layout: "/partner",
    path: "/home",
    icon: Home,
  },

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
    // Programs and the partner Universities list are the only two entries in
    // this group, so with Universities hidden the group collapses back to the
    // flat link it was before that page landed — no one-item dropdown.
    ...(FEATURES.partnerUniversities
      ? {
          children: [
            {
              name: "Programs",
              layout: "/partner",
              path: "/knowledge-hub",
              icon: GraduationCap,
            },
            {
              name: "Universities",
              layout: "/partner",
              path: "/universities",
              icon: Landmark,
            },
          ],
        }
      : {}),
  },

  {
    name: "Commission Tracker",
    layout: "/partner",
    path: "/commission-tracker",
    icon: Receipt,
    // The agency admin's payout view — agency members don't manage
    // commissions (and the member-filter dropdown's data is admin-only).
    hiddenWhen: hideFor("agencyMember"),
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
    // Admin-only team management: individual advisors have no team to
    // manage, and agency members can't invite/manage teammates either
    // (its data is admin-only on the backend too — see TeamMembersPage.tsx).
    hiddenWhen: hideFor("individual", "agencyMember"),
  },

  // Individual advisors only — public profiles are individual-only in V1
  // (see partner_public_profiles). Gated on top of that while the feature is
  // unreleased.
  ...(FEATURES.partnerPublicProfile
    ? [
        {
          name: "My Public Profile",
          layout: "/partner",
          path: "/public-profile",
          icon: Globe2,
          hiddenWhen: hideFor("agency"),
        },
      ]
    : []),
];

export default partnerRoutes;
