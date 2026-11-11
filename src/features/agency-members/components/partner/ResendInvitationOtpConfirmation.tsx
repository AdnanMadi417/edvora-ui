"use client";

import React, { useState, useEffect } from "react";
import { KeyRound, XCircle } from "lucide-react";
import ModalHeader from "components/ub/feedback/dialogs/ModalHeader";
import Button from "components/ub/core/buttons/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSending: boolean;
  invitationName: string;
  invitationEmail: string;
}

export default function ResendInvitationOtpConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isSending,
  invitationName,
  invitationEmail,
}: Props) {
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
        <div className="overflow-hidden rounded-ub-xl border border-ub-border-overlay bg-ub-modal shadow-ub-xl">
          <ModalHeader
            title="Resend Verification Code"
            description="Send a fresh 6-digit OTP to this invitee."
            icon={KeyRound}
            iconBg="bg-ub-tone-brand-bg"
            iconColor="text-ub-text-link"
            iconBorder="border-ub-tone-brand-border"
            titleColor="text-ub-text-primary"
            onClose={onClose}
          />

          <div className="space-y-4 px-7 py-6">
            <div>
              <h3 className="text-lg font-semibold text-ub-text-primary">Confirm Resend</h3>
              <p className="text-sm text-ub-text-secondary">
                Are you sure you want to resend the verification code to{" "}
                <strong>{invitationName}</strong>?
              </p>
            </div>
            <div className="rounded-md border border-ub-border bg-ub-surface-subtle px-4 py-3">
              <p className="text-sm font-medium text-ub-text-primary">{invitationEmail}</p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-ub-border px-6 py-4 sm:flex-row sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              onClick={onClose}
              disabled={isSending}
              icon={<XCircle className="h-5 w-5" />}
              text="Cancel"
              variant="secondary"
            />

            <Button
              className="w-full sm:w-auto"
              icon={<KeyRound className="h-5 w-5" />}
              text={isSending ? "Sending..." : "Resend Code"}
              variant="primary"
              onClick={onConfirm}
              disabled={isSending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
