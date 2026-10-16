"use client";

import React, { useState, useEffect } from "react";
import { XCircle, AlertCircle } from "lucide-react";

import { useRaiseDispute } from "features/applications/disputes";
import { useToast } from "components/context/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";

interface DisputeCommissionProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  onSuccess?: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  application_not_found: "This application could not be found — it may have been removed.",
  application_inactive: "This application is no longer active.",
  forbidden_application_access: "You don't have access to this application.",
  forbidden_agency_member: "Only an agency admin can raise a dispute.",
  application_not_ready: "This application has no stage/status yet.",
  invalid_status_for_dispute:
    "This application isn't at Commission Paid — it may already be disputed, or past this stage.",
};

export default function DisputeCommission({ isOpen, onClose, applicationId, onSuccess }: DisputeCommissionProps) {
  const { raiseDispute, loading } = useRaiseDispute();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [justification, setJustification] = useState("");
  const [justificationError, setJustificationError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setJustification("");
      setJustificationError("");
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const validateJustification = (value: string): string => {
    if (!value.trim()) return "Justification is required";
    return "";
  };

  const isFormValid = !validateJustification(justification);

  const handleSubmit = async () => {
    const err = validateJustification(justification);
    if (err) {
      setJustificationError(err);
      return;
    }

    try {
      await raiseDispute(applicationId, { justification: justification.trim() });
      showToast("Dispute raised.", "success");
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      const msg = (code && ERROR_MESSAGES[code]) || parseApiError(err, "Failed to raise dispute.");
      showToast(msg, "error");
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
        className={`w-full max-w-lg transform transition-all duration-300 ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Dispute Commission"
            description="Raise a dispute against this paid commission."
            icon={AlertCircle}
            iconBg="bg-red-50"
            iconColor="text-red-600"
            iconBorder="border-red-200"
            onClose={onClose}
          />

          <div className="space-y-1.5 px-6 py-5">
            <label className="block text-sm font-medium text-slate-900">
              Justification <span className="text-red-600">*</span>
            </label>
            <textarea
              value={justification}
              onChange={(e) => {
                setJustification(e.target.value);
                if (justificationError) setJustificationError("");
              }}
              onBlur={() => {
                const err = validateJustification(justification);
                if (err) setJustificationError(err);
              }}
              placeholder="Explain why you are disputing this commission..."
              rows={4}
              className={`w-full rounded-md border px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors resize-y placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                justificationError ? "border-red-500 bg-red-50" : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            />
            {justificationError && <p className="text-xs text-red-600">{justificationError}</p>}
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
              disabled={loading || !isFormValid}
              icon={<AlertCircle className="h-4 w-4" />}
              text={loading ? "Submitting..." : "Submit Dispute"}
              bgColor="bg-red-50"
              textColor="text-red-700"
              borderColor="border-red-600"
              hoverTextColor="hover:text-red-700"
              hoverBorderColor="hover:border-red-700"
              className="hover:bg-red-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
