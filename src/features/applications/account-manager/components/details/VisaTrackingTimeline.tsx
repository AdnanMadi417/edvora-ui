"use client";

import React from "react";
import {
  FileText,
  Calendar,
  XCircle,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { useVisaCase } from "hooks/useVisaCase";
import { useVisaPayments } from "hooks/useVisaPayments";
import DocumentActions from "features/applications/shared/DocumentActions";
import AppDate from "components/ub/data/AppDate";

interface VisaTrackingTimelineProps {
  application: any;
  onRefetch?: () => void;
}

export default function VisaTrackingTimeline({
  application,
}: VisaTrackingTimelineProps) {
  const isVisaStageOrLater = (application?.stage?.name || "").toLowerCase().includes("visa");
  const { visaCase, error: visaError } = useVisaCase(isVisaStageOrLater ? application?.id || "" : "");
  const { payments: visaPayments, error: paymentsError } = useVisaPayments(application?.id || "");

  const hasVisaPayments = Array.isArray(visaPayments) && visaPayments.length > 0;
  const hasVisaCase = !!visaCase;
  const studentName = application?.student?.name;

  if ((visaError || paymentsError) && !hasVisaCase && !hasVisaPayments) {
    return (
      <div className="flex items-start gap-3 border-t border-slate-200 bg-red-50 p-6">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <div>
          <p className="text-sm font-medium text-red-800">Couldn&apos;t load visa tracking details</p>
          <p className="mt-0.5 text-xs text-red-700">{visaError || paymentsError}</p>
        </div>
      </div>
    );
  }

  if (!hasVisaCase && !hasVisaPayments) return null;

  return (
    <>
      {application?.emgs_evaluation_document && (
        <div className="border-t border-gray-200 p-6">
          <h3 className="mb-1 text-sm font-semibold text-gray-900">EMGS Eval Document</h3>
          <p className="mb-4 text-xs text-slate-500">EMGS eval file</p>
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-50">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {application.emgs_evaluation_document.document_type}
                </p>
                <p className="text-xs text-slate-500">
                  Uploaded on{" "}
                  <AppDate value={application.emgs_evaluation_document.created_at} format="short" />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DocumentActions
                fileKey={application.emgs_evaluation_document.file_key}
                label={application.emgs_evaluation_document.document_type}
                personName={studentName}
              />
            </div>
          </div>
        </div>
      )}

      {application?.visa_document && (
        <div className="border-t border-gray-200 p-6">
          <h3 className="mb-1 text-sm font-semibold text-gray-900">Visa Document</h3>
          <p className="mb-4 text-xs text-slate-500">Visa issued by the immigration authority</p>
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-50">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{application.visa_document.document_type}</p>
                <p className="text-xs text-slate-500">
                  Uploaded on <AppDate value={application.visa_document.created_at} format="short" />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DocumentActions
                fileKey={application.visa_document.file_key}
                label={application.visa_document.document_type}
                personName={studentName}
              />
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 p-6">
        {visaPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-md bg-gray-100">
              <Receipt className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-base font-medium text-gray-900">No payments yet</p>
            <p className="mt-1 text-sm text-slate-500">Payment history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Payment History</h3>
              <p className="text-xs text-slate-500">
                {visaPayments.length} payment{visaPayments.length !== 1 ? "s" : ""} recorded
              </p>
            </div>
            {visaPayments.map((payment) => (
              <div
                key={payment.id}
                className="overflow-hidden"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div className="space-y-3">
                    <div className="w-full rounded-md bg-gray-50 px-4 py-4 sm:w-fit">
                      <p className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FileText className="h-4 w-4" />
                        Visa Payment
                      </p>
                      <p className="mt-1 break-all font-mono text-sm font-semibold text-gray-900">
                        <span className="font-medium text-slate-500">Payment Reference:</span>{" "}
                        {payment.payment_reference || "N/A"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Calendar className="h-4 w-4" />
                          <span>
                            <AppDate value={payment.submitted_at} format="datetime" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <p className="text-sm font-medium text-slate-500">Documents</p>
                    {payment.documents.length === 0 ? (
                      <div className="flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5">
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-sm font-medium text-red-600">No documents</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap justify-start gap-2 sm:justify-end">
                        {payment.documents.map((doc) => (
                          <div key={doc.id} className="flex gap-2">
                            <DocumentActions fileKey={doc.file_key} label="Visa Payment Document" personName={studentName} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {application?.arrival_documents?.length > 0 && (
        <div className="border-t border-gray-200 p-6">
          <h3 className="mb-1 text-sm font-semibold text-gray-900">Arrival Documents</h3>
          <p className="mb-4 text-xs text-slate-500">Travel and arrival-related files</p>
          <div className="space-y-3">
            {application.arrival_documents.map((doc: any) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-50">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{doc.document_type}</p>
                    <p className="text-xs text-slate-500">
                      Uploaded on <AppDate value={doc.created_at} format="short" />
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DocumentActions fileKey={doc.file_key} label={doc.document_type} personName={studentName} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
