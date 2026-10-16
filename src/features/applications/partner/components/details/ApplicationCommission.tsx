"use client";

import React, { useState } from "react";
import { Receipt, AlertCircle } from "lucide-react";
import type { ApplicationActionsResponse } from "features/applications/hooks";
import DisputeCommission from "features/applications/partner/components/popups/DisputeCommission";
import DocumentActions from "features/applications/shared/DocumentActions";
import Button from "components/ui/buttons/Button";
import { SectionIconBadge } from "components/ui/icons";
import ApplicationCommissionRecords from "features/applications/shared/ApplicationCommissionRecords";
import type { ApplicationCommissionItem } from "features/applications/shared/commissionTypes";
import { PartnerPayoutSection } from "features/applications/payouts";

interface ApplicationCommissionProps {
  application: any;
  actions: ApplicationActionsResponse | null;
  onRefetch?: () => void;
}

export default function ApplicationCommission({
  application,
  actions,
  onRefetch,
}: ApplicationCommissionProps) {
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const studentName = application?.student?.name;

  const { status: statusLabel, partner_actions } = actions || {};

  const canDispute = partner_actions?.some(
    (a) => a.target_status_code === "COMMISSION_DISPUTED"
  );

  const commissions: ApplicationCommissionItem[] = Array.isArray(application?.commissions)
    ? application.commissions
    : [];

  const commissionDocs = Object.values(
    application?.commission_documents || {}
  ).filter((doc: any) => doc !== null) as any[];

  const formatLabel = (text?: string) =>
    text
      ? text.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Commission Document";

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-6">
        <div className="flex flex-1 items-center gap-3">
          <SectionIconBadge icon={Receipt} color="blue" />
          <div>
            <h3 className="text-p3 font-semibold text-slate-900">
              Commission Details
            </h3>
            {statusLabel && (
              <span className="text-sm text-slate-500">
                Current Status: {statusLabel}
              </span>
            )}
          </div>
        </div>

        {canDispute && (
          <Button
            onClick={() => setIsDisputeOpen(true)}
            icon={<AlertCircle className="h-4 w-4" />}
            text="Dispute Commission"
            bgColor="bg-red-50"
            textColor="text-red-700"
            borderColor="border-red-500"
            hoverTextColor="hover:text-red-700"
            hoverBorderColor="hover:border-red-600"
            className="shrink-0 hover:bg-red-100"
          />
        )}
      </div>

      <ApplicationCommissionRecords commissions={commissions} />

      <PartnerPayoutSection payout={application?.partner_payout ?? null} />

      <div className="space-y-4 p-6">
        {commissionDocs.length > 0 ? (
          commissionDocs.map((doc: any) => (
            <div
              key={doc.id}
              className="rounded-lg border border-slate-200 "
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

      <DisputeCommission
        isOpen={isDisputeOpen}
        onClose={() => setIsDisputeOpen(false)}
        applicationId={application?.id}
        onSuccess={onRefetch}
      />
    </>
  );
}
