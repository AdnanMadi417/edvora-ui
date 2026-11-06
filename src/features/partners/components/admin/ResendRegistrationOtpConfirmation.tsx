"use client";
import { KeyRound } from "lucide-react";
import FormModal from "components/ub/feedback/dialogs/FormModal";
export default function ResendRegistrationOtpConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  email,
  resendsLeft,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isSubmitting: boolean;
  email: string;
  resendsLeft: number;
}) {
  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      title="Resend verification code"
      description="Send a new registration verification code."
      icon={KeyRound}
      onSubmit={onConfirm}
      submitLabel="Resend code"
      submitting={isSubmitting}
      submitDisabled={resendsLeft <= 0}
    >
      <p className="break-all text-ub-body-md">{email}</p>
      <p className="mt-3 text-ub-body-sm text-ub-text-secondary">
        {resendsLeft} resends remaining.
      </p>
    </FormModal>
  );
}
