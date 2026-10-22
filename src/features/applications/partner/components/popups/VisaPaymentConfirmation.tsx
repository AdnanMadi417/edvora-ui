"use client";

import React, { useState, useEffect } from "react";
import { XCircle, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { useVisaPaymentMethods } from "hooks/usePaymentMethods";
import { useApplicationVisaFee, useVisaPaymentUpload } from "features/applications/hooks";
import { useHealthDeclarationFormDownload } from "features/applications/shared/useHealthDeclarationFormDownload";
import StatusFileUpload from "components/form/upload/StatusFileUpload";
import SettingToggleInput from "components/form/toggle/SettingToggleInput";
import RichTextDisplay from "components/ui/RichTextDisplay";
import Button from "components/ui/buttons/Button";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";

const VISA_PAYMENT_ERROR_MESSAGES: Record<string, string> = {
  application_form_2_required: "A completed second application form is required — please upload it.",
  health_declaration_form_required: "A completed health declaration form is required — please upload it.",
};

interface VisaPaymentConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  application?: any;
  onRefetch?: () => void;
}

export default function VisaPaymentConfirmation({
  isOpen,
  onClose,
  applicationId,
  application,
  onRefetch,
}: VisaPaymentConfirmationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [paymentReference, setPaymentReference] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [appFormToggle, setAppFormToggle] = useState({ show_app_form: false });
  const [appFormFile, setAppFormFile] = useState<File | null>(null);
  const [appForm2File, setAppForm2File] = useState<File | null>(null);
  const [healthDeclarationFile, setHealthDeclarationFile] = useState<File | null>(null);

  const { methods, loading: paymentLoading, error: paymentError } = useVisaPaymentMethods(applicationId);
  const { visaFeeAmount } = useApplicationVisaFee(applicationId);
  const { uploadVisaPayment, isUploading } = useVisaPaymentUpload();
  const { download: downloadHealthDeclarationForm, downloading: downloadingHealthDeclarationForm } =
    useHealthDeclarationFormDownload();

  const firstMethod = methods[0] ?? null;
  const hasAppFormTemplate = !!application?.documents?.find(
    (d: any) => d.document_type === "Application Form Template"
  );
  const showAppFormUpload = hasAppFormTemplate || appFormToggle.show_app_form;

  const hasAppForm2Template = !!application?.documents?.find(
    (d: any) => d.document_type === "Application Form 2 Template"
  );
  const healthDeclarationRequired = !!application?.offer_letter_document?.health_declaration_form_required;

  useEffect(() => {
    if (isOpen) setIsVisible(true);
    else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleConfirmUpload = async () => {
    if (!paymentReference) return;
    if (hasAppFormTemplate && !appFormFile) return;
    if (hasAppForm2Template && !appForm2File) return;
    if (healthDeclarationRequired && !healthDeclarationFile) return;

    setUploadError("");
    try {
      await uploadVisaPayment(paymentReference, applicationId, {
        methodId: firstMethod?.id ?? null,
        amount: visaFeeAmount,
        currency: firstMethod?.currency ?? null,
        applicationFormFile: showAppFormUpload ? appFormFile : null,
        applicationForm2File: hasAppForm2Template ? appForm2File : null,
        healthDeclarationFormFile: healthDeclarationRequired ? healthDeclarationFile : null,
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
    setAppFormToggle({ show_app_form: false });
    setAppForm2File(null);
    setHealthDeclarationFile(null);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`w-full max-w-lg md:max-w-xl transform transition-all duration-300 ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-2xl bg-white text-sm shadow-2xl ring-1 ring-black/5">

          <div className="relative border-b border-slate-200 px-6 pb-4 pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                  <CreditCard className="h-6 w-6 text-blue-600" strokeWidth={2.5} />
                </div>
                <div>
                  <h5 className="text-lg font-bold text-gray-900">
                    Visa Application Fee Payment
                  </h5>
                </div>
              </div>

              <button
                onClick={handleClose}
                aria-label="Close dialog"
                className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <XCircle className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="max-h-[65vh] space-y-6 overflow-y-auto px-6 py-5">
            {firstMethod?.instructions && (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Payment Instructions
                </p>
                <RichTextDisplay html={firstMethod.instructions} />
              </div>
            )}

            {paymentError && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="text-xs text-red-700">{paymentError}</p>
              </div>
            )}

            <StatusFileUpload
              label="Upload Payment Receipt"
              description="Upload your proof of visa fee payment (bank transfer slip, receipt, etc.)"
              id="payment_reference"
              file={paymentReference}
              onFileChange={(file) => { setPaymentReference(file); setUploadError(""); }}
              onRemove={() => { setPaymentReference(null); setUploadError(""); }}
              onError={setFileError}
              disabled={isUploading || paymentLoading}
              required
            />

            {hasAppFormTemplate ? (
              <StatusFileUpload
                label="Upload Application Form"
                description="Your manager has provided a template. Download it, complete it, and upload the filled form here."
                id="app_form_document"
                file={appFormFile}
                onFileChange={setAppFormFile}
                onRemove={() => setAppFormFile(null)}
                onError={setFileError}
                disabled={isUploading}
                required
              />
            ) : (
              <>
                <SettingToggleInput
                  label="Upload Application Form (optional)"
                  field="show_app_form"
                  formData={appFormToggle}
                  updateFormData={(field: string, value: boolean) => {
                    setAppFormToggle((prev) => ({ ...prev, [field]: value }));
                    if (!value) setAppFormFile(null);
                  }}
                  errors={{}}
                />
                {appFormToggle.show_app_form && (
                  <StatusFileUpload
                    label="Upload Application Form"
                    description="Upload your completed application form document"
                    id="app_form_document"
                    file={appFormFile}
                    onFileChange={setAppFormFile}
                    onRemove={() => setAppFormFile(null)}
                    onError={setFileError}
                    disabled={isUploading}
                  />
                )}
              </>
            )}

            {hasAppForm2Template && (
              <StatusFileUpload
                label="Upload Application Form 2"
                description="Your manager has provided a second template. Download it, complete it, and upload the filled form here."
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
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={downloadHealthDeclarationForm}
                  disabled={downloadingHealthDeclarationForm}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {downloadingHealthDeclarationForm ? "Opening..." : "Download blank Health Declaration Form template"}
                </button>
                <StatusFileUpload
                  label="Upload Health Declaration Form"
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

            {fileError && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="text-xs text-red-700">{fileError}</p>
              </div>
            )}

            {uploadError && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="text-xs text-red-700">{uploadError}</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 px-6 py-4">
            <div className="flex justify-end gap-3">
              <Button
                onClick={handleClose}
                icon={<XCircle className="h-4 w-4" />}
                text="Cancel"
                bgColor="bg-white"
                textColor="text-gray-600"
                borderColor="border-gray-600"
                hoverTextColor="hover:text-gray-700"
                hoverBorderColor="hover:border-gray-700"
              />
              <Button
                disabled={
                  !paymentReference ||
                  !!fileError ||
                  !!uploadError ||
                  isUploading ||
                  paymentLoading ||
                  (hasAppFormTemplate && !appFormFile) ||
                  (hasAppForm2Template && !appForm2File) ||
                  (healthDeclarationRequired && !healthDeclarationFile)
                }
                onClick={handleConfirmUpload}
                icon={<CheckCircle className="h-4 w-4" />}
                text={isUploading ? "Submitting..." : paymentLoading ? "Loading..." : "Proceed to Payment"}
                bgColor="bg-blue-100"
                textColor="text-blue-700"
                borderColor="border-blue-600"
                hoverTextColor="hover:text-blue-700"
                hoverBorderColor="hover:border-blue-700"
                className="hover:bg-blue-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
