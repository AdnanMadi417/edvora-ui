"use client";

import Combobox from "components/ub/forms/Combobox";
import Input from "components/ub/forms/Input";
import FormModal from "components/ub/feedback/FormModal";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { XCircle, Clock, Trash2, AlertCircle, Pause, CheckCircle, ListX } from "lucide-react";
import { useToast } from "components/ub/feedback/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";

const UPDATE_STATUS_ERROR_MESSAGES: Record<string, string> = {
  health_declaration_template_not_configured: "Health Declaration template not configured — contact admin.",
};

import {
  useOfferLetterUpload,
  useVisaDocumentUpload,
  useVisaSetup,
  useStatusUpdate,
  useApplicationActions,
  useApplicationVisaFee,
} from "features/applications/hooks";
import { usePartnerBankAccount, BankAccountPayoutSummary } from "features/partners/bank-accounts";
import { usePaymentMethods } from "features/applications/payouts";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";

import CompactFileUpload from "components/ub/forms/CompactFileUpload";
import NoDocumentsRequired from "components/ub/feedback/NoDocumentsRequired";
import SettingToggleInput from "components/ub/forms/SettingToggleInput";

import IconButton from "components/ub/core/IconButton";
import Alert from "components/ub/feedback/Alert";
import Textarea from "components/ub/forms/Textarea";
import Checkbox from "components/ub/forms/Checkbox";
import Chip from "components/ub/data/Chip";
import { DocumentRequest, StatusOption, DocumentRequestListProps } from "features/applications/shared/types";

const DocumentRequestList = ({
  documents,
  setDocuments,
  documentTypes,
}: DocumentRequestListProps) => {

  const removeDocument = (id: string) => {
    if (documents.length > 1) {
      setDocuments(documents.filter((doc) => doc.id !== id));
    }
  };

  const updateDocument = (
    id: string,
    field: keyof DocumentRequest,
    value: any
  ) => {
    setDocuments(
      documents.map((doc) => (doc.id === id ? { ...doc, [field]: value } : doc))
    );
  };

  const toggleType = (docId: string, typeId: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;

    const newTypes = doc.type.includes(typeId)
      ? doc.type.filter((t) => t !== typeId)
      : [...doc.type, typeId];

    updateDocument(docId, "type", newTypes);
  };

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="relative space-y-3 rounded-ub-md border bg-ub-surface p-4"
        >
          {documents.length > 1 && (
            <IconButton
              onClick={() => removeDocument(doc.id)}
              aria-label="Remove document"
              variant="tertiary"
              size="sm"
              icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
              className="absolute end-2 top-2"
            />
          )}

          {documentTypes.length > 0 && <div>
            <label className="mb-2 block text-ub-body-md font-medium text-ub-text-primary">
              Document Type
            </label>

            {doc.type.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {doc.type.map((t) => {
                  const label = documentTypes.find((d) => d.id === t)?.label || t;
                  return (
                    <Chip key={t} size="sm" onRemove={() => toggleType(doc.id, t)} removeLabel={`Remove ${label}`}>
                      <span className="block max-w-[160px] truncate">{label}</span>
                    </Chip>
                  );
                })}
              </div>
            )}

            <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-ub-md border border-ub-border p-1.5">
              {documentTypes.map((d) => (
                <div key={d.id} className={`rounded-ub-md px-3 py-2 transition-colors ${doc.type.includes(d.id) ? "bg-ub-selected" : "hover:bg-ub-surface-subtle"}`}>
                  <Checkbox
                    checked={doc.type.includes(d.id)}
                    onChange={() => toggleType(doc.id, d.id)}
                    label={d.label}
                    description={d.description || undefined}
                  />
                </div>
              ))}
            </div>
          </div>}
        </div>
      ))}
    </div>
  );
};

interface UpdateStatusPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: string, reason: string) => void;
  application?: any;
}

export default function UpdateStatusPopup({
  isOpen,
  onClose,
  onConfirm,
  application,
}: UpdateStatusPopupProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [reason, setReason] = useState("");
  const [documents, setDocuments] = useState<DocumentRequest[]>([
    { id: "1", type: [] },
  ]);

  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [documentTypes, setDocumentTypes] = useState<
    { id: string; label: string; description?: string }[]
  >([]);
  const [error, setError] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();
  const selectedOption = statusOptions.find((opt) => opt.id === selectedStatus);

  const getStatusStyle = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("approve"))
      return {
        icon: CheckCircle,
        color: "text-ub-tone-success-text",
        bgColor: "bg-ub-tone-success-bg",
        borderColor: "border-ub-tone-success-border",
      };
    if (lower.includes("reject") || lower.includes("denied"))
      return {
        icon: XCircle,
        color: "text-ub-tone-danger-text",
        bgColor: "bg-ub-tone-danger-bg",
        borderColor: "border-ub-tone-danger-border",
      };
    if (lower.includes("review"))
      return {
        icon: Clock,
        color: "text-ub-tone-warning-text",
        bgColor: "bg-ub-tone-warning-bg",
        borderColor: "border-ub-tone-warning-border",
      };
    if (lower.includes("pending") || lower.includes("waiting"))
      return {
        icon: Pause,
        color: "text-ub-text-secondary",
        bgColor: "bg-ub-surface-subtle",
        borderColor: "border-ub-border",
      };
    if (lower.includes("correction"))
      return {
        icon: AlertCircle,
        color: "text-ub-tone-warning-text",
        bgColor: "bg-ub-tone-warning-bg",
        borderColor: "border-ub-tone-warning-border",
      };
    return {
      icon: Clock,
      color: "text-ub-text-link",
      bgColor: "bg-ub-tone-brand-bg",
      borderColor: "border-ub-tone-brand-border",
    };
  };

  const { actions } = useApplicationActions(application?.id);

  useEffect(() => {
    if (!actions) return;

    setDocumentTypes(
      (actions.document_types || []).map((d) => ({
        id: d.id,
        label: d.type,
        description: d.description,
      }))
    );

    const options: StatusOption[] = (actions.manager_allowed_next_statuses || []).map((s) => {
      const matchingAction = actions.available_actions?.find(
        (a) => a.status === s.name
      );

      return {
        id: s.id,
        label: s.name,
        description: "",
        nextAction: matchingAction?.next_action ?? "",
        ...getStatusStyle(s.name),
        requiresReason: !!s.is_requires_reason,
        requiresDocumentSelection: !!s.is_requires_document_selection,
      };
    });

    setStatusOptions(options);
  }, [actions]);

  const requiresReason = selectedOption?.requiresReason || false;
  const requiresDocuments = selectedOption?.requiresDocumentSelection || false;

  const isUniversityApproved = selectedOption?.label === "University Approved";
  const [offerLetterFile, setOfferLetterFile] = useState<File | null>(null);
  const [offerLetterVisaInvoiceFile, setOfferLetterVisaInvoiceFile] = useState<File | null>(null);
  const [offerLetterAppFormTemplateFile, setOfferLetterAppFormTemplateFile] = useState<File | null>(null);
  const [offerLetterAppForm2TemplateFile, setOfferLetterAppForm2TemplateFile] = useState<File | null>(null);
  const [offerLetterEnglishFormTemplateFile, setOfferLetterEnglishFormTemplateFile] = useState<File | null>(null);

  const isVisaSetupSelected = selectedOption?.label === "Visa Setup";

  const [visaDocumentFile, setVisaDocumentFile] = useState<File | null>(null);
  const isVisaIssued = selectedOption?.label === "Visa Issued";

  const [formData, setFormData] = useState({
    visa_fee_amount: "",
    show_visa_invoice: false,
    show_app_form_template: false,
    show_app_form_2_template: false,
    health_declaration_form_required: false,
    signed_offer_letter_required: false,
    show_english_form_template: false,
  });

  const [formErrors, setFormErrors] = useState<any>({});

  const isCommissionPaid = selectedOption?.label === "Commission Paid";

  const [payoutFormData, setPayoutFormData] = useState({
    payment_method_id: "",
    bank_reference: "",
    paid_at: "",
    currency: "RM",
    paid_amount: "",
  });
  const [payoutFormErrors, setPayoutFormErrors] = useState<any>({});
  const [payoutReceiptFile, setPayoutReceiptFile] = useState<File | null>(null);

  const updatePayoutFormData = (field: string, value: any) => {
    setPayoutFormData((prev) => ({ ...prev, [field]: value }));
    setPayoutFormErrors((prev: any) => ({ ...prev, [field]: undefined }));
  };

  const { account: partnerBankAccount } = usePartnerBankAccount(application?.partner?.id ?? "");
  const { paymentMethods } = usePaymentMethods();
  const paymentMethodOptions = paymentMethods.map((m) => ({ value: m.id, label: m.name }));

  const isCommissionReady = selectedOption?.label === "Commission Ready";

  const [payInFormData, setPayInFormData] = useState({
    payment_date: "",
    amount: "",
    currency: "RM",
    payment_reference: "",
  });
  const [payInFormErrors, setPayInFormErrors] = useState<any>({});

  const updatePayInFormData = (field: string, value: any) => {
    setPayInFormData((prev) => ({ ...prev, [field]: value }));
    setPayInFormErrors((prev: any) => ({ ...prev, [field]: undefined }));
  };

  const [arrivalFormTemplateFile, setArrivalFormTemplateFile] = useState<File | null>(null);

  const safeDocumentTypes = documentTypes ?? [];
  const shouldShowDocumentSection =
    requiresDocuments &&
    safeDocumentTypes.length > 0 &&
    !isUniversityApproved &&
    !isVisaIssued &&
    !isCommissionPaid;

  const selectedDocTypeIds = documents.flatMap((doc) => doc.type);
  const hasArrivalFormSelected =
    shouldShowDocumentSection &&
    selectedDocTypeIds.some((id) =>
      safeDocumentTypes.find((d) => d.id === id)?.label.toLowerCase().includes("arrival")
    );

  const { uploadOfferLetter } = useOfferLetterUpload();

  const handleOfferLetterUpload = async () => {
    if (!offerLetterFile || !isUniversityApproved) return;

    await uploadOfferLetter(offerLetterFile, application.id, {
      visaInvoiceFile: formData.show_visa_invoice ? (offerLetterVisaInvoiceFile ?? undefined) : undefined,
      applicationFormTemplateFile: formData.show_app_form_template ? (offerLetterAppFormTemplateFile ?? undefined) : undefined,
      applicationForm2TemplateFile: formData.show_app_form_2_template ? (offerLetterAppForm2TemplateFile ?? undefined) : undefined,
      healthDeclarationFormRequired: formData.health_declaration_form_required,
      signedOfferLetterRequired: formData.signed_offer_letter_required,
      englishFormTemplateFile: formData.show_english_form_template ? (offerLetterEnglishFormTemplateFile ?? undefined) : undefined,
    });
  };

  const { submitVisaFee } = useVisaSetup();
  const { visaFeeAmount } = useApplicationVisaFee(application?.id ?? "");

  const handleVisaSetup = async () => {
    if (!isVisaSetupSelected) return;

    const enteredAmount = Number(formData.visa_fee_amount);
    const finalAmount = enteredAmount > 0 ? enteredAmount : Number(visaFeeAmount ?? 0);
    await submitVisaFee(application.id, finalAmount);
  };

  const { uploadVisaDocument } = useVisaDocumentUpload();

  const handleVisaIssuedUpload = async () => {
    if (!visaDocumentFile || selectedOption?.label !== "Visa Issued") return;

    await uploadVisaDocument(visaDocumentFile, application.id);
  };

  const { updateStatus } = useStatusUpdate();

  const handleStatusUpdate = async () => {
    let arrivalFormTemplateFileKey: string | undefined;
    let arrivalFormTemplateFileUrl: string | undefined;

    if (arrivalFormTemplateFile) {
      const presigned = await getPresignedUploads([arrivalFormTemplateFile], "documents");
      const results = await uploadFilesToSpaces([arrivalFormTemplateFile], presigned);
      const uploaded = results?.[0];
      if (!uploaded?.file_key || !uploaded?.public_url) throw new Error("Arrival form template upload failed");
      arrivalFormTemplateFileKey = uploaded.file_key;
      arrivalFormTemplateFileUrl = uploaded.public_url;
    }

    let payoutReceiptFileKey: string | undefined;
    let payoutReceiptFileUrl: string | undefined;

    if (isCommissionPaid && payoutReceiptFile) {
      const presigned = await getPresignedUploads([payoutReceiptFile], "finance-payouts");
      const results = await uploadFilesToSpaces([payoutReceiptFile], presigned);
      const uploaded = results?.[0];
      if (!uploaded?.file_key || !uploaded?.public_url) throw new Error("Payout receipt upload failed");
      payoutReceiptFileKey = uploaded.file_key;
      payoutReceiptFileUrl = uploaded.public_url;
    }

    await updateStatus({
      applicationId: application.id,
      statusId: selectedStatus,
      reason,
      requiredDocumentTypeIds: shouldShowDocumentSection
        ? documents.flatMap((doc) => doc.type)
        : [],
      arrivalFormTemplateFileKey,
      arrivalFormTemplateFileUrl,
      payInDetails: isCommissionReady
        ? {
            paymentDate: payInFormData.payment_date,
            amount: payInFormData.amount,
            currency: payInFormData.currency,
            paymentReference: payInFormData.payment_reference,
          }
        : undefined,
      payoutDetails: isCommissionPaid
        ? {
            bankAccountId: partnerBankAccount?.id ?? "",
            paymentMethodId: payoutFormData.payment_method_id,
            bankReference: payoutFormData.bank_reference,
            paidAt: payoutFormData.paid_at,
            currency: payoutFormData.currency,
            paidAmount: payoutFormData.paid_amount,
            receiptFileKey: payoutReceiptFileKey,
            receiptFileUrl: payoutReceiptFileUrl,
          }
        : undefined,
    });
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => {
      const keys = field.split(".");
      const updated = { ...prev };
      let current: any = updated;

      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          current[key] = value;
        } else {
          current[key] = current[key] || {};
          current = current[key];
        }
      });

      return updated;
    });

    setFormErrors((prev: any) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const validateForm = () => {
    if (!selectedStatus) {
      setError("Please select a status");
      return false;
    }

    if (requiresReason && !reason.trim()) {
      setError("Reason is required for this status");
      return false;
    }

    if (requiresReason && reason.trim().length < 10) {
      setReasonError("Reason must be at least 10 characters");
      return false;
    }

    if (shouldShowDocumentSection && documents.some((doc) => doc.type.length === 0)) {
      setError("Please select at least one document type");
      return false;
    }

    if (isUniversityApproved && !offerLetterFile) {
      setError("Please upload the offer letter");
      return false;
    }


    if (selectedOption?.label === "Visa Issued" && !visaDocumentFile) {
      setError("Please upload the visa document");
      return false;
    }

    if (isCommissionPaid) {
      const errors: any = {};
      if (!partnerBankAccount) {
        setError("This advisor has no active bank account on file");
        return false;
      }
      if (!payoutFormData.payment_method_id.trim()) errors.payment_method_id = "Payment method is required";
      if (!payoutFormData.bank_reference.trim()) errors.bank_reference = "Bank reference is required";
      if (!payoutFormData.paid_at) errors.paid_at = "Payment date is required";
      if (!payoutFormData.paid_amount || Number(payoutFormData.paid_amount) <= 0) {
        errors.paid_amount = "Enter a valid amount";
      }
      if (!payoutReceiptFile) {
        setError("Please upload the payout receipt");
        return false;
      }
      if (Object.keys(errors).length > 0) {
        setPayoutFormErrors(errors);
        setError("Please fill in the payout details");
        return false;
      }
    }

    if (isCommissionReady) {
      const errors: any = {};
      if (!payInFormData.payment_date) errors.payment_date = "Payment date is required";
      if (!payInFormData.amount || Number(payInFormData.amount) <= 0) {
        errors.amount = "Enter a valid amount";
      }
      if (!payInFormData.payment_reference.trim()) {
        errors.payment_reference = "Payment reference is required";
      }
      if (Object.keys(errors).length > 0) {
        setPayInFormErrors(errors);
        setError("Please fill in the pay-in details");
        return false;
      }
    }

    setError("");
    return true;
  };


  const handleConfirm = async () => {
    if (!validateForm() || !application?.id) return;

    setIsSubmitting(true);

    try {
      if (isVisaIssued) {
        if (!visaDocumentFile) {
          setError(
            "You must upload the visa document before setting status to Visa Issued."
          );
          showToast(
            "You must upload the visa document before setting status to Visa Issued.",
            "error"
          );
          setIsSubmitting(false);
          return;
        }

        await handleVisaIssuedUpload();
        await handleStatusUpdate();
      } else if (isUniversityApproved) {
        if (!offerLetterFile) {
          setError(
            "You must upload the offer letter before setting status to University Approved."
          );
          showToast(
            "You must upload the offer letter before setting status to University Approved.",
            "error"
          );
          setIsSubmitting(false);
          return;
        }

        await handleOfferLetterUpload();
        await handleStatusUpdate();
      } else if (isVisaSetupSelected) {
        await handleStatusUpdate();
        await handleVisaSetup();
        if (offerLetterFile) await handleOfferLetterUpload();
        if (visaDocumentFile) await handleVisaIssuedUpload();
      } else {
        await handleStatusUpdate();

        if (offerLetterFile) await handleOfferLetterUpload();
        if (visaDocumentFile) await handleVisaIssuedUpload();
      }

      onConfirm(selectedStatus, reason);
      handleClose();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      const msg = (code && UPDATE_STATUS_ERROR_MESSAGES[code]) || parseApiError(err, "Failed to update application");
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedStatus("");
    setReason("");
    setDocuments([{ id: "1", type: [] }]);
    setError("");
    setArrivalFormTemplateFile(null);
    setOfferLetterVisaInvoiceFile(null);
    setOfferLetterAppFormTemplateFile(null);
    setOfferLetterAppForm2TemplateFile(null);
    setOfferLetterEnglishFormTemplateFile(null);
    setFormData({
      visa_fee_amount: "",
      show_visa_invoice: false,
      show_app_form_template: false,
      show_app_form_2_template: false,
      health_declaration_form_required: false,
      signed_offer_letter_required: false,
      show_english_form_template: false,
    });
    setPayInFormData({ payment_date: "", amount: "", currency: "RM", payment_reference: "" });
    setPayInFormErrors({});
    setPayoutFormData({ payment_method_id: "", bank_reference: "", paid_at: "", currency: "RM", paid_amount: "" });
    setPayoutFormErrors({});
    setPayoutReceiptFile(null);
    onClose();
  };


  return (
    <FormModal
      open={isOpen}
      onClose={handleClose}
      size="lg"
      icon={Clock}
      title="Update Application Status"
      description={`Stage: ${application?.stage?.name || "No Stage"}   ·   Status: ${application?.stage?.statuses?.[0]?.name || "No Status"}`}
      onSubmit={handleConfirm}
      submitLabel="Update Status"
      submitting={isSubmitting}
      submitDisabled={!selectedStatus || !!error || (requiresReason && !reason.trim()) || (isUniversityApproved && !offerLetterFile) || (isVisaIssued && !visaDocumentFile) || (isCommissionPaid &&
                (!partnerBankAccount || !payoutFormData.payment_method_id.trim() || !payoutFormData.bank_reference.trim() || !payoutFormData.paid_at || !payoutFormData.paid_amount || !payoutReceiptFile)) || (hasArrivalFormSelected && !arrivalFormTemplateFile) || (isCommissionReady &&
                (!payInFormData.payment_date || !payInFormData.amount || !payInFormData.payment_reference.trim()))}
    >
      <div className="grid gap-4">

        <div className="space-y-6">
          {error && (
            <Alert tone="danger" title="Error">
              <span className="whitespace-pre-wrap">{error}</span>
            </Alert>
          )}

          {actions?.correction_reason && (
            <Alert tone="warning" title="Correction Reason">{actions.correction_reason}</Alert>
          )}

          <div className="space-y-3">
            <label className="block text-ub-body-md font-semibold text-ub-text-primary">
              <span className="flex items-center gap-1">
                Select New Status
                <span className="text-ub-tone-danger-text">*</span>
              </span>
            </label>

            {statusOptions.length === 0 ? (
              <NoDocumentsRequired
                title="No status"
                subtitle="There are no status options available at the moment."
                icon={<ListX className="h-10 w-10 text-ub-text-tertiary" />}
              />
            ) : (
              statusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedStatus === option.id;

                const currentStatusId = application?.stage?.statuses?.[0]?.id;
                const prevStatusId = application?.stage?.statuses?.[1]?.id;

                const isDisabled =
                  option.id === currentStatusId || option.id === prevStatusId;

                return (
                  <div
                    key={option.id}
                    title={isDisabled ? "You cannot select this option." : ""}
                    onClick={() => !isDisabled && setSelectedStatus(option.id)}
                    className={`rounded-ub-md border p-4 transition-all
    ${
      isDisabled
        ? "cursor-not-allowed border-ub-border bg-ub-surface-subtle text-ub-text-tertiary opacity-60"
        : isSelected
        ? `${option.borderColor} ${option.bgColor} cursor-pointer shadow`
        : "cursor-pointer border-ub-border bg-ub-surface hover:border-ub-border hover:shadow"
    }
  `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-5 w-5 ${
                          isSelected
                            ? option.color
                            : isDisabled
                            ? "text-ub-text-tertiary"
                            : "text-ub-text-tertiary"
                        }`}
                      />
                      <div>
                        <p className="font-semibold text-ub-text-primary">
                          {option.label}
                        </p>
                        {option.nextAction && (
                          <p className="mt-1 text-ub-caption text-ub-text-tertiary">
                            <span className="font-medium">Next :</span>{" "}
                            {option.nextAction}
                          </p>
                        )}
                        {option.description && (
                          <p className="mt-0.5 text-ub-caption text-ub-text-tertiary">
                            {option.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {shouldShowDocumentSection && (
            <DocumentRequestList
              documents={documents}
              setDocuments={setDocuments}
              documentTypes={safeDocumentTypes}
            />
          )}

          {isUniversityApproved && (
            <>
              <CompactFileUpload
                label="Upload Offer Letter"
                description="Upload the official offer letter issued by the university"
                id="offer-letter"
                file={offerLetterFile}
                onFileChange={setOfferLetterFile}
                onRemove={() => setOfferLetterFile(null)}
                onError={setError}
                disabled={isSubmitting}
                required
              />
              <SettingToggleInput
                label="Attach Visa Invoice (optional)"
                field="show_visa_invoice"
                formData={formData}
                updateFormData={(field, value) => {
                  updateFormData(field, value);
                  if (!value) setOfferLetterVisaInvoiceFile(null);
                }}
                errors={formErrors}
              />
              {formData.show_visa_invoice && (
                <CompactFileUpload
                  label="Upload Visa Invoice"
                  description="Upload the visa invoice to attach with the offer letter"
                  id="offer-letter-visa-invoice"
                  file={offerLetterVisaInvoiceFile}
                  onFileChange={setOfferLetterVisaInvoiceFile}
                  onRemove={() => setOfferLetterVisaInvoiceFile(null)}
                  onError={setError}
                  disabled={isSubmitting}
                />
              )}
              <SettingToggleInput
                label="Attach Application Form Template (optional)"
                field="show_app_form_template"
                formData={formData}
                updateFormData={(field, value) => {
                  updateFormData(field, value);
                  if (!value) setOfferLetterAppFormTemplateFile(null);
                }}
                errors={formErrors}
              />
              {formData.show_app_form_template && (
                <CompactFileUpload
                  label="Upload Application Form Template"
                  description="Upload the application form template for the student"
                  id="offer-letter-app-form-template"
                  file={offerLetterAppFormTemplateFile}
                  onFileChange={setOfferLetterAppFormTemplateFile}
                  onRemove={() => setOfferLetterAppFormTemplateFile(null)}
                  onError={setError}
                  disabled={isSubmitting}
                />
              )}
              <SettingToggleInput
                label="Attach Application Form 2 Template (optional)"
                field="show_app_form_2_template"
                formData={formData}
                updateFormData={(field, value) => {
                  updateFormData(field, value);
                  if (!value) setOfferLetterAppForm2TemplateFile(null);
                }}
                errors={formErrors}
              />
              {formData.show_app_form_2_template && (
                <CompactFileUpload
                  label="Upload Application Form 2 Template"
                  description="Upload the second application form template for the student"
                  id="offer-letter-app-form-2-template"
                  file={offerLetterAppForm2TemplateFile}
                  onFileChange={setOfferLetterAppForm2TemplateFile}
                  onRemove={() => setOfferLetterAppForm2TemplateFile(null)}
                  onError={setError}
                  disabled={isSubmitting}
                />
              )}
              <SettingToggleInput
                label="Health Declaration Form Required"
                field="health_declaration_form_required"
                formData={formData}
                updateFormData={updateFormData}
                errors={formErrors}
              />
              <SettingToggleInput
                label="Signed Offer Letter Required"
                field="signed_offer_letter_required"
                formData={formData}
                updateFormData={updateFormData}
                errors={formErrors}
              />
              <SettingToggleInput
                label="Attach English Form Template (optional)"
                field="show_english_form_template"
                formData={formData}
                updateFormData={(field, value) => {
                  updateFormData(field, value);
                  if (!value) setOfferLetterEnglishFormTemplateFile(null);
                }}
                errors={formErrors}
              />
              {formData.show_english_form_template && (
                <CompactFileUpload
                  label="Upload English Form Template"
                  description="Upload the blank English proficiency form template for the student"
                  id="offer-letter-english-form-template"
                  file={offerLetterEnglishFormTemplateFile}
                  onFileChange={setOfferLetterEnglishFormTemplateFile}
                  onRemove={() => setOfferLetterEnglishFormTemplateFile(null)}
                  onError={setError}
                  disabled={isSubmitting}
                />
              )}
            </>
          )}

          {requiresReason && (
            <Textarea
              label="Reason"
              placeholder="Please provide a detailed reason..."
              value={reason}
              error={reasonError || undefined}
              onChange={(value) => {
                setReason(value);
                if (reasonError) setReasonError("");
              }}
              onBlur={() => {
                const trimmed = reason.trim();
                if (trimmed && trimmed.length < 10) setReasonError("Reason must be at least 10 characters");
              }}
            />
          )}

          {isVisaSetupSelected && (
            <div className="space-y-2">
              <Input label="Visa Fee Amount" placeholder="Enter visa fee amount" type="number" value={String(formData.visa_fee_amount ?? "")} onChange={(v) => updateFormData("visa_fee_amount", v)} error={formErrors.visa_fee_amount || undefined} required />
              {visaFeeAmount && (
                <div className="flex items-center gap-2 rounded-ub-md border border-ub-tone-brand-border bg-ub-tone-brand-bg px-3 py-2 text-ub-caption text-ub-text-link">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    Default visa fee is <strong>{visaFeeAmount}</strong>. You can enter a different amount if needed.
                  </span>
                </div>
              )}
            </div>
          )}

          {isVisaIssued && (
            <CompactFileUpload
              label="Upload Visa Document"
              description="Upload the visa document issued by the immigration authority"
              id="visa-document"
              file={visaDocumentFile}
              onFileChange={setVisaDocumentFile}
              onRemove={() => setVisaDocumentFile(null)}
              onError={setError}
              disabled={isSubmitting}
              required
            />
          )}

          {isCommissionPaid && (
            <div className="space-y-2">
              <p className="text-ub-body-md font-semibold text-ub-text-primary">Payout Details</p>

              <div className="rounded-ub-md border border-ub-border bg-ub-surface p-3 text-ub-body-sm text-ub-text-secondary">
                <BankAccountPayoutSummary account={partnerBankAccount} />
                {!partnerBankAccount && application?.partner?.id && (
                  <Link
                    href={`/admin/advisors/${application.partner.id}?tab=bank-account`}
                    className="mt-1 block font-medium text-ub-text-link hover:text-ub-text-link"
                  >
                    Add a bank account →
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <Combobox label="Payment Method" placeholder="Search for a payment method..." options={paymentMethodOptions} value={payoutFormData.payment_method_id ? String(payoutFormData.payment_method_id) : null} onChange={(v) => updatePayoutFormData("payment_method_id", v ?? "")} error={payoutFormErrors.payment_method_id || undefined} />
                <Input label="Bank Reference" placeholder="e.g. BANK-REF-001" value={String(payoutFormData.bank_reference ?? "")} onChange={(v) => updatePayoutFormData("bank_reference", v)} error={payoutFormErrors.bank_reference || undefined} />
                <Input label="Payment Date" type="date" value={String(payoutFormData.paid_at ?? "")} onChange={(v) => updatePayoutFormData("paid_at", v)} error={payoutFormErrors.paid_at || undefined} />
                <Combobox label="Currency" options={[
                    { value: "RM", label: "RM" },
                    { value: "USD", label: "USD" },
                  ]} value={payoutFormData.currency ? String(payoutFormData.currency) : null} onChange={(v) => updatePayoutFormData("currency", v ?? "")} error={payoutFormErrors.currency || undefined} />
                <Input label="Paid Amount" placeholder="Enter amount" type="number" value={String(payoutFormData.paid_amount ?? "")} onChange={(v) => updatePayoutFormData("paid_amount", v)} error={payoutFormErrors.paid_amount || undefined} />
              </div>

              <CompactFileUpload
                label="Upload Payout Receipt"
                description="Upload proof of payment (receipt or transfer confirmation)"
                id="payout-receipt"
                file={payoutReceiptFile}
                onFileChange={setPayoutReceiptFile}
                onRemove={() => setPayoutReceiptFile(null)}
                onError={setError}
                disabled={isSubmitting}
                required
              />
            </div>
          )}

          {isCommissionReady && (
            <div className="space-y-2">
              <p className="text-ub-body-md font-semibold text-ub-text-primary">Pay-In Details</p>
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <Input label="Payment Date" type="date" value={String(payInFormData.payment_date ?? "")} onChange={(v) => updatePayInFormData("payment_date", v)} error={payInFormErrors.payment_date || undefined} />
                <Input label="Amount" placeholder="Enter amount" type="number" value={String(payInFormData.amount ?? "")} onChange={(v) => updatePayInFormData("amount", v)} error={payInFormErrors.amount || undefined} />
                <Combobox label="Currency" options={[
                    { value: "RM", label: "RM" },
                    { value: "USD", label: "USD" },
                  ]} value={payInFormData.currency ? String(payInFormData.currency) : null} onChange={(v) => updatePayInFormData("currency", v ?? "")} error={payInFormErrors.currency || undefined} />
                <Input label="Payment Reference" placeholder="e.g. UNI-REF-001" value={String(payInFormData.payment_reference ?? "")} onChange={(v) => updatePayInFormData("payment_reference", v)} error={payInFormErrors.payment_reference || undefined} />
              </div>
            </div>
          )}

          {hasArrivalFormSelected && (
            <CompactFileUpload
              label="Upload Arrival Form Template"
              description="Upload a template for the student to complete their arrival form"
              id="arrival-form-template"
              file={arrivalFormTemplateFile}
              onFileChange={setArrivalFormTemplateFile}
              onRemove={() => setArrivalFormTemplateFile(null)}
              onError={setError}
              disabled={isSubmitting}
              required
            />
          )}
        </div>
      </div>
    </FormModal>
  );
}
