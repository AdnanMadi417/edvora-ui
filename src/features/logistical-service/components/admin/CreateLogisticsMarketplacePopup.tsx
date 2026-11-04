"use client";

import React, { useState, useEffect } from "react";
import { Truck } from "lucide-react";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import InputField from "components/ub/forms/text/InputField";
import { useCreateLogisticService } from "features/logistical-service/hooks";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";

interface CreateLogisticsMarketplacePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateLogisticsMarketplacePopup({
  isOpen,
  onClose,
  onCreated,
}: CreateLogisticsMarketplacePopupProps) {
  const { showToast } = useToast();
  const { createLogisticService, loadingCreateLogisticService } =
    useCreateLogisticService();

  const [formData, setFormData] = useState({ name: "" });
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: "" });
      setErrors({});
    }
  }, [isOpen]);

  const validateName = (value: string): string => {
    if (!value.trim()) return "Service name is required";
    if (value.trim().length < 3) return "Name must be at least 3 characters";
    if (value.trim().length > 255) return "Name must not exceed 255 characters";
    return "";
  };

  const updateFormData = (_: string, value: string) => {
    setFormData({ name: value });
    if (errors.name) setErrors({});
  };

  const handleSubmit = async () => {
    const error = validateName(formData.name);
    if (error) {
      setErrors({ name: error });
      return;
    }

    try {
      await createLogisticService({ name: formData.name.trim() });
      showToast("Logistic service created successfully", "success");
      onCreated();
      onClose();
    } catch (error: any) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Failed to create service. ${backendMessage}`, "error");
    }
  };

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      size="md"
      icon={Truck}
      title="Create logistics service"
      description="Add a service that logistics providers can offer to students."
      onSubmit={async () => {
        await handleSubmit();
      }}
      submitLabel="Create logistics service"
      submitting={loadingCreateLogisticService}
      submitDisabled={formData.name.trim().length < 5}
    >
      <fieldset
        disabled={loadingCreateLogisticService}
        className="min-w-0 space-y-4"
      >
        <InputField
          label="Service Name"
          field="name"
          placeholder="e.g. Airport Transfer"
          required
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          onBlur={() => setErrors({ name: validateName(formData.name) })}
        />
      </fieldset>
    </FormModal>
  );
}
