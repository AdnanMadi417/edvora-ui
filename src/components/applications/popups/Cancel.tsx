"use client";

import React, { useState, useEffect } from "react";
import { XCircle, AlertCircle, XOctagon } from "lucide-react";

interface InputFieldProps {
  label: string;
  placeholder: string;
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  variant?: string;
  extra?: string;
}

const InputField = ({
  label,
  placeholder,
  id,
  type,
  value,
  onChange,
}: InputFieldProps) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-p2 font-medium text-text-primary">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="focus:none w-full rounded-md border border-default px-4 py-3 text-p2 transition-all duration-200 placeholder:text-text-muted outline-none"
    />
  </div>
);

interface CancelPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  applicationId?: string;
}

export default function CancelPopup({
  isOpen,
  onClose,
  onConfirm,
}: CancelPopupProps) {
  const [reason, setReason] = useState("");
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

  const handleConfirm = () => {
    onConfirm(reason);
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 transition-all duration-300"
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
        <div className="relative overflow-hidden rounded-2xl bg-card">
          <div className="relative border-b border-default px-6 pb-4 pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
                  <XOctagon
                    className="h-6 w-6 text-red-600"
                    strokeWidth={2.5}
                  />
                </div>
                <div>
                  <h5 className="text-h4 font-bold text-gray-900">
                    Cancel Application
                  </h5>
                  <p className="mt-0.5 text-caption text-text-muted">
                    Permanently cancel this application
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                aria-label="Close dialog"
                className="group flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="space-y-5 px-6 py-4">
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-p2 leading-relaxed text-text-primary">
                This action will permanently cancel the application. Please
                provide a reason to help track this decision.
              </p>
            </div>

            <InputField
              variant="auth"
              extra="w-full"
              label="Reason for cancellation"
              placeholder="e.g., Applicant withdrew request..."
              id="reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="border-t border-default px-6 py-5">
            <div className="flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="rounded-full border border-default bg-card px-5 py-2.5 text-p2 font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={!reason.trim()}
                className="rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-5 py-2.5 text-p2 font-medium text-white shadow-lg shadow-red-500/25 transition-all duration-200 hover:from-red-600 hover:to-rose-600 hover:shadow-xl hover:shadow-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
