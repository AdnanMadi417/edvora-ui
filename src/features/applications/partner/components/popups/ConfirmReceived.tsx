"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { XCircle, CheckCircle } from "lucide-react";

import { useConfirmReceived } from "features/applications/disputes";
import { useToast } from "components/ub/feedback/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import ModalHeader from "components/ub/feedback/ModalHeader";
import Button from "components/ub/core/Button";

interface ConfirmReceivedProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  onSuccess?: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  application_not_found: "This application could not be found — it may have been removed.",
  application_inactive: "This application is no longer active.",
  forbidden_application_access: "You don't have access to this application.",
  forbidden_agency_member: "Only an agency admin can confirm receipt.",
  application_not_ready: "This application has no stage/status yet.",
  invalid_status_for_confirm:
    "This application isn't at Commission Paid — it may already be confirmed, or past this stage.",
  commission_not_paid: "This commission hasn't been marked as paid yet.",
};

export default function ConfirmReceived({ isOpen, onClose, applicationId, onSuccess }: ConfirmReceivedProps) {
  const { confirmReceived, loading } = useConfirmReceived();
  const { showToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const handleConfirm = async () => {
    try {
      await confirmReceived(applicationId);
      showToast("Commission receipt confirmed.", "success");
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      const msg = (code && ERROR_MESSAGES[code]) || parseApiError(err, "Failed to confirm receipt.");
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
        className={`w-full max-w-md transform transition-all duration-300 ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Confirm Commission Received"
            description="This completes the application — make sure the payment has actually arrived first."
            icon={CheckCircle}
            iconBg="bg-green-50"
            iconColor="text-green-600"
            iconBorder="border-green-200"
            onClose={onClose}
          />

          <div className="px-6 py-5 text-sm text-slate-600">
            Confirming marks this application as complete. If something's wrong with the amount, raise a
            dispute instead.
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
              onClick={handleConfirm}
              disabled={loading}
              icon={<CheckCircle className="h-4 w-4" />}
              text={loading ? "Confirming..." : "Confirm Received"}
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
