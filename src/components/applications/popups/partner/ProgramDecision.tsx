"use client";

import React, { useState } from "react";
import { XCircle, RefreshCcw, CheckCircle } from 'lucide-react';
import { useUniversities } from "hooks/useUniversities";
import api from "lib/useApi";
import { InputField, SelectField } from "components/form";
import { useToast } from "components/context/ToastContext";

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

  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    program_id: "",
    note: "",
  });

  const [errors, setErrors] = useState<any>({});

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectedUniversity = universities?.find((u) => u.id === universityId);
  const programs = selectedUniversity?.programs || [];

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setErrors({});

    const newErrors: any = {};
    if (!formData.program_id) newErrors.program_id = "Program is required";
    if (!formData.note.trim()) newErrors.note = "Reason is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await api.post(`/applications/${applicationId}/change-program`, {
        new_program_id: formData.program_id,
        notes: formData.note,
      });

      showToast("Program updated successfully", "success");
      onClose();

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setErrors({ api: "Failed to update program. Please try again." });
      showToast(err?.message || "Update failed", "error");
    } finally {
      setLoading(false);
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
        <div className="relative overflow-hidden rounded-2xl bg-card shadow-lg">
          <div className="flex items-start justify-between border-b border-default px-6 pb-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-blue-50">
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
              className="group flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <XCircle className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          <div className="space-y-4 px-6 py-4">
            <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <RefreshCcw className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <p className="text-p2 leading-relaxed text-slate-900">
                The university has requested that this applicant’s program be
                updated. Please select the new program and provide a brief
                reason. This helps ensure accurate documentation and smooth
                processing.
              </p>
            </div>

            {errors.api && <p className="text-sm text-red-600">{errors.api}</p>}

            <SelectField
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

            <InputField
              label="Reason"
              field="note"
              placeholder="Example: Program is more suitable"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-default px-6 py-5">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-full border border-gray-600 text-gray-600  px-4 py-2 text-sm font-medium transition hover:border-gray-700 hover:text-gray-700 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading || !formData.note.trim() || !formData.program_id}
              className="flex items-center justify-center gap-2 rounded-full border border-blue-600 bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium transition hover:border-blue-700 hover:bg-blue-200 disabled:opacity-50"
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
