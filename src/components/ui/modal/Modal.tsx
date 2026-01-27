"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, CreditCard,RotateCcw } from 'lucide-react';
import InputField from "components/form/InputField";
import { useToast } from "components/context/ToastContext";
import api from "lib/useApi";
import CardHeader from '../card/CardHeader';
import ModalHeader from '../card/CardHeader';

interface HoldPopupProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  docId: string;
}

export default function HoldPopup({
                                    isOpen,
                                    onClose,
                                    applicationId,
                                    docId,
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
  };

  const handleConfirm = async () => {
    if (!formData.reason.trim()) {
      setErrors({ reason: "Reason is required" });
      return;
    }

    try {
      await api.patch(
        `/applications/${applicationId}/correction-request`,
        {
          reason_text: formData.reason,
          required_document_type_ids: [docId],
        }
      );

      showToast("Correction request sent successfully", "success");

      setTimeout(() => {
        setFormData({ reason: "" });
        setErrors({});
        onClose();
      }, 300);

      setTimeout(() => {
        window.location.reload();
      }, 2000);
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

          <ModalHeader
            title="Reset Password"
            description="This will log the user out"
            icon={RotateCcw}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            iconBorder="border-amber-200"
            titleColor="text-amber-900"
            descriptionColor="text-amber-700"
            // onClose={closeModal}
          />

      </div>
    </div>
  );
}
