"use client";

import React, { useState, useEffect } from "react";
import { XCircle, CalendarDays } from "lucide-react";

import { useBatchUpdatePrograms } from "features/programs/hooks";

import ModalHeader from "components/ub/feedback/dialogs/ModalHeader";
import Button from "components/ub/core/buttons/Button";
import IntakeMonthsField from "features/programs/components/shared/form/IntakeMonthsField";

import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";

interface BatchProgramIntakesProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProgramIds: string[];
  onSuccess?: () => void;
}

export interface ProgramPayload {
  program_ids: string[];
  intake_months?: number[];
}

export default function BatchProgramIntakes({
  isOpen,
  onClose,
  selectedProgramIds,
  onSuccess,
}: BatchProgramIntakesProps) {
  const { batchUpdatePrograms, loading } = useBatchUpdatePrograms();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    program_ids: [] as string[],
    intake_months: [] as number[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFormValid = formData.intake_months.length > 0;

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        program_ids: selectedProgramIds || [],
        intake_months: [],
      });

      setErrors({});
    }
  }, [isOpen, selectedProgramIds]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handlePrograms = async () => {
    try {
      const payload = {
        program_ids: selectedProgramIds,
        intake_months: formData.intake_months || undefined,
      };

      await batchUpdatePrograms(payload);

      showToast("Programs updated successfully.", "success");

      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1500);

    } catch (error: unknown) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Update failed. ${backendMessage}`, "error");
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 md:max-w-xl ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-ub-xl border border-ub-border-overlay bg-ub-modal shadow-ub-xl">
          <ModalHeader
            title="Bulk intake update"
            description="Update intake dates for multiple programs at once."
            icon={CalendarDays}
            iconBg="bg-ub-tone-brand-bg"
            iconColor="text-ub-text-link"
            iconBorder="border-ub-tone-brand-border"
            titleColor="text-ub-text-primary"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ub-text-secondary">
              Intake schedule
            </h3>

            <IntakeMonthsField
              field="intake_months"
              label="Intake months"
              required
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />

          </div>

          <div className="flex justify-end gap-3 border-t border-ub-border px-6 py-4">
            <Button
              onClick={onClose}
              icon={<XCircle className="h-5 w-5" />}
              text={"Cancel"}
              variant="secondary"
            />

            <Button
              onClick={handlePrograms}
              disabled={!isFormValid || loading}
              icon={<CalendarDays className="h-5 w-5" />}
              text={loading ? "Updating..." : "Update Intakes"}
              variant="primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
