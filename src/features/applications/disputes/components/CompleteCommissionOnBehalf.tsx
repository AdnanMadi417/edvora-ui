"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { XCircle, CheckCircle } from "lucide-react";

import { useCompleteCommission } from "../hooks";
import { useToast } from "components/ub/feedback/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import TextareaField from "components/ub/forms/TextareaField";
import ModalHeader from "components/ub/feedback/ModalHeader";
import Button from "components/ub/core/Button";

interface CompleteCommissionOnBehalfProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  onSuccess?: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  application_not_found: "This application could not be found — it may have been removed.",
  application_inactive: "This application is no longer active.",
  invalid_status_for_confirm:
    "This application isn't at Commission Paid or Dispute Response Received — it may already be complete.",
  commission_not_paid: "This commission hasn't been marked as paid yet.",
};

export default function CompleteCommissionOnBehalf({
  isOpen,
  onClose,
  applicationId,
  onSuccess,
}: CompleteCommissionOnBehalfProps) {
  const { completeOnBehalf, loading } = useCompleteCommission();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({ reason: "" });
  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setFormData({ reason: "" });
      setFormErrors({});
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev: any) => ({ ...prev, [field]: undefined }));
  };

  if (!isVisible) return null;

  const handleSubmit = async () => {
    if (!formData.reason.trim()) {
      setFormErrors({ reason: "A reason is required" });
      return;
    }

    try {
      await completeOnBehalf(applicationId, { reason: formData.reason.trim() });
      showToast("Application marked complete.", "success");
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      const msg = (code && ERROR_MESSAGES[code]) || parseApiError(err, "Failed to complete commission.");
      showToast(msg, "error");
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Complete on Advisor's Behalf"
            description="Marks the application complete when the advisor hasn't confirmed receipt. The payout stays as recorded."
            icon={CheckCircle}
            iconBg="bg-green-50"
            iconColor="text-green-600"
            iconBorder="border-green-200"
            onClose={onClose}
          />

          <div className="space-y-5 px-6 py-5">
            <TextareaField
              label="Reason"
              field="reason"
              placeholder="e.g. Advisor confirmed receipt by email on 20 Oct..."
              formData={formData}
              errors={formErrors}
              updateFormData={updateFormData}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <Button
              onClick={onClose}
              disabled={loading}
              icon={<XCircle className="h-4 w-4" />}
              text="Cancel"
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />
            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.reason.trim()}
              icon={<CheckCircle className="h-4 w-4" />}
              text={loading ? "Completing..." : "Mark Complete"}
              bgColor="bg-green-50"
              textColor="text-green-700"
              borderColor="border-green-600"
              hoverTextColor="hover:text-green-700"
              hoverBorderColor="hover:border-green-700"
              className="hover:bg-green-100"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
