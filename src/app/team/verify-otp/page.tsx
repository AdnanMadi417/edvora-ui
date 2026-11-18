import { Suspense } from "react";
import type { Metadata } from "next";
import AgencyInvitationOtpStep from "features/agency-members/components/public/AgencyInvitationOtpStep";

// Linked from the agency invite email: ${frontend_url}/team/verify-otp?email=...
export const metadata: Metadata = { title: "Verify your invite", robots: { index: false, follow: false } };

export default function TeamVerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <AgencyInvitationOtpStep />
    </Suspense>
  );
}
