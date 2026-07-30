"use client";

import React from "react";
import { Receipt } from "lucide-react";
import DocumentActions from "features/applications/shared/DocumentActions";

interface ApplicationCommissionsProps {
  application: any;
}

export default function ApplicationCommissions({
  application,
}: ApplicationCommissionsProps) {
  const commissions = application?.commissions || [];
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
        <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
          <Receipt className="text-xl text-blue-700" />
        </span>
        <div>
          <h3 className="text-p3 font-semibold text-slate-900">
            Commission Details
          </h3>
          <span className="text-sm text-slate-500">
            Track payments, status, and resolve disputes
          </span>
        </div>
      </div>

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
