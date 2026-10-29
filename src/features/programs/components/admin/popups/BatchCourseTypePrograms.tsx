"use client";

import React, { useState, useEffect } from "react";
import { XCircle, Layers, AlertTriangle } from "lucide-react";

import { useBatchUpdatePrograms } from "features/programs/hooks";
import { COURSE_TYPE_OPTIONS, isMasterOrPhd } from "features/programs/utils/courseType";

import ModalHeader from "components/ub/feedback/ModalHeader";
import Button from "components/ub/core/Button";
import SelectField from "components/ub/forms/SelectField";

import { useToast } from "components/ub/feedback/ToastContext";
import { parseApiError } from "utils/parseApiError";

interface SelectedProgramSummary {
  id: string;
  name: string;
  qualification_level?: string | null;
}

interface BatchCourseTypeProgramsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPrograms: SelectedProgramSummary[];
  onSuccess?: () => void;
}

/**
 * course_type is all-or-nothing across the batch — the backend rejects the
 * whole selection if even one program isn't master/phd. Rather than let
 * staff hit that 422 blind, check eligibility client-side up front (same
 * qualification_level already in the list response) and block submission
 * with a clear list of which programs need deselecting.
 */
export default function BatchCourseTypePrograms({
  isOpen,
  onClose,
  selectedPrograms,
  onSuccess,
}: BatchCourseTypeProgramsProps) {
  const { batchUpdatePrograms, loading } = useBatchUpdatePrograms();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [courseType, setCourseType] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCourseType("");
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const ineligible = selectedPrograms.filter((p) => !isMasterOrPhd(p.qualification_level));
  const isFormValid = courseType !== "" && !loading && ineligible.length === 0;

  const handleSubmit = async () => {
    try {
      await batchUpdatePrograms({
        program_ids: selectedPrograms.map((p) => p.id),
        course_type: courseType as "course_work" | "research" | "mixed_mode",
      });

      showToast("Course type updated successfully.", "success");
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

  const formData = { course_type: courseType };
  const errors = {};

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 md:max-w-xl ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Bulk Course Type Update"
            description={`Set the course type for ${selectedPrograms.length} selected program${selectedPrograms.length !== 1 ? "s" : ""}.`}
            icon={Layers}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="space-y-4 px-6 py-6">
            {ineligible.length > 0 && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Course type only applies to Master's/PhD programs.</p>
                  <p className="mt-1">Deselect these to continue: {ineligible.map((p) => p.name).join(", ")}</p>
                </div>
              </div>
            )}

            <SelectField
              label="Course Type"
              field="course_type"
              required
              options={COURSE_TYPE_OPTIONS}
              formData={formData}
              errors={errors}
              updateFormData={(_field: string, value: string) => setCourseType(value)}
              disabled={ineligible.length > 0}
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
              disabled={!isFormValid}
              icon={<Layers className="h-5 w-5" />}
              text={loading ? "Updating..." : "Update Course Type"}
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
