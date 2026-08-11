import React, { useState } from "react";
import RichTextDisplay from "components/ui/RichTextDisplay";

import { GraduationCap, Building2, Globe, Calendar, ArrowRight, Wallet, AlertCircle } from "lucide-react";
import {
  FaUser,
  FaBirthdayCake,
  FaFlag,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaHome,
  FaBook,
  FaGraduationCap,
  FaPhoneAlt,
  FaUsers,
} from "react-icons/fa";
import { MdAssignmentTurnedIn } from "react-icons/md";
import { Clock, Upload, ClipboardCheck, CreditCard, Plane, CheckCircle, FileUp, Download } from 'lucide-react';
import { getDocumentDownloadUrl } from 'services/documentService';
import Button from 'components/ui/buttons/Button';
import IconButton from 'components/ui/buttons/IconButton';
import { useApplicationActions } from "features/applications/hooks";

import ApplicationPartnerTopBar from "features/applications/partner/components/topBar/PartnerTopBar";
import RequiredAction from "features/applications/partner/components/popups/RequiredAction";
import ProgramDecision from "features/applications/partner/components/popups/ProgramDecision";
import PresignedImage from "components/ui/PresignedImage";
import OfferLetterDecision from './OfferLetter';
import VisaPaymentConfirmation from "features/applications/partner/components/popups/VisaPaymentConfirmation";
import ArrivalDate from "features/applications/partner/components/popups/ArrivalDate";
import EmgsEvalUpload from "features/applications/partner/components/popups/EmgsEvaluationUpload";
import EVisaUpload from "features/applications/partner/components/popups/EVisaUpload";
import ApplicationFormReupload from "features/applications/partner/components/popups/ApplicationFormReupload";
import ApplicationCommission from './ApplicationCommission';
import ApplicationDocuments from './ApplicationDocuments';
import { useToast } from 'components/context/ToastContext';
import DisputeCommission from 'features/applications/partner/components/popups/DisputeCommission';
import api from 'lib/useApi';
import ApplicationTimeline from 'features/applications/shared/ApplicationTimeline';
import { useVisaPaymentMethods } from "hooks/usePaymentMethods";
import { useVisaCase } from "hooks/useVisaCase";
import { AppDate } from "components/ui/date";
import { parseApiError } from "utils/parseApiError";
import { DetailStatusBadge } from "components/ui/badges";
import { getStatusVariant } from "utils/getStatusVariant";

interface ApplicationDetailsProps {
  application: any;
  onRefetch?: () => Promise<void>;
}

export default function ApplicationDetails({
  application,
  onRefetch,
}: ApplicationDetailsProps) {
  function daysSince(dateString: string) {
    if (!dateString) return 0;
    const updatedDate = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - updatedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  const { actions, loading: actionsLoading, refetch: refetchActions } = useApplicationActions(
    application?.id
  );

  const handleRefetch = async () => {
    await onRefetch?.();
    refetchActions();
  };

  const student = application.student || {};
  const program = application.program || {};
  const university = program.university || {};
  const partner = application.partner || {};
  const stage = application.stage || {};
  const emergencyContact = student.emergency_contacts?.[0] || {};
  const englishProficiency = student.english_proficiencies?.[0] || {};
  const previousEducation = student.previous_educations?.[0] || {};
  const currentStatus = stage.statuses?.[0] || {};
  const [showRequiredActionPopup, setShowRequiredActionPopup] = useState(false);
  const openRequiredActionPopup = () => setShowRequiredActionPopup(true);
  const closeRequiredActionPopup = () => setShowRequiredActionPopup(false);

  const { methods, loading: paymentLoading } = useVisaPaymentMethods(application?.id);
  const { visaCase } = useVisaCase(application?.id || "");

  const { showToast } = useToast();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const { partner_actions } = actions || {};
  const confirmAction = partner_actions?.find(
    (a: any) => a.target_status_code === "APPLICATION_COMPLETE"
  );
  const disputeAction = partner_actions?.find(
    (a: any) => a.target_status_code === "COMMISSION_DISPUTED"
  );

  const handleCommissionConfirm = async () => {
    if (!confirmAction) return;
    try {
      setConfirmLoading(true);
      await api.post(`/applications/${application.id}/status`, {
        status_id: confirmAction.target_status_id,
        reason_text: null,
        notes: "Partner commission confirmed successfully",
      });
      showToast("Commission confirmed successfully", "success");
      handleRefetch();
    } catch (err: unknown) {
      showToast(parseApiError(err, "Failed to confirm commission"), "error");
    } finally {
      setConfirmLoading(false);
    }
  };

  const [showProgramDecisionPopup, setShowProgramDecisionPopup] = useState(false);
  const openProgramDecisionPopup = () => setShowProgramDecisionPopup(true);
  const closeProgramDecisionPopup = () => setShowProgramDecisionPopup(false);

  const [showVisaPaymentPopup, setShowVisaPaymentPopup] = useState(false);

  const currentStatusCode =
    actions?.status_code ||
    application?.status_code ||
    stage?.statuses?.[0]?.code;

  const showVisaPayment =
    currentStatusCode === "WAITING_FOR_PAYMENT" ||
    currentStatusCode === "PAYMENT_REJECTED";

  const showApplicationFormReupload = currentStatusCode === "APPLICATION_FORM_REJECTED";

  const [showArrivalPopup, setShowArrivalPopup] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  const handleTemplateDownload = async (fileKey: string) => {
    if (downloadingTemplate) return;
    try {
      setDownloadingTemplate(true);
      const url = await getDocumentDownloadUrl(fileKey);
      window.open(url, "_blank");
    } catch {
      showToast("Failed to download template", "error");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const [showEmgsUploadPopup, setShowEmgsUploadPopup] = useState(false);
  const [showEVisaUploadPopup, setShowEVisaUploadPopup] = useState(false);
  const [showApplicationFormReuploadPopup, setShowApplicationFormReuploadPopup] = useState(false);

  const showArrivalConfirmation = currentStatusCode === "WAITING_PARTNER_CONFIRM_ARRIVAL_DATE";

  const hasRequiredDocs = actions?.document_types?.some(
    (d: any) => d.is_required_for_current_upload
  );

  const showArrivalExtraDocs = currentStatusCode === "ARRIVAL_EXTRA_DOCS_UPLOAD";

  const showEmgsUpload =
    !hasRequiredDocs &&
    (currentStatusCode === "EVAL_PARTNER_UPLOAD" ||
      currentStatusCode === "EVAL_REUPLOAD_REQUIRED");

  const showEVisaUpload = !hasRequiredDocs && currentStatusCode === "E_VISA_PARTNER_UPLOAD";

  const showAwaitingArrival =
    currentStatusCode === "AWAITING_ARRIVAL" && !actions?.document_types?.length;

  const formatGender = (value: boolean | null) => {
    if (value === null) return "Not provided";
    return value ? "Male" : "Female";
  };

  const hasEmergencyContact =
    emergencyContact &&
    (emergencyContact.name ||
      emergencyContact.relation ||
      emergencyContact.phone ||
      emergencyContact.email);

  const hasEnglishProficiency =
    englishProficiency &&
    (englishProficiency.test_type ||
      englishProficiency.score ||
      englishProficiency.test_date);

  const hasPreviousEducation =
    previousEducation &&
    (previousEducation.institution_name ||
      previousEducation.start_date ||
      previousEducation.end_date ||
      previousEducation.grade);

  return (
    <section className="max-w-5xl mx-auto">
      <div className="mt-4 bg-white rounded-lg border border-slate-200">

        {/* Partner TopBar */}
        <div className="border-b border-slate-200">
          <ApplicationPartnerTopBar application={application} />
        </div>

        {/* Hero */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <PresignedImage
                fileKey={application.student_photo_file_key}
                alt={student.name}
                className="h-16 w-16 shrink-0 rounded-full object-cover border-2 border-blue-200"
                fallback={
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-700 border-2 border-blue-200 text-xl font-bold text-white">
                    {student.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                }
              />
              <div>
                <h2 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-slate-900">
                  {student.name}
                </h2>
                {application.intake_date && (
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 sm:hidden">
                    <Clock className="h-3 w-3" />
                    <span>Intake: <AppDate value={application.intake_date} format="short" fallback="Not provided" /></span>
                  </div>
                )}
                <div className="mt-1 block md:flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                  {program.name && (
                    <span className="flex items-center gap-1 
                     md:flex">
                      <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
                      {program.name}
                    </span>
                  )}
                  {university.name && (
                    <>
                      <span className="text-slate-300 hidden md:block">|</span>
                      <span className="items-center gap-1 hidden md:flex">
                        <Building2 className="h-3.5 w-3.5 text-blue-400" />
                        {university.name}
                      </span>
                    </>
                  )}
                  {university.country && (
                    <>
                      <span className="text-slate-300 hidden md:block">|</span>
                      <span className="items-center gap-1 hidden md:flex">
                        <Globe className="h-3.5 w-3.5 text-blue-400" />
                        {university.country}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-1 block md:flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              {program.name && (
                <span className="flex items-center gap-1 md:hidden">
                  <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
                  {program.name}
                </span>
              )}
              {university.name && (
                <>
                  <span className="flex items-center gap-1 md:hidden">
                    <Building2 className="h-3.5 w-3.5 text-blue-400" />
                    {university.name}
                  </span>
                </>
              )}
              {university.country && (
                <>
                  <span className="flex items-center gap-1 md:hidden">
                    <Globe className="h-3.5 w-3.5 text-blue-400" />
                    {university.country}
                  </span>
                </>
              )}
            </div>

            <div className="hidden sm:block shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-start">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Intake Date</p>
              <p className="mt-1 flex items-center justify-start gap-2 text-lg font-bold text-slate-900">
                <Calendar className="h-4 w-4 text-blue-400" />
                <AppDate value={application.intake_date} format="short" fallback="Not provided" />
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Current Status</p>
              <div className="flex flex-wrap gap-2">
                {currentStatus.name && (
                  <DetailStatusBadge variant={getStatusVariant(currentStatus.name)}>
                    {currentStatus.name}
                  </DetailStatusBadge>
                )}
                {stage.name && (
                  <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1 text-sm font-normal text-slate-800">
                    {stage.name}
                  </span>
                )}
                <p className="inline-flex items-center text-xs font-normal text-slate-600">
                  <span className="sm:hidden rounded-md border border-slate-200 bg-white px-3 py-1">{daysSince(application.updated_at)} d</span>
                  <span className="hidden sm:inline">{daysSince(application.updated_at)} days in stage</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 rounded-lg border-[2px] border-blue-200 bg-blue-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <ArrowRight className="h-4 w-4 text-blue-700" />
                </div>
                <div className="block space-y-1">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-blue-500">Next Action</p>
                  <p className="text-sm font-medium text-slate-800">
                    {application?.stage?.statuses?.[0]?.next_actions?.[0]?.name ?? "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {actions && (
              <>
                {hasRequiredDocs && !showArrivalExtraDocs && (
                  <Button
                    onClick={openRequiredActionPopup}
                    icon={<Upload className="h-4 w-4" />}
                    text="Upload Required Documents"
                    bgColor="bg-amber-500"
                    textColor="text-white"
                    borderColor="border-amber-500"
                    hoverTextColor="hover:text-white"
                    hoverBorderColor="hover:border-amber-600"
                    className="w-full hover:bg-amber-600"
                  />
                )}
                {showArrivalExtraDocs && (() => {
                  const arrivalFormDoc = application?.arrival_documents?.find((d: any) => d.document_type === "Arrival Form Template");
                  return (
                    <div className="block space-y-3">
                      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 space-y-3">
                        <div className="flex gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                            <FileUp className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-800">Arrival Form Required</p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              Download the template below, complete it, then upload the filled form.
                            </p>
                          </div>
                        </div>
                        {arrivalFormDoc?.file_key && (
                          <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-white px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-200">
                                <Download className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800">Arrival Form Template</p>
                                <p className="text-xs text-slate-400">Provided by manager · Click to download</p>
                              </div>
                            </div>
                            <IconButton
                              onClick={() => handleTemplateDownload(arrivalFormDoc.file_key)}
                              disabled={downloadingTemplate}
                              title="Download template"
                              icon={<Download className={`h-4 w-4 ${downloadingTemplate ? "animate-pulse" : ""}`} />}
                              bgColor="bg-blue-50"
                              textColor="text-blue-600"
                              borderColor="border-transparent"
                              hoverTextColor="hover:text-blue-600"
                              hoverBorderColor="hover:border-blue-200"
                              className="ml-3 shrink-0 hover:bg-blue-100"
                            />
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        onClick={openRequiredActionPopup}
                        icon={<Upload className="h-4 w-4" />}
                        text="Upload Arrival Form"
                        bgColor="bg-amber-500"
                        textColor="text-white"
                        borderColor="border-amber-500"
                        hoverTextColor="hover:text-white"
                        hoverBorderColor="hover:border-amber-600"
                        className="w-full hover:bg-amber-600"
                      />
                    </div>
                  );
                })()}
                {currentStatusCode === "PROGRAM_CHANGE_SUGGESTED" && (
                  <Button
                    onClick={openProgramDecisionPopup}
                    icon={<ClipboardCheck className="h-4 w-4" />}
                    text="Submit Program Decision"
                    bgColor="bg-violet-500"
                    textColor="text-white"
                    borderColor="border-violet-500"
                    hoverTextColor="hover:text-white"
                    hoverBorderColor="hover:border-violet-600"
                    className="w-full hover:bg-violet-600"
                  />
                )}
              </>
            )}

            {showVisaPayment && (
              <div className="block space-y-4">
                {visaCase?.visa_fee_amount && (
                  <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-5 py-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-green-600">Amount Due</p>
                      <p className="mt-0.5 text-2xl font-bold text-green-700">
                        RM {Number(visaCase.visa_fee_amount).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <Wallet className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                )}

                {visaCase?.notes && (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                    <span className="mt-0.5 text-xs text-amber-500">⚠</span>
                    <p className="text-xs text-amber-800">{visaCase.notes}</p>
                  </div>
                )}

                {paymentLoading ? (
                  <p className="text-sm text-slate-500">Loading payment methods...</p>
                ) : methods.length > 0 && (
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <h4 className="text-sm font-semibold text-slate-900">Payment Methods</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {methods.map((method: any) => (
                        <div
                          key={method.id}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold text-slate-900">{method.name}</span>
                            </div>
                            {method.currency && (
                              <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium uppercase text-blue-700">
                                {method.currency}
                              </span>
                            )}
                          </div>
                          {method.instructions && (
                            <RichTextDisplay html={method.instructions} className="mt-1 text-xs" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(() => {
                  const visaInvoiceDoc = application?.documents?.find((d: any) => d.document_type === "Visa Invoice");
                  const appFormDoc = application?.documents?.find((d: any) => d.document_type === "Application Form Template");
                  const visaInvoiceKey = visaInvoiceDoc?.file_key;
                  const appFormKey = appFormDoc?.file_key;
                  if (!visaInvoiceKey && !appFormKey) return null;
                  return (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Documents for this payment</p>
                      {visaInvoiceKey && (
                        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 border border-green-200">
                              <Download className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800">Visa Invoice</p>
                              <p className="text-xs text-slate-400">Invoice for your visa payment — keep for your records</p>
                            </div>
                          </div>
                          <IconButton
                            onClick={() => handleTemplateDownload(visaInvoiceKey)}
                            disabled={downloadingTemplate}
                            title="Download Visa Invoice"
                            icon={<Download className={`h-4 w-4 ${downloadingTemplate ? "animate-pulse" : ""}`} />}
                            bgColor="bg-green-50"
                            textColor="text-green-600"
                            borderColor="border-transparent"
                            hoverTextColor="hover:text-green-600"
                            hoverBorderColor="hover:border-green-200"
                            className="ml-3 shrink-0 hover:bg-green-100"
                          />
                        </div>
                      )}
                      {appFormKey && (
                        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-200">
                              <Download className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800">Application Form Template</p>
                              <p className="text-xs text-slate-400">Download, complete, and re-upload when requested by your manager</p>
                            </div>
                          </div>
                          <IconButton
                            onClick={() => handleTemplateDownload(appFormKey)}
                            disabled={downloadingTemplate}
                            title="Download Application Form Template"
                            icon={<Download className={`h-4 w-4 ${downloadingTemplate ? "animate-pulse" : ""}`} />}
                            bgColor="bg-blue-50"
                            textColor="text-blue-600"
                            borderColor="border-transparent"
                            hoverTextColor="hover:text-blue-600"
                            hoverBorderColor="hover:border-blue-200"
                            className="ml-3 shrink-0 hover:bg-blue-100"
                          />
                        </div>
                      )}
                    </div>
                  );
                })()}

                <Button
                  type="button"
                  onClick={() => setShowVisaPaymentPopup(true)}
                  icon={<CreditCard className="h-4 w-4" />}
                  text="Proceed to Payment"
                  bgColor="bg-green-600"
                  textColor="text-white"
                  borderColor="border-green-600"
                  hoverTextColor="hover:text-white"
                  hoverBorderColor="hover:border-green-700"
                  className="w-full hover:bg-green-700"
                />
              </div>
            )}

            {showArrivalConfirmation && (
              <Button
                type="button"
                onClick={() => setShowArrivalPopup(true)}
                icon={<Plane className="h-4 w-4" />}
                text="Confirm Arrival"
                bgColor="bg-emerald-600"
                textColor="text-white"
                borderColor="border-emerald-600"
                hoverTextColor="hover:text-white"
                hoverBorderColor="hover:border-emerald-700"
                className="w-full hover:bg-emerald-700"
              />
            )}

            {showEVisaUpload && (
              <Button
                type="button"
                onClick={() => setShowEVisaUploadPopup(true)}
                icon={<FileUp className="h-4 w-4" />}
                text="Upload E-Visa"
                bgColor="bg-blue-600"
                textColor="text-white"
                borderColor="border-blue-600"
                hoverTextColor="hover:text-white"
                hoverBorderColor="hover:border-blue-700"
                className="w-full hover:bg-blue-700"
              />
            )}

            {showApplicationFormReupload && (
              <Button
                type="button"
                onClick={() => setShowApplicationFormReuploadPopup(true)}
                icon={<FileUp className="h-4 w-4" />}
                text="Re-upload Application Form"
                bgColor="bg-red-600"
                textColor="text-white"
                borderColor="border-red-600"
                hoverTextColor="hover:text-white"
                hoverBorderColor="hover:border-red-700"
                className="w-full hover:bg-red-700"
              />
            )}

            {showAwaitingArrival && (
              <Button
                type="button"
                onClick={openRequiredActionPopup}
                icon={<FileUp className="h-4 w-4" />}
                text="Upload Payment Proof"
                bgColor="bg-blue-600"
                textColor="text-white"
                borderColor="border-blue-600"
                hoverTextColor="hover:text-white"
                hoverBorderColor="hover:border-blue-700"
                className="w-full hover:bg-blue-700"
              />
            )}

            {showEmgsUpload && (
              <div className="block space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-sm font-semibold text-slate-800">Download Your Eval</p>
                      <p className="mb-2 text-xs text-slate-500">Your eval is ready. Download it directly from the EMGS app.</p>
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

                  <div className="flex gap-3 rounded-lg border border-amber-100 bg-amber-50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
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

                <Button
                  type="button"
                  onClick={() => setShowEmgsUploadPopup(true)}
                  icon={<FileUp className="h-4 w-4" />}
                  text="Upload EMGS Eval"
                  bgColor="bg-blue-600"
                  textColor="text-white"
                  borderColor="border-blue-600"
                  hoverTextColor="hover:text-white"
                  hoverBorderColor="hover:border-blue-700"
                  className="w-full hover:bg-blue-700"
                />
              </div>
            )}

            {!actionsLoading && (confirmAction || disputeAction) && (
              <div className="flex flex-row gap-2">
                {confirmAction && (
                  <Button
                    icon={<CheckCircle className="h-4 w-4" />}
                    text={confirmLoading ? "Processing..." : "Confirm Commission "}
                    bgColor="bg-green-50"
                    textColor="text-green-700"
                    borderColor="border-green-600"
                    hoverTextColor="hover:text-green-800"
                    hoverBorderColor="hover:border-green-700"
                    className="w-full"
                    onClick={handleCommissionConfirm}
                    disabled={confirmLoading}
                  />
                )}
                {disputeAction && (
                  <Button
                    icon={<AlertCircle className="h-4 w-4" />}
                    text="Dispute Commission "
                    bgColor="bg-red-50"
                    textColor="text-red-700"
                    borderColor="border-red-600"
                    hoverTextColor="hover:text-red-800"
                    hoverBorderColor="hover:border-red-700"
                    className="w-full"
                    onClick={() => setShowDispute(true)}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Application Timeline */}
        <div className="p-6 border-b border-slate-200">
          <ApplicationTimeline application={application} />
        </div>

        {/* Commission Details */}
        <div className="border-b border-slate-200">
          <ApplicationCommission application={application} actions={actions} onRefetch={handleRefetch} />
        </div>

        {/* Offer Letter */}
        <div className="border-b border-slate-200">
          <OfferLetterDecision application={application} visaCase={visaCase} onRefetch={handleRefetch} />
        </div>

        {/* Application Information */}
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-p3 mb-6 flex items-center gap-3 font-semibold text-slate-900">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
              <MdAssignmentTurnedIn className="text-xl text-blue-700" />
            </span>
            Application Information
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div>
              <span className="block text-p1 font-medium text-slate-900">Program</span>
              <span className="text-p2 text-slate-500">{program.name || "Not provided"}</span>
            </div>
            <div>
              <span className="block text-p1 font-medium text-slate-900">University</span>
              <span className="text-p2 text-slate-500">{university.name || "Not provided"}</span>
            </div>
            <div>
              <span className="block text-p1 font-medium text-slate-900">Country of University</span>
              <span className="text-p2 text-slate-500">{university.country || "Not provided"}</span>
            </div>
            <div>
              <span className="block text-p1 font-medium text-slate-900">Partner</span>
              <span className="text-p2 text-slate-500">{partner.name || "Not provided"}</span>
            </div>
            <div>
              <span className="block text-p1 font-medium text-slate-900">Stage</span>
              <span className="text-p2 text-slate-500">{stage.name || "Not provided"}</span>
            </div>
            <div>
              <span className="block text-p1 font-medium text-slate-900">Status</span>
              <span className="text-p2 text-slate-500">{currentStatus.name || "Not provided"}</span>
            </div>
            <div>
              <span className="block text-p1 font-medium text-slate-900">Intake Date</span>
              <span className="text-p2 text-slate-500">
                <AppDate value={application.intake_date} format="short" fallback="Not provided" />
              </span>
            </div>
            <div>
              <span className="block text-p1 font-medium text-slate-900">Tuition Fee</span>
              <span className="text-p1 text-green-700">
                $ {program.tuition_fee?.toLocaleString() || "Not provided"}
              </span>
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-p3 mb-6 flex items-center gap-3 font-semibold text-slate-900">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
              <FaUser className="text-xl text-blue-700" />
            </span>
            Student Information
          </h3>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-h6 font-semibold text-slate-900">
                <FaUser /> Personal Details
              </h4>
              <dl className="space-y-3">
                {student.name && (
                  <div>
                    <dt className="text-sm font-medium text-slate-900">Full Name</dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <FaUser className="text-slate-500" />
                      {student.name}
                    </dd>
                  </div>
                )}
                {student.gender !== null && (
                  <div>
                    <dt className="text-sm font-medium text-slate-900">Gender</dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <FaUser className="text-slate-500" />
                      {formatGender(student.gender)}
                    </dd>
                  </div>
                )}
                {student.birthday && (
                  <div>
                    <dt className="text-sm font-medium text-slate-900">Date of Birth</dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <FaBirthdayCake className="text-slate-500" />
                      <AppDate value={student.birthday} format="short" fallback="Not provided" />
                    </dd>
                  </div>
                )}
                {student.nationality && (
                  <div>
                    <dt className="text-sm font-medium text-slate-900">Nationality</dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <FaFlag className="text-slate-500" />
                      {student.nationality}
                    </dd>
                  </div>
                )}
                {student.passport_number && (
                  <div>
                    <dt className="text-sm font-medium text-slate-900">Passport Number</dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <FaIdCard className="text-slate-500" />
                      {student.passport_number}
                    </dd>
                  </div>
                )}
                {student.email && (
                  <div>
                    <dt className="text-sm font-medium text-slate-900">Email Address</dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <FaEnvelope className="text-slate-500" />
                      {student.email}
                    </dd>
                  </div>
                )}
                {student.phone && (
                  <div>
                    <dt className="text-sm font-medium text-slate-900">Phone Number</dt>
                    <dd className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <FaPhone className="text-slate-500" />
                      {student.phone}
                    </dd>
                  </div>
                )}
                {student.current_address && (
                  <div>
                    <dt className="text-sm font-medium text-slate-900">Current Address</dt>
                    <dd className="mt-1 flex items-center gap-2 break-words text-sm text-slate-500">
                      <FaHome className="text-slate-500" />
                      {student.current_address}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {hasEnglishProficiency && (
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-h6 font-semibold text-slate-900">
                  <FaBook /> English Proficiency
                </h4>
                <dl className="space-y-3">
                  {englishProficiency.test_type && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-slate-900">Test Name</dt>
                      <dd className="text-sm text-slate-500">{englishProficiency.test_type}</dd>
                    </div>
                  )}
                  {englishProficiency.score && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-slate-900">Score</dt>
                      <dd className="text-sm font-semibold text-slate-500">{englishProficiency.score}</dd>
                    </div>
                  )}
                  {englishProficiency.test_date && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-slate-900">Test Date</dt>
                      <dd className="text-sm text-slate-500">
                        <AppDate value={englishProficiency.test_date} format="short" fallback="Not provided" />
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {hasPreviousEducation && (
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-h6 font-semibold text-slate-900">
                  <FaGraduationCap /> Previous Education
                </h4>
                <dl className="space-y-3">
                  {application.qualification_level && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-slate-900">Degree</dt>
                      <dd className="text-sm text-slate-500">{application.qualification_level}</dd>
                    </div>
                  )}
                  {previousEducation.institution_name && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-slate-900">Institution</dt>
                      <dd className="max-w-[60%] break-words text-right text-sm text-slate-500">
                        {previousEducation.institution_name}
                      </dd>
                    </div>
                  )}
                  {previousEducation.start_date && previousEducation.end_date && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-slate-900">Study Period</dt>
                      <dd className="text-sm text-slate-500">
                        <AppDate value={previousEducation.start_date} format="short" fallback="Not provided" /> – <AppDate value={previousEducation.end_date} format="short" fallback="Not provided" />
                      </dd>
                    </div>
                  )}
                  {previousEducation.grade && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-slate-900">GPA / Grade</dt>
                      <dd className="text-sm font-bold text-slate-500">{previousEducation.grade}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {hasEmergencyContact && (
              <div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <FaPhoneAlt className="text-xs text-red-600" />
                    <h4 className="text-p2 font-semibold tracking-wide text-red-700">
                      Emergency Contact
                    </h4>
                  </div>
                  <dl className="space-y-4">
                    {emergencyContact.name && (
                      <div className="grid grid-cols-[auto,1fr] items-start gap-2">
                        <dt className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <FaUser /> Name
                        </dt>
                        <dd className="min-w-0 break-words text-sm text-slate-900">
                          {emergencyContact.name}
                        </dd>
                      </div>
                    )}
                    {emergencyContact.relation && (
                      <div className="grid grid-cols-[auto,1fr] items-start gap-2">
                        <dt className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <FaUsers /> Relation
                        </dt>
                        <dd className="min-w-0 text-sm text-slate-900">
                          {emergencyContact.relation}
                        </dd>
                      </div>
                    )}
                    {emergencyContact.phone && (
                      <div className="grid grid-cols-[auto,1fr] items-start gap-2">
                        <dt className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <FaPhoneAlt /> Phone
                        </dt>
                        <dd className="min-w-0 text-sm text-slate-900">
                          {emergencyContact.phone}
                        </dd>
                      </div>
                    )}
                    {emergencyContact.email && (
                      <div className="grid grid-cols-[auto,1fr] items-start gap-2">
                        <dt className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <FaEnvelope /> Email
                        </dt>
                        <dd className="min-w-0 break-all text-sm text-slate-900">
                          {emergencyContact.email}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        <ApplicationDocuments application={application} onRefetch={handleRefetch} />

      </div>

      {application && showRequiredActionPopup && (
        <RequiredAction
          isOpen={showRequiredActionPopup}
          onClose={closeRequiredActionPopup}
          applicationId={application.id}
          onRefetch={handleRefetch}
        />
      )}

      {showArrivalPopup && (
        <ArrivalDate
          isOpen={showArrivalPopup}
          onClose={() => setShowArrivalPopup(false)}
          applicationId={application.id}
          onRefetch={handleRefetch}
        />
      )}

      {showEmgsUploadPopup && (
        <EmgsEvalUpload
          isOpen={showEmgsUploadPopup}
          onClose={() => setShowEmgsUploadPopup(false)}
          applicationId={application.id}
          onRefetch={handleRefetch}
        />
      )}

      {showEVisaUploadPopup && (
        <EVisaUpload
          isOpen={showEVisaUploadPopup}
          onClose={() => setShowEVisaUploadPopup(false)}
          applicationId={application.id}
          onRefetch={handleRefetch}
        />
      )}

      {showApplicationFormReuploadPopup && (
        <ApplicationFormReupload
          isOpen={showApplicationFormReuploadPopup}
          onClose={() => setShowApplicationFormReuploadPopup(false)}
          applicationId={application.id}
          onRefetch={handleRefetch}
        />
      )}

      {showVisaPaymentPopup && (
        <VisaPaymentConfirmation
          isOpen={showVisaPaymentPopup}
          onClose={() => setShowVisaPaymentPopup(false)}
          applicationId={application.id}
          application={application}
          onRefetch={handleRefetch}
        />
      )}

      {application && showProgramDecisionPopup && (
        <ProgramDecision
          isOpen={showProgramDecisionPopup}
          onClose={closeProgramDecisionPopup}
          applicationId={application.id}
          universityId={application.program?.university?.id || ""}
          correctionReason={actions?.correction_reason ?? undefined}
          onRefetch={handleRefetch}
        />
      )}

      {showDispute && disputeAction && (
        <DisputeCommission
          isOpen={showDispute}
          onClose={() => setShowDispute(false)}
          applicationId={application.id}
          onSuccess={handleRefetch}
        />
      )}
    </section>
  );
}
