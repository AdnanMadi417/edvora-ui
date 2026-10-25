import React, { useState } from "react";
import RichTextDisplay from "components/ui/RichTextDisplay";

import { Wallet } from "lucide-react";
import { Clock, Upload, ClipboardCheck, CreditCard, Plane, FileUp, Download } from 'lucide-react';
import { getDocumentDownloadUrl } from 'services/documentService';
import Button from 'components/ui/buttons/Button';
import IconButton from 'components/ui/buttons/IconButton';
import { useApplicationActions } from "features/applications/hooks";
import { usePartnerProfile } from "features/partners/hooks/usePartnerProfile";
import { useHealthDeclarationFormDownload } from "features/applications/shared/useHealthDeclarationFormDownload";

import ApplicationPartnerTopBar from "features/applications/partner/components/topBar/PartnerTopBar";
import RequiredAction from "features/applications/partner/components/popups/RequiredAction";
import ProgramDecision from "features/applications/partner/components/popups/ProgramDecision";
import ApplicationHero from "features/applications/shared/ApplicationHero";
import ApplicationInfoSection from "features/applications/shared/ApplicationInfoSection";
import ApplicationStudentInfoSection from "features/applications/shared/ApplicationStudentInfoSection";
import OfferLetterDecision from './OfferLetter';
import VisaPaymentConfirmation from "features/applications/partner/components/popups/VisaPaymentConfirmation";
import ArrivalDate from "features/applications/partner/components/popups/ArrivalDate";
import EmgsEvalUpload from "features/applications/partner/components/popups/EmgsEvaluationUpload";
import EVisaUpload from "features/applications/partner/components/popups/EVisaUpload";
import ApplicationCommission from './ApplicationCommission';
import ApplicationDocuments from './ApplicationDocuments';
import ApplicationFormsSection from './ApplicationFormsSection';
import MDACSection from './MDACSection';
import { useToast } from 'components/context/ToastContext';
import { AnimatePresence, motion } from "framer-motion";
import { EASE, MICRO_DURATION } from "components/ui/FadeIn";
import { Tabs } from "components/ui/tabs";
import { PARTNER_APPLICATION_DETAILS_TABS, type ApplicationDetailsTab } from "features/applications/shared/applicationDetailTabs";
import ApplicationActivityHistory from 'features/applications/shared/ApplicationActivityHistory';
import ApplicationTimeline from 'features/applications/shared/ApplicationTimeline';
import { useVisaPaymentMethods } from "hooks/usePaymentMethods";
import { useVisaCase } from "hooks/useVisaCase";

interface ApplicationDetailsProps {
  application: any;
  onRefetch?: () => Promise<void>;
}

export default function ApplicationDetails({
  application,
  onRefetch,
}: ApplicationDetailsProps) {
  const [activeTab, setActiveTab] = useState<ApplicationDetailsTab>("details");
  const { actions, refetch: refetchActions } = useApplicationActions(
    application?.id
  );

  const handleRefetch = async () => {
    await onRefetch?.();
    refetchActions();
  };

  // An agency admin viewing one of their members' applications (D8): read
  // only, the member does the uploads and forms. Commission confirm/dispute
  // stays available -- those are the agency admin's to do.
  const { partner: viewer } = usePartnerProfile();
  const ownerId: string | undefined = application?.partner?.id;
  const isTeamView = !!viewer?.id && !!ownerId && ownerId !== viewer.id;

  const stage = application.stage || {};
  const [showRequiredActionPopup, setShowRequiredActionPopup] = useState(false);
  const openRequiredActionPopup = () => setShowRequiredActionPopup(true);
  const closeRequiredActionPopup = () => setShowRequiredActionPopup(false);

  const { methods, loading: paymentLoading } = useVisaPaymentMethods(application?.id);
  const { visaCase } = useVisaCase(application?.id || "");

  const { showToast } = useToast();
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

  const [showArrivalPopup, setShowArrivalPopup] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const { download: downloadHealthDeclarationForm, downloading: downloadingHealthDeclarationForm } =
    useHealthDeclarationFormDownload();

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

  return (
    <section className="max-w-5xl mx-auto">
      <div className="mt-4 bg-white rounded-lg border border-slate-200">

        {/* Partner TopBar */}
        <div className="border-b border-slate-200">
          <ApplicationPartnerTopBar application={application} />
        </div>

        {/* Hero */}
        <ApplicationHero application={application}>
          <div className="mt-4 space-y-2">
            {isTeamView ? (
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Submitted by <span className="font-medium text-slate-800">{application?.partner?.name || "a team member"}</span>.
                You can view this application; uploads and forms are done from their account.
              </p>
            ) : (
            <>
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
                  const appForm2Doc = application?.documents?.find((d: any) => d.document_type === "Application Form 2 Template");
                  const englishFormDoc = application?.documents?.find((d: any) => d.document_type === "English Form Template");
                  const visaInvoiceKey = visaInvoiceDoc?.file_key;
                  const appFormKey = actions?.is_application_form_required ? appFormDoc?.file_key : null;
                  const appForm2Key = actions?.is_application_form_2_required ? appForm2Doc?.file_key : null;
                  const englishFormKey = actions?.is_english_form_required ? englishFormDoc?.file_key : null;
                  const showHealthDeclaration = !!actions?.is_health_declaration_form_required;
                  const signedOfferLetterKey = actions?.is_signed_offer_letter_required
                    ? application?.offer_letter_document?.file_key
                    : null;
                  if (
                    !visaInvoiceKey &&
                    !appFormKey &&
                    !appForm2Key &&
                    !englishFormKey &&
                    !showHealthDeclaration &&
                    !signedOfferLetterKey
                  ) {
                    return null;
                  }
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
                      {appForm2Key && (
                        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-200">
                              <Download className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800">Application Form 2 Template</p>
                              <p className="text-xs text-slate-400">Download, complete, and re-upload when requested by your manager</p>
                            </div>
                          </div>
                          <IconButton
                            onClick={() => handleTemplateDownload(appForm2Key)}
                            disabled={downloadingTemplate}
                            title="Download Application Form 2 Template"
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
                      {englishFormKey && (
                        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-200">
                              <Download className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800">English Form Template</p>
                              <p className="text-xs text-slate-400">Download, complete, and re-upload when requested by your manager</p>
                            </div>
                          </div>
                          <IconButton
                            onClick={() => handleTemplateDownload(englishFormKey)}
                            disabled={downloadingTemplate}
                            title="Download English Form Template"
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
                      {showHealthDeclaration && (
                        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-200">
                              <Download className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800">Health Declaration Form</p>
                              <p className="text-xs text-slate-400">Required for visa processing (Lampiran B)</p>
                            </div>
                          </div>
                          <IconButton
                            onClick={downloadHealthDeclarationForm}
                            disabled={downloadingHealthDeclarationForm}
                            title="Download Health Declaration Form"
                            icon={<Download className={`h-4 w-4 ${downloadingHealthDeclarationForm ? "animate-pulse" : ""}`} />}
                            bgColor="bg-blue-50"
                            textColor="text-blue-600"
                            borderColor="border-transparent"
                            hoverTextColor="hover:text-blue-600"
                            hoverBorderColor="hover:border-blue-200"
                            className="ml-3 shrink-0 hover:bg-blue-100"
                          />
                        </div>
                      )}
                      {signedOfferLetterKey && (
                        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-200">
                              <Download className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800">Offer Letter (to sign)</p>
                              <p className="text-xs text-slate-400">Download, sign, and upload the signed copy with your payment</p>
                            </div>
                          </div>
                          <IconButton
                            onClick={() => handleTemplateDownload(signedOfferLetterKey)}
                            disabled={downloadingTemplate}
                            title="Download Offer Letter"
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
            </>
            )}

          </div>
        </ApplicationHero>

        <Tabs<ApplicationDetailsTab> tabs={PARTNER_APPLICATION_DETAILS_TABS} active={activeTab} onChange={setActiveTab} />

        <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: MICRO_DURATION, ease: EASE }}
        >
        {activeTab === "details" && (
        <>
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
          <OfferLetterDecision application={application} visaCase={visaCase} actions={actions} onRefetch={handleRefetch} readOnly={isTeamView} />
        </div>

        {/* MDAC — standalone, independent of the Visa/Offer Letter section */}
        <div className="border-b border-slate-200">
          <MDACSection />
        </div>

        {/* Application Information */}
        <ApplicationInfoSection application={application} />

        {/* Student Information */}
        <ApplicationStudentInfoSection application={application} />

        {/* Documents */}
        <ApplicationDocuments application={application} onRefetch={handleRefetch} />

        </>
        )}

        {activeTab === "documents" && (
          <ApplicationFormsSection application={application} actions={actions} onRefetch={handleRefetch} readOnly={isTeamView} />
        )}

        {activeTab === "activity" && <ApplicationActivityHistory application={application} />}
        </motion.div>
        </AnimatePresence>

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

      {showVisaPaymentPopup && (
        <VisaPaymentConfirmation
          isOpen={showVisaPaymentPopup}
          onClose={() => setShowVisaPaymentPopup(false)}
          applicationId={application.id}
          actions={actions}
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

    </section>
  );
}
