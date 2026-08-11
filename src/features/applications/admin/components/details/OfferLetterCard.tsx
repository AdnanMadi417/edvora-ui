import { FaFilePdf } from "react-icons/fa";
import { CreditCard } from "lucide-react";
import { useVisaCase } from "hooks/useVisaCase";
import VisaTrackingTimeline from "./VisaTrackingTimeline";
import DocumentActions from "features/applications/shared/DocumentActions";
import { AppDate } from "components/ui/date";
import { SectionIconBadge } from "components/ui/icons";

interface OfferLetterDecisionProps {
  application: any;
  onRefetch?: () => void;
}

export default function OfferLetterDecision({
                                              application,
                                              onRefetch,
                                            }: OfferLetterDecisionProps) {
  const offerLetter = application?.offer_letter_document;
  const studentName = application?.student?.name;

  const { visaCase } = useVisaCase(application?.id || "");

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
          <VisaTrackingTimeline application={application} onRefetch={onRefetch} />
          <div className="border-t border-slate-200" />
        </>
      )}

      {/* Offer Letter header */}
      <div className="flex items-center gap-3 border-b border-slate-200 p-6">
        <SectionIconBadge icon={FaFilePdf} color="blue" />
        <div>
          <h3 className="text-p3 font-semibold text-slate-900">University Offer Letter</h3>
          <span className="text-sm text-slate-500">Admission offer from the university</span>
        </div>
      </div>

      {/* Offer Letter content */}
      <div className="p-6 space-y-4">
      
        <div className="flex items-center justify-between ">
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
      </div>

    </>
  );
}
