"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import Button from "components/ub/core/Button";
import type { ApplicationActionsResponse } from "features/applications/hooks";
import DisputeCommission from "features/applications/partner/components/popups/DisputeCommission";
import ConfirmReceived from "features/applications/partner/components/popups/ConfirmReceived";
import { PartnerPayoutSection } from "features/applications/payouts";
import { DisputeSection } from "features/applications/disputes";
import { usePartnerProfile } from "features/partners/hooks/usePartnerProfile";
import CommissionCard from "features/applications/components/CommissionCard";
import { toApplicationView } from "features/applications/model/applicationView";

interface ApplicationCommissionProps {
  application: any;
  actions: ApplicationActionsResponse | null;
  onRefetch?: () => void;
}

/** Advisor's Commission tab: the commission with Confirm received / Dispute commission, then payout and dispute. */
export default function ApplicationCommission({ application, actions, onRefetch }: ApplicationCommissionProps) {
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { partner } = usePartnerProfile();
  const statusCode = actions?.status_code;

  // Only the agency admin (or an independent advisor) may confirm or dispute;
  // the backend refuses an agency member with forbidden_agency_member.
  const isAgencyMember = partner?.agency_role === "member";
  const canActOnCommission = !isAgencyMember && (statusCode === "COMMISSION_PAID" || statusCode === "DISPUTE_RESPONSE_RECEIVED");

  return (
    <>
      <CommissionCard
        commission={toApplicationView(application, "2").commission}
        actions={
          canActOnCommission && (
            <>
              <Button variant="primary" onClick={() => setIsConfirmOpen(true)} icon={<CheckCircle className="h-4 w-4" aria-hidden="true" />} text="Confirm received" />
              <Button variant="secondary" onClick={() => setIsDisputeOpen(true)} icon={<AlertCircle className="h-4 w-4" aria-hidden="true" />} text="Dispute commission" />
            </>
          )
        }
      />
      <PartnerPayoutSection payout={application?.partner_payout ?? null} />
      <DisputeSection dispute={application?.dispute ?? null} />

      <DisputeCommission isOpen={isDisputeOpen} onClose={() => setIsDisputeOpen(false)} applicationId={application?.id} onSuccess={onRefetch} />
      <ConfirmReceived isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} applicationId={application?.id} onSuccess={onRefetch} />
    </>
  );
}
