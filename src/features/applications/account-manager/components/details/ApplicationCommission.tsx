"use client";

import React from "react";
import { Receipt } from "lucide-react";
import DocumentActions from "features/applications/shared/DocumentActions";
import SectionIconBadge from "components/ub/icons/SectionIconBadge";
import ApplicationCommissionRecords from "features/applications/shared/ApplicationCommissionRecords";
import type { ApplicationCommissionItem } from "features/applications/shared/commissionTypes";
import { PartnerPayoutSection } from "features/applications/payouts";
import { DisputeSection } from "features/applications/disputes";

interface ApplicationCommissionsProps {
  application: any;
}

export default function ApplicationCommissions({
  application,
}: ApplicationCommissionsProps) {
  const commissions: ApplicationCommissionItem[] = application?.commissions || [];
  const studentName = application?.student?.name;

  const commissionDocs = Object.values(
    application?.commission_documents || {}
  ).filter(Boolean) as any[];

  const formatLabel = (text?: string) =>
  text
    ? text.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Commission Document";

  return (
    <>
      <div className="flex items-start gap-3 border-b border-slate-200 p-6">
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

      <ApplicationCommissionRecords commissions={commissions} />

      <PartnerPayoutSection payout={application?.partner_payout ?? null} studentName={studentName} />

      <DisputeSection dispute={application?.dispute ?? null} />

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
    </>
  );
}
