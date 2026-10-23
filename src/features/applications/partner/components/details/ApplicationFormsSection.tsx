"use client";

import React, { useState } from "react";
import { FileText, Download, CheckCircle, Clock, XCircle, FileUp } from "lucide-react";
import { SectionIconBadge } from "components/ui/icons";
import { StatusBadge } from "components/ui/badges";
import IconButton from "components/ui/buttons/IconButton";
import Button from "components/ui/buttons/Button";
import { useToast } from "components/context/ToastContext";
import { getDocumentDownloadUrl } from "services/documentService";
import { useHealthDeclarationFormDownload } from "features/applications/shared/useHealthDeclarationFormDownload";
import type { ApplicationActionsResponse } from "features/applications/hooks/stages/useApplicationActions";
import ApplicationFormReupload from "../popups/ApplicationFormReupload";
import ApplicationForm2Reupload from "../popups/ApplicationForm2Reupload";
import HealthDeclarationReupload from "../popups/HealthDeclarationReupload";
import SignedOfferLetterReupload from "../popups/SignedOfferLetterReupload";
import EnglishFormReupload from "../popups/EnglishFormReupload";

interface ApplicationFormsSectionProps {
  application: any;
  actions: ApplicationActionsResponse | null;
  onRefetch?: () => void;
}

type RowState = "not_submitted" | "submitted" | "rejected";

function useGenericTemplateDownload() {
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const download = async (fileKey: string) => {
    if (downloading) return;
    try {
      setDownloading(true);
      const url = await getDocumentDownloadUrl(fileKey);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      showToast("Failed to download template", "error");
    } finally {
      setDownloading(false);
    }
  };

  return { download, downloading };
}

function FormRow({
  label,
  state,
  templateAction,
  onReupload,
}: {
  label: string;
  state: RowState;
  templateAction?: React.ReactNode;
  onReupload?: () => void;
}) {
  const stateMeta: Record<RowState, { icon: React.ReactNode; variant: "success" | "attention" | "danger"; text: string }> = {
    not_submitted: { icon: <Clock className="h-3 w-3" />, variant: "attention", text: "Not submitted yet" },
    submitted: { icon: <CheckCircle className="h-3 w-3" />, variant: "success", text: "Submitted" },
    rejected: { icon: <XCircle className="h-3 w-3" />, variant: "danger", text: "Rejected" },
  };
  const meta = stateMeta[state];

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
          <FileText className="h-4 w-4 text-slate-500" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">{label}</p>
          <div className="mt-1">
            <StatusBadge variant={meta.variant} icon={meta.icon}>{meta.text}</StatusBadge>
          </div>
          {state === "not_submitted" && (
            <p className="mt-1 text-xs text-slate-500">Submit together with your visa fee payment.</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {templateAction}
        {state === "rejected" && onReupload && (
          <Button
            onClick={onReupload}
            icon={<FileUp className="h-4 w-4" />}
            text="Re-upload"
            bgColor="bg-red-50"
            textColor="text-red-700"
            borderColor="border-red-600"
            hoverTextColor="hover:text-red-800"
            hoverBorderColor="hover:border-red-700"
          />
        )}
      </div>
    </div>
  );
}

/**
 * Documents tab (partner only): status of the five offer-letter-stage forms
 * (Application Form, Application Form 2, Health Declaration, Signed Offer
 * Letter, English Form). "Submitted" vs "approved" can't be told apart yet —
 * there's no confirmed per-form review status field — so a required form
 * that isn't the one currently rejected is shown as "Submitted" once the
 * application has moved past the visa-payment stage (the only point these
 * are ever uploaded), which is a safe inference: the backend blocks that
 * submission with a 422 unless every required form was attached.
 */
export default function ApplicationFormsSection({ application, actions, onRefetch }: ApplicationFormsSectionProps) {
  const currentStatusCode = actions?.status_code;
  const pastPaymentGate = !!currentStatusCode && currentStatusCode !== "WAITING_FOR_PAYMENT" && currentStatusCode !== "PAYMENT_REJECTED";

  const { download: downloadHealthDeclarationForm, downloading: downloadingHealthDeclarationForm } =
    useHealthDeclarationFormDownload();
  const { download: downloadTemplate, downloading: downloadingTemplate } = useGenericTemplateDownload();

  const [openPopup, setOpenPopup] = useState<null | "application_form" | "application_form_2" | "health_declaration" | "signed_offer_letter" | "english_form">(null);

  const docTemplate = (type: string) => application?.documents?.find((d: any) => d.document_type === type);

  const rowState = (required: boolean, rejectedStatusCode: string): RowState | null => {
    if (!required) return null;
    if (currentStatusCode === rejectedStatusCode) return "rejected";
    return pastPaymentGate ? "submitted" : "not_submitted";
  };

  const appFormState = rowState(!!actions?.is_application_form_required, "APPLICATION_FORM_REJECTED");
  const appForm2State = rowState(!!actions?.is_application_form_2_required, "APPLICATION_FORM_2_REJECTED");
  const healthDeclarationState = rowState(!!actions?.is_health_declaration_form_required, "HEALTH_DECLARATION_REJECTED");
  const signedOfferLetterState = rowState(!!actions?.is_signed_offer_letter_required, "SIGNED_OFFER_LETTER_REJECTED");
  const englishFormState = rowState(!!actions?.is_english_form_required, "ENGLISH_FORM_REJECTED");

  const appFormTemplate = docTemplate("Application Form Template");
  const appForm2Template = docTemplate("Application Form 2 Template");
  const englishFormTemplate = docTemplate("English Form Template");

  const handleRefetchAndClose = () => {
    setOpenPopup(null);
    onRefetch?.();
  };

  const noneRequired = !appFormState && !appForm2State && !healthDeclarationState && !signedOfferLetterState && !englishFormState;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-3">
        <SectionIconBadge icon={FileText} color="blue" />
        <div>
          <h3 className="text-p3 font-semibold text-slate-900">Offer Letter Documents</h3>
          <p className="text-sm text-slate-500">Status of the forms requested alongside your offer letter.</p>
        </div>
      </div>

      {noneRequired ? (
        <p className="text-sm text-slate-500">No additional forms have been requested for this application.</p>
      ) : (
        <div className="space-y-3">
          {appFormState && (
            <FormRow
              label="Application Form"
              state={appFormState}
              templateAction={
                appFormTemplate?.file_key && (
                  <IconButton
                    onClick={() => downloadTemplate(appFormTemplate.file_key)}
                    disabled={downloadingTemplate}
                    title="Download Application Form Template"
                    icon={<Download className="h-4 w-4" />}
                    bgColor="bg-blue-50"
                    textColor="text-blue-600"
                    borderColor="border-transparent"
                    hoverTextColor="hover:text-blue-600"
                    hoverBorderColor="hover:border-blue-200"
                    className="hover:bg-blue-100"
                  />
                )
              }
              onReupload={() => setOpenPopup("application_form")}
            />
          )}

          {appForm2State && (
            <FormRow
              label="Application Form 2"
              state={appForm2State}
              templateAction={
                appForm2Template?.file_key && (
                  <IconButton
                    onClick={() => downloadTemplate(appForm2Template.file_key)}
                    disabled={downloadingTemplate}
                    title="Download Application Form 2 Template"
                    icon={<Download className="h-4 w-4" />}
                    bgColor="bg-blue-50"
                    textColor="text-blue-600"
                    borderColor="border-transparent"
                    hoverTextColor="hover:text-blue-600"
                    hoverBorderColor="hover:border-blue-200"
                    className="hover:bg-blue-100"
                  />
                )
              }
              onReupload={() => setOpenPopup("application_form_2")}
            />
          )}

          {healthDeclarationState && (
            <FormRow
              label="Health Declaration Form"
              state={healthDeclarationState}
              templateAction={
                <IconButton
                  onClick={downloadHealthDeclarationForm}
                  disabled={downloadingHealthDeclarationForm}
                  title="Download Health Declaration Form"
                  icon={<Download className="h-4 w-4" />}
                  bgColor="bg-blue-50"
                  textColor="text-blue-600"
                  borderColor="border-transparent"
                  hoverTextColor="hover:text-blue-600"
                  hoverBorderColor="hover:border-blue-200"
                  className="hover:bg-blue-100"
                />
              }
              onReupload={() => setOpenPopup("health_declaration")}
            />
          )}

          {signedOfferLetterState && (
            <FormRow
              label="Signed Offer Letter"
              state={signedOfferLetterState}
              templateAction={
                application?.offer_letter_document?.file_key && (
                  <IconButton
                    onClick={() => downloadTemplate(application.offer_letter_document.file_key)}
                    disabled={downloadingTemplate}
                    title="Download Offer Letter"
                    icon={<Download className="h-4 w-4" />}
                    bgColor="bg-blue-50"
                    textColor="text-blue-600"
                    borderColor="border-transparent"
                    hoverTextColor="hover:text-blue-600"
                    hoverBorderColor="hover:border-blue-200"
                    className="hover:bg-blue-100"
                  />
                )
              }
              onReupload={() => setOpenPopup("signed_offer_letter")}
            />
          )}

          {englishFormState && (
            <FormRow
              label="English Form"
              state={englishFormState}
              templateAction={
                englishFormTemplate?.file_key && (
                  <IconButton
                    onClick={() => downloadTemplate(englishFormTemplate.file_key)}
                    disabled={downloadingTemplate}
                    title="Download English Form Template"
                    icon={<Download className="h-4 w-4" />}
                    bgColor="bg-blue-50"
                    textColor="text-blue-600"
                    borderColor="border-transparent"
                    hoverTextColor="hover:text-blue-600"
                    hoverBorderColor="hover:border-blue-200"
                    className="hover:bg-blue-100"
                  />
                )
              }
              onReupload={() => setOpenPopup("english_form")}
            />
          )}
        </div>
      )}

      <ApplicationFormReupload
        isOpen={openPopup === "application_form"}
        onClose={() => setOpenPopup(null)}
        applicationId={application.id}
        onRefetch={handleRefetchAndClose}
      />
      <ApplicationForm2Reupload
        isOpen={openPopup === "application_form_2"}
        onClose={() => setOpenPopup(null)}
        applicationId={application.id}
        onRefetch={handleRefetchAndClose}
      />
      <HealthDeclarationReupload
        isOpen={openPopup === "health_declaration"}
        onClose={() => setOpenPopup(null)}
        applicationId={application.id}
        onRefetch={handleRefetchAndClose}
      />
      <SignedOfferLetterReupload
        isOpen={openPopup === "signed_offer_letter"}
        onClose={() => setOpenPopup(null)}
        applicationId={application.id}
        onRefetch={handleRefetchAndClose}
      />
      <EnglishFormReupload
        isOpen={openPopup === "english_form"}
        onClose={() => setOpenPopup(null)}
        applicationId={application.id}
        onRefetch={handleRefetchAndClose}
      />
    </div>
  );
}
