import { Suspense } from "react";
import AgencyInvitationOtpStep from "features/agency-members/components/public/AgencyInvitationOtpStep";

export default function AgencyInvitationPage() {
  return (
    <Suspense fallback={null}>
      <AgencyInvitationOtpStep />
    </Suspense>
  );
}
