"use client";
import { Trash2 } from "lucide-react";
import FormModal from "components/ub/feedback/dialogs/FormModal";
export default function DeletePaymentConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  paymentMethodName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isDeleting: boolean;
  paymentMethodName?: string;
}) {
  return (
    <FormModal
      open={isOpen}
      onClose={() => {
        if (!isDeleting) onClose();
      }}
      title="Delete payment method"
      description="Confirm removal of this payment method."
      icon={Trash2}
      onSubmit={onConfirm}
      submitLabel="Delete payment method"
      submitTone="destructive"
      submitting={isDeleting}
    >
      <p className="break-words">
        Delete “{paymentMethodName}”? University assignments may prevent
        deletion.
      </p>
    </FormModal>
  );
}
