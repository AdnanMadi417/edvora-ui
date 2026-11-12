"use client";

import React, { useState, useEffect } from "react";
import { Trash2, XCircle } from "lucide-react";
import ModalHeader from "components/ub/feedback/dialogs/ModalHeader";
import Button from "components/ub/core/buttons/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeletePartner({ isOpen, onClose, onConfirm, isDeleting }: Props) {
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
            title="Delete Advisor"
            description="This action will permanently delete this Advisor and all related data."
            icon={Trash2}
            iconBg="bg-ub-tone-danger-bg"
            iconColor="text-ub-tone-danger-text"
            iconBorder="border-ub-tone-danger-border"
            titleColor="text-ub-text-primary"
            onClose={onClose}
          />

          <div className="space-y-4 px-7 py-6">
            <div>
              <h3 className="text-lg font-semibold text-ub-text-primary">Confirm deletion</h3>
              <p className="text-sm text-ub-text-secondary">
                Are you sure you want to remove this advisor from the system?
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-ub-border px-6 py-4 sm:flex-row sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              onClick={onClose}
              disabled={isDeleting}
              icon={<XCircle className="h-5 w-5" />}
              text={isDeleting ? "Cancelling..." : "Cancel"}
              variant="secondary"
            />

            <Button
              className="w-full sm:w-auto"
              icon={<Trash2 className="h-5 w-5" />}
              text={isDeleting ? "Deleting..." : "Delete Advisor"}
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
