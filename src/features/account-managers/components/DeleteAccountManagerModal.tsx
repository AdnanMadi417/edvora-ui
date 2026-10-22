"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, ArrowRightLeft, Trash2, XCircle } from "lucide-react";
import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";

interface DeleteAccountManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  AccountManager?: string;
  /**
   * When > 0, deletion is blocked: the manager still has this many assigned
   * partners (the backend refuses with 409 until they are transferred).
   */
  blockedPartnersCount?: number | null;
  /** Opens the transfer flow from the blocked state. */
  onTransferPartners?: () => void;
}

export default function DeleteAccountManagerModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  AccountManager,
  blockedPartnersCount = null,
  onTransferPartners,
}: DeleteAccountManagerModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const isBlocked = typeof blockedPartnersCount === "number" && blockedPartnersCount > 0;

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
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Delete Account Manager"
            description="This action will permanently delete this Account Manager and all related data."
            icon={Trash2}
            iconBg="bg-red-50"
            iconColor="text-red-600"
            iconBorder="border-red-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="space-y-4 px-7 py-6">
            {isBlocked ? (
              <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="space-y-3">
                  <p className="text-sm text-amber-900">
                    This account manager still has {blockedPartnersCount} assigned{" "}
                    {blockedPartnersCount === 1 ? "advisor" : "advisors"}. Transfer them before deleting.
                  </p>
                  {onTransferPartners && (
                    <Button
                      onClick={onTransferPartners}
                      icon={<ArrowRightLeft className="h-4 w-4" />}
                      text="Transfer advisors"
                      bgColor="bg-white"
                      textColor="text-amber-800"
                      borderColor="border-amber-400"
                      hoverTextColor="hover:text-amber-900"
                      hoverBorderColor="hover:border-amber-500"
                      className="hover:bg-amber-100"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Confirm Deletion
                </h3>
                <p className="text-sm text-slate-500">
                  Are you sure you want to remove this account manager from the system?
                </p>
              </div>
            )}

            {AccountManager && (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-medium text-slate-800">
                  {AccountManager}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <Button
              onClick={onClose}
              disabled={isDeleting}
              icon={<XCircle className="h-5 w-5" />}
              text="Cancel"
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

            <Button
              icon={<Trash2 className="h-5 w-5" />}
              text={isDeleting ? "Deleting..." : "Delete Manager"}
              bgColor="bg-red-50"
              textColor="text-red-700"
              borderColor="border-red-600"
              hoverTextColor="hover:text-red-800"
              hoverBorderColor="hover:border-red-700"
              onClick={onConfirm}
              disabled={isDeleting || isBlocked}
              title={isBlocked ? "Transfer this manager's advisors first" : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
