"use client";

import React, { useState, useEffect } from "react";
import { XCircle, GraduationCap, CalendarPlus, Plus, Trash2 } from "lucide-react";

import { useBatchUpdatePrograms } from "features/programs/hooks";

import ModalHeader from "components/ub/feedback/dialogs/ModalHeader";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";
import InputField from "components/ub/forms/text/InputField";
import RichTextEditor from "components/ub/forms/text/RichTextEditor";

import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { fieldGroup } from "components/ub/recipes";

interface BatchProgramScholarshipsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProgramIds: string[];
  onSuccess?: () => void;
}

type Scholarship = {
  type: number;
  coverage_percent: number;
  max_amount: number;
  name: string;
  description: string;
  conditions: string[];
};

const defaultScholarship = (): Scholarship => ({
  type: 1,
  coverage_percent: 0,
  max_amount: 0,
  name: "",
  description: "",
  conditions: [],
});

export default function BatchProgramScholarships({
  isOpen,
  onClose,
  selectedProgramIds,
  onSuccess,
}: BatchProgramScholarshipsProps) {
  const { batchUpdatePrograms, loading } = useBatchUpdatePrograms();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<{
    program_ids: string[];
    scholarships: Scholarship[];
  }>({
    program_ids: [],
    scholarships: [defaultScholarship()],
  });

  const isFormValid =
    formData.scholarships.length > 0 &&
    formData.scholarships.every(
      (s) => s.name.trim().length >= 5 && s.description.trim().length >= 10
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
        program_ids: selectedProgramIds || [],
        scholarships: [defaultScholarship()],
      });
      setErrors({});
    }
  }, [isOpen, selectedProgramIds]);

  const validateField = (field: string, value: string) => {
    let error = "";
    if (field.endsWith(".name")) {
      if (!value.trim()) error = "Scholarship name is required";
      else if (value.trim().length < 3) error = "Name must be at least 3 characters";
      else if (value.trim().length > 255) error = "Name must not exceed 255 characters";
    } else if (field.endsWith(".description")) {
      if (!value.trim()) error = "Description is required";
      else if (value.trim().length < 10) error = "Description must be at least 10 characters";
    } else if (field.endsWith(".coverage_percent")) {
      const n = Number(value);
      if (value !== "" && (isNaN(n) || n < 0 || n > 100))
        error = "Coverage must be between 0 and 100";
    } else if (field.endsWith(".max_amount")) {
      const n = Number(value);
      if (value !== "" && (isNaN(n) || n < 0))
        error = "Max amount must be 0 or greater";
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = structuredClone(prev);
      const keys = field.replace(/\[(\d+)\]/g, ".$1").split(".");
      let current: any = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]] === undefined) {
          current[keys[i]] = isNaN(Number(keys[i + 1])) ? {} : [];
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addScholarship = () => {
    setFormData((prev) => ({
      ...prev,
      scholarships: [...prev.scholarships, defaultScholarship()],
    }));
  };

  const removeScholarship = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      scholarships: prev.scholarships.filter((_, i) => i !== index),
    }));
  };

  const handlePrograms = async () => {
    try {
      const payload = {
        program_ids: selectedProgramIds,
        scholarships: formData.scholarships
          .filter((s) => s.name && s.description)
          .map((s) => ({
            coverage_percent: Number(s.coverage_percent || 0),
            max_amount: Number(s.max_amount || 0),
            name: s.name,
            description: s.description,
            conditions: s.conditions,
          })),
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
            title="Bulk scholarship update"
            description="Update scholarship details for multiple programs at once."
            icon={GraduationCap}
            iconBg="bg-ub-tone-brand-bg"
            iconColor="text-ub-text-link"
            iconBorder="border-ub-tone-brand-border"
            titleColor="text-ub-text-primary"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ub-text-secondary">
                Scholarship
              </h3>

              <IconButton
                aria-label="Add scholarship"
                icon={<CalendarPlus className="h-4 w-4" />}
                variant="secondary"
                onClick={addScholarship}
              />

            </div>

            <div className="space-y-6">
              {formData.scholarships.map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-ub-border bg-ub-surface p-6 transition"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ub-tone-brand-bg text-sm font-semibold text-ub-text-link">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ub-text-primary">Scholarship</p>
                        <p className="text-xs text-ub-text-secondary">Configure scholarship details</p>
                      </div>
                    </div>

                    {formData.scholarships.length > 1 && (
                      <IconButton
                        aria-label={`Remove scholarship ${index + 1}`}
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => removeScholarship(index)}
                        bgColor="bg-ub-tone-danger-bg"
                        textColor="text-ub-tone-danger-text"
                        borderColor="border-ub-tone-danger-border"
                        hoverTextColor="hover:text-ub-tone-danger-text"
                        hoverBorderColor="hover:border-ub-tone-danger-border"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <InputField
                        label="Scholarship name"
                        field={`scholarships[${index}].name`}
                        placeholder="e.g. Excellence Award"
                        type="text"
                        formData={formData}
                        errors={errors}
                        updateFormData={updateFormData}
                        onBlur={() => validateField(`scholarships[${index}].name`, formData.scholarships[index].name)}
                      />
                    </div>

                    <InputField
                      label="Coverage percentage"
                      field={`scholarships[${index}].coverage_percent`}
                      type="number"
                      placeholder="e.g. 50"
                      formData={formData}
                      errors={errors}
                      updateFormData={updateFormData}
                      required={false}
                      onBlur={() => validateField(`scholarships[${index}].coverage_percent`, String(formData.scholarships[index].coverage_percent))}
                    />

                    <InputField
                      label="Maximum amount"
                      field={`scholarships[${index}].max_amount`}
                      type="number"
                      placeholder="e.g. 10000"
                      formData={formData}
                      errors={errors}
                      updateFormData={updateFormData}
                      required={false}
                      onBlur={() => validateField(`scholarships[${index}].max_amount`, String(formData.scholarships[index].max_amount))}
                    />

                    <div className="md:col-span-2">
                      <RichTextEditor
                        label="Description"
                        field={`scholarships[${index}].description`}
                        placeholder="Short description..."
                        formData={formData}
                        errors={errors}
                        updateFormData={updateFormData}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold tracking-wide text-ub-text-secondary">
                          Conditions
                        </h3>
                        <IconButton
                          aria-label="Add condition"
                          icon={<Plus className="h-4 w-4" />}
                          variant="secondary"
                          onClick={() => {
                            const updated = [...formData.scholarships[index].conditions, ""];
                            updateFormData(`scholarships[${index}].conditions`, updated);
                          }}
                        />
                      </div>

                      {formData.scholarships[index].conditions.length === 0 ? (
                        <p className="text-sm text-ub-text-tertiary">No conditions added yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {formData.scholarships[index].conditions.map((condition, cIndex) => (
                            <div
                              key={cIndex}
                              className={`${fieldGroup} flex min-h-[50px] items-center gap-2 ps-[17px] pe-2`}
                            >
                              <input
                                value={condition}
                                onChange={(e) =>
                                  updateFormData(
                                    `scholarships[${index}].conditions[${cIndex}]`,
                                    e.target.value,
                                  )
                                }
                                placeholder={`Condition ${cIndex + 1}`}
                                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--ub-field-placeholder)]"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = formData.scholarships[index].conditions.filter(
                                    (_, i) => i !== cIndex,
                                  );
                                  updateFormData(`scholarships[${index}].conditions`, updated);
                                }}
                                aria-label={`Remove condition ${cIndex + 1}`}
                                  className="text-ub-tone-danger-text transition hover:text-ub-tone-danger-text"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
              icon={<GraduationCap className="h-5 w-5" />}
              text={loading ? "Updating..." : "Update Scholarships"}
              variant="primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
