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
import api from "../../../../lib/useApi";
import { useToast } from "../../../context/ToastContext";
import NoDocumentsRequired from "components/emptyData/NoDocumentsRequired";
import {
  getPresignedUploads,
  uploadFilesToSpaces,
} from "services/uploadService";
import { InputField } from "components/form";

interface DocumentRequest {
  id: string;
  type: string[];
  reason: string;
}

interface StatusOption {
  id: string;
  label: string;
  description: string;
  nextAction: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  requiresReason: boolean;
  requiresDocumentSelection: boolean;
}

interface DocumentRequestListProps {
  documents: DocumentRequest[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentRequest[]>>;
  documentTypes: { id: string; label: string }[];
}

const DocumentRequestList = ({
  documents,
  setDocuments,
  documentTypes,
}: DocumentRequestListProps) => {
  const addDocument = () => {
    setDocuments([
      ...documents,
      { id: Date.now().toString(), type: [], reason: "" },
    ]);
  };

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

            <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto rounded-md border border-gray-200 p-2">
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

  useEffect(() => {
    if (!isOpen || !application?.id) return;

    const fetchApplicationDetails = async () => {
      try {
        const response = await api.get(`/applications/${application.id}`);
        const appData = response.data;

        setDocumentTypes(
          (appData.document_types || []).map((d: any) => ({
            id: d.id,
            label: d.description || d.type,
          }))
        );

        const options: StatusOption[] = (appData.stage_statuses || []).map(
          (s: any) => {
            const matchingAction = (appData.available_actions || []).find(
              (a) => a.status === s.name
            );
            return {
              id: s.id,
              label: s.name,
              description: s.description ?? "",
              nextAction: matchingAction?.next_action ?? "",
              ...getStatusStyle(s.name),
              requiresReason: !!s.is_requires_reason,
              requiresDocumentSelection: !!s.is_requires_document_selection,
            };
          }
        );

        setStatusOptions(options);
      } catch (err) {
        console.error(err);
        setStatusOptions([]);
      }
    };

    fetchApplicationDetails();
  }, [isOpen, application?.id]);

  const requiresReason = selectedOption?.requiresReason || false;
  const requiresDocuments = selectedOption?.requiresDocumentSelection || false;

  const isUniversityApproved = selectedOption?.label === "University Approved";
  const [offerLetterFile, setOfferLetterFile] = useState<File | null>(null);

  const currentStageName = application?.stage?.name?.toLowerCase() || "";
  const isCurrentlyVisaSetup = currentStageName === "visa setup";
  const isVisaSetupSelected = selectedOption?.label === "Visa Setup";

  const [visaDocumentFile, setVisaDocumentFile] = useState<File | null>(null);
  const isVisaIssued = selectedOption?.label === "Visa Issued";

  const [formData, setFormData] = useState({
    visa_fee_amount: "",
  });

  const [formErrors, setFormErrors] = useState<any>({});

  const handleOfferLetterUpload = async () => {
    if (!isUniversityApproved || !offerLetterFile) return;

    showToast("Uploading offer letter...", "info");

    const presigned = await getPresignedUploads([offerLetterFile], "documents");
    const results = await uploadFilesToSpaces([offerLetterFile], presigned);
    const uploaded = results?.[0];

    if (!uploaded?.file_key || !uploaded?.public_url) {
      throw new Error("Offer letter upload failed");
    }

    await api.post(`/applications/${application.id}/offer-letter`, {
      file_key: uploaded.file_key,
      file_url: uploaded.public_url,
    });

    showToast("Offer letter uploaded successfully.", "success");
  };

  const handleVisaSetup = async () => {
    if (!isVisaSetupSelected) return;

    const amount = Number(formData.visa_fee_amount);
    if (!amount || amount <= 0) {
      throw new Error("Visa fee amount is required");
    }

    await api.patch(`/applications/${application.id}/visa-case`, {
      visa_fee_amount: amount,
      visa_reference_number: "UB" + Date.now(),
      notes: "Visa fee amount updated by manager.",
    });

    showToast("Visa fee saved successfully", "success");
  };

  const handleVisaIssuedUpload = async () => {
    if (selectedOption?.label !== "Visa Issued" || !visaDocumentFile) return;

    showToast("Uploading visa document...", "info");

    const presigned = await getPresignedUploads(
      [visaDocumentFile],
      "documents"
    );
    const results = await uploadFilesToSpaces([visaDocumentFile], presigned);
    const uploaded = results?.[0];

    if (!uploaded?.file_key || !uploaded?.public_url) {
      throw new Error("Visa document upload failed");
    }

    await api.post(`/applications/${application.id}/visa-document`, {
      file_key: uploaded.file_key,
      file_url: uploaded.public_url,
    });

    showToast("Visa document uploaded successfully", "success");
  };

  const handleStatusUpdate = async () => {
    await api.post(`/applications/${application.id}/status`, {
      status_id: selectedStatus,
      reason_text: reason.trim(),
      notes: notes.trim(),
      required_document_type_ids:
        requiresDocuments && !isUniversityApproved
          ? documents.flatMap((doc) => doc.type)
          : [],
    });

    showToast("Status updated successfully.", "success");
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

    if (isCurrentlyVisaSetup) {
      if (!formData.visa_fee_amount || Number(formData.visa_fee_amount) <= 0) {
        setFormErrors({
          visa_fee_amount: "Visa fee amount is required",
        });
        setError("Please enter visa fee amount");
        return false;
      }
    }

    if (selectedOption?.label === "Visa Issued" && !visaDocumentFile) {
      setError("Please upload the visa document");
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

                <div className="mt-1 flex items-center gap-2 text-sm text-text-muted">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Stage:</span>
                  <span className="font-normal">
                    {application?.stage?.name || "No Stage"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-caption text-text-muted">
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
                          <p className="mt-1 text-xs text-text-muted">
                            <span className="font-medium">Next :</span>{" "}
                            {option.nextAction}
                          </p>
                        )}
                        {option.description && (
                          <p className="mt-0.5 text-xs text-text-muted">
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

          {requiresDocuments && !isUniversityApproved && !isVisaIssued && (
            <DocumentRequestList
              documents={documents}
              setDocuments={setDocuments}
              documentTypes={documentTypes}
            />
          )}

          {isUniversityApproved && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Upload Offer Letter <span className="text-red-500">*</span>
              </label>

              <label
                htmlFor="offer-letter"
                className="
    group relative flex cursor-pointer flex-col items-center justify-center
    rounded-md border-2 border-dashed border-gray-300
    bg-white px-6 py-10 text-center
    transition-all duration-200
    hover:border-blue-500 hover:bg-blue-50/40
    disabled:cursor-not-allowed
  "
              >
                <div
                  className="
      mb-4 flex h-14 w-14 items-center justify-center
      rounded-full bg-blue-100 text-blue-600
      transition
    "
                >
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 16V8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                    />
                  </svg>
                </div>

                <p className="text-sm font-semibold text-gray-800">
                  Upload Offer Letter
                </p>

                <p className="mt-3 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                  PDF Max 5MB
                </p>

                <input
                  id="offer-letter"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  disabled={isSubmitting}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setOfferLetterFile(file || null);
                  }}
                />
              </label>

              {offerLetterFile && (
                <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-2">
                  <span className="truncate text-sm text-text-muted">
                    {offerLetterFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOfferLetterFile(null)}
                    className="bg-background flex items-center justify-center gap-2 rounded-full border border-red-500 px-4 py-2.5  text-sm text-red-500 outline-0 transition hover:border-red-800 hover:text-red-800 sm:w-auto"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {requiresReason && (
            <div className="space-y-2">
              <label className="block text-p2 font-medium text-text-muted">
                Reason <span className="ml-1 text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a detailed reason..."
                rows={4}
                className="w-full rounded-md border border-default px-4 py-3 text-p2 outline-none transition-all duration-200 placeholder:text-text-muted focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          )}

          {isVisaSetupSelected && (
            <InputField
              label="Visa Fee Amount"
              field="visa_fee_amount"
              type="number"
              placeholder="Enter visa fee amount"
              required
              formData={formData}
              errors={formErrors}
              updateFormData={updateFormData}
            />
          )}

          {isVisaIssued && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Upload Visa Document <span className="text-red-500">*</span>
              </label>

              <label
                htmlFor="visa-document"
                className="
        group relative flex cursor-pointer flex-col items-center justify-center
        rounded-md border-2 border-dashed border-gray-300
        bg-white px-6 py-10 text-center
        transition-all duration-200
        hover:border-blue-500 hover:bg-blue-50/40
        disabled:cursor-not-allowed
      "
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 16V8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                    />
                  </svg>
                </div>

                <p className="text-sm font-semibold text-gray-800">
                  Select Visa Document
                </p>
                <p className="mt-2 text-xs text-gray-600">
                  PDF, JPG, PNG - Max 5MB
                </p>

                <input
                  id="visa-document"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  disabled={isSubmitting}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setVisaDocumentFile(file || null);
                  }}
                />
              </label>

              {visaDocumentFile && (
                <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-2">
                  <span className="truncate text-sm text-text-muted">
                    {visaDocumentFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setVisaDocumentFile(null)}
                    className="bg-background flex items-center justify-center gap-2 rounded-full border border-red-500 px-4 py-2.5 text-sm text-red-500 outline-0 transition hover:border-red-800 hover:text-red-800 sm:w-auto"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-default px-6 py-5">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              !selectedStatus ||
              isSubmitting ||
              (requiresReason && !reason.trim()) ||
              (isVisaSetupSelected && Number(formData.visa_fee_amount) <= 0)
            }
            className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
}
