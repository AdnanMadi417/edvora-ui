"use client";

import React, { useState, useEffect } from "react";
import {
  XCircle,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
  Pause,
  CheckCircle,
} from "lucide-react";
import api from "../../../../lib/useApi";
import { useToast } from "../../../context/ToastContext";
import NoDocumentsRequired from "components/emptyData/NoDocumentsRequired";

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
              Document Type {index + 1}
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

      <button
        onClick={addDocument}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-blue-300 bg-blue-50/50 px-4 py-3 text-p2 font-medium text-blue-700 hover:border-blue-400 hover:bg-blue-100"
      >
        <Plus className="h-4 w-4" />
        Add Another Document
      </button>
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
        console.log(appData);

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

  const selectedOption = statusOptions.find((opt) => opt.id === selectedStatus);
  const requiresReason = selectedOption?.requiresReason || false;
  const requiresDocuments = selectedOption?.requiresDocumentSelection || false;

  const validateForm = () => {
    if (!selectedStatus) return setError("Please select a status"), false;
    if (requiresReason && !reason.trim())
      return setError("Reason is required for this status"), false;
    if (requiresDocuments && documents.some((doc) => !doc.type))
      return setError("Please select a document type for all documents"), false;
    setError("");
    return true;
  };

  const handleConfirm = async () => {
    if (!validateForm() || !application?.id) return;
    setIsSubmitting(true);

    try {
      const selectedDocumentTypeIds: string[] = requiresDocuments
        ? documents.flatMap((doc) => doc.type).filter(Boolean)
        : [];

      const payload = {
        status_id: selectedStatus,
        reason_text: reason.trim(),
        notes: notes.trim(),
        required_document_type_ids: selectedDocumentTypeIds,
      };

      await api.post(`/applications/${application.id}/status`, payload);

      showToast("Status updated successfully.", "success");

      setTimeout(() => window.location.reload(), 2000);

      onConfirm(selectedStatus, reason, notes);

      handleClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update status.";
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

                <div className="mt-1 flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Stage:</span>
                  <span className="font-normal">
                    {application?.stage?.name || "No Stage"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
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

                // Disable current status and previous status
                const currentStatusId = application?.stage?.statuses?.[0]?.id;
                const prevStatusId = application?.stage?.statuses?.[1]?.id; // assuming index 0 is current, 1 is previous

                const isDisabled = option.id === currentStatusId || option.id === prevStatusId;

                return (
                  <div
                    key={option.id}
                    onClick={() => !isDisabled && setSelectedStatus(option.id)}
                    className={`cursor-pointer rounded-md border p-4 transition-all ${
                      isDisabled
                        ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                        : isSelected
                          ? `${option.borderColor} ${option.bgColor} shadow`
                          : "border-default bg-card hover:border-gray-300 hover:shadow"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-5 w-5 ${
                          isSelected ? option.color : isDisabled ? "text-gray-400" : "text-gray-400"
                        }`}
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{option.label}</p>
                        {option.nextAction && (
                          <p className="mt-1 text-xs text-text-muted">
                            <span className="font-medium">Next :</span> {option.nextAction}
                          </p>
                        )}
                        {option.description && (
                          <p className="mt-0.5 text-xs text-text-muted">{option.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {requiresDocuments && (
            <DocumentRequestList
              documents={documents}
              setDocuments={setDocuments}
              documentTypes={documentTypes}
            />
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
              (requiresReason && !reason.trim())
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
