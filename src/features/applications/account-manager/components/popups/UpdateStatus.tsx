"use client";

import RadioCardGroup from "components/ub/forms/choices/RadioCardGroup";
import { FieldLabel } from "components/ub/forms/layout/FieldChrome";
import Input from "components/ub/forms/text/Input";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import React, { useState, useEffect } from "react";
import { XCircle, Clock, Trash2, AlertCircle, Pause, CheckCircle, ListX } from "lucide-react";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";

const UPDATE_STATUS_ERROR_MESSAGES: Record<string, string> = {
  health_declaration_template_not_configured: "Health Declaration template not configured — contact admin.",
};

import {
  useOfferLetterUpload,
  useVisaDocumentUpload,
  useVisaSetup,
  useStatusUpdate,
  useCommissionPaymentUpload,
  useApplicationActions,
  useApplicationVisaFee,
} from "features/applications/hooks";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";

import NoDocumentsRequired from "components/ub/feedback/states/NoDocumentsRequired";
import DocumentUpload from "components/ub/forms/uploads/DocumentUpload";
import SettingToggleInput from "components/ub/forms/choices/SettingToggleInput";
import IconButton from "components/ub/core/buttons/IconButton";
import Alert from "components/ub/feedback/notifications/Alert";
import Textarea from "components/ub/forms/text/Textarea";
import Checkbox from "components/ub/forms/choices/Checkbox";
import Chip from "components/ub/data/badges/Chip";
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
            <FieldLabel as="span">
              Document type
            </FieldLabel>

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

  const getStatusIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("approve"))
      return {
        icon: CheckCircle,
      };
    if (lower.includes("reject") || lower.includes("denied"))
      return {
        icon: XCircle,
      };
    if (lower.includes("review"))
      return {
        icon: Clock,
      };
    if (lower.includes("pending") || lower.includes("waiting"))
      return {
        icon: Pause,
      };
    if (lower.includes("correction"))
      return {
        icon: AlertCircle,
      };
    return {
      icon: Clock,
    };
  };

  const { actions } = useApplicationActions(application?.id);
  const { visaFeeAmount } = useApplicationVisaFee(application?.id);

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
        ...getStatusIcon(s.name),
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

  const [commissionPaymentFile, setCommissionPaymentFile] =
    useState<File | null>(null);

  const isCommissionPaid = selectedOption?.label === "Commission Paid";

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

  const handleVisaSetup = async () => {
    if (!isVisaSetupSelected) return;

    const enteredAmount = Number(formData.visa_fee_amount);
    const finalAmount = enteredAmount > 0 ? enteredAmount : Number(visaFeeAmount || 0);
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

    await updateStatus({
      applicationId: application.id,
      statusId: selectedStatus,
      reason,
      requiredDocumentTypeIds: shouldShowDocumentSection
        ? documents.flatMap((doc) => doc.type)
        : [],
      arrivalFormTemplateFileKey,
      arrivalFormTemplateFileUrl,
    });
  };

  const { uploadCommissionPayment, } =
    useCommissionPaymentUpload();



  const handleCommissionPaymentUpload = async () => {
    if (!commissionPaymentFile || !application?.id) return;

    await uploadCommissionPayment(
      commissionPaymentFile,
      application.id
    );
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

    if (
      shouldShowDocumentSection &&
      documents.some((doc) => doc.type.length === 0)
    ) {
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

    if (isCommissionPaid && !commissionPaymentFile) {
      setError("Please upload commission payment proof");
      return false;
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
      } else if (isCommissionPaid) {
        if (!commissionPaymentFile) {
          setError("Please upload commission payment proof");
          showToast("Commission payment proof is required.", "error");
          setIsSubmitting(false);
          return;
        }

        await handleCommissionPaymentUpload();
        await handleStatusUpdate();
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
    onClose();
  };


  return (
    <FormModal
      open={isOpen}
      onClose={handleClose}
      size="lg"
      icon={Clock}
      title="Update application status"
      description={`Stage: ${application?.stage?.name || "No Stage"}   ·   Status: ${application?.stage?.statuses?.[0]?.name || "No Status"}`}
      onSubmit={handleConfirm}
      submitLabel="Update status"
      submitting={isSubmitting}
      submitDisabled={!selectedStatus || !!error || (requiresReason && !reason.trim()) || (isUniversityApproved && !offerLetterFile) || (isVisaIssued && !visaDocumentFile) || (isCommissionPaid && !commissionPaymentFile) || (hasArrivalFormSelected && !arrivalFormTemplateFile)}
    >
      <div className="grid gap-4">

        <div className="space-y-6">
          {error && (
            <Alert tone="danger" title="Error">
              <span className="whitespace-pre-wrap">{error}</span>
            </Alert>
          )}

          {actions?.correction_reason && (
            <Alert tone="warning" title="Correction reason">{actions.correction_reason}</Alert>
          )}

          <div className="space-y-3">
            <FieldLabel as="span">
              <span className="flex items-center gap-1">
                Select new status
              </span>
            </FieldLabel>

            {statusOptions.length === 0 ? (
              <NoDocumentsRequired
                title="No status"
                subtitle="There are no status options available at the moment."
                icon={<ListX className="h-10 w-10 text-ub-text-tertiary" />}
              />
            ) : (
              <RadioCardGroup
                ariaLabel="Select New Status"
                layout="vertical"
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={statusOptions.map((option) => ({
                  value: option.id,
                  label: option.label,
                  icon: option.icon,
                  hint: option.nextAction ? <>Next : {option.nextAction}</> : null,
                  description: option.description,
                  disabled: option.id === application?.stage?.statuses?.[0]?.id || option.id === application?.stage?.statuses?.[1]?.id,
                  disabledReason: "You cannot select this option.",
                }))}
              />
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
              <DocumentUpload
                label="Upload offer letter"
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
                <DocumentUpload
                  label="Upload visa invoice"
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
                <DocumentUpload
                  label="Upload application form template"
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
                <DocumentUpload
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
                label="Health declaration form required"
                field="health_declaration_form_required"
                formData={formData}
                updateFormData={updateFormData}
                errors={formErrors}
              />
              <SettingToggleInput
                label="Signed offer letter required"
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
                <DocumentUpload
                  label="Upload English form template"
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
              <Input label="Visa fee amount" placeholder="Enter visa fee amount" type="number" value={String(formData.visa_fee_amount ?? "")} onChange={(v) => updateFormData("visa_fee_amount", v)} error={formErrors.visa_fee_amount || undefined} />
              {visaFeeAmount && (
                <Alert>
                  <span>
                    Default visa fee is <strong>{visaFeeAmount}</strong>. You can enter a different amount if needed.
                  </span>
                </Alert>
              )}
            </div>
          )}

          {isVisaIssued && (
            <DocumentUpload
              label="Upload visa document"
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
            <DocumentUpload
              label="Upload commission payment proof"
              description="Upload proof of commission payment (receipt or transfer confirmation)"
              id="commission-payment"
              file={commissionPaymentFile}
              onFileChange={setCommissionPaymentFile}
              onRemove={() => setCommissionPaymentFile(null)}
              onError={setError}
              disabled={isSubmitting}
              required
            />
          )}

          {hasArrivalFormSelected && (
            <DocumentUpload
              label="Upload arrival form template"
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
