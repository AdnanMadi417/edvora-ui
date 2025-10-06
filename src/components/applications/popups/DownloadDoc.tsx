"use client";

import React, { useState, useEffect } from "react";
import { XCircle, XOctagon } from "lucide-react";


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

        </div>
      </div>
    </div>
  );
}
