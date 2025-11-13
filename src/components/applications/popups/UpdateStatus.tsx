"use client";

import React, { useState, useEffect } from "react";
import { XCircle, Clock, Plus, Trash2, AlertCircle } from "lucide-react";
import { DOCUMENT_TYPES } from "constants/lists";
import api from "lib/useApi";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface DocumentRequest {
  id: string;
  type: string;
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
}

const DocumentRequestList = ({ documents, setDocuments }: DocumentRequestListProps) => {
  const addDocument = () => {
    setDocuments([...documents, { id: Date.now().toString(), type: "", reason: "" }]);
  };

  const removeDocument = (id: string) => {
    if (documents.length > 1) {
      setDocuments(documents.filter((doc) => doc.id !== id));
    }
  };

  const updateDocument = (id: string, field: keyof DocumentRequest, value: string) => {
    setDocuments(documents.map((doc) => (doc.id === id ? { ...doc, [field]: value } : doc)));
  };

  return (
    <div className="space-y-4">
      {documents.map((doc, index) => (
        <div key={doc.id} className="relative space-y-3 rounded-md border border-amber-200 bg-card p-4">
          {documents.length > 1 && (
            <button
              onClick={() => removeDocument(doc.id)}
              className="absolute right-2 top-2 rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label="Remove document"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}

          <div>
            <label className="mb-2 block text-p2 font-medium text-text-muted">
              Document Type {index + 1}
            </label>
            <select
              value={doc.type}
              onChange={(e) => updateDocument(doc.id, "type", e.target.value)}
              className="w-full rounded-md border border-default bg-card px-4 py-2.5 text-p2 outline-none transition-all duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">Select document type...</option>
              {DOCUMENT_TYPES.map((d) => (
                <option key={d.key} value={d.label}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-p2 font-medium text-text-muted">
              Reason for Request
            </label>
            <textarea
              value={doc.reason}
              onChange={(e) => updateDocument(doc.id, "reason", e.target.value)}
              placeholder="Why is this document needed?"
              rows={3}
              className="w-full rounded-md border border-default px-4 py-2.5 text-p2 outline-none transition-all duration-200 placeholder:text-text-muted focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>
      ))}

      <button
        onClick={addDocument}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-amber-300 bg-amber-50/50 px-4 py-3 text-p2 font-medium text-amber-700 transition-all duration-200 hover:border-amber-400 hover:bg-amber-100"
      >
        <Plus className="h-4 w-4" />
        Add Another Document
      </button>
    </div>
  );
};

interface InputFieldProps {
  label: string;
  placeholder: string;
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  isTextarea?: boolean;
}

const InputField = ({
                      label,
                      placeholder,
                      id,
                      type = "text",
                      value,
                      onChange,
                      required = false,
                      isTextarea = false,
                    }: InputFieldProps) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-p2 font-medium text-text-muted">
      {label} {required && <span className="ml-1 text-red-500">*</span>}
    </label>
    {isTextarea ? (
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-md border border-default px-4 py-3 text-p2 outline-none transition-all duration-200 placeholder:text-text-muted focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />
    ) : (
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-md border border-default px-4 py-3 text-p2 outline-none transition-all duration-200 placeholder:text-text-muted focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />
    )}
  </div>
);

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
  const [documents, setDocuments] = useState<DocumentRequest[]>([{ id: "1", type: "", reason: "" }]);
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;

    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser({
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role?.name || response.data.role,
        });
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !application?.id) return;

    const fetchApplicationDetails = async () => {
      try {
        const response = await api.get(`/applications/${application.id}`);
        const appData = response.data;

        const options: StatusOption[] = (appData.stage_statuses || []).map((s: any) => ({
          id: s.id,
          label: s.name,
          description: s.description ?? "",
          nextAction: s.next_action ?? "",
          icon: Clock,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          requiresReason: !!s.is_requires_reason,
          requiresDocumentSelection: !!s.is_requires_document_selection,
        }));

        setStatusOptions(options);
      } catch (error: any) {
        console.error("Error fetching application details:", error);
        setStatusOptions([]);
        setError("Failed to load status options. Please try again.");
      }
    };

    fetchApplicationDetails();
  }, [isOpen, application?.id]);

  const selectedOption = statusOptions.find((opt) => opt.id === selectedStatus);
  const requiresReason = selectedOption?.requiresReason || false;
  const requiresDocuments = selectedOption?.requiresDocumentSelection || false;

  const validateForm = (): boolean => {
    if (!selectedStatus) {
      setError("Please select a status");
      return false;
    }

    if (requiresReason && !reason.trim()) {
      setError("Reason is required for this status");
      return false;
    }

    if (requiresDocuments) {
      const hasEmptyDocuments = documents.some(doc => !doc.type);
      if (hasEmptyDocuments) {
        setError("Please select a document type for all documents");
        return false;
      }
    }

    setError("");
    return true;
  };

  const handleConfirm = async () => {
    if (!validateForm() || !application?.id) return;

    setIsSubmitting(true);
    setError("");

    try {

      let required_document_type_ids: string[] = [];
      if (requiresDocuments) {
        required_document_type_ids = documents.map((doc) => {
          const match = DOCUMENT_TYPES.find((d) => d.label === doc.type);
          if (!match) throw new Error(`Document type "${doc.type}" is invalid`);
          return match.key;
        });
      }

      const payload = {
        status_id: selectedStatus,
        reason_text: reason.trim(),
        notes: notes.trim(),
        required_document_type_ids,
      };

      console.log("Sending payload:", payload);
      const response = await api.post(`/applications/${application.id}/status`, payload);
      console.log("Response:", response.data);

      onConfirm(selectedStatus, reason, notes);
      handleClose();
    } catch (error: any) {
      let errorMessage = "Failed to update status.";
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = "Unauthorized. Please log in again.";
            break;
          case 403:
            errorMessage = "Permission denied. You don't have access to update this application.";
            break;
          case 404:
            errorMessage = "Application not found. It may have been deleted.";
            break;
          case 422:
            const details = error.response.data?.detail || [];
            const fieldErrors = details.map((d: any) => `• ${d.loc.join(" -> ")}: ${d.msg}`).join("\n");
            errorMessage = `Validation failed:\n${fieldErrors}`;
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = error.response.data?.message || `Error (${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage = "Network error. Cannot reach the server. Please check your connection.";
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedStatus("");
    setReason("");
    setNotes("");
    setDocuments([{ id: "1", type: "", reason: "" }]);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-overlay p-4 z-[80] backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl transform rounded-md bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex justify-between items-center border-b border-default px-6 py-5">
          <h5 className="text-xl font-bold">Update Application Status</h5>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-900" aria-label="Close">
            <XCircle className="h-5 w-5" />
          </button>
        </div>


        <div className="max-h-[60vh] overflow-y-auto space-y-6 px-6 py-6">
          {error && (
            <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Error</p>
                <pre className="text-xs text-red-700 mt-1 whitespace-pre-wrap font-mono">{error}</pre>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="block font-semibold text-gray-900">
              Select New Status <span className="text-red-500">*</span>
            </label>
            {statusOptions.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">Loading status options...</p>
            ) : (
              statusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedStatus === option.id;
                return (
                  <div
                    key={option.id}
                    onClick={() => setSelectedStatus(option.id)}
                    className={`cursor-pointer rounded-md border p-4 transition-all ${
                      isSelected
                        ? `${option.borderColor} ${option.bgColor} shadow`
                        : "border-default bg-card hover:border-gray-300 hover:shadow"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${isSelected ? option.color : "text-gray-400"}`} />
                      <div>
                        <p className="font-semibold text-gray-900">{option.label}</p>
                        {option.description && <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {requiresDocuments && <DocumentRequestList documents={documents} setDocuments={setDocuments} />}

          {requiresReason && (
            <InputField
              label="Reason"
              placeholder="Please provide a detailed reason..."
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              isTextarea
            />
          )}

          <InputField
            label="Additional Notes (Optional)"
            placeholder="Add any additional notes..."
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            isTextarea
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-default px-6 py-5">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedStatus || isSubmitting || (requiresReason && !reason.trim())}
            className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
}
