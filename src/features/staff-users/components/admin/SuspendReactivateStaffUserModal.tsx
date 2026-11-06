"use client";
import { Ban, Power } from "lucide-react";
import FormModal from "components/ub/feedback/dialogs/FormModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  staffUserName: string;
  /** Current is_active value — the modal offers to flip it. */
  isActive: boolean;
}

export default function SuspendReactivateStaffUserModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  staffUserName,
  isActive,
}: Props) {
  const action = isActive ? "Suspend" : "Reactivate";
  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      title={`${action} Staff User`}
      description={
        isActive
          ? "Suspending blocks login and active sessions immediately."
          : "Reactivate this staff member’s account access."
      }
      icon={isActive ? Ban : Power}
      size="md"
      submitLabel={`${action} Account`}
      submitTone={isActive ? "destructive" : "positive"}
      submitting={isSubmitting}
      onSubmit={(event) => {
        event.preventDefault();
        if (!isSubmitting) onConfirm();
      }}
    >
      <p className="text-ub-body-md text-ub-text-secondary">
        {isActive ? "Suspend" : "Restore access for"}{" "}
        <strong className="break-words text-ub-text-primary">
          {staffUserName}
        </strong>
        ?
      </p>
    </FormModal>
  );
}
