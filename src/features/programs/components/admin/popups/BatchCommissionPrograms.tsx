"use client";

import React, { useState, useEffect } from "react";
import { XCircle, Percent } from "lucide-react";

import { MONTHS, CURRENCY } from "constants/lists";
import { DEFAULT_COMMISSION_CURRENCY, normalizeCommissionCurrency } from "features/programs/utils/commissionCurrency";

import { useBatchUpdatePrograms } from "features/programs/hooks";

import ModalHeader from "components/ub/feedback/dialogs/ModalHeader";
import Button from "components/ub/core/buttons/Button";
import InputField from "components/ub/forms/text/InputField";
import SelectField from "components/ub/forms/selection/SelectField";

import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { fieldControlError, fieldGroup } from "components/ub/recipes";

interface BatchCommissionProgramsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProgramIds: string[];
  onSuccess?: () => void;
}

export default function BatchCommissionPrograms({
  isOpen,
  onClose,
  selectedProgramIds,
  onSuccess,
}: BatchCommissionProgramsProps) {
  const { batchUpdatePrograms, loading } = useBatchUpdatePrograms();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    commission_amount: "",
    commission_currency: DEFAULT_COMMISSION_CURRENCY,
    commission_notes: "",
    expected_commission_from: "",
    expected_commission_to: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFormValid = React.useMemo(
    () =>
      formData.commission_amount !== "" &&
      Number(formData.commission_amount) > 0 &&
      Number(formData.commission_amount) <= 29999 &&
      formData.expected_commission_from !== "" &&
      formData.expected_commission_to !== "" &&
      !loading,
    [formData.commission_amount, formData.expected_commission_from, formData.expected_commission_to, loading]
  );

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
        commission_amount: "",
        commission_currency: DEFAULT_COMMISSION_CURRENCY,
        commission_notes: "",
        expected_commission_from: "",
        expected_commission_to: "",
      });
      setErrors({});
    }
  }, [isOpen, selectedProgramIds]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "commission_amount") {
      const num = Number(value);
      if (value !== "" && num > 29999) {
        setErrors((prev) => ({ ...prev, commission_amount: "Commission amount cannot exceed RM 29,999" }));
      } else {
        setErrors((prev) => ({ ...prev, commission_amount: "" }));
      }
    } else if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    try {
      await batchUpdatePrograms({
        program_ids: selectedProgramIds,
        commission_amount: formData.commission_amount !== "" ? Number(formData.commission_amount) : undefined,
        commission_currency: normalizeCommissionCurrency(formData.commission_currency),
        commission_notes: formData.commission_notes.trim() || undefined,
        expected_commission_from: formData.expected_commission_from !== "" ? Number(formData.expected_commission_from) : undefined,
        expected_commission_to: formData.expected_commission_to !== "" ? Number(formData.expected_commission_to) : undefined,
      });

      showToast("Commission updated successfully.", "success");
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
            title="Bulk commission update"
            description="Update commission values for multiple programs at once."
            icon={Percent}
            iconBg="bg-ub-tone-brand-bg"
            iconColor="text-ub-text-link"
            iconBorder="border-ub-tone-brand-border"
            titleColor="text-ub-text-primary"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-p2 font-medium text-ub-text-primary">
                  Commission amount <span className="text-ub-tone-danger-text">*</span>
                </label>
                <div
                  className={`mt-2 flex h-[50px] w-full items-center overflow-hidden ${fieldGroup} ${
                    errors.commission_amount ? fieldControlError : ""
                  }`}
                >
                  <span className="flex h-full items-center border-e border-[var(--ub-field-ring)] ps-[17px] pe-3 font-medium text-ub-text-secondary">
                    {(CURRENCY.find((c) => c.value === formData.commission_currency)?.label ?? formData.commission_currency).toUpperCase()}
                  </span>
                  <input
                    type="number"
                    value={formData.commission_amount}
                    onChange={(e) => updateFormData("commission_amount", e.target.value)}
                    placeholder="e.g. 1000"
                    aria-label="Commission amount"
                    className="h-full min-w-0 flex-1 bg-transparent ps-3 pe-[17px] outline-none placeholder:text-[var(--ub-field-placeholder)]"
                  />
                </div>
                {errors.commission_amount && (
                  <p className="mt-1 text-xs text-ub-tone-danger-text">{errors.commission_amount}</p>
                )}
              </div>

              <SelectField
                label="Currency"
                field="commission_currency"
                required={false}
                options={CURRENCY.map((c) => ({ value: c.value, label: c.label }))}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Expected from"
                field="expected_commission_from"
                required
                options={MONTHS.map((m) => ({
                  value: m.value,
                  label: m.label,
                }))}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <SelectField
                label="Expected to"
                field="expected_commission_to"
                required
                options={MONTHS.map((m) => ({
                  value: m.value,
                  label: m.label,
                }))}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
            </div>

            <InputField
              label="Commission notes"
              field="commission_notes"
              placeholder="Optional notes..."
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              required={false}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-ub-border px-6 py-4">
            <Button
              onClick={onClose}
              icon={<XCircle className="h-5 w-5" />}
              text="Cancel"
              variant="secondary"
            />

            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || loading}
              icon={<Percent className="h-5 w-5" />}
              text={loading ? "Updating..." : "Update Commission"}
              variant="primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
