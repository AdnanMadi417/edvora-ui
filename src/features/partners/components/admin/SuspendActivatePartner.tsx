"use client";
import { Ban, Power } from "lucide-react";
import FormModal from "components/ub/feedback/dialogs/FormModal";
export default function SuspendActivatePartner({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  partnerName,
  isActive,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isSubmitting: boolean;
  partnerName: string;
  isActive: boolean;
}) {
  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      title={isActive ? "Suspend advisor" : "Activate advisor"}
      description={
        isActive
          ? "Suspend access for this advisor account."
          : "Restore access for this advisor account."
      }
      icon={isActive ? Ban : Power}
      onSubmit={onConfirm}
      submitLabel={isActive ? "Suspend account" : "Activate account"}
      submitTone={isActive ? "destructive" : "positive"}
      submitting={isSubmitting}
    >
      <p className="break-words">{partnerName}</p>
    </FormModal>
  );
}
