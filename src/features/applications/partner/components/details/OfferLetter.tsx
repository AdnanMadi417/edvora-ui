import React, { useState } from "react";
import { FaFilePdf } from "react-icons/fa";
import { CheckCircle, Download, CreditCard } from 'lucide-react';
import { getDocumentDownloadUrl } from "services/documentService";
import { submitOfferLetterDecision } from "services/offerLetterService";
import { useToast } from "components/context/ToastContext";
import VisaTrackingTimeline from "./VisaTrackingTimeline";
import { AppDate } from "components/ui/date";

interface OfferLetterDecisionProps {
  application: any;
  visaCase: any;
  onRefetch?: () => Promise<void>;
}

interface OfferLetterDecisionPayload {
  decision: "accept";
  notes?: string;
}

export default function OfferLetterDecision({
  application,
  visaCase,
  onRefetch,
}: OfferLetterDecisionProps) {
  const offerLetter = application?.offer_letter_document;

  const [downloading, setDownloading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const currentStatus = application?.stage?.statuses?.[0]?.name;
  const isUniversityApproved = currentStatus === "University Approved";

  const handleDownload = async (fileKey?: string) => {
    if (!fileKey || downloading) return;
    try {
      setDownloading(true);
      const downloadUrl = await getDocumentDownloadUrl(fileKey);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch {
      showToast("Download failed", "error");
    } finally {
      setDownloading(false);
    }
  };

  const handleDecision = async (decision: "accept") => {
    if (!application?.id || submitting) return;
    try {
      setSubmitting(true);
      const payload: OfferLetterDecisionPayload = { decision, notes: "" };
      await submitOfferLetterDecision(application.id, payload);
      showToast("Offer accepted successfully.", "success");
      await onRefetch?.();
    } catch (err: any) {
      console.error(err);
      showToast(
        err?.response?.data?.message || "Failed to submit decision",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!offerLetter) return null;

  return (
    <>
      {visaCase && (
        <>
          <div className="flex items-center gap-4 border-b border-slate-200 p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
              <CreditCard className="text-xl text-blue-700" />
            </span>
            <div>
              <h3 className="text-p3 font-semibold text-slate-900">Visa Payment</h3>
              <span className="text-sm text-slate-500">Visa processing fee details</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-3">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Visa Fee Amount</p>
              <p className="text-lg font-bold text-slate-900">
                {visaCase.visa_fee_amount
                  ? `RM ${Number(visaCase.visa_fee_amount).toLocaleString()}`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Created At</p>
              <p className="text-sm text-slate-700">
                <AppDate value={visaCase.created_at} format="datetime" />
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Notes</p>
              <p className="text-sm text-slate-700">{visaCase.notes || "No notes"}</p>
            </div>
          </div>
          <VisaTrackingTimeline application={application} />
          <div className="border-t border-slate-200" />
        </>
      )}

      <div className="flex items-center gap-3 border-b border-slate-200 p-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
          <FaFilePdf className="text-xl text-blue-700" />
        </span>
        <div>
          <h3 className="text-p3 font-semibold text-slate-900">University Offer Letter</h3>
          <span className="text-sm text-slate-500">Admission offer from the university</span>
        </div>
      </div>

      <div className="space-y-4 p-6">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">🎉 Congratulations!</p>
          <p className="mt-1 text-sm text-green-700">
            You have been offered admission. Please review your offer letter.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <FaFilePdf className="text-2xl text-red-500" />
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">Offer Letter</p>
              <p className="text-xs text-slate-500">
                PDF • Uploaded on{" "}
                <AppDate value={offerLetter.created_at} format="short" />
              </p>
            </div>
          </div>

          <button
            onClick={() => handleDownload(offerLetter.file_key)}
            disabled={downloading}
            className="group rounded-lg border border-transparent bg-green-50 p-2 text-green-600 transition hover:border-green-200 hover:bg-green-100 disabled:opacity-50"
            title="Download Offer Letter"
          >
            <Download className="h-4 w-4 transition-transform group-hover:scale-110" />
          </button>
        </div>

        {isUniversityApproved && (
          <>
            <p className="text-sm text-slate-500">
              Please review the offer letter carefully before accepting or rejecting.
            </p>

            <div className="flex flex-col justify-end gap-3 sm:flex-row">
              <button
                onClick={() => handleDecision("accept")}
                disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-lg border border-blue-600 bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium transition hover:border-blue-700 hover:bg-blue-200"
              >
                <CheckCircle className="h-4 w-4" />
                Accept Offer
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
