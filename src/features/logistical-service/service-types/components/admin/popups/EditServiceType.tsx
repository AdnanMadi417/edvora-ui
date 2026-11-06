"use client";
import { useEditLogisticService } from "../../../hooks";
import type { LogisticService } from "../../../types";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import ServiceTypeForm from "../form/ServiceTypeForm";
export default function EditServiceType({
  service,
  onClose,
  onUpdated,
}: {
  service: LogisticService | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { editLogisticService, loadingEditLogisticService } =
    useEditLogisticService();
  const { showToast } = useToast();
  async function save(name: string) {
    if (!service) return;
    await editLogisticService(service.id, { name });
    showToast("Service type updated.", "success");
    onClose();
    onUpdated();
  }
  return (
    <ServiceTypeForm
      open={Boolean(service)}
      onClose={onClose}
      initialName={service?.name || ""}
      editing
      submitting={loadingEditLogisticService}
      onSave={save}
    />
  );
}
