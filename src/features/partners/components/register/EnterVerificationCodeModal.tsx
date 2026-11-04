"use client";

import React, { useEffect, useState } from "react";
import { KeyRound, XCircle } from "lucide-react";
import ModalHeader from "components/ub/feedback/dialogs/ModalHeader";
import Button from "components/ub/core/buttons/Button";
import InputField from "components/ub/forms/text/InputField";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (email: string) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EnterVerificationCodeModal({ isOpen, onClose, onContinue }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({ email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setFormData({ email: "" });
        setErrors({});
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleContinue = () => {
    const email = formData.email.trim();
    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setErrors({ email: "Enter a valid email address" });
      return;
    }
    onContinue(email);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 md:max-w-xl ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Enter Verification Code"
            description="Continue an application you already started"
            icon={KeyRound}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="flex flex-col gap-4 px-7 py-6">
            <p className="text-sm text-slate-500">
              Enter the email address you registered with, and we'll take you to where you
              can enter the verification code from your email.
            </p>

            <InputField
              label="Email"
              field="email"
              type="email"
              placeholder="you@example.com"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
            <Button
              onClick={onClose}
              icon={<XCircle className="h-5 w-5" />}
              text="Cancel"
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

            <Button
              icon={<KeyRound className="h-5 w-5" />}
              text="Continue"
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-800"
              hoverBorderColor="hover:border-blue-700"
              onClick={handleContinue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
