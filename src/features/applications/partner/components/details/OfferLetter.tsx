import React, { useState } from "react";
import { FaFilePdf } from "react-icons/fa";
import { CheckCircle, CreditCard, Download } from 'lucide-react';
import { submitOfferLetterDecision } from "services/offerLetterService";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { useHealthDeclarationFormUrl } from "features/applications/shared/useHealthDeclarationFormUrl";
import VisaTrackingTimeline from "./VisaTrackingTimeline";
import DocumentActions from "features/applications/shared/DocumentActions";
import { AppDate } from "components/ui/date";
import Button from "components/ui/buttons/Button";
import { SectionIconBadge } from "components/ui/icons";

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
  const studentName = application?.student?.name;

  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const healthDeclarationFormUrl = useHealthDeclarationFormUrl();

  const currentStatus = application?.stage?.statuses?.[0]?.name;
  const isUniversityApproved = currentStatus === "University Approved";

  const handleDecision = async (decision: "accept") => {
    if (!application?.id || submitting) return;
    try {
      setSubmitting(true);
      const payload: OfferLetterDecisionPayload = { decision, notes: "" };
      await submitOfferLetterDecision(application.id, payload);
      showToast("Offer accepted successfully.", "success");
      await onRefetch?.();
    } catch (err: unknown) {
      console.error(err);
      showToast(parseApiError(err, "Failed to submit decision"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!offerLetter) return null;

  return (
    <>
      {visaCase && (
        <>
          <div className="flex items-center gap-3 border-b border-slate-200 p-6">
            <SectionIconBadge icon={CreditCard} color="blue" />
            <div>
              <h3 className="text-p3 font-semibold text-slate-900">Visa Payment</h3>
              <span className="text-sm text-slate-500">Visa processing fee details</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-3">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Visa Fee Amount</p>
              <p className="text-lg font-bold text-slate-900">
                {visaCase.visa_fee_amount
                  ? `RM ${Number(visaCase.visa_fee_amount).toLocaleString()}`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Created At</p>
              <p className="text-sm text-slate-700">
                <AppDate value={visaCase.created_at} format="datetime" />
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Notes</p>
              <p className="text-sm text-slate-700">{visaCase.notes || "No notes"}</p>
            </div>
          </div>
          <VisaTrackingTimeline application={application} />
          <div className="border-t border-slate-200" />
        </>
      )}

      <div className="flex items-center gap-3 border-b border-slate-200 p-6">
        <SectionIconBadge icon={FaFilePdf} color="blue" />
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

        <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-white px-4 py-3">
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

          <div className="flex items-center gap-2">
            <DocumentActions fileKey={offerLetter.file_key} label="Offer Letter" personName={studentName} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50">
              <FaFilePdf className="h-4 w-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">Health Declaration Form</p>
              <p className="text-xs text-slate-400">Required for visa processing (Lampiran B)</p>
            </div>
          </div>
          <a
            href={healthDeclarationFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download Health Declaration Form"
            title="Download Health Declaration Form"
            className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>

        {isUniversityApproved && (
          <>
            <p className="text-sm text-slate-500">
              Please review the offer letter carefully before accepting or rejecting.
            </p>

            <div className="flex flex-col justify-end gap-3 sm:flex-row">
              <Button
                onClick={() => handleDecision("accept")}
                disabled={submitting}
                icon={<CheckCircle className="h-4 w-4" />}
                text="Accept Offer"
                bgColor="bg-blue-100"
                textColor="text-blue-700"
                borderColor="border-blue-600"
                hoverTextColor="hover:text-blue-700"
                hoverBorderColor="hover:border-blue-700"
                className="hover:bg-blue-200"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
