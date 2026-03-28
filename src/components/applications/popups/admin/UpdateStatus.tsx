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
import { useToast } from "../../../context/ToastContext";

import { useOfferLetterUpload } from "hooks/applications/files/useOfferLetterUpload";
import { useVisaDocumentUpload } from "hooks/applications/files/useVisaDocumentUpload";
import { useVisaSetup } from "hooks/applications/useVisaSetup";
import { useStatusUpdate } from "hooks/applications/useStatusUpdate";
import { useApplicationActions } from "hooks/applications/stages/useApplicationActions";
import { useCommissionPaymentUpload } from 'hooks/applications/files/useCommissionPaymentUpload';
import { useVisaCase } from 'hooks/useDefaultVisaCase';

import StatusFileUpload from "components/form/filesUpload/StatusFileUpload";
import NoDocumentsRequired from "components/emptyData/NoDocumentsRequired";

import { InputField } from "components/form";
import { DocumentRequest, StatusOption, DocumentRequestListProps } from "components/applications/popups/utility-functions/types";

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
      {documents.map((doc, index) => (
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

          <div>
            <label className="mb-2 block text-p2 font-medium text-gray-900">
              Document Type
            </label>

            <div className="mb-2 flex flex-wrap gap-2">
              {doc.type.map((t) => {
                const label = documentTypes.find((d) => d.id === t)?.label || t;
                return (
                  <span
                    key={t}
                    className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-sm text-blue-700"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => toggleType(doc.id, t)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-2 p-2">
              {documentTypes.map((d) => (
                <label
                  key={d.id}
                  className="flex cursor-pointer items-center gap-2 text-p2"
                >
                  <input
                    type="checkbox"
                    checked={doc.type.includes(d.id)}
                    onChange={() => toggleType(doc.id, d.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>
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
    { id: string; label: string }[]
  >([]);
  const [error, setError] = useState("");
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

  const { actions, loading } = useApplicationActions(application?.id);
  const { amount } = useVisaCase();
  
  useEffect(() => {
    if (!actions) return;

    setDocumentTypes(
      (actions.document_types || []).map((d) => ({
        id: d.id,
        label: d.description || d.type,
      }))
    );

    const options: StatusOption[] = (actions.stage_statuses || []).map((s) => {
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

  const isVisaSetupSelected = selectedOption?.label === "Visa Setup";

  const [visaDocumentFile, setVisaDocumentFile] = useState<File | null>(null);
  const isVisaIssued = selectedOption?.label === "Visa Issued";

  const [formData, setFormData] = useState({
    visa_fee_amount: "",
  });

  const [formErrors, setFormErrors] = useState<any>({});

  const [commissionPaymentFile, setCommissionPaymentFile] =
    useState<File | null>(null);

  const isCommissionPaid = selectedOption?.label === "Commission Paid";

  const { uploadOfferLetter, isUploading } = useOfferLetterUpload();

  const handleOfferLetterUpload = async () => {
    if (!offerLetterFile || !isUniversityApproved) return;

    await uploadOfferLetter(offerLetterFile, application.id);
  };

  const { submitVisaFee, isSubmitting: isVisaSubmitting } = useVisaSetup();

  const handleVisaSetup = async () => {
    if (!isVisaSetupSelected) return;

    const enteredAmount = Number(formData.visa_fee_amount);
    const finalAmount = enteredAmount > 0 ? enteredAmount : Number(amount?.amount ?? 0);
    await submitVisaFee(application.id, finalAmount);
  };

  const { uploadVisaDocument, isUploading: isVisaUploading } = useVisaDocumentUpload();

  const handleVisaIssuedUpload = async () => {
    if (!visaDocumentFile || selectedOption?.label !== "Visa Issued") return;

    await uploadVisaDocument(visaDocumentFile, application.id);
  };

  const { updateStatus, isUpdating: isStatusUpdating } = useStatusUpdate();

  const handleStatusUpdate = async () => {
    await updateStatus({
      applicationId: application.id,
      statusId: selectedStatus,
      reason,
      notes,
      requiredDocumentTypeIds:
        requiresDocuments && !isUniversityApproved && !isCommissionPaid
          ? documents.flatMap((doc) => doc.type)
          : [],
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

    // clear error when user types
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

    if (
      requiresDocuments &&
      !isUniversityApproved &&
      selectedOption?.label !== "Visa Issued"
    ) {
      if (documents.some((doc) => doc.type.length === 0)) {
        setError("Please select at least one document type");
        return false;
      }
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
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update application";
      showToast(msg, "error");
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
        <div className="relative border-b border-default px-6 pb-4 pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
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
              className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
              statusOptions.map((option, index) => {
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
        : "cursor-pointer border-default bg-card hover:border-gray-300 hover:shadow"
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

          {requiresDocuments &&
            !isUniversityApproved &&
            !isVisaIssued &&
            !isCommissionPaid && (
              <DocumentRequestList
                documents={documents}
                setDocuments={setDocuments}
                documentTypes={documentTypes}
              />
            )}

          {isUniversityApproved && (
            <StatusFileUpload
              label="Upload Offer Letter"
              id="offer-letter"
              file={offerLetterFile}
              onFileChange={setOfferLetterFile}
              onRemove={() => setOfferLetterFile(null)}
              onError={setError}
              disabled={isSubmitting}
              required
            />
          )}

          {requiresReason && (
            <div className="space-y-2">
              <label className="block text-p2 font-medium text-slate-500">
                Reason <span className="ml-1 text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a detailed reason..."
                rows={4}
                className="w-full rounded-md border border-default px-4 py-3 text-p2 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          )}

          {isVisaSetupSelected && (
            <div className="space-y-2">
              <InputField
                label="Visa Fee Amount"
                field="visa_fee_amount"
                type="number"
                placeholder="Enter visa fee amount"
                required ={false}
                formData={formData}
                errors={formErrors}
                updateFormData={updateFormData}
              />
              {amount?.amount && (
                <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    Default visa fee is <strong>{amount.amount}</strong>. You can enter a different amount if needed.
                  </span>
                </div>
              )}
            </div>
          )}

          {isVisaIssued && (
            <StatusFileUpload
              label="Upload Visa Document"
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
              id="commission-payment"
              file={commissionPaymentFile}
              onFileChange={setCommissionPaymentFile}
              onRemove={() => setCommissionPaymentFile(null)}
              onError={setError}
              disabled={isSubmitting}
              required
            />
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-default px-6 py-5">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-full border border-gray-600 px-4  py-2 text-sm font-medium text-gray-600 transition hover:border-gray-700 hover:text-gray-700 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              !selectedStatus ||
              isSubmitting ||
              !!error ||
              (requiresReason && !reason.trim())
            }
            className="flex items-center justify-center gap-2 rounded-full border border-blue-600 bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-700 hover:bg-blue-200 disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" />
            {isSubmitting ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
}
