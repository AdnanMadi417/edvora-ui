"use client";

import React, { useState, useEffect } from "react";
import {
  XCircle,
  Clock,
  Trash2,
  AlertCircle,
  Pause,
  CheckCircle,
} from "lucide-react";
import { useToast } from "components/context/ToastContext";

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

import NoDocumentsRequired from "components/emptyData/NoDocumentsRequired";
import StatusFileUpload from "components/form/upload/StatusFileUpload";
import SettingToggleInput from "components/form/toggle/SettingToggleInput";
import { InputField } from "components/form";
import Button from "components/ui/buttons/Button";
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
          className="relative space-y-3 rounded-md border bg-card p-4"
        >
          {documents.length > 1 && (
            <button
              onClick={() => removeDocument(doc.id)}
              className="absolute right-2 top-2 rounded-md p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Remove document"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}

          {documentTypes.length > 0 && <div>
            <label className="mb-2 block text-p2 font-medium text-gray-900">
              Document Type
            </label>

            {doc.type.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {doc.type.map((t) => {
                  const label = documentTypes.find((d) => d.id === t)?.label || t;
                  return (
                    <span
                      key={t}
                      className="flex max-w-[160px] items-center gap-1 rounded-full bg-blue-100 py-0.5 pl-2.5 pr-1.5 text-xs font-medium text-blue-700"
                    >
                      <span className="truncate">{label}</span>
                      <button
                        type="button"
                        onClick={() => toggleType(doc.id, t)}
                        className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-blue-600 hover:bg-blue-300"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-lg border border-gray-200 p-1.5">
              {documentTypes.map((d) => (
                <label
                  key={d.id}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-md px-3 py-2 transition-colors ${
                    doc.type.includes(d.id)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={doc.type.includes(d.id)}
                    onChange={() => toggleType(doc.id, d.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="min-w-0 ">
                    <span className="block truncate text-sm font-medium text-slate-800">{d.label}</span>
                    {d.description && (
                      <span className="block text-xs text-slate-400">{d.description}</span>
                    )}
                  </div>
                </label>
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
  onConfirm: (status: string, reason: string, notes: string) => void;
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
  const [notes, setNotes] = useState("");
  const [documents, setDocuments] = useState<DocumentRequest[]>([
    { id: "1", type: [], reason: "" },
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
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      };
    if (lower.includes("reject") || lower.includes("denied"))
      return {
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      };
    if (lower.includes("review"))
      return {
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      };
    if (lower.includes("pending") || lower.includes("waiting"))
      return {
        icon: Pause,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
      };
    if (lower.includes("correction"))
      return {
        icon: AlertCircle,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
      };
    return {
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
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

  const isVisaSetupSelected = selectedOption?.label === "Visa Setup";

  const [visaDocumentFile, setVisaDocumentFile] = useState<File | null>(null);
  const isVisaIssued = selectedOption?.label === "Visa Issued";

  const [formData, setFormData] = useState({
    visa_fee_amount: "",
    show_visa_invoice: false,
    show_app_form_template: false,
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
      notes,
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

      onConfirm(selectedStatus, reason, notes);
      handleClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update application";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedStatus("");
    setReason("");
    setNotes("");
    setDocuments([{ id: "1", type: [], reason: "" }]);
    setError("");
    setArrivalFormTemplateFile(null);
    setOfferLetterVisaInvoiceFile(null);
    setOfferLetterAppFormTemplateFile(null);
    setFormData({ visa_fee_amount: "", show_visa_invoice: false, show_app_form_template: false });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl transform rounded-md bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b border-slate-200 px-6 pb-4 pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <Clock className="h-6 w-6 text-blue-600" strokeWidth={2.5} />
              </div>
              <div>
                <h5 className="text-lg font-bold text-gray-900">
                  Update Application Status
                </h5>

                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Stage:</span>
                  <span className="font-normal">
                    {application?.stage?.name || "No Stage"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-caption text-slate-500">
                  <AlertCircle className="h-4 w-4 " />
                  <span className="font-medium">Status:</span>
                  <span className="font-normal">
                    {application?.stage?.statuses?.[0]?.name || "No Status"}
                  </span>
                </div>
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

        <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">
          {error && (
            <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Error</p>
                <pre className="mt-1 whitespace-pre-wrap font-mono text-xs text-red-700">
                  {error}
                </pre>
              </div>
            </div>
          )}

          {actions?.correction_reason && (
            <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div>
                <p className="text-xs font-semibold text-amber-700">Correction Reason</p>
                <p className="mt-0.5 text-xs text-amber-800">{actions.correction_reason}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-p2 font-semibold text-gray-900">
              <span className="flex items-center gap-1">
                Select New Status
                <span className="text-red-500">*</span>
              </span>
            </label>

            {statusOptions === null ? (
              <p className="py-4 text-sm text-gray-500">
                Loading status options...
              </p>
            ) : statusOptions.length === 0 ? (
              <NoDocumentsRequired
                title="No status"
                subtitle="There are no status options available at the moment."
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
                    className={`rounded-md border p-4 transition-all
    ${
      isDisabled
        ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400 opacity-60"
        : isSelected
        ? `${option.borderColor} ${option.bgColor} cursor-pointer shadow`
        : "cursor-pointer border-slate-200 bg-card hover:border-gray-300 hover:shadow"
    }
  `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-5 w-5 ${
                          isSelected
                            ? option.color
                            : isDisabled
                            ? "text-gray-400"
                            : "text-gray-400"
                        }`}
                      />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {option.label}
                        </p>
                        {option.nextAction && (
                          <p className="mt-1 text-xs text-slate-500">
                            <span className="font-medium">Next :</span>{" "}
                            {option.nextAction}
                          </p>
                        )}
                        {option.description && (
                          <p className="mt-0.5 text-xs text-slate-500">
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
              <StatusFileUpload
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
                <StatusFileUpload
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
                <StatusFileUpload
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
            </>
          )}

          {requiresReason && (
            <div className="space-y-2">
              <label className="block text-p2 font-medium text-slate-500">
                Reason <span className="ml-1 text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => { setReason(e.target.value); if (reasonError) setReasonError(""); }}
                onBlur={() => {
                  const trimmed = reason.trim();
                  if (trimmed && trimmed.length < 10)
                    setReasonError("Reason must be at least 10 characters");
                }}
                placeholder="Please provide a detailed reason..."
                rows={4}
                className={`w-full rounded-md border px-4 py-3 text-p2 outline-none transition-colors resize-y placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${reasonError ? "border-red-500 bg-red-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
              />
              {reasonError && <p className="mt-1 text-xs text-red-600">{reasonError}</p>}
            </div>
          )}

          {isVisaSetupSelected && (
            <div className="space-y-2">
              <InputField
                label="Visa Fee Amount"
                field="visa_fee_amount"
                type="number"
                placeholder="Enter visa fee amount"
                required={false}
                formData={formData}
                errors={formErrors}
                updateFormData={updateFormData}
              />
              {visaFeeAmount && (
                <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    Default visa fee is <strong>{visaFeeAmount}</strong>. You can enter a different amount if needed.
                  </span>
                </div>
              )}
            </div>
          )}

          {isVisaIssued && (
            <StatusFileUpload
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
            <StatusFileUpload
              label="Upload Commission Payment Proof"
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
            <StatusFileUpload
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

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            icon={<XCircle className="h-4 w-4" />}
            text="Cancel"
            bgColor="bg-white"
            textColor="text-gray-600"
            borderColor="border-gray-600"
            hoverTextColor="hover:text-gray-700"
            hoverBorderColor="hover:border-gray-700"
          />
          <Button
            onClick={handleConfirm}
            disabled={
              !selectedStatus ||
              isSubmitting ||
              !!error ||
              (requiresReason && !reason.trim()) ||
              (isUniversityApproved && !offerLetterFile) ||
              (isVisaIssued && !visaDocumentFile) ||
              (isCommissionPaid && !commissionPaymentFile) ||
              (hasArrivalFormSelected && !arrivalFormTemplateFile)
            }
            icon={<CheckCircle className="h-4 w-4" />}
            text={isSubmitting ? "Updating..." : "Update Status"}
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
  );
}
