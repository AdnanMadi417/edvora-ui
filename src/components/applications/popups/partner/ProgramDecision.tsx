"use client";

import React from "react";
import { XCircle, RefreshCcw, CheckCircle } from "lucide-react";
import { useUniversities } from "hooks/useUniversities";
import SearchableDropdown from "components/form/search/SearchableDropdown";
import { useToast } from "components/context/ToastContext";
import { useChangeProgram } from "hooks/applications/stages/useChangeProgram";

interface ProgramDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string | number;
  universityId: string;
}

export default function ProgramDecisionModal({
                                               isOpen,
                                               onClose,
                                               applicationId,
                                               universityId,
                                             }: ProgramDecisionModalProps) {

  const { universities } = useUniversities();
  const { showToast } = useToast();

  const {
    formData,
    errors,
    loading,
    updateFormData,
    submit,
  } = useChangeProgram(applicationId);

  const selectedUniversity = universities?.find((u) => u.id === universityId);
  const programs = selectedUniversity?.programs || [];

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const success = await submit();

    if (success) {
      showToast("Program updated successfully", "success");
      onClose();

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      showToast("Update failed", "error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-visible rounded-2xl bg-card shadow-lg">
          <div className="flex items-start justify-between border-b border-default px-6 pb-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-blue-200 bg-blue-50">
                <RefreshCcw
                  className="h-6 w-6 text-blue-600"
                  strokeWidth={2.5}
                />
              </div>
              <div>
                <h5 className="text-h4 font-bold text-gray-900">
                  Select Program
                </h5>
                <p className="mt-0.5 text-caption text-slate-500">
                  Choose the new program and provide a reason.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className="group flex h-9 w-9 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <XCircle className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          <div className="min-h-[60vh] overflow-y-auto space-y-4 px-6 py-4 ">
            <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <RefreshCcw className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <p className="text-p2 leading-relaxed text-slate-900">
                The university has requested that this applicant’s program be
                updated. Please select the new program and provide a brief
                reason.
              </p>
            </div>

            {errors.api && <p className="text-sm text-red-600">{errors.api}</p>}

            <SearchableDropdown
              label="Program"
              field="program_id"
              options={programs.map((p) => ({
                value: p.id,
                label: p.name,
              }))}
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />

          </div>

          <div className="flex justify-end gap-3 border-t border-default px-6 py-5">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-md border border-gray-600 text-gray-600  px-4 py-2 text-sm font-medium transition hover:border-gray-700 hover:text-gray-700 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading || !formData.program_id}
              className="flex items-center justify-center gap-2 rounded-md border border-blue-600 bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium transition hover:border-blue-700 hover:bg-blue-200 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              {loading ? "Submitting..." : "Confirm"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
