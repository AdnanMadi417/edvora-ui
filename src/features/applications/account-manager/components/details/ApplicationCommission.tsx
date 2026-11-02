"use client";

import { PartnerPayoutSection } from "features/applications/payouts";
import { DisputeSection } from "features/applications/disputes";
import CommissionCard from "features/applications/components/CommissionCard";
import { toApplicationView } from "features/applications/model/applicationView";

interface ApplicationCommissionsProps {
  application: any;
}

/** Account manager's Commission tab: read only. */
export default function ApplicationCommissions({ application }: ApplicationCommissionsProps) {
  return (
    <>
      <CommissionCard commission={toApplicationView(application, "3").commission} />
      <PartnerPayoutSection payout={application?.partner_payout ?? null} />
      <DisputeSection dispute={application?.dispute ?? null} />
    </>
  );
}
