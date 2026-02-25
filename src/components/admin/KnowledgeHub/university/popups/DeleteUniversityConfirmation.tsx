"use client";

import React, { useState, useEffect } from "react";
import { Trash2, XCircle } from 'lucide-react';
import ModalHeader from "components/ui/modal/ModalHeader";
import DeleteBtn from '../../../../ui/buttons/Button';
import Button from '../../../../ui/buttons/Button';

interface DeleteUniversityConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  universityName?: string;
}

export default function DeleteUniversityConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  universityName,
}: DeleteUniversityConfirmationProps) {
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
            title="Delete University"
            description="This action will permanently delete this university and all related data."
            icon={Trash2}
            iconBg="bg-red-50"
            iconColor="text-red-600"
            iconBorder="border-red-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="px-7 py-6 text-sm">
            <div className="space-y-5">

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Delete University
                  </h3>
                  <p className="text-sm text-slate-500">
                    Are you sure you want to delete this university?
                  </p>
                </div>
              </div>

              {universityName && (
                <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">
                    {universityName}
                  </p>
                </div>
              )}

            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">

            <Button
              onClick={onClose}
              disabled={isDeleting}
              icon={<XCircle  className="h-5 w-5" />}
              text={isDeleting ? "Cancelling..." : "Cancel"}
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

            <DeleteBtn
              icon={<Trash2 className="h-5 w-5" />}
              text={
                isDeleting ? "Deleting..." : "Delete University"
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
