"use client";

import React, { useState, useEffect } from "react";
import { XCircle, GraduationCap, CalendarPlus, Plus, Trash2 } from "lucide-react";

import { useBatchUpdatePrograms } from "features/programs/hooks";

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import IconButton from "components/ui/buttons/IconButton";
import InputField from "components/form/InputField";

import { useToast } from "components/context/ToastContext";

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
        has_scholarship: false,
        scholarships: [defaultScholarship()],
      });
      setErrors({});
    }
  }, [isOpen, selectedProgramIds]);

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
            type: Number(s.type ?? 1),
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
    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message || "Please try again.";
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
            title="Bulk Scholarship Update"
            description="Update scholarship details for multiple programs at once."
            icon={GraduationCap}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Scholarship
              </h3>

              <IconButton
                icon={<CalendarPlus className="h-4 w-4" />}
                bgColor="bg-blue-50"
                textColor="text-blue-700"
                borderColor="border-blue-600"
                hoverTextColor="hover:text-blue-800"
                hoverBorderColor="hover:border-blue-700"
                onClick={addScholarship}
              />

            </div>

            <div className="space-y-6">
              {formData.scholarships.map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-white p-6 transition"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-sm font-semibold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Scholarship</p>
                        <p className="text-xs text-slate-500">Configure scholarship details</p>
                      </div>
                    </div>

                    {formData.scholarships.length > 1 && (
                      <IconButton
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => removeScholarship(index)}
                        bgColor="bg-red-50"
                        textColor="text-red-600"
                        borderColor="border-red-200"
                        hoverTextColor="hover:text-red-700"
                        hoverBorderColor="hover:border-red-300"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <InputField
                        label="Scholarship Name"
                        field={`scholarships[${index}].name`}
                        placeholder="e.g. Excellence Award"
                        type="text"
                        formData={formData}
                        errors={errors}
                        updateFormData={updateFormData}
                      />
                    </div>

                    <InputField
                      label="Coverage Percentage"
                      field={`scholarships[${index}].coverage_percent`}
                      type="number"
                      placeholder="e.g. 50"
                      formData={formData}
                      errors={errors}
                      updateFormData={updateFormData}
                      required={false}
                    />

                    <InputField
                      label="Maximum Amount"
                      field={`scholarships[${index}].max_amount`}
                      type="number"
                      placeholder="e.g. 10000"
                      formData={formData}
                      errors={errors}
                      updateFormData={updateFormData}
                      required={false}
                    />

                    <div className="md:col-span-2">
                      <InputField
                        label="Description"
                        field={`scholarships[${index}].description`}
                        placeholder="Short description..."
                        type="text"
                        formData={formData}
                        errors={errors}
                        updateFormData={updateFormData}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold tracking-wide text-slate-500">
                          Conditions
                        </h3>
                        <IconButton
                          icon={<Plus className="h-4 w-4" />}
                          bgColor="bg-blue-50"
                          textColor="text-blue-700"
                          borderColor="border-blue-600"
                          hoverTextColor="hover:text-blue-800"
                          hoverBorderColor="hover:border-blue-700"
                          onClick={() => {
                            const updated = [...formData.scholarships[index].conditions, ""];
                            updateFormData(`scholarships[${index}].conditions`, updated);
                          }}
                        />
                      </div>

                      {formData.scholarships[index].conditions.length === 0 ? (
                        <p className="text-sm text-slate-400">No conditions added yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {formData.scholarships[index].conditions.map((condition, cIndex) => (
                            <div
                              key={cIndex}
                              className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
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
                                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = formData.scholarships[index].conditions.filter(
                                    (_, i) => i !== cIndex,
                                  );
                                  updateFormData(`scholarships[${index}].conditions`, updated);
                                }}
                                className="text-red-400 transition hover:text-red-600"
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

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <Button
              onClick={onClose}
              icon={<XCircle className="h-5 w-5" />}
              text={"Cancel"}
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

            <Button
              onClick={handlePrograms}
              disabled={!isFormValid || loading}
              icon={<GraduationCap className="h-5 w-5" />}
              text={loading ? "Updating..." : "Update Scholarships"}
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
