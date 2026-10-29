"use client";

import React, { useState, useEffect } from "react";
import { XCircle, AlertCircle, CheckCircle, Pause } from "lucide-react";

import api from "lib/useApi";
import { useToast } from "components/ub/feedback/ToastContext";
import SelectField from "components/ub/forms/SelectField";
import Button from "components/ub/core/Button";

interface HoldPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: string) => void;
  applicationId?: string;
  currentStatus?: string;
  onRefetch?: () => void;
}

const statusOptions = [
  { label: "Active", value: "1" },
  { label: "Hold", value: "2" },
  { label: "Cancel", value: "3" },
];

const statusMap: Record<string, string> = {
  "1": "active",
  "2": "hold",
  "3": "cancel",
};

export default function HoldPopup({
  isOpen,
  onClose,
  onConfirm,
  applicationId,
  currentStatus,
  onRefetch,
}: HoldPopupProps) {
  const [status, setStatus] = useState("1");
  const [isVisible, setIsVisible] = useState(false);
  const { showToast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStatus(currentStatus);
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentStatus]);

  useEffect(() => {
    if (isOpen) setIsVisible(true);
    else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const handleConfirm = async () => {
    if (!applicationId) return;

    try {
      setIsConfirming(true);
      await api.patch(`/applications/${applicationId}/lifecycle-status`, {
        status: statusMap[status],
      });

      showToast("Application status updated.");
      onConfirm(statusMap[status]);
      onClose();
      onRefetch?.();
    } catch (error: any) {
      console.error("Failed to update lifecycle status", error);
      showToast("Failed to update application status.");
    } finally {
      setIsConfirming(false);
    }
  };
  const handleClose = () => {
    onClose();
  };

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
        <div className="relative overflow-hidden rounded-2xl bg-white">
          <div className="relative border-b border-slate-200 px-6 pb-4 pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                  <Pause className="h-6 w-6 text-amber-600" strokeWidth={2.5} />
                </div>
                <div>
                  <h5 className="text-h4 font-bold text-gray-900">
                    Update Application Status
                  </h5>
                  <p className="mt-0.5 text-caption text-slate-500">
                    Select the desired lifecycle status.
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

          <div className="space-y-3 px-6 py-4">

            <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600 flex-shrink-0" />
              <p className="text-p2 leading-relaxed text-slate-900">
                This action will update the application's lifecycle status.
              </p>
            </div>


            <div className="flex items-center gap-2 text-sm font-medium uppercase p-3">
              {currentStatus === "1" && <CheckCircle className="h-4 w-4" />}
              {currentStatus === "2" && <Pause className="h-4 w-4" />}
              {currentStatus === "3" && <XCircle className="h-4 w-4" />}
              <span>Application status: {statusMap[currentStatus || "1"]}</span>
            </div>

            <SelectField
              label="Lifecycle Status"
              field="lifecycle_status"
              options={statusOptions}
              formData={{ lifecycle_status: status }}
              errors={{}}
              updateFormData={(field, value) => setStatus(value)}
            />
          </div>

          <div className="border-t border-slate-200 px-6 py-5">
            <div className="flex justify-end gap-3">
              <Button
                onClick={handleClose}
                icon={<XCircle className="h-4 w-4" />}
                text="Cancel"
                bgColor="bg-white"
                textColor="text-gray-600"
                borderColor="border-gray-600"
                hoverTextColor="hover:text-gray-700"
                hoverBorderColor="hover:border-gray-700"
              />
              <Button
                onClick={handleConfirm}
                disabled={isConfirming || status === currentStatus}
                icon={<CheckCircle className="h-4 w-4" />}
                text={isConfirming ? "Updating..." : "Confirm"}
                bgColor="bg-amber-100"
                textColor="text-amber-700"
                borderColor="border-amber-600"
                hoverTextColor="hover:text-amber-700"
                hoverBorderColor="hover:border-amber-700"
                className="hover:bg-amber-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
