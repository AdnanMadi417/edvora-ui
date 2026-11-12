// UI-only mode: there is no sign-in, so every role layout runs as a fake
// user of its own role. Edit these to preview the UI as someone else
// (e.g. set the partner's `type` to "individual" or `agency_role` to
// "member" to see the partner sidebar change).

import type { SessionUser } from "components/context/SessionContext";
import type { PartnerDetails } from "features/partners/types";

export function mockUser(role: string): SessionUser {
  return {
    id: role === "partner" ? MOCK_PARTNER.user_id : `mock-${role}`,
    partner_id: role === "partner" ? MOCK_PARTNER.id : null,
    name: "Demo user",
    email: `${role.replace("_", "-")}@example.com`,
    role,
    has_completed_onboarding: true,
    agency_role: MOCK_PARTNER.agency_role,
    agency_membership: null,
  };
}

/** Fallback if /partners/profile fails; matches CURRENT_PARTNER in mocks/seed.ts. */
export const MOCK_PARTNER: PartnerDetails = {
  id: "ptn_001",
  user_id: "usr_ptn_001",
  name: "Global pathways education",
  email: "global@example.com",
  type: "agency",
  country: "Nigeria",
  phone: "+200 80 1000000",
  is_active: true,
  is_verified: true,
  assigned_manager_id: null,
  assigned_manager_name: null,
  individual_details: null,
  company_details: null,
  created_at: null,
  updated_at: null,
  last_login: null,
  agency_role: null,
  agency_membership: null,
};
