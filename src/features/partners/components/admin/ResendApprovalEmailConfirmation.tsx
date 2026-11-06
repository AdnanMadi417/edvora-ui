"use client";
import { Mail } from "lucide-react";
import FormModal from "components/ub/feedback/dialogs/FormModal";
export default function ResendApprovalEmailConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isSending,
  partnerName,
  cooldownSeconds = 0,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isSending: boolean;
  partnerName: string;
  cooldownSeconds?: number;
}) {
  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      title="Resend approval email"
      description="Send the approval email again to this adviser."
      icon={Mail}
      onSubmit={onConfirm}
      submitLabel={
        cooldownSeconds > 0 ? `Retry in ${cooldownSeconds}s` : "Resend email"
      }
      submitDisabled={cooldownSeconds > 0}
      submitting={isSending}
    >
      <p className="break-words">{partnerName}</p>
      {cooldownSeconds > 0 && (
        <p
          role="status"
          className="mt-3 text-ub-body-sm text-ub-text-secondary"
        >
          You can resend the email in {cooldownSeconds} seconds.
        </p>
      )}
    </FormModal>
  );
}
