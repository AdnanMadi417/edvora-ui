"use client";
import { useCreateLogisticService } from "../../../hooks";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import ServiceTypeForm from "../form/ServiceTypeForm";
export default function CreateServiceType({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { createLogisticService, loadingCreateLogisticService } =
    useCreateLogisticService();
  const { showToast } = useToast();
  async function save(name: string) {
    await createLogisticService({ name });
    showToast("Service type created.", "success");
    onClose();
    onCreated();
  }
  return (
    <ServiceTypeForm
      open={isOpen}
      onClose={onClose}
      submitting={loadingCreateLogisticService}
      onSave={save}
    />
  );
}
