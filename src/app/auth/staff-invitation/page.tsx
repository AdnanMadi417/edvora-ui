import { Suspense } from "react";
import StaffInvitationVerify from "features/staff-users/components/public/StaffInvitationVerify";

export default function StaffInvitationPage() {
  return (
    <Suspense fallback={null}>
      <StaffInvitationVerify />
    </Suspense>
  );
}
