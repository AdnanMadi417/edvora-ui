"use client";

import React, { useState, useEffect } from "react";
import { XCircle, Percent } from "lucide-react";

import { MONTHS, CURRENCY } from "constants/lists";
import { DEFAULT_COMMISSION_CURRENCY, normalizeCommissionCurrency } from "features/programs/utils/commissionCurrency";

import { useBatchUpdatePrograms } from "features/programs/hooks";

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import InputField from "components/form/fields/InputField";
import SelectField from "components/form/fields/SelectField";

import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";

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
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Bulk Commission Update"
            description="Update commission values for multiple programs at once."
            icon={Percent}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-p2 font-medium text-slate-900">
                  Commission Amount <span className="text-red-600">*</span>
                </label>
                <div
                  className={`mt-2 flex h-12 w-full items-center overflow-hidden rounded-md border focus-within:ring-1 focus-within:ring-blue-500 ${
                    errors.commission_amount ? "border-red-500" : "border-slate-200"
                  }`}
                >
                  <span className="flex h-full items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-500">
                    {(CURRENCY.find((c) => c.value === formData.commission_currency)?.label ?? formData.commission_currency).toUpperCase()}
                  </span>
                  <input
                    type="number"
                    value={formData.commission_amount}
                    onChange={(e) => updateFormData("commission_amount", e.target.value)}
                    placeholder="e.g. 1000"
                    className="h-full flex-1 px-3 text-sm outline-none"
                  />
                </div>
                {errors.commission_amount && (
                  <p className="mt-1 text-xs text-red-600">{errors.commission_amount}</p>
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
                label="Expected From"
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
                label="Expected To"
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
              label="Commission Notes"
              field="commission_notes"
              placeholder="Optional notes..."
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              required={false}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <Button
              onClick={onClose}
              icon={<XCircle className="h-5 w-5" />}
              text="Cancel"
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || loading}
              icon={<Percent className="h-5 w-5" />}
              text={loading ? "Updating..." : "Update Commission"}
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-800"
              hoverBorderColor="hover:border-blue-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
