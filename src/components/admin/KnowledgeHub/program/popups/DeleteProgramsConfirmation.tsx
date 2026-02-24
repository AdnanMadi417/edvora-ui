"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, XCircle } from 'lucide-react';
import ModalHeader from "components/ui/modal/ModalHeader";
import DeleteBtn from '../../../../ui/buttons/Button';

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

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Delete Programs
                  </h3>
                  <p className="text-sm text-slate-500">
                    Are you sure you want to delete the following programs?
                  </p>
                </div>
              </div>

              {programNames && programNames.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {programNames.map((name, index) => (
                    <li
                      key={index}
                      className="inline-flex max-w-md items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm"
                    >
                      <span className="truncate">{name}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
                NOTE : This action will permanently delete all related data and cannot be undone.
              </div>

            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">

            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex items-center justify-center gap-2 rounded-full border border-gray-600 px-4  py-2 text-sm font-medium text-gray-600 transition hover:border-gray-700 hover:text-gray-700 shadow-md  hover:scale-105 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </button>

            <DeleteBtn
              icon={<PlusCircle className="h-5 w-5" />}
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
