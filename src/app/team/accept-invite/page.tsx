import { Suspense } from "react";
import AgencyMemberSubmitProfile from "features/agency-members/components/public/AgencyMemberSubmitProfile";

export default function TeamAcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AgencyMemberSubmitProfile />
    </Suspense>
  );
}
