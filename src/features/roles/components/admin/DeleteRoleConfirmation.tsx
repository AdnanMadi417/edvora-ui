"use client";

import React, { useState, useEffect } from "react";
import { Trash2, XCircle } from "lucide-react";
import ModalHeader from "components/ub/feedback/ModalHeader";
import Button from "components/ub/core/Button";

interface DeleteRoleConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  roleName?: string;
}

export default function DeleteRoleConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  roleName,
}: DeleteRoleConfirmationProps) {
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
            title="Delete Role"
            description="This action will permanently delete this role and revoke all of its permissions."
            icon={Trash2}
            iconBg="bg-red-50"
            iconColor="text-red-600"
            iconBorder="border-red-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="px-7 py-6 space-y-2 text-sm">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Confirm Deletion</h3>
              <p className="text-sm text-slate-500">
                Are you sure you want to permanently delete this role?
              </p>
            </div>

            {roleName && (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-medium text-slate-800">{roleName}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <Button
              onClick={onClose}
              disabled={isDeleting}
              icon={<XCircle className="h-5 w-5" />}
              text={isDeleting ? "Cancelling..." : "Cancel"}
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

            <Button
              icon={<Trash2 className="h-5 w-5" />}
              text={isDeleting ? "Deleting..." : "Delete Role"}
              bgColor="bg-red-50"
              textColor="text-red-700"
              borderColor="border-red-600"
              hoverTextColor="hover:text-red-800"
              hoverBorderColor="hover:border-red-700"
              onClick={onConfirm}
              disabled={isDeleting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
