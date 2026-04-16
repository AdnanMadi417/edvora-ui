import React, { useState } from "react";
import { FaFilePdf } from "react-icons/fa";
import { CheckCircle, Download } from 'lucide-react';
import { getDocumentDownloadUrl } from "services/documentService";
import { submitOfferLetterDecision } from "services/offerLetterService";
import { useToast } from "../../../context/ToastContext";

export type OfferLetterDecisionType = "accept" | "reject";

interface OfferLetterDecisionProps {
  application: any;
}

interface OfferLetterDecisionPayload {
  decision: OfferLetterDecisionType;
  reason?: string;
  notes?: string;
}

export default function OfferLetterDecision({
  application,
}: OfferLetterDecisionProps) {
  const offerLetter = application?.offer_letter_document;

  const [downloading, setDownloading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const currentStatus =
    application?.stage?.statuses?.[0]?.name;

  const isUniversityApproved =
    currentStatus === "University Approved";


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

  const handleDecision = async (decision: OfferLetterDecisionType) => {
    if (!application?.id || submitting) return;

    let reason: string | undefined;

    if (decision === "reject") {
      reason = prompt("Please provide a reason for rejection") || undefined;
      if (!reason) return;
    }

    try {
      setSubmitting(true);

      const payload: OfferLetterDecisionPayload = {
        decision,
        reason,
        notes: "",
      };

      await submitOfferLetterDecision(application.id, payload);

      showToast(
        decision === "accept"
          ? "Offer accepted successfully."
          : "Offer rejected successfully.",
        "success"
      );

      setTimeout(() => {
        location.reload();
      }, 1500);
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
    <section className="max-w-5xl mx-auto">
      <div className="mb-5 mt-5 space-y-4 rounded-lg border border-gray-200 bg-card p-4 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-200">
            <FaFilePdf className="text-lg text-blue-700" />
          </span>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              University Offer Letter
            </h3>
          </div>
        </div>

        <div className="rounded-md border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            🎉 Congratulations!
          </p>
          <p className="mt-1 text-sm text-green-700">
            You have been offered admission. Please review your offer letter.
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-md border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <FaFilePdf className="text-2xl text-red-500" />
            <div className="min-w-0">
              <p className="truncate font-medium text-gray-900">Offer Letter</p>
              <p className="text-xs text-gray-500">
                PDF • Uploaded on{" "}
                {new Date(offerLetter.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleDownload(offerLetter.file_key)}
            disabled={downloading}
            className="group rounded-md border border-transparent bg-green-50 p-2 text-green-600 transition hover:border-green-200 hover:bg-green-100 disabled:opacity-50"
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
                className="flex items-center justify-center gap-2 rounded-md border border-blue-600 bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium transition hover:border-blue-700 hover:bg-blue-200"
              >
                <CheckCircle className="h-4 w-4" />
                Accept Offer
              </button>

              {/* Reject button if needed later */}
              {/*
      <button
        onClick={() => handleDecision("reject")}
        disabled={submitting}
        className="rounded-md border border-gray-200 px-4 py-2.5 text-sm text-slate-500 transition hover:border-text-error hover:text-text-error disabled:opacity-50"
      >
        Reject Offer
      </button>
      */}
            </div>
          </>
        )}


      </div>
    </section>
  );
}
