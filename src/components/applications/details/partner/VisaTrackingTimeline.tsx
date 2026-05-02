"use client";

import React, { useState } from "react";
import { Download, FileText, Calendar, XCircle } from "lucide-react";

import { useVisaPayments } from "hooks/useVisaPayments";
import { getDocumentDownloadUrl } from "../../../../services/documentService";

interface VisaTrackingTimelineProps {
  application: any;
}

export default function VisaTrackingTimeline({
  application,
}: VisaTrackingTimelineProps) {
  const [downloading, setDownloading] = useState(false);

  const { payments: visaPayments, loading: paymentsLoading } = useVisaPayments(
    application?.id || ""
  );

  const handleDownload = async (fileKey?: string) => {
    if (!fileKey || downloading) return;
    try {
      setDownloading(true);
      const url = await getDocumentDownloadUrl(fileKey);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      // silent — download errors are non-critical
    } finally {
      setDownloading(false);
    }
  };

  const hasEmgs = !!application?.emgs_evaluation_document;
  const hasArrivalDocs = (application?.arrival_documents?.length ?? 0) > 0;
  const hasPayments = visaPayments.length > 0;

  if (paymentsLoading) return null;
  if (!hasEmgs && !hasArrivalDocs && !hasPayments) return null;

  return (
    <>
      {/* EMGS evaluation document (uploaded) */}
      {hasEmgs && (
        <div className="border-t border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">EMGS Eval Document</h3>
          <p className="mb-4 text-sm text-slate-500">EMGS evaluation file</p>
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
                  {new Date(
                    application.emgs_evaluation_document.created_at
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                handleDownload(application.emgs_evaluation_document.file_key)
              }
              disabled={downloading}
              className="rounded-md border border-green-600 bg-green-50 p-2 text-green-700 transition hover:bg-green-100 disabled:opacity-50"
              title="Download document"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Payment history */}
      {hasPayments && (
        <div className="border-t border-gray-200 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
              <p className="text-sm text-slate-500">
                {visaPayments.length} payment{visaPayments.length !== 1 ? "s" : ""} recorded
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {visaPayments.map((payment) => (
              <div
                key={payment.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row">
                  <div className="space-y-3">
                    <div className="w-full rounded-md bg-gray-50 px-4 py-5 sm:w-fit">
                      <p className="flex gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4" />
                        Visa Payment
                      </p>
                      <p className="mt-1 break-all font-mono text-sm font-semibold text-gray-900">
                        <span className="font-medium text-slate-500">Payment Reference: </span>
                        {payment.payment_reference || "N/A"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {payment.submitted_at
                              ? new Date(payment.submitted_at).toLocaleString()
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="text-sm font-medium text-slate-500">Documents</p>
                    {payment.documents.length === 0 ? (
                      <div className="flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5">
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-sm font-medium text-red-600">No documents</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap justify-end gap-2">
                        {payment.documents.map((doc: any) => (
                          <button
                            key={doc.id}
                            onClick={() => handleDownload(doc.file_key)}
                            disabled={downloading}
                            className="rounded-md border border-green-600 bg-green-50 p-2 text-green-700 hover:bg-green-100 disabled:opacity-50"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Arrival documents */}
      {hasArrivalDocs && (
        <div className="border-t border-gray-200 p-6">
          <h3 className="mb-1 text-lg font-semibold text-gray-900">Arrival Documents</h3>
          <p className="mb-4 text-sm text-slate-500">Travel and arrival-related files</p>
          <div className="space-y-4">
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
                      Uploaded on {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(doc.file_key)}
                  disabled={downloading}
                  className="rounded-md border border-green-600 bg-green-50 p-2 text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                  title="Download document"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
