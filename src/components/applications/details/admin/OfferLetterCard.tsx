import { useState } from "react";
import { FaFilePdf } from "react-icons/fa";
import { Download, CreditCard } from "lucide-react";
import { getDocumentDownloadUrl } from "services/documentService";
import { useVisaCase } from "hooks/useVisaCase";
import VisaTrackingTimeline from "./VisaTrackingTimeline";

interface OfferLetterDecisionProps {
  application: any;
}

export default function OfferLetterDecision({
                                              application,
                                            }: OfferLetterDecisionProps) {
  const offerLetter = application?.offer_letter_document;

  const [downloading, setDownloading] = useState(false);
  const { visaCase } = useVisaCase(application?.id || "");

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

  if (!offerLetter) return null;

  return (
    <section className="max-w-5xl mx-auto">
      
      {visaCase && (
        <>
          <div className="my-5 rounded-lg border border-gray-200 bg-card shadow-sm">
            <div className="flex items-center gap-4 border-b border-gray-200 p-6">
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
                  {visaCase.created_at
                    ? new Date(visaCase.created_at).toLocaleString()
                    : "—"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Notes</p>
                <p className="text-sm text-slate-700">{visaCase.notes || "No notes"}</p>
              </div>
            </div>
          <VisaTrackingTimeline application={application} />
          </div>
        </>
      )}
      
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

      </div>

    </section>
  );
}
