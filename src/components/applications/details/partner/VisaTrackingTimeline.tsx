"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Download,
  Wallet,
  FileText,
  Calendar,
  Plane,
  XCircle,
} from "lucide-react";

import { useVisaCase } from "hooks/useVisaCase";
import { useVisaPayments } from "hooks/useVisaPayments";
import { useVisaPaymentMethods } from "hooks/usePaymentMethods";
import { useApplicationActions } from "hooks/applications/stages/useApplicationActions";

import VisaPaymentConfirmation from "../../../applications/popups/partner/VisaPaymentConfirmation";
import ArrivalDate from "../../../applications/popups/partner/ArrivalDate";
import EmgsEvalUpload from "../../../applications/popups/partner/EmgsEvaluationUpload";
import EVisaUpload from "../../../applications/popups/partner/EVisaUpload";
import { getDocumentDownloadUrl } from "../../../../services/documentService";

interface VisaTrackingTimelineProps {
  application: any;
}

export default function VisaTrackingTimeline({
  application,
}: VisaTrackingTimelineProps) {
  const [isVisaPopupOpen, setIsVisaPopupOpen] = useState(false);
  const [isArrivalPopupOpen, setIsArrivalPopupOpen] = useState(false);
  const [isEmgsUploadOpen, setIsEmgsUploadOpen] = useState(false);
  const [isEVisaUploadOpen, setIsEVisaUploadOpen] = useState(false);

  const { methods, loading: paymentLoading } = useVisaPaymentMethods(application?.id);
  const { actions } = useApplicationActions(application?.id);

  const currentStatusCode =
    actions?.status_code ||
    application?.stage?.statuses?.[0]?.code;

  const showVisaPayment =
    currentStatusCode === "WAITING_FOR_PAYMENT" ||
    currentStatusCode === "PAYMENT_REJECTED";

  const showEmgsUpload =
    currentStatusCode === "EVAL_PARTNER_UPLOAD" ||
    currentStatusCode === "EVAL_REUPLOAD_REQUIRED";

  const showArrivalConfirmation =
    currentStatusCode === "WAITING_PARTNER_CONFIRM_ARRIVAL_DATE";

  const showEVisaUpload =
    currentStatusCode === "E_VISA_PARTNER_UPLOAD";

  const {
    visaCase,
    loading: visaLoading,
  } = useVisaCase(application?.id || "");

  const {
    payments: visaPayments,
    loading: paymentsLoading,
  } = useVisaPayments(application?.id || "");

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

  if (visaLoading || paymentsLoading) return <p>Loading visa details...</p>;
  // if (visaError || paymentsError)
  //   return <p className="text-red-500">Error loading visa information</p>;

  if (!visaCase) return null;

  return (
    <>
      {(showEmgsUpload || application?.emgs_evaluation_document) && (
        <div className="block space-y-4 border-t border-gray-200 p-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              EMGS Eval Document
            </h3>
            <p className="text-sm text-slate-500">EMGS evaluation file</p>
          </div>

          {showEmgsUpload && (
            <div className="block space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-100">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-sm font-semibold text-slate-800">Download Your Eval</p>
                    <p className="mb-2 text-xs text-slate-500">Your evaluation is ready. Download it directly from the EMGS app.</p>
                    <a
                      href="https://www.youtube.com/shorts/fT4Wmm4eWwI"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                    >
                      View EMGS app instructions
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="flex gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-100">
                    <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="mb-1 text-sm font-semibold text-slate-800">Check Entry Requirements</p>
                    <p className="mb-2 text-xs text-slate-500">Verify whether you need an eVISA or Visa on Arrival before travelling to Malaysia.</p>
                    <a
                      href="https://educationmalaysia.gov.my/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:underline"
                    >
                      Visit Education Malaysia
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              <div className="relative rounded-lg border border-gray-200 p-6">
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-100" />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-xl">
                    <h3 className="text-sm font-semibold text-slate-900">Upload EMGS Eval Document</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      Upload your EMGS evaluation document to continue with the visa application process.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEmgsUploadOpen(true)}
                      className="flex items-center justify-center gap-2 rounded-md border border-blue-600 bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-700 hover:bg-blue-200"
                    >
                      <FileText className="h-4 w-4" />
                      Upload Eval
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {application?.emgs_evaluation_document && (
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
                    {new Date(application.emgs_evaluation_document.created_at).toLocaleDateString()}
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
          )}
        </div>
        )}

        {showVisaPayment && (
          <div className="border-t border-gray-200 p-6 block space-y-4">

          {paymentLoading ? (
          <div className="border-gray-200">
            <p className="text-sm text-slate-500">Loading payment methods...</p>
          </div>
        ) : methods.length > 0 && (
          <div className="">
            <div className="mb-4 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-blue-600" />
              <h4 className="text-sm font-semibold text-gray-900">Payment Methods</h4>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {methods.map((method: any) => (
                <div
                  key={method.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-gray-900">{method.name}</span>
                    </div>
                    {method.currency && (
                      <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium uppercase text-blue-700">
                        {method.currency}
                      </span>
                    )}
                  </div>
                  {method.instructions && (
                    <pre className="whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
                      {method.instructions}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}


            <div className="relative rounded-lg border border-gray-200 p-6">
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-100" />

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-xl">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Complete your visa payment
                  </h3>

                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Choose a payment method and upload your payment proof to
                    continue with the visa application process.
                  </p>
                </div>

                <div className="flex justify-end w-full">
                  <button
                    type="button"
                    onClick={() => setIsVisaPopupOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-md border border-blue-600 bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-700 hover:bg-blue-200"
                  >
                    <Wallet className="h-4 w-4" />
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {visaPayments.length > 0 && (
        <div className="border-t border-gray-200 p-6">
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
                            {payment.submitted_at
                              ? new Date(payment.submitted_at).toLocaleString()
                              : "—"}
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
        </div>
        )}

        {showArrivalConfirmation && (
          <div className="border-t border-gray-200 p-6">
            <div className="relative rounded-lg border border-gray-200 p-6">
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-100" />

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-xl">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Confirm Arrival Date
                  </h3>

                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Select your arrival date and upload your flight details.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsArrivalPopupOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-md border border-blue-600 bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-700 hover:bg-blue-200 disabled:opacity-50"
                  >
                    <Plane className="h-4 w-4" />
                    Confirm Arrival
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showEVisaUpload && (
          <div className="border-t border-gray-200 p-6">
            <div className="relative rounded-lg border border-gray-200 p-6">
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-100" />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-xl">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Upload E-Visa Document
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Upload your approved e-visa document to continue with the enrollment process.
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEVisaUploadOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-md border border-blue-600 bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-700 hover:bg-blue-200 disabled:opacity-50"
                  >
                    <FileText className="h-4 w-4" />
                    Upload E-Visa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {application?.arrival_documents?.length > 0 && (
        <div className="border-t border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Arrival Documents
            </h3>
            <p className="text-sm text-slate-500">
              Travel and arrival-related files
            </p>
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
                        <p className="font-medium text-gray-900">
                          {doc.document_type}
                        </p>
                        <p className="text-xs text-slate-500">
                          Uploaded on{" "}
                          {new Date(doc.created_at).toLocaleDateString()}
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

        {isVisaPopupOpen && (
          <VisaPaymentConfirmation
            isOpen={isVisaPopupOpen}
            onClose={() => setIsVisaPopupOpen(false)}
            applicationId={application.id}
          />
        )}

        {isArrivalPopupOpen && (
          <ArrivalDate
            isOpen={isArrivalPopupOpen}
            onClose={() => setIsArrivalPopupOpen(false)}
            applicationId={application.id}
          />
        )}

        {isEmgsUploadOpen && (
          <EmgsEvalUpload
            isOpen={isEmgsUploadOpen}
            onClose={() => setIsEmgsUploadOpen(false)}
            applicationId={application.id}
          />
        )}

        {isEVisaUploadOpen && (
          <EVisaUpload
            isOpen={isEVisaUploadOpen}
            onClose={() => setIsEVisaUploadOpen(false)}
            applicationId={application.id}
          />
        )}
    </>
  );
}
