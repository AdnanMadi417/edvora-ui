"use client";

import DescriptionList from "components/ub/data/display/DescriptionList";
import Alert from "components/ub/feedback/notifications/Alert";
import Card from "components/ub/data/cards/Card";
import { FieldLabel } from "components/ub/forms/layout/FieldChrome";
import Textarea from "components/ub/forms/text/Textarea";
import Checkbox from "components/ub/forms/choices/Checkbox";
import Tag from "components/ub/data/badges/Tag";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import React, { useEffect, useState } from "react";
import { FilePlus2 } from "lucide-react";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
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
  const [reason, setReason] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reasonError, setReasonError] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setSelectedIds([]);
      setReasonError("");
      setFormError(null);
    }
  }, [isOpen]);


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
    <FormModal
      open={isOpen}
      onClose={onClose}
      size="lg"
      icon={FilePlus2}
      title="Update correction request"
      description={statusName
                ? `Request more documents for "${statusName}" without changing the status.`
                : "Request more documents without changing the status."}
      onSubmit={handleSubmit}
      submitLabel="Update request"
      submitting={isUpdating}
    >
      <div className="grid gap-4">

          <div className="space-y-5">
            {currentReason && (
              <DescriptionList items={[{ label: "Current reason", value: currentReason }]} />
            )}

            <Textarea
              label="Additional reason"
              required
              value={reason}
              onChange={(v) => {
                setReason(v);
                if (reasonError) setReasonError("");
              }}
              placeholder="Why are these extra documents needed? This is added to the reason above."
              rows={3}
              error={reasonError || undefined}
            />

            <div className="space-y-2">
              <FieldLabel as="span">Documents to request</FieldLabel>
              {documentTypes.length === 0 ? (
                <p className="text-ub-body-sm text-ub-text-tertiary">No documents available to request.</p>
              ) : (
                <div className="space-y-2">
                  {documentTypes.map((d) => (
                    <Card key={d.id} extra="px-4 py-3">
                      <Checkbox
                        checked={selectedIds.includes(d.id)}
                        onChange={() => toggle(d.id)}
                        label={
                          <span className="flex items-center gap-2">
                            <span className="truncate">{d.type}</span>
                            {d.is_required_for_current_upload && (
                              <Tag tone="neutral" size="sm">
                                Already requested
                              </Tag>
                            )}
                          </span>
                        }
                        description={d.description || undefined}
                      />
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {formError && (
              <Alert tone="danger">{formError}</Alert>
            )}
          </div>
      </div>
    </FormModal>
  );
}
