"use client";

import React, { useState, useEffect } from "react";
import { KeyRound, XCircle } from "lucide-react";
import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  email: string;
  resendsLeft: number;
}

export default function ResendRegistrationOtpConfirmation({ isOpen, onClose, onConfirm, isSubmitting, email, resendsLeft }: Props) {
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
            title="Resend Verification Code"
            description="Send a new OTP to this registrant's email."
            icon={KeyRound}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="space-y-4 px-7 py-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Confirm Resend</h3>
              <p className="text-sm text-slate-500">
                Resend the verification code to <strong>{email}</strong>? This will use{" "}
                {resendsLeft === 1 ? "their last resend attempt" : `1 of their ${resendsLeft} remaining resend attempts`}.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-200 px-6 py-4 sm:flex-row sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              onClick={onClose}
              disabled={isSubmitting}
              icon={<XCircle className="h-5 w-5" />}
              text="Cancel"
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

            <Button
              className="w-full sm:w-auto"
              icon={<KeyRound className="h-5 w-5" />}
              text={isSubmitting ? "Sending..." : "Resend Code"}
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-800"
              hoverBorderColor="hover:border-blue-700"
              onClick={onConfirm}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
