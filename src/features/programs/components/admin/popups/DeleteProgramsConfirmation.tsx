"use client";

import React, { useState, useEffect } from "react";
import { Trash2, XCircle } from 'lucide-react';
import ModalHeader from "components/ub/feedback/dialogs/ModalHeader";
import DeleteBtn from 'components/ub/core/buttons/Button';

interface DeleteProgramsConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  programNames?: string[];
}

export default function DeleteProgramsConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  programNames = [],
}: DeleteProgramsConfirmationProps) {
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
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-ub-xl border border-ub-border-overlay bg-ub-modal shadow-ub-xl">
          <ModalHeader
            title="Delete program"
            description="This action will permanently delete this program and all related data."
            icon={Trash2}
            iconBg="bg-ub-tone-danger-bg"
            iconColor="text-ub-tone-danger-text"
            iconBorder="border-ub-tone-danger-border"
            titleColor="text-ub-text-primary"
            onClose={onClose}
          />

          <div className="px-7 py-6 text-sm">
            <div className="space-y-5">

              <div>
                <h3 className="text-lg font-semibold text-ub-text-primary">
                  Confirm deletion
                </h3>
                <p className="text-sm text-ub-text-secondary">
                  Are you sure you want to permanently delete the selected program(s) from the system?
                </p>
              </div>

              {programNames && programNames.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ub-text-tertiary">
                    {programNames.length} program{programNames.length !== 1 ? "s" : ""} selected
                  </p>
                  <ul className="max-h-40 overflow-y-auto flex flex-wrap gap-2 pr-1">
                    {programNames.map((name, index) => (
                      <li
                        key={index}
                        className="inline-flex max-w-xs items-center rounded-md border border-ub-border bg-ub-surface px-3 py-1.5 text-sm font-medium text-ub-text-secondary"
                      >
                        <span className="truncate">{name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-ub-border px-6 py-4">

            <DeleteBtn
              icon={<XCircle className="h-5 w-5" />}
              text={
                isDeleting ? "Cancelling..." : "Cancel Deletion"
              }
              variant="secondary"
              onClick={onClose}
              disabled={isDeleting}
            />

            <DeleteBtn
              icon={<Trash2 className="h-5 w-5" />}
              text={
                isDeleting ? "Deleting..." : "Delete Program"
              }
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
