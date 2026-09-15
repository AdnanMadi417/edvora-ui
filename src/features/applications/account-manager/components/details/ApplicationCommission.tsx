"use client";

import React from "react";
import { Receipt, Clock } from "lucide-react";
import DocumentActions from "features/applications/shared/DocumentActions";
import { SectionIconBadge } from "components/ui/icons";
import { DetailStatusBadge } from "components/ui/badges";
import { getStatusVariant } from "utils/getStatusVariant";
import {
  type ApplicationCommissionItem,
  formatCommissionAmount,
  formatCommissionTimeline,
} from "features/applications/shared/commissionTypes";

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

  const hasCommissions = commissions.length > 0;

  const formatLabel = (text?: string) =>
  text
    ? text.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Commission Document";

  if (!hasCommissions && commissionDocs.length === 0) return null;

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

      {hasCommissions && (
        <div className="space-y-3 border-b border-slate-200 p-6">
          {commissions.map((c) => {
            const timeline = formatCommissionTimeline(c.expected_commission_from, c.expected_commission_to);
            return (
              <div key={c.id} className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  {c.amount != null && (
                    <p className="text-lg font-bold text-slate-900">
                      {formatCommissionAmount(c.amount, c.currency)}
                      {c.commission_type && (
                        <span className="ml-2 text-xs font-normal text-slate-400">{c.commission_type}</span>
                      )}
                    </p>
                  )}
                  {c.notes && <p className="mt-1 text-sm text-slate-500">{c.notes}</p>}
                  {timeline && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      {timeline}
                    </p>
                  )}
                </div>
                <DetailStatusBadge variant={getStatusVariant(c.status)}>{c.status}</DetailStatusBadge>
              </div>
            );
          })}
        </div>
      )}

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
            No commission records found.
          </p>
        )}
      </div>
    </>
  );
}
