"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { XCircle, CheckCircle } from "lucide-react";

import { useResolveNoIssue } from "../hooks";
import { useToast } from "components/context/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import { TextareaField } from "components/form";
import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";

interface ResolveNoIssueProps {
  isOpen: boolean;
  onClose: () => void;
  disputeId: string;
  onSuccess?: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  dispute_not_found: "This dispute could not be found — it may have already been removed.",
  dispute_already_resolved: "This dispute has already been resolved.",
};

export default function ResolveNoIssue({ isOpen, onClose, disputeId, onSuccess }: ResolveNoIssueProps) {
  const { resolveNoIssue, loading } = useResolveNoIssue();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({ report: "" });
  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setFormData({ report: "" });
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
    if (!formData.report.trim()) {
      setFormErrors({ report: "A report is required" });
      return;
    }

    try {
      await resolveNoIssue(disputeId, { report: formData.report.trim() });
      showToast("Dispute resolved — no correction needed.", "success");
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      const msg = (code && ERROR_MESSAGES[code]) || parseApiError(err, "Failed to resolve dispute.");
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
            title="Resolve Dispute: No Issue"
            description="The payout and commission stay exactly as they are — explain why no correction is needed."
            icon={CheckCircle}
            iconBg="bg-green-50"
            iconColor="text-green-600"
            iconBorder="border-green-200"
            onClose={onClose}
          />

          <div className="space-y-5 px-6 py-5">
            <TextareaField
              label="Report"
              field="report"
              placeholder="Explain why this dispute doesn't require a correction..."
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
              disabled={loading || !formData.report.trim()}
              icon={<CheckCircle className="h-4 w-4" />}
              text={loading ? "Submitting..." : "Resolve"}
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
