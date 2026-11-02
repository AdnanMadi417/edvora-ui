"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, UserCog, XCircle } from "lucide-react";
import { useReviewPartner, useAssignPartnerManager } from "features/partners/hooks";
import Button from "components/ub/core/Button";
import ApproveRejectToggle, { type Decision } from "components/ub/core/ApproveRejectToggle";
import Tag from "components/ub/data/Tag";
import FormModal, { FormSection, type FormModalError } from "components/ub/feedback/FormModal";
import { useToast } from "components/ub/feedback/ToastContext";
import Combobox from "components/ub/forms/Combobox";
import Textarea from "components/ub/forms/Textarea";
import { parseApiError } from "utils/parseApiError";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  partnerId: string;
  partnerName: string;
  managerOptions: { label: string; value: string }[];
  currentManagerId?: string;
}

const FIELD = { manager: "review-manager", decision: "review-decision", reason: "review-reason" };

/**
 * Review an Advisor registration: assign the account manager, then approve or
 * reject (a reason is required to reject). One Primary action, labelled with
 * the decision; unsaved choices ask before closing.
 */
export default function ReviewPartnerPopup({ isOpen, onClose, onSuccess, partnerId, partnerName, managerOptions, currentManagerId }: Props) {
  const { showToast } = useToast();
  const { reviewPartner, loading } = useReviewPartner();
  const { assignManager, loading: assigningManager } = useAssignPartnerManager();

  const [decision, setDecision] = useState<Decision | null>(null);
  const [reason, setReason] = useState("");
  const [managerId, setManagerId] = useState(currentManagerId ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset each time the popup opens.
  useEffect(() => {
    if (!isOpen) return;
    setDecision(null);
    setReason("");
    setManagerId(currentManagerId ?? "");
    setErrors({});
  }, [isOpen, currentManagerId]);

  const busy = loading || assigningManager;
  const managerMissing = !managerId;
  const managerPending = !!managerId && managerId !== currentManagerId;
  const dirty = decision !== null || reason.trim() !== "" || managerPending;
  const clearError = (key: string) => setErrors((e) => ({ ...e, [key]: "" }));

  const assignNow = async () => {
    if (!managerId) {
      setErrors({ manager: "Choose an account manager." });
      return;
    }
    try {
      await assignManager(partnerId, { manager_id: managerId });
      showToast("Account manager assigned.", "success");
      onSuccess?.();
    } catch (err: any) {
      const message = parseApiError(err, "Couldn't assign the account manager. Try again.");
      showToast(message, "error");
      if (err?.response?.data?.code === "manager_not_available") setErrors({ manager: message });
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!decision) next.decision = "Choose approve or reject.";
    if (decision === "approved" && managerMissing) next.manager = "Assign an account manager before approving.";
    if (decision === "rejected" && !reason.trim()) next.reason = "Tell the Advisor why the registration is rejected.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate() || !decision) return;
    try {
      if (managerId && managerId !== currentManagerId) await assignManager(partnerId, { manager_id: managerId });
      await reviewPartner(partnerId, decision, reason.trim() || undefined);
      showToast(decision === "approved" ? `${partnerName} is approved.` : `${partnerName} is rejected.`, "success");
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      showToast(parseApiError(err, "Couldn't submit the review. Try again."), "error");
    }
  };

  const summary: FormModalError[] = [
    errors.manager && { fieldId: FIELD.manager, message: errors.manager },
    errors.decision && { fieldId: FIELD.decision, message: errors.decision },
    errors.reason && { fieldId: FIELD.reason, message: errors.reason },
  ].filter(Boolean) as FormModalError[];

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      size="md"
      icon={ShieldCheck}
      title="Review Advisor"
      description={`Registration for ${partnerName}`}
      onSubmit={submit}
      submitting={busy}
      submitLabel={decision === "approved" ? "Approve Advisor" : decision === "rejected" ? "Reject Advisor" : "Submit decision"}
      submitIcon={decision === "approved" ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : decision === "rejected" ? <XCircle className="h-4 w-4" aria-hidden="true" /> : undefined}
      submitTone={decision === "approved" ? "positive" : decision === "rejected" ? "destructive" : "primary"}
      errors={summary}
      dirty={dirty}
    >
      <FormSection id="review-manager-section" title="Account manager" description="Required before the Advisor can be approved." columns={1}>
        <div className="mb-3">
          {managerMissing ? (
            <Tag tone="warning">Not assigned</Tag>
          ) : managerPending ? (
            <Tag tone="info">Assigned when you submit</Tag>
          ) : (
            <Tag tone="success">Assigned</Tag>
          )}
        </div>
        <Combobox
          id={FIELD.manager}
          label="Account manager"
          options={managerOptions}
          value={managerId || null}
          onChange={(v) => {
            setManagerId(v ?? "");
            clearError("manager");
          }}
          placeholder="Search account managers"
          error={errors.manager || undefined}
          disabled={busy}
          required
        />
        <div>
          <Button
            variant="secondary"
            size="sm"
            icon={<UserCog className="h-4 w-4" aria-hidden="true" />}
            text="Assign now"
            onClick={assignNow}
            loading={assigningManager}
            disabled={busy || managerMissing || !managerPending}
          />
        </div>
      </FormSection>

      <FormSection id="review-decision-section" title="Decision" columns={1}>
        <div id={FIELD.decision} tabIndex={-1} className="outline-none">
          <ApproveRejectToggle
            value={decision}
            onChange={(v) => {
              setDecision(v);
              clearError("decision");
              if (v === "approved") clearError("reason");
            }}
            approveDescription="Needs an account manager."
            rejectDescription="Needs a reason for the Advisor."
            error={errors.decision || undefined}
            disabled={busy}
            required
          />
        </div>
        {decision === "rejected" && (
          <Textarea
            id={FIELD.reason}
            label="Reason for rejection"
            value={reason}
            onChange={(v) => {
              setReason(v);
              clearError("reason");
            }}
            error={errors.reason || undefined}
            maxLength={500}
            disabled={busy}
            required
            wrapperClassName="mt-2"
          />
        )}
      </FormSection>
    </FormModal>
  );
}
