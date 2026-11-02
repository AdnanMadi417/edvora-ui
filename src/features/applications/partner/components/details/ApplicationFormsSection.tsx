"use client";

import React, { useState } from "react";
import { Download, FileText, FileUp } from "lucide-react";
import Button from "components/ub/core/Button";
import IconButton from "components/ub/core/IconButton";
import FileRow, { type FileRowState } from "components/ub/data/FileRow";
import SectionCard from "components/ub/data/SectionCard";
import { useToast } from "components/ub/feedback/ToastContext";
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
  // Agency admin viewing a member's application: no re-uploads on their behalf.
  readOnly?: boolean;
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

type FormKey =
  | "application_form"
  | "application_form_2"
  | "health_declaration"
  | "signed_offer_letter"
  | "english_form";

/** The five offer-letter-stage forms: label, required flag, rejected status and template source. */
const FORMS: {
  key: FormKey;
  label: string;
  flag: keyof ApplicationActionsResponse;
  rejected: string;
  template: string | "offer-letter" | "health" | null;
}[] = [
  {
    key: "application_form",
    label: "Application form",
    flag: "is_application_form_required",
    rejected: "APPLICATION_FORM_REJECTED",
    template: "Application Form Template",
  },
  {
    key: "application_form_2",
    label: "Application form 2",
    flag: "is_application_form_2_required" as keyof ApplicationActionsResponse,
    rejected: "APPLICATION_FORM_2_REJECTED",
    template: "Application Form 2 Template",
  },
  {
    key: "health_declaration",
    label: "Health declaration form",
    flag: "is_health_declaration_form_required",
    rejected: "HEALTH_DECLARATION_REJECTED",
    template: "health",
  },
  {
    key: "signed_offer_letter",
    label: "Signed offer letter",
    flag: "is_signed_offer_letter_required",
    rejected: "SIGNED_OFFER_LETTER_REJECTED",
    template: "offer-letter",
  },
  {
    key: "english_form",
    label: "English form",
    flag: "is_english_form_required",
    rejected: "ENGLISH_FORM_REJECTED",
    template: "English Form Template",
  },
];

const ROW: Record<RowState, { state: FileRowState; label: string }> = {
  not_submitted: { state: "missing", label: "Not submitted yet" },
  submitted: { state: "uploaded", label: "Submitted" },
  rejected: { state: "needs-replacing", label: "Rejected" },
};

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
export default function ApplicationFormsSection({
  application,
  actions,
  onRefetch,
  readOnly = false,
}: ApplicationFormsSectionProps) {
  const currentStatusCode = actions?.status_code;
  const pastPaymentGate =
    !!currentStatusCode &&
    currentStatusCode !== "WAITING_FOR_PAYMENT" &&
    currentStatusCode !== "PAYMENT_REJECTED";

  const {
    download: downloadHealthDeclarationForm,
    downloading: downloadingHealth,
  } = useHealthDeclarationFormDownload();
  const { download: downloadTemplate, downloading: downloadingTemplate } =
    useGenericTemplateDownload();
  const [openPopup, setOpenPopup] = useState<null | FormKey>(null);

  // A rejected status always shows its row, even with the flag unset —
  // applications that predate the is_*_required flags never had them set,
  // and the re-upload button is the partner's only way out of that status.
  const rowState = (
    required: boolean,
    rejectedStatusCode: string
  ): RowState | null => {
    if (currentStatusCode === rejectedStatusCode) return "rejected";
    if (!required) return null;
    return pastPaymentGate ? "submitted" : "not_submitted";
  };

  const templateKey = (t: string | null): string | null => {
    if (!t || t === "health") return null;
    if (t === "offer-letter")
      return application?.offer_letter_document?.file_key ?? null;
    return (
      application?.documents?.find((d: any) => d.document_type === t)
        ?.file_key ?? null
    );
  };

  const rows = FORMS.map((f) => ({
    ...f,
    row: rowState(!!actions?.[f.flag], f.rejected),
  })).filter((f) => f.row) as ((typeof FORMS)[number] & { row: RowState })[];

  const handleRefetchAndClose = () => {
    setOpenPopup(null);
    onRefetch?.();
  };

  return (
    <SectionCard
      title="Offer letter documents"
      description="Status of the forms requested alongside the offer letter."
      state={rows.length ? "ready" : "empty"}
      empty={{
        icon: FileText,
        title: "No additional forms requested",
        description:
          "No additional forms have been requested for this application.",
      }}
    >
      <ul className="-my-4 divide-y divide-ub-border">
        {rows.map((f) => {
          const meta = ROW[f.row];
          const key = templateKey(f.template);
          const canDownload = f.template === "health" || !!key;
          return (
            <FileRow
              key={f.key}
              name={f.label}
              state={meta.state}
              stateLabel={meta.label}
              meta={
                f.row === "not_submitted"
                  ? "Submit together with your visa fee payment."
                  : undefined
              }
              reason={
                f.row === "rejected"
                  ? actions?.correction_reason ?? undefined
                  : undefined
              }
              actions={
                <>
                  {f.row === "rejected" && !readOnly && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setOpenPopup(f.key)}
                      icon={<FileUp className="h-4 w-4" aria-hidden="true" />}
                      text="Re-upload"
                    />
                  )}
                  {canDownload && (
                    <IconButton
                      size="sm"
                      variant="tertiary"
                      title={`Download ${f.label.toLowerCase()} template`}
                      disabled={
                        f.template === "health"
                          ? downloadingHealth
                          : downloadingTemplate
                      }
                      onClick={() =>
                        f.template === "health"
                          ? downloadHealthDeclarationForm()
                          : key && downloadTemplate(key)
                      }
                      icon={<Download className="h-4 w-4" aria-hidden="true" />}
                    />
                  )}
                </>
              }
            />
          );
        })}
      </ul>

      <ApplicationFormReupload
        isOpen={openPopup === "application_form"}
        onClose={() => setOpenPopup(null)}
        applicationId={application.id}
        correctionReason={actions?.correction_reason}
        onRefetch={handleRefetchAndClose}
      />
      <ApplicationForm2Reupload
        isOpen={openPopup === "application_form_2"}
        onClose={() => setOpenPopup(null)}
        applicationId={application.id}
        correctionReason={actions?.correction_reason}
        onRefetch={handleRefetchAndClose}
      />
      <HealthDeclarationReupload
        isOpen={openPopup === "health_declaration"}
        onClose={() => setOpenPopup(null)}
        applicationId={application.id}
        correctionReason={actions?.correction_reason}
        onRefetch={handleRefetchAndClose}
      />
      <SignedOfferLetterReupload
        isOpen={openPopup === "signed_offer_letter"}
        onClose={() => setOpenPopup(null)}
        applicationId={application.id}
        correctionReason={actions?.correction_reason}
        onRefetch={handleRefetchAndClose}
      />
      <EnglishFormReupload
        isOpen={openPopup === "english_form"}
        onClose={() => setOpenPopup(null)}
        applicationId={application.id}
        correctionReason={actions?.correction_reason}
        onRefetch={handleRefetchAndClose}
      />
    </SectionCard>
  );
}
