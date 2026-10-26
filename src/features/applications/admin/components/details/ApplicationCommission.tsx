"use client";

import React, { useState } from "react";
import { Receipt, CheckCircle } from "lucide-react";
import Button from "components/ui/buttons/Button";
import DocumentActions from "features/applications/shared/DocumentActions";
import { SectionIconBadge } from "components/ui/icons";
import ApplicationCommissionRecords from "features/applications/shared/ApplicationCommissionRecords";
import type { ApplicationCommissionItem } from "features/applications/shared/commissionTypes";
import { UniversityPayInSection } from "features/applications/pay-ins";
import { PartnerPayoutSection } from "features/applications/payouts";
import { DisputeSection, CompleteCommissionOnBehalf } from "features/applications/disputes";
import { useApplicationActions } from "features/applications/hooks";

interface ApplicationCommissionsProps {
  application: any;
  onRefetch?: () => void;
}

export default function ApplicationCommissions({
  application,
  onRefetch,
}: ApplicationCommissionsProps) {
  const commissions: ApplicationCommissionItem[] = application?.commissions || [];
  const studentName = application?.student?.name;
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);

  // For when the advisor never confirms receipt: the status picker has no
  // edges from these two statuses, so this is the admin's only way to close it.
  const { actions, refetch: refetchActions } = useApplicationActions(application?.id);
  const statusCode = actions?.status_code;
  const canCompleteOnBehalf =
    statusCode === "COMMISSION_PAID" || statusCode === "DISPUTE_RESPONSE_RECEIVED";

  const handleCompleted = () => {
    refetchActions();
    onRefetch?.();
  };

  const commissionDocs = Object.values(
    application?.commission_documents || {}
  ).filter(Boolean) as any[];

  const formatLabel = (text?: string) =>
  text
    ? text.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Commission Document";

  return (
    <>
      <div className="flex flex-col items-start gap-3 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-start gap-3">
            <SectionIconBadge icon={Receipt} color="blue" />
            <div>
              <h3 className="text-p3 font-semibold text-slate-900">
                Commission Details
              </h3>

              <span className="text-sm text-slate-500">
                Track payments, status, and resolve disputes
              </span>
            </div>
          </div>

          {canCompleteOnBehalf && (
            <Button
              onClick={() => setIsCompleteOpen(true)}
              icon={<CheckCircle className="h-4 w-4" />}
              text="Complete on Advisor's Behalf"
              bgColor="bg-green-50"
              textColor="text-green-700"
              borderColor="border-green-500"
              hoverTextColor="hover:text-green-700"
              hoverBorderColor="hover:border-green-600"
              className="w-full hover:bg-green-100 sm:w-auto sm:shrink-0"
            />
          )}
        </div>

        <ApplicationCommissionRecords commissions={commissions} />

        <UniversityPayInSection payIn={application?.university_pay_in ?? null} onRefetch={onRefetch} />

        <PartnerPayoutSection
          payout={application?.partner_payout ?? null}
          canVoid
          onRefetch={onRefetch}
          studentName={studentName}
        />

        <DisputeSection
          dispute={application?.dispute ?? null}
          partnerPayoutId={application?.partner_payout?.id}
          canManageDispute
          onRefetch={onRefetch}
        />

        <div className="space-y-4 p-6">
          {commissionDocs.length > 0 ? (
            commissionDocs.map((doc: any) => (
              <div
                key={doc.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                      <Receipt className="h-5 w-5 text-green-600" />
                    </div>

                    <p className="font-medium text-slate-900">
                      {formatLabel(doc.document_type)}
                    </p>

                  </div>

                  <div className="flex items-center gap-2">
                    <DocumentActions fileKey={doc.file_key} label={formatLabel(doc.document_type)} personName={studentName} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              No commission documents available.
            </p>
          )}
        </div>

        <CompleteCommissionOnBehalf
          isOpen={isCompleteOpen}
          onClose={() => setIsCompleteOpen(false)}
          applicationId={application?.id}
          onSuccess={handleCompleted}
        />
    </>
  );
}
