"use client";

import React, { useState, useEffect } from "react";
import { Trash2, XCircle } from 'lucide-react';
import ModalHeader from "components/ui/modal/ModalHeader";
import DeleteBtn from 'components/ui/buttons/Button';

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
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Delete Program"
            description="This action will permanently delete this program and all related data."
            icon={Trash2}
            iconBg="bg-red-50"
            iconColor="text-red-600"
            iconBorder="border-red-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="px-7 py-6 text-sm">
            <div className="space-y-5">

              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Confirm Deletion
                </h3>
                <p className="text-sm text-slate-500">
                  Are you sure you want to permanently delete the selected program(s) from the system?
                </p>
              </div>

              {programNames && programNames.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {programNames.map((name, index) => (
                    <li
                      key={index}
                      className="inline-flex max-w-md items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700"
                    >
                      <span className="truncate">{name}</span>
                    </li>
                  ))}
                </ul>
              )}

            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">

            <DeleteBtn
              icon={<XCircle className="h-5 w-5" />}
              text={
                isDeleting ? "Cancelling..." : "Cancel Deletion"
              }
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
              onClick={onClose}
              disabled={isDeleting}
            />

            <DeleteBtn
              icon={<Trash2 className="h-5 w-5" />}
              text={
                isDeleting ? "Deleting..." : "Delete Program"
              }
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
