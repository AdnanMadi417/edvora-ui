"use client";

import React, { useState, useEffect } from "react";
import { XCircle, GraduationCap } from "lucide-react";

import { useBatchUpdatePrograms } from "features/programs/hooks";

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import SelectField from "components/form/fields/SelectField";
import { IELTS_BANDS } from 'constants/lists';

import { useToast } from "components/context/ToastContext";

interface BatchBranchProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProgramIds: string[];
  onSuccess?: () => void;
}

export interface ProgramScorePayload {
  program_ids: string[];
  english_required_score?: string;
}

export default function BatchPrograms({
  isOpen,
  onClose,
  selectedProgramIds,
  onSuccess,
}: BatchBranchProps) {
  const { batchUpdatePrograms, loading } = useBatchUpdatePrograms();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    program_ids: [] as string[],
    english_required_score: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFormValid =
    formData.english_required_score !== "";

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
        english_required_score: "",
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

  const handleUpdate = async () => {
    try {
      const payload = {
        program_ids: selectedProgramIds,
        english_required_score: formData.english_required_score || undefined,
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
          title="Bulk IELTS Update"
          description="Update IELTS requirements for multiple programs at once."
          icon={GraduationCap}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          iconBorder="border-blue-200"
          titleColor="text-gray-900"
          onClose={onClose}
        />

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">

             <SelectField
                label="IELTS Required Score"
                field="english_required_score"
                options={IELTS_BANDS.map((s) => ({
                  label: s.label,
                  value: s.score,
                }))}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

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
              onClick={handleUpdate}
              disabled={!isFormValid || loading}
              icon={<GraduationCap className="h-5 w-5" />}
              text={loading ? "Updating..." : "Update IELTS"}
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
