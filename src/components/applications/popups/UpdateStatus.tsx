"use client";

import React, { useState, useEffect } from "react";
import {
  XCircle,
  Clock,
  CheckCircle,
  XOctagon,
  AlertTriangle,
  FileEdit,
  Plus,
  Trash2,
} from "lucide-react";
import { DOCUMENT_TYPES } from "constants/lists";

interface DocumentRequest {
  id: string;
  type: string;
  reason: string;
}

const DocumentRequestList = () => {
  const [documents, setDocuments] = useState<DocumentRequest[]>([
    { id: "1", type: "", reason: "" },
  ]);

  const addDocument = () => {
    setDocuments([
      ...documents,
      { id: Date.now().toString(), type: "", reason: "" },
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
    value: string
  ) => {
    setDocuments(
      documents.map((doc) => (doc.id === id ? { ...doc, [field]: value } : doc))
    );
  };

  return (
    <div className="space-y-4">
      {documents.map((doc, index) => (
        <div
          key={doc.id}
          className="relative space-y-3 rounded-md border border-amber-200 bg-card p-4"
        >
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
              {DOCUMENT_TYPES.map((doc) => (
                <option key={doc.key} value={doc.label}>
                  {doc.label}
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
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
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
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
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
}

interface UpdateStatusPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: string, reason: string, notes: string) => void;
  applicationId?: string;
  currentStatus?: string;
}

export default function UpdateStatusPopup({
  isOpen,
  onClose,
  onConfirm,
}: UpdateStatusPopupProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const statusOptions: StatusOption[] = [
    {
      id: "under_review",
      label: "Under Review by Account Manager",
      description: "Account Manager receives new application",
      nextAction: "Move to under review account manager",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      requiresReason: false,
    },
    {
      id: "approved",
      label: "Approved",
      description: "Account Manager confirms documents and application",
      nextAction: "Move to approved stage1",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      requiresReason: false,
    },
    {
      id: "rejected",
      label: "Rejected",
      description: "Account Manager rejects application",
      nextAction: "Move to rejected stage1",
      icon: XOctagon,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      requiresReason: true,
    },
    {
      id: "correction_requested",
      label: "Correction Requested by Account Manager",
      description: "Account Manager reviews and finds issues",
      nextAction: "Move to correction requested account manager",
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      requiresReason: true,
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const selectedOption = statusOptions.find((opt) => opt.id === selectedStatus);
  const requiresReason = selectedOption?.requiresReason || false;

  const handleConfirm = () => {
    if (!selectedStatus) return;
    if (requiresReason && !reason.trim()) return;
    onConfirm(selectedStatus, reason, notes);
    setSelectedStatus("");
    setReason("");
    setNotes("");
  };

  const handleClose = () => {
    setSelectedStatus("");
    setReason("");
    setNotes("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 transition-all duration-300"
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-2xl transform transition-all duration-300 ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-md bg-card">

          <div className="relative overflow-hidden border-b border-default px-6 pb-5 pt-6">
            <div className="absolute right-0 top-0 h-full w-64 bg-gradient-to-l from-blue-100/20 to-transparent" />

            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-blue-200/50 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 shadowsm">
                  <FileEdit
                    className="h-7 w-7 text-blue-600"
                    strokeWidth={2.5}
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 to-transparent opacity-60" />
                </div>

                <div className="space-y-1">
                  <h5 className="text-xl font-bold tracking-tight text-gray-900">
                    Update Application Status
                  </h5>
                </div>
              </div>

              <button
                onClick={handleClose}
                aria-label="Close dialog"
                className="group relative flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-all duration-200 hover:bg-gray-100 hover:text-text-muted active:scale-95"
              >
                <XCircle className="h-5 w-5 transition-transform duration-200 " />
              </button>
            </div>

            <div className="absolute bottom-0 left-0 h-0.5 w-full" />
          </div>

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">

            <div className="flex items-center gap-3 rounded-md border border-blue-100 bg-blue-50/50 p-4">
              <Clock className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <div>
                <p className="text-p2 font-semibold text-gray-900">
                  Current Stage: Application Review
                </p>
                <p className="text-xs text-gray-600">
                  Next Action: Upload visa payment proof (by Partner)
                </p>
              </div>
            </div>

            <div>
              <label className="mb-3 block text-p2 font-semibold text-gray-900">
                Select New Status
              </label>
              <div className="space-y-3">
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedStatus === option.id;

                  return (
                    <div
                      key={option.id}
                      onClick={() => setSelectedStatus(option.id)}
                      className={`group cursor-pointer rounded-md border p-4 transition-all duration-200 ${
                        isSelected
                          ? `${option.borderColor} ${option.bgColor} shadow`
                          : "border-default bg-card hover:border-gray-300 hover:shadow"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                            isSelected ? option.bgColor : "bg-gray-50"
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${
                              isSelected ? option.color : "text-text-muted"
                            }`}
                            strokeWidth={2}
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h6 className="font-semibold text-gray-900">
                              {option.label}
                            </h6>
                            {option.requiresReason && (
                              <span className="ml-2 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                Requires Reason
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-p2 text-gray-600">
                            {option.description}
                          </p>
                          <p className="mt-2 text-xs text-gray-500">
                            <span className="font-medium">Next:</span>{" "}
                            {option.nextAction}
                          </p>
                        </div>

                        <div
                          className={`mt-1 h-5 w-5 flex-shrink-0 rounded-full border transition-all duration-200 ${
                            isSelected
                              ? `${option.borderColor} bg-card`
                              : "border-gray-300 bg-card"
                          }`}
                        >
                          {isSelected && (
                            <div
                              className={`h-full w-full scale-50 rounded-full ${option.bgColor
                                .replace("bg-", "bg-")
                                .replace("-50", "-500")}`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedStatus === "correction_requested" && (
              <div className="space-y-4 rounded-md border border-amber-200 bg-amber-50/50 p-5">
                <h6 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                  <FileEdit className="h-5 w-5 text-amber-600" />
                  Request Additional Documents
                </h6>

                <DocumentRequestList />
              </div>
            )}

            {requiresReason && (
              <InputField
                label="Reason"
                placeholder="Please provide a detailed reason for this status change..."
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                isTextarea
              />
            )}

            <InputField
              label="Additional Notes (Optional)"
              placeholder="Add any additional notes or comments..."
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              isTextarea
            />

          </div>

          <div className="border-t border-default px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <p className="text-sm sm:text-p2 text-gray-600 text-center sm:text-left">
              Acting as:{" "}
              <span className="font-semibold text-gray-900">Ammar</span>{" "}
              <span className="text-text-muted">(Account Manager)</span>
            </p>

            <div className="flex justify-center sm:justify-end gap-3 w-full sm:w-auto">
              <button
                onClick={handleClose}
                className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm sm:text-p2 font-medium text-text-muted transition-all duration-200 hover:bg-gray-100 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirm}
                disabled={!selectedStatus || (requiresReason && !reason.trim())}
                className="rounded-full bg-blue-600 px-6 py-2.5 text-sm sm:text-p2 font-medium text-white shadow-md transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Update Status
              </button>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
