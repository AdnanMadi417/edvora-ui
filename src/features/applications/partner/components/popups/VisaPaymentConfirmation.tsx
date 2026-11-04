"use client";

import Alert from "components/ub/feedback/Alert";
import FormModal from "components/ub/feedback/FormModal";
import React, { useState } from "react";
import { CreditCard } from "lucide-react";
import TextButton from "components/ub/core/TextButton";
import { useVisaPaymentMethods } from "hooks/usePaymentMethods";
import { useApplicationVisaFee, useVisaPaymentUpload } from "features/applications/hooks";
import type { ApplicationActionsResponse } from "features/applications/hooks/stages/useApplicationActions";
import { useHealthDeclarationFormDownload } from "features/applications/shared/useHealthDeclarationFormDownload";
import CompactFileUpload from "components/ub/forms/CompactFileUpload";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";

const VISA_PAYMENT_ERROR_MESSAGES: Record<string, string> = {
  application_form_2_required: "A completed second application form is required — please upload it.",
  health_declaration_form_required: "A completed health declaration form is required — please upload it.",
  signed_offer_letter_required: "A signed copy of the offer letter is required — please upload it.",
  english_form_required: "A completed English form is required — please upload it.",
};

interface VisaPaymentConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  actions?: ApplicationActionsResponse | null;
  onRefetch?: () => void;
}

export default function VisaPaymentConfirmation({
  isOpen,
  onClose,
  applicationId,
  actions,
  onRefetch,
}: VisaPaymentConfirmationProps) {
  const [paymentReference, setPaymentReference] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [appFormFile, setAppFormFile] = useState<File | null>(null);
  const [appForm2File, setAppForm2File] = useState<File | null>(null);
  const [healthDeclarationFile, setHealthDeclarationFile] = useState<File | null>(null);
  const [signedOfferLetterFile, setSignedOfferLetterFile] = useState<File | null>(null);
  const [englishFormFile, setEnglishFormFile] = useState<File | null>(null);

  const { methods, loading: paymentLoading, error: paymentError } = useVisaPaymentMethods(applicationId);
  const { visaFeeAmount } = useApplicationVisaFee(applicationId);
  const { uploadVisaPayment, isUploading } = useVisaPaymentUpload();
  const { download: downloadHealthDeclarationForm, downloading: downloadingHealthDeclarationForm } =
    useHealthDeclarationFormDownload();

  const firstMethod = methods[0] ?? null;
  const hasAppFormTemplate = !!actions?.is_application_form_required;

  const hasAppForm2Template = !!actions?.is_application_form_2_required;
  const healthDeclarationRequired = !!actions?.is_health_declaration_form_required;
  const signedOfferLetterRequired = !!actions?.is_signed_offer_letter_required;
  const hasEnglishFormTemplate = !!actions?.is_english_form_required;

  const handleConfirmUpload = async () => {
    if (!paymentReference) return;
    if (hasAppFormTemplate && !appFormFile) return;
    if (hasAppForm2Template && !appForm2File) return;
    if (healthDeclarationRequired && !healthDeclarationFile) return;
    if (signedOfferLetterRequired && !signedOfferLetterFile) return;
    if (hasEnglishFormTemplate && !englishFormFile) return;

    setUploadError("");
    try {
      await uploadVisaPayment(paymentReference, applicationId, {
        methodId: firstMethod?.id ?? null,
        amount: visaFeeAmount,
        currency: firstMethod?.currency ?? null,
        applicationFormFile: hasAppFormTemplate ? appFormFile : null,
        applicationForm2File: hasAppForm2Template ? appForm2File : null,
        healthDeclarationFormFile: healthDeclarationRequired ? healthDeclarationFile : null,
        signedOfferLetterFile: signedOfferLetterRequired ? signedOfferLetterFile : null,
        englishFormFile: hasEnglishFormTemplate ? englishFormFile : null,
      });

      handleClose();
      onRefetch?.();
    } catch (error: unknown) {
      const code = getApiErrorCode(error);
      const msg = (code && VISA_PAYMENT_ERROR_MESSAGES[code]) || parseApiError(error, "Failed to submit");
      setUploadError(msg);
    }
  };

  const handleClose = () => {
    setPaymentReference(null);
    setFileError("");
    setUploadError("");
    setAppFormFile(null);
    setAppForm2File(null);
    setHealthDeclarationFile(null);
    setSignedOfferLetterFile(null);
    setEnglishFormFile(null);
    onClose();
  };


  // Portaled to document.body so the overlay always covers the full
  // viewport, regardless of any ancestor's stacking context.
  return (
    <FormModal
      open={isOpen}
      onClose={handleClose}
      size="md"
      icon={CreditCard}
      title="Visa Application Fee Payment"
      onSubmit={handleConfirmUpload}
      submitting={isUploading}
      submitLabel={isUploading ? "Submitting..." : paymentLoading ? "Loading..." : "Proceed to Payment"}
      submitDisabled={!paymentReference ||
                  !!fileError ||
                  !!uploadError ||
                  isUploading ||
                  paymentLoading ||
                  (hasAppFormTemplate && !appFormFile) ||
                  (hasAppForm2Template && !appForm2File) ||
                  (healthDeclarationRequired && !healthDeclarationFile) ||
                  (signedOfferLetterRequired && !signedOfferLetterFile) ||
                  (hasEnglishFormTemplate && !englishFormFile)}
    >
      <div className="grid gap-4">

          <div className="space-y-6">
            {paymentError && (
              <Alert tone="danger">{paymentError}</Alert>
            )}

            <CompactFileUpload
              label="Payment Receipt"
              description="Upload your proof of visa fee payment (bank transfer slip, receipt, etc.)"
              id="payment_reference"
              file={paymentReference}
              onFileChange={(file) => { setPaymentReference(file); setUploadError(""); }}
              onRemove={() => { setPaymentReference(null); setUploadError(""); }}
              onError={setFileError}
              disabled={isUploading || paymentLoading}
              required
            />

            {hasAppFormTemplate && (
              <CompactFileUpload
                label="Application Form"
                description="Your manager has provided a template — download it, complete it, and upload the filled form here."
                id="app_form_document"
                file={appFormFile}
                onFileChange={setAppFormFile}
                onRemove={() => setAppFormFile(null)}
                onError={setFileError}
                disabled={isUploading}
                required
              />
            )}

            {hasAppForm2Template && (
              <CompactFileUpload
                label="Application Form 2"
                description="Your manager has provided a second template — download it, complete it, and upload the filled form here."
                id="app_form_2_document"
                file={appForm2File}
                onFileChange={setAppForm2File}
                onRemove={() => setAppForm2File(null)}
                onError={setFileError}
                disabled={isUploading}
                required
              />
            )}

            {healthDeclarationRequired && (
              <div className="space-y-1.5">
                <TextButton
                  size="sm"
                  onClick={downloadHealthDeclarationForm}
                  disabled={downloadingHealthDeclarationForm}
                >
                  {downloadingHealthDeclarationForm ? "Opening..." : "Download blank Health Declaration Form template"}
                </TextButton>
                <CompactFileUpload
                  label="Health Declaration Form"
                  description="Download the blank template above, complete it, and upload the filled form here."
                  id="health_declaration_document"
                  file={healthDeclarationFile}
                  onFileChange={setHealthDeclarationFile}
                  onRemove={() => setHealthDeclarationFile(null)}
                  onError={setFileError}
                  disabled={isUploading}
                  required
                />
              </div>
            )}

            {signedOfferLetterRequired && (
              <CompactFileUpload
                label="Signed Offer Letter"
                description="Download your offer letter above, sign it, and upload the signed copy here."
                id="signed_offer_letter_document"
                file={signedOfferLetterFile}
                onFileChange={setSignedOfferLetterFile}
                onRemove={() => setSignedOfferLetterFile(null)}
                onError={setFileError}
                disabled={isUploading}
                required
              />
            )}

            {hasEnglishFormTemplate && (
              <CompactFileUpload
                label="English Form"
                description="Your manager has provided a template — download it, complete it, and upload the filled form here."
                id="english_form_document"
                file={englishFormFile}
                onFileChange={setEnglishFormFile}
                onRemove={() => setEnglishFormFile(null)}
                onError={setFileError}
                disabled={isUploading}
                required
              />
            )}

            {fileError && (
              <Alert tone="danger">{fileError}</Alert>
            )}

            {uploadError && (
              <Alert tone="danger">{uploadError}</Alert>
            )}
          </div>
      </div>
    </FormModal>
  );
}
