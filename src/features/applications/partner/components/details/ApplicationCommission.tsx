"use client";

import React, { useState } from "react";
import { Receipt, AlertCircle, CheckCircle } from "lucide-react";
import type { ApplicationActionsResponse } from "features/applications/hooks";
import DisputeCommission from "features/applications/partner/components/popups/DisputeCommission";
import ConfirmReceived from "features/applications/partner/components/popups/ConfirmReceived";
import DocumentActions from "features/applications/shared/DocumentActions";
import Button from "components/ub/core/Button";
import SectionIconBadge from "components/ub/icons/SectionIconBadge";
import ApplicationCommissionRecords from "features/applications/shared/ApplicationCommissionRecords";
import type { ApplicationCommissionItem } from "features/applications/shared/commissionTypes";
import { PartnerPayoutSection } from "features/applications/payouts";
import { DisputeSection } from "features/applications/disputes";
import { usePartnerProfile } from "features/partners/hooks/usePartnerProfile";

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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const studentName = application?.student?.name;

  const { status: statusLabel, status_code: statusCode } = actions || {};
  const { partner } = usePartnerProfile();

  // Only the agency admin (or an independent advisor) may confirm or dispute;
  // the backend refuses an agency member with forbidden_agency_member.
  const isAgencyMember = partner?.agency_role === "member";
  const canActOnCommission =
    !isAgencyMember &&
    (statusCode === "COMMISSION_PAID" || statusCode === "DISPUTE_RESPONSE_RECEIVED");

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
      <div className="flex flex-col items-start gap-3 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
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

        {canActOnCommission && (
          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0">
            <Button
              onClick={() => setIsConfirmOpen(true)}
              icon={<CheckCircle className="h-4 w-4" />}
              text="Confirm Received"
              bgColor="bg-green-50"
              textColor="text-green-700"
              borderColor="border-green-500"
              hoverTextColor="hover:text-green-700"
              hoverBorderColor="hover:border-green-600"
              className="hover:bg-green-100"
            />
            <Button
              onClick={() => setIsDisputeOpen(true)}
              icon={<AlertCircle className="h-4 w-4" />}
              text="Dispute Commission"
              bgColor="bg-red-50"
              textColor="text-red-700"
              borderColor="border-red-500"
              hoverTextColor="hover:text-red-700"
              hoverBorderColor="hover:border-red-600"
              className="hover:bg-red-100"
            />
          </div>
        )}
      </div>

      <ApplicationCommissionRecords commissions={commissions} />

      <PartnerPayoutSection payout={application?.partner_payout ?? null} studentName={studentName} />

      <DisputeSection dispute={application?.dispute ?? null} />

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

      <ConfirmReceived
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        applicationId={application?.id}
        onSuccess={onRefetch}
      />
    </>
  );
}
