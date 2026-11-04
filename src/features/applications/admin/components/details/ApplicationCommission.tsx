"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import Button from "components/ub/core/buttons/Button";
import { UniversityPayInSection } from "features/applications/pay-ins";
import { PartnerPayoutSection } from "features/applications/payouts";
import { DisputeSection, CompleteCommissionOnBehalf } from "features/applications/disputes";
import { useApplicationActions } from "features/applications/hooks";
import CommissionCard from "features/applications/components/CommissionCard";
import { toApplicationView } from "features/applications/model/applicationView";

interface ApplicationCommissionsProps {
  application: any;
  onRefetch?: () => void;
}

/** Admin's Commission tab: commission, Institution pay-in, Advisor payout (voidable) and dispute resolution. */
export default function ApplicationCommissions({ application, onRefetch }: ApplicationCommissionsProps) {
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);

  // For when the advisor never confirms receipt: the status picker has no
  // edges from these two statuses, so this is the admin's only way to close it.
  const { actions, refetch: refetchActions } = useApplicationActions(application?.id);
  const statusCode = actions?.status_code;
  const canCompleteOnBehalf = statusCode === "COMMISSION_PAID" || statusCode === "DISPUTE_RESPONSE_RECEIVED";

  const handleCompleted = () => {
    refetchActions();
    onRefetch?.();
  };

  return (
    <>
      <CommissionCard
        commission={toApplicationView(application, "3").commission}
        actions={canCompleteOnBehalf && <Button variant="secondary" onClick={() => setIsCompleteOpen(true)} icon={<CheckCircle className="h-4 w-4" aria-hidden="true" />} text="Complete on Advisor's behalf" />}
      />
      <UniversityPayInSection payIn={application?.university_pay_in ?? null} onRefetch={onRefetch} />
      <PartnerPayoutSection payout={application?.partner_payout ?? null} canVoid onRefetch={onRefetch} />
      <DisputeSection dispute={application?.dispute ?? null} partnerPayoutId={application?.partner_payout?.id} canManageDispute onRefetch={onRefetch} />

      <CompleteCommissionOnBehalf isOpen={isCompleteOpen} onClose={() => setIsCompleteOpen(false)} applicationId={application?.id} onSuccess={handleCompleted} />
    </>
  );
}
