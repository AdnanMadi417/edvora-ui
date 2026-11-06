"use client";
import { Trash2 } from "lucide-react";
import FormModal from "components/ub/feedback/dialogs/FormModal";
export default function DeleteServiceConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  serviceName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isDeleting: boolean;
  serviceName?: string;
}) {
  return (
    <FormModal
      open={isOpen}
      onClose={() => {
        if (!isDeleting) onClose();
      }}
      title="Delete logistics service"
      description="Confirm removal of this service type."
      icon={Trash2}
      onSubmit={onConfirm}
      submitLabel="Delete service"
      submitTone="destructive"
      submitting={isDeleting}
    >
      <p className="break-words">Delete “{serviceName}”?</p>
    </FormModal>
  );
}
