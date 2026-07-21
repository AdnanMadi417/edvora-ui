"use client";

import React, { useState, useEffect } from "react";
import { XCircle, AlertCircle, RotateCcw, CheckCircle } from 'lucide-react';
import InputField from "components/form/fields/InputField";
import { useToast } from "components/context/ToastContext";
import api from "lib/useApi";

interface HoldPopupProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  docId: string;
  statusId: string;
  onRefetch?: () => void;
}

export default function HoldPopup({
  isOpen,
  onClose,
  applicationId,
  docId,
  statusId,
  onRefetch,
}: HoldPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({ reason: "" });
  const [errors, setErrors] = useState<{ reason?: string }>({});
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors.reason) setErrors({});
  };

  const validateReason = (): boolean => {
    const trimmed = formData.reason.trim();
    if (!trimmed) { setErrors({ reason: "Reason is required" }); return false; }
    if (trimmed.length < 10) { setErrors({ reason: "Reason must be at least 10 characters" }); return false; }
    setErrors({});
    return true;
  };

  const handleConfirm = async () => {
    if (!validateReason()) return;

    try {
      await api.patch(
        `/applications/${applicationId}/correction-request`,
        {
          reason_text: formData.reason,
          required_document_type_ids: [docId],
        }
      );

      showToast("Correction request sent successfully", "success");
      setFormData({ reason: "" });
      setErrors({});
      onClose();
      onRefetch?.();
    } catch (err: any) {
      if (err.response?.status === 422) {
        showToast("Validation error. Please check the input.", "error");
      } else {
        showToast("Failed to send correction request", "error");
      }

      setTimeout(() => {
        setFormData({ reason: "" });
        setErrors({});
        onClose();
      }, 2000);
    }
  };

  const handleClose = () => {
    setFormData({ reason: "" });
    setErrors({});
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm transition-all duration-300"
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Popup Card */}
        <div className="relative overflow-hidden rounded-2xl bg-card">
          <div className="relative border-b border-slate-200 px-6 pb-4 pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                  <RotateCcw
                    className="h-6 w-6 text-amber-600"
                    strokeWidth={2.5}
                  />
                </div>
                <div>
                  <h5 className="text-h4 font-bold text-gray-900">
                    Request Resubmission
                  </h5>
                  <p className="mt-0.5 text-caption text-slate-500">
                    Ask the applicant to correct or re-upload this document.
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                aria-label="Close dialog"
                className="group flex h-9 w-9 items-center justify-center rounded-md text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="space-y-5 px-6 py-4">
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
              <p className="text-p2 leading-relaxed text-slate-900">
                This action will request the applicant to re-upload or fix
                documents. Please include clear instructions or reasons to
                ensure proper resubmission.
              </p>
            </div>

            <InputField
              label="Reason or instructions"
              field="reason"
              placeholder="e.g., Please upload a clearer copy of your passport..."
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              onBlur={() => {
                const trimmed = formData.reason.trim();
                if (trimmed && trimmed.length < 10)
                  setErrors({ reason: "Reason must be at least 10 characters" });
              }}
            />
          </div>

          <div className="border-t border-slate-200 px-6 py-5">

            <div className="flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="flex items-center justify-center gap-2 rounded-md border border-gray-600 text-gray-600  px-4 py-2 text-sm font-medium transition hover:border-gray-700 hover:text-gray-700 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </button>

              <button
                onClick={handleConfirm}
                disabled={!formData.reason.trim()}
                className="flex items-center justify-center gap-2 rounded-md border border-amber-600 bg-amber-100 text-amber-700 px-4 py-2 text-sm font-medium transition hover:border-amber-700 hover:bg-amber-200 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                Confirm
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
