"use client";

import React, { useState } from "react";
import {
  Download,
  FileText,
  Calendar,
  XCircle,
  Receipt,
} from "lucide-react";
import { useVisaCase } from "hooks/useVisaCase";
import { useVisaPayments } from "hooks/useVisaPayments";
import { getDocumentDownloadUrl } from "services/documentService";
import { AppDate } from "components/ui/date";

interface VisaTrackingTimelineProps {
  application: any;
  onRefetch?: () => void;
}

export default function VisaTrackingTimeline({
  application,
}: VisaTrackingTimelineProps) {
  const {
    visaCase,
    loading: visaLoading,
    error: visaError,
  } = useVisaCase(application?.id || "");

  const {
    payments: visaPayments,
    loading: paymentsLoading,
    error: paymentsError,
  } = useVisaPayments(application?.id || "");

  const hasVisaPayments =
    Array.isArray(visaPayments) && visaPayments.length > 0;

  const hasVisaCase = !!visaCase;

  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (fileKey?: string) => {
    if (!fileKey || downloading) return;

    try {
      setDownloading(true);
      const downloadUrl = await getDocumentDownloadUrl(fileKey);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      alert("Download failed");
    } finally {
      setDownloading(false);
    }
  };


  if (!hasVisaCase && !hasVisaPayments) {
    return null;
  }

  return (
    <>
      {application?.emgs_evaluation_document && (
          <div className="block space-y-4 border-t border-gray-200 p-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                EMGS Eval Document
              </h3>
              <p className="text-sm text-slate-500">EMGS eval file</p>
            </div>
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
              <button
                onClick={() => handleDownload(application.emgs_evaluation_document.file_key)}
                disabled={downloading}
                className="rounded-md border border-green-600 bg-green-50 p-2 text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                title="Download document"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {application?.visa_document && (
          <div className="block space-y-4 border-t border-gray-200 p-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Visa Document</h3>
              <p className="text-sm text-slate-500">Visa issued by the immigration authority</p>
            </div>
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
              <button
                onClick={() => handleDownload(application.visa_document.file_key)}
                disabled={downloading}
                className="rounded-md border border-green-600 bg-green-50 p-2 text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                title="Download document"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 p-6">
          {visaPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-12">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-md bg-gray-100">
                <Receipt className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-base font-medium text-gray-900">
                No payments yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Your payment history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Payment History
                  </h3>
                  <p className="text-sm text-slate-500">
                    {visaPayments.length} payment
                    {visaPayments.length !== 1 ? "s" : ""} recorded
                  </p>
                </div>
              </div>

              {visaPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-gray-300"
                >
                  <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row">
                    <div className="space-y-3">
                      <div className="w-full rounded-md bg-gray-50 px-4 py-5 sm:w-fit">
                        <p className="flex gap-2 text-sm font-medium">
                          <FileText className="h-4 w-4" />
                          Visa Payment
                        </p>

                        <p className="mt-1 break-all font-mono text-sm font-semibold text-gray-900">
                          <span className="font-medium text-slate-500">
                            Payment Reference:
                          </span>{" "}
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

                    <div className="flex flex-col items-end gap-2 sm:items-end">
                      <p className="text-sm font-medium text-slate-500">
                        Documents
                      </p>

                      {payment.documents.length === 0 ? (
                        <div className="flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5">
                          <XCircle className="h-3.5 w-3.5 text-red-500" />
                          <span className="text-sm font-medium text-red-600">
                            No documents
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap justify-start gap-2 sm:justify-end">
                          {payment.documents.map((doc) => (
                            <div key={doc.id} className="flex gap-3">
                              <button
                                onClick={() => handleDownload(doc.file_key)}
                                disabled={downloading}
                                className="rounded-md border border-green-600 bg-green-50 p-2 text-green-700 hover:bg-green-100 disabled:opacity-50"
                              >
                                <Download className="h-4 w-4" />
                              </button>

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
          <div className="border-t border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Arrival Documents
              </h3>
              <p className="text-sm text-slate-500">Travel and arrival-related files</p>
            </div>
            <div className="p-6 pt-0">
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
                          Uploaded on <AppDate value={doc.created_at} format="short" />
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
          </div>
        )}

    </>
  );
}
