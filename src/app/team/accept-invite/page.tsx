import { Suspense } from "react";
import type { Metadata } from "next";
import AgencyMemberSubmitProfile from "features/agency-members/components/public/AgencyMemberSubmitProfile";

// Linked from the profile-link email: ${frontend_url}/team/accept-invite?token=...
export const metadata: Metadata = { title: "Complete your profile", robots: { index: false, follow: false } };

export default function TeamAcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AgencyMemberSubmitProfile />
    </Suspense>
  );
}
