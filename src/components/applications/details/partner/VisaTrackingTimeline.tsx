"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Download,
  Wallet,
  CheckCircle,
  FileText,
  Calendar,
  DollarSign,
  XCircle,
  Receipt,
} from "lucide-react";
import { useVisaCase } from "hooks/useVisaCase";
import { useVisaPayments } from "hooks/useVisaPayments";
import VisaPaymentConfirmation from "../../../applications/popups/partner/VisaPaymentConfirmation";
import { getDocumentDownloadUrl } from "../../../../services/documentService";
import api from "lib/useApi";
import { useToast } from "../../../context/ToastContext";

interface VisaTrackingTimelineProps {
  application: any;
}

export default function VisaTrackingTimeline({
                                               application,
                                             }: VisaTrackingTimelineProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
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

  const handleApprove = async (paymentId: string) => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await api.post(
        `/applications/${application.id}/visa-payments/${paymentId}/review`,
        {
          status: "approved",
          review_notes: "Approved by manager",
        }
      );

      console.log("Approved payment:", res.data);
      showToast("Payment approved successfully!", "success");

      // Optionally refresh the visaPayments list
    } catch (err) {
      console.error(err);
      showToast("Failed to approve payment", "error");
    } finally {
      setLoading(false);
    }
  };

  if (visaLoading || paymentsLoading) return <p>Loading visa details...</p>;
  // if (visaError || paymentsError)
  //   return <p className="text-red-500">Error loading visa information</p>;

  if (!visaCase) return null;

  return (
    <section className="mb-6 mt-6 rounded-lg bg-card">
      <div className="mb-6 rounded-lg border bg-white">
        <div className="flex items-start gap-3 border-b border-gray-200 p-6">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <CreditCard className="text-xl text-blue-700" />
              </span>
              <div>
                <h3 className="text-p3 font-semibold text-text-primary">
                  Visa Payment
                </h3>
                <span className="text-sm text-text-muted">
                  Visa processing fee details
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 border-b border-gray-200 p-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm tracking-wide text-text-muted">
              Visa Fee Amount
            </p>
            <p className="text-lg font-bold ">
              {visaCase.visa_fee_amount
                ? `RM ${visaCase.visa_fee_amount.toLocaleString()}`
                : "—"}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm tracking-wide text-text-muted">
              Created At
            </p>
            <p className="text-sm">
              {visaCase.created_at
                ? new Date(visaCase.created_at).toLocaleString()
                : "—"}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm tracking-wide text-text-muted">Notes</p>
            <p className="text-sm">{visaCase.notes || "No notes"}</p>
          </div>
        </div>

        <div className="p-6 pb-0">
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

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsPopupOpen(true)}
                  className="flex w-fit items-center justify-center gap-2 rounded-full border border-blue-600 bg-blue-100 px-4 py-2 text-center text-sm font-medium text-blue-600 transition-all hover:bg-blue-200 focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <Wallet className="h-4 w-4 text-blue-600" />
                  Continue Payment
                </button>
              </div>


            </div>
          </div>
        </div>

        <div className="p-6 ">
          {visaPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-12">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Receipt className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-base font-medium text-gray-900">
                No payments yet
              </p>
              <p className="mt-1 text-sm text-text-muted">
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
                  <p className="text-sm text-text-muted">
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
                  <div className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border-blue-600 bg-blue-50">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-muted">
                              Reference
                            </p>
                            <p className="font-mono text-sm font-semibold text-gray-900">
                              {payment.payment_reference || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                          {/*<div className="flex items-center gap-2 text-sm">*/}
                          {/*  <DollarSign className="h-4 w-4 text-text-muted" />*/}
                          {/*  <span className="font-medium text-gray-900">*/}
                          {/*    {payment.amount ?? "—"} {payment.currency || ""}*/}
                          {/*  </span>*/}
                          {/*</div>*/}

                          <div className="flex items-center gap-2 text-sm text-text-muted">
                            <Calendar className="h-4 w-4 text-text-muted" />
                            <span>
                              {payment.submitted_at
                                ? new Date(
                                  payment.submitted_at
                                ).toLocaleString()
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 lg:items-end">
                        <p className="text-sm font-medium text-text-muted">
                          Documents
                        </p>
                        {payment.documents.length === 0 ? (
                          <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5">
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                            <span className="text-sm font-medium text-red-600">
                              No documents
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {payment.documents.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex justify-end gap-3"
                              >
                                <button
                                  onClick={() => handleDownload(doc.file_key)}
                                  disabled={downloading}
                                  className="group rounded-full border border-green-600 bg-green-50 p-2 text-green-700 transition hover:border-green-700 hover:bg-green-100 disabled:opacity-50"
                                  title="Download Document"
                                >
                                  <Download className="h-4 w-4 text-green-600" />
                                </button>

                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isPopupOpen && (
          <VisaPaymentConfirmation
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            applicationId={application.id}
          />
        )}
      </div>
    </section>
  );
}
