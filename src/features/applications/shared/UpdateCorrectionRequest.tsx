"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, FilePlus2, XCircle } from "lucide-react";
import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import { useToast } from "components/context/ToastContext";
import { useUpdateCorrectionRequest } from "features/applications/hooks";
import type { DocumentType } from "features/applications/hooks/stages/useApplicationActions";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";

/** Backend error codes → in-modal copy; anything else falls back to the API message. */
const ERROR_MESSAGES: Record<string, string> = {
  required_document_types_already_requested:
    "Every document you selected has already been requested. Pick at least one that hasn't.",
  required_document_types_not_in_allowed_set:
    "One of the selected documents can't be requested at this status.",
  required_document_types_not_found: "One of the selected documents no longer exists.",
  correction_update_not_supported_for_status:
    "This status can't be updated — it only ever requests one fixed document.",
  reason_text_empty: "Enter a reason for the additional documents.",
  required_document_type_ids_empty: "Select at least one document to request.",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  statusName?: string;
  /** The reason already on the correction — shown read-only, since the new
   *  text is appended to it rather than replacing it. */
  currentReason?: string | null;
  documentTypes: DocumentType[];
  onUpdated: () => void;
}

export default function UpdateCorrectionRequest({
  isOpen,
  onClose,
  applicationId,
  statusName,
  currentReason,
  documentTypes,
  onUpdated,
}: Props) {
  const { showToast } = useToast();
  const { updateCorrectionRequest, isUpdating } = useUpdateCorrectionRequest();

  const [isVisible, setIsVisible] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reasonError, setReasonError] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setReason("");
      setSelectedIds([]);
      setReasonError("");
      setFormError(null);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const toggle = (id: string) => {
    setFormError(null);
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setReasonError("Reason is required");
      return;
    }
    if (selectedIds.length === 0) {
      setFormError("Select at least one document to request.");
      return;
    }
    setFormError(null);
    try {
      await updateCorrectionRequest(applicationId, {
        reasonText: reason,
        requiredDocumentTypeIds: selectedIds,
      });
      showToast("Correction request updated.", "success");
      onUpdated();
      onClose();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      setFormError(
        (code && ERROR_MESSAGES[code]) ?? parseApiError(err, "Failed to update correction request.")
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={isUpdating ? undefined : onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 md:max-w-xl ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Update correction request"
            description={
              statusName
                ? `Request more documents for "${statusName}" without changing the status.`
                : "Request more documents without changing the status."
            }
            icon={FilePlus2}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-5 overflow-y-auto px-6 py-6">
            {currentReason && (
              <div>
                <p className="mb-1 text-p2 font-medium text-slate-500">Current reason</p>
                <p className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {currentReason}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-p2 font-medium text-slate-500">
                Additional reason <span className="ml-1 text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (reasonError) setReasonError("");
                }}
                placeholder="Why are these extra documents needed? This is added to the reason above."
                rows={3}
                className={`w-full resize-y rounded-md border px-4 py-3 text-p2 outline-none transition-colors placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  reasonError ? "border-red-500 bg-red-50" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              />
              {reasonError && <p className="mt-1 text-xs text-red-600">{reasonError}</p>}
            </div>

            <div className="space-y-2">
              <p className="text-p2 font-medium text-slate-500">
                Documents to request <span className="ml-1 text-red-500">*</span>
              </p>
              {documentTypes.length === 0 ? (
                <p className="text-sm text-slate-400">No documents available to request.</p>
              ) : (
                <div className="space-y-2">
                  {documentTypes.map((d) => (
                    <label
                      key={d.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(d.id)}
                        onChange={() => toggle(d.id)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                          <span className="truncate">{d.type}</span>
                          {d.is_required_for_current_upload && (
                            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                              Already requested
                            </span>
                          )}
                        </span>
                        {d.description && (
                          <span className="block text-xs text-slate-400">{d.description}</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {formError && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="text-sm text-red-700">{formError}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <Button
              onClick={onClose}
              disabled={isUpdating}
              icon={<XCircle className="h-5 w-5" />}
              text="Cancel"
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />
            <Button
              onClick={handleSubmit}
              disabled={isUpdating}
              icon={<FilePlus2 className="h-5 w-5" />}
              text={isUpdating ? "Updating..." : "Update request"}
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-800"
              hoverBorderColor="hover:border-blue-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
